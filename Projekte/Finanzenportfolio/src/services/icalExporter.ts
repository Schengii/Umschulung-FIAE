import type { Transaction, Holding, DepositLadderItem } from '../types';

export interface CalendarExportOptions {
  includePastDividends: boolean;
  includeForecastDividends: boolean;
  includeDepositMaturities: boolean;
  monthsAhead: number; // e.g. 3, 6, 12
}

/**
 * Generates an iCalendar (.ics) string containing dividend payment dates,
 * estimated future pay dates, and deposit ladder maturities.
 */
export function generateComprehensiveIcalContent(
  transactions: Transaction[],
  holdings: Holding[],
  deposits: DepositLadderItem[] = [],
  options: CalendarExportOptions = {
    includePastDividends: true,
    includeForecastDividends: true,
    includeDepositMaturities: true,
    monthsAhead: 12
  }
): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FinanzPortfolio CoPilot//Finanz & Dividenden Kalender//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Finanz & Dividenden Termine'
  ];

  const now = new Date();
  const formatUtcDate = (d: Date): string => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}${m}${day}T090000Z`;
  };

  // 1. Past Dividends
  if (options.includePastDividends) {
    const divTxs = transactions.filter(t => t.type === 'DIVIDEND');
    divTxs.forEach((tx, idx) => {
      const parts = tx.date.split('.');
      if (parts.length === 3) {
        const year = parts[2];
        const month = parts[1].padStart(2, '0');
        const day = parts[0].padStart(2, '0');
        const dtStart = `${year}${month}${day}T090000Z`;
        const dtEnd = `${year}${month}${day}T100000Z`;

        lines.push(
          'BEGIN:VEVENT',
          `UID:div-past-${tx.id || idx}@finanzenportfolio.copilot`,
          `DTSTAMP:${dtStart}`,
          `DTSTART:${dtStart}`,
          `DTEND:${dtEnd}`,
          `SUMMARY:💰 Dividende: ${tx.name} (${tx.ticker})`,
          `DESCRIPTION:Erhalt von Dividende für ${tx.amount} Anteile von ${tx.name}. Brutto: ${(tx.amount * tx.price).toFixed(2)} EUR.`,
          'STATUS:CONFIRMED',
          'END:VEVENT'
        );
      }
    });
  }

  // 2. Forecasted Future Dividend Pay Dates (Next N Months)
  if (options.includeForecastDividends && holdings.length > 0) {
    const divHoldings = holdings.filter(h => h.category !== 'Crypto' && h.yieldOnCost > 0 && h.shares > 0);

    for (let m = 1; m <= options.monthsAhead; m++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() + m, 15);
      const targetMonthIndex = targetDate.getMonth(); // 0 to 11

      divHoldings.forEach((h, hIdx) => {
        // Estimate quarterly vs monthly distribution
        // Standard US/EU stocks distribute quarterly or annually
        const isQuarterly = (targetMonthIndex % 3 === 0);
        const isMonthly = h.name.toLowerCase().includes('reit') || h.ticker === 'O';
        const isAnnualGerman = (targetMonthIndex === 4 || targetMonthIndex === 5) && h.region === 'Europe';

        if (isMonthly || isQuarterly || isAnnualGerman) {
          const annualDividendEur = (h.currentValue * (h.yieldOnCost / 100));
          const payoutPerCycle = isMonthly ? annualDividendEur / 12 : isQuarterly ? annualDividendEur / 4 : annualDividendEur;

          if (payoutPerCycle > 0.5) {
            const dtStart = formatUtcDate(targetDate);
            const dtEnd = formatUtcDate(new Date(targetDate.getTime() + 60 * 60 * 1000));

            lines.push(
              'BEGIN:VEVENT',
              `UID:div-forecast-${h.ticker}-${m}-${hIdx}@finanzenportfolio.copilot`,
              `DTSTAMP:${dtStart}`,
              `DTSTART:${dtStart}`,
              `DTEND:${dtEnd}`,
              `SUMMARY:📅 Zahltag-Prognose: ${h.name} (${h.ticker})`,
              `DESCRIPTION:Geschätzte Dividendenausschüttung von ca. ${payoutPerCycle.toFixed(2)} EUR auf Basis von ${h.shares.toFixed(2)} Anteilen (${h.yieldOnCost.toFixed(1)}% Dividendenrendite).`,
              'STATUS:TENTATIVE',
              'END:VEVENT'
            );
          }
        }
      });
    }
  }

  // 3. Deposit Ladder Maturities (Fälligkeitstermine von Festgeldern)
  if (options.includeDepositMaturities && deposits.length > 0) {
    deposits.forEach((dep, idx) => {
      const parts = dep.maturityDate.split('.');
      if (parts.length === 3) {
        const year = parts[2];
        const month = parts[1].padStart(2, '0');
        const day = parts[0].padStart(2, '0');
        const dtStart = `${year}${month}${day}T090000Z`;
        const dtEnd = `${year}${month}${day}T100000Z`;
        const interestEarned = (dep.principalEur * (dep.interestRatePercent / 100)).toFixed(2);

        lines.push(
          'BEGIN:VEVENT',
          `UID:dep-maturity-${dep.id || idx}@finanzenportfolio.copilot`,
          `DTSTAMP:${dtStart}`,
          `DTSTART:${dtStart}`,
          `DTEND:${dtEnd}`,
          `SUMMARY:🏦 Fälligkeit: ${dep.depositType} ${dep.bankName}`,
          `DESCRIPTION:Fälligkeit von ${dep.principalEur.toLocaleString('de-DE')} EUR zu ${dep.interestRatePercent.toFixed(2)}% Zinsen bei ${dep.bankName}. Erwartete Zinsen: +${interestEarned} EUR.`,
          'STATUS:CONFIRMED',
          'END:VEVENT'
        );
      }
    });
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Initiates the direct file download of the comprehensive .ics file.
 */
export function downloadComprehensiveCalendar(
  transactions: Transaction[],
  holdings: Holding[],
  deposits: DepositLadderItem[] = [],
  options?: CalendarExportOptions
): void {
  const content = generateComprehensiveIcalContent(transactions, holdings, deposits, options);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `finanz_kalender_${new Date().toISOString().split('T')[0]}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
