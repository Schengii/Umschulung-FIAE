import type { Transaction, AssetCategory } from '../types';

export interface PPExportRecord {
  Datum: string;
  Typ: string;
  Wert: string;
  Buchungswährung: string;
  Steuern: string;
  Gebühren: string;
  Stücke: string;
  ISIN: string;
  WKN: string;
  Ticker: string;
  Wertpapiername: string;
  Notiz: string;
}

/**
 * Parses Portfolio Performance CSV export
 */
export function parsePortfolioPerformanceCsv(csvText: string): Transaction[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));

  const getCol = (cols: string[], name: string) => {
    const idx = headers.findIndex(h => h.toLowerCase() === name.toLowerCase());
    return idx !== -1 ? cols[idx]?.replace(/^["']|["']$/g, '').trim() : '';
  };

  const parsedTxs: Transaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(delimiter);
    if (row.length < 3) continue;

    const rawType = getCol(row, 'Typ') || getCol(row, 'Type') || 'Kauf';
    const rawDate = getCol(row, 'Datum') || getCol(row, 'Date') || new Date().toISOString().split('T')[0];
    const rawShares = getCol(row, 'Stücke') || getCol(row, 'Shares') || '1';
    const rawValue = getCol(row, 'Wert') || getCol(row, 'Value') || '0';
    const rawTicker = getCol(row, 'Ticker-Symbol') || getCol(row, 'Ticker') || getCol(row, 'ISIN') || 'PP_IMPORT';
    const rawName = getCol(row, 'Wertpapiername') || getCol(row, 'Name') || rawTicker;
    const rawFee = getCol(row, 'Gebühren') || getCol(row, 'Fees') || '0';
    const rawTax = getCol(row, 'Steuern') || getCol(row, 'Taxes') || '0';
    const rawCurrency = (getCol(row, 'Buchungswährung') || getCol(row, 'Currency') || 'EUR') as any;

    // Convert type
    let type: Transaction['type'] = 'BUY';
    const typeUpper = rawType.toUpperCase();
    if (typeUpper.includes('KAUF') || typeUpper.includes('BUY')) type = 'BUY';
    else if (typeUpper.includes('VERKAUF') || typeUpper.includes('SELL')) type = 'SELL';
    else if (typeUpper.includes('DIVIDENDE') || typeUpper.includes('DIVIDEND')) type = 'DIVIDEND';
    else if (typeUpper.includes('EINLAGE') || typeUpper.includes('DEPOSIT')) type = 'DEPOSIT';
    else if (typeUpper.includes('ENTNAHME') || typeUpper.includes('WITHDRAWAL')) type = 'WITHDRAWAL';
    else if (typeUpper.includes('ZINSEN') || typeUpper.includes('INTEREST')) type = 'INTEREST';

    const parseNum = (s: string) => {
      if (!s) return 0;
      const clean = s.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
      return parseFloat(clean) || 0;
    };

    const shares = Math.abs(parseNum(rawShares)) || 1;
    const totalVal = Math.abs(parseNum(rawValue));
    const price = shares > 0 && totalVal > 0 ? (totalVal / shares) : (totalVal || 1);
    const fee = Math.abs(parseNum(rawFee));
    const tax = Math.abs(parseNum(rawTax));

    // Guess category
    let category: AssetCategory = 'Stock';
    if (rawName.toLowerCase().includes('etf') || rawName.toLowerCase().includes('ishares') || rawName.toLowerCase().includes('vanguard')) {
      category = 'ETF';
    } else if (rawName.toLowerCase().includes('bitcoin') || rawName.toLowerCase().includes('crypto') || rawTicker === 'BTC' || rawTicker === 'ETH') {
      category = 'Crypto';
    }

    parsedTxs.push({
      id: `pp-tx-${Date.now()}-${i}`,
      type,
      date: rawDate.includes('-') ? rawDate.split('-').reverse().join('.') : rawDate,
      ticker: rawTicker,
      name: rawName,
      amount: shares,
      price,
      fee,
      tax,
      category,
      currency: ['EUR', 'USD', 'CHF', 'GBP'].includes(rawCurrency) ? rawCurrency : 'EUR'
    });
  }

  return parsedTxs;
}

/**
 * Exports transactions to Portfolio Performance compatible CSV
 */
export function exportToPortfolioPerformanceCsv(transactions: Transaction[]): string {
  const header = 'Datum;Typ;Wert;Buchungswährung;Steuern;Gebühren;Stücke;Ticker;Wertpapiername;Notiz';
  
  const rows = transactions.map(tx => {
    const totalValue = (tx.amount * tx.price).toFixed(2).replace('.', ',');
    const typeLabel = tx.type === 'BUY' ? 'Kauf' 
      : tx.type === 'SELL' ? 'Verkauf' 
      : tx.type === 'DIVIDEND' ? 'Dividende' 
      : tx.type === 'DEPOSIT' ? 'Einlage' 
      : tx.type === 'WITHDRAWAL' ? 'Entnahme' 
      : tx.type === 'INTEREST' ? 'Zinsen' 
      : 'Kauf';

    const formattedDate = tx.date.includes('.') 
      ? tx.date.split('.').reverse().join('-') 
      : tx.date;

    return [
      formattedDate,
      typeLabel,
      totalValue,
      tx.currency || 'EUR',
      (tx.tax || 0).toFixed(2).replace('.', ','),
      (tx.fee || 0).toFixed(2).replace('.', ','),
      tx.amount.toString().replace('.', ','),
      tx.ticker,
      `"${(tx.name || tx.ticker).replace(/"/g, '""')}"`,
      `"${(tx.notes || '').replace(/"/g, '""')}"`
    ].join(';');
  });

  return [header, ...rows].join('\r\n');
}
