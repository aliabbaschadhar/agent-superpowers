# AI Agent Superpowers

> Browse, preview, and install **940+ AI agent skills** for GitHub Copilot, Cursor, Windsurf and AntiGravity.

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
| GitHub Copilot | `.github/copilot-instructions.md` |
| Cursor         | `.cursor/instructions.md`         |
| Windsurf       | `.windsurf/instructions.md`       |
| AntiGravity    | `.antigravity/instructions.md`    |

---

## Quick Start

- Press `Ctrl+Shift+/` in VS Code
- Type a skill name (e.g. "react", "security", "aws")
- Press Enter — `/<skill-id>` is copied to your clipboard
- Paste into your editor's AI chat

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
| `aiSkills.remoteIndexUrl`   | `""`    | Override remote index URL         |

---

## Editor Integration

After installing skills, add this to your editor in `.github/copilot-instructions.md` or `.cursor/instructions.md` or `.windsurf/instructions.md` or `.antigravity/instructions.md` so agent automatically discovers and uses them:

````markdown
## AI Agent Skills

This project uses AI Agent Superpowers skills stored in `.agent/skills/`.

### How to use skills

- Each installed skill lives at `.agent/skills/<skill-id>/SKILL.md`
- Before answering domain-specific questions, check if a relevant skill exists:
  - React / frontend → `.agent/skills/react-patterns/SKILL.md`
  - API design → `.agent/skills/api-design-principles/SKILL.md`
  - Security → `.agent/skills/api-security-best-practices/SKILL.md`
  - AI / agents → `.agent/skills/ai-agents-architect/SKILL.md`
  - …and so on for any other installed skill

### Loading a skill

Reference a skill file directly in your prompt:

```
#file:.agent/skills/react-patterns/SKILL.md
```

Or use the `aiSkills_requestSkill` Language Model Tool during a Copilot response:

```
#tool:aiSkills_requestSkill {"skillId": "react-patterns"}
```

- If the skill is **already installed**, it loads instantly with no prompt.
- If the skill is **not installed**, VS Code will ask for confirmation before writing any file.

### Skill catalog

Browse all 940+ available skills:

- Open `assets/skills-catalog.md` (or `.agent/skills-catalog.md` after a sync)
- Or press `Ctrl+Shift+/` in VS Code to fuzzy-search and install skills

### Rules

1. Always check `.agent/skills/` before answering domain-specific questions.
2. When loading a skill, apply its guidance to your entire response.
3. Only reference skill IDs you can confirm exist in the catalog — never guess.
````

> **Tip:** You can also auto-generate this block by running **AI Skills: Copy Copilot Instructions** from the Command Palette (`Ctrl+Shift+P`).

---

## Contributing & Support

- Bugs / features → [GitHub Issues](https://github.com/aliabbaschadhar/agent-superpowers/issues)
- Pull requests → see [CONTRIBUTING.md](CONTRIBUTING.md)
- Security → see [SECURITY.md](SECURITY.md)
- Changelog → [CHANGELOG.md](CHANGELOG.md)

MIT License · Built by [aliabbaschadhar](https://github.com/aliabbaschadhar) ❤️
