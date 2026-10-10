export const DEFAULT_EXCHANGE_RATES = {
  EUR: 1.0,
  USD: 1.08,
  CHF: 0.96,
  GBP: 0.85,
};

export function convertCurrency(
  amount: number,
  from: 'EUR' | 'USD' | 'CHF' | 'GBP',
  to: 'EUR' | 'USD' | 'CHF' | 'GBP',
  rateMap: Record<string, number> = DEFAULT_EXCHANGE_RATES
): number {
  if (from === to) return amount;
  // Convert from input currency to EUR
  const amountInEur = amount / (rateMap[from] || 1.0);
  // Convert from EUR to target currency
  return amountInEur * (rateMap[to] || 1.0);
}

// Convert string date DD.MM.YYYY to Date object
export function parseDateString(dateStr: string): Date {
  const parts = dateStr.split('.');
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }
  return new Date(dateStr); // Fallback
}
