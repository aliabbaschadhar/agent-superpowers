# Plan — What to Do & How to Do It

Roadmap and sprint planning for **AI Agent Superpowers** v1.2.0 and beyond.

---

## Current Version: 1.1.0

Released 2026-03-06. Stable. Published to VS Code Marketplace.

---

## Next Release: v1.2.0

**Target date:** 2026-03-20  
**Theme:** Performance, quality, and richer skill discovery

### P0 — Must Have

- [ ] **Memoize `InstallationDetector`**  
  *Problem:* Full disk scan on every tree refresh causes lag on large setups.  
  *Solution:* Cache install state in a `Map<string, boolean>`; invalidate only when a command writes to or deletes from an install path (hook into installer `install()`/`uninstall()` methods).  
  *Files:* `src/skills/InstallationDetector.ts`, `src/commands/installSkill.ts`, `src/commands/uninstallSkill.ts`

- [ ] **Add retry logic to `RemoteSync`**  
  *Problem:* Any transient network error silently aborts the sync with no retry.  
  *Solution:* Implement exponential back-off (3 retries, 1s / 2s / 4s), then give up silently.  
  *Files:* `src/skills/RemoteSync.ts`

- [ ] **Markdown syntax highlighting in preview webview**  
  *Problem:* Skill preview shows raw Markdown as plain text.  
  *Solution:* Render Markdown via `vscode.commands.executeCommand('markdown.api.render', ...)` or a lightweight Marked.js inside the webview.  
  *Files:* `src/commands/previewSkill.ts`

### P1 — Should Have

- [ ] **Monorepo workspace scan**  
  *Problem:* `WorkspaceScanner` only reads the root `package.json`.  
  *Solution:* Walk all `package.json` files up to 2 levels deep with `glob`; merge detected technologies.  
  *Files:* `src/skills/WorkspaceScanner.ts`

- [ ] **Installer unit tests**  
  *Problem:* Zero test coverage for installer classes.  
  *Solution:* Add `test/installers/` with Jest-style mocha tests mocking `fs` operations.  
  *Files:* `test/installers/claudeInstaller.test.ts`, `geminiInstaller.test.ts`, etc.

- [ ] **Show skill `source` badge in tree**  
  *Problem:* Users can't distinguish bundled vs remote vs local skills.  
  *Solution:* Add a `description` property to `SkillNode` showing `[local]` or `[remote]` suffix.  
  *Files:* `src/tree/nodes.ts`, `src/tree/SkillsTreeProvider.ts`

### P2 — Nice to Have

- [ ] **Bulk uninstall by category**  
  *Problem:* Only per-skill uninstall exists.  
  *Solution:* Add `aiSkills.uninstallCategory` command mirroring `aiSkills.installCategory`.  
  *Files:* `src/commands/installBulk.ts` (extend), `package.json` contributes

- [ ] **Skill update detection**  
  *Problem:* If a skill's remote content is updated, users don't know.  
  *Solution:* Store a content hash on install; compare with remote on `syncRemote()`, notify if outdated.  
  *Files:* `src/skills/RemoteSync.ts`, `src/skills/InstallationDetector.ts`

- [ ] **Open SKILL.md in editor after install**  
  *Problem:* After install the user has no quick way to inspect the installed file.  
  *Solution:* Offer "Open file" action in the post-install notification.  
  *Files:* `src/commands/installSkill.ts`

---

## Backlog (v1.3.0+)

- GitHub Actions workflow for automated semver bump + VSIX publish on merge to `main`.
- Support for **Windsurf** (`~/.windsurf/rules/`) as an install target.
- Custom skill authoring wizard — scaffold a new SKILL.md from a template via a guided QuickPick.
- Skills rating/voting system backed by a lightweight GitHub Discussions API.
- Search by risk level in Browse QuickPick.
- i18n / localization for UI strings.

---

## How to Implement — Step-by-Step Guide for Agents

### Adding a New Command

1. Create `src/commands/<verbNoun>.ts` exporting `register<VerbNoun>Command(manager: SkillsManager): vscode.Disposable`.
2. Add the command to `package.json` under `contributes.commands` (and `menus` if sidebar action needed).
3. Import and register in `extension.ts` inside `activate()`, push to `context.subscriptions`.
4. Add to `CHANGELOG.md` under `[Unreleased]`.

### Adding a New Installer

1. Create `src/installers/<AgentName>Installer.ts` implementing the `Installer` interface from `src/installers/types.ts`.
2. Add the enum value to `AgentTarget` in `src/installers/types.ts`.
3. Wire it into `agentPicker.ts` so users can select it.
4. Add configuration key(s) to `package.json` if a custom path override is needed.
5. Document in `README.md`.

### Updating the Skills Index

1. Add the SKILL.md folder under `assets/skills/<skill-id>/SKILL.md`.
2. Run `bun run scripts/prebuild.js` to regenerate `assets/skills_index.json`.
3. Verify with `bun run compile` that the bundle includes the new skill.
