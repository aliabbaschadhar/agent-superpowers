#!/usr/bin/env bun
/**
 * scripts/validate-skills.js
 *
 * Quality gate that validates all bundled skills before publish.
 * Run: `bun run scripts/validate-skills.js`
 *
 * Checks:
 * - Every skill folder has a SKILL.md
 * - No duplicate skill IDs
 * - skills_index.json entries have required fields
 * - Risk level is one of: safe | unknown | none
 * - SKILL.md is not empty and has a top-level heading
 * - No orphan index entries (id in index but no folder)
 * - No orphan folders (folder exists but not in index)
 */

import * as fs from 'fs';
import * as path from 'path';

const ASSETS = path.resolve(import.meta.dir, '..', 'assets');
const INDEX_PATH = path.join(ASSETS, 'skills_index.json');
const SKILLS_DIR = path.join(ASSETS, 'skills');
const VALID_RISKS = new Set(['safe', 'unknown', 'none']);
const REQUIRED_FIELDS = ['id', 'path', 'category', 'name', 'description', 'risk', 'source'];

let errors = 0;
let warnings = 0;

function error(msg) {
  errors++;
  console.error(`  ❌ ERROR: ${msg}`);
}

function warn(msg) {
  warnings++;
  console.warn(`  ⚠️  WARN:  ${msg}`);
}

function info(msg) {
  console.log(`  ℹ️  ${msg}`);
}

// ── 1. Check index file exists ──────────────────────────────────────────────

console.log('\n🔍 Validating skills…\n');

if (!fs.existsSync(INDEX_PATH)) {
  error(`skills_index.json not found at ${INDEX_PATH}. Run 'bun run prebuild' first.`);
  process.exit(1);
}

let index;
try {
  index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
} catch (e) {
  error(`skills_index.json is not valid JSON: ${e.message}`);
  process.exit(1);
}

if (!Array.isArray(index)) {
  error('skills_index.json root must be an array.');
  process.exit(1);
}

info(`Index contains ${index.length} entries.`);

// ── 2. Check for duplicates ─────────────────────────────────────────────────

const idCounts = new Map();
for (const entry of index) {
  const count = idCounts.get(entry.id) ?? 0;
  idCounts.set(entry.id, count + 1);
}

for (const [id, count] of idCounts) {
  if (count > 1) {
    error(`Duplicate skill ID: "${id}" appears ${count} times.`);
  }
}

// ── 3. Validate each index entry ────────────────────────────────────────────

for (const entry of index) {
  for (const field of REQUIRED_FIELDS) {
    if (!entry[field] && entry[field] !== '') {
      error(`Skill "${entry.id ?? '(unknown)'}": missing required field "${field}".`);
    }
  }

  if (entry.risk && !VALID_RISKS.has(entry.risk)) {
    error(
      `Skill "${entry.id}": invalid risk level "${entry.risk}". Must be: safe, unknown, or none.`
    );
  }

  if (entry.id && !/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(entry.id) && entry.id.length > 1) {
    warn(`Skill "${entry.id}": ID is not kebab-case.`);
  }

  if (entry.description && entry.description.length < 10) {
    warn(`Skill "${entry.id}": description is very short (${entry.description.length} chars).`);
  }
}

// ── 4. Cross-check folders vs index ─────────────────────────────────────────

const indexIds = new Set(index.map((e) => e.id));

if (fs.existsSync(SKILLS_DIR)) {
  const folders = fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  info(`Skills directory contains ${folders.length} folders.`);

  // Check each folder
  for (const folder of folders) {
    const skillMd = path.join(SKILLS_DIR, folder, 'SKILL.md');

    if (!fs.existsSync(skillMd)) {
      error(`Folder "${folder}": missing SKILL.md file.`);
      continue;
    }

    const content = fs.readFileSync(skillMd, 'utf-8').trim();
    if (content.length === 0) {
      error(`Folder "${folder}": SKILL.md is empty.`);
    } else if (!content.startsWith('#')) {
      warn(`Folder "${folder}": SKILL.md does not start with a heading (#).`);
    }

    if (!indexIds.has(folder)) {
      warn(`Folder "${folder}": exists on disk but not in skills_index.json (orphan folder).`);
    }
  }

  // Orphan index entries
  const folderSet = new Set(folders);
  for (const entry of index) {
    if (entry.source === 'bundle') {
      // Extract folder name from path: "skills/my-skill" → "my-skill"
      const folderName = entry.path?.split('/').pop();
      if (folderName && !folderSet.has(folderName)) {
        warn(
          `Index entry "${entry.id}": path "${entry.path}" has no matching folder in assets/skills/.`
        );
      }
    }
  }
} else {
  warn(`Skills directory not found at ${SKILLS_DIR}.`);
}

// ── 5. Summary ──────────────────────────────────────────────────────────────

console.log('\n' + '─'.repeat(50));
if (errors > 0) {
  console.log(`\n❌ Validation FAILED: ${errors} error(s), ${warnings} warning(s).\n`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`\n⚠️  Validation passed with ${warnings} warning(s).\n`);
  process.exit(0);
} else {
  console.log(`\n✅ All ${index.length} skills validated successfully.\n`);
  process.exit(0);
}
