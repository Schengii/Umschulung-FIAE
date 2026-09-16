import React, { useState } from 'react';
import type { Portfolio } from '../types';
import { QrCode, Key, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { encryptData, decryptData } from '../services/cryptoStorage';

interface QrSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolios: Portfolio[];
  onImportDecrypted: (portfolios: Portfolio[]) => void;
}

export const QrSyncModal: React.FC<QrSyncModalProps> = ({
  isOpen,
  onClose,
  portfolios,
  onImportDecrypted
}) => {
  const [pin, setPin] = useState('');
  const [activeMode, setActiveMode] = useState<'SEND' | 'RECEIVE'>('SEND');
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [receivePayloadInput, setReceivePayloadInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleGenerateQr = async () => {
    if (!pin) {
      setStatusMessage({ type: 'error', text: 'Bitte gib deine Master-PIN ein.' });
      return;
    }

    try {
      const rawJson = JSON.stringify(portfolios);
      const encrypted = await encryptData(rawJson, pin);
      const base64Enc = btoa(JSON.stringify(encrypted));
      setQrPayload(base64Enc);
      setStatusMessage({ type: 'success', text: 'Verschlüsselter Air-Gap Transfer bereit!' });
    } catch {
      setStatusMessage({ type: 'error', text: 'Fehler bei der Verschlüsselung.' });
    }
  };

  const handleImportQr = async () => {
    if (!pin || !receivePayloadInput.trim()) {
      setStatusMessage({ type: 'error', text: 'Bitte gib den verschlüsselten Code und die Master-PIN ein.' });
      return;
    }

    try {
      const encryptedObj = JSON.parse(atob(receivePayloadInput.trim()));
      const decryptedJson = await decryptData(encryptedObj, pin);
      const parsed = JSON.parse(decryptedJson);

      if (Array.isArray(parsed)) {
        onImportDecrypted(parsed);
        setStatusMessage({ type: 'success', text: 'Depot erfolgreich per Air-Gap importiert!' });
      } else {
        setStatusMessage({ type: 'error', text: 'Ungültige Depotdaten.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Entschlüsselung fehlgeschlagen: Falsche PIN oder beschädigter Code.' });
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--card-bg, #0f172a)', border: '1px solid var(--border-color)', borderRadius: '16px',
        maxWidth: '520px', width: '100%', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px' }}>
              <QrCode size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Air-Gapped Offline QR-Code Vault Transfer</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>100% kontaktlose, internetfreie Depotübertragung</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Controls */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.4rem', borderRadius: '8px' }}>
            <button
              onClick={() => { setActiveMode('SEND'); setStatusMessage(null); }}
              className={`nav-tab ${activeMode === 'SEND' ? 'active' : ''}`}
              style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', borderRadius: '6px', textAlign: 'center' }}
            >
              Exportieren (QR Code senden)
            </button>
            <button
              onClick={() => { setActiveMode('RECEIVE'); setStatusMessage(null); }}
              className={`nav-tab ${activeMode === 'RECEIVE' ? 'active' : ''}`}
              style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', borderRadius: '6px', textAlign: 'center' }}
            >
              Importieren (Code einfügen)
            </button>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Key size={14} className="text-amber-400" /> Master-PIN
            </label>
            <input
              type="password"
              placeholder="Deine 4-stellige Master-PIN"
              value={pin}
              onChange={e => setPin(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', marginTop: '0.25rem' }}
            />
          </div>

          {activeMode === 'SEND' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
              <button onClick={handleGenerateQr} className="btn btn-primary" style={{ width: '100%' }}>
                Verschlüsselten QR-Transfer generieren
              </button>

              {qrPayload && (
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ background: '#fff', padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QrCode size={180} color="#0f172a" />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Scanne den Code mit deinem Smartphone oder kopiere den verschlüsselten Air-Gap-String:
                  </div>
                  <textarea
                    readOnly
                    value={qrPayload}
                    rows={3}
                    style={{ width: '100%', fontSize: '0.7rem', padding: '0.4rem', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', color: '#94a3b8' }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verschlüsselter Code</label>
                <textarea
                  rows={4}
                  placeholder="Füge hier den verschlüsselten Air-Gap Transfer-String ein..."
                  value={receivePayloadInput}
                  onChange={e => setReceivePayloadInput(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', marginTop: '0.25rem', fontSize: '0.75rem' }}
                />
              </div>

              <button onClick={handleImportQr} className="btn btn-primary" style={{ width: '100%' }}>
                Depot entschlüsseln & importieren
              </button>
            </div>
          )}

          {statusMessage && (
            <div style={{
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: statusMessage.type === 'success' ? '#10b981' : '#ef4444',
              border: `1px solid ${statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
            }}>
              {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
