# Quick Start Guide

Get **AI Agent Superpowers** running in 60 seconds.

---

## 🚀 Install (30 seconds)

1. Open **Extensions** in VS Code (`Ctrl+Shift+X`)
2. Search for **"AI Agent Superpowers"**
3. Click **Install**
4. Reload VS Code

**Done!** The extension is ready to use.

---

## 💡 Use It (3 ways)

### Method 1: Sidebar Browser (Best for Exploring)

1. Click the **brain icon** in the Activity Bar (left sidebar)
2. Browse or search for a skill
3. Click **Preview** to see the full content
4. Click **Install** to add it to your agent

### Method 2: Browse & Paste (Best for Quick Lookups)

Press **`Ctrl+Shift+/`** (or `Cmd+Shift+/` on Mac)

1. Type a skill name: `react`, `api-design`, `security`
2. Select a skill
3. `/<skill-id>` is copied to clipboard
4. Paste it into Claude Code or Gemini CLI

**That's it!** The skill is now active for that chat.

### Method 3: Command Palette (Traditional)

Press **`Ctrl+Shift+P`** and type `AI Skills:`

- `Browse & Copy Skill ID` — Search & copy
- `Install Skill to Agent` — Install selected skill
- `Preview Skill` — View before installing
- `Uninstall Skill` — Remove a skill

---

## 📚 Understanding Skills

A **skill** is an instruction file that teaches your AI assistant specialized expertise.

### Example: Using a Skill

```
In Claude Code chat, paste:

/react-hooks-advanced

Now ask Claude questions about React hooks:
"Show me a custom hook for managing async state with error handling"
```

Claude now has deep context about React best practices for that conversation.

### Installing for Permanent Use

If you use a skill constantly, **install it**:

1. Sidebar → Find the skill
2. Click the download icon
3. Skill is now installed to your agent config
4. Restart your agent (e.g., close Claude Code & reopen)
5. The skill is now always active (no `/skill-id` needed)

---

## ⚙️ Configuration (Optional)

VS Code Settings (`Ctrl+,`). Search for `aiSkills.`:

| Setting                     | What It Does                                           |
| --------------------------- | ------------------------------------------------------ |
| `aiSkills.defaultAgent`     | Pre-select install target (auto/claude/cursor/copilot) |
| `aiSkills.confirmOverwrite` | Ask before overwriting skill files (default: on)       |
| `aiSkills.showRiskBadge`    | Show risk level badge (default: on)                    |
| `aiSkills.autoPasteDelayMs` | Auto-paste timing (default: 80ms)                      |

**Default settings work great** — no configuration required.

---

## 🤔 Frequently Asked

**Q: Do I need internet?**  
A: No. All 940+ skills are bundled offline. Remote sync is optional.

**Q: Can I use multiple skills at once?**  
A: Yes! Install as many as you want. Or paste multiple `/skill-ids` in chat.

**Q: What if I don't like a skill?**  
A: Uninstall it from the sidebar (trash icon). Or just stop using it in chat.

**Q: How do I create my own skills?**  
A: Not yet from the UI (coming soon). For now, see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📖 Learn More

- **Full Guide**: [README.md](README.md)
- **Troubleshooting**: See README FAQ & Troubleshooting sections
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **What's New**: [CHANGELOG.md](CHANGELOG.md)
- **Bug Reports**: [GitHub Issues](https://github.com/aliabbaschadhar/agent-superpowers/issues)
- **Questions**: [GitHub Discussions](https://github.com/aliabbaschadhar/agent-superpowers/discussions)

---

## ✨ What's Different for Each Agent

| Agent              | How It Works                                                |
| ------------------ | ----------------------------------------------------------- |
| **Claude Code**    | Installed skills appear in sidebar as `~/.claude/skills/`   |
| **Gemini CLI**     | Installed skills in `~/.gemini/skills/` (check Gemini docs) |
| **Cursor**         | Installed to `.cursor/rules/` (project or global)           |
| **GitHub Copilot** | Appended to `.github/copilot-instructions.md`               |
| **Claude Web**     | Just copy-paste the `/skill-id` into your chat              |

---

## 🎯 Recommended First Skills

New to AI agent skills? Try these:

1. **`api-design-principles`** — Fundamentals everyone should know
2. **`react-patterns`** — If you code frontend
3. **`python-async-patterns`** — If you code backend
4. **`ai-engineer`** — If you work with LLMs
5. **`security-best-practices`** — Always good to know

Search for them in the sidebar or use Browse (`Ctrl+Shift+/`).

---

## 🚀 Next Steps

- **Explore** the sidebar to find skills for your tech stack
- **Install** 2-3 core skills relevant to your projects
- **Use them** in your Claude Code, Cursor, or agent chats
- **Share feedback** in [GitHub Discussions](https://github.com/aliabbaschadhar/agent-superpowers/discussions)

---

## 💬 Got Questions?

- Check [README.md](README.md) FAQ section
- Browse [CONTRIBUTING.md](CONTRIBUTING.md) for developer questions
- Open [GitHub Discussions](https://github.com/aliabbaschadhar/agent-superpowers/discussions) to ask
- File [GitHub Issues](https://github.com/aliabbaschadhar/agent-superpowers/issues) for bugs

---

**Happy skill hunting! 🧠✨**
