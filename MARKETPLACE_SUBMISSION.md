# Marketplace Submission Checklist

This document is a comprehensive checklist for publishing **AI Agent Superpowers** to the VS Code Marketplace and keeping it fresh.

---

## Pre-Submission Checklist ✅

### Documentation

- [x] **README.md** — Comprehensive, with features, usage, configuration, FAQ, and troubleshooting
- [x] **CHANGELOG.md** — Detailed release notes for all versions, organized with dates and categories
- [x] **CONTRIBUTING.md** — Guidelines for bug reports, feature requests, skill creation, and code contributions
- [x] **LICENSE** — MIT license included
- [x] **CODE_OF_CONDUCT.md** — Community standards and reporting guidelines
- [x] **SECURITY.md** — Security policy and vulnerability disclosure
- [x] **package.json** — Correct metadata:
  - [x] `displayName` — User-facing name
  - [x] `description` — Clear one-liner
  - [x] `keywords` — Searchable terms
  - [x] `categories` — Appropriate categories
  - [x] `repository` — GitHub link
  - [x] `homepage` — GitHub README link
  - [x] `bugs` — Issue tracker link
  - [x] `license` — MIT specified

### Code Quality

- [x] **No errors** — `bun run type-check` passes
- [x] **Lints clean** — `bun run lint` passes (or auto-fixed)
- [x] **No console.log** — All logging uses `log()` from `src/logger.ts`
- [x] **Proper error handling** — No silent failures; errors logged or surfaced to user
- [x] **No telemetry** — Extension doesn't send data to external servers
- [x] **Secure paths** — User-provided paths validated before file operations

### Features & Functionality

- [x] **Core features work** — Sidebar, Browse, Install, Preview all functional
- [x] **Multi-agent support** — Claude Code, Gemini CLI, Cursor, Copilot, Generic all work
- [x] **No broken links** — README links point to valid resources
- [x] **Offline first** — All skills bundled; extension works without network
- [x] **Auto-detection** — Editor (Cursor vs VS Code) properly detected

### Assets

- [x] **Icon** — `media/icon.png` exists, 128x128 or larger, transparent PNG
- [x] **Clean workspace** — No `node_modules` or build artifacts in root
- [x] **Bundled assets** — All 940+ skills in `assets/skills/` are included

### Configuration

- [x] **VS Code compatibility** — Targets `vscode: ^1.85.0`
- [x] **No proposed APIs** — Only stable API used
- [x] **Settings schema** — All user-facing settings documented in `package.json`
- [x] **Activation events** — Extension uses `onStartupFinished` (lightweight)

---

## Submission Steps 🚀

### 1. Create Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `vsce-token`
4. Scopes: Just select `repo` and `user:email`
5. Generate and **save securely** (only shown once)

### 2. Create Azure DevOps Personal Access Token

1. Go to https://dev.azure.com/ and sign in
2. Click your profile icon → Personal access tokens
3. New token → Name `vsce-marketplace`
4. Organization: All accessible organizations
5. Scopes: Marketplace → "Manage"
6. Create and **save securely**

### 3. Install VS Code Extension CLI

```bash
npm install -g vsce
```

Or with Bun:

```bash
npm install -g vsce --save-dev
```

### 4. Create Publisher Account

First time only:

```bash
vsce create-publisher aliabbaschadhar
```

You'll be prompted for:

- Publisher name: `aliabbaschadhar`
- Email: Your email
- Personal Access Token: Paste from step 2

### 5. Authenticate VSCE

```bash
vsce login aliabbaschadhar
```

Paste the Azure DevOps token when prompted. It's saved locally.

### 6. Build the Extension

```bash
# Ensure everything is compiled and minified
bun run compile

# Optional: Create a .vsix file for testing
vsce package

# This creates `agent-superpowers-1.1.0.vsix` locally
```

### 7. Test Locally (Optional but Recommended)

```bash
# Install the .vsix you just created
code --install-extension ./agent-superpowers-1.1.0.vsix

# Test in VS Code:
# - Browse skills (Ctrl+Shift+/)
# - Install a skill
# - Check sidebar
# - Uninstall a skill

# Uninstall when done
code --uninstall-extension aliabbaschadhar.agent-superpowers
```

