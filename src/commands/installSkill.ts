import * as vscode from 'vscode';
import { SkillsManager } from '../skillsManager';
import { recommendedAgent } from '../editorDetector';
import { ClaudeInstaller } from '../installers/claudeInstaller';
import { CursorInstaller } from '../installers/cursorInstaller';
import { CopilotInstaller } from '../installers/copilotInstaller';
import { GenericInstaller } from '../installers/genericInstaller';
import { InstallOptions } from '../installers/types';

interface AgentOption extends vscode.QuickPickItem {
  id: string;
}

export function registerInstallCommand(
  manager: SkillsManager
): vscode.Disposable {
  return vscode.commands.registerCommand(
    'aiSkills.install',
    async (skillId?: string) => {
      let resolvedId = skillId;

      if (!resolvedId) {
        const skills = manager.getAll();
        const picked = await vscode.window.showQuickPick(
          skills.map(s => ({ label: s.id, description: s.description })),
          { placeHolder: 'Select skill to install…', matchOnDetail: true }
        );
        if (!picked) {
          return;
        }
        resolvedId = picked.label;
      }

      const skill = manager.findById(resolvedId);
      if (!skill) {
        vscode.window.showErrorMessage(
          `AI Skills: Skill '${resolvedId}' not found in index.`
        );
        return;
      }

      const content = manager.readContent(skill);
      if (!content) {
        vscode.window.showErrorMessage(
          `AI Skills: Content for skill '${resolvedId}' is missing from bundle.`
        );
        return;
      }

      const recommended = recommendedAgent();
      const agentOptions: AgentOption[] = [
        {
          label: '$(terminal) Claude Code',
          description: '~/.claude/skills/{id}/SKILL.md',
          detail: recommended === 'claude' ? '★ Recommended for your editor' : undefined,
          id: 'claude',
        },
        {
          label: '$(tools) Cursor (Project)',
          description: '.cursor/rules/{id}.mdc',
          detail: recommended === 'cursor' ? '★ Recommended for your editor' : undefined,
          id: 'cursor-project',
        },
        {
          label: '$(tools) Cursor (Global)',
          description: '~/.cursor/rules/{id}.mdc',
          id: 'cursor-global',
        },
        {
          label: '$(github) GitHub Copilot',
          description: '.github/copilot-instructions.md (append)',
          detail: recommended === 'copilot' ? '★ Recommended for your editor' : undefined,
          id: 'copilot',
        },
        {
          label: '$(folder-opened) Custom Path',
          description: 'You choose the directory',
          id: 'generic',
        },
      ];

      const agentChoice = await vscode.window.showQuickPick(agentOptions, {
        placeHolder: `Install '${resolvedId}' to which agent?`,
      }) as AgentOption | undefined;

      if (!agentChoice) {
        return;
      }

      const workspaceRoot =
        vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      const opts: InstallOptions = {
        skillId: resolvedId,
        skillContent: content,
        workspaceRoot,
      };

      let result;
      switch (agentChoice.id) {
        case 'claude':
          result = await new ClaudeInstaller().install(opts);
          break;
        case 'cursor-project':
          result = await new CursorInstaller(false).install(opts);
          break;
        case 'cursor-global':
          result = await new CursorInstaller(true).install(opts);
          break;
        case 'copilot':
          result = await new CopilotInstaller().install(opts);
          break;
        case 'generic':
          result = await new GenericInstaller().install(opts);
          break;
        default:
          return;
      }

      if (result.success) {
        const action = await vscode.window.showInformationMessage(
          result.message,
          'Open File'
        );
        if (action === 'Open File' && result.destPath) {
          try {
            await vscode.window.showTextDocument(
              vscode.Uri.file(result.destPath)
            );
          } catch {
            // File may not be readable in all editors
          }
        }
      } else {
        vscode.window.showErrorMessage(`AI Skills: ${result.message}`);
      }
    }
  );
}

/** Also register the tree-context install command (same handler, different command id). */
export function registerInstallFromTreeCommand(
  manager: SkillsManager
): vscode.Disposable {
  return vscode.commands.registerCommand(
    'aiSkills.installFromTree',
    async (item?: any) => {
      // item is a SkillItem from the tree context
      let skillId: string | undefined;
      if (item && typeof item === 'object' && 'skill' in item) {
        skillId = item.skill.id;
      } else if (typeof item === 'string') {
        skillId = item;
      }
      await vscode.commands.executeCommand('aiSkills.install', skillId);
    }
  );
}
