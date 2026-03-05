import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';

suite('SkillsTreeProvider', () => {
  let extensionContext: vscode.ExtensionContext;

  suiteSetup(async () => {
    const ext = vscode.extensions.getExtension('aliabbaschadhar.ai-agent-skills');
    if (ext && !ext.isActive) {
      await ext.activate();
    }
    extensionContext = {
      extensionPath: ext?.extensionPath || path.resolve(__dirname, '../../'),
      subscriptions: [],
    } as unknown as vscode.ExtensionContext;
  });

  test('CategoryItem has contextValue of "category"', async () => {
    const { CategoryItem } = await import('../../src/skillsTreeProvider');
    const item = new CategoryItem('test-cat', 5);
    assert.strictEqual(item.contextValue, 'category');
    assert.strictEqual(item.skillCount, 5);
  });

  test('CategoryItem description shows skill count', async () => {
    const { CategoryItem } = await import('../../src/skillsTreeProvider');
    const item = new CategoryItem('ai-ml', 42);
    assert.ok(String(item.description).includes('42'));
  });

  test('SkillItem has contextValue of "skill"', async () => {
    const { SkillItem } = await import('../../src/skillsTreeProvider');
    const item = new SkillItem({
      id: 'test-skill',
      path: 'skills/test-skill',
      category: 'test',
      name: 'test-skill',
      description: 'A test skill',
      risk: 'safe',
      source: 'community',
    });
    assert.strictEqual(item.contextValue, 'skill');
  });

  test('SkillItem command triggers aiSkills.preview', async () => {
    const { SkillItem } = await import('../../src/skillsTreeProvider');
    const item = new SkillItem({
      id: 'my-skill',
      path: 'skills/my-skill',
      category: 'cat',
      name: 'my-skill',
      description: 'description',
      risk: 'unknown',
      source: 'personal',
    });
    assert.strictEqual(item.command?.command, 'aiSkills.preview');
    assert.deepStrictEqual(item.command?.arguments, ['my-skill']);
  });

  test('SkillsTreeProvider.getChildren() returns CategoryItems at root', async () => {
    const { SkillsManager } = await import('../../src/skillsManager');
    const { SkillsTreeProvider, CategoryItem } = await import('../../src/skillsTreeProvider');

    const manager = new SkillsManager(extensionContext);
    await manager.init();

    const provider = new SkillsTreeProvider(manager);
    const rootChildren = provider.getChildren();

    assert.ok(rootChildren.length > 0, 'Root should have category children');
    assert.ok(
      rootChildren.every(c => c instanceof CategoryItem),
      'All root children should be CategoryItems'
    );
  });

  test('SkillsTreeProvider.getChildren(category) returns SkillItems', async () => {
    const { SkillsManager } = await import('../../src/skillsManager');
    const { SkillsTreeProvider, CategoryItem, SkillItem } = await import('../../src/skillsTreeProvider');

    const manager = new SkillsManager(extensionContext);
    await manager.init();

    const provider = new SkillsTreeProvider(manager);
    const rootChildren = provider.getChildren();

    assert.ok(rootChildren.length > 0, 'Root should have category children');
    assert.ok(
      rootChildren.every(c => c instanceof CategoryItem),
      'All root children should be CategoryItems'
    );

    // Pass the first category node to getChildren to get skills
    const firstCat = rootChildren[0];
    const skills = provider.getChildren(firstCat);
    assert.ok(skills.length > 0, 'Category should have skill children');
    assert.ok(
      skills.every(s => s instanceof SkillItem),
      'All category children should be SkillItems'
    );
  });
});
