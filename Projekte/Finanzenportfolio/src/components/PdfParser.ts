import * as pdfjsLib from 'pdfjs-dist';

// Use the CDN worker to avoid bundling issues with Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

import type { AssetMappingRule, AssetCategory } from '../types';

export interface ParsedTransaction {
  type: 'BUY' | 'SELL' | 'DIVIDEND';
  date: string;
  ticker: string;
  name: string;
  amount: number;
  price: number;
  fee: number;
  tax: number;
  category: AssetCategory;
}

// Mock text data representing statements from various brokers for demo simulation
export const MOCK_PDF_TEXTS = {
  TR: "TRADE REPUBLIC BANK GMBH WERTPAPIERABRECHNUNG Kauf von Apple Inc. ISIN: US0378331002 Ausführung am 15.01.2026 um 16:30 Uhr an LS Exchange. 5,0000 Stk. zu 172,50 EUR. Fremdkostenzuschlag: 1,00 EUR. Gesamtbetrag: 863,50 EUR.",
  SCALABLE: "Baader Bank AG Wertpapierabrechnung Verkauf von Apple Inc. ISIN: US0378331002. Ausführung am 18.06.2026. Abrechnung: 5,0000 Stück zu 189,20 EUR. Transaktionsentgelt / Provision: 1,99 EUR. Kapitalertragsteuer: 2,10 EUR. Gesamtbetrag: 943,91 EUR.",
  ING: "ING-DiBa AG WERTPAPIERABRECHNUNG Ausführung Sparplan Kauf Vanguard FTSE All-World UCITS ETF ISIN: IE00B3RBWM25. Ausführung am 02.07.2026. Nominale: 10,5000 Stück. Kurs: 112,40 EUR. Kurswert: 1.180,20 EUR. Provision / Gebühr: 1,75 EUR. Endbetrag zu Ihren Lasten: 1.181,95 EUR.",
  COMDIRECT: "comdirect bank AG Wertpapiergeschäft Abrechnung Kauf Microsoft Corp. ISIN: US5949181045. Ausführungstag: 01.07.2026. Geschäft: 8 Stück zum Kurs von 415,50 EUR. Kurswert: 3.324,00 EUR. Provision: 4,90 EUR. Abwicklungsentgelt: 1,50 EUR. Endbetrag: 3.330,40 EUR.",
  DKB: "Deutsche Kreditbank AG Wertpapierabrechnung Kauf Allianz SE ISIN: DE0008404005. Ausführungstag: 30.06.2026. Stückzahl: 15 Stück. Kurs: 260,00 EUR. Kurswert: 3.900,00 EUR. Eigene Spesen / Grundprovision: 10,00 EUR. Endbetrag: 3.910,00 EUR.",
  CONSORS: "Consorsbank BNP Paribas Wertpapierabrechnung Dividende Siemens AG ISIN: DE0007236101. Abrechnungstag: 25.06.2026. Ausschüttung pro Stück: 4,70 EUR für 10 Stück. Kurswert / Bruttobetrag: 47,00 EUR. Quellensteuer: 11,75 EUR. Solidaritätszuschlag: 0,64 EUR. Endbetrag zu Ihren Gunsten: 34,61 EUR.",
  FINANZEN_ZERO: "finanzen.net zero Wertpapierabrechnung Kauf Tesla Inc. ISIN: US88160R1014. Datum: 10.07.2026. Stückzahl: 12 Stk. Kurs: 220,00 EUR. Entgelt: 0,00 EUR. Endbetrag: 2.640,00 EUR."
};

export async function parseBrokerPdf(file: File, rules?: AssetMappingRule[]): Promise<ParsedTransaction> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += ' ' + pageText;
  }

  // Basic cleanup
  fullText = fullText.replace(/\s+/g, ' ');

  return parseBrokerText(fullText, rules);
}

