import * as assert from 'assert';

suite('EditorDetector', () => {
  test('detectEditor() returns a valid EditorKind', async () => {
    const { detectEditor } = await import('../../src/editorDetector');
    const kind = detectEditor();
    const validKinds = ['cursor', 'vscode', 'codium', 'other'];
    assert.ok(validKinds.includes(kind), `'${kind}' is not a valid EditorKind`);
  });

  test('recommendedAgent() returns a valid agent name', async () => {
    const { recommendedAgent } = await import('../../src/editorDetector');
    const agent = recommendedAgent();
    const validAgents = ['claude', 'cursor', 'copilot', 'generic'];
    assert.ok(validAgents.includes(agent), `'${agent}' is not a valid agent name`);
  });
});
