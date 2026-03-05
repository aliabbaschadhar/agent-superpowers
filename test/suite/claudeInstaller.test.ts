import * as assert from 'assert';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

suite('ClaudeInstaller', () => {
  let tmpDir: string;

  setup(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-skills-test-'));
  });

  teardown(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('install() writes SKILL.md to correct path', async () => {
    const { ClaudeInstaller } = await import('../../src/installers/claudeInstaller');
    const installer = new ClaudeInstaller();
    const opts = {
      skillId: 'test-skill',
      skillContent: '# Test Skill\n\nContent here.',
      workspaceRoot: tmpDir,
    };

    // Override config by mocking — for unit test we directly call targetPath
    const expectedBase = path.join(os.homedir(), '.claude', 'skills');
    const expectedPath = path.join(expectedBase, 'test-skill', 'SKILL.md');
    const actual = installer.targetPath(opts);
    assert.strictEqual(actual, expectedPath);
  });

  test('install() creates parent directories and file', async () => {
    const { ClaudeInstaller } = await import('../../src/installers/claudeInstaller');

    // Create a subclassed installer pointing to tmp dir to avoid home dir pollution
    class TestClaudeInstaller extends ClaudeInstaller {
      targetPath(opts: { skillId: string; skillContent: string; workspaceRoot?: string }) {
        return path.join(tmpDir, 'claude-skills', opts.skillId, 'SKILL.md');
      }
    }

    const installer = new TestClaudeInstaller();
    const result = await installer.install({
      skillId: 'my-test-skill',
      skillContent: '# My Test Skill',
      workspaceRoot: tmpDir,
    });

    assert.strictEqual(result.success, true, result.message);
    const writtenContent = fs.readFileSync(result.destPath, 'utf-8');
    assert.strictEqual(writtenContent, '# My Test Skill');
  });
});
