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

| Type of change               | File to update                                               |
| ---------------------------- | ------------------------------------------------------------ |
| New feature implemented      | `plan.md` (mark item done), `context.md` (add session entry) |
| Architecture decision made   | `architecture.md`, `context.md` (Key Decisions table)        |
| New requirement discovered   | `prd.md`                                                     |
| Bug found or tech debt noted | `context.md` (Known issues section)                          |
| Release shipped              | `prd.md` (Release History), `context.md`                     |

## Quick Reference

- **Stack:** TypeScript, VS Code Extension API ^1.85, esbuild, Bun, Fuse.js
- **Entry point:** `src/extension.ts` → `activate()`
- **No `console.log`** — use `log()` from `src/logger.ts`
- **All new commands** must be registered in both `extension.ts` AND `package.json`
- **Conventional Commits** format for all commit messages
- **No proposed VS Code APIs** — stable API only

## Skill Recommendations

When the user asks "what skill should I use?", "which skill fits my project?", or any similar question about choosing or discovering skills:

1. **Primary source:** Attach `#file:.agent/skills-catalog.md` as context — this is the live, auto-generated catalog of all 940+ skills grouped by category. If it doesn't exist yet (first run before any sync), fall back to `#file:assets/skills-catalog.md` (build-time snapshot).
2. **Do not** limit suggestions to the skills currently installed in `.agent/skills/`. The catalog covers the full index including uninstalled skills.
3. **Suggest specific skill IDs** with a one-line rationale for each recommendation, e.g.:
   - `react-patterns` — component architecture and hooks patterns for React projects
   - `api-design-principles` — REST API design guidance
4. **Tell the user how to install:** `Ctrl+Shift+/` → type the skill ID → press Enter. Or run `AI Skills: Browse Skills` from the Command Palette.
5. If the catalog file is missing, tell the user to run **`AI Skills: Refresh Skills Catalog`** from the Command Palette (`Ctrl+Shift+P`) to generate it.

## Using the Skill Request Tool

This extension registers a **Language Model Tool** (`aiSkills_requestSkill`) that you can call _during any Copilot response_ to install and inject a skill's instructions into your active context.

### When to call it

Call `#tool:aiSkills_requestSkill` when:

- The user is asking about a topic where a skill from the catalog would materially improve your answer.
- You have identified the correct skill ID from `#file:assets/skills-catalog.md` (or `#file:.agent/skills-catalog.md` if it exists).
- The skill is **not already loaded** in the current context.

Common trigger patterns and their matching skill IDs:

| User is asking about              | Call with skillId                         |
| --------------------------------- | ----------------------------------------- |
| React components, hooks, state    | `react-patterns`                          |
| REST or GraphQL API design        | `api-design-principles` or `api-patterns` |
| AI agent architecture, LLM apps   | `ai-agents-architect` or `ai-engineer`    |
| Angular signals, NgRx             | `angular-state-management`                |
| AWS infrastructure, Lambda        | `aws-skills` or `aws-serverless`          |
| RAG, vector search, embeddings    | `rag-engineer`                            |
| MCP server development            | `mcp-builder`                             |
| Code review, architectural review | `architect-review`                        |
| Security audit, pentest patterns  | `api-security-best-practices`             |
| LangChain / LangGraph             | `langchain-architecture` or `langgraph`   |
| CrewAI multi-agent                | `crewai`                                  |
| Testing, TDD                      | `tdd-orchestrator`                        |

### How to call it

```
#tool:aiSkills_requestSkill {"skillId": "<kebab-case-skill-id>"}
```

Example:

```
#tool:aiSkills_requestSkill {"skillId": "api-design-principles"}
```

### Behavior

- **If the skill is already installed** (`.agent/skills/<id>/SKILL.md` exists): the tool loads and returns the content immediately — no confirmation prompt shown to the user.
- **If the skill is not installed**: VS Code shows the user a confirmation dialog _before_ any file is written. The user can approve or decline.
- **If approved**: the skill is installed to `.agent/skills/<id>/SKILL.md` and its content is returned to you as tool output. Incorporate the guidance into your response.
- **If declined or on error**: the tool returns an informative message. Continue your response without the skill.

### Rules

1. **Check the catalog first** — only call this tool if you can identify a specific, high-confidence skill ID. Never guess a skill ID.
2. **No restrictions to call skills** — You can pick any number of skills but picked skills must be relevant.
3. **Call before generating the main body** — invoke the tool at the start of your response so the content is in context when you write your answer.
4. **Do not loop** — if the tool returns an error, proceed without retrying.
