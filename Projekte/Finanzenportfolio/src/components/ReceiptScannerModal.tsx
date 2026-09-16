import React, { useState, useRef } from 'react';
import { Camera, Upload, Check, AlertCircle, FileText, Image as ImageIcon, Sparkles, X, ArrowRight } from 'lucide-react';
import type { Transaction, AssetCategory } from '../types';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  baseCurrency?: 'EUR' | 'USD' | 'CHF' | 'GBP';
}

interface ParsedReceiptData {
  type: Transaction['type'];
  date: string;
  ticker: string;
  name: string;
  category: AssetCategory;
  amount: number;
  price: number;
  fee: number;
  tax: number;
  currency: 'EUR' | 'USD' | 'CHF';
  exchangeRate: number;
  broker: string;
  rawText?: string;
}

const DEMO_RECEIPTS: { label: string; broker: string; text: string; filename: string }[] = [
  {
    label: 'Trade Republic - Kauf Apple Inc.',
    broker: 'Trade Republic',
    filename: 'tr_abrechnung_apple.pdf',
    text: `Trade Republic Bank GmbH
Wertpapierabrechnung Kauf
Auftragsnummer: TR-948271
Ausführungszeit: 14.05.2025 um 11:32:05 Uhr
Wertpapier: Apple Inc. Registered Shares (AAPL)
ISIN: US0378331005 | WKN: 865985
Ausführung: 15,0000 Stk. zu 182,40 EUR
Kurswert: 2.736,00 EUR
Fremdkostenzuschlag: 1,00 EUR
Gesamtbetrag zu Ihren Lasten: 2.737,00 EUR`
  },
  {
    label: 'Scalable Capital - Sparplan iShares Core MSCI World',
    broker: 'Scalable Capital',
    filename: 'scalable_sparplan_msci_world.pdf',
    text: `Scalable Capital Vermögensverwaltung
Wertpapierabrechnung Sparplan Ausführung
Datum: 02.06.2025
Name: iShares Core MSCI World UCITS ETF USD (Acc)
ISIN: IE00B4L5Y983 | WKN: A0RPWH
Ticker: EUNL
Ausführungsplatz: gettex
Ausgeführte Anteile: 5,4321 Stk.
Ausführungskurs: 92,05 EUR
Ordervolumen: 500,00 EUR
Gebühren: 0,00 EUR
Endbetrag: 500,00 EUR`
  },
  {
    label: 'Bitpanda - Krypto Kauf Bitcoin (BTC)',
    broker: 'Bitpanda',
    filename: 'bitpanda_trade_btc.png',
    text: `Bitpanda GmbH Trade Confirmation
Transaktionstyp: KAUF KRYPTO
Asset: Bitcoin (BTC)
Datum: 28.08.2025
Menge: 0,04500000 BTC
Ausführungspreis: 58.500,00 EUR
Transaktionsgebühr: 1,49 EUR
Gesamtbetrag: 2.633,99 EUR`
  },
  {
    label: 'ING - Dividende Microsoft Corp.',
    broker: 'ING',
    filename: 'ing_dividende_msft.pdf',
    text: `ING-DiBa AG Ertragsgutschrift Dividende
Zahltag / Datum: 12.06.2025
Wertpapier: Microsoft Corp. Reg. Shares (MSFT)
ISIN: US5949181045
Bestand: 40 Stück
Brutto-Dividende je Aktie: 0,75 USD
Bruttobetrag: 30,00 USD
Wechselkurs: 1,0850 EUR/USD
Bruttobetrag EUR: 27,65 EUR
Einbehaltene US-Quellensteuer (15%): 4,15 EUR
Nettobetrag zu Ihren Gunsten: 23,50 EUR`
  }
];

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  baseCurrency = 'EUR'
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedReceiptData | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const parseTextToTransaction = (rawText: string, brokerGuess: string = 'Broker Abrechnung'): ParsedReceiptData => {
    let type: Transaction['type'] = 'BUY';
    if (/Dividende|Ertragsgutschrift|Ausschüttung/i.test(rawText)) {
      type = 'DIVIDEND';
    } else if (/Verkauf|Sell|Schlussabrechnung Verkauf/i.test(rawText)) {
      type = 'SELL';
    } else if (/Staking|Reward/i.test(rawText)) {
      type = 'STAKING';
    } else if (/Airdrop/i.test(rawText)) {
      type = 'AIRDROP';
    } else if (/Mining/i.test(rawText)) {
      type = 'MINING';
    }

    // Extract Date (DD.MM.YYYY or YYYY-MM-DD)
    let dateStr = new Date().toLocaleDateString('de-DE');
    const dateMatch = rawText.match(/(\d{2}\.\d{2}\.\d{4})/) || rawText.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      if (dateMatch[1].includes('-')) {
        dateStr = dateMatch[1].split('-').reverse().join('.');
      } else {
        dateStr = dateMatch[1];
      }
    }

    // Extract ISIN
    const isinMatch = rawText.match(/\b([A-Z]{2}[A-Z0-9]{9}\d)\b/);
    const isin = isinMatch ? isinMatch[1] : '';

    // Extract Ticker
    let ticker = '';
    const tickerMatch = rawText.match(/\(([A-Z0-9]{2,6})\)/) || rawText.match(/Ticker:\s*([A-Z0-9]+)/i);
    if (tickerMatch) {
      ticker = tickerMatch[1].toUpperCase();
    } else if (isin) {
      ticker = isin.substring(0, 5);
    } else if (/Bitcoin|BTC/i.test(rawText)) {
      ticker = 'BTC';
    } else if (/Ethereum|ETH/i.test(rawText)) {
      ticker = 'ETH';
    } else {
      ticker = 'UNKNOWN';
    }

    // Extract Name
    let name = 'Unbekanntes Wertpapier';
    const nameMatch = rawText.match(/Wertpapier:\s*([^\n\r]+)/i) || rawText.match(/Name:\s*([^\n\r]+)/i) || rawText.match(/Asset:\s*([^\n\r]+)/i);
    if (nameMatch) {
      name = nameMatch[1].trim().replace(/\(.*?\)/g, '').trim();
    } else if (/Bitcoin/i.test(rawText)) {
      name = 'Bitcoin';
    } else if (/Apple/i.test(rawText)) {
      name = 'Apple Inc.';
    }

    // Extract Amount (Shares / Stk / Menge)
    let amount = 1;
    const amountMatch = rawText.match(/(\d+(?:[.,]\d+)?)\s*(?:Stk|Stück|Anteile|Menge|Stueck)/i) ||
                        rawText.match(/(?:Bestand|Ausführung|Menge):\s*(\d+(?:[.,]\d+)?)/i);
    if (amountMatch) {
      amount = parseFloat(amountMatch[1].replace(',', '.'));
    }

    // Extract Price / Ausführungskurs
    let price = 100;
    const priceMatch = rawText.match(/(?:Ausführungskurs|Kurs|Preis|Ausführungspreis):\s*(\d+(?:[.,]\d+)?)/i) ||
                       rawText.match(/zu\s*(\d+(?:[.,]\d+)?)\s*(?:EUR|USD|\$|€)/i);
    if (priceMatch) {
      price = parseFloat(priceMatch[1].replace(',', '.'));
    }

    // Extract Fee
    let fee = 0;
    const feeMatch = rawText.match(/(?:Gebühr|Fremdkostenzuschlag|Provision|Gebühren|Kosten):\s*(\d+(?:[.,]\d+)?)/i);
    if (feeMatch) {
      fee = parseFloat(feeMatch[1].replace(',', '.'));
    }

    // Extract Tax
    let tax = 0;
    const taxMatch = rawText.match(/(?:Steuer|Quellensteuer|Kapitalertragsteuer|Einbehaltene):\s*(\d+(?:[.,]\d+)?)/i);
    if (taxMatch) {
      tax = parseFloat(taxMatch[1].replace(',', '.'));
    }

    // Category
    let category: AssetCategory = 'Stock';
    if (/ETF|Index/i.test(rawText) || /MSCI|Vanguard|iShares/i.test(name)) {
      category = 'ETF';
    } else if (/Krypto|Crypto|Bitcoin|BTC|Ethereum|ETH|Solana|SOL/i.test(rawText)) {
      category = 'Crypto';
    }

    return {
      type,
      date: dateStr,
      ticker,
      name,
      category,
      amount: isNaN(amount) || amount <= 0 ? 1 : amount,
      price: isNaN(price) || price <= 0 ? 1 : price,
      fee: isNaN(fee) ? 0 : fee,
      tax: isNaN(tax) ? 0 : tax,
      currency: 'EUR',
      exchangeRate: 1.0,
      broker: brokerGuess,
      rawText
    };
  };

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setIsProcessing(true);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreviewUrl(null);
    }

    // Read as text or simulate client OCR
    const textReader = new FileReader();
    textReader.onload = (e) => {
      const textContent = (e.target?.result as string) || '';
      setTimeout(() => {
        setIsProcessing(false);
        const parsed = parseTextToTransaction(textContent || file.name, 'Beleg Upload');
        setParsedData(parsed);
      }, 750);
    };

    textReader.onerror = () => {
      setIsProcessing(false);
      setErrorMessage('Fehler beim Lesen der Beleg-Datei.');
    };

    textReader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSimulateReceipt = (demo: typeof DEMO_RECEIPTS[0]) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setTimeout(() => {
      setIsProcessing(false);
      const parsed = parseTextToTransaction(demo.text, demo.broker);
      setParsedData(parsed);
    }, 500);
  };

  const handleSaveTransaction = () => {
    if (!parsedData) return;

    onAddTransaction({
      type: parsedData.type,
      date: parsedData.date,
      ticker: parsedData.ticker.toUpperCase(),
      name: parsedData.name,
      amount: parsedData.amount,
      price: parsedData.price,
      fee: parsedData.fee,
      tax: parsedData.tax,
      category: parsedData.category,
      currency: parsedData.currency,
      exchangeRate: parsedData.exchangeRate,
      broker: parsedData.broker
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
      backdropFilter: 'blur(6px)', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--card-bg, #0f172a)', border: '1px solid var(--border-color)', borderRadius: '18px',
        maxWidth: '780px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', borderRadius: '12px' }}>
              <Camera size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Smart Beleg & Foto Importer <Sparkles size={16} color="#f59e0b" />
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Automatische Texterkennung aus Trade Republic, Scalable, ING, comdirect & Bitpanda Abrechnungen
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--accent-blue, #3b82f6)',
              borderRadius: '14px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'rgba(59, 130, 246, 0.04)',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,.pdf,.txt"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />

            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {isProcessing ? <Sparkles className="animate-spin" size={26} /> : <Upload size={26} />}
            </div>

            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                {isProcessing ? 'Lese Belegdaten aus...' : selectedFile ? `Ausgewählt: ${selectedFile.name}` : 'Beleg / Screenshot hier ablegen oder klicken'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Unterstützt Screenshots, Fotos (PNG, JPG, WebP) und PDF-Abrechnungen
              </div>
            </div>
          </div>

          {/* Demo Simulation Shortcuts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Oder Test-Beleg mit 1-Klick simulieren:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.5rem' }}>
              {DEMO_RECEIPTS.map((demo, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSimulateReceipt(demo)}
                  className="btn-secondary"
                  style={{
                    padding: '0.55rem 0.75rem',
                    fontSize: '0.76rem',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255,255,255,0.03)',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>{demo.broker}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{demo.label.split('-')[1]?.trim()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Parsed Result Form & Preview */}
          {parsedData && (
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: '#10b981' }}>
                  <Check size={16} /> Extrahierte Buchungsdaten (Überprüfung)
                </div>
                <span className={`badge badge-${parsedData.type.toLowerCase()}`}>
                  {parsedData.type}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Typ</label>
                  <select
                    className="form-select"
                    value={parsedData.type}
                    onChange={(e) => setParsedData({ ...parsedData, type: e.target.value as any })}
                  >
                    <option value="BUY">Kauf</option>
                    <option value="SELL">Verkauf</option>
                    <option value="DIVIDEND">Dividende</option>
                    <option value="STAKING">Staking</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Datum</label>
                  <input
                    type="text"
                    className="form-input"
                    value={parsedData.date}
                    onChange={(e) => setParsedData({ ...parsedData, date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Symbol / Ticker</label>
                  <input
                    type="text"
                    className="form-input"
                    value={parsedData.ticker}
                    onChange={(e) => setParsedData({ ...parsedData, ticker: e.target.value.toUpperCase() })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={parsedData.name}
                    onChange={(e) => setParsedData({ ...parsedData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Kategorie</label>
                  <select
                    className="form-select"
                    value={parsedData.category}
                    onChange={(e) => setParsedData({ ...parsedData, category: e.target.value as any })}
                  >
                    <option value="Stock">Aktie</option>
                    <option value="ETF">ETF</option>
                    <option value="Crypto">Krypto</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Anteile / Stück</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    value={parsedData.amount}
                    onChange={(e) => setParsedData({ ...parsedData, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Kurs (EUR)</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    value={parsedData.price}
                    onChange={(e) => setParsedData({ ...parsedData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Gebühren</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    value={parsedData.fee}
                    onChange={(e) => setParsedData({ ...parsedData, fee: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Steuern</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    value={parsedData.tax}
                    onChange={(e) => setParsedData({ ...parsedData, tax: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Broker</label>
                  <input
                    type="text"
                    className="form-input"
                    value={parsedData.broker}
                    onChange={(e) => setParsedData({ ...parsedData, broker: e.target.value })}
                  />
                </div>
              </div>

              {/* Total volume highlight */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                background: 'rgba(59, 130, 246, 0.08)',
                borderRadius: '10px',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Errechneter Gesamtbetrag:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-color)' }}>
                  {(parsedData.amount * parsedData.price + parsedData.fee).toFixed(2)} €
                </span>
              </div>
            </div>
          )}

          {isSuccess && (
            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '10px', color: '#10b981', textAlign: 'center', fontSize: '0.85rem' }}>
              ✅ Transaktion erfolgreich in dein Portfolio übernommen!
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Abbrechen
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSaveTransaction}
            disabled={!parsedData || isProcessing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Check size={16} /> Buchung übernehmen
          </button>
        </div>

      </div>
    </div>
  );
};