// Separate text parser function so it can also parse our mock strings directly
export function parseBrokerText(text: string, rules?: AssetMappingRule[]): ParsedTransaction {
  let result: ParsedTransaction;

  if (text.includes('Trade Republic') || text.includes('TRADE REPUBLIC')) {
    result = parseTradeRepublic(text);
  } else if (text.includes('Scalable') || text.includes('Baader Bank')) {
    result = parseScalableCapital(text);
  } else if (text.includes('ING-DiBa') || text.includes('ING ')) {
    result = parseIngDiba(text);
  } else if (text.includes('comdirect')) {
    result = parseComdirect(text);
  } else if (text.includes('Deutsche Kreditbank') || text.includes('DKB')) {
    result = parseDkb(text);
  } else if (text.includes('Consorsbank')) {
    result = parseConsorsbank(text);
  } else if (text.includes('finanzen.net zero') || text.includes('finanzen.net')) {
    result = parseFinanzenZero(text);
  } else {
    // Generic fallback parsing attempt based on keywords
    result = parseGeneric(text);
  }

  // Apply user mapping rules if a match is found
  if (rules && rules.length > 0) {
    for (const rule of rules) {
      if (text.toLowerCase().includes(rule.pattern.toLowerCase())) {
        result.ticker = rule.ticker;
        result.name = rule.name;
        result.category = rule.category;
        break; // Match first matching rule
      }
    }
  }

  return result;
}

function parseTradeRepublic(text: string): ParsedTransaction {
  const isSell = text.includes('Verkauf');
  const isDiv = text.includes('Dividende') || text.includes('Ausschüttung');

  let type: 'BUY' | 'SELL' | 'DIVIDEND' = 'BUY';
  if (isSell) type = 'SELL';
  if (isDiv) type = 'DIVIDEND';

  const dateMatch = text.match(/(\d{2}\.\d{2}\.\d{4})/);
  const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

  const isinMatch = text.match(/\b([A-Z]{2}[A-Z0-9]{9}\d)\b/);
  const ticker = isinMatch ? isinMatch[1] : 'UNKNOWN';

  let name = 'Asset';
  const nameMatch = text.match(/(?:Wertpapierabrechnung|Kauf|Verkauf|Dividende)\s+([A-Za-z0-9\s&.-]+?)\s+(?:ISIN|Stk\.)/i);
  if (nameMatch) {
    name = nameMatch[1].trim();
  } else {
    const parts = text.split(ticker);
    if (parts.length > 0) {
      const segment = parts[0].slice(-50).trim();
      name = segment.replace(/.*?(Kauf|Verkauf|Dividende|Abrechnung)\s+/, '').trim();
    }
  }

  let amount = 1;
  const amountMatch = text.match(/(\d+(?:,\d+)?)\s*Stk\./i);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(',', '.'));
  }

  let price = 0;
  const priceMatch = text.match(/(?:Kurs|Preis|Ausschüttung)\s+(\d+(?:,\d+)?)\s*EUR/i);
  if (priceMatch) {
    price = parseFloat(priceMatch[1].replace(',', '.'));
  } else {
    const totalMatch = text.match(/(?:Gesamtbetrag|Kurswert)\s+(\d+(?:,\d+)?)\s*EUR/i);
    if (totalMatch) {
      const total = parseFloat(totalMatch[1].replace(',', '.'));
      price = total / (amount || 1);
    }
  }

  let fee = 0;
  const feeMatch = text.match(/(?:Fremdkostenzuschlag|Gebühr|Provision)\s+(\d+(?:,\d+)?)\s*EUR/i);
  if (feeMatch) {
    fee = parseFloat(feeMatch[1].replace(',', '.'));
  }

  let tax = 0;
  const taxMatch = text.match(/(?:Kapitalertragsteuer|Quellensteuer|Solidaritätszuschlag)\s+(\d+(?:,\d+)?)\s*EUR/i);
  if (taxMatch) {
    tax = parseFloat(taxMatch[1].replace(',', '.'));
  }

  let category: 'Stock' | 'ETF' | 'Crypto' = 'Stock';
  if (name.toLowerCase().includes('etf') || name.toLowerCase().includes('msci') || name.toLowerCase().includes('ishares')) {
    category = 'ETF';
  } else if (ticker.startsWith('XC') || name.toLowerCase().includes('bitcoin') || name.toLowerCase().includes('ethereum') || name.toLowerCase().includes('crypto')) {
    category = 'Crypto';
  }

  return { type, date, ticker, name, amount, price, fee, tax, category };
}