### 8. Publish to Marketplace

```bash
vsce publish
```

VSCE will:

1. Validate the extension
2. Package into `.vsix`
3. Upload to VS Code Marketplace
4. Update the version in `package.json` (optional: `--patch`, `--minor`, `--major` to bump)

### 9. Verify on Marketplace

1. Wait 5-10 minutes for indexing
2. Go to https://marketplace.visualstudio.com/items?itemName=aliabbaschadhar.agent-superpowers
3. Verify:
   - [x] Description displays correctly
   - [x] Icon shows
   - [x] Screenshots/gifs load (if any)
   - [x] README rendered
   - [x] Version bumped
   - [x] Installation button works

---

## Post-Publication Steps 📤

### Update CHANGELOG

After publishing, update `CHANGELOG.md`:

```markdown
## [1.2.0] - 2026-03-20

### Added

- Feature 1
- Feature 2

### Fixed

- Bug fix 1

### Changed

- Change 1
```

Then move `[Unreleased]` section to the top.

### Update GitHub Releases

1. Go to https://github.com/aliabbaschadhar/agent-superpowers/releases
2. Click "Draft a new release"
3. Tag: `v1.2.0`
4. Title: `v1.2.0 — [Theme]`
5. Description: Copy from CHANGELOG
6. Upload `.vsix` file built locally
7. Publish release

### Announce Release (Optional)

- Tweet/post on social media
- GitHub discussions announcement
- Changelog blog post

---

## Future Updates & Versioning 🔄

### When to Publish

- **Patch** (1.1.X) — Bug fixes, minor improvements → publish immediately
- **Minor** (1.X.0) — New features → every 2-4 weeks
- **Major** (X.0.0) — Breaking changes → rarely (yearly or less)

### Before Each Release

1. **Update CHANGELOG.md**
   - Move [Unreleased] content to version section with date
   - Add new [Unreleased] section at top

2. **Bump version in package.json**

   ```bash
   # Let VSCE bump automatically or do it manually
   # Semantic versioning: bug fix = patch, feature = minor, breaking = major
   npm version patch  # or minor, major
   ```

3. **Compile and test**

   ```bash
   bun run type-check
   bun run lint
   bun run compile
   vsce package
   ```

4. **Commit and tag**

   ```bash
   git add .
   git commit -m "chore: release v1.1.0"
   git tag v1.1.0
   git push origin main --tags
   ```

5. **Publish**

   ```bash
   vsce publish
   ```

6. **Create GitHub release**
   - Link to marketplace
   - Upload `.vsix`
   - Copy changelog

---

## Marketplace Best Practices 💡

### Discoverability

- ✅ Use relevant keywords: `claude-code`, `cursor`, `copilot`, `ai-skills`, `skill-picker`
- ✅ Clear description: Lead with the value prop, not the tech
- ✅ Categories: "AI" is primary; "Snippets" is secondary
- ✅ Write for search: README includes common search terms

### Ratings & Reviews

- Monitor reviews and feedback — respond to constructive criticism
- Fix bugs quickly — publish patches as soon as they're ready
- Consider review feedback for future features
- Don't engage negatively — keep tone professional

### Updates & Communication

- Publish release notes when updating — users can see what changed
- Link to GitHub issues/discussions for feature requests
- Keep README in sync with actual functionality
- Document breaking changes in CHANGELOG

### Supporting Users

- ✅ FAQ section in README
- ✅ Troubleshooting guide
- ✅ Clear error messages in extension
- ✅ GitHub issues for bug reports
- ✅ GitHub discussions for feature requests
- ✅ Community guidelines in CONTRIBUTING.md

---

## Marketplace Page Content 📝

### What the Marketplace Will Display

**From package.json:**
| Field | Displays as |
|-------|-----------|
| `displayName` | Extension name (headline) |
| `description` | Tagline (under name) |
| `license` | License badge |
| `icon` | Icon/logo |
| `version` | Version number |
| `homepage` | "More information" link |
| `repository` | "Repository" link |
| `bugs` | "Support" link |
| `keywords` | Used for search ranking |
| `categories` | Category filtering |

