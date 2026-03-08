import * as vscode from 'vscode';
import { SkillsManager } from '../skills/SkillsManager';
import { UserCollections } from '../skills/UserCollections';
import { SkillsTreeProvider } from '../tree/SkillsTreeProvider';

const COLLECTION_ICONS = [
  { label: '$(list-unordered)  list-unordered', value: 'list-unordered' },
  { label: '$(star)  star', value: 'star' },
  { label: '$(rocket)  rocket', value: 'rocket' },
  { label: '$(layers)  layers', value: 'layers' },
  { label: '$(package)  package', value: 'package' },
  { label: '$(tools)  tools', value: 'tools' },
  { label: '$(beaker)  beaker', value: 'beaker' },
  { label: '$(flame)  flame', value: 'flame' },
  { label: '$(shield)  shield', value: 'shield' },
  { label: '$(hubot)  hubot', value: 'hubot' },
];

/** Async multi-select QuickPick for picking skill IDs. Pre-selects `preSelected`. */
async function pickSkills(
  manager: SkillsManager,
  preSelected: string[] = []
): Promise<string[] | undefined> {
  const all = manager.getAll();
  const selected = new Set(preSelected);

  const items: (vscode.QuickPickItem & { skillId: string })[] = all.map(s => ({
    label: `$(symbol-event) /${s.id}`,
    description: s.category,
    detail: s.description,
    skillId: s.id,
    picked: selected.has(s.id),
  }));

  const result = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select skills for this collection…',
    canPickMany: true,
    matchOnDetail: true,
  });

  if (!result) { return undefined; }
  return result.map(i => i.skillId);
}

export function registerCreateCollectionCommand(
  manager: SkillsManager,
  userCollections: UserCollections,
  treeProvider: SkillsTreeProvider
): vscode.Disposable {
  return vscode.commands.registerCommand('aiSkills.createCollection', async () => {
    const name = await vscode.window.showInputBox({
      prompt: 'Collection name',
      placeHolder: 'e.g. My Frontend Stack',
      validateInput: v => (v.trim().length < 2 ? 'Name must be at least 2 characters.' : null),
    });
    if (!name) { return; }

    const iconPick = await vscode.window.showQuickPick(COLLECTION_ICONS, {
      placeHolder: 'Choose an icon (optional)',
    });
    const icon = iconPick?.value ?? 'list-unordered';

    const skillIds = await pickSkills(manager);
    if (!skillIds) { return; }

    const collection = userCollections.create(name.trim(), skillIds, icon);
    treeProvider.refresh();
    vscode.window.showInformationMessage(
      `AI Skills: Collection "${collection.name}" created with ${collection.skillIds.length} skill(s).`
    );
  });
}

export function registerEditCollectionCommand(
  manager: SkillsManager,
  userCollections: UserCollections,
  treeProvider: SkillsTreeProvider
): vscode.Disposable {
  return vscode.commands.registerCommand(
    'aiSkills.editCollection',
    async (item?: { collectionId: string; collectionName: string }) => {
      let collectionId: string | undefined = item?.collectionId;

      // Allow palette invocation: pick from existing collections
      if (!collectionId) {
        const all = userCollections.getAll();
        if (all.length === 0) {
          vscode.window.showInformationMessage('AI Skills: No custom collections to edit.');
          return;
        }
        const pick = await vscode.window.showQuickPick(
          all.map(c => ({ label: c.name, description: `${c.skillIds.length} skills`, id: c.id })),
          { placeHolder: 'Select collection to edit…' }
        );
        if (!pick) { return; }
        collectionId = pick.id;
      }

      const existing = userCollections.get(collectionId);
      if (!existing) {
        vscode.window.showErrorMessage('AI Skills: Collection not found.');
        return;
      }

      const name = await vscode.window.showInputBox({
        prompt: 'Collection name',
        value: existing.name,
        validateInput: v => (v.trim().length < 2 ? 'Name must be at least 2 characters.' : null),
      });
      if (!name) { return; }

      const iconPick = await vscode.window.showQuickPick(
        COLLECTION_ICONS.map(o => ({ ...o, picked: o.value === existing.icon })),
        { placeHolder: 'Choose an icon' }
      );
      const icon = iconPick?.value ?? existing.icon;

      const skillIds = await pickSkills(manager, existing.skillIds);
      if (!skillIds) { return; }

      userCollections.update(collectionId, { name: name.trim(), icon, skillIds });
      treeProvider.refresh();
      vscode.window.showInformationMessage(`AI Skills: Collection "${name.trim()}" updated.`);
    }
  );
}
