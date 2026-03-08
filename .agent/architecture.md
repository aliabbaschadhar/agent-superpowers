# Architecture

Software architecture of **AI Agent Superpowers** — a VS Code extension.

---

## High-Level Overview

```
┌───────────────────────────────────────────────────────────┐
│                      VS Code Host                         │
│                                                           │
│  ┌─────────────┐   ┌──────────────────┐  ┌────────────┐  │
│  │  Activity   │   │  Command Palette  │  │  Webview   │  │
│  │  Bar Tree   │   │  (QuickPick)      │  │  Preview   │  │
│  └──────┬──────┘   └────────┬─────────┘  └─────┬──────┘  │
│         │                   │                   │         │
│  ┌──────▼───────────────────▼───────────────────▼──────┐  │
│  │                  extension.ts (activate)             │  │
│  │     - wires commands, tree, scanner, sync            │  │
│  └──────────────────────────┬───────────────────────────┘  │
│                             │                              │
│             ┌───────────────┼───────────────┐             │
│             ▼               ▼               ▼             │
│      SkillsManager   SkillsTreeProvider  Installers       │
│             │               │               │             │
│      ┌──────┴──────┐        │     ┌─────────┴────────┐   │
│      │SkillsRepo   │        │     │Claude / Gemini /  │   │
│      │RemoteSync   │        │     │Cursor / Copilot / │   │
│      │FuzzySearch  │        │     │Generic Installer  │   │
│      │WorkspaceScan│        │     └──────────────────-┘   │
│      └─────────────┘        │                             │
│                             ▼                             │
│                       nodes.ts (tree items)               │
└───────────────────────────────────────────────────────────┘
```

---

## Layers

### 1. Entry Point — `src/extension.ts`

- `activate(context)` is the single VS Code entry point.
- Instantiates `SkillsManager`, `SkillsTreeProvider`, `WorkspaceScanner`, `RecentSkills`, `FavoriteSkills`.
- Registers all commands and pushes them onto `context.subscriptions`.
- Kicks off background `syncRemote()` and workspace technology scan.

### 2. Skills Data Layer — `src/skills/`

| File | Role |
|---|---|
| `SkillsManager.ts` | Facade: init, query (`getAll`, `search`, `getById`, `getRecommended`), sync, local sources |
| `SkillsRepository.ts` | Reads `assets/skills_index.json` (bundled) + optional user-local skill folders |
| `RemoteSync.ts` | Fetches latest index JSON from GitHub raw/Gist; caches in extension storage |
| `FuzzySearch.ts` | Fuse.js wrapper; index built once on first query, then reused |
| `InstallationDetector.ts` | Checks agent-specific install paths to mark skills as installed |
| `WorkspaceScanner.ts` | Reads workspace package.json/files to detect tech stack |
| `techSkillMap.ts` | Static mapping of technology names → recommended skill IDs |
| `types.ts` | `SkillEntry` interface |

**Data flow — startup:**
```
assets/skills_index.json
        │
        ▼
SkillsRepository.load()
        │
        ├── merge remote cache (storagePath/skills_index.json)
        │
        ├── merge local sources (aiSkills.localSkillsPath)
        │
        └── ▶ SkillsManager.skills[]
```

**Data flow — remote sync (background):**
```
GitHub raw URL
      │  (fetch)
      ▼
RemoteSync.fetchIndex()
      │  (save cache)
      ▼
storagePath/skills_index.json
      │  (merge)
      ▼
SkillsManager.skills[]  →  SkillsTreeProvider.refresh()
```

### 3. Presentation Layer — `src/tree/`

| File | Role |
|---|---|
| `SkillsTreeProvider.ts` | Implements `vscode.TreeDataProvider<SkillTreeNode>` |
| `nodes.ts` | Defines `SummaryNode`, `CategoryNode`, `SkillNode` |

Tree structure:
```
📋 Summary (N skills, M installed)
├── ⭐ Favorites
├── 🔁 Recent
├── 💡 Recommended  (if workspace techs detected)
├── 📁 Category A
│   ├── skill-id-1
│   └── skill-id-2
└── 📁 Category B
    └── ...
```

