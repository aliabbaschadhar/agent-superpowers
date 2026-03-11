# Security Policy

## Privacy & Safety Guarantees

- **No telemetry** — no data collected, tracked, or transmitted
- **No home directory scanning** — only touches configured agent paths
- **Offline-first** — 940+ skills bundled locally
- **No code execution** — skills are static Markdown instruction files
- **Stable VS Code APIs only** — no proposed or experimental APIs

## Skill Install Paths

| Agent          | Path                              | Type                  |
| -------------- | --------------------------------- | --------------------- |
| Claude Code    | `~/.claude/skills/{id}/SKILL.md`  | Instruction file      |
| Gemini CLI     | `~/.gemini/skills/{id}/SKILL.md`  | Instruction file      |
| Cursor         | `.cursor/rules/{id}.mdc`          | Instruction file      |
| GitHub Copilot | `.github/copilot-instructions.md` | Appended (idempotent) |
| Generic        | User-specified path               | Instruction file      |

Nothing executable is ever written. Existing agent config is never deleted.

## Skill Risk Levels

| Level          | Meaning                                               |
| -------------- | ----------------------------------------------------- |
| **Safe** 🟢    | Read-only knowledge, no system access                 |
| **Unknown** 🟡 | May request system access — preview before installing |
| **None** ⚪    | Not yet rated                                         |

Always preview a skill before installing (`👁️` button in sidebar).

## Reporting a Vulnerability

**Do not file a public GitHub issue.** Instead:

1. Email/contact the maintainer privately (see GitHub profile)
2. Include: description, reproduction steps, potential impact
3. Expect a response within 48 hours for critical issues

We will patch critical vulnerabilities within 24 hours and release a `.patch` version.

## Dependency Audit

```bash
npm audit   # or: bun audit
```

Runtime dependencies: **Fuse.js** only (MIT, no external API calls).
