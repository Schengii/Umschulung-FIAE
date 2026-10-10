import { describe, it, expect } from 'vitest';
import { detectBrokerFromText, parseNumberString, parseUniversalBrokerText, convertExtractedToTransaction } from '../pdfImportUtils';

describe('pdfImportUtils - universal broker detection & text extraction', () => {
  it('detects all major DACH brokers accurately', () => {
    expect(detectBrokerFromText('TRADE REPUBLIC BANK GMBH WERTPAPIERABRECHNUNG')).toBe('Trade Republic');
    expect(detectBrokerFromText('Baader Bank AG Wertpapierabrechnung Scalable')).toBe('Scalable Capital');
    expect(detectBrokerFromText('ING-DiBa AG WERTPAPIERABRECHNUNG Ausführung')).toBe('ING');
    expect(detectBrokerFromText('comdirect bank AG Wertpapiergeschäft Abrechnung')).toBe('comdirect');
    expect(detectBrokerFromText('Deutsche Kreditbank AG Wertpapierabrechnung DKB')).toBe('DKB');
    expect(detectBrokerFromText('Consorsbank BNP Paribas Wertpapierabrechnung')).toBe('Consorsbank');
    expect(detectBrokerFromText('finanzen.net zero Wertpapierabrechnung')).toBe('finanzen.net zero');
    expect(detectBrokerFromText('flatex Bank AG Abrechnung Wertpapierorder')).toBe('flatex');
    expect(detectBrokerFromText('Bitpanda GmbH Kaufbestätigung Bitcoin')).toBe('Bitpanda');
  });

  it('parses German number strings with thousand separators and commas', () => {
    expect(parseNumberString('1.250,50 EUR')).toBe(1250.50);
    expect(parseNumberString('10,5000 Stk.')).toBe(10.5);
    expect(parseNumberString('0,99 €')).toBe(0.99);
    expect(parseNumberString('')).toBe(0);
  });

  it('parses Trade Republic buy statement text with 1€ fee', () => {
    const trSample = `
      TRADE REPUBLIC BANK GMBH WERTPAPIERABRECHNUNG
      Kauf von Apple Inc. ISIN: US0378331002
      Ausführung am 15.01.2026.
      5,0000 Stk. Kurs: 172,50 EUR.
      Fremdkostenzuschlag: 1,00 EUR.
      Gesamtbetrag: 863,50 EUR.
    `;

    const tx = parseUniversalBrokerText(trSample);
    expect(tx.broker).toBe('Trade Republic');
    expect(tx.type).toBe('BUY');
    expect(tx.date).toBe('15.01.2026');
    expect(tx.ticker).toBe('US0378331002');
    expect(tx.amount).toBe(5);
    expect(tx.price).toBe(172.50);
    expect(tx.fee).toBe(1.00);
    expect(tx.currency).toBe('EUR');

    const transaction = convertExtractedToTransaction(tx, 'test-id');
    expect(transaction.id).toBe('test-id');
    expect(transaction.broker).toBe('Trade Republic');
  });

  it('parses Scalable Capital sale statement with tax', () => {
    const scSample = `
      Baader Bank AG Wertpapierabrechnung Scalable
      Verkauf von iShares Core MSCI World UCITS ETF ISIN: IE00B4L5Y983.
      Ausführung am 18.06.2026.
      10,0000 Stück. Kurs: 105,20 EUR.
      Transaktionsentgelt: 0,99 EUR.
      Kapitalertragsteuer: 15,40 EUR.
      Endbetrag: 1.035,81 EUR.
    `;

    const tx = parseUniversalBrokerText(scSample);
    expect(tx.broker).toBe('Scalable Capital');
    expect(tx.type).toBe('SELL');
    expect(tx.ticker).toBe('IE00B4L5Y983');
    expect(tx.category).toBe('ETF');
    expect(tx.amount).toBe(10);
    expect(tx.price).toBe(105.20);
    expect(tx.fee).toBe(0.99);
    expect(tx.tax).toBe(15.40);
  });

  it('parses Bitpanda crypto buy statement correctly', () => {
    const bpSample = `
      Bitpanda GmbH Kaufbestätigung
      Kauf von BTC Bitcoin
      Datum: 10.08.2026.
      0,0500 Stk. Kurs: 55000,00 EUR.
      Gebühr: 1,49 EUR.
      Gesamtbetrag: 2.751,49 EUR.
    `;

    const tx = parseUniversalBrokerText(bpSample);
    expect(tx.broker).toBe('Bitpanda');
    expect(tx.type).toBe('BUY');
    expect(tx.ticker).toBe('BTC');
    expect(tx.category).toBe('Crypto');
    expect(tx.amount).toBe(0.05);
    expect(tx.price).toBe(55000);
  });
});
