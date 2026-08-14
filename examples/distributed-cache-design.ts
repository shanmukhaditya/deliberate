import deliberate from '../src/index.js';

async function main() {
  console.log('=== Running Deliberate Programmatic SDK Example ===\n');

  const result = await deliberate.brainstorm({
    goal: 'Architect an ultra-low latency (<500μs) real-time state sync for a collaborative document editor',
    mode: 'council',
    provider: 'mock',
    constraints: [
      'Must run with zero external cluster dependencies',
      'P99 latency must stay under 1 millisecond',
      'Must withstand network partitions without data corruption',
    ],
  });

  console.log('Synthesized Architecture:', result.blueprint.winningArchitecture.title);
  console.log('Pareto Overall Score:', result.blueprint.winningArchitecture.overallScore, '/ 10');
  console.log('\nCore Invariants:');
  result.blueprint.coreInvariants.forEach((inv, i) => console.log(` [${i + 1}] ${inv}`));

  console.log('\nImplementation Steps:');
  result.blueprint.implementationSteps.forEach((step) => console.log(` - ${step}`));
}

main().catch(console.error);