**From repository:**
| File | Displays as |
|-----|-----------|
| `README.md` | Main extension page (MarkDown rendered) |
| `media/icon.png` | Logo / extension icon |
| `CHANGELOG.md` | Changelog tab (optional link) |

### Customizing the Marketplace Page

**Badges in README:** Add them at the top

```markdown
[![Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/aliabbaschadhar.agent-superpowers.svg)](https://marketplace.visualstudio.com/items?itemName=aliabbaschadhar.agent-superpowers)
[![Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/aliabbaschadhar.agent-superpowers.svg)](https://marketplace.visualstudio.com/items?itemName=aliabbaschadhar.agent-superpowers)
```

**Feature highlights:** Use emoji and clear sections (already done ✅)

**Screenshots/GIFs:** (Coming soon)

To add screenshots:

1. Take PNG screenshots of key features
2. Save to `media/screenshots/`
3. Link in README with alt text

```markdown
![Sidebar Browser](media/screenshots/sidebar-browser.png)
```

---

## Common Issues & Solutions 🔧

| Issue                                     | Solution                                                              |
| ----------------------------------------- | --------------------------------------------------------------------- |
| `vsce publish` fails with "not logged in" | Run `vsce login aliabbaschadhar` and paste Azure token                |
| Marketplace shows old version             | Wait 5-10 minutes for cache invalidation, then refresh                |
| Icon doesn't display                      | Check `media/icon.png` exists, is >= 128x128, is valid PNG            |
| README doesn't format correctly           | Check Markdown syntax; test locally with `vsce package`               |
| "Publisher name doesn't match"            | Make sure `package.json` publisher matches your account               |
| Extension won't install from `.vsix`      | Try `code --install-extension ./agent-superpowers-1.1.0.vsix --force` |

---

## Quick Command Reference 🎯

```bash
# One-time setup
npm install -g vsce
vsce create-publisher aliabbaschadhar
vsce login aliabbaschadhar

# Build & test
bun run compile
vsce package
code --install-extension ./agent-superpowers-1.1.0.vsix

# Publish
vsce publish

# Update for next version
# 1. Update CHANGELOG.md
# 2. Update version in package.json
# 3. git commit + tag + push
# 4. vsce publish
```

---

## Marketplace Policies 📋

Before publishing, ensure your extension complies:

- ✅ **No malware** — Extension doesn't harm users or systems
- ✅ **No unwanted telemetry** — Users control what data is shared
- ✅ **Clear licensing** — MIT license disclosed
- ✅ **Works offline** — Doesn't require external servers for core features
- ✅ **No deceptive practices** — Description matches functionality
- ✅ **Respects user privacy** — No scanning or transmitting user files without consent

---

## Support & Help 📞

### VSCE Documentation

- https://code.visualstudio.com/api/working-with-extensions/publishing-extension

### VS Code API

- https://code.visualstudio.com/api

### Marketplace

- https://marketplace.visualstudio.com

### Community

- GitHub Discussions: https://github.com/aliabbaschadhar/agent-superpowers/discussions
- Stack Overflow: Tag `vscode` or `vscode-extension`

---

## Checklist for Each Release 🎯

Before publishing, verify:

- [ ] CHANGELOG.md updated with new version
- [ ] package.json version bumped (if manual)
- [ ] `bun run type-check` passes
- [ ] `bun run lint` passes
- [ ] `bun run compile` succeeds
- [ ] Local `.vsix` test passes
- [ ] README links are valid
- [ ] Icon exists and displays correctly
- [ ] No console.log or debugging code left
- [ ] Security review: no unvalidated user input
- [ ] `vsce publish` succeeds
- [ ] Marketplace page displays correctly (5-10min wait)
- [ ] Version bump is correct (major/minor/patch)

---

## Success Metrics 📊

Track these after launch:

| Metric                    | Target | Check                 |
| ------------------------- | ------ | --------------------- |
| Installs in first month   | 100+   | Marketplace dashboard |
| Average rating            | 4.0+   | Marketplace page      |
| Open issues (critical)    | <5     | GitHub issues         |
| Response time to issues   | <48h   | GitHub issues         |
| Time to fix critical bugs | <24h   | Release dates         |

---

**Ready to ship? Let's go! 🚀**

Feel free to reference this checklist for every release cycle.
