import * as assert from 'assert';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

suite('CursorInstaller', () => {
  let tmpDir: string;

  setup(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cursor-test-'));
  });

  teardown(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('targetPath (project scope) returns path inside workspaceRoot', async () => {
    const { CursorInstaller } = await import('../../src/installers/cursorInstaller');
    const installer = new CursorInstaller(false);
    const p = installer.targetPath({
      skillId: 'my-skill',
      skillContent: '',
      workspaceRoot: tmpDir,
    });
    assert.ok(p.startsWith(tmpDir));
    assert.ok(p.endsWith('.mdc'));
    assert.ok(p.includes('.cursor'));
    assert.ok(p.includes('my-skill'));
  });

  test('targetPath (global scope) returns path in ~/.cursor', async () => {
    const { CursorInstaller } = await import('../../src/installers/cursorInstaller');
    const installer = new CursorInstaller(true);
    const p = installer.targetPath({
      skillId: 'global-skill',
      skillContent: '',
    });
    assert.ok(p.startsWith(os.homedir()));
    assert.ok(p.includes('.cursor'));
    assert.ok(p.endsWith('global-skill.mdc'));
  });

  test('targetPath throws when no workspace in project scope', async () => {
    const { CursorInstaller } = await import('../../src/installers/cursorInstaller');
    const installer = new CursorInstaller(false);
    assert.throws(() => {
      installer.targetPath({ skillId: 'x', skillContent: '' });
    });
  });

  test('install() writes .mdc file', async () => {
    const { CursorInstaller } = await import('../../src/installers/cursorInstaller');

    class TestCursorInstaller extends CursorInstaller {
      targetPath(opts: { skillId: string; skillContent: string; workspaceRoot?: string }) {
        return path.join(tmpDir, '.cursor', 'rules', `${opts.skillId}.mdc`);
      }
    }

    const installer = new TestCursorInstaller();
    const result = await installer.install({
      skillId: 'cursor-skill',
      skillContent: '# Cursor Skill',
      workspaceRoot: tmpDir,
    });

    assert.strictEqual(result.success, true, result.message);
    assert.ok(result.destPath.endsWith('.mdc'));
    const content = fs.readFileSync(result.destPath, 'utf-8');
    assert.strictEqual(content, '# Cursor Skill');
  });
});
