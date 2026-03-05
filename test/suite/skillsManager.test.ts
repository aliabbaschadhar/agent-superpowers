import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

suite('SkillsManager', () => {
  let extensionContext: vscode.ExtensionContext;

  suiteSetup(async () => {
    // Get the actual extension - it must be loaded in the host
    const ext = vscode.extensions.getExtension('aliabbaschadhar.ai-agent-skills');
    if (ext && !ext.isActive) {
      await ext.activate();
    }
    // Build a minimal mock context pointing to the extension path
    extensionContext = {
      extensionPath: ext?.extensionPath || path.resolve(__dirname, '../../'),
      subscriptions: [],
    } as unknown as vscode.ExtensionContext;
  });

  test('init() returns true when assets are present', async () => {
    // Import dynamically to use the live extensionPath
    const { SkillsManager } = await import('../../src/skillsManager');
    const manager = new SkillsManager(extensionContext);
    const result = await manager.init();
    assert.strictEqual(result, true, 'init() should return true when assets/manifest.json exists');
  });

  test('getAll() returns > 900 skills after init', async () => {
    const { SkillsManager } = await import('../../src/skillsManager');
    const manager = new SkillsManager(extensionContext);
    await manager.init();
    const skills = manager.getAll();
    assert.ok(skills.length > 900, `Expected >900 skills, got ${skills.length}`);
  });

  test('getCategories() returns expected category names', async () => {
    const { SkillsManager } = await import('../../src/skillsManager');
    const manager = new SkillsManager(extensionContext);
    await manager.init();
    const cats = manager.getCategories();
    assert.ok(cats.includes('uncategorized'), 'Should include uncategorized');
  });

  test('getCategories() puts uncategorized last', async () => {
    const { SkillsManager } = await import('../../src/skillsManager');
    const manager = new SkillsManager(extensionContext);
    await manager.init();
    const cats = manager.getCategories();
    assert.strictEqual(cats[cats.length - 1], 'uncategorized');
  });

  test('findById() returns the correct entry', async () => {
    const { SkillsManager } = await import('../../src/skillsManager');
    const manager = new SkillsManager(extensionContext);
    await manager.init();
    const skill = manager.findById('3d-web-experience');
    assert.ok(skill, 'Should find 3d-web-experience skill');
    assert.strictEqual(skill?.id, '3d-web-experience');
  });

  test('findById() returns undefined for unknown id', async () => {
    const { SkillsManager } = await import('../../src/skillsManager');
    const manager = new SkillsManager(extensionContext);
    await manager.init();
    const skill = manager.findById('__nonexistent_skill__');
    assert.strictEqual(skill, undefined);
  });

  test('readContent() returns non-null string for a valid skill', async () => {
    const { SkillsManager } = await import('../../src/skillsManager');
    const manager = new SkillsManager(extensionContext);
    await manager.init();
    const skill = manager.findById('3d-web-experience');
    assert.ok(skill);
    const content = manager.readContent(skill!);
    assert.ok(content !== null, 'readContent should return non-null');
    assert.ok(content!.length > 0, 'SKILL.md content should not be empty');
  });

  test('getByCategory() returns only skills from that category', async () => {
    const { SkillsManager } = await import('../../src/skillsManager');
    const manager = new SkillsManager(extensionContext);
    await manager.init();
    const cats = manager.getCategories();
    if (cats.length > 1) {
      const firstCat = cats[0];
      const skills = manager.getByCategory(firstCat);
      assert.ok(skills.every(s => s.category === firstCat));
    }
  });
});
