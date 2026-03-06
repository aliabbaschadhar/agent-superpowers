# AI Agent Skills

> Browse, preview, and install 940+ AI agent skills for Claude Code, Gemini CLI, Cursor, GitHub Copilot, and any other AI coding assistant.

![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/aliabbaschadhar.ai-agent-skills)
![Installs](https://img.shields.io/visual-studio-marketplace/i/aliabbaschadhar.ai-agent-skills)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## Features

### Sidebar Skills Browser
A dedicated Activity Bar panel organizes all 940+ skills by category. Click any skill to preview its content instantly in a side panel.

### Browse & Paste (Ctrl+Shift+/)
Open a searchable QuickPick over all skills. Selecting one copies `/<skill-id>` to your clipboard and attempts to paste it directly into Claude Code or Gemini CLI chat.

### Install to Your AI Agent
Right-click any skill in the sidebar (or use the Command Palette) to install it as a persistent file to:

| Agent | Installed To |
|-------|-------------|
| **Claude Code** | `~/.claude/skills/{id}/SKILL.md` |
| **Gemini CLI** | `~/.gemini/skills/{id}/SKILL.md` |
| **Cursor** (project) | `.cursor/rules/{id}.mdc` |
| **Cursor** (global) | `~/.cursor/rules/{id}.mdc` |
| **GitHub Copilot** | `.github/copilot-instructions.md` (append) |
| **Custom Path** | Any directory you specify |

The extension **auto-detects your editor** (Cursor vs VS Code) and pre-selects the appropriate agent.

### Preview Any Skill
View the full `SKILL.md` content in a read-only side panel before installing — no files written until you confirm.

---

## Usage

### Via Keyboard
- Press `Ctrl+Shift+/` (`Cmd+Shift+/` on Mac) to open the Browse QuickPick.
- Type any skill name or description to filter.
- Press Enter to copy `/<skill-id>` to clipboard (auto-pastes into Claude Code if focused).

### Via Sidebar
1. Click the **AI Agent Skills** icon in the Activity Bar (brain icon).
2. Expand any category to browse skills.
3. Click a skill to preview its content.
4. Use the inline buttons to:
   - **Eye icon**: Preview SKILL.md
   - **Clipboard icon**: Copy `/<skill-id>`
   - **Download icon**: Install to agent

### Via Command Palette
Open `Ctrl+Shift+P` and type `AI Skills:` to see all commands.

---

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `aiSkills.defaultAgent` | `auto` | Default install target: `auto`, `claude`, `cursor`, `copilot`, `generic` |
| `aiSkills.claudeSkillsPath` | `` | Override for Claude Code skills dir (default: `~/.claude/skills`) |
| `aiSkills.cursorScope` | `project` | Install Cursor rules at `project` or `global` scope |
| `aiSkills.confirmOverwrite` | `true` | Ask before overwriting an existing skill file |
| `aiSkills.showRiskBadge` | `true` | Show risk level badge in Browse QuickPick |

---

## What Are Skills?

Skills are reusable AI instruction files (`SKILL.md`) that give your AI assistant specialized knowledge and behavior. Invoke one with `/<skill-id>` in Claude Code chat, or install it persistently to your agent's rules directory so it's always active.

Examples: `ai-engineer`, `api-design-principles`, `react-patterns`, `security-review`, `3d-web-experience`, and 940+ more.

---

## Requirements

- VS Code 1.85+ (also works in Cursor and VSCodium)
- No external dependencies — all skill data is bundled inside the extension

---

## License

MIT — see [LICENSE](LICENSE)
