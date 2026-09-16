import { describe, it, expect } from 'vitest';
import { 
  calculatePrimes, 
  runMonteCarloUreSimulation, 
  executeBenchmarkTask 
} from './computationWorkerEngine';

describe('computationWorkerEngine (Concurrency & Web Worker Benchmarking)', () => {
  it('berechnet Primzahlen deterministisch via Sieve', () => {
    const result = calculatePrimes(100);
    // Unter 100 gibt es 25 Primzahlen (2, 3, 5, ..., 97)
    expect(result.primeCount).toBe(25);
    expect(result.largestPrime).toBe(97);
  });

  it('führt Monte-Carlo URE-Simulation durch', () => {
    const sim = runMonteCarloUreSimulation(500, 4e12, 1e-14);
    expect(sim.iterations).toBe(500);
    expect(parseFloat(sim.analyticRatePercent)).toBeGreaterThan(0);
  });

  it('misst Ausführungszeit und identifiziert Event-Loop-Blockaden (>50ms)', () => {
    const bench = executeBenchmarkTask('primes', { limit: 10000 });
    expect(bench.executionTimeMs).toBeGreaterThanOrEqual(0);
    expect(bench.result.primeCount).toBe(1229); // Exakt 1229 Primzahlen <= 10.000
    expect(typeof bench.isUiThreadBlockedWarning).toBe('boolean');
  });
});
