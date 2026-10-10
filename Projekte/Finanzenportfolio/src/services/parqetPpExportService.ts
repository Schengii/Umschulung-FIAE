import type { Transaction, Holding } from '../types';

export interface ParqetExportActivity {
  type: string;
  datetime: string;
  asset: {
    name: string;
    assetType?: string;
    isin?: string;
    ticker?: string;
    currency?: string;
  };
  shares: number;
  price: number;
  amount: number;
  fee?: number;
  tax?: number;
}

export interface ParqetExportJson {
  version?: number;
  exportDate?: string;
  activities: ParqetExportActivity[];
}

/**
 * Transforms transactions into Parqet-compatible JSON activities format.
 */
export function generateParqetJsonExport(
  transactions: Transaction[],
  holdings: Holding[] = []
): ParqetExportJson {
  const holdingMap = new Map<string, Holding>();
  holdings.forEach(h => {
    holdingMap.set(h.ticker, h);
    if (h.name) holdingMap.set(h.name.toLowerCase(), h);
  });

  const activities: ParqetExportActivity[] = transactions.map(tx => {
    const holding = holdingMap.get(tx.ticker);

    let type = 'Buy';
    switch (tx.type) {
      case 'SELL':
        type = 'Sell';
        break;
      case 'DIVIDEND':
        type = 'Dividend';
        break;
      case 'INTEREST':
        type = 'Interest';
        break;
      case 'FEE':
        type = 'Fee';
        break;
      case 'DEPOSIT':
        type = 'CashIn';
        break;
      case 'WITHDRAWAL':
        type = 'CashOut';
        break;
      default:
        type = 'Buy';
    }

    // Convert date string DD.MM.YYYY to ISO 8601
    let isoDate = new Date().toISOString();
    if (tx.date && tx.date.includes('.')) {
      const parts = tx.date.split('.');
      if (parts.length === 3) {
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const y = parts[2];
        isoDate = `${y}-${m}-${d}T12:00:00.000Z`;
      }
    } else if (tx.date) {
      isoDate = new Date(tx.date).toISOString();
    }

    const netAmount = Math.abs(tx.amount * tx.price);

    return {
      type,
      datetime: isoDate,
      asset: {
        name: tx.name || holding?.name || tx.ticker,
        assetType: tx.category === 'Crypto' ? 'Crypto' : tx.category === 'ETF' ? 'ETF' : 'Security',
        ticker: tx.ticker,
        currency: tx.currency || 'EUR'
      },
      shares: tx.amount || 1,
      price: tx.price || 0,
      amount: netAmount,
      fee: tx.fee || 0,
      tax: tx.tax || 0
    };
  });

  return {
    version: 1,
    exportDate: new Date().toISOString(),
    activities
  };
}

/**
 * Generates a standard Portfolio Performance CSV string (Datum;Typ;Wertpapiername;ISIN;Ticker-Symbol;Währung;Stück;Kurs;Gesamtbetrag;Gebühren;Steuern)
 */
export function generatePortfolioPerformanceCsv(
  transactions: Transaction[]
): string {
  const headers = [
    'Datum',
    'Typ',
    'Wertpapiername',
    'Ticker-Symbol',
    'Währung',
    'Stück',
    'Kurs',
    'Gesamtbetrag',
    'Gebühren',
    'Steuern',
    'Notiz'
  ];

  const rows = transactions.map(tx => {
    let ppType = 'Kauf';
    switch (tx.type) {
      case 'SELL':
        ppType = 'Verkauf';
        break;
      case 'DIVIDEND':
        ppType = 'Dividende';
        break;
      case 'INTEREST':
        ppType = 'Zinsen';
        break;
      case 'FEE':
        ppType = 'Gebühren';
        break;
      case 'DEPOSIT':
        ppType = 'Einlage';
        break;
      case 'WITHDRAWAL':
        ppType = 'Entnahme';
        break;
      default:
        ppType = 'Kauf';
    }

    const totalVal = (tx.amount * tx.price).toFixed(2).replace('.', ',');
    const priceFormatted = tx.price.toFixed(4).replace('.', ',');
    const sharesFormatted = tx.amount.toString().replace('.', ',');
    const feeFormatted = (tx.fee || 0).toFixed(2).replace('.', ',');
    const taxFormatted = (tx.tax || 0).toFixed(2).replace('.', ',');
    const cleanName = (tx.name || '').replace(/;/g, ',');
    const cleanNote = (tx.notes || '').replace(/;/g, ',');

    return [
      tx.date,
      ppType,
      cleanName,
      tx.ticker,
      tx.currency || 'EUR',
      sharesFormatted,
      priceFormatted,
      totalVal,
      feeFormatted,
      taxFormatted,
      cleanNote
    ].join(';');
  });

  return [headers.join(';'), ...rows].join('\r\n');
}

/**
 * Browser download helper for Parqet JSON export.
 */
export function downloadParqetJsonFile(
  transactions: Transaction[],
  holdings: Holding[] = [],
  filename: string = 'parqet_export.json'
): void {
  const data = generateParqetJsonExport(transactions, holdings);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Browser download helper for Portfolio Performance CSV export.
 */
export function downloadPortfolioPerformanceCsvFile(
  transactions: Transaction[],
  filename: string = 'portfolio_performance_export.csv'
): void {
  const csv = generatePortfolioPerformanceCsv(transactions);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