function parseScalableCapital(text: string): ParsedTransaction {
  const isSell = text.includes('Verkauf');
  const isDiv = text.includes('Dividende') || text.includes('Ausschüttung');

  let type: 'BUY' | 'SELL' | 'DIVIDEND' = 'BUY';
  if (isSell) type = 'SELL';
  if (isDiv) type = 'DIVIDEND';

  const dateMatch = text.match(/(\d{2}\.\d{2}\.\d{4})/);
  const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

  const isinMatch = text.match(/\b([A-Z]{2}[A-Z0-9]{9}\d)\b/);
  const ticker = isinMatch ? isinMatch[1] : 'UNKNOWN';

  let name = 'Asset';
  const nameMatch = text.match(/(?:Kauf|Verkauf|Dividende)\s+([A-Za-z0-9\s&.-]+?)\s+(?:ISIN|Stk\.|Stück)/i);
  if (nameMatch) {
    name = nameMatch[1].trim();
  }

  let amount = 1;
  const amountMatch = text.match(/(\d+(?:,\d+)?)\s*(?:Stück|Stk\.)/i);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(',', '.'));
  }

  let price = 0;
  const priceMatch = text.match(/(?:Ausführungskurs|Kurs|Dividende)\s+(\d+(?:,\d+)?)\s*EUR/i);
  if (priceMatch) {
    price = parseFloat(priceMatch[1].replace(',', '.'));
  }

  let fee = 0;
  const feeMatch = text.match(/(?:Transaktionsentgelt|Provision)\s+(\d+(?:,\d+)?)\s*EUR/i);
  if (feeMatch) {
    fee = parseFloat(feeMatch[1].replace(',', '.'));
  }

  let tax = 0;
  const taxMatch = text.match(/(?:Quellensteuer|Kapitalertragsteuer)\s+(\d+(?:,\d+)?)\s*EUR/i);
  if (taxMatch) {
    tax = parseFloat(taxMatch[1].replace(',', '.'));
  }

  let category: 'Stock' | 'ETF' | 'Crypto' = 'Stock';
  if (name.toLowerCase().includes('etf') || name.toLowerCase().includes('msci') || name.toLowerCase().includes('ishares')) {
    category = 'ETF';
  } else if (ticker.startsWith('XC') || name.toLowerCase().includes('crypto') || name.toLowerCase().includes('bitcoin')) {
    category = 'Crypto';
  }

  return { type, date, ticker, name, amount, price, fee, tax, category };
}

function parseIngDiba(text: string): ParsedTransaction {
  const isSell = text.includes('Verkauf');
  const isDiv = text.includes('Dividende') || text.includes('Ausschüttung');
  let type: 'BUY' | 'SELL' | 'DIVIDEND' = 'BUY';
  if (isSell) type = 'SELL';
  if (isDiv) type = 'DIVIDEND';

  const dateMatch = text.match(/(\d{2}\.\d{2}\.\d{4})/);
  const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

  const isinMatch = text.match(/\b([A-Z]{2}[A-Z0-9]{9}\d)\b/);
  const ticker = isinMatch ? isinMatch[1] : 'UNKNOWN';

  let name = 'ING Asset';
  const nameMatch = text.match(/(?:Kauf|Verkauf|Abrechnung|Sparplan)\s+([A-Za-z0-9\s&.-]+?)\s+(?:ISIN|Stk|Stück|Nominale)/i);
  if (nameMatch) name = nameMatch[1].trim();

  let amount = 1;
  const amountMatch = text.match(/(?:Nominale|Stück|Stk\.|Stückzahl):\s*(\d+(?:[.,]\d+)?)/i) || text.match(/(\d+(?:[.,]\d+)?)\s*(?:Stück|Stk\.)/i);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/\./g, '').replace(',', '.'));
  }

  let price = 0;
  const priceMatch = text.match(/(?:Kurs|Preis):\s*(\d+(?:[.,]\d+)?)/i) || text.match(/(?:Kurs|Preis)\s+(\d+(?:[.,]\d+)?)/i);
  if (priceMatch) {
    price = parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.'));
  }

  let fee = 0;
  const feeMatch = text.match(/(?:Provision|Gebühr|Entgelt):\s*(\d+(?:[.,]\d+)?)/i) || text.match(/(?:Provision\s*\/\s*Gebühr):\s*(\d+(?:[.,]\d+)?)/i);
  if (feeMatch) {
    fee = parseFloat(feeMatch[1].replace(/\./g, '').replace(',', '.'));
  }

  let tax = 0;
  const taxMatch = text.match(/(?:Kapitalertragsteuer|Quellensteuer|Solidaritätszuschlag):\s*(\d+(?:[.,]\d+)?)/i);
  if (taxMatch) {
    tax = parseFloat(taxMatch[1].replace(/\./g, '').replace(',', '.'));
  }

  let category: 'Stock' | 'ETF' | 'Crypto' = 'Stock';
  if (name.toLowerCase().includes('etf') || name.toLowerCase().includes('msci') || name.toLowerCase().includes('ftse') || name.toLowerCase().includes('world')) {
    category = 'ETF';
  }

  return { type, date, ticker, name, amount, price, fee, tax, category };
}

