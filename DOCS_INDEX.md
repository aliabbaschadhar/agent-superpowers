# Documentation Index

This document is a guide to all documentation files in the **AI Agent Superpowers** repository.

---

## For Marketplace

If you're viewing this extension on the **VS Code Marketplace**, start here:

### Essential Reading

1. **[README.md](README.md)** — Everything you need to know
   - What the extension does
   - How to use it (3 different ways)
   - Feature overview
   - Configuration options
   - FAQ & troubleshooting

2. **[CHANGELOG.md](CHANGELOG.md)** — What's new and what's coming
   - Release history with detailed notes
   - Upcoming features in v1.2.0
   - Bug fixes and improvements

---

## For Developers & Contributors

Want to help improve the extension or create new skills?

### Getting Started

1. **[CONTRIBUTING.md](CONTRIBUTING.md)** — How to contribute
   - Report bugs
   - Suggest features
   - Create new skills
   - Improve code & documentation
   - Step-by-step PR workflow

2. **[.agent/](../../.agent/)** — Project guidelines & architecture (internal use)
   - `SYSTEM_PROMPT.md` — Project identity, stack, layout
   - `AGENT_RULES.md` — Code style, security, commit conventions
   - `architecture.md` — Full software architecture
   - `context.md` — Current work log and decisions
   - `plan.md` — What's planned, implementation guides
   - `prd.md` — Product requirements and success metrics

### Local Development

```bash
# Setup
bun install
bun run compile:watch

# Quality checks
bun run type-check
bun run lint

# Build for release
bun run compile
```

---

## For Publishers & Release Managers

Planning to publish or update this extension?

### Publishing to Marketplace

1. **[MARKETPLACE_SUBMISSION.md](MARKETPLACE_SUBMISSION.md)** — Complete publishing guide
   - Pre-submission checklist
   - Step-by-step submission process
   - Post-publication steps
   - Versioning strategy
   - Troubleshooting common issues

### Quick Checklist

Before publishing:

- [ ] `bun run type-check` passes
- [ ] `bun run lint` passes
- [ ] CHANGELOG.md updated
- [ ] Version in package.json bumped
- [ ] README links are valid
- [ ] Icon `media/icon.png` exists

Then:

```bash
bun run compile
vsce publish
```

---

## For Security & Compliance

### Security & Privacy

1. **[SECURITY.md](SECURITY.md)** — Security, privacy, vulnerability reporting
   - Security features and commitments
   - What data we do/don't collect
   - File safety and permissions
   - How to report vulnerabilities
   - Compliance info (GDPR, CCPA)

2. **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** — Community standards
   - Expected behavior
   - How to report violations
   - Enforcement process

---

## File Map

Here's where everything is:

```
README.md                       ← Start here (users)
CHANGELOG.md                    ← Release notes & roadmap
CONTRIBUTING.md                 ← How to contribute
MARKETPLACE_SUBMISSION.md       ← Publishing guide
LICENSE                         ← MIT License
DOCS_INDEX.md                   ← This file

src/                            ← TypeScript source code
  extension.ts                  ← Entry point
  commands/                     ← Commands
  skills/                       ← Core data layer
  installers/                   ← Agent installers
  tree/                         ← Sidebar tree UI

assets/
  skills/
    react-patterns/            ← Example skill
      SKILL.md
    api-design-principles/
      SKILL.md
    ... 940+ more skills ...

media/
  icon.png                      ← Extension icon

.agent/                         ← Development guidelines (internal)
  SYSTEM_PROMPT.md
  AGENT_RULES.md
  architecture.md
  context.md
  plan.md
  prd.md
```

---

## FAQ — Which Document Should I Read?

