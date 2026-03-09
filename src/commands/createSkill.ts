import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { SkillsManager } from '../skills/SkillsManager';
import { log } from '../logger';

const SKILL_TEMPLATE = `---
name: {{NAME}}
category: {{CATEGORY}}
risk: {{RISK}}
---

# {{NAME}}

> {{DESCRIPTION}}

---

## Identity

You are an expert in {{DOMAIN}}. You help developers by providing precise, actionable guidance.

---

## Rules

1. Always explain your reasoning before giving code.
2. Prefer idiomatic patterns for the target language/framework.
3. Keep generated code concise and production-ready.
4. Flag security concerns proactively.

---

## Examples

### Good
\`\`\`
// TODO: Add an example of ideal usage
\`\`\`

### Bad
\`\`\`
// TODO: Add an anti-pattern example
\`\`\`
`;

export function registerCreateSkillCommand(
  manager: SkillsManager
): vscode.Disposable {
  return vscode.commands.registerCommand(
    'aiSkills.createSkill',
    async () => {
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!workspaceRoot) {
        vscode.window.showErrorMessage(
          'AI Skills: Open a workspace folder first to create a skill.'
        );
        return;
      }

      // Step 1: Skill ID
      const skillId = await vscode.window.showInputBox({
        prompt: 'Skill ID (kebab-case, e.g. "react-hooks-patterns")',
        placeHolder: 'my-custom-skill',
        validateInput: (value) => {
          if (!value) { return 'Skill ID is required.'; }
          if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(value) && value.length > 1) {
            return 'Use kebab-case: lowercase letters, numbers, and hyphens only.';
          }
          if (value.length < 2) {
            return 'Skill ID must be at least 2 characters.';
          }
          return undefined;
        },
      });
      if (!skillId) { return; }

      // Check for conflicts
      const existing = manager.findById(skillId);
      if (existing) {
        const overwrite = await vscode.window.showWarningMessage(
          `A skill with ID "${skillId}" already exists in the index. Create anyway?`,
          'Create',
          'Cancel'
        );
        if (overwrite !== 'Create') { return; }
      }

      // Step 2: Name
      const name = await vscode.window.showInputBox({
        prompt: 'Human-readable skill name',
        placeHolder: 'React Hooks Patterns',
        value: skillId
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
      });
      if (!name) { return; }

      // Step 3: Description
      const description = await vscode.window.showInputBox({
        prompt: 'Short description (one sentence)',
        placeHolder: 'Expert guidance on React custom hooks and state patterns.',
      });
      if (!description) { return; }

      // Step 4: Category
      const categories = manager.getCategories();
      const categoryItems: vscode.QuickPickItem[] = [
        { label: '$(add) Create new category', description: 'Type a new category name' },
        ...categories.map(c => ({ label: c })),
      ];
      const pickedCat = await vscode.window.showQuickPick(categoryItems, {
        placeHolder: 'Select a category',
      });
      if (!pickedCat) { return; }

      let category: string;
      if (pickedCat.label.includes('Create new category')) {
        const newCat = await vscode.window.showInputBox({
          prompt: 'New category name (lowercase, e.g. "frontend")',
          placeHolder: 'frontend',
        });
        if (!newCat) { return; }
        category = newCat.toLowerCase().trim();
      } else {
        category = pickedCat.label;
      }

      // Step 5: Domain (for template)
      const domain = await vscode.window.showInputBox({
        prompt: 'Primary domain / technology (used in the template)',
        placeHolder: 'React, TypeScript, Node.js…',
        value: name,
      });

      // Step 6: Risk level
      const risk = await vscode.window.showQuickPick(
        [
          { label: 'safe', description: 'No system access required' },
          { label: 'unknown', description: 'May require agent judgment' },
        ],
        { placeHolder: 'Risk level' }
      );
      if (!risk) { return; }

      // Generate the file with category and risk written into frontmatter
      const content = SKILL_TEMPLATE
        .replace(/{{NAME}}/g, name)
        .replace('{{CATEGORY}}', category)
        .replace('{{RISK}}', risk.label)
        .replace('{{DESCRIPTION}}', description)
        .replace('{{DOMAIN}}', domain ?? name);

      const skillDir = path.join(workspaceRoot, '.agent', 'skills', skillId);
      const skillFile = path.join(skillDir, 'SKILL.md');

      try {
        fs.mkdirSync(skillDir, { recursive: true });
        fs.writeFileSync(skillFile, content, 'utf-8');

        log(`Created new skill: ${skillId} at ${skillFile}`);

        // Open the file for editing
        await vscode.window.showTextDocument(
          vscode.Uri.file(skillFile),
          { viewColumn: vscode.ViewColumn.Active }
        );

        vscode.window.showInformationMessage(
          `AI Skills: Created "${skillId}" at .agent/skills/${skillId}/SKILL.md. ` +
          'Edit the template, then it will be active for your AI agent.'
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`AI Skills: Failed to create skill — ${msg}`);
      }
    }
  );
}