function parseComdirect(text: string): ParsedTransaction {
  const isSell = text.includes('Verkauf') || text.includes('Verkaufsgeschäft');
  const isDiv = text.includes('Dividende') || text.includes('Ausschüttung') || text.includes('Erträgnisgutschrift');
  let type: 'BUY' | 'SELL' | 'DIVIDEND' = 'BUY';
  if (isSell) type = 'SELL';
  if (isDiv) type = 'DIVIDEND';

  const dateMatch = text.match(/(\d{2}\.\d{2}\.\d{4})/);
  const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

  const isinMatch = text.match(/\b([A-Z]{2}[A-Z0-9]{9}\d)\b/);
  const ticker = isinMatch ? isinMatch[1] : 'UNKNOWN';

  let name = 'comdirect Asset';
  const nameMatch = text.match(/(?:Kauf|Verkauf|Abrechnung|Wertpapiergeschäft|Erträgnisgutschrift)\s+([A-Za-z0-9\s&.-]+?)\s+(?:ISIN|Stk|Stück)/i);
  if (nameMatch) name = nameMatch[1].trim();

  let amount = 1;
  const amountMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:Stück|Stk\.)/i) || text.match(/(?:Stück|Stk\.|Nominale):\s*(\d+(?:[.,]\d+)?)/i);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/\./g, '').replace(',', '.'));
  }

  let price = 0;
  const priceMatch = text.match(/(?:zum Kurs von|Kurs):\s*(\d+(?:[.,]\d+)?)/i) || text.match(/(?:Kurs|Ausschüttung)\s+(\d+(?:[.,]\d+)?)/i);
  if (priceMatch) {
    price = parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.'));
  }

  let fee = 0;
  const provMatch = text.match(/Provision:\s*(\d+(?:[.,]\d+)?)/i);
  const abwickMatch = text.match(/Abwicklungsentgelt:\s*(\d+(?:[.,]\d+)?)/i);
  if (provMatch) fee += parseFloat(provMatch[1].replace(/\./g, '').replace(',', '.'));
  if (abwickMatch) fee += parseFloat(abwickMatch[1].replace(/\./g, '').replace(',', '.'));

  let tax = 0;
  const taxMatch = text.match(/(?:Quellensteuer|Kapitalertragsteuer|Solidaritätszuschlag):\s*(\d+(?:[.,]\d+)?)/i);
  if (taxMatch) {
    tax = parseFloat(taxMatch[1].replace(/\./g, '').replace(',', '.'));
  }

  let category: 'Stock' | 'ETF' | 'Crypto' = 'Stock';
  if (name.toLowerCase().includes('etf') || name.toLowerCase().includes('msci') || name.toLowerCase().includes('ishares')) {
    category = 'ETF';
  }

  return { type, date, ticker, name, amount, price, fee, tax, category };
}

