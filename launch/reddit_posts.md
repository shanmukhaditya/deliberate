# Reddit Launch Strategy & Posts

Post these into relevant subreddits with tailored angles:

---

## 1. r/ClaudeAI & r/CursorAI
**Title:** Giving Claude Code and Cursor "System-2 Reasoning" with an Adversarial Multi-Agent Council (Deliberate MCP)

**Body:**
Hey everyone,

One of the biggest issues with Claude Code and Cursor Composer is **"First-Token Greediness"**—they jump to writing code before thinking through failure modes, race conditions, or architecture.

I built an open-source tool called **Deliberate** (https://github.com/shanmukhaditya/deliberate) that acts as an adversarial reasoning pre-processor. It convenes 6 adversarial personas (Principal Architect, Ruthless Contrarian, Performance Hacker, Security Auditor, DX Purist, Pragmatist) across 5 systematic thinking topologies (TRIZ, Inversion, First-Principles).

You can hook it directly into Claude Desktop or Cursor via MCP:
```json
{
  "mcpServers": {
    "deliberate": {
      "command": "npx",
      "args": ["-y", "deliberate-ai", "mcp"]
    }
  }
}
```

Or run it directly in your terminal:
`npx deliberate-ai brainstorm "Designing a distributed lock-free ring buffer" --rounds 2 --show-debate --ui`

It emits Pareto radar charts, standard Architectural Decision Records (`--adr`), and runnable code contracts (`--scaffold`).

Check it out and let me know your thoughts!

---

## 2. r/LocalLLaMA
**Title:** Running a 6-persona adversarial architecture council locally with Ollama and DeepSeek (Deliberate AI)

**Body:**
Hey LocalLLaMA,

I built **Deliberate** (https://github.com/shanmukhaditya/deliberate), an open-source framework that runs multi-agent dialectical deliberation on system designs completely offline using local models via Ollama.

It auto-detects locally installed models from `http://localhost:11434/api/tags` (e.g. `deepseek-r1`, `qwen2.5-coder:32b`, `llama3.3`).

You can assign different local models to different personas (e.g. DeepSeek-R1 to the Ruthless Contrarian, Qwen-Coder to the Principal Architect):
`npx deliberate-ai config`

Then run:
`npx deliberate-ai brainstorm "Zero-copy event bus" --provider ollama --show-debate`

Zero telemetry, fully local-first, MIT licensed.
