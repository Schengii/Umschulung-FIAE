import type { Transaction, AssetCategory } from '../types';

export interface UniversalCsvImportResult {
  detectedFormat: string;
  transactions: Transaction[];
  failedCount: number;
}

export function parseUniversalCsv(csvText: string): UniversalCsvImportResult {
  const trimmed = csvText.trim();
  
  // 1. Check for JSON format (e.g. Parqet JSON export or Finanzenportfolio JSON Backup)
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      return parseJsonImport(parsed);
    } catch {
      // Fallback to CSV parser
    }
  }

  const lines = trimmed.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) {
    return { detectedFormat: 'Unbekannt', transactions: [], failedCount: 0 };
  }

  const header = lines[0].toLowerCase();

  if (header.includes('statement') || header.includes('trades') || header.includes('interactive brokers') || header.includes('symbol') && header.includes('t. price') || lines.some(l => l.startsWith('Trades,Header'))) {
    return parseIbkrCsv(lines);
  } else if (header.includes('datum') && (header.includes('typ') || header.includes('wertpapier')) && (header.includes('stück') || header.includes('stuck') || header.includes('stk'))) {
    return parsePortfolioPerformanceCsv(lines);
  } else if (header.includes('holding') || header.includes('isin') || header.includes('asset type') || header.includes('asset_type')) {
    return parseParqetCsv(lines);
  } else if (header.includes('trade republic') || header.includes('is_tax') || header.includes('cash_flow')) {
    return parseTradeRepublicCsv(lines);
  }

  return parseFlexibleCsv(lines);
}

function parseJsonImport(json: any): UniversalCsvImportResult {
  const transactions: Transaction[] = [];
  let failedCount = 0;

  // Case A: Finanzenportfolio backup array
  if (Array.isArray(json)) {
    json.forEach(portfolio => {
      if (portfolio && Array.isArray(portfolio.transactions)) {
        transactions.push(...portfolio.transactions);
      }
    });
    return {
      detectedFormat: 'FinanzPortfolio JSON Backup',
      transactions,
      failedCount: 0
    };
  }

  // Case B: Parqet JSON export or single portfolio object
  const rawList = json.activities || json.transactions || (Array.isArray(json.holdings) ? json.holdings : []);
  if (Array.isArray(rawList)) {
    rawList.forEach((item: any, idx: number) => {
      try {
        const typeStr = (item.type || item.activityType || 'BUY').toUpperCase();
        let type: Transaction['type'] = 'BUY';
        if (typeStr.includes('SELL')) type = 'SELL';
        else if (typeStr.includes('DIVIDEND')) type = 'DIVIDEND';
        else if (typeStr.includes('DEPOSIT')) type = 'DEPOSIT';
        else if (typeStr.includes('WITHDRAW')) type = 'WITHDRAWAL';

        transactions.push({
          id: `json-import-${Date.now()}-${idx}`,
          type,
          date: item.date ? (item.date.includes('-') ? item.date.split('T')[0].split('-').reverse().join('.') : item.date) : new Date().toLocaleDateString('de-DE'),
          ticker: item.ticker || item.isin || item.symbol || 'ASSET',
          name: item.name || item.assetName || item.ticker || 'Imported Asset',
          amount: Math.abs(Number(item.shares || item.amount || 1)),
          price: Math.abs(Number(item.price || item.purchasePrice || 0)),
          fee: Number(item.fee || item.fees || 0),
          tax: Number(item.tax || item.taxes || 0),
          category: (item.assetType === 'Crypto' || item.category === 'Crypto') ? 'Crypto' : (item.assetType === 'ETF' || item.category === 'ETF') ? 'ETF' : 'Stock',
          currency: item.currency || 'EUR'
        });
      } catch {
        failedCount++;
      }
    });

    return {
      detectedFormat: 'Parqet JSON Export',
      transactions,
      failedCount
    };
  }

  return { detectedFormat: 'Unbekanntes JSON', transactions: [], failedCount: 1 };
}

