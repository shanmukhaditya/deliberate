import { LLMProvider, LLMRequestOptions, LLMResponse } from './base.js';

export class MockProvider implements LLMProvider {
  readonly id = 'mock';
  readonly name = 'Deterministic Mock Provider';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async generate(options: LLMRequestOptions): Promise<LLMResponse> {
    const sysMsg = options.messages.find((m) => m.role === 'system')?.content || '';
    const userMsg = options.messages.find((m) => m.role === 'user')?.content || '';

    // 1. Synthesizer Check (Highest Priority)
    if (sysMsg.includes('Deliberate Master Synthesizer') || userMsg.includes('Master Dialectical Synthesizer')) {
      return {
        content: '',
        model: 'mock-engine',
        parsedJson: {
          title: 'Deliberate Architectural Specification & Action Plan',
          executiveSummary:
            'A high-performance, resilient architecture synthesized through adversarial deliberation and first-principles deconstruction.',
          winningArchitecture: {
            id: 'branch_zero_copy',
            title: 'Lock-Free In-Memory Ring Buffer with Asynchronous WAL',
            summary: 'Sub-millisecond zero-copy event processor with bounded memory and crash-resilient disk flushing.',
            paradigm: 'Zero-Copy / Lock-Free Ring Buffer',
            scores: [
              { criterion: 'performance', score: 9.8, rationale: 'Sub-millisecond p99 latency with zero heap allocations.' },
              { criterion: 'dx_ergonomics', score: 9.0, rationale: 'Ergonomic 1-line client API with auto-batching.' },
              { criterion: 'simplicity', score: 8.5, rationale: 'Zero external infrastructure or daemon dependencies.' },
              { criterion: 'security', score: 9.2, rationale: 'Bounded buffers prevent memory exhaustion / DoS attacks.' },
              { criterion: 'extensibility', score: 8.8, rationale: 'Pluggable storage drivers via trait contracts.' },
            ],
            overallScore: 9.1,
            tradeOffSummary:
              'Prioritizes extreme throughput and operational simplicity over distributed cluster complexity.',
          },
          rejectedAlternatives: [
            {
              title: 'Distributed Raft Cluster with Redis',
              rejectionReason:
                'Over-engineered for current scale; introduces network latency and operational maintenance burden.',
            },
            {
              title: 'Naive Polling on SQLite',
              rejectionReason: 'Fails write throughput stress-tests under 5,000 concurrent updates.',
            },
          ],
          coreInvariants: [
            'Invariant 1: All queues must have strict upper bounds with backpressure signaling.',
            'Invariant 2: State mutations on the hot path must be zero-allocation and lock-free.',
            'Invariant 3: All network inputs must pass strict schema validation at the trust boundary.',
          ],
          failureModesAndMitigations: [
            {
              failureMode: 'Process sudden crash before disk flush',
              mitigation: 'Sequential write-ahead log (WAL) with deterministic replay on boot.',
            },
            {
              failureMode: 'Thundering herd on cache invalidation',
              mitigation: 'Single-flight deduplication and jittered probabilistic renewal.',
            },
          ],
          implementationSteps: [
            '1. Define atomic lock-free RingBuffer data structure with bounded capacity.',
            '2. Implement background WAL flusher with batched `fsync` intervals.',
            '3. Build ergonomic client API with automatic request coalescing.',
            '4. Add stress-test verification suite covering network drops and burst concurrency.',
          ],
          codeSkeleton: `// Production-Grade Architectural Skeleton\nexport class DeliberateBuffer<T> {\n  private buffer: T[];\n  private head = 0;\n  private tail = 0;\n  \n  constructor(public readonly capacity = 65536) {\n    this.buffer = new Array(capacity);\n  }\n  \n  push(item: T): boolean {\n    // Lock-free atomic push with backpressure\n    return true;\n  }\n}`,
        },
      };
    }

    // 2. Persona Critiques Check
    if (sysMsg.includes('Principal Software Architect') || userMsg.includes('The Principal Architect')) {
      return {
        content: '',
        model: 'mock-engine',
        parsedJson: {
          coreCritique:
            'The core architecture must strictly decouple the ingestion pipeline from the storage engine via clean event interfaces.',
          strengths: ['Clear modular separation', 'Graceful migration path'],
          vulnerabilities: ['Potential boundary leakage if domain models are shared directly with transport layer'],
          requiredInvariants: [
            'All public interfaces must accept explicit context cancellation tokens.',
            'Storage layer must remain swappable via abstract repository traits.',
          ],
          proposedAlternative: 'Use a Hexagonal / Ports & Adapters architecture with strict interface boundaries.',
        },
      };
    }

    if (sysMsg.includes('adversarial Red-Teamer') || userMsg.includes('The Ruthless Contrarian')) {
      return {
        content: '',
        model: 'mock-engine',
        parsedJson: {
          coreCritique:
            'The happy-path assumption breaks completely during high-concurrency burst traffic when locks contention spikes 100x.',
          strengths: ['Simple design when under low load'],
          vulnerabilities: ['Thundering herd race conditions', 'Lack of backpressure leading to OOM cascades'],
          requiredInvariants: [
            'Must enforce hard bounded queues with explicit backpressure rejection.',
            'Must implement jittered exponential backoff for all retries.',
          ],
          proposedAlternative: 'Replace unbounded mutexes with single-flight concurrency deduplication.',
        },
      };
    }

    if (sysMsg.includes('systems performance') || userMsg.includes('The Performance Hacker')) {
      return {
        content: '',
        model: 'mock-engine',
        parsedJson: {
          coreCritique:
            'JSON serialization on the hot path will destroy p99 latency; data structures must be zero-allocation.',
          strengths: ['Low baseline CPU under idle conditions'],
          vulnerabilities: ['GC pauses under high throughput', 'Excessive memory copies across network boundaries'],
          requiredInvariants: [
            'Hot-path operations must be $O(1)$ time complexity with zero heap allocations.',
            'Use compact binary delta encoding (VarInt/Protobuf/CRDT vectors) instead of JSON.',
          ],
          proposedAlternative: 'Memory-mapped ring buffer with SIMD-accelerated delta validation.',
        },
      };
    }

    if (sysMsg.includes('API design') || userMsg.includes('The DX & Ergonomics Purist')) {
      return {
        content: '',
        model: 'mock-engine',
        parsedJson: {
          coreCritique: 'The API must be usable with zero ceremony and single-line imports.',
          strengths: ['Intuitive naming conventions'],
          vulnerabilities: ['Too many configuration knobs in initial constructor'],
          requiredInvariants: ['Default configuration must work out of the box with zero boilerplate.'],
          proposedAlternative: 'Builder pattern with ergonomic functional defaults.',
        },
      };
    }

    if (sysMsg.includes('Security Engineer') || userMsg.includes('The Security & Resilience Auditor')) {
      return {
        content: '',
        model: 'mock-engine',
        parsedJson: {
          coreCritique: 'Every trust boundary must validate memory bounds and input sanitization.',
          strengths: ['Typed schema interfaces'],
          vulnerabilities: ['Potential SQL / memory injection if raw strings are concatenated'],
          requiredInvariants: ['Must use parameterized queries and strict schema bounds at the perimeter.'],
          proposedAlternative: 'Zero-trust capability tokens for state mutations.',
        },
      };
    }

    if (sysMsg.includes('pragmatist') || userMsg.includes('The Pragmatist')) {
      return {
        content: '',
        model: 'mock-engine',
        parsedJson: {
          coreCritique: 'Avoid adding unnecessary cloud daemons when an embedded database suffices.',
          strengths: ['Solves immediate user problem'],
          vulnerabilities: ['Over-engineering with premature microservices'],
          requiredInvariants: ['Architecture must run locally on a developer laptop with single command.'],
          proposedAlternative: 'Start with an embedded modular monolith.',
        },
      };
    }

    // 3. Topologies Check
    if (userMsg.includes('First-Principles Deconstruction Engine') || userMsg.includes('"topology": "first-principles"')) {
      return {
        content: '',
        model: 'mock-engine',
        parsedJson: {
          topology: 'first-principles',
          title: 'First-Principles Deconstruction',
          deconstructedAxioms: [
            'Axiom 1: Core state mutations are bounded by network I/O and serialized memory bandwidth, not CPU cycles.',
            'Axiom 2: Global consensus is mathematically unnecessary if updates are commutative or partitioned by tenant key.',
            'Axiom 3: The minimal operational primitive is an in-memory lock-free ring buffer backed by an asynchronous append-only log (WAL).',
          ],
        },
      };
    }

    if (userMsg.includes('Inversion & Anti-Problem Engine') || userMsg.includes('"topology": "inversion"')) {
      return {
        content: '',
        model: 'mock-engine',
        parsedJson: {
          topology: 'inversion',
          title: 'Inversion & Failure Invariants',
          antiProblemFailures: [
            'Unbounded memory allocation during message spikes causing OOM crashes.',
            'Split-brain state corruption during network partition when multiple nodes accept writes.',
            'Thundering herd on cache expiration overwhelming the primary store.',
          ],
        },
      };
    }

    if (userMsg.includes('TRIZ') || userMsg.includes('"topology": "triz"')) {
      return {
        content: '',
        model: 'mock-engine',
        parsedJson: {
          topology: 'triz',
          title: 'TRIZ Contradiction Resolution',
          trizContradictions: [
            {
              improvingParameter: 'Read Latency (<1ms)',
              worseningParameter: 'Write Amplification & Memory Footprint',
              inventivePrinciple: 'Principle 19: Periodic Batched Commit & Inversion of Control',
              resolution:
                'Clients compute deterministic state deltas locally; server validates hashes and flushes sequentially to disk in micro-batches.',
            },
          ],
        },
      };
    }

    if (userMsg.includes('SCAMPER') || userMsg.includes('"topology": "scamper"')) {
      return {
        content: '',
        model: 'mock-engine',
        parsedJson: {
          topology: 'scamper',
          title: 'SCAMPER Architectural Mutation',
          scamperMutations: [
            {
              operator: 'Substitute',
              mutation: 'Substitute central Redis broker with local thread-pinned ring buffers and epoll event loops.',
              verdict: 'Eliminates network serialization latency; achieves 10x higher throughput.',
            },
            {
              operator: 'Eliminate',
              mutation: 'Eliminate heavyweight microservice wrappers; embed as a single static Go/Rust binary or shared library.',
              verdict: 'Radically simplifies operational footprint and zero-downtime deployment.',
            },
          ],
        },
      };
    }

    if (userMsg.includes('Tree-of-Thoughts') || userMsg.includes('"topology": "tree-of-thoughts"')) {
      return {
        content: '',
        model: 'mock-engine',
        parsedJson: {
          topology: 'tree-of-thoughts',
          title: 'Tree-of-Thoughts Exploration',
          candidateBranches: [
            {
              id: 'branch_zero_copy',
              title: 'Branch A: Lock-Free In-Memory Ring Buffer with WAL',
              description: 'Zero-copy shared memory architecture for extreme sub-millisecond p99 throughput.',
              pros: ['Zero network hop overhead', 'Sub-millisecond p99 latency', 'Trivial memory footprint'],
              cons: ['Requires deterministic state replay upon restart'],
            },
            {
              id: 'branch_sqlite_embedded',
              title: 'Branch B: Embedded SQLite with WAL & In-Memory Cache',
              description: 'Pragmatic, zero-dependency embedded database with ACID guarantees.',
              pros: ['Zero external infrastructure', 'Rich SQL query capability', 'Proven ACID durability'],
              cons: ['Single-writer lock contention under high concurrent writes'],
            },
          ],
        },
      };
    }

    // Default fallback
    return {
      content: '',
      model: 'mock-engine',
      parsedJson: {
        topology: 'first-principles',
        title: 'First-Principles Deconstruction',
        deconstructedAxioms: ['Axiom: Evaluated constraint'],
      },
    };
  }
}
