/**
 * German Labour Law (Arbeitszeitgesetz - ArbZG) Calculation Helpers
 */

export interface ArbZGResult {
  grossDurationMs: number;
  actualPauseMs: number;
  mandatoryPauseMs: number;
  effectivePauseMs: number;
  netDurationMs: number;
  exceedsSixHours: boolean;
  exceedsNineHours: boolean;
  exceedsTenHoursLimit: boolean;
  warningMessage: string | null;
}

/**
 * Calculates mandatory pause and net working time according to ArbZG § 4 & § 3.
 *
 * ArbZG § 4:
 * - > 6 hours work: min 30 min break
 * - > 9 hours work: min 45 min break
 *
 * ArbZG § 3:
 * - Max 10 hours work per day warning
 */
export function calculateArbZG(
  grossDurationMs: number,
  actualPauseMs: number = 0,
  enabled: boolean = true
): ArbZGResult {
  if (!enabled || grossDurationMs <= 0) {
    const net = Math.max(0, grossDurationMs - actualPauseMs);
    const exceedsTen = net > 10 * 3600 * 1000;
    return {
      grossDurationMs,
      actualPauseMs,
      mandatoryPauseMs: 0,
      effectivePauseMs: actualPauseMs,
      netDurationMs: net,
      exceedsSixHours: grossDurationMs > 6 * 3600 * 1000,
      exceedsNineHours: grossDurationMs > 9 * 3600 * 1000,
      exceedsTenHoursLimit: exceedsTen,
      warningMessage: exceedsTen
        ? "Achtung: Die maximale tägliche Arbeitszeit von 10 Stunden (ArbZG §3) wurde überschritten!"
        : null,
    };
  }

  const M30 = 30 * 60 * 1000;
  const M45 = 45 * 60 * 1000;
  const H6 = 6 * 3600 * 1000;
  const H9 = 9 * 3600 * 1000;
  const H10 = 10 * 3600 * 1000;

  let mandatoryPauseMs = 0;
  let warningMessage: string | null = null;

  if (grossDurationMs > H9) {
    mandatoryPauseMs = M45;
  } else if (grossDurationMs > H6) {
    mandatoryPauseMs = M30;
  }

  const effectivePauseMs = Math.max(actualPauseMs, mandatoryPauseMs);
  const netDurationMs = Math.max(0, grossDurationMs - effectivePauseMs);

  if (netDurationMs > H10) {
    warningMessage =
      "Achtung: Die maximale tägliche Arbeitszeit von 10 Stunden (ArbZG §3) wurde überschritten!";
  } else if (mandatoryPauseMs > actualPauseMs) {
    const diffMinutes = Math.round((mandatoryPauseMs - actualPauseMs) / (60 * 1000));
    warningMessage = `Gesetzlicher Pausenabzug: Es wurden automatisch ${diffMinutes} Min. Pause nach ArbZG §4 angerechnet.`;
  }

  return {
    grossDurationMs,
    actualPauseMs,
    mandatoryPauseMs,
    effectivePauseMs,
    netDurationMs,
    exceedsSixHours: grossDurationMs > H6,
    exceedsNineHours: grossDurationMs > H9,
    exceedsTenHoursLimit: netDurationMs > H10,
    warningMessage,
  };
}
