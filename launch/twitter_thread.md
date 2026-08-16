# Viral X (Twitter) Launch Thread

**Hook Image / Video:** 45-second screen recording showing `npx deliberate-ai brainstorm "..." --show-debate --ui` in terminal and opening the browser radar chart.

---

### Tweet 1 (The Hook):
AI coding agents are too agreeable.

You give them a flawed architecture, and they start generating code immediately—ignoring race conditions, scale bottlenecks, and memory leaks.

We built Deliberate: an adversarial council of 6 AI personas that tears your architecture apart before you write code. 🧵👇

[ATTACH SCREENSHOT / DEMO VIDEO]

---

### Tweet 2 (The Personas):
Deliberate doesn't do generic single-prompt summaries.

It convenes 6 specialized adversarial personas:
🏛️ Principal Architect (System cohesion)
🥊 Ruthless Contrarian (Attacks flaws & edge cases)
⚡ Performance Hacker (Zero-copy & latency bottlenecks)
🛡️ Security Auditor (Privilege escalation)
💎 DX Purist & 🔨 Pragmatist

---

### Tweet 3 (Multi-Round Debates):
In Round 2, the personas don't just talk to you—they cross-examine *each other*.

The Contrarian attacks the Architect's replication lag.
The Performance Hacker critiques the Security Auditor's encryption overhead.

They converge on non-negotiable hard invariants.

---

### Tweet 4 (Developer Superpowers):
What Deliberate gives you in 15 seconds:
• 📊 Pareto trade-off radar matrix
• 📜 Standard MADR v3.0 Architectural Decision Records (`--adr`)
• 💻 Runnable TypeScript code contracts (`--scaffold`)
• 🧪 Automated invariant unit test suites (`deliberate test-gen`)
• 🌐 Local web dashboard (`deliberate ui`)

---

### Tweet 5 (Git & Pre-Push Hooks):
You can even install a Git pre-push hook in 1 second:

`npx deliberate-ai hook install`

Every time you run `git push`, Deliberate red-teams your uncommitted diff and blocks code with unhandled failure modes.

---

### Tweet 6 (CTA & Links):
Zero install required. Run it right now with:

```bash
npx deliberate-ai brainstorm "Your system design idea" --show-debate --ui
```

Supports Gemini, Claude, OpenAI, DeepSeek, and local Ollama models.

⭐ GitHub (Open Source MIT): https://github.com/shanmukhaditya/deliberate
📦 NPM: https://www.npmjs.com/package/deliberate-ai

RT and star if you care about building resilient systems! ⚡