function parseIbkrCsv(lines: string[]): UniversalCsvImportResult {
  const transactions: Transaction[] = [];
  let failedCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    // Look for IBKR trade lines: e.g. "Trades,Data,Order,Stocks,USD,AAPL,2026-01-15,..."
    if (cols.includes('Data') && (cols.includes('Trades') || cols.includes('Order') || cols.length >= 7)) {
      try {
        const symbolIdx = cols.findIndex(c => c.length >= 1 && c.length <= 6 && c === c.toUpperCase() && !['USD', 'EUR', 'BUY', 'SELL', 'DATA', 'TRADES', 'STK'].includes(c));
        const ticker = symbolIdx !== -1 ? cols[symbolIdx] : 'IBKR_ASSET';
        
        let type: Transaction['type'] = 'BUY';
        if (cols.some(c => c.toUpperCase() === 'SELL' || c.toUpperCase() === 'SL')) type = 'SELL';
        
        // Extract numbers
        const numCols = cols.map(c => parseFloat(c.replace(',', '.'))).filter(n => !isNaN(n) && n > 0);
        const amount = numCols[0] || 1;
        const price = numCols[1] || 100;

        transactions.push({
          id: `ibkr-csv-${Date.now()}-${i}`,
          type,
          date: new Date().toLocaleDateString('de-DE'),
          ticker,
          name: ticker,
          amount,
          price,
          fee: 1.0,
          tax: 0,
          category: ticker.includes('BTC') || ticker.includes('ETH') ? 'Crypto' : 'Stock',
          currency: 'USD'
        });
      } catch {
        failedCount++;
      }
    }
  }

  return {
    detectedFormat: 'Interactive Brokers (IBKR) CSV',
    transactions,
    failedCount
  };
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
      const fee = cols[6] ? Math.abs(parseFloat(cols[6].replace(',', '.'))) : 0;
      const tax = cols[7] ? Math.abs(parseFloat(cols[7].replace(',', '.'))) : 0;

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
        fee: isNaN(fee) ? 0 : fee,
        tax: isNaN(tax) ? 0 : tax,
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
      const amount = Math.abs(parseFloat((cols[4] || '1').replace(',', '.')));
      const price = Math.abs(parseFloat((cols[5] || '0').replace(',', '.')));

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
  return parseFlexibleCsv(lines, 'Trade Republic CSV');
}

function parseFlexibleCsv(lines: string[], formatName = 'Generisches CSV'): UniversalCsvImportResult {
  const transactions: Transaction[] = [];
  let failedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 3) continue;

    try {
      const date = cols[0] || new Date().toLocaleDateString('de-DE');
      const name = cols[1] || 'Imported Asset';
      const ticker = cols[2] || name.slice(0, 6).toUpperCase();
      const amount = Math.abs(parseFloat((cols[3] || '1').replace(',', '.')));
      const price = Math.abs(parseFloat((cols[4] || '100').replace(',', '.')));

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

export function exportToPortfolioPerformanceCsv(transactions: Transaction[]): string {
  const headers = ['Datum', 'Typ', 'Wertpapiername', 'ISIN/Ticker', 'Stück', 'Kurs', 'Gebühren', 'Steuern', 'Währung'];
  const lines = [headers.join(';')];

  transactions.forEach(tx => {
    let typeStr = 'Kauf';
    if (tx.type === 'SELL') typeStr = 'Verkauf';
    else if (tx.type === 'DIVIDEND') typeStr = 'Dividende';
    else if (tx.type === 'DEPOSIT') typeStr = 'Einzahlung';
    else if (tx.type === 'WITHDRAWAL') typeStr = 'Auszahlung';

    const row = [
      tx.date,
      typeStr,
      `"${tx.name.replace(/"/g, '""')}"`,
      tx.ticker,
      tx.amount.toString().replace('.', ','),
      tx.price.toString().replace('.', ','),
      (tx.fee || 0).toString().replace('.', ','),
      (tx.tax || 0).toString().replace('.', ','),
      tx.currency || 'EUR'
    ];
    lines.push(row.join(';'));
  });

  return lines.join('\n');
}


