# Deliberate ⚡

> **Deep Ideation, Multi-Agent Deliberation & Systematic Thinking Engine for AI Coding Agents.**  
> *Empowers Claude Code, Antigravity, Codex, Devin, and Cursor with structured "System 2" reasoning before writing code.*

[![npm version](https://img.shields.io/npm/v/deliberate-ai?color=blue&style=flat-square)](https://www.npmjs.com/package/deliberate-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![MCP Protocol](https://img.shields.io/badge/MCP-Compatible-purple?style=flat-square)](https://modelcontextprotocol.io)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

---

## 📖 Table of Contents
- [🎯 The Problem: First-Token Greediness](#-the-problem-first-token-greediness)
- [⚡ Quickstart in 30 Seconds](#-quickstart-in-30-seconds)
- [🔑 How to Configure Your LLM Provider](#-how-to-configure-your-llm-provider)
- [🛠️ Detailed How-To Guides](#️-detailed-how-to-guides)
  - [1. Brainstorm a System Architecture](#1-how-to-brainstorm-a-system-architecture)
  - [2. Red-Team Existing Source Code](#2-how-to-red-team-existing-source-code)
  - [3. Summon Specific Council Personas](#3-how-to-summon-specific-council-personas)
  - [4. Connect to Claude Code via MCP](#4-how-to-connect-to-claude-code-mcp)
  - [5. Install into Google Antigravity](#5-how-to-install-into-google-antigravity)
  - [6. Use in Cursor, Windsurf & GitHub Copilot](#6-how-to-use-in-cursor-windsurf--github-copilot)
  - [7. Programmatic TypeScript & Python SDK](#7-how-to-use-the-programmatic-sdk)
- [🧠 The 6 Adversarial Personas](#-the-6-adversarial-personas)
- [🔬 The 5 Systematic Ideation Topologies](#-the-5-systematic-ideation-topologies)
- [🔒 Privacy & Security FAQ](#-privacy--security-faq)
- [📄 License](#-license)

---

## 🎯 The Problem: "First-Token Greediness"

When AI coding agents (Claude Code, Antigravity, Devin, Codex) tackle non-trivial architecture or migration tasks, they typically suffer from **First-Token Greediness**—immediately generating standard boilerplate on token #1 without exploring alternative paradigms, stress-testing edge cases, or weighing Pareto trade-offs.

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

## ⚡ Quickstart in 30 Seconds

Export your preferred LLM key and run instantly with `npx`:

```bash
# 1. Set your API key
export GEMINI_API_KEY="your-gemini-key"      # or ANTHROPIC_API_KEY, OPENAI_API_KEY, DEEPSEEK_API_KEY

# 2. Run Deliberate Brainstorming
npx deliberate-ai brainstorm "Real-time state sync for collaborative canvas with 10k users"
```

*(Or install globally: `npm install -g deliberate-ai`)*

---

## 🎛️ Interactive Model & Council Persona Selector

`Deliberate` comes with an interactive terminal wizard that lets you configure your models:

```bash
# Launch the interactive configuration wizard
npx deliberate-ai config

# Or pass -i to configure before running a brainstorm
npx deliberate-ai brainstorm "Multi-tenant auth engine" -i
```

You can choose between two modes:
1. **Unified (One Model for All)**: Uses a single provider (e.g. Gemini 2.5 Flash, Claude 3.7, or GPT-4o) across all topologies and council debates.
2. **Council Mix-and-Match (Elite Multi-Agent Diversity)**: Assign specialized models to different personas for maximum cognitive diversity:
   - 🏛️ **The Principal Architect** ➔ *Anthropic Claude 3.7 Sonnet*
   - 🥊 **The Ruthless Contrarian** ➔ *DeepSeek-R1 Reasoner*
   - ⚡ **The Performance Hacker** ➔ *Google Gemini 2.5 Flash*
   - 💎 **The DX & Ergonomics Purist** ➔ *Anthropic Claude 3.7 Sonnet*
   - 🛡️ **The Security Auditor** ➔ *OpenAI GPT-4o*
   - 🔨 **The Pragmatist** ➔ *Local Ollama / Llama 3.3*
   - ⚡ **Master Synthesizer** ➔ *Anthropic Claude 3.7 Sonnet*

*(Configurations are saved automatically to `./deliberate.config.json` or `~/.deliberaterc`)*

---

## 🔑 How to Configure Your LLM Provider

`Deliberate` natively connects directly to frontier LLMs or free local models:

### 1. Cloud Providers
| Provider | Environment Variable | Default Model | Flag Override |
| :--- | :--- | :--- | :--- |
| **Google Gemini** | `export GEMINI_API_KEY="..."` | `gemini-2.5-flash` | `--provider gemini --model gemini-2.5-pro` |
| **Anthropic Claude** | `export ANTHROPIC_API_KEY="..."` | `claude-3-7-sonnet-20250219` | `--provider anthropic` |
| **OpenAI / Codex** | `export OPENAI_API_KEY="..."` | `gpt-4o` | `--provider openai --model o3-mini` |
| **DeepSeek** | `export DEEPSEEK_API_KEY="..."` | `deepseek-reasoner` | `--provider deepseek` |

### 2. Free & 100% Offline Local Models (Ollama)
If you don't want to use API keys, start Ollama locally:
```bash
ollama run deepseek-r1:14b
# Deliberate auto-detects localhost:11434 with zero configuration!
npx deliberate-ai brainstorm "Design an in-memory ring buffer" --provider ollama
```

---

## 🛠️ Detailed How-To Guides

### 1. How to Brainstorm a System Architecture
Use `brainstorm` when designing new features, services, or data pipelines:

```bash
# Standard Balanced Deliberation (Topologies + 6 Personas)
npx deliberate-ai brainstorm "Multi-tenant auth engine with row-level security"

# Deep Tree-of-Thoughts Exploration with hard constraints
npx deliberate-ai brainstorm "Distributed cache with sub-ms p99 latency" \
  --mode deep-explore \
  --constraints "Zero external Redis daemons" "Memory bounded at 128MB"

# Fast 10-Second Sanity Check
npx deliberate-ai brainstorm "State management for offline-first React app" --mode flash
```

---

### 2. How to Red-Team Existing Source Code
Use `red-team` to find race conditions, security vulnerabilities, memory leaks, and missing invariants in an existing file:

```bash
npx deliberate-ai red-team ./src/billing/transfer.ts \
  --goal "Ensure zero double-spending under concurrent API requests"
```

---

### 3. How to Summon Specific Council Personas
If you only want specific expert viewpoints (e.g. Security + Performance):

```bash
npx deliberate-ai council "Migrate SQLite to distributed Raft" \
  --personas architect performance security
```

---

### 4. How to Connect to Claude Code (MCP)
Add `deliberate-ai` to Claude Code so Claude automatically deliberates before generating code:

```bash
claude mcp add deliberate npx -y deliberate-ai mcp
```

Now in Claude Code:
> *"Claude, re-architect our WebSocket ingestion layer to handle 50,000 concurrent connections."*  
Claude will automatically call `deliberate_brainstorm` and follow the synthesized Pareto blueprint!

---

### 5. How to Install into Google Antigravity
Install the Deliberate skill into Antigravity with 1 command:

```bash
mkdir -p ~/.gemini/antigravity/skills/deliberate
curl -sSL https://raw.githubusercontent.com/shanmukhaditya/deliberate/main/integrations/antigravity/SKILL.md > ~/.gemini/antigravity/skills/deliberate/SKILL.md
```

Now in Antigravity chat:
> *"Use deliberate to brainstorm a zero-downtime database partitioning strategy."*

---

### 6. How to Use in Cursor, Windsurf & GitHub Copilot

#### For Cursor / Windsurf:
Drop the rules into your project:
```bash
curl -sSL https://raw.githubusercontent.com/shanmukhaditya/deliberate/main/integrations/cursor/.cursorrules > .cursorrules
```

#### For GitHub Copilot & Codex:
Add instructions to your repo:
```bash
mkdir -p .github
curl -sSL https://raw.githubusercontent.com/shanmukhaditya/deliberate/main/integrations/antigravity/SKILL.md > .github/copilot-instructions.md
```

---

### 7. How to Use the Programmatic SDK

#### In TypeScript / Node.js:
```typescript
import { deliberate } from 'deliberate-ai';

const result = await deliberate.brainstorm({
  goal: "Design high-throughput event streamer with zero external dependencies",
  mode: "council",
  provider: "gemini", // or "anthropic", "openai", "deepseek", "ollama"
  constraints: ["p99 < 1ms", "Bounded memory at 64MB"]
});

console.log("Winning Architecture:", result.blueprint.winningArchitecture.title);
console.log("Hard Invariants:", result.blueprint.coreInvariants);
console.log("Implementation Steps:", result.blueprint.implementationSteps);
```

#### In Python / OpenAI Codex:
```python
from deliberate_codex import Deliberate

result = Deliberate.brainstorm(
    goal="Design an in-memory lockless ring buffer",
    mode="council",
    provider="gemini"
)
print(result["stdout"])
```

---

## 🧠 The 6 Adversarial Personas

Unlike polite chat models that agree with everything, `Deliberate` personas enforce strict, anti-sycophantic loss functions:

| Persona | Title | Stance & Cognitive Duty |
| :--- | :--- | :--- |
| 🏛️ **The Principal Architect** | *Staff Systems Architect* | Demands modularity, clean domain boundaries, and long-term evolvability. |
| 🥊 **The Ruthless Contrarian** | *Adversarial Red-Teamer* | Unforgivingly attacks the happy-path; hunts catastrophic edge cases & race conditions. |
| ⚡ **The Performance Hacker** | *Systems Optimization Guru* | Obsessed with mechanical sympathy, zero-allocation data structures, and sub-millisecond p99. |
| 💎 **The DX & Ergonomics Purist** | *API Designer* | Enforces the *"Rule of 3 Seconds"*; eliminates ceremony, cognitive load, and boilerplate. |
| 🛡️ **The Security Auditor** | *Zero-Trust Architect* | Audits trust boundaries, injection surfaces, privilege escalation, and memory safety. |
| 🔨 **The Pragmatist** | *KISS & YAGNI Enforcer* | Cuts over-engineering; favors boring, proven primitives over distributed complexity. |

---

## 🔬 The 5 Systematic Ideation Topologies

`Deliberate` replaces vague prompting with formal inventive heuristics:

1. **First-Principles Deconstruction**: Strips framework assumptions down to raw I/O, memory bandwidth, and computational constraints.
2. **Inversion (The Anti-Problem / Jacobi's Rule)**: Simulates worst-case catastrophic failure modes, then inverts every failure into a non-negotiable **Architectural Invariant**.
3. **TRIZ Contradiction Resolution**: Eliminates inherent engineering trade-offs (e.g. Query Latency vs. Memory Overhead) using inventive principles.
4. **SCAMPER Architectural Mutation**: Mutates designs through 7 operators (*Substitute, Combine, Adapt, Modify, Put to use, Eliminate, Reverse*).
5. **Tree-of-Thoughts Pareto Exploration**: Generates 3-4 distinct architectural branches and computes Pareto scores across DX, Performance, Simplicity, and Security.

---

## 🔒 Privacy & Security FAQ

#### Where do my prompts and code go?
Prompts go **directly and only to your chosen LLM provider** (Google, Anthropic, OpenAI, DeepSeek) over encrypted HTTPS using your own API key. If you use Ollama, **zero data leaves your laptop**. There are no middleman servers, no proxy relays, and no telemetry.

#### Can I use this without any API keys?
**Yes!** Install [Ollama](https://ollama.com) and run `ollama run deepseek-r1:14b` (or `llama3.3`). Deliberate auto-detects local Ollama on `localhost:11434`.

---

## 📄 License
MIT © [Shanmukh Aditya](LICENSE)
