import * as assert from 'assert';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

suite('CopilotInstaller', () => {
  let tmpDir: string;

  setup(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'copilot-test-'));
  });

  teardown(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('returns failure when no workspaceRoot provided', async () => {
    const { CopilotInstaller } = await import('../../src/installers/copilotInstaller');
    const installer = new CopilotInstaller();
    const result = await installer.install({
      skillId: 'my-skill',
      skillContent: '# Content',
    });
    assert.strictEqual(result.success, false);
    assert.ok(result.message.includes('workspace'));
  });

  test('creates copilot-instructions.md when it does not exist', async () => {
    const { CopilotInstaller } = await import('../../src/installers/copilotInstaller');
    const installer = new CopilotInstaller();
    const result = await installer.install({
      skillId: 'new-skill',
      skillContent: '# New Skill',
      workspaceRoot: tmpDir,
    });

    assert.strictEqual(result.success, true, result.message);
    const dest = path.join(tmpDir, '.github', 'copilot-instructions.md');
    assert.ok(fs.existsSync(dest));
    const content = fs.readFileSync(dest, 'utf-8');
    assert.ok(content.includes('# GitHub Copilot Instructions'));
    assert.ok(content.includes('# New Skill'));
    assert.ok(content.includes('<!-- AI Agent Skill: new-skill -->'));
  });

  test('appends to existing copilot-instructions.md', async () => {
    const { CopilotInstaller } = await import('../../src/installers/copilotInstaller');
    const githubDir = path.join(tmpDir, '.github');
    fs.mkdirSync(githubDir);
    const dest = path.join(githubDir, 'copilot-instructions.md');
    fs.writeFileSync(dest, '# Existing Content\n');

    const installer = new CopilotInstaller();
    const result = await installer.install({
      skillId: 'appended-skill',
      skillContent: '# Appended Skill',
      workspaceRoot: tmpDir,
    });

    assert.strictEqual(result.success, true, result.message);
    const content = fs.readFileSync(dest, 'utf-8');
    assert.ok(content.includes('# Existing Content'));
    assert.ok(content.includes('# Appended Skill'));
  });

  test('is idempotent - does not double-append the same skill', async () => {
    const { CopilotInstaller } = await import('../../src/installers/copilotInstaller');
    const installer = new CopilotInstaller();

    // Install twice
    await installer.install({
      skillId: 'idempotent-skill',
      skillContent: '# Idempotent Skill',
      workspaceRoot: tmpDir,
    });
    await installer.install({
      skillId: 'idempotent-skill',
      skillContent: '# Idempotent Skill',
      workspaceRoot: tmpDir,
    });

    const dest = path.join(tmpDir, '.github', 'copilot-instructions.md');
    const content = fs.readFileSync(dest, 'utf-8');
    const occurrences = (content.match(/<!-- AI Agent Skill: idempotent-skill -->/g) || []).length;
    assert.strictEqual(occurrences, 1, 'Skill marker should appear exactly once');
  });
});
