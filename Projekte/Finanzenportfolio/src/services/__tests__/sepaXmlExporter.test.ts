import { describe, it, expect } from 'vitest';
import { generateSepaCreditTransferXml } from '../sepaXmlExporter';

describe('sepaXmlExporter', () => {
  it('generates a valid pain.001.001.03 SEPA XML document', () => {
    const xml = generateSepaCreditTransferXml({
      initiatorName: 'Max Mustermann',
      initiatorIban: 'DE89370400440532013000',
      initiatorBic: 'GENODED1XXX',
      transfers: [
        {
          recipientName: 'Trade Republic Bank GmbH',
          iban: 'DE12100100100123456789',
          bic: 'TRBODEBBXXX',
          amountEur: 150.50,
          purpose: 'Sparplan Core MSCI World',
          executionDate: '2026-10-01'
        },
        {
          recipientName: 'Scalable Capital Depot',
          iban: 'DE44100100100987654321',
          amountEur: 250.00,
          purpose: 'Sparplan Emerging Markets',
          executionDate: '2026-10-01'
        }
      ]
    });

    expect(xml).toContain('xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03"');
    expect(xml).toContain('<NbOfTxs>2</NbOfTxs>');
    expect(xml).toContain('<CtrlSum>400.50</CtrlSum>');
    expect(xml).toContain('<IBAN>DE89370400440532013000</IBAN>');
    expect(xml).toContain('<IBAN>DE12100100100123456789</IBAN>');
    expect(xml).toContain('<IBAN>DE44100100100987654321</IBAN>');
    expect(xml).toContain('<InstdAmt Ccy="EUR">150.50</InstdAmt>');
    expect(xml).toContain('<Nm>Max Mustermann</Nm>');
    expect(xml).toContain('<Nm>Trade Republic Bank GmbH</Nm>');
    expect(xml).toContain('<ReqdExctnDt>2026-10-01</ReqdExctnDt>');
  });

  it('escapes XML special characters properly', () => {
    const xml = generateSepaCreditTransferXml({
      initiatorName: 'Müller & Partner <GmbH>',
      initiatorIban: 'DE89370400440532013000',
      transfers: [
        {
          recipientName: 'Depot & Co "Kauf"',
          iban: 'DE12100100100123456789',
          amountEur: 100,
          purpose: 'ETF <World> & Tech',
          executionDate: '2026-10-01'
        }
      ]
    });

    expect(xml).not.toContain('& ');
    expect(xml).toContain('Mueller &amp; Partner &lt;GmbH&gt;');
    expect(xml).toContain('<CtrlSum>100.00</CtrlSum>');
    expect(xml).toContain('Depot &amp; Co &quot;Kauf&quot;');
    expect(xml).toContain('ETF &lt;World&gt; &amp; Tech');
  });
});
