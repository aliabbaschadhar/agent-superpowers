# Context — Work Log & Context Tracker

Running log of decisions, discoveries, and session context for the **AI Agent Superpowers** extension.

---

## Session Log

### 2026-03-08

**Status:** Active development — v1.1.0 released, v1.2.0 planning in progress.

**What exists:**
- Full VS Code extension skeleton with Activity Bar sidebar tree, Browse QuickPick, preview webview, and installer pipeline.
- 940+ skills bundled inside the `.vsix` via `assets/skills/` — works completely offline.
- Five agent installers: Claude Code, Gemini CLI, Cursor (project + global), GitHub Copilot, Generic.
- Background remote sync that merges new skills from a GitHub raw index without blocking startup.
- Workspace technology scanner that recommends relevant skills based on detected frameworks.
- Favorites and recents, both backed by `GlobalState`.
- `WorkspaceScanner` detects tech stack from package.json / file extensions.

**Recent changes (v1.1.0 — 2026-03-06):**
- Added Gemini CLI support (`~/.gemini/skills/{id}/SKILL.md`).
- Skill count updated to 940+.
- New `aiSkills.geminiSkillsPath` config.

**Recent changes (2026-03-08 — project-local install refactor):**
- All skills now install project-locally to `{workspaceRoot}/.agent/skills/{id}/SKILL.md`.
- `ProjectLocalInstaller` added (`src/installers/projectLocalInstaller.ts`) extending `BaseInstaller`.
- Agent-type picker removed from `installSkill.ts` and `installBulk.ts`.
- `InstallationDetector` stripped to check only `.agent/skills/{id}/SKILL.md`.
- `uninstallSkill.ts` simplified to `fs.rmSync` the `.agent/skills/{id}/` folder.
- Removed config keys: `aiSkills.defaultAgent`, `aiSkills.claudeSkillsPath`, `aiSkills.geminiSkillsPath`, `aiSkills.cursorScope`.

**Known issues / tech debt:**
- `InstallationDetector` does a full disk scan on every tree refresh — should be memoized or event-driven.
- No real test coverage for installer classes.
- `WorkspaceScanner` only reads the root `package.json`; monorepos with nested packages are not scanned.
- Remote sync has no retry logic or exponential back-off.
- Webview preview is plain text; no syntax highlighting for Markdown.

---

## Key Decisions

| Date | Decision | Rationale |
|---|---|---|
| 2026-03-05 | Bundle all skills inside `.vsix` | Zero-dependency offline experience; no CDN reliability risk |
| 2026-03-05 | Fuse.js as sole runtime dep | Fast, zero-config fuzzy search with no server round-trips |
| 2026-03-05 | `esbuild` + `Bun` build chain | Fastest TS bundling; Bun for script execution parity |
| 2026-03-06 | Separate `RemoteSync` class | Separation of concerns; sync can be swapped (e.g., GraphQL later) |
| 2026-03-06 | Gemini CLI installer added | Growing Gemini user base; feature parity with Claude |
| 2026-03-08 | Project-local install (.agent/skills/) | Skills scoped to workspace; avoids polluting global agent configs; aligns with repo-committed skill sets |

---

## Active Context

- **Current branch:** `dev`
- **Next milestone:** v1.2.0
- **Priority work items:** See `plan.md`
- **Editor target:** VS Code ^1.85 — no proposed APIs used

---

## Glossary

| Term | Definition |
|---|---|
| Skill | A `SKILL.md` file containing specialized AI agent instructions, identified by a kebab-case `id` |
| SkillEntry | TypeScript interface representing a skill in the in-memory index |
| Install | Copying a skill's `SKILL.md` to an AI agent's config directory |
| Source | Origin of a skill: `bundle` (shipped in `.vsix`), `remote` (synced), or `local` (user's own folder) |
| Risk | `safe` = no system access; `unknown` = requires agent judgment; `none` = not rated |
