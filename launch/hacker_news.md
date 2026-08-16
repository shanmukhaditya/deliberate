# Hacker News (Show HN) Launch Post

**Target Submission Time:** Tuesday or Wednesday at 7:30 AM - 8:30 AM EST  
**URL to Submit:** https://news.ycombinator.com/submit

---

### Title:
`Show HN: Deliberate – Multi-agent adversarial council for System-2 architecture design`

---

### Body Text:

Hi HN! We built **Deliberate** (https://github.com/shanmukhaditya/deliberate) to solve "first-token greediness" in AI coding agents.

Most LLMs (and tools like Claude Code, Cursor, and Devin) are sycophantic yes-men: when you give them a flawed architecture or an underspecified prompt, they jump to generating code immediately without checking for race conditions, memory leaks, or missing failure invariants.

Deliberate acts as a **System-2 reasoning pre-processor**. Before any code is generated, it convenes an automated 6-persona adversarial council across 5 formal thinking topologies:

1. **The 6 Personas:**
   - 🏛️ *Principal Architect* (Structure, separation of concerns, Pareto optimality)
   - 🥊 *Ruthless Contrarian* (Finds edge-case failure modes and attacks assumptions)
   - ⚡ *Performance Hacker* (P99 latency, zero-copy memory, hot-path bottlenecks)
   - 💎 *DX Purist* (Type safety, ergonomics, mental model simplicity)
   - 🛡️ *Security Auditor* (Zero-trust boundaries, replay attacks, permission escalation)
   - 🔨 *Pragmatist* (YAGNI, operational simplicity, maintenance cost)

2. **The 5 Systematic Topologies:**
   - First-Principles Axiomatic Deconstruction
   - Inversion & Anti-Problem Mapping
   - TRIZ Contradiction Matrix
   - SCAMPER Morphological Operators
   - Tree-of-Thoughts Pareto Exploration

3. **Key Capabilities:**
   - 🥊 **Persona Debate Auditing:** Inspect verbatim arguments from each persona (`--show-debate`).
   - 🔄 **Multi-Round Cross-Examination:** Personas rebut each other's critiques over multiple rounds (`--rounds 2`).
   - 📜 **ADR Generator:** Emits standard MADR v3.0 Architectural Decision Records (`--adr`).
   - 🌐 **Embedded Browser Dashboard:** Zero-dependency local visualizer with interactive Pareto radar charts (`deliberate ui`).
   - 🔍 **Git Diff Red-Teamer & Pre-Push Hooks:** Pre-PR and pre-push adversarial code auditing (`deliberate red-team --git`, `deliberate hook install`).
   - 💻 **Scaffolder & Invariant Tests:** Emits runnable TypeScript interface contracts and unit test suites (`--scaffold`, `deliberate test-gen`).
   - 🤖 **Model Context Protocol (MCP) Server:** Native integration for Claude Code and Cursor.

Zero install required. Try it on any architecture in your terminal:

```bash
npx deliberate-ai brainstorm "Designing a lock-free distributed ring buffer" --rounds 2 --show-debate --ui
```

It is open-source under the MIT license and supports Gemini, Claude, OpenAI, DeepSeek, and local Ollama models. We would love your feedback and critique!

GitHub: https://github.com/shanmukhaditya/deliberate  
NPM: https://www.npmjs.com/package/deliberate-ai
