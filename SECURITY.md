# Security Policy

## Security & Privacy Commitment

**AI Agent Superpowers** prioritizes user security and privacy. This document explains our security model and how to report vulnerabilities.

---

## Security Features

### ✅ What We Protect

- **No data collection** — Extension doesn't collect, analyze, or transmit user data
- **No telemetry** — No usage tracking, analytics, or crash reporting
- **No home directory scanning** — Skills are only read/written to configured paths
- **Offline-first** — All 940+ skills bundled locally; works without internet
- **Read-only skills** — Skill content is static Markdown — no code execution
- **Sandboxed operation** — Only accesses files in agent-specific directories
- **Stable APIs only** — No proposed or experimental VS Code APIs used

### ✅ What We Don't Do

- ❌ Send any data to external servers
- ❌ Track user behavior or activity
- ❌ Scan user files without explicit action
- ❌ Execute arbitrary code from skills
- ❌ Store authentication tokens or keys
- ❌ Access system secrets or environment variables
- ❌ Modify files outside configured skill directories
- ❌ Use experimental or unstable VS Code APIs

---

## File Safety

### Skill Installation

Skills are installed to agent-specific directories:

| Agent          | Location                                               | Access Level               |
| -------------- | ------------------------------------------------------ | -------------------------- |
| Claude Code    | `~/.claude/skills/{id}/SKILL.md`                       | Read-only instruction file |
| Gemini CLI     | `~/.gemini/skills/{id}/SKILL.md`                       | Read-only instruction file |
| Cursor         | `.cursor/rules/{id}.mdc` or `~/.cursor/rules/{id}.mdc` | Read-only instruction file |
| GitHub Copilot | `.github/copilot-instructions.md`                      | Appended (idempotent)      |
| Generic        | User-specified path                                    | Read-only instruction file |

**What's NOT written:**

- ✅ No executable code
- ✅ No shell scripts
- ✅ No configuration binaries
- ✅ No system-level modifications
- ✅ Your existing agent config is never deleted

### Overwrite Protection

When installing a skill that would overwrite an existing file, the extension:

1. Shows a confirmation dialog (by default)
2. Backs up the existing file (in future versions)
3. Only proceeds with explicit user confirmation

---

## Content Safety

### Skill Vetting

Skills are categorized by risk level:

| Risk Level     | Definition                                | Examples                                  |
| -------------- | ----------------------------------------- | ----------------------------------------- |
| **Safe** 🟢    | Read-only knowledge; no system access     | `react-patterns`, `api-design-principles` |
| **Unknown** 🟡 | May request system access (judgment call) | Security audits, DevOps automation        |
| **None** ⚪    | Not yet rated                             | New or niche skills                       |

**Important:** Risk level is an indicator, not a guarantee. Always preview a skill before installing to judge its appropriateness for your use case.

### Third-Party Skills

- All bundled skills are from open-source repositories
- We verify skill content for harmful code before bundling
- Remote-synced skills come from curated sources
- Local skills (_via `aiSkills.localSkillsPath`_) are your responsibility

---

## Reporting Security Vulnerabilities

### If You Find a Vulnerability

Please **do not** file a public GitHub issue. Instead:

1. **Email the maintainer** with:
   - Description of the vulnerability
   - How it can be reproduced
   - Potential impact
   - Your suggested fix (if applicable)

2. Include:
   - Your name (optional)
   - Your contact info (for follow-up)
   - Timeline for your disclosure

3. **Wait for response** (typically within 48 hours for critical issues)

### What Happens Next

- We will acknowledge receipt of your report
- We will work on a fix and create a patch release
- We will credit you in the security advisory (if you consent)
- We will release the fix publicly with details

### Scope

We take security seriously for:

- Extension code (TypeScript in `src/`)
- Installer implementations (file operations)
- Agent detection logic
- Configuration handling
- Skill index processing

---

## Dependency Security

### Runtime Dependencies

- **Fuse.js** — Fuzzy search library (MIT license, actively maintained)
  - No external API calls
  - Pure JavaScript, no binary dependencies
  - Regular security audits

### Development Dependencies

- All dev dependencies are from official npm registry
- We use `npm audit` to check for known vulnerabilities
- Automated dependabot checks on GitHub

### Audit Commands

```bash
# Check for vulnerabilities
npm audit

# Install and audit
bun install
bun audit
```

---

## Privacy Best Practices

### What We Access

- ✅ Skill directories specified in settings
- ✅ Your `package.json` (for tech detection)
- ✅ Your local skill folders (if configured)
- ✅ Marketplace cache (local storage)

### What We Don't Access

- ❌ Other user files or folders
- ❌ Git history or commit messages
- ❌ Environment variables
- ❌ System files or registry
- ❌ Other extensions' data

### Data in Motion

- All network requests use HTTPS
- Remote sync fetches skills from GitHub raw content
- Cache is stored locally in extension storage
- No personally identifiable information is transmitted

---

## Version Pinning & Stability

- **Minimum VS Code**: `^1.85.0` — Latest LTS at release
- **TypeScript**: `5.x` — Latest stable
- **Fuse.js**: Latest stable version
- **No beta or experimental APIs** — Only stable VS Code APIs used

---

## Security Contacts

| Issue Type             | Contact                    | Response Time |
| ---------------------- | -------------------------- | ------------- |
| Security vulnerability | Check GitHub owner profile | < 48 hours    |
| Safety concern         | Open GitHub issue          | / < 72 hours  |
| Privacy question       | GitHub discussion or issue | < 1 week      |

---

## Security Updates

- We will patch critical vulnerabilities within 24 hours
- Security patches are released as `.patch` versions (1.1.X)
- Security advisories are published on GitHub
- Users are notified via VS Code's automatic update system

---

## Compliance

- ✅ GDPR compliant — No personal data collection
- ✅ CCPA compliant — No personal data sharing
- ✅ MIT license — Open source and auditable
- ✅ VS Code TOS — Complies with extension marketplace policies

---

## Future Security Improvements

We're planning:

- [ ] Skill content signature verification (v1.3.0)
- [ ] Automated security scanning for skill submissions
- [ ] Two-factor authentication for contributor accounts
- [ ] Regular third-party security audits

---

## Thank You

We appreciate the security research community for their vigilance and responsible disclosure practices. Your reports help keep AI Agent Superpowers safe for everyone.

**Stay secure! 🔐**