function parseDkb(text: string): ParsedTransaction {
  const isSell = text.includes('Verkauf');
  const isDiv = text.includes('Dividende') || text.includes('Ausschüttung');
  let type: 'BUY' | 'SELL' | 'DIVIDEND' = 'BUY';
  if (isSell) type = 'SELL';
  if (isDiv) type = 'DIVIDEND';

  const dateMatch = text.match(/(\d{2}\.\d{2}\.\d{4})/);
  const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

  const isinMatch = text.match(/\b([A-Z]{2}[A-Z0-9]{9}\d)\b/);
  const ticker = isinMatch ? isinMatch[1] : 'UNKNOWN';

  let name = 'DKB Asset';
  const nameMatch = text.match(/(?:Kauf|Verkauf|Abrechnung)\s+([A-Za-z0-9\s&.-]+?)\s+(?:ISIN|Stk|Stück)/i);
  if (nameMatch) name = nameMatch[1].trim();

  let amount = 1;
  const amountMatch = text.match(/(?:Stückzahl|Stück|Stk\.):?\s*(\d+(?:[.,]\d+)?)/i) || text.match(/(\d+(?:[.,]\d+)?)\s*(?:Stück|Stk\.)/i);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/\./g, '').replace(',', '.'));
  }

  let price = 0;
  const priceMatch = text.match(/(?:Kurs|Preis):?\s*(\d+(?:[.,]\d+)?)/i) || text.match(/(?:Kurs|Preis)\s+(\d+(?:[.,]\d+)?)/i);
  if (priceMatch) {
    price = parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.'));
  }

  let fee = 0;
  const feeMatch = text.match(/(?:Grundprovision|Provision|Spesen|Entgelt):?\s*(\d+(?:[.,]\d+)?)/i);
  if (feeMatch) {
    fee = parseFloat(feeMatch[1].replace(/\./g, '').replace(',', '.'));
  }

  let tax = 0;
  const taxMatch = text.match(/(?:Quellensteuer|Kapitalertragsteuer|Solidaritätszuschlag):?\s*(\d+(?:[.,]\d+)?)/i);
  if (taxMatch) {
    tax = parseFloat(taxMatch[1].replace(/\./g, '').replace(',', '.'));
  }

  let category: 'Stock' | 'ETF' | 'Crypto' = 'Stock';
  if (name.toLowerCase().includes('etf') || name.toLowerCase().includes('msci')) {
    category = 'ETF';
  }

  return { type, date, ticker, name, amount, price, fee, tax, category };
}

function parseConsorsbank(text: string): ParsedTransaction {
  const isSell = text.includes('Verkauf');
  const isDiv = text.includes('Dividende') || text.includes('Ausschüttung') || text.includes('Erträgnis');
  let type: 'BUY' | 'SELL' | 'DIVIDEND' = 'BUY';
  if (isSell) type = 'SELL';
  if (isDiv) type = 'DIVIDEND';

  const dateMatch = text.match(/(\d{2}\.\d{2}\.\d{4})/);
  const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

  const isinMatch = text.match(/\b([A-Z]{2}[A-Z0-9]{9}\d)\b/);
  const ticker = isinMatch ? isinMatch[1] : 'UNKNOWN';

  let name = 'Consorsbank Asset';
  const nameMatch = text.match(/(?:Kauf|Verkauf|Abrechnung|Dividende|Erträgnis)\s+([A-Za-z0-9\s&.-]+?)\s+(?:ISIN|Stk|Stück)/i);
  if (nameMatch) name = nameMatch[1].trim();

  let amount = 1;
  const amountMatch = text.match(/für\s+(\d+(?:[.,]\d+)?)\s*(?:Stück|Stk\.)/i) || text.match(/(\d+(?:[.,]\d+)?)\s*(?:Stück|Stk\.)/i) || text.match(/(?:Stück|Stk\.):?\s*(\d+(?:[.,]\d+)?)/i);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/\./g, '').replace(',', '.'));
  }

  let price = 0;
  const priceMatch = text.match(/(?:Kurs|Preis|pro Stück):?\s*(\d+(?:[.,]\d+)?)/i) || text.match(/(?:Kurs|Ausschüttung)\s+(\d+(?:[.,]\d+)?)/i);
  if (priceMatch) {
    price = parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.'));
  }

  let fee = 0;
  const feeMatch = text.match(/(?:Grundgebühr|Provision|Spesen|Entgelt):?\s*(\d+(?:[.,]\d+)?)/i);
  if (feeMatch) {
    fee = parseFloat(feeMatch[1].replace(/\./g, '').replace(',', '.'));
  }

  let tax = 0;
  const matches = text.matchAll(/(?:Quellensteuer|Kapitalertragsteuer|Solidaritätszuschlag|Kirchensteuer):\s*(\d+(?:[.,]\d+)?)/gi);
  for (const m of matches) {
    tax += parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
  }

  let category: 'Stock' | 'ETF' | 'Crypto' = 'Stock';
  if (name.toLowerCase().includes('etf') || name.toLowerCase().includes('msci') || name.toLowerCase().includes('ishares')) {
    category = 'ETF';
  }

  return { type, date, ticker, name, amount, price, fee, tax, category };
}

