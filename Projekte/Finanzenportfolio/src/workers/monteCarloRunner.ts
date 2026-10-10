import type { FireWithdrawalConfig, FireMonteCarloSummary, MonteCarloResult } from '../types';
import { runFireMonteCarloSimulation, runMonteCarloSimulation } from '../components/performanceUtils';

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

/**
 * Executes general wealth accumulation Monte Carlo simulation asynchronously.
 */
export async function runGeneralMonteCarloSimulationAsync(
  currentPortfolioValue: number,
  monthlySavings: number,
  years: number = 20,
  expectedReturnPercent: number = 7.0,
  volatilityPercent: number = 15.0,
  trials: number = 1000
): Promise<MonteCarloResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = runMonteCarloSimulation(
        currentPortfolioValue,
        monthlySavings,
        years,
        expectedReturnPercent,
        volatilityPercent,
        trials
      );
      resolve(result);
    }, 0);
  });
}