### 4. Command Layer — `src/commands/`

Each file exports a `register*Command()` factory returning a `vscode.Disposable`.

| Command File | VS Code Command ID | Trigger |
|---|---|---|
| `browseSkills.ts` | `aiSkills.browse` | `Ctrl+Shift+/` |
| `installSkill.ts` | `aiSkills.install` / `aiSkills.installFromTree` | Sidebar / Palette |
| `previewSkill.ts` | `aiSkills.preview` | Sidebar eye icon |
| `copySkillId.ts` | `aiSkills.copyId` | Inline tree button |
| `uninstallSkill.ts` | `aiSkills.uninstall` | Inline tree button |
| `bulkCopySkills.ts` | `aiSkills.bulkCopy` | Toolbar |
| `installBulk.ts` | `aiSkills.installCategory` / `aiSkills.installAll` | Toolbar / Category |
| `agentPicker.ts` | (shared) | Calls into agent picker QuickPick |

### 5. Installer Layer — `src/installers/`

All installers implement the common interface defined in `types.ts`.

| Installer | Target Path |
|---|---|
| `ClaudeInstaller` | `~/.claude/skills/{id}/SKILL.md` |
| `GeminiInstaller` | `~/.gemini/skills/{id}/SKILL.md` |
| `CursorInstaller` | `.cursor/rules/{id}.mdc` (project) or `~/.cursor/rules/{id}.mdc` (global) |
| `CopilotInstaller` | `.github/copilot-instructions.md` (idempotent append) |
| `GenericInstaller` | User-specified directory |

### 6. Utilities

| File | Role |
|---|---|
| `editorDetector.ts` | Determines if VS Code or Cursor is the running host |
| `logger.ts` | Wraps `vscode.window.createOutputChannel` with `log()` helper |
| `constants.ts` | All magic strings: command IDs, config keys, error messages |
| `favoriteSkills.ts` | `GlobalState`-backed Set of favorited skill IDs |
| `recentSkills.ts` | `GlobalState`-backed LRU list of recently used skill IDs |

---

## Asset Pipeline

```
scripts/prebuild.js
  ├── Reads assets/skills/  (940+ SKILL.md folders)
  ├── Generates assets/skills_index.json
  └── Generates assets/manifest.json

esbuild.config.js
  ├── Bundles src/ → dist/extension.js
  └── Copies assets/ → dist/assets/  (included in .vsix)
```

---

## Configuration Schema (`package.json` contributes.configuration)

| Key | Type | Default | Purpose |
|---|---|---|---|
| `aiSkills.defaultAgent` | string enum | `"auto"` | Pre-selects agent in installer QuickPick |
| `aiSkills.claudeSkillsPath` | string | `""` | Override Claude install root |
| `aiSkills.geminiSkillsPath` | string | `""` | Override Gemini install root |
| `aiSkills.cursorScope` | string enum | `"project"` | Project vs global Cursor rules |
| `aiSkills.confirmOverwrite` | boolean | `true` | Ask before overwrite |
| `aiSkills.showRiskBadge` | boolean | `true` | Risk badge in QuickPick |
| `aiSkills.autoPasteDelayMs` | number | `80` | Delay before auto-paste into agent terminal |
| `aiSkills.localSkillsPath` | string | `""` | Local custom skills folder |
| `aiSkills.remoteIndexUrl` | string | `""` | Override remote index URL |

---

## Dependency Graph (runtime)

```
extension.ts
  ├── SkillsManager  ←─ SkillsRepository, RemoteSync, FuzzySearch
  ├── SkillsTreeProvider  ←─ nodes.ts, FavoriteSkills
  ├── WorkspaceScanner  ←─ techSkillMap
  ├── RecentSkills
  ├── FavoriteSkills
  └── commands/*  ←─ agentPicker, installers/*, SkillsManager
```

Runtime dependency: **Fuse.js** (fuzzy search). No other external runtime deps.
