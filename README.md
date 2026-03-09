# AI Agent Superpowers

> **Browse, preview, and install 940+ AI agent skills** in seconds. Turn your AI assistant into a specialized expert with curated instruction libraries for Claude Code, Gemini CLI, Cursor, GitHub Copilot, and more.

<div align="center">

[![VS Code Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/aliabbaschadhar.agent-superpowers?label=Marketplace&color=0078d4)](https://marketplace.visualstudio.com/items?itemName=aliabbaschadhar.agent-superpowers)
[![Install Count](https://img.shields.io/visual-studio-marketplace/i/aliabbaschadhar.agent-superpowers?label=Installs)](https://marketplace.visualstudio.com/items?itemName=aliabbaschadhar.agent-superpowers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/aliabbaschadhar/agent-superpowers?style=social)](https://github.com/aliabbaschadhar/agent-superpowers)

**940+ expertly-crafted AI skills • Zero dependencies • Works offline • MIT Licensed**

</div>

---

## What Problem Does This Solve?

AI coding assistants are powerful, but they need **well-crafted instructions** to truly excel. Writing instructions from scratch for every domain is tedious, error-prone, and duplicates work others have already done.

**AI Agent Superpowers** solves this by giving you instant access to a curated library of 940+ ready-to-use skills covering:
- 🛠 **Backend & API Design** — REST, GraphQL, microservices, data modeling
- ⚛️ **Frontend Frameworks** — React, Angular, Vue, Svelte, Next.js
- 🔐 **Security & DevOps** — AWS, Kubernetes, security audits, attack patterns
- 🤖 **AI & ML** — Agent architecture, RAG, embeddings, LLM patterns
- 📊 **Data & Analytics** — SQL, A/B testing, analytics tracking
- 🎨 **Creative & 3D** — Web design, Three.js, algorithmic art
- ...and **900+ more** across every domain.

---

## Key Features

### 🧠 **Sidebar Skills Browser**

A dedicated Activity Bar panel puts all 940+ skills at your fingertips. Browse by category, see rich metadata, and preview any skill before installing.

- **Organized by Category**: AI, Backend, Frontend, DevOps, Mobile, Security, Data, and more
- **Favorites & Recent**: Quick access to your most-used skills  
- **Recommended Skills**: Auto-detects your project tech stack (React, FastAPI, Django, etc.) and suggests relevant skills
- **Search**: Type to filter by skill name or description
- **At a Glance**: Risk badge, source indicator, installation status

### ⚡ **Browse & Paste (Ctrl+Shift+/)**

Lightning-fast skill discovery and insertion:

1. Press `Ctrl+Shift+/` (or `Cmd+Shift+/` on Mac)
2. Type to search all 940+ skills
3. Select one → `/<skill-id>` copied to clipboard
4. Auto-pastes into Claude Code or Gemini CLI (if in focus)

Perfect for quick skill lookups mid-conversation without leaving your chat.

### 📦 **One-Click Install to Any Agent**

Install skills directly to your AI agent's config — they become persistent rules that are always active:

| Agent | Install Location |
|-------|------------------|
| **Claude Code** | `~/.claude/skills/{id}/SKILL.md` |
| **Gemini CLI** | `~/.gemini/skills/{id}/SKILL.md` |
| **Cursor** | `.cursor/rules/{id}.mdc` (project or global) |
| **GitHub Copilot** | `.github/copilot-instructions.md` (idempotent append) |
| **Generic** | Any custom directory you specify |

The extension **auto-detects your editor** (Cursor vs VS Code) and suggests the best installation target.

### 👁️ **Skill Preview**

View the complete `SKILL.md` content in a read-only side panel **before installing**. No files written until you confirm. See exactly what instructions your AI will receive.

### 🎯 **Workspace-Aware Recommendations**

The extension scans your `package.json` and workspace files to detect your tech stack (React, Django, PostgreSQL, AWS, Kubernetes, etc.), then automatically recommends relevant skills. Save time discovering skills that match your project.

### 📋 **Installation Management**

- See which skills are installed at a glance (install status shown in tree)
- Uninstall with a single click
- Bulk install categories or all skills at once
- Confirmation dialogs prevent accidental overwrites (configurable)

### 🚀 **100% Offline**

All 940+ skills are bundled inside the `.vsix` extension. No network required — full functionality even if GitHub is down. Background remote sync keeps your library fresh when online.

---

## Getting Started

### Installation

1. **Open VS Code Extensions**: `Ctrl+Shift+X`
2. Search for **"AI Agent Superpowers"** by aliabbaschadhar
3. Click **Install**
4. Reload VS Code

No configuration required — works out of the box.

### Quick Start (30 seconds)

1. **Open the Sidebar** — Click the brain icon in the Activity Bar (left sidebar)
2. **Browse Skills** — Click any skill to preview its content
3. **Install a Skill** — Click the download icon (or right-click → Install)
4. **Done!** — The skill is now active in your AI agent

### Alternative: Browse & Paste

Jump straight into Claude Code chat:

1. Press `Ctrl+Shift+/`
2. Type "react" (or any skill name)
3. Select a skill → `/<skill-id>` copied
4. Paste into Claude Code → skill is activated for that conversation

---

## Usage Guide

### Via Keyboard Shortcut

**`Ctrl+Shift+/`** (Cmd+Shift+/ on Mac) — Opens searchable Browse QuickPick

- Type skill name or keyword to filter
- Press Enter to copy `/<skill-id>` to clipboard
- Auto-pastes into Claude Code or Gemini CLI if in focus
- Perfect for mid-conversation skill insertion

### Via Sidebar Tree

1. Click **AI Agent Skills** icon in Activity Bar
2. Expand categories or use search box to filter
3. Hover over any skill to see actions:
   - **👁️ Preview** — View full SKILL.md content
   - **📋 Copy ID** — Copy `/<skill-id>` to clipboard
   - **⬇️ Install** — Install skill to your agent config
   - **🗑️ Uninstall** — Remove installed skill
4. Click skill name or preview button to see full content

### Via Command Palette

Press `Ctrl+Shift+P` and type `AI Skills:` to see all commands:

- `AI Skills: Browse & Copy Skill ID` — Open the Browse picker
- `AI Skills: Install Skill to Agent` — Install a selected skill
- `AI Skills: Preview Skill` — View skill content before installing
- `AI Skills: Copy Skill ID` — Copy a skill's ID to clipboard
- `AI Skills: Uninstall Skill` — Remove an installed skill
- `AI Skills: Bulk Copy Skills` — Copy multiple skill IDs at once
- `AI Skills: Install Category` — Install all skills in a category
- `AI Skills: Install All Skills` — Bootstrap your entire agent setup

---

## Understanding Skills

### What Is a Skill?

A **skill** is a reusable instruction file (`SKILL.md`) that teaches your AI assistant specialized knowledge and behavior. Skills are domain-specific: "how to architect a React application," "security audit checklist," "API design principles," etc.

### How to Use a Skill

**In Claude Code Chat:**
```
/react-patterns
Show me a React hook that manages async state with error handling.
```

The `/react-patterns` skill is now active for that conversation — Claude has deep context about React best practices.

**Persistent Installation:**
If you use a skill constantly, install it to your agent's config directory. It becomes a persistent rule that's always active (without needing to mention it every time).

### Skill Metadata

Each skill includes:
- **ID** — Unique kebab-case identifier (e.g., `react-patterns`)
- **Category** — AI, Backend, Frontend, Security, etc.
- **Description** — One-line summary of expertise
- **Risk Level** — `safe` (read-only), `unknown` (requires judgment), `none` (not rated)
- **Content** — Full Markdown instruction text

---

## Supported Editors & Agents

| Target | Supported | Works With |
|--------|-----------|-----------|
| **Claude Code** | ✅ Yes | VS Code, VSCodium |
| **Gemini CLI** | ✅ Yes | macOS, Linux, Windows (via WSL) |
| **Cursor** | ✅ Yes | Cursor 0.30+ |
| **GitHub Copilot** | ✅ Yes | VS Code 1.85+ |
| **Generic** | ✅ Yes | Any agent/directory |

**Works in:**
- [x] VS Code (1.85+)
- [x] Cursor
- [x] VSCodium
- [x] GitHub Codespaces

---

## Skill Categories

Browse 940+ skills across these domains:

| Category | Example Skills |
|----------|-----------------|
| **AI & LLM** | `ai-engineer`, `ai-agents-architect`, `autonomous-agents`, `rag-retrieval` |
| **Backend** | `api-design-principles`, `api-patterns`, `django-expert`, `fastapi-builder` |
| **Frontend** | `react-patterns`, `angular-state-management`, `vue-composition-api` |
| **DevOps & Cloud** | `aws-serverless`, `kubernetes-patterns`, `terraform-expert`, `docker-optimization` |
| **Security** | `api-security-best-practices`, `pentesting-approach`, `zero-trust-architecture` |
| **Data & Databases** | `sql-query-optimizer`, `postgres-tuning`, `mongodb-patterns`, `data-modeling` |
| **Mobile** | `android-jetpack-compose-expert`, `ios-swift-patterns`, `react-native-expert` |
| **3D & Creative** | `3d-web-experience`, `algorithmic-art`, `webgl-patterns` |
| **..and 900+ more** | Browse the sidebar for the complete catalog |

---

## Configuration

Customize behavior via VS Code Settings (`Ctrl+,`). Search for `aiSkills.`:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `aiSkills.defaultAgent` | enum | `auto` | Auto-select install target: `auto`, `claude`, `cursor`, `copilot`, `generic` |
| `aiSkills.confirmOverwrite` | boolean | `true` | Ask before overwriting an existing skill file |
| `aiSkills.showRiskBadge` | boolean | `true` | Show risk level badge in Browse QuickPick |
| `aiSkills.autoPasteDelayMs` | number | `80` | Delay (ms) before auto-pasting into agent terminal |
| `aiSkills.localSkillsPath` | string | `` | Path to custom local skills folder (auto-discovered) |
| `aiSkills.remoteIndexUrl` | string | `` | Override remote skills index URL (advanced) |

**Recommended Settings:**
```json
{
  "aiSkills.defaultAgent": "claude",
  "aiSkills.confirmOverwrite": true,
  "aiSkills.showRiskBadge": true
}
```

---

## FAQ

### Q: What if I don't want to install a skill permanently?

**A:** Use **Browse & Paste** (`Ctrl+Shift+/`). Copy the skill ID, paste it into your AI chat, and you've activated it just for that conversation — no installation needed.

### Q: Can I use multiple skills at once?

**A:** Yes! Install as many as you want to your agent config. They all become persistent rules. Or combine them in a single chat session by pasting multiple `/skill-ids`.

### Q: What if a skill overwrites my existing config?

**A:** The extension will warn you with a confirmation dialog (enabled by default). You can disable this in settings if you're installing from a trusted source.

### Q: Do I need internet to use this extension?

**A:** **No!** All 940+ skills are bundled offline. Marketplace features (install, browse, preview) work completely offline. Background remote sync (when online) fetches new skills from GitHub — but the extension is fully functional without it.

### Q: Can I create my own skills?

**A:** Not from this extension (yet), but you can manually create `SKILL.md` files and point `aiSkills.localSkillsPath` to your custom skills folder. They'll appear in the sidebar alongside the bundled library.

### Q: What's the "Risk" badge?

**A:** Skills are rated by safety level:
- **Safe** 🟢 — Passive knowledge (read-only, no system access)
- **Unknown** 🟡 — Requires agent judgment (may access files, run commands)
- **None** ⚪ — Not yet rated

Always preview a skill before installing to confirm it matches your trust level.

### Q: My AI agent doesn't seem to be using the installed skill.

**A:** Make sure:
1. ✅ Skill is installed to the correct location (check vs the agent's documentation)
2. ✅ Restart your AI agent (e.g., close Claude Code and reopen)
3. ✅ For agent-specific paths, verify the agent looks for instructions in that folder

### Q: How often are new skills added?

**A:** The bundled catalog is updated with each extension release. Background remote sync keeps your index fresh whenever new skills are published.

---

## Troubleshooting

### Extension Won't Activate

- **Check VS Code version**: Requires 1.85+. Run `code --version` to verify.
- **Clear cache**: Command palette → "Developer: Reload Window"
- **Reinstall**: Uninstall, then install the extension again

### Skills Don't Show in Sidebar

- Open the **Output** panel (`Ctrl+Shift+U`)
- Select **"AI Agent Skills"** from the dropdown
- Check for error messages
- Verify `.vscode/extensions/` folder has the extension (vs a corrupted install)

### Auto-Paste Not Working

- Make sure Claude Code terminal is focused when pressing `Ctrl+Shift+/`
- Check `aiSkills.autoPasteDelayMs` setting (default 80ms) — increase if your system is slow
- Verify clipboard is accessible (test with `Ctrl+C` / `Ctrl+V`)

### Skill Installation Fails

- Check that the target directory exists (e.g., `~/.claude/skills/`, `.cursor/rules/`)
- Try disabling `aiSkills.confirmOverwrite` if overwrite detection is causing issues
- Verify file permissions (write access to target directory)

### Still Stuck?

Open an [issue on GitHub](https://github.com/aliabbaschadhar/agent-superpowers/issues) with:
- VS Code / Cursor version
- Extension version
- Error message (from Output panel → "AI Agent Skills")
- Steps to reproduce

---

## Performance & Technical Details

### Performance
- **Startup time**: <200ms (extension pre-activates only on first sidebar open)
- **Search**: Instant fuzzy search across all 940+ skills (Fuse.js)
- **Bundle size**: ~2.5 MB `.vsix` (all 940+ skills are pure Markdown, highly compressible)

### Runtime Dependencies
**Zero external dependencies** for runtime. Uses only:
- **Fuse.js** — Fast fuzzy search library (only dependency, lightweight)

### Privacy
- ✅ No telemetry or tracking
- ✅ No skills sent to external servers
- ✅ No home directory scanning (unless you enable `localSkillsPath`)
- ✅ 100% local operation

### System Requirements
- **OS**: Windows, macOS, Linux
- **VS Code**: 1.85+ (tested up to latest)
- **Memory**: <50 MB
- **Disk**: ~10 MB extension + installed skills

---

## Use Cases

### 💡 **For Individual Developers**

Accelerate your workflow by installing domain-specific skills. React developer? Install `react-patterns` + `react-query` + `next-js` for instant expertise. Within seconds, your Claude Code assistant becomes a senior React architect.

### 🏢 **For Teams**

Use the extension to standardize AI instructions across your team's projects. Install the same skill sets in each project's `.agent/skills/` and commit them to version control. Every team member gets the same expert-level AI assistance.

### 🔒 **For Security Teams**

Browse `security` category skills for pentest approaches, zero-trust architecture, API security, authentication patterns, and more. Conduct thorough security audits with your AI co-pilot.

### 🎓 **For Learning**

Explore skills from domains you're less familiar with. Reading through a skill's content teaches you patterns and best practices. Use the skill in Claude Code conversations to learn interactively.

### 🚀 **For Startups**

Bootstrap a full-stack AI assistant setup instantly. Install `full-stack-engineer` collection with skills for backend, frontend, DevOps, security, and data — all in one go.

---

## 📚 Documentation

We have comprehensive documentation for every use case:

| Document | For | Contains |
|----------|-----|----------|
| **[QUICK_START.md](QUICK_START.md)** | New users | 60-second setup & first use |
| **[README.md](README.md)** (this file) | Everyone | Features, usage, FAQ, troubleshooting |
| **[CHANGELOG.md](CHANGELOG.md)** | Release tracking | What's new, what's planned |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | Contributors | Bug reports, feature requests, skill creation |
| **[MARKETPLACE_SUBMISSION.md](MARKETPLACE_SUBMISSION.md)** | Publishers | Publishing & release workflow |
| **[SECURITY.md](SECURITY.md)** | Security-conscious | Privacy, safety, vulnerability reporting |
| **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** | Community members | Community standards & reporting |
| **[DOCS_INDEX.md](DOCS_INDEX.md)** | Navigation | Map of all documentation |

**Start here:** [QUICK_START.md](QUICK_START.md) for immediate onboarding

---

## Contributing

Found a bug or have a feature request? Contributions are welcome!

- **Report Issues**: [GitHub Issues](https://github.com/aliabbaschadhar/agent-superpowers/issues)
- **Suggest Skills**: Create a new skill and submit a PR to `assets/skills/`
- **Improve Docs**: Help us improve the documentation
- **Star the Repo**: Support on [GitHub](https://github.com/aliabbaschadhar/agent-superpowers) ⭐

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines, and [SECURITY.md](SECURITY.md) for vulnerability reporting.

---

## License & Attribution

MIT License — freely use, modify, and distribute. See [LICENSE](LICENSE).

Built by [aliabbaschadhar](https://github.com/aliabbaschadhar) with ❤️ for developers who love AI.

---

## Related Links

- 📦 **[VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=aliabbaschadhar.agent-superpowers)** — Install the extension
- 💬 **[GitHub Discussions](https://github.com/aliabbaschadhar/agent-superpowers/discussions)** — Ask questions, share ideas
- 🐛 **[GitHub Issues](https://github.com/aliabbaschadhar/agent-superpowers/issues)** — Report bugs
- 📄 **[Changelog](CHANGELOG.md)** — See what's new
- 🎓 **[Skills Repository](assets/skills/)** — Browse all skill sources

---

**Ready to supercharge your AI assistant?** Install AI Agent Superpowers now and begin exploring 940+ expertly-crafted skills. Your future self will thank you. 🚀
