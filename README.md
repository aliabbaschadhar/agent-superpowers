# AI Agent Superpowers

> Browse, preview, and install **940+ AI agent skills** for GitHub Copilot, Cursor, Winsurf and AntiGravity.

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/aliabbaschadhar.agent-superpowers?label=Marketplace&color=0078d4)](https://marketplace.visualstudio.com/items?itemName=aliabbaschadhar.agent-superpowers)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/aliabbaschadhar.agent-superpowers)](https://marketplace.visualstudio.com/items?itemName=aliabbaschadhar.agent-superpowers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Install

1. Open VS Code Extensions (`Ctrl+Shift+X`)
2. Search **"AI Agent Superpowers"** by aliabbaschadhar
3. Click **Install** — no config needed, works offline

---

## Features

| Feature                       | How                                                                |
| ----------------------------- | ------------------------------------------------------------------ |
| **Sidebar browser**           | Activity Bar → brain icon — browse 940+ skills by category         |
| **Quick browse**              | `Ctrl+Shift+/` — fuzzy-search, select, `/<id>` copied to clipboard |
| **Preview**                   | View `SKILL.md` content before installing                          |
| **One-click install**         | Install any skill to your agent's config directory                 |
| **Workspace recommendations** | Auto-detects your stack and suggests relevant skills               |
| **Favorites & Recents**       | Quick access to your most-used skills                              |
| **Bulk install**              | Install an entire category or all skills at once                   |

### Install targets

| Agent          | Path                              |
| -------------- | --------------------------------- |
| Claude Code    | `~/.claude/skills/{id}/SKILL.md`  |
| Gemini CLI     | `~/.gemini/skills/{id}/SKILL.md`  |
| Cursor         | `.cursor/rules/{id}.mdc`          |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Generic        | Any custom directory              |

---

## Quick Start

```bash
# 1. Press Ctrl+Shift+/ in VS Code
# 2. Type a skill name (e.g. "react", "security", "aws")
# 3. Press Enter — /<skill-id> is copied to your clipboard
# 4. Paste into your AI chat
```

Or open the sidebar, click any skill → **Install** to make it a persistent rule.

---

## Skill Categories

`ai-engineer` · `react-patterns` · `api-design-principles` · `aws-serverless` ·
`api-security-best-practices` · `android-jetpack-compose-expert` · `3d-web-experience` ·
`sql-query-optimizer` · `kubernetes-patterns` · and **930+ more**.

---

## Configuration

Search `aiSkills.` in VS Code Settings (`Ctrl+,`):

| Setting                     | Default | Description                       |
| --------------------------- | ------- | --------------------------------- |
| `aiSkills.confirmOverwrite` | `true`  | Prompt before overwriting a skill |
| `aiSkills.showRiskBadge`    | `true`  | Risk level in Browse QuickPick    |
| `aiSkills.localSkillsPath`  | `""`    | Custom local skills folder        |
| `aiSkills.autoPasteDelayMs` | `80`    | Auto-paste delay (ms)             |
| `aiSkills.remoteIndexUrl`   | `""`    | Override remote index URL         |

---

## Contributing & Support

- Bugs / features → [GitHub Issues](https://github.com/aliabbaschadhar/agent-superpowers/issues)
- Pull requests → see [CONTRIBUTING.md](CONTRIBUTING.md)
- Security → see [SECURITY.md](SECURITY.md)
- Changelog → [CHANGELOG.md](CHANGELOG.md)

MIT License · Built by [aliabbaschadhar](https://github.com/aliabbaschadhar) ❤️
