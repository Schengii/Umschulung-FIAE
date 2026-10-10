import type { AssetCategory, AssetMappingRule, Transaction } from '../types';

export interface ExtractedPdfTransaction {
  type: 'BUY' | 'SELL' | 'DIVIDEND' | 'STAKING' | 'INTEREST';
  date: string;
  ticker: string;
  name: string;
  amount: number;
  price: number;
  fee: number;
  tax: number;
  category: AssetCategory;
  broker: string;
  currency: 'EUR' | 'USD' | 'CHF' | 'GBP';
  notes?: string;
}

export function detectBrokerFromText(text: string): string {
  const upper = text.toUpperCase();
  if (upper.includes('TRADE REPUBLIC')) return 'Trade Republic';
  if (upper.includes('SCALABLE') || (upper.includes('BAADER BANK') && !upper.includes('FINANZEN.NET'))) return 'Scalable Capital';
  if (upper.includes('ING-DIBA') || upper.includes('ING ') || upper.includes('ING BANK')) return 'ING';
  if (upper.includes('COMDIRECT')) return 'comdirect';
  if (upper.includes('DEUTSCHE KREDITBANK') || upper.includes('DKB')) return 'DKB';
  if (upper.includes('CONSORSBANK') || upper.includes('BNP PARIBAS')) return 'Consorsbank';
  if (upper.includes('FINANZEN.NET ZERO') || upper.includes('FINANZEN.NET')) return 'finanzen.net zero';
  if (upper.includes('FLATEX')) return 'flatex';
  if (upper.includes('BITPANDA')) return 'Bitpanda';
  if (upper.includes('SMARTBROKER')) return 'Smartbroker';
  if (upper.includes('REVOLUT')) return 'Revolut';
  return 'Sonstiger Broker';
}

