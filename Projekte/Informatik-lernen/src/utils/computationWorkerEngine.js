/**
 * Web Worker & Concurrency Computation Engine
 * Vergleicht Main-Thread (UI Blocking) vs. Dedicated Worker Thread Performance
 */

/**
 * Rechenintensiver Primzahl-Sieve Algorithmus (CPU-Bound Benchmark)
 */
export function calculatePrimes(maxLimit = 100000) {
  const limit = Math.min(maxLimit, 500000);
  const sieve = new Uint8Array(limit + 1);
  const primes = [];

  for (let i = 2; i <= limit; i++) {
    if (!sieve[i]) {
      primes.push(i);
      for (let j = i * 2; j <= limit; j += i) {
        sieve[j] = 1;
      }
    }
  }

  return {
    primeCount: primes.length,
    largestPrime: primes[primes.length - 1] || 0,
    limit
  };
}

/**
 * Monte-Carlo URE (Unrecoverable Read Error) Simulation für RAID-Systeme
 */
export function runMonteCarloUreSimulation(iterations = 10000, diskSizeBytes = 8e12, ureRate = 1e-14) {
  const safeIterations = Math.min(iterations, 100000);
  let ureCount = 0;
  
  // Analytische Wahrscheinlichkeit: P = 1 - (1 - ureRate)^(bits)
  const totalBits = diskSizeBytes * 8;
  const analyticProb = 1 - Math.pow(1 - ureRate, totalBits);

  for (let i = 0; i < safeIterations; i++) {
    if (Math.random() < analyticProb) {
      ureCount++;
    }
  }

  const simulatedProb = safeIterations > 0 ? ureCount / safeIterations : 0;

  return {
    iterations: safeIterations,
    ureOccurrences: ureCount,
    simulatedRatePercent: (simulatedProb * 100).toFixed(2),
    analyticRatePercent: (analyticProb * 100).toFixed(2)
  };
}

/**
 * Benchmark Runner mit Zeitmessung
 */
export function executeBenchmarkTask(type = 'primes', params = {}) {
  const startTime = performance.now();
  let result;

  if (type === 'ure_monte_carlo') {
    result = runMonteCarloUreSimulation(params.iterations, params.diskSize, params.ureRate);
  } else {
    result = calculatePrimes(params.limit || 100000);
  }

  const endTime = performance.now();
  const executionTimeMs = parseFloat((endTime - startTime).toFixed(2));

  return {
    type,
    executionTimeMs,
    result,
    isUiThreadBlockedWarning: executionTimeMs > 50 // Mehr als 50ms blockiert 60fps Event Loop
  };
}
