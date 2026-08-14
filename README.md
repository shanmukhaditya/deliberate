# Deliberate ⚡

> **Deep Ideation, Multi-Agent Deliberation & Systematic Thinking Engine for AI Coding Agents.**  
> *Empowers Claude Code, Antigravity, Codex, Devin, and Cursor with structured "System 2" reasoning before writing code.*

[![npm version](https://img.shields.io/npm/v/deliberate?color=blue&style=flat-square)](https://www.npmjs.com/package/deliberate)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![MCP Protocol](https://img.shields.io/badge/MCP-Compatible-purple?style=flat-square)](https://modelcontextprotocol.io)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

---

## 🎯 The Problem: "First-Token Greediness"

When AI coding tools (Claude Code, Antigravity, Devin, Codex) tackle non-trivial architecture or migration tasks, they typically suffer from **First-Token Greediness**—immediately vomiting standard boilerplate on token #1 without exploring alternative paradigms, stress-testing edge cases, or weighing Pareto trade-offs.

**`Deliberate`** is a dedicated open-source deliberation library, CLI, and [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that injects systematic, high-order thinking into any AI coding workflow.

```
 User Goal ──► [ Systematic Ideation Topologies ] ──► [ Adversarial Council ] ──► [ Dialectical Synthesis ]
                • First-Principles                     • The Principal Architect   • Pareto Trade-Off Matrix
                • Inversion (Anti-Problem)             • The Ruthless Contrarian   • Hard Invariants
                • TRIZ Contradictions                  • The Performance Hacker    • Actionable Blueprint
                • SCAMPER Mutations                    • The DX Purist             • Implementation Steps
                • Tree-of-Thoughts                     • The Security Auditor
                                                       • The Pragmatist (YAGNI)
```

---

## 🚀 Quickstart

### 1. Instant Terminal CLI (Zero Install)

```bash
# Brainstorm a high-concurrency architecture
npx deliberate brainstorm "Real-time state sync for collaborative canvas with 10k users"

# Red-team a high-risk file for race conditions & leaks
npx deliberate red-team ./src/core/router.ts

# Directly summon the adversarial council
npx deliberate council "Migrate SQLite to distributed Raft"
```

### 2. Connect to Claude Code, Antigravity & Cursor (MCP Server)

Add `deliberate` as an MCP server in your AI tool configuration:

```json
{
  "mcpServers": {
    "deliberate": {
      "command": "npx",
      "args": ["-y", "deliberate", "mcp"]
    }
  }
}
```

Now your AI assistant has native access to:
- `deliberate_brainstorm`
- `deliberate_red_team`
- `deliberate_council_debate`

---

## 🧠 The 6 Adversarial Council Personas

Unlike polite chat models that agree with everything, `Deliberate` personas enforce strict, anti-sycophantic loss functions:

| Persona | Title | Bias & Cognitive Duty |
| :--- | :--- | :--- |
| 🏛️ **The Principal Architect** | *Staff Systems Architect* | Demands modularity, decoupled boundaries, and long-term evolvability. |
| 🥊 **The Ruthless Contrarian** | *Adversarial Red-Teamer* | Unforgivingly attacks the happy-path; hunts catastrophic edge cases & race conditions. |
| ⚡ **The Performance Hacker** | *Systems Optimization Guru* | Obsessed with mechanical sympathy, zero-allocation data structures, and sub-millisecond p99. |
| 💎 **The DX & Ergonomics Purist** | *API Designer* | Enforces the *"Rule of 3 Seconds"*; eliminates ceremony and boilerplate. |
| 🛡️ **The Security Auditor** | *Zero-Trust Architect* | Audits trust boundaries, injection surfaces, privilege escalation, and memory safety. |
| 🔨 **The Pragmatist** | *KISS & YAGNI Enforcer* | Cuts over-engineering; favors boring, proven primitives over distributed complexity. |

---

## 🔬 Systematic Ideation Topologies

`Deliberate` replaces vague prompting with formal inventive heuristics:

1. **First-Principles Deconstruction**: Recursively strips framework assumptions down to raw I/O, bandwidth, and computational constraints.
2. **Inversion (The Anti-Problem / Jacobi's Rule)**: Simulates worst-case catastrophic failure modes, then inverts every failure into a non-negotiable **Architectural Invariant**.
3. **TRIZ Contradiction Resolution**: Eliminates inherent engineering trade-offs (e.g. Query Latency vs. Memory Footprint) using inventive principles.
4. **SCAMPER Architectural Mutation**: Mutates designs through 7 operators (*Substitute, Combine, Adapt, Modify, Put to use, Eliminate, Reverse*).
5. **Tree-of-Thoughts Pareto Exploration**: Generates 3-4 distinct architectural branches and computes Pareto scores across DX, Performance, Simplicity, and Security.

---

## 💻 Programmatic SDK Usage

### TypeScript / Node.js
```typescript
import { deliberate } from 'deliberate';

// 1. Deliberate on an architecture
const result = await deliberate.brainstorm({
  goal: "Design high-throughput event streamer with zero external dependencies",
  mode: "council", // 'flash' | 'council' | 'deep-explore'
  constraints: ["p99 < 1ms", "Zero external broker daemons"]
});

console.log("Winning Architecture:", result.blueprint.winningArchitecture.title);
console.log("Hard Invariants:", result.blueprint.coreInvariants);
console.log("Action Plan:", result.blueprint.implementationSteps);
```

### Python / OpenAI Codex
```python
from deliberate_codex import Deliberate

# Run deliberation from any Python / Codex agent pipeline
result = Deliberate.brainstorm("Design an in-memory lock-free ring buffer", mode="council")
print(result["stdout"])
```

---

## 🔌 Supported LLM Backends

`Deliberate` auto-detects environment keys with zero manual configuration:
- **Google Gemini**: `export GEMINI_API_KEY="..."`
- **Anthropic Claude**: `export ANTHROPIC_API_KEY="..."`
- **OpenAI / Codex**: `export OPENAI_API_KEY="..."`
- **DeepSeek**: `export DEEPSEEK_API_KEY="..."`
- **Local & Offline (Ollama / vLLM)**: Auto-connects to `http://localhost:11434`
- **Offline Mock Engine**: Runs instant deterministic testing with `--provider mock`.

---

## 📂 Repository Structure

```
deliberate/
├── src/
│   ├── core/
│   │   ├── engine.ts          # Orchestrator for council debates & topologies
│   │   ├── personas/          # The 6 adversarial personas & prompt builders
│   │   ├── topologies/        # First-Principles, Inversion, TRIZ, SCAMPER, ToT
│   │   ├── providers/         # Gemini, Anthropic, OpenAI, DeepSeek, Ollama, Mock
│   │   ├── synthesizer.ts     # Pareto trade-off matrix & blueprint synthesis
│   │   └── types.ts           # Domain models & Zod schemas
│   ├── mcp/
│   │   └── server.js          # Model Context Protocol server (stdio/SSE)
│   ├── cli/
│   │   ├── index.ts           # CLI binary (`deliberate brainstorm / red-team`)
│   │   └── tui.ts             # Rich terminal boxes, tables, and spinners
│   └── index.ts               # Public SDK exports
├── integrations/
│   ├── antigravity/SKILL.md   # Google Antigravity custom skill
│   ├── codex/                 # OpenAI Function Calling schemas & Python helper
│   ├── claude/                # Claude Code & Desktop MCP config
│   └── cursor/.cursorrules    # Cursor IDE rules
├── examples/                  # Executable TypeScript SDK examples
└── tests/                     # Vitest automated test suite
```

---

## 🧪 Testing

```bash
npm test
```

---

## 📄 License
MIT © [Deliberate Contributors](LICENSE)
