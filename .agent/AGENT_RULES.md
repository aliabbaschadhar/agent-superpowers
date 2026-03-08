# Agent Rules

Rules and constraints that govern all AI agent interactions within this project.

---

## General Behavior

1. **Stay in scope.** Only modify files relevant to the task at hand. Do not refactor unrelated code.
2. **TypeScript only.** All source code lives in `src/` and must be TypeScript. Never write plain `.js` files inside `src/`.
3. **No silent failures.** Every error or exception must be explicitly handled — log it with the `log()` helper from `src/logger.ts` or surface it via `vscode.window.showErrorMessage`.
4. **Bundled assets are read-only at runtime.** Files under `assets/` are generated at build time by `scripts/prebuild.js`. Do not write to them programmatically.
5. **Disposable everything.** Any VS Code resource that can leak (event listeners, webview panels, watchers) must be pushed onto `context.subscriptions`.

---

## Code Style

- Follow the ESLint config in `eslint.config.mjs`.  
- Use `async/await` over raw Promises.  
- Prefer `const` over `let`; never use `var`.  
- Keep functions ≤ 60 lines. Extract helpers if needed.  
- No `console.log` — use `log()` from `src/logger.ts`.

---

## File Naming Conventions

| Location | Convention |
|---|---|
| `src/commands/` | camelCase verb+noun (e.g., `installSkill.ts`) |
| `src/skills/` | PascalCase class names (e.g., `SkillsManager.ts`) |
| `src/installers/` | PascalCase agent name + "Installer" |
| `src/tree/` | PascalCase, suffix Provider/Node |
| `.agent/` | SCREAMING_SNAKE_CASE `.md` |

---

## Testing

- Tests live in `test/` and must pass `bun run type-check` before committing.
- New commands must have at least a smoke-test that exercises the happy path.
- Use `@vscode/test-electron` for integration tests.

---

## Commits & PRs

- Commit messages follow **Conventional Commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- Update `CHANGELOG.md` under `[Unreleased]` for every user-visible change.
- Do not bump `package.json` version manually — CI handles semver bumping.

---

## Security

- Never log or persist API keys, tokens, or user file contents.
- Skill content displayed in a webview must be escaped / rendered as plain text, not injected as raw HTML.
- File paths provided by users must be resolved with `path.resolve` and validated before any I/O.
