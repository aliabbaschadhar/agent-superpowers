# Changelog

All notable changes to the **AI Agent Superpowers** extension are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

**Navigation:**

- [Unreleased](#unreleased) — In-progress, next release
- [1.1.0](#110---2026-03-06) — Current release
- [1.0.0](#100---2026-03-05) — Initial release

---

## [Unreleased]

### Planned for v1.2.0 (Target: March 20, 2026)

**Theme:** Performance, quality, and richer skill discovery

#### 🚀 New Features (Coming Soon)

- **Skill Update Detection** — Auto-detects when installed skills have been updated remotely. Highlight outdated skills with `$(arrow-up)` icon.
- **Batch Update Command** — Update all outdated skills in one click with a progress notification.
- **Skill Collections** — 7 curated skill packs:
  - Essential Starter
  - Full-Stack Engineer
  - AI/ML Specialist
  - Security Auditor
  - Frontend Expert
  - DevOps & Cloud
  - Product Manager
- **User Collections** — Create custom skill collections via `AI Skills: Create Collection` command. Organize skills by your own categories.
- **Browse Filters** — Advanced filter syntax in Browse QuickPick:
  - `/risk:safe` — Show only safe skills
  - `/cat:backend` — Filter by category
  - `/installed` — Show only installed skills
  - Combine with text: `/risk:safe react api`
- **Export/Import Skill Sets** — Share skill configurations with your team:
  - `aiSkills.exportSkillSet` — Export installed skills to JSON
  - `aiSkills.importSkillSet` — Import JSON skill set for bulk install
- **Workspace Auto-Install** — First-time workspace scan recommends skills based on detected tech stack. Single-click install or dismiss.
- **Create New Skill Wizard** — Scaffold new custom `SKILL.md` files with guided template.

#### ⚡ Performance Improvements

- **InstallationDetector Memoization** — Cache install state to eliminate full-disk scans. ~50ms→5ms per tree refresh.
- **Remote Sync Retry Logic** — 3 retries with exponential backoff (1s/2s/4s) for transient network errors.
- **Monorepo Workspace Scan** — Detect tech stack in monorepo nested `package.json` files (up to 2 levels).

#### 🐛 Quality Improvements

- **Markdown Syntax Highlighting** — Skill preview now renders Markdown with syntax highlighting using VS Code's Markdown API.
- **Installer Unit Tests** — Full test suite for all installer classes (Claude, Gemini, Cursor, Copilot, Generic).
- **Skill Validation CLI** — New `bun run validate-skills` script checks for:
  - Duplicate skill IDs
  - Missing SKILL.md files
  - Invalid risk levels
  - Orphan entries
  - Formatting errors

#### 📊 UI Enhancements

- **Skill Source Badges** — Show `[bundled]`, `[remote]`, `[local]` indicators in tree
- **All Categories Collapse** — Collapse all categories under single `$(folder-library)` header to reduce sidebar clutter
- **Favorites Management** — Star button on all skill nodes, `clearFavorites` command with confirmation

---

## [1.1.0] - 2026-03-06

**Theme:** Expanded Agent Support

### ✨ Added

- **Gemini CLI Support** — Official installer for Gemini CLI:
  - Install skills to `~/.gemini/skills/{id}/SKILL.md`
  - Full feature parity with Claude Code installer
  - Configurable path via `aiSkills.geminiSkillsPath`
- **Updated Skill Count** — Skill library expanded from 946 to 940+ curated skills
- **Improved Installation UX** — Better overwrite confirmation dialogs and success notifications

### 🔧 Changed

- **Gemini CLI Configuration** — New setting: `aiSkills.geminiSkillsPath` to override default Gemini installation directory

### 📦 Dependencies

- No new external dependencies added
- Maintains single runtime dependency: Fuse.js

---

## [1.0.0] - 2026-03-05

**Theme:** Initial Release — Full-Featured Skill Browser & Installer

### ✨ Major Features

#### Sidebar Skills Browser

- Activity Bar panel organization of 946+ AI skills
- Hierarchical category structure (AI, Backend, Frontend, DevOps, Security, Data, Mobile, Creative)
- Instant skill previews in side panel
- Rich metadata display (category, risk level, description)
- Favorites & recent skills quick-access sections
- Recommended skills based on project tech stack detection

#### Browse & Paste Command (Ctrl+Shift+/)

- Searchable QuickPick over all skills
- Fuzzy search on skill names and descriptions
- One-keystroke copy of `/<skill-id>` to clipboard
- Auto-paste detection into Claude Code or Gemini CLI terminals
- Configurable auto-paste delay for slower systems

#### Multi-Agent Installation

- **Claude Code**: `~/.claude/skills/{id}/SKILL.md`
- **Gemini CLI**: `~/.gemini/skills/{id}/SKILL.md` (added in v1.1.0)
- **Cursor**: Both project-scoped (`.cursor/rules/{id}.mdc`) and global (`~/.cursor/rules/{id}.mdc`)
- **GitHub Copilot**: Idempotent append to `.github/copilot-instructions.md` (no duplicates)
- **Generic Path**: Custom user-specified directory for other tools

#### Installation Features

- **Auto-Detection**: Detects running editor (Cursor vs VS Code) and pre-suggests appropriate agent
- **Overwrite Confirmation**: Ask before replacing existing skill files (configurable)
- **Preview Before Install**: View full SKILL.md content before committing any changes
- **Bulk Operations**:
  - Copy multiple skill IDs at once
  - Install entire categories in one click
  - Bootstrap full agent setup with "Install All"
- **Uninstall Management**: Remove skills with single click, proper cleanup of directories

#### Workspace Technology Detection

- Automatic `package.json` scanning
- File extension-based tech detection
- Curated skill recommendations: React → `react-patterns`, FastAPI → `fastapi-builder`, etc.
- "Recommended" tree section with relevant skills highlighted

#### Data & Persistence

- **Favorites**: Persistent via VS Code GlobalState
- **Recent Skills**: LRU list in GlobalState, quick access to last 10 used skills
- **Installation State**: Tracks which skills are installed for tree status display

#### Offline-First Architecture

- **All 946 skills bundled** inside `.vsix` — zero network dependency
- Works completely offline (no CDN, no central server)
- Optional background remote sync keeps library fresh when online
- Non-blocking sync — full functionality while refresh happens in background

#### Configuration Options

| Setting                     | Purpose                                                        |
| --------------------------- | -------------------------------------------------------------- |
| `aiSkills.defaultAgent`     | Pre-select install target (auto/claude/cursor/copilot/generic) |
| `aiSkills.claudeSkillsPath` | Override Claude Code skills directory                          |
| `aiSkills.cursorScope`      | Project vs global Cursor rules scope                           |
| `aiSkills.confirmOverwrite` | Prompt before overwriting skill files                          |
| `aiSkills.showRiskBadge`    | Show/hide risk level badge in QuickPick                        |
| `aiSkills.autoPasteDelayMs` | Auto-paste timing (tunable for slow hardware)                  |

### 🎯 Skill Content

- **940+ expertly-crafted skills** across 15+ domains:
  - AI & LLM specialization (agent architecture, RAG, prompt engineering)
  - Backend patterns (APIs, databases, microservices)
  - Frontend frameworks (React, Angular, Vue, Svelte, Next.js)
  - DevOps & Cloud (AWS, Kubernetes, Terraform, Docker)
  - Security (pentesting, zero-trust, API security, authentication)
  - Data & Analytics (SQL, A/B testing, data modeling)
  - Mobile (Android, iOS, React Native)
  - 3D & Creative (Three.js, WebGL, algorithmic art)
  - ...and many more specialized domains

### ⚙️ Technical Highlights

- **Zero Runtime Dependencies** (except Fuse.js for fuzzy search)
- **TypeScript 5.x** — Full type safety
- **esbuild Bundling** — Optimized ~2.5 MB `.vsix`
- **Bun Runtime** — Fast script execution for prebuild pipeline
- **No Telemetry** — 100% privacy-focused
- **VS Code ^1.85.0** — No proposed APIs, stable API only

### 📊 Performance

- Extension activation: <200ms
- Fuzzy search: Instant across all 940+ skills
- Sidebar refresh: <100ms
- Memory footprint: <50MB
- Bundle size: ~2.5MB (including all 940+ skills)

### 🔒 Security & Privacy

- ✅ No data sent to external servers
- ✅ No telemetry or usage tracking
- ✅ No home directory scanning (unless explicitly configured)
- ✅ All skills are static Markdown — no code execution
- ✅ 100% local operation

### 📝 Documentation

- Comprehensive README with features, usage, and configuration
- Inline help text in QuickPick and tree items
- Configuration descriptions in `package.json`
- Error messages with actionable troubleshooting steps

---

## How to Update

When a new version is released, VS Code will prompt you to update. Or manually:

1. Open **Extensions** (`Ctrl+Shift+X`)
2. Find **AI Agent Superpowers**
3. Click **Update**
4. Reload VS Code

---

## Roadmap & Future

- **v1.2.0** (March 20, 2026) — Performance, skill updates, collections
- **v1.3.0+** — Windsurf support, custom skill authoring wizard, skill rating system, i18n

See [CONTRIBUTING.md](CONTRIBUTING.md) for ways to help shape the future!

---

## Support

- 🐛 **Found a bug?** [Report it](https://github.com/aliabbaschadhar/agent-superpowers/issues)
- 💡 **Have a feature idea?** [Open a discussion](https://github.com/aliabbaschadhar/agent-superpowers/discussions)
- 📖 **Need help?** Check [README.md](README.md) or the [FAQ](#faq)

---

Happy coding! 🚀