export function parseNumberString(str?: string): number {
  if (!str) return 0;
  // Remove thousand separators (.) and replace comma with dot
  const clean = str.replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

export function parseUniversalBrokerText(text: string, rules?: AssetMappingRule[]): ExtractedPdfTransaction {
  const broker = detectBrokerFromText(text);
  const upper = text.toUpperCase();

  // 1. Determine Transaction Type
  let type: ExtractedPdfTransaction['type'] = 'BUY';
  if (upper.includes('VERKAUF') || upper.includes('SELL') || upper.includes('VERÄUSSERUNG')) {
    type = 'SELL';
  } else if (upper.includes('DIVIDENDE') || upper.includes('AUSSCHÜTTUNG') || upper.includes('ERTRAGSGUTSCHRIFT')) {
    type = 'DIVIDEND';
  } else if (upper.includes('STAKING') || upper.includes('REWARD')) {
    type = 'STAKING';
  } else if (upper.includes('ZINSEN') || upper.includes('ZINSGUTSCHRIFT')) {
    type = 'INTEREST';
  }

  // 2. Extract Date (DD.MM.YYYY or YYYY-MM-DD)
  let date = new Date().toLocaleDateString('de-DE');
  const dateMatch = text.match(/(\d{2}\.\d{2}\.\d{4})/);
  if (dateMatch) {
    date = dateMatch[1];
  } else {
    const isoDateMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
    if (isoDateMatch) {
      const parts = isoDateMatch[1].split('-');
      date = `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
  }

  // 3. Extract ISIN or Ticker
  let ticker = 'ASSET';
  const isinMatch = text.match(/\b([A-Z]{2}[A-Z0-9]{9}\d)\b/);
  if (isinMatch) {
    ticker = isinMatch[1];
  } else {
    // Check for Crypto symbols like BTC, ETH, SOL
    const cryptoMatch = text.match(/\b(BTC|ETH|SOL|ADA|XRP|DOT|AVAX|LINK|MATIC)\b/i);
    if (cryptoMatch) {
      ticker = cryptoMatch[1].toUpperCase();
    }
  }

  // 4. Asset Name & Category
  let name = ticker;
  let category: AssetCategory = 'Stock';

  if (text.includes('UCITS') || text.includes('ETF') || text.includes('INDEX') || text.includes('ISHARES') || text.includes('VANGUARD')) {
    category = 'ETF';
  } else if (broker === 'Bitpanda' || ['BTC', 'ETH', 'SOL', 'ADA', 'XRP', 'DOT'].includes(ticker)) {
    category = 'Crypto';
  } else if (text.includes('ANLEIHE') || text.includes('BOND') || text.includes('BUNDESANLEIHE')) {
    category = 'Bond';
  }

  // Extraction of Name between keywords
  const nameCandidate = text.match(/(?:Kauf|Verkauf|Dividende|Wertpapierbezeichnung|Abrechnung)\s+([A-Za-z0-9\s&.\-+/]{3,40}?)\s+(?:ISIN|WKN|Stk\.|Stück|Nominale)/i);
  if (nameCandidate && nameCandidate[1].trim().length > 2) {
    name = nameCandidate[1].trim();
  }

  // 5. Amount (Stückzahl / Nominale)
  let amount = 1.0;
  const amountMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:Stk\.|Stück|Anteile|Nominale)/i);
  if (amountMatch) {
    amount = parseNumberString(amountMatch[1]);
  }

  // 6. Price per share
  let price = 0;
  const priceMatch = text.match(/(?:Kurs|Preis|Ausführungskurs|Ausschüttung pro Stück)\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*(?:EUR|USD|CHF|€|\$)/i);
  if (priceMatch) {
    price = parseNumberString(priceMatch[1]);
  } else {
    // Check Kurswert or Gesamtbetrag divided by amount
    const totalMatch = text.match(/(?:Kurswert|Gesamtbetrag|Endbetrag)\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*(?:EUR|USD|CHF|€|\$)/i);
    if (totalMatch) {
      const totalVal = parseNumberString(totalMatch[1]);
      price = amount > 0 ? Number((totalVal / amount).toFixed(4)) : totalVal;
    }
  }

  // 7. Fees
  let fee = 0;
  const feeMatch = text.match(/(?:Fremdkostenzuschlag|Provision|Transaktionsentgelt|Handelsentgelt|Spesen|Gebühr)\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*(?:EUR|USD|CHF|€|\$)/i);
  if (feeMatch) {
    fee = parseNumberString(feeMatch[1]);
  } else if (broker === 'Trade Republic' && (type === 'BUY' || type === 'SELL')) {
    fee = 1.00; // Trade Republic flat 1 €
  }

  // 8. Taxes
  let tax = 0;
  const taxMatch = text.match(/(?:Kapitalertragsteuer|Abgeltungsteuer|KESt|Quellensteuer|Solidaritätszuschlag|Kirchensteuer)\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*(?:EUR|USD|CHF|€|\$)/i);
  if (taxMatch) {
    tax = parseNumberString(taxMatch[1]);
  }

  // 9. Currency
  let currency: 'EUR' | 'USD' | 'CHF' | 'GBP' = 'EUR';
  if (text.includes('USD') || text.includes('$')) {
    currency = 'USD';
  } else if (text.includes('CHF')) {
    currency = 'CHF';
  } else if (text.includes('GBP') || text.includes('£')) {
    currency = 'GBP';
  }

  // Apply user mapping rules if available
  if (rules && rules.length > 0) {
    for (const r of rules) {
      if (text.toLowerCase().includes(r.pattern.toLowerCase()) || ticker.toLowerCase() === r.pattern.toLowerCase()) {
        ticker = r.ticker;
        name = r.name;
        category = r.category;
        if (r.broker) broker;
        break;
      }
    }
  }

  return {
    type,
    date,
    ticker,
    name,
    amount: Math.max(0.000001, amount),
    price: Math.max(0, price),
    fee,
    tax,
    category,
    broker,
    currency,
    notes: `Importiert aus ${broker} Beleg`
  };
}

export function convertExtractedToTransaction(
  extracted: ExtractedPdfTransaction,
  id = `pdf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
): Transaction {
  return {
    id,
    type: extracted.type,
    date: extracted.date,
    ticker: extracted.ticker,
    name: extracted.name,
    amount: extracted.amount,
    price: extracted.price,
    fee: extracted.fee,
    tax: extracted.tax,
    category: extracted.category,
    broker: extracted.broker,
    currency: extracted.currency,
    exchangeRate: 1.0,
    notes: extracted.notes
  };
}
