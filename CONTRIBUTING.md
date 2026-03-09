# Contributing

Thanks for contributing to AI Agent Superpowers!

## Ways to Help

- **Bug reports** — [Open an issue](https://github.com/aliabbaschadhar/agent-superpowers/issues/new) with VS Code version, extension version, steps to reproduce, and the Output panel log (`View → Output → AI Agent Skills`).
- **Feature requests** — [Start a discussion](https://github.com/aliabbaschadhar/agent-superpowers/discussions) describing the problem and proposed solution.
- **Code changes** — Fork → branch → change → PR (see below).
- **New skills** — Add a folder under `assets/skills/<skill-id>/SKILL.md`, run `bun run scripts/prebuild.js`, then submit a PR.

## Development Setup

```bash
bun install
bun run compile:watch   # watch mode
bun run type-check      # type check
bun run lint            # lint & auto-fix
```

## Making a Change

1. Fork and `git checkout -b feat/my-feature` (or `fix/...`)
2. Make changes — keep functions ≤ 60 lines, use `log()` not `console.log`
3. `bun run type-check && bun run lint`
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
5. Open a PR — describe _what_ and _why_, link related issues (`Fixes #123`)

## Adding a New Skill

```bash
mkdir -p assets/skills/my-skill-id
# Write assets/skills/my-skill-id/SKILL.md
bun run scripts/prebuild.js   # regenerate index
```

Skill guidelines: focused on one domain, prescriptive, include code examples, 500–2000 words, plain Markdown, no executable code.

## New Commands

1. Create `src/commands/<verbNoun>.ts` exporting `register<VerbNoun>Command()`
2. Add to `package.json` → `contributes.commands` (and `menus` if needed)
3. Register in `extension.ts` `activate()`, push to `context.subscriptions`
4. Add entry to `CHANGELOG.md` under `[Unreleased]`

## Questions?

[GitHub Discussions](https://github.com/aliabbaschadhar/agent-superpowers/discussions)
