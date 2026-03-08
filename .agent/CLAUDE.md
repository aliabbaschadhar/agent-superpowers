# Claude Code — Project Instructions

## MANDATORY: Consult `.agent/` Before Every Response

This repository contains authoritative agent context files. **Read them before doing anything else.**

```
@.agent/SYSTEM_PROMPT.md
@.agent/AGENT_RULES.md
@.agent/architecture.md
@.agent/context.md
@.agent/plan.md
@.agent/prd.md
```

> Use the `@filename` syntax in your thinking to pull in each file. They override all general knowledge about this codebase.

## After Completing Work — Update `.agent/`

| Change made | Update this file |
|---|---|
| Feature added / task completed | `.agent/plan.md` (check off item), `.agent/context.md` (session log) |
| Architecture changed | `.agent/architecture.md` + `.agent/context.md` |
| New requirement or scope change | `.agent/prd.md` |
| Bug, edge case, or tech debt | `.agent/context.md` (Known issues) |
| New key decision | `.agent/context.md` (Key Decisions table) |

## Critical Rules (from `.agent/AGENT_RULES.md`)

- TypeScript only in `src/` — no plain `.js` files
- Never use `console.log` → use `log()` from `src/logger.ts`
- All VS Code resources must be pushed onto `context.subscriptions`
- New commands must appear in both `extension.ts` AND `package.json`
- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- Never log or persist user file contents or tokens

## Skill Invocation

This project manages AI agent skills. When implementing features related to skills, invoke:
- `/app-builder` for full-feature implementation
- `/architect-review` for architecture questions
- `/api-design-principles` for new command/API surface design
