import React, { useState, useEffect } from 'react';
import { Webhook, Key, Copy, Check, Play, CheckCircle2, X } from 'lucide-react';
import type { Transaction } from '../types';

interface EmailWebhookDispatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  baseCurrency?: 'EUR' | 'USD' | 'CHF' | 'GBP';
}

interface WebhookLogItem {
  id: string;
  timestamp: string;
  source: 'EMAIL' | 'WEBHOOK' | 'N8N' | 'SIMULATOR';
  status: 'SUCCESS' | 'WARNING';
  summary: string;
  amountEur: number;
}

const SAMPLE_PAYLOADS = [
  {
    title: 'Gmail / Apple Mail Weiterleitung (Trade Republic)',
    type: 'EMAIL',
    content: JSON.stringify({
      subject: 'Deine Wertpapierabrechnung Kauf Apple Inc.',
      from: 'service@traderepublic.com',
      date: new Date().toISOString(),
      body: `Trade Republic Bank GmbH
Wertpapierabrechnung Kauf
Datum: 10.09.2025 um 14:22 Uhr
Wertpapier: Apple Inc. Registered Shares (AAPL)
ISIN: US0378331005
Ausführung: 20 Stk. zu Kurs: 195,50 EUR
Kurswert: 3.910,00 EUR
Fremdkostenzuschlag: 1,00 EUR
Gesamtbetrag: 3.911,00 EUR`
    }, null, 2)
  },
  {
    title: 'n8n / Home Assistant Webhook JSON (Scalable Capital)',
    type: 'N8N',
    content: JSON.stringify({
      event: 'trade_executed',
      broker: 'Scalable Capital',
      ticker: 'EUNL',
      name: 'iShares Core MSCI World UCITS ETF',
      type: 'BUY',
      shares: 10.5,
      price: 94.20,
      fee: 0.0,
      currency: 'EUR',
      date: new Date().toLocaleDateString('de-DE')
    }, null, 2)
  },
  {
    title: 'Google Apps Script E-Mail Parser (ING Dividende)',
    type: 'EMAIL',
    content: JSON.stringify({
      broker: 'ING',
      subject: 'Ertragsgutschrift Dividende Microsoft Corp.',
      ticker: 'MSFT',
      name: 'Microsoft Corp.',
      type: 'DIVIDEND',
      shares: 50,
      price: 0.75,
      grossAmountEur: 34.50,
      taxEur: 5.18,
      netAmountEur: 29.32,
      date: new Date().toLocaleDateString('de-DE')
    }, null, 2)
  }
];