| You are...                               | Read this                                                                      | Time   |
| ---------------------------------------- | ------------------------------------------------------------------------------ | ------ |
| **A user discovering the extension**     | [README.md](README.md)                                                         | 5 min  |
| **A user with a problem**                | [README.md FAQ & Troubleshooting](README.md#faq)                               | 2 min  |
| **A user who wants to install skills**   | [README.md Usage Guide](README.md#usage-guide)                                 | 3 min  |
| **A developer wanting to contribute**    | [CONTRIBUTING.md](CONTRIBUTING.md)                                             | 10 min |
| **A developer creating a new skill**     | [CONTRIBUTING.md § Create Skills](CONTRIBUTING.md#3-create-or-improve-skills-) | 15 min |
| **A developer improving code**           | [CONTRIBUTING.md § Improve Code](CONTRIBUTING.md#4-improve-code-)              | 10 min |
| **A publisher releasing to marketplace** | [MARKETPLACE_SUBMISSION.md](MARKETPLACE_SUBMISSION.md)                         | 15 min |
| **An architect reviewing the project**   | [.agent/architecture.md](../../.agent/architecture.md)                         | 20 min |

---

## Quick Links

### Usage & Support

- 🎯 **[Install the extension](https://marketplace.visualstudio.com/items?itemName=aliabbaschadhar.agent-superpowers)** on VS Code Marketplace
- 📖 **[Read the README](README.md)** for features and usage
- ❓ **[FAQ Section](README.md#faq)** for common questions
- 🐛 **[Report bugs](https://github.com/aliabbaschadhar/agent-superpowers/issues/new)** on GitHub
- 💬 **[Ask questions](https://github.com/aliabbaschadhar/agent-superpowers/discussions)** on GitHub Discussions

### Development

- 🔧 **[CONTRIBUTING.md](CONTRIBUTING.md)** to get started
- 👀 **[GitHub repository](https://github.com/aliabbaschadhar/agent-superpowers)** to explore code
- ⭐ **[Star the repo](https://github.com/aliabbaschadhar/agent-superpowers)** to show support
- 📝 **[Create a new issue](https://github.com/aliabbaschadhar/agent-superpowers/issues)** to suggest features

### Publishing

- 📤 **[MARKETPLACE_SUBMISSION.md](MARKETPLACE_SUBMISSION.md)** for publishing
- 🔐 **[.agent/AGENT_RULES.md](../../.agent/AGENT_RULES.md)** for code standards before release

---

## Document Purposes At a Glance

### README.md

**Purpose:** User-facing documentation  
**Audience:** Everyone (users, developers, marketplace browsers)  
**Content:** Features, usage, configuration, FAQ, troubleshooting  
**Tone:** Friendly, practical, encouraging

### CHANGELOG.md

**Purpose:** Release history and roadmap  
**Audience:** Users, developers, release managers  
**Content:** What's new in each version, what's coming  
**Tone:** Professional, detailed, organized

### CONTRIBUTING.md

**Purpose:** Contribution guidelines  
**Audience:** Developers, skill creators, community contributors  
**Content:** How to report bugs, suggest features, create skills, write code, open PRs  
**Tone:** Welcoming, clear, step-by-step

### MARKETPLACE_SUBMISSION.md

**Purpose:** Publishing and release management  
**Audience:** Maintainers, release managers  
**Content:** Pre-submission checklists, publishing steps, versioning strategy  
**Tone:** Technical, procedural, thorough

### DOCS_INDEX.md (This File)

**Purpose:** Navigation and orientation  
**Audience:** All users  
**Content:** Overview of all docs, quick navigation, FAQ  
**Tone:** Concise, helpful, summarizing

### .agent/\*.md (Internal)

**Purpose:** Development guidelines and architectural documentation  
**Audience:** AI agents working on the codebase  
**Content:** Code style, architecture, current context, plans  
**Tone:** Technical, directive, comprehensive

---

## Version History of This Index

| Date       | Change                                                   |
| ---------- | -------------------------------------------------------- |
| 2026-03-09 | Created this index file, added MARKETPLACE_SUBMISSION.md |
| 2026-03-08 | Added CONTRIBUTING.md                                    |
| 2026-03-06 | Initial README and CHANGELOG                             |

---

## Need Help?

- 📖 **Start with [README.md](README.md)** for general questions
- 🆘 **Check [Troubleshooting](README.md#troubleshooting)** if something isn't working
- 🐛 **[Open an issue](https://github.com/aliabbaschadhar/agent-superpowers/issues)** for bugs
- 💡 **[Start a discussion](https://github.com/aliabbaschadhar/agent-superpowers/discussions)** for ideas & questions
- 🤝 **[Read CONTRIBUTING.md](CONTRIBUTING.md)** to help improve the project

---

**Last updated:** 2026-03-09  
**For:** AI Agent Superpowers v1.1.0