function parseFinanzenZero(text: string): ParsedTransaction {
  const isSell = text.includes('Verkauf');
  const isDiv = text.includes('Dividende');
  let type: 'BUY' | 'SELL' | 'DIVIDEND' = 'BUY';
  if (isSell) type = 'SELL';
  if (isDiv) type = 'DIVIDEND';

  const dateMatch = text.match(/(\d{2}\.\d{2}\.\d{4})/);
  const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

  const isinMatch = text.match(/\b([A-Z]{2}[A-Z0-9]{9}\d)\b/);
  const ticker = isinMatch ? isinMatch[1] : 'UNKNOWN';

  let name = 'Finanzen.net Zero Asset';
  const nameMatch = text.match(/(?:Kauf|Verkauf|Wertpapierabrechnung)\s+([A-Za-z0-9\s&.-]+?)\s+ISIN/i);
  if (nameMatch) name = nameMatch[1].trim();

  let amount = 1;
  const amountMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:Stk|Stück)/i);
  if (amountMatch) amount = parseFloat(amountMatch[1].replace(/\./g, '').replace(',', '.'));

  let price = 0;
  const priceMatch = text.match(/Kurs:\s*(\d+(?:[.,]\d+)?)/i);
  if (priceMatch) price = parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.'));

  let category: 'Stock' | 'ETF' | 'Crypto' = 'Stock';
  if (name.toLowerCase().includes('etf') || name.toLowerCase().includes('msci')) category = 'ETF';

  return { type, date, ticker, name, amount, price, fee: 0, tax: 0, category };
}

function parseGeneric(text: string): ParsedTransaction {
  const type = text.includes('Verkauf') || text.includes('SELL') ? 'SELL' : 
               text.includes('Dividende') || text.includes('DIVIDEND') ? 'DIVIDEND' : 'BUY';

  const dateMatch = text.match(/(\d{2}\.\d{2}\.\d{4})/) || text.match(/(\d{4}-\d{2}-\d{2})/);
  const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

  const isinMatch = text.match(/\b([A-Z]{2}[A-Z0-9]{9}\d)\b/);
  const ticker = isinMatch ? isinMatch[1] : 'GENERIC';

  let name = 'Imported Asset';
  const nameMatch = text.match(/(?:Kauf|Verkauf|Abrechnung|Statement)\s+([A-Za-z0-9\s&.-]+?)\s+(?:ISIN|Stk|Stück)/i);
  if (nameMatch) name = nameMatch[1].trim();

  let amount = 1;
  const amountMatch = text.match(/(\d+(?:,\d+)?)\s*(?:Stk|Stück|Shares|Units)/i);
  if (amountMatch) amount = parseFloat(amountMatch[1].replace(',', '.'));

  let price = 100;
  const priceMatch = text.match(/(?:Kurs|Price|Betrag)\s+(\d+(?:,\d+)?)/i);
  if (priceMatch) price = parseFloat(priceMatch[1].replace(',', '.'));

  return {
    type,
    date,
    ticker,
    name,
    amount,
    price,
    fee: 1.0,
    tax: 0,
    category: ticker.startsWith('XC') ? 'Crypto' : ticker.includes('ETF') ? 'ETF' : 'Stock'
  };
}
