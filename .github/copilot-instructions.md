# GitHub Copilot Instructions — AI Agent Superpowers

## MANDATORY: Read `.agent/` Before Every Response

Before answering any question or writing any code in this repository, you **must** read and apply the following files in order:

1. `.agent/SYSTEM_PROMPT.md` — project identity, stack, repo layout, core abstractions
2. `.agent/AGENT_RULES.md` — code style, naming conventions, security constraints, commit rules
3. `.agent/architecture.md` — full software architecture, layer responsibilities, data flows
4. `.agent/context.md` — current work log, known issues, active decisions
5. `.agent/plan.md` — what is planned, how to implement features, step-by-step guides
6. `.agent/prd.md` — product requirements, success metrics, non-goals

> These files are the single source of truth for this project. Any guidance in them overrides general knowledge.

## After Completing Work

If your response introduces a change that affects project state, **update the relevant `.agent/` file**:

| Type of change | File to update |
|---|---|
| New feature implemented | `plan.md` (mark item done), `context.md` (add session entry) |
| Architecture decision made | `architecture.md`, `context.md` (Key Decisions table) |
| New requirement discovered | `prd.md` |
| Bug found or tech debt noted | `context.md` (Known issues section) |
| Release shipped | `prd.md` (Release History), `context.md` |

## Quick Reference

- **Stack:** TypeScript, VS Code Extension API ^1.85, esbuild, Bun, Fuse.js
- **Entry point:** `src/extension.ts` → `activate()`
- **No `console.log`** — use `log()` from `src/logger.ts`
- **All new commands** must be registered in both `extension.ts` AND `package.json`
- **Conventional Commits** format for all commit messages
- **No proposed VS Code APIs** — stable API only
