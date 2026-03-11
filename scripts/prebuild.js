// scripts/prebuild.js
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Extension is at Work/agent-superpowers/; skills repo is expected at Work/antigravity-awesome-skills/.
// Support CI override via env var (set by sync-assets.yml), or fall back to the sibling clone.
const AI_SKILLS_ROOT =
  process.env.AI_SKILLS_ROOT || path.resolve(__dirname, '..', '..', 'antigravity-awesome-skills');

const SKILLS_INDEX = path.join(AI_SKILLS_ROOT, 'skills_index.json');
const ASSETS_DIR = path.join(__dirname, '..', 'assets');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

/**
 * Recursively copy everything under srcDir into destDir.
 * Preserves the full subdirectory structure (scripts/, examples/, resources/, etc.).
 */
function copyDirRecursive(srcDir, destDir) {
  ensureDir(destDir);
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcEntry = path.join(srcDir, entry.name);
    const destEntry = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcEntry, destEntry);
    } else {
      copyFile(srcEntry, destEntry);
    }
  }
}

function run() {
  if (!fs.existsSync(SKILLS_INDEX)) {
    console.error(`[prebuild] ERROR: skills_index.json not found at ${SKILLS_INDEX}`);
    console.error(
      '[prebuild] Set AI_SKILLS_ROOT env var or ensure the ai-skills repo is at the expected location.'
    );
    process.exit(1);
  }

  console.log('[prebuild] Copying skills_index.json...');
  ensureDir(ASSETS_DIR);
  copyFile(SKILLS_INDEX, path.join(ASSETS_DIR, 'skills_index.json'));

  const index = JSON.parse(fs.readFileSync(SKILLS_INDEX, 'utf-8'));
  let copied = 0;
  let missing = 0;

  console.log(`[prebuild] Copying ${index.length} skill directories...`);

  for (const skill of index) {
    // skill.path is relative to AI_SKILLS_ROOT, e.g. "skills/3d-web-experience"
    const srcSkillDir = path.join(AI_SKILLS_ROOT, skill.path);
    const destSkillDir = path.join(ASSETS_DIR, skill.path);
    const srcSkillFile = path.join(srcSkillDir, 'SKILL.md');

    if (fs.existsSync(srcSkillFile)) {
      // Copy the entire skill directory (SKILL.md + any companion files/scripts/resources)
      copyDirRecursive(srcSkillDir, destSkillDir);
      copied++;
    } else {
      console.warn(`[prebuild] WARN: Missing SKILL.md for skill '${skill.id}' at ${srcSkillFile}`);
      missing++;
    }
  }

  console.log(`[prebuild] Done. Copied: ${copied}, Missing: ${missing}`);

  const manifest = {
    generatedAt: new Date().toISOString(),
    totalSkills: index.length,
    copiedSkills: copied,
  };
  fs.writeFileSync(path.join(ASSETS_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log('[prebuild] manifest.json written.');

  // Always re-categorize after copying the index, since the upstream
  // ai-skills repo ships most skills as "uncategorized".
  console.log('[prebuild] Running skill categorization...');
  execSync(`node ${path.join(__dirname, 'categorize-skills.js')}`, { stdio: 'inherit' });

  // Re-read the (potentially re-categorized) index for the catalog
  const catalogIndex = JSON.parse(
    fs.readFileSync(path.join(ASSETS_DIR, 'skills_index.json'), 'utf-8')
  );

  console.log('[prebuild] Generating skills-catalog.md...');
  const catalogContent = generateSkillsCatalog(catalogIndex);
  fs.writeFileSync(path.join(ASSETS_DIR, 'skills-catalog.md'), catalogContent);
  console.log('[prebuild] skills-catalog.md written.');
}

/**
 * Generates a human- and AI-readable Markdown catalog from a skills index array.
 * Groups entries under ## <category> headings for easy scanning by Copilot Chat.
 *
 * @param {Array<{id: string, name: string, category: string, description: string, risk: string}>} skillsIndex
 * @returns {string} Markdown content
 */
function generateSkillsCatalog(skillsIndex) {
  // Group by category
  const byCategory = {};
  for (const skill of skillsIndex) {
    const cat = skill.category || 'uncategorized';
    if (!byCategory[cat]) {
      byCategory[cat] = [];
    }
    byCategory[cat].push(skill);
  }

  const sortedCategories = Object.keys(byCategory).sort();
  const lines = [
    '# AI Agent Skills — Full Catalog',
    '',
    `> Auto-generated from the skills index. Total: **${skillsIndex.length} skills** across **${sortedCategories.length} categories**.`,
    '> When asked "what skill should I use?", browse this file and suggest the most relevant skill IDs.',
    '> Install a skill: `Ctrl+Shift+/` → search for the skill ID → press Enter.',
    '',
  ];

  for (const category of sortedCategories) {
    lines.push(`## ${category}`);
    lines.push('');
    for (const skill of byCategory[category]) {
      const riskNote = skill.risk && skill.risk !== 'none' ? ` _(risk: ${skill.risk})_` : '';
      lines.push(`- **${skill.id}**: ${skill.description}${riskNote}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

run();
