# Contributing to AI Agent Superpowers

Thank you for your interest in contributing! This document outlines how you can help improve AI Agent Superpowers.

## Ways to Contribute

### 1. **Report Bugs** 🐛

Found a problem? Help us fix it!

- **Check existing issues first** — Your bug may already be reported
- **Be specific** — Include:
  - VS Code / Cursor version (`code --version`)
  - Extension version (shown in Extensions panel)
  - Steps to reproduce
  - Expected vs actual behavior
  - Screenshots/videos if helpful
  - Output log (View → Output → select "AI Agent Skills")

**Open an issue:** [GitHub Issues](https://github.com/aliabbaschadhar/agent-superpowers/issues/new)

### 2. **Suggest Features** 💡

Have an idea to improve the extension?

- **Browse open issues first** — Check for related feature requests
- **Describe the problem** — What's the use case? Who benefits?
- **Propose a solution** — Sketch how it could work
- **Discuss tradeoffs** — What are pros/cons?

**Start a discussion:** [GitHub Discussions](https://github.com/aliabbaschadhar/agent-superpowers/discussions)

### 3. **Create or Improve Skills** 📚

Skills are the heart of this extension. Help build the library!

#### Structure of a Skill

Each skill is a folder containing a single `SKILL.md` file:

```
assets/skills/my-skill-id/
└── SKILL.md          ← The instruction file (plain Markdown)
```

#### Anatomy of a SKILL.md

```markdown
# My Awesome Skill

> One-line description of what this skill teaches.

## Overview

Explain the purpose and scope of this skill. When do you use it? What problems does it solve?

## Key Principles

- Core principle 1
- Core principle 2
- Core principle 3

## Best Practices

### Do
- ✅ Recommendation 1
- ✅ Recommendation 2

### Don't
- ❌ Anti-pattern 1
- ❌ Anti-pattern 2

## Examples

### Example 1: Common Use Case

```typescript
// Code example
```

### Example 2: Advanced Pattern

```
More examples...
```

## References

- [External resource 1](https://example.com)
- [External resource 2](https://example.com)

## Tags

- Category: Backend (or AI, Frontend, Security, etc.)
- Risk: safe (or unknown, none)
```

#### Skill Metadata

Every skill has implicit metadata extracted from its folder name:

| Element | Format | Example |
|---------|--------|---------|
| **ID** | kebab-case | `react-patterns` |
| **Category** | Last hyphen-separated segment | `patterns` → category: Frontend |
| **Risk** | Inferred or tagged | `safe` (read-only), `unknown` (judgment), `none` (unrated) |

#### How to Create a Skill

1. **Create the folder** under `assets/skills/`:
   ```bash
   mkdir -p assets/skills/my-skill-id
   ```

2. **Write your SKILL.md** with Markdown instructions:
   ```bash
   cat > assets/skills/my-skill-id/SKILL.md << 'EOF'
   # My Skill
   
   > Description here
   
   ## Content
   ...
   EOF
   ```

3. **Validate your skill** (coming in v1.2.0):
   ```bash
   bun run validate-skills
   ```

4. **Test locally**:
   - Run `bun run compile` to bundle
   - Reload the extension in VS Code
   - Search for your skill in the sidebar

5. **Submit a PR** (see below)

#### Skill Writing Guidelines

- **Keep it focused** — One skill, one domain of expertise
- **Be prescriptive** — Provide clear patterns, not vague advice
- **Include examples** — Code examples are powerful
- **Stay concise** — 500-2000 words is ideal
- **Use Markdown** — Headers, lists, code blocks, links
- **No executable code** — Skills are instruction files, not scripts
- **Be helpful** — Assume the AI reading this wants to excel

**Example good skill:** [react-patterns](assets/skills/react-patterns/SKILL.md)

### 4. **Improve Code** 🔧

Found a way to make the extension faster, smaller, or clearer?

#### Code Style

- **Language**: TypeScript (all source code in `src/`)
- **Formatter**: ESLint with `eslint.config.mjs`
- **No console.log** — Use `log()` from `src/logger.ts`
- **Type safety** — All exports must be typed
- **Comments** — Add comments for non-obvious logic
- **Function size** — Keep functions under 60 lines

#### Development Setup

```bash
# Install dependencies
bun install

# Compile (watch mode)
bun run compile:watch

# Type check
bun run type-check

# Lint
bun run lint

# Build for release
bun run compile
```

#### File Structure

```
src/
  extension.ts           ← Entry point
  commands/              ← One file per command
  skills/                ← Core data layer
  installers/            ← Agent-specific installers
  tree/                  ← Sidebar tree UI
  logger.ts              ← Logging utility
  constants.ts           ← Magic strings
  editorDetector.ts      ← Cursor vs VS Code detection
  favoriteSkills.ts      ← GlobalState persistence
  recentSkills.ts        ← GlobalState persistence
```

#### Making a Change

1. **Fork the repository**: Click "Fork" on GitHub
2. **Create a branch**: `git checkout -b fix/my-fix` or `feat/my-feature`
3. **Make changes**: Edit files, test locally
4. **Type check**: `bun run type-check`
5. **Lint**: `bun run lint` (auto-fixes most issues)
6. **Commit**: Use [Conventional Commits](#conventional-commits) format
7. **Push**: `git push origin fix/my-fix`
8. **Open a PR**: Describe your change clearly

### 5. **Improve Documentation** 📖

Help others understand how to use the extension!

- **README improvements** — Clearer explanations, better examples
- **Skill descriptions** — Better one-liner summaries
- **Comments in code** — Explain complex logic
- **FAQ entries** — Common questions and answers
- **Changelog updates** — Summarize changes for users

---

## Submission Process

### For Bug Reports & Feature Requests

1. **[Open an issue](https://github.com/aliabbaschadhar/agent-superpowers/issues/new)**
2. **Use the template** provided (if available)
3. **Be clear and specific**
4. **Wait for feedback** — Maintainer may ask clarifying questions
5. **Help with the fix** — If able, consider submitting a PR

### For Pull Requests (Code, Skills, Docs)

#### Step 1: Fork & Branch

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR-USERNAME/agent-superpowers.git
cd agent-superpowers
git checkout -b feature/my-feature
# or
git checkout -b fix/my-fix
```

#### Step 2: Make Changes

Edit files, create skills, improve docs. Keep commits small and logical.

#### Step 3: Validate Your Work

```bash
# Type check
bun run type-check

# Lint & auto-fix
bun run lint

# Run validation
bun run validate-skills
```

#### Step 4: Commit with Clear Messages

Follow **[Conventional Commits](#conventional-commits-format)**:

```bash
git add .
git commit -m "feat: add new skill for GraphQL patterns"
git commit -m "fix: improve InstallationDetector performance"
git commit -m "docs: clarify skill writing guidelines"
```

#### Step 5: Push & Open PR

```bash
git push origin feature/my-feature
```

Then open a pull request on GitHub. In the PR description:

- **Title**: Clear, concise summary
- **Description**: What changed and why?
- **References**: Link related issues (`Fixes #123`)
- **Testing**: How did you test this?
- **Screenshots**: Include if UI changed

#### Example PR Description

```
feat: Add Markdown preview to skill panel

Renders SKILL.md with syntax highlighting instead of plain text.

**What changed:**
- Modified `src/commands/previewSkill.ts` to use VS Code's markdown.api.render
- Updated webview stylesheet for better rendering

**Testing:**
- Manually tested with 10+ skills
- Verified code blocks, lists, links render correctly
- Tested on Windows, macOS, Linux

**Fixes #42**
```

#### Step 6: Address Review Comments

Maintainers may suggest changes. Update your branch and push again:

```bash
# Make requested changes
git add .
git commit -m "refactor: address review feedback"
git push origin feature/my-feature
```

Your PR will automatically update.

#### Step 7: Merge

Once approved, a maintainer will merge your PR. You're done! 🎉

---

## Conventional Commits Format

All commit messages should follow this format to keep history clean:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat** – New feature
- **fix** – Bug fix
- **refactor** – Code refactoring (no behavioral change)
- **perf** – Performance improvement
- **test** – Adding or updating tests
- **docs** – Documentation changes
- **chore** – Build, dependency, or tooling changes
- **ci** – CI/CD configuration changes

### Scope (optional)

What part of the code is affected?

- `skills` – Skill data / SkillsManager
- `tree` – Sidebar tree UI
- `commands` – Command implementations
- `installer` – Installation logic
- `perf` – Performance
- `docs` – Documentation

### Examples

```
feat(tree): add favorites section to sidebar

fix(commands): resolve auto-paste timing issue on slow systems

docs: expand FAQ section with common questions

perf(installer): memoize installation detection
```

---

## Code Review Guidelines

When reviewing PRs or being reviewed:

### For Pull Request Authors

- ✅ Keep PRs focused (one feature/fix per PR)
- ✅ Include tests if possible
- ✅ Self-review your code before requesting review
- ✅ Respond to feedback professionally
- ✅ Update the CHANGELOG if user-facing change

### For Reviewers

- ✅ Be constructive and kind
- ✅ Explain why, not just what
- ✅ Suggest improvements, don't demand
- ✅ Ask clarifying questions
- ✅ Approve once satisfied

---

## Project Governance

### Decision Making

- **Small decisions** (typos, minor improvements) — Maintainer decides
- **Medium decisions** (new settings, command changes) — Discussion in issue/PR
- **Large decisions** (architecture, major features) — RFC issue or GitHub discussion

### Release Schedule

- **Patch releases** (1.0.x) — Bug fixes, minor improvements, ASAP
- **Minor releases** (1.x.0) — New features, quarterly (target: every 2-3 weeks)
- **Major releases** (x.0.0) — Breaking changes, yearly or less frequent

---

## Getting Help

### Questions?

- 💬 **Ask in [Discussions](https://github.com/aliabbaschadhar/agent-superpowers/discussions)**
- 📖 **Check the [README](README.md)**
- 🐛 **Search [existing issues](https://github.com/aliabbaschadhar/agent-superpowers/issues)**

### Still Stuck?

- **Tag** a maintainer in your issue/PR
- **Be specific** about what you need help with
- **Provide context** (code, error messages, screenshots)

---

## Code of Conduct

All contributors must follow these principles:

- ✅ Be respectful and inclusive
- ✅ Welcome diverse perspectives
- ✅ Assume good intentions
- ✅ Provide constructive feedback
- ✅ Report harassment or violations privately to maintainers

---

## Thank You! 💜

Every contribution — code, skills, bug reports, docs, feedback — makes AI Agent Superpowers better for everyone. We're grateful for your help!

**Ready to contribute?**

1. Start with an issue or discussion
2. Fork the repo
3. Create a feature branch
4. Make your changes
5. Open a PR
6. Help us improve!

**Questions?** [Ask away!](https://github.com/aliabbaschadhar/agent-superpowers/discussions)

---

Happy hacking! 🚀
