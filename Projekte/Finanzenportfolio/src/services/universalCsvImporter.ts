import type { Transaction, AssetCategory } from '../types';

export interface UniversalCsvImportResult {
  detectedFormat: string;
  transactions: Transaction[];
  failedCount: number;
}

export function parseUniversalCsv(csvText: string): UniversalCsvImportResult {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) {
    return { detectedFormat: 'Unbekannt', transactions: [], failedCount: 0 };
  }

  const header = lines[0].toLowerCase();

  if (header.includes('datum') && (header.includes('typ') || header.includes('wertpapier')) && (header.includes('stück') || header.includes('stuck') || header.includes('stk'))) {
    return parsePortfolioPerformanceCsv(lines);
  } else if (header.includes('holding') || header.includes('isin') || header.includes('asset type')) {
    return parseParqetCsv(lines);
  } else if (header.includes('trade republic') || header.includes('is_tax') || header.includes('cash_flow')) {
    return parseTradeRepublicCsv(lines);
  }

  return parseGenericCsv(lines);
}

function parsePortfolioPerformanceCsv(lines: string[]): UniversalCsvImportResult {
  const transactions: Transaction[] = [];
  let failedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 5) continue;

    try {
      const date = cols[0] || new Date().toLocaleDateString('de-DE');
      const rawType = (cols[1] || '').toUpperCase();
      let type: Transaction['type'] = 'BUY';
      if (rawType.includes('VERKAUF') || rawType.includes('SELL')) type = 'SELL';
      else if (rawType.includes('DIVIDEN') || rawType.includes('PAYMENT')) type = 'DIVIDEND';
      else if (rawType.includes('EINZAHLUNG') || rawType.includes('DEPOSIT')) type = 'DEPOSIT';
      else if (rawType.includes('AUSZAHLUNG') || rawType.includes('WITHDRAWAL')) type = 'WITHDRAWAL';

      const name = cols[2] || 'Asset';
      const ticker = cols[3] || name.slice(0, 5).toUpperCase();
      const amount = Math.abs(parseFloat((cols[4] || '1').replace(',', '.')));
      const price = Math.abs(parseFloat((cols[5] || '0').replace(',', '.')));

      let category: AssetCategory = 'Stock';
      if (name.toLowerCase().includes('etf') || name.toLowerCase().includes('msci')) category = 'ETF';
      else if (ticker.startsWith('XC') || name.toLowerCase().includes('bitcoin')) category = 'Crypto';

      transactions.push({
        id: `pp-csv-${Date.now()}-${i}`,
        type,
        date,
        ticker,
        name,
        amount: isNaN(amount) ? 1 : amount,
        price: isNaN(price) ? 0 : price,
        fee: 0,
        tax: 0,
        category,
        currency: 'EUR'
      });
    } catch {
      failedCount++;
    }
  }

  return {
    detectedFormat: 'Portfolio Performance CSV',
    transactions,
    failedCount
  };
}

function parseParqetCsv(lines: string[]): UniversalCsvImportResult {
  const transactions: Transaction[] = [];
  let failedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 4) continue;

    try {
      const date = cols[0] || new Date().toLocaleDateString('de-DE');
      const name = cols[1] || 'Asset';
      const ticker = cols[2] || 'UNKNOWN';
      const typeStr = (cols[3] || '').toUpperCase();
      let type: Transaction['type'] = typeStr.includes('SELL') ? 'SELL' : typeStr.includes('DIVIDEND') ? 'DIVIDEND' : 'BUY';
      const amount = parseFloat((cols[4] || '1').replace(',', '.'));
      const price = parseFloat((cols[5] || '0').replace(',', '.'));

      transactions.push({
        id: `parqet-csv-${Date.now()}-${i}`,
        type,
        date,
        ticker,
        name,
        amount: isNaN(amount) ? 1 : amount,
        price: isNaN(price) ? 0 : price,
        fee: 0,
        tax: 0,
        category: name.toLowerCase().includes('etf') ? 'ETF' : 'Stock',
        currency: 'EUR'
      });
    } catch {
      failedCount++;
    }
  }

  return {
    detectedFormat: 'Parqet CSV',
    transactions,
    failedCount
  };
}

function parseTradeRepublicCsv(lines: string[]): UniversalCsvImportResult {
  return parseGenericCsv(lines, 'Trade Republic CSV');
}

function parseGenericCsv(lines: string[], formatName = 'Generisches CSV'): UniversalCsvImportResult {
  const transactions: Transaction[] = [];
  let failedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 3) continue;

    try {
      const date = cols[0] || new Date().toLocaleDateString('de-DE');
      const name = cols[1] || 'Imported Asset';
      const ticker = cols[2] || name.slice(0, 6).toUpperCase();
      const amount = parseFloat((cols[3] || '1').replace(',', '.'));
      const price = parseFloat((cols[4] || '100').replace(',', '.'));

      transactions.push({
        id: `gen-csv-${Date.now()}-${i}`,
        type: 'BUY',
        date,
        ticker,
        name,
        amount: isNaN(amount) ? 1 : amount,
        price: isNaN(price) ? 100 : price,
        fee: 0,
        tax: 0,
        category: name.toLowerCase().includes('etf') ? 'ETF' : 'Stock',
        currency: 'EUR'
      });
    } catch {
      failedCount++;
    }
  }

  return {
    detectedFormat: formatName,
    transactions,
    failedCount
  };
}

function parseCsvLine(line: string): string[] {
  const delimiter = line.includes(';') ? ';' : ',';
  return line.split(delimiter).map(col => col.replace(/^"(.*)"$/, '$1').trim());
}
