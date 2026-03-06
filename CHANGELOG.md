# Changelog

All notable changes to the AI Agent Skills extension will be documented here.

## [1.1.0] - 2026-03-06

### Added
- **Gemini CLI Support**: Official installer for Gemini CLI skills (`~/.gemini/skills/`)
- **Updated Skill Count**: Now includes 940+ curated AI agent skills
- Configurable `aiSkills.geminiSkillsPath` to override the default Gemini skills directory

## [1.0.0] - 2026-03-05

### Added
- Sidebar TreeView panel with 900+ AI skills organized by category
- Browse & Paste command (`Ctrl+Shift+/`) — select skill, copy `/<id>` to clipboard, auto-paste into Claude Code
- Install command — installs SKILL.md to Claude Code, Cursor (project/global), GitHub Copilot, or a custom path
- Auto-detection of running editor (Cursor vs VS Code) to pre-select the recommended agent
- Preview command — opens bundled SKILL.md in a read-only side panel
- Copy ID command — inline tree button copies `/<skill-id>` to clipboard
- GitHub Copilot installer with idempotent append to `.github/copilot-instructions.md`
- Cursor installer with project-scoped (`.cursor/rules/*.mdc`) and global (`~/.cursor/rules/*.mdc`) support
- Claude Code installer to `~/.claude/skills/{id}/SKILL.md` with configurable path override
- Generic installer with InputBox for custom directory
- Overwrite confirmation dialog (configurable)
- Risk badge display in Browse QuickPick (configurable)
- All 946 skills bundled inside the `.vsix` — works offline, no external dependencies
