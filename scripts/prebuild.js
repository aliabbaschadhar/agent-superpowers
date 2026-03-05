// scripts/prebuild.js
'use strict';

const fs = require('fs');
const path = require('path');

// Extension is at Work/agent-superpowers/; skills repo is at Work/ai-skills/.
// Support CI override via env var, fall back to the sibling ai-skills directory.
const AI_SKILLS_ROOT =
  process.env.AI_SKILLS_ROOT ||
  path.resolve(__dirname, '..', '..', 'ai-skills');

const SKILLS_INDEX = path.join(AI_SKILLS_ROOT, 'skills_index.json');
const ASSETS_DIR = path.join(__dirname, '..', 'assets');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function run() {
  if (!fs.existsSync(SKILLS_INDEX)) {
    console.error(`[prebuild] ERROR: skills_index.json not found at ${SKILLS_INDEX}`);
    console.error('[prebuild] Set AI_SKILLS_ROOT env var or ensure the ai-skills repo is at the expected location.');
    process.exit(1);
  }

  console.log('[prebuild] Copying skills_index.json...');
  ensureDir(ASSETS_DIR);
  copyFile(SKILLS_INDEX, path.join(ASSETS_DIR, 'skills_index.json'));

  const index = JSON.parse(fs.readFileSync(SKILLS_INDEX, 'utf-8'));
  let copied = 0;
  let missing = 0;

  console.log(`[prebuild] Copying ${index.length} SKILL.md files...`);

  for (const skill of index) {
    // skill.path is relative to AI_SKILLS_ROOT, e.g. "skills/3d-web-experience"
    const srcSkillFile = path.join(AI_SKILLS_ROOT, skill.path, 'SKILL.md');
    const destSkillFile = path.join(ASSETS_DIR, skill.path, 'SKILL.md');

    if (fs.existsSync(srcSkillFile)) {
      copyFile(srcSkillFile, destSkillFile);
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
  fs.writeFileSync(
    path.join(ASSETS_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log('[prebuild] manifest.json written.');
}

run();
