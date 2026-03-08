# Changelog

All notable changes to the AI Agent Skills extension will be documented here.

## [Unreleased]

### Added
- **Getting Started onboarding**: New collapsible "Getting Started" section in the sidebar tree for first-time users with quick tips and action links.
- **Skill Collections**: 7 curated skill packs (Essential Starter, Full-Stack Engineer, AI/ML Specialist, Security Auditor, Frontend Expert, DevOps & Cloud, Product Manager) accessible via `AI Skills: Browse Skill Collections` command and sidebar tree.
- **Browse QuickPick filters**: New filter syntax in the browse dialog — `/risk:safe`, `/cat:ai`, `/installed`, combinable with text search (e.g., `/risk:safe react`).
- **Export Skill Set** (`aiSkills.exportSkillSet`): Export all installed skill IDs to a shareable JSON file for team collaboration.
- **Import Skill Set** (`aiSkills.importSkillSet`): Import a skill set JSON file and bulk-install missing skills.
- **Create New Skill** (`aiSkills.createSkill`): Guided wizard to scaffold a new custom `SKILL.md` with category, risk level, and template content.
- **Skills Validation CLI**: New `bun run validate-skills` script that checks for duplicate IDs, missing SKILL.md files, invalid risk levels, orphan entries, and more.
- **Toggle Favorite** command now wired into extension activation (was previously unregistered).

### Changed
- **Project-local skill installation**: All skills now install to `.agent/skills/{id}/SKILL.md` within the open workspace folder instead of global agent-specific paths (e.g. `~/.claude/skills/`, `~/.gemini/skills/`, `.cursor/rules/`).
- **Agent picker removed from install flow**: Skills install directly to `.agent/skills/` — no agent-type selection dialog shown.
- **Uninstall simplified**: Removes the entire `.agent/skills/{id}/` folder; no longer scans multiple global paths.
- **InstallationDetector simplified**: Checks only `.agent/skills/{id}/SKILL.md` in the workspace root.

### Removed
- Configuration settings `aiSkills.defaultAgent`, `aiSkills.claudeSkillsPath`, `aiSkills.geminiSkillsPath`, and `aiSkills.cursorScope` (no longer applicable).

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