export const EmailWebhookDispatcherModal: React.FC<EmailWebhookDispatcherModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  baseCurrency = 'EUR'
}) => {
  const [webhookToken, setWebhookToken] = useState<string>(() => {
    return localStorage.getItem('finanz_webhook_token') || `wh_sec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  });

  const [copiedToken, setCopiedToken] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'SIMULATOR' | 'GUIDE' | 'LOGS'>('SIMULATOR');
  const [payloadInput, setPayloadInput] = useState<string>(SAMPLE_PAYLOADS[0].content);
  const [parsedPreview, setParsedPreview] = useState<Omit<Transaction, 'id'> | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  const [logs, setLogs] = useState<WebhookLogItem[]>(() => {
    const saved = localStorage.getItem('finanz_webhook_logs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('finanz_webhook_token', webhookToken);
  }, [webhookToken]);

  useEffect(() => {
    localStorage.setItem('finanz_webhook_logs', JSON.stringify(logs));
  }, [logs]);

  if (!isOpen) return null;

  const handleCopyToken = () => {
    navigator.clipboard.writeText(webhookToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleGenerateNewToken = () => {
    if (confirm('Möchtest du wirklich ein neues Webhook-Token generieren? Das alte Token wird damit ungültig.')) {
      const newToken = `wh_sec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      setWebhookToken(newToken);
    }
  };

  const handleSimulatePayload = () => {
    try {
      let data: any = {};
      try {
        data = JSON.parse(payloadInput);
      } catch {
        data = { body: payloadInput };
      }

      let type: Transaction['type'] = 'BUY';
      let ticker = 'UNKNOWN';
      let name = 'Unbekanntes Wertpapier';
      let amount = 1;
      let price = 100;
      let fee = 0;
      let tax = 0;
      let dateStr = new Date().toLocaleDateString('de-DE');

      if (data.type) {
        type = data.type;
        ticker = (data.ticker || 'UNKNOWN').toUpperCase();
        name = data.name || ticker;
        amount = Number(data.shares || data.amount || 1);
        price = Number(data.price || 100);
        fee = Number(data.fee || 0);
        tax = Number(data.tax || data.taxEur || 0);
        dateStr = data.date || dateStr;
      } else {
        const text = data.body || payloadInput;
        if (/Dividende|Ertragsgutschrift/i.test(text)) type = 'DIVIDEND';
        else if (/Verkauf|Sell/i.test(text)) type = 'SELL';

        const tickerMatch = text.match(/\(([A-Z0-9]{2,6})\)/) || text.match(/Ticker:\s*([A-Z0-9]+)/i);
        if (tickerMatch) ticker = tickerMatch[1].toUpperCase();

        const nameMatch = text.match(/Wertpapier:\s*([^\n\r]+)/i) || text.match(/Name:\s*([^\n\r]+)/i);
        if (nameMatch) name = nameMatch[1].trim();

        const amountMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:Stk|Stück|Anteile)/i);
        if (amountMatch) amount = parseFloat(amountMatch[1].replace(',', '.'));

        const priceMatch = text.match(/zu Kurs:\s*(\d+(?:[.,]\d+)?)/i) || text.match(/Ausführungskurs:\s*(\d+(?:[.,]\d+)?)/i);
        if (priceMatch) price = parseFloat(priceMatch[1].replace(',', '.'));

        const feeMatch = text.match(/Fremdkostenzuschlag:\s*(\d+(?:[.,]\d+)?)/i) || text.match(/Gebühren:\s*(\d+(?:[.,]\d+)?)/i);
        if (feeMatch) fee = parseFloat(feeMatch[1].replace(',', '.'));
      }

      const tx: Omit<Transaction, 'id'> = {
        type,
        date: dateStr,
        ticker,
        name,
        amount,
        price,
        fee,
        tax,
        category: /ETF/i.test(name) ? 'ETF' : 'Stock',
        currency: 'EUR',
        exchangeRate: 1.0,
        broker: data.broker || 'Automatischer Webhook Dispatcher'
      };

      setParsedPreview(tx);
    } catch (err) {
      alert('Fehler beim Parsen der Payload. Bitte überprüfe das JSON-Format.');
    }
  };

  const handleConfirmBooking = () => {
    if (!parsedPreview) return;

    onAddTransaction(parsedPreview);

    const newLog: WebhookLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('de-DE'),
      source: 'SIMULATOR',
      status: 'SUCCESS',
      summary: `${parsedPreview.type} ${parsedPreview.amount}x ${parsedPreview.ticker} (${parsedPreview.name})`,
      amountEur: parsedPreview.amount * parsedPreview.price
    };

    setLogs(prev => [newLog, ...prev.slice(0, 19)]);
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setParsedPreview(null);
    }, 2000);
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050,
      backdropFilter: 'blur(5px)', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--card-bg, #0f172a)', border: '1px solid var(--border-color)', borderRadius: '16px',
        maxWidth: '820px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)', overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', borderRadius: '12px' }}>
              <Webhook size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Automatischer E-Mail & Webhook Abrechnungs-Dispatcher
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Direkte Anbindung von Apple Mail, Gmail, Make, n8n & Automatisierungs-Pipelines
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.15)' }}>
          <button
            onClick={() => setActiveTab('SIMULATOR')}
            style={{
              border: 'none',
              background: activeTab === 'SIMULATOR' ? '#3b82f6' : 'transparent',
              color: activeTab === 'SIMULATOR' ? '#ffffff' : 'var(--text-muted)',
              borderRadius: '8px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ⚡ Live Payload Simulator
          </button>
          <button
            onClick={() => setActiveTab('GUIDE')}
            style={{
              border: 'none',
              background: activeTab === 'GUIDE' ? '#3b82f6' : 'transparent',
              color: activeTab === 'GUIDE' ? '#ffffff' : 'var(--text-muted)',
              borderRadius: '8px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            📖 Integrations-Leitfaden (n8n, Gmail, Shortcuts)
          </button>
          <button
            onClick={() => setActiveTab('LOGS')}
            style={{
              border: 'none',
              background: activeTab === 'LOGS' ? '#3b82f6' : 'transparent',
              color: activeTab === 'LOGS' ? '#ffffff' : 'var(--text-muted)',
              borderRadius: '8px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            📜 Event-Protokoll ({logs.length})
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Webhook Token Box */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Key size={13} color="#3b82f6" /> Dein privates Webhook Secret-Token:
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 'bold', color: '#60a5fa', marginTop: '0.2rem' }}>
                {webhookToken}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleCopyToken}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copiedToken ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                {copiedToken ? 'Kopiert!' : 'Token kopieren'}
              </button>
              <button
                type="button"
                onClick={handleGenerateNewToken}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                title="Neues Secret generieren"
              >
                Neu generieren
              </button>
            </div>
          </div>

          {activeTab === 'SIMULATOR' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Sample Shortcuts */}
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  Beispiel-Payload laden:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.35rem' }}>
                  {SAMPLE_PAYLOADS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPayloadInput(sample.content)}
                      className="btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      {sample.title.split('(')[1]?.replace(')', '') || sample.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payload Editor */}
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Eingehende Webhook Payload (JSON oder E-Mail Text):</label>
                <textarea
                  value={payloadInput}
                  onChange={(e) => setPayloadInput(e.target.value)}
                  rows={8}
                  style={{
                    width: '100%',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    color: 'var(--text-color)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleSimulatePayload}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                >
                  <Play size={14} /> Payload parsen & verarbeiten
                </button>
              </div>

              {/* Parsed Preview */}
              {parsedPreview && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.06)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={16} /> Extrahierte Order-Transaktion
                    </div>
                    <span className={`badge badge-${parsedPreview.type.toLowerCase()}`}>{parsedPreview.type}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem', fontSize: '0.8rem' }}>
                    <div><span style={{ color: 'var(--text-muted)' }}>Datum:</span> <strong>{parsedPreview.date}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Ticker:</span> <strong>{parsedPreview.ticker}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Name:</span> <strong>{parsedPreview.name}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Menge:</span> <strong>{parsedPreview.amount} Stk.</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Kurs:</span> <strong>{parsedPreview.price.toFixed(2)} €</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Gebühren:</span> <strong>{parsedPreview.fee.toFixed(2)} €</strong></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={handleConfirmBooking}
                      className="btn btn-primary"
                      style={{ background: '#10b981', borderColor: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Check size={16} /> 1-Klick ins Portfolio übernehmen
                    </button>
                  </div>
                </div>
              )}

              {bookingSuccess && (
                <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '8px', color: '#10b981', textAlign: 'center', fontSize: '0.85rem' }}>
                  ✅ Transaktion erfolgreich im Portfolio erfasst und im Event-Log vermerkt!
                </div>
              )}
            </div>
          )}

          {activeTab === 'GUIDE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>Option 1: Apple Mail / Shortcuts (macOS / iOS)</h4>
                <p style={{ margin: 0 }}>
                  Erstelle einen Kurzbefehl mit dem Auslöser "Wenn E-Mail von <em>@traderepublic.com</em> eingeht": E-Mail-Text auslesen und per POST-Request mit deinem Token an deinen privaten Webhook-Endpunkt senden.
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>Option 2: n8n / Home Assistant Automation</h4>
                <p style={{ margin: 0 }}>
                  Konfiguriere einen IMAP-Node, der neue PDFs filtert. Der Node extrahiert die Felder (Ticker, Name, Anteile, Kurs) und pusht sie als JSON an die Portfolio-Schnittstelle.
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>Option 3: Google Apps Script</h4>
                <p style={{ margin: 0 }}>
                  Ein einfaches Zeit-getriggertes Script in Google Mail durchsucht das Label "Depot-Abrechnungen" und sendet den Abrechnungstext automatisch per Webhook weiter.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'LOGS' && (
            <div>
              {logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Noch keine Webhook-Events erfasst.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {logs.map(log => (
                    <div
                      key={log.id}
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.8rem'
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 'bold' }}>{log.summary}</span>
                        <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.75rem' }}>{log.timestamp} ({log.source})</span>
                      </div>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>{log.amountEur.toFixed(2)} {baseCurrency}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Schließen
          </button>
        </div>

      </div>
    </div>
  );
};
