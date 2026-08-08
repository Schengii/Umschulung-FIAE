import React, { useState } from 'react';
import type { Transaction, AssetCategory } from '../types';
import { X, Check } from 'lucide-react';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  parsedTransaction: Omit<Transaction, 'id'> | null;
  onConfirm: (
    confirmedTx: Omit<Transaction, 'id'>,
    saveRule?: { pattern: string; ticker: string; name: string; category: AssetCategory }
  ) => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  parsedTransaction,
  onConfirm,
}) => {
  const [editedTx, setEditedTx] = useState<Omit<Transaction, 'id'> | null>(null);
  const [shouldCreateRule, setShouldCreateRule] = useState<boolean>(false);
  const [rulePattern, setRulePattern] = useState<string>('');

  const isIsin = (str: string) => {
    return /^[A-Z]{2}[A-Z0-9]{9}\d$/.test(str);
  };

  React.useEffect(() => {
    if (parsedTransaction) {
      setEditedTx({
        ...parsedTransaction,
        currency: parsedTransaction.currency || 'EUR',
        exchangeRate: parsedTransaction.exchangeRate || 1.0,
      });
      // Pre-fill pattern if the parsed ticker is an ISIN
      if (isIsin(parsedTransaction.ticker)) {
        setRulePattern(parsedTransaction.ticker);
        setShouldCreateRule(true);
      } else {
        setRulePattern('');
        setShouldCreateRule(false);
      }
    }
  }, [parsedTransaction]);

  if (!isOpen || !editedTx) return null;

  const handleChange = (field: keyof Omit<Transaction, 'id'>, value: any) => {
    setEditedTx(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSave = () => {
    if (editedTx) {
      const isinPattern = rulePattern.trim();
      if (shouldCreateRule && isinPattern) {
        onConfirm(editedTx, {
          pattern: isinPattern,
          ticker: editedTx.ticker,
          name: editedTx.name,
          category: editedTx.category,
        });
      } else {
        onConfirm(editedTx);
      }
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
        <div className="modal-header">
          <h3 className="wl-add-form-title m-0">PDF Abrechnung Vorschau</h3>
          <button className="btn-close" onClick={onClose} aria-label="Schließen">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <p className="hl-subtitle" style={{ margin: 0 }}>
            Bitte überprüfe die aus dem PDF extrahierten Daten und passe sie bei Bedarf an.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Transaktionstyp</label>
              <select
                className="form-input"
                value={editedTx.type}
                onChange={(e) => handleChange('type', e.target.value as any)}
              >
                <option value="BUY">Kauf</option>
                <option value="SELL">Verkauf</option>
                <option value="DIVIDEND">Dividende</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Datum</label>
              <input
                type="text"
                className="form-input"
                value={editedTx.date}
                onChange={(e) => handleChange('date', e.target.value)}
                placeholder="DD.MM.YYYY"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kürzel (Ticker)</label>
              <input
                type="text"
                className="form-input"
                value={editedTx.ticker}
                onChange={(e) => handleChange('ticker', e.target.value.toUpperCase())}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Name des Assets</label>
              <input
                type="text"
                className="form-input"
                value={editedTx.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Stückzahl / Anzahl</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={editedTx.amount}
                onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preis pro Stück</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={editedTx.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gebühren</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={editedTx.fee}
                onChange={(e) => handleChange('fee', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Steuern</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={editedTx.tax}
                onChange={(e) => handleChange('tax', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kategorie</label>
              <select
                className="form-input"
                value={editedTx.category}
                onChange={(e) => handleChange('category', e.target.value as AssetCategory)}
              >
                <option value="Stock">Aktie</option>
                <option value="ETF">ETF</option>
                <option value="Crypto">Krypto</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Währung</label>
              <select
                className="form-input"
                value={editedTx.currency || 'EUR'}
                onChange={(e) => handleChange('currency', e.target.value as any)}
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="CHF">CHF (Fr.)</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={shouldCreateRule}
                onChange={(e) => setShouldCreateRule(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              Dauerhafte PDF-Mappingregel für diese ISIN anlegen
            </label>
            
            {shouldCreateRule && (
              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label className="form-label">ISIN / Such-Muster im PDF</label>
                <input
                  type="text"
                  className="form-input"
                  value={rulePattern}
                  onChange={(e) => setRulePattern(e.target.value)}
                  placeholder="Z.B. US0378331002"
                />
                <span className="tx-item-fee-text" style={{ fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  Zukünftige PDFs, die diesen Text enthalten, werden automatisch diesem Ticker und Namen zugeordnet.
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Abbrechen
          </button>
          <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Check size={16} /> Bestätigen & Speichern
          </button>
        </div>
      </div>
    </div>
  );
};
