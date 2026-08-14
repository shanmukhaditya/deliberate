---
name: deliberate
description: Deep ideation, first-principles deconstruction, adversarial council debate, and Pareto trade-off synthesis for software architecture, refactors, and complex feature design. Use when tasked with architecting systems, solving hard trade-offs, or red-teaming critical code invariants.
---

# Deliberate: Deep Ideation & Architectural Deliberation Skill

This skill equips Antigravity with a systematic "System 2" deliberation engine. When faced with complex architectural questions, high-concurrency designs, zero-downtime migrations, or unfamiliar algorithmic trade-offs, **do not rush to write code immediately**. Instead, execute the Deliberate protocol.

## When to Activate This Skill
- Designing complex distributed systems, state synchronization, or streaming architectures.
- Planning high-risk database schema migrations (e.g. multi-tenant partitioning, sharding).
- Designing new public APIs, SDKs, or developer tools where ergonomics and simplicity are critical.
- Red-teaming critical code for race conditions, memory leaks, security vulnerabilities, or silent data corruption.
- When the user asks to "brainstorm", "deliberate", "weigh trade-offs", or "design" a system.

## The Deliberate Protocol Workflow

```
1. First-Principles Deconstruction ──► Strips all framework bias down to atomic physics & constraints.
2. Inversion (The Anti-Problem)   ──► Simulates worst-case catastrophic failures -> Derives Invariants.
3. TRIZ Contradiction Analysis    ──► Eliminates inherent trade-offs (e.g. Throughput vs Latency).
4. The Adversarial Council        ──► Principal Architect, Contrarian, Perf Hacker, DX Purist, Security Auditor, Pragmatist.
5. Dialectical Synthesis Blueprint──► Produces winning architecture, rejected alternatives, hard invariants, and execution plan.
```

## Running Deliberate via CLI or MCP
You can invoke the deliberation engine directly within the workspace:

```bash
# Brainstorm a system architecture
npx deliberate brainstorm "Real-time state sync for collaborative canvas with 10k users"

# Red-team a high-risk file
npx deliberate red-team ./src/core/router.ts

# Summon the council for direct debate
npx deliberate council "Migrate SQLite to distributed Raft"
```

## Invariant Enforcement Rules
1. **Never Accept the First Happy Path**: Always identify at least 2 catastrophic failure modes before finalizing a design.
2. **Quantify Constraints**: Express constraints in concrete units (p99 latency, RAM MB, concurrent connections, ops/sec).
3. **Anti-Sycophancy**: Challenge assumptions relentlessly. Reject over-engineered microservices when embedded monoliths or lock-free data structures achieve the goal with 10x less complexity.
