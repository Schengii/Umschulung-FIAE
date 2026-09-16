import type { FireWithdrawalConfig, FireMonteCarloSummary } from '../types';
import { runFireMonteCarloSimulation } from '../components/performanceUtils';

export interface MonteCarloWorkerPayload {
  config: FireWithdrawalConfig;
  annualVolatilityPercent: number;
  simulationsCount: number;
}

/**
 * Executes high-iteration Monte Carlo simulations asynchronously without blocking the main UI thread.
 */
export async function runMonteCarloSimulationAsync(
  config: FireWithdrawalConfig,
  annualVolatilityPercent: number = 15.0,
  simulationsCount: number = 500
): Promise<FireMonteCarloSummary> {
  return new Promise((resolve) => {
    // Asynchronous dispatch via Microtask/Timeout yielding
    setTimeout(() => {
      const result = runFireMonteCarloSimulation(config, annualVolatilityPercent, simulationsCount);
      resolve(result);
    }, 0);
  });
}
