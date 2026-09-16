import React, { useState, useRef, useEffect } from 'react';
import type { Transaction, AssetCategory, AssetMappingRule } from '../types';
import { parseBrokerPdf, parseBrokerText, MOCK_PDF_TEXTS } from './PdfParser';
import { Upload, Plus, Trash2, Info, Edit3, Download, X, Check } from 'lucide-react';
import { PdfPreviewModal } from './PdfPreviewModal';

interface TransactionsProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdateTransaction?: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  prefilledData?: { ticker: string; name: string; category: AssetCategory; price: number } | null;
  onClearPrefilledData?: () => void;
  mappingRules?: AssetMappingRule[];
  onAddRule?: (rule: Omit<AssetMappingRule, 'id'>) => void;
  isReadOnly?: boolean;
}

export const Transactions: React.FC<TransactionsProps> = ({
  transactions,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  prefilledData,
  onClearPrefilledData,
  mappingRules = [],
  onAddRule,
  isReadOnly = false
}) => {
  // Manual transaction form state
  const [type, setType] = useState<Transaction['type']>('BUY');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [ticker, setTicker] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [fee, setFee] = useState<string>('0');
  const [tax, setTax] = useState<string>('0');
  const [category, setCategory] = useState<AssetCategory>('Stock');
  const [currency, setCurrency] = useState<'EUR' | 'USD' | 'CHF'>('EUR');
  const [exchangeRate, setExchangeRate] = useState<string>('1.0');

  // Search & Filter state
  const [searchTx, setSearchTx] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // PDF Preview modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [parsedTx, setParsedTx] = useState<Omit<Transaction, 'id'> | null>(null);

  // In-place Edit state
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter(t => {
      const matchType = filterType === 'ALL' || t.type === filterType;
      const q = searchTx.toLowerCase();
      const matchQuery = !q || t.name.toLowerCase().includes(q) || t.ticker.toLowerCase().includes(q) || t.date.includes(q);
      return matchType && matchQuery;
    });
  }, [transactions, filterType, searchTx]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map(t => t.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBatchDelete = () => {
    if (confirm(`${selectedIds.length} ausgewählte Transaktionen wirklich löschen?`)) {
      selectedIds.forEach(id => onDeleteTransaction(id));
      setSelectedIds([]);
    }
  };

  const handleExportTransactionsCsv = () => {
    const headers = ['ID', 'Datum', 'Typ', 'Ticker', 'Name', 'Kategorie', 'Anteile', 'Kurs', 'Gebuehr', 'Steuer', 'Waehrung', 'Wechselkurs', 'Broker', 'Notizen'];
    const rows = filteredTransactions.map(t => [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.type}"`,
      `"${t.ticker}"`,
      `"${(t.name || '').replace(/"/g, '""')}"`,
      `"${t.category || ''}"`,
      t.amount.toString(),
      t.price.toString(),
      (t.fee || 0).toString(),
      (t.tax || 0).toString(),
      `"${t.currency || 'EUR'}"`,
      (t.exchangeRate || 1.0).toString(),
      `"${t.broker || ''}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `finanzportfolio_transaktionen_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    if (onUpdateTransaction) {
      onUpdateTransaction(editingTx);
    }
    setEditingTx(null);
  };


  useEffect(() => {
    if (prefilledData) {
      setType('BUY');
      setTicker(prefilledData.ticker);
      setName(prefilledData.name);
      setCategory(prefilledData.category);
      setPrice(prefilledData.price.toString());
      setCurrency('EUR');
      setExchangeRate('1.0');
      if (onClearPrefilledData) {
        onClearPrefilledData();
      }
    }
  }, [prefilledData, onClearPrefilledData]);

  useEffect(() => {
    if (type === 'DEPOSIT' || type === 'WITHDRAWAL') {
      setTicker('CASH');
      setName(type === 'DEPOSIT' ? 'Einzahlung (Cash)' : 'Auszahlung (Cash)');
      setPrice('1');
      setCategory('Cash');
    } else if (type === 'STAKING' || type === 'AIRDROP' || type === 'MINING') {
      setCategory('Crypto');
      if (!price) setPrice('1');
      setTicker(t => (t === 'CASH' ? '' : t));
    } else if (type === 'FEE') {
      setTicker(t => (t === 'CASH' ? '' : t));
      if (!price) setPrice('1');
    } else {
      setTicker(t => {
        if (t === 'CASH') {
          setName('');
          setPrice('');
          return '';
        }
        return t;
      });
    }
  }, [type]);

  // Drag and drop state
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [parsingActive, setParsingActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker || !name || !amount || !price) {
      alert('Bitte fülle alle Pflichtfelder aus.');
      return;
    }

    onAddTransaction({
      type,
      date: date.split('-').reverse().join('.'), // Convert YYYY-MM-DD to DD.MM.YYYY
      ticker: ticker.toUpperCase(),
      name,
      amount: parseFloat(amount),
      price: parseFloat(price),
      fee: parseFloat(fee) || 0,
      tax: parseFloat(tax) || 0,
      category,
      currency,
      exchangeRate: parseFloat(exchangeRate) || 1.0
    });

    // Reset fields except date, type, and currency
    if (type !== 'DEPOSIT' && type !== 'WITHDRAWAL') {
      setTicker('');
      setName('');
      setPrice('');
    }
    setAmount('');
    setFee('0');
    setTax('0');
  };

  const handleSimulateDemo = (brokerKey: keyof typeof MOCK_PDF_TEXTS) => {
    try {
      const mockText = MOCK_PDF_TEXTS[brokerKey];
      const parsed = parseBrokerText(mockText, mappingRules);
      
      // Set to preview modal instead of adding directly
      setParsedTx({
        ...parsed,
        currency: 'EUR',
        exchangeRate: 1.0
      });
      setIsPreviewOpen(true);
    } catch (err) {
      console.error(err);
      alert("Fehler bei der Abrechnungssimulation.");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setPdfError("Nur PDF-Dateien werden unterstützt.");
      return;
    }
    setPdfError(null);
    setParsingActive(true);
    try {
      const parsed = await parseBrokerPdf(file, mappingRules);
      
      // Open preview modal instead of adding directly
      setParsedTx({
        ...parsed,
        currency: 'EUR',
        exchangeRate: 1.0
      });
      setIsPreviewOpen(true);
    } catch (err) {
      console.error(err);
      setPdfError("Fehler beim Verarbeiten des PDFs. Bitte stelle sicher, dass es sich um eine Originalabrechnung handelt.");
    } finally {
      setParsingActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  return (
    <div className="grid-main fade-in">
      {/* Left Column: Import / PDF Drop and Manual Entry Form */}
      <div className="sav-col-flex">
        {isReadOnly && (
          <div className="glass-panel text-muted-bg p-4" style={{ borderLeft: '4px solid var(--accent-purple)', background: 'rgba(168, 85, 247, 0.05)', marginBottom: '0.25rem' }}>
            <h4 style={{ margin: 0, color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
              🌐 Gesamtportfolio-Modus (Schreibgeschützt)
            </h4>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-color-muted)' }}>
              In der Gesamtübersicht können keine Transaktionen direkt hinzugefügt, gelöscht oder importiert werden. Bitte wähle ein spezifisches Portfolio aus, um Änderungen vorzunehmen.
            </p>
          </div>
        )}
        
        {/* PDF Import Zone */}
        <div className="glass-panel">
          <h2 className="tx-dropzone-title-h2">PDF Import</h2>
          <p className="tx-dropzone-subtitle">
            Ziehe eine Original-Abrechnung von <strong>Trade Republic</strong>, <strong>Scalable Capital</strong>, <strong>ING</strong>, <strong>comdirect</strong>, <strong>DKB</strong> oder <strong>Consorsbank</strong> hierhin.
          </p>

          <div 
            className={`dropzone ${dragActive && !isReadOnly ? 'active' : ''}`}
            style={isReadOnly ? { opacity: 0.6, cursor: 'not-allowed', pointerEvents: 'none' } : undefined}
            onDragEnter={isReadOnly ? undefined : handleDrag}
            onDragLeave={isReadOnly ? undefined : handleDrag}
            onDragOver={isReadOnly ? undefined : handleDrag}
            onDrop={isReadOnly ? undefined : handleDrop}
            onClick={isReadOnly ? undefined : () => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="tx-dropzone-input-hidden"
              accept=".pdf" 
              title="Broker Abrechnungs-PDF auswählen"
              aria-label="Broker Abrechnungs-PDF auswählen"
              placeholder="PDF-Abrechnung hochladen"
              onChange={isReadOnly ? undefined : handleFileInput}
              disabled={isReadOnly}
            />
            <div className="dropzone-icon">
              <Upload size={24} />
            </div>
            <div className="tx-dropzone-center-text">
              <span className="tx-dropzone-text-main">
                {isReadOnly ? 'PDF-Import deaktiviert' : parsingActive ? 'Lese PDF ein...' : 'Broker PDF auswählen oder reinziehen'}
              </span>
              <span className="tx-dropzone-text-sub">
                {isReadOnly ? 'In der Gesamtübersicht nicht verfügbar' : 'Unterstützt PDF-Abrechnungen'}
              </span>
            </div>
          </div>
          {pdfError && (
            <div className="tx-pdf-error-box">
              <Info size={14} /> {pdfError}
            </div>
          )}

          {/* Demo Simulation buttons */}
          <div className="demo-simulation-zone" style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px dashed var(--border-color)' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Abrechnung simulieren (Demo-Modus)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              <button type="button" disabled={isReadOnly} onClick={(e) => { e.stopPropagation(); handleSimulateDemo('TR'); }} className="btn-secondary" style={{ padding: '0.5rem', fontSize: '0.75rem', opacity: isReadOnly ? 0.5 : 1, cursor: isReadOnly ? 'not-allowed' : 'pointer' }}>Trade Republic (Kauf)</button>
              <button type="button" disabled={isReadOnly} onClick={(e) => { e.stopPropagation(); handleSimulateDemo('SCALABLE'); }} className="btn-secondary" style={{ padding: '0.5rem', fontSize: '0.75rem', opacity: isReadOnly ? 0.5 : 1, cursor: isReadOnly ? 'not-allowed' : 'pointer' }}>Scalable Capital (Verkauf)</button>
              <button type="button" disabled={isReadOnly} onClick={(e) => { e.stopPropagation(); handleSimulateDemo('ING'); }} className="btn-secondary" style={{ padding: '0.5rem', fontSize: '0.75rem', opacity: isReadOnly ? 0.5 : 1, cursor: isReadOnly ? 'not-allowed' : 'pointer' }}>ING Sparplan (Kauf)</button>
              <button type="button" disabled={isReadOnly} onClick={(e) => { e.stopPropagation(); handleSimulateDemo('COMDIRECT'); }} className="btn-secondary" style={{ padding: '0.5rem', fontSize: '0.75rem', opacity: isReadOnly ? 0.5 : 1, cursor: isReadOnly ? 'not-allowed' : 'pointer' }}>comdirect (Kauf)</button>
              <button type="button" disabled={isReadOnly} onClick={(e) => { e.stopPropagation(); handleSimulateDemo('DKB'); }} className="btn-secondary" style={{ padding: '0.5rem', fontSize: '0.75rem', opacity: isReadOnly ? 0.5 : 1, cursor: isReadOnly ? 'not-allowed' : 'pointer' }}>DKB (Kauf)</button>
              <button type="button" disabled={isReadOnly} onClick={(e) => { e.stopPropagation(); handleSimulateDemo('CONSORS'); }} className="btn-secondary" style={{ padding: '0.5rem', fontSize: '0.75rem', opacity: isReadOnly ? 0.5 : 1, cursor: isReadOnly ? 'not-allowed' : 'pointer' }}>Consorsbank (Dividende)</button>
            </div>
          </div>
        </div>

        {/* Manual Form */}
        <div className="glass-panel">
          <h2 className="tx-manual-title">Manuell hinzufügen</h2>
          <form onSubmit={handleSubmit}>
            <div className="tx-form-row-2">
              <div className="form-group">
                <label htmlFor="tx-type" className="form-label">Typ</label>
                <select 
                  id="tx-type"
                  className="form-select" 
                  value={type} 
                  title="Transaktionstyp"
                  aria-label="Transaktionstyp"
                  onChange={(e) => setType(e.target.value as any)}
                  disabled={isReadOnly}
                >
                  <option value="BUY">Kauf</option>
                  <option value="SELL">Verkauf</option>
                  <option value="DIVIDEND">Dividende</option>
                  <option value="STAKING">Staking (Crypto)</option>
                  <option value="AIRDROP">Airdrop (Crypto)</option>
                  <option value="MINING">Mining (Crypto)</option>
                  <option value="FEE">Gebühr / Kosten</option>
                  <option value="DEPOSIT">Einzahlung (Cash)</option>
                  <option value="WITHDRAWAL">Auszahlung (Cash)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tx-category" className="form-label">Kategorie</label>
                <select 
                  id="tx-category"
                  className="form-select" 
                  value={category} 
                  title="Asset-Kategorie"
                  aria-label="Asset-Kategorie"
                  disabled={isReadOnly || type === 'DEPOSIT' || type === 'WITHDRAWAL'}
                  onChange={(e) => setCategory(e.target.value as AssetCategory)}
                >
                  <option value="Stock">Aktie</option>
                  <option value="ETF">ETF</option>
                  <option value="Crypto">Krypto</option>
                  <option value="Bond">Anleihe</option>
                  <option value="RealEstate">Immobilie</option>
                  <option value="PreciousMetal">Edelmetall</option>
                  <option value="P2P">P2P Kredite</option>
                  <option value="Cash">Cash / Liquidität</option>
                </select>
              </div>
            </div>

            {(type !== 'DEPOSIT' && type !== 'WITHDRAWAL') && (
              <div className="tx-form-row-2">
                <div className="form-group">
                  <label htmlFor="tx-ticker" className="form-label">Kürzel / Ticker / ISIN</label>
                  <input 
                    id="tx-ticker"
                    type="text" 
                    className="form-input" 
                    placeholder="z.B. AAPL oder BTC"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    required
                    disabled={isReadOnly}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tx-name" className="form-label">Name</label>
                  <input 
                    id="tx-name"
                    type="text" 
                    className="form-input" 
                    placeholder="z.B. Bitcoin"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            )}

            <div className="tx-form-row-2">
              <div className="form-group">
                <label htmlFor="tx-amount" className="form-label">
                  {type === 'DEPOSIT' || type === 'WITHDRAWAL' ? 'Betrag' : 'Anzahl / Anteile'}
                </label>
                <input 
                  id="tx-amount"
                  type="number" 
                  step="any"
                  className="form-input" 
                  placeholder={type === 'DEPOSIT' || type === 'WITHDRAWAL' ? 'z.B. 1000' : 'z.B. 10'}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  disabled={isReadOnly}
                />
              </div>

              {(type !== 'DEPOSIT' && type !== 'WITHDRAWAL') && (
                <div className="form-group">
                  <label htmlFor="tx-price" className="form-label">Kurs ({currency})</label>
                  <input 
                    id="tx-price"
                    type="number" 
                    step="any"
                    className="form-input" 
                    placeholder="z.B. 175.50"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    disabled={isReadOnly}
                  />
                </div>
              )}
            </div>

            <div className="tx-form-row-2">
              <div className="form-group">
                <label htmlFor="tx-currency" className="form-label">Währung</label>
                <select 
                  id="tx-currency"
                  className="form-select" 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value as any)}
                  disabled={isReadOnly}
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="CHF">CHF (Fr.)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tx-exrate" className="form-label">Wechselkurs (zu EUR)</label>
                <input 
                  id="tx-exrate"
                  type="number" 
                  step="any"
                  className="form-input" 
                  placeholder="z.B. 1.08"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  disabled={isReadOnly || currency === 'EUR'}
                />
              </div>
            </div>

            {(type !== 'DEPOSIT' && type !== 'WITHDRAWAL' && type !== 'STAKING' && type !== 'AIRDROP' && type !== 'MINING') && (
              <div className="tx-form-row-2">
                <div className="form-group">
                  <label htmlFor="tx-fee" className="form-label">Gebühren</label>
                  <input 
                    id="tx-fee"
                    type="number" 
                    step="any"
                    className="form-input" 
                    placeholder="Gebühren"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tx-tax" className="form-label">Steuern</label>
                  <input 
                    id="tx-tax"
                    type="number" 
                    step="any"
                    className="form-input" 
                    placeholder="Steuern"
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="tx-date" className="form-label">Datum</label>
              <input 
                id="tx-date"
                type="date" 
                className="form-input" 
                placeholder="Datum auswählen"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={isReadOnly}
              />
            </div>

            <button type="submit" disabled={isReadOnly} className="btn tx-form-submit-btn-full" style={isReadOnly ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}>
              <Plus size={16} /> {isReadOnly ? 'Schreibgeschützt' : 'Hinzufügen'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Transaction List */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div>
            <h2 className="tx-list-title-h2">Aktivitäten-Protokoll</h2>
            <p className="tx-list-subtitle">
              Alle erfassten Transaktionen ({filteredTransactions.length}).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Suchen (Name/Ticker)..."
              value={searchTx}
              onChange={(e) => setSearchTx(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', width: '140px' }}
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="form-select"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
            >
              <option value="ALL">Alle Typen</option>
              <option value="BUY">Kauf</option>
              <option value="SELL">Verkauf</option>
              <option value="DIVIDEND">Dividende</option>
              <option value="STAKING">Staking</option>
              <option value="AIRDROP">Airdrop</option>
              <option value="MINING">Mining</option>
              <option value="FEE">Gebühr</option>
              <option value="DEPOSIT">Einzahlung</option>
              <option value="WITHDRAWAL">Auszahlung</option>
            </select>
            <button
              type="button"
              onClick={handleExportTransactionsCsv}
              className="btn btn-secondary"
              title="Gefilterte Transaktionen als CSV exportieren"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Download size={13} /> CSV
            </button>
          </div>
        </div>

        {/* Batch Actions Toolbar */}
        {!isReadOnly && filteredTransactions.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 0.75rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '6px',
            marginBottom: '0.5rem',
            fontSize: '0.8rem'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0}
                onChange={toggleSelectAll}
              />
              <span>Alle auswählen ({selectedIds.length} gewählt)</span>
            </label>

            {selectedIds.length > 0 && (
              <button
                onClick={handleBatchDelete}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}
              >
                <Trash2 size={13} /> {selectedIds.length} Einträge löschen
              </button>
            )}
          </div>
        )}

        <div className="tx-list-scrollable">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => {
              const isBuy = tx.type === 'BUY';
              const isDiv = tx.type === 'DIVIDEND';
              const isStaking = tx.type === 'STAKING';
              const isAirdrop = tx.type === 'AIRDROP';
              const isMining = tx.type === 'MINING';
              const isFee = tx.type === 'FEE';
              const isDeposit = tx.type === 'DEPOSIT';
              const isWithdrawal = tx.type === 'WITHDRAWAL';
              
              const txCurrency = tx.currency || 'EUR';
              const symbol = txCurrency === 'USD' ? '$' : txCurrency === 'CHF' ? 'CHF' : '€';
              
              let displayVal = '';
              if (isDeposit || isWithdrawal) {
                displayVal = `${tx.amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
              } else {
                displayVal = `${(tx.amount * tx.price).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
              }

              const isSelected = selectedIds.includes(tx.id);

              const badgeColor = isDeposit ? 'rgba(16, 185, 129, 0.2)' 
                : isWithdrawal ? 'rgba(239, 68, 68, 0.2)' 
                : isStaking ? 'rgba(245, 158, 11, 0.2)' 
                : isAirdrop ? 'rgba(6, 182, 212, 0.2)' 
                : isMining ? 'rgba(234, 179, 8, 0.2)' 
                : isFee ? 'rgba(168, 85, 247, 0.2)' 
                : undefined;

              const badgeTextColor = isDeposit ? 'var(--accent-emerald)' 
                : isWithdrawal ? 'var(--accent-rose)' 
                : isStaking ? 'var(--accent-gold)' 
                : isAirdrop ? '#06b6d4' 
                : isMining ? '#eab308' 
                : isFee ? '#a855f7' 
                : undefined;

              const badgeText = tx.type === 'BUY' ? 'Kauf' 
                : tx.type === 'SELL' ? 'Verkauf' 
                : tx.type === 'DIVIDEND' ? 'Div.' 
                : tx.type === 'STAKING' ? 'Staking' 
                : tx.type === 'AIRDROP' ? 'Airdrop' 
                : tx.type === 'MINING' ? 'Mining' 
                : tx.type === 'FEE' ? 'Gebühr' 
                : tx.type === 'DEPOSIT' ? 'Einz.' 
                : 'Ausz.';

              const isNegative = isBuy || isWithdrawal || isFee;

              return (
                <div key={tx.id} className="tx-item-box" style={{ background: isSelected ? 'rgba(59, 130, 246, 0.08)' : undefined }}>
                  <div className="tx-item-left">
                    {!isReadOnly && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(tx.id)}
                        style={{ cursor: 'pointer', marginRight: '0.3rem' }}
                      />
                    )}
                    <span className={`badge badge-${tx.type.toLowerCase()}`} style={{
                      backgroundColor: badgeColor,
                      color: badgeTextColor
                    }}>
                      {badgeText}
                    </span>
                    <div>
                      <span className="tx-item-name-bold">{tx.name}</span>
                      <span className="tx-item-meta">
                        {tx.date} {(!isDeposit && !isWithdrawal) && `• ${tx.amount} Stk. @ ${tx.price.toLocaleString('de-DE')} ${symbol}`}
                        {txCurrency !== 'EUR' && ` (Kurs: ${tx.exchangeRate || 1.0})`}
                      </span>
                    </div>
                  </div>


                  <div className="tx-item-right-wrap">
                    <div className="tx-item-right-text">
                      <span className="tx-item-total-value" style={{ 
                        color: isNegative ? 'var(--accent-rose)' : (isDiv || isDeposit || isStaking || isAirdrop || isMining) ? 'var(--accent-emerald)' : 'var(--text-color)' 
                      }}>
                        {isNegative ? '-' : '+'}{displayVal}
                      </span>
                      {tx.fee > 0 && (
                        <span className="tx-item-fee-text">
                          inkl. {tx.fee.toFixed(2)} {symbol} Gebühr
                        </span>
                      )}
                    </div>
                    {!isReadOnly && (
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <button 
                          onClick={() => setEditingTx({ ...tx })}
                          className="tx-item-trash-btn"
                          title="Transaktion bearbeiten"
                          aria-label="Transaktion bearbeiten"
                          style={{ color: 'var(--accent-blue, #3b82f6)' }}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button 
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="tx-item-trash-btn"
                          title="Transaktion löschen"
                          aria-label="Transaktion löschen"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="tx-list-empty">
              Keine Transaktionen erfasst.
            </div>
          )}
        </div>
      </div>

      <PdfPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        parsedTransaction={parsedTx}
        onConfirm={(confirmed, saveRule) => {
          onAddTransaction(confirmed);
          if (saveRule && onAddRule) {
            onAddRule(saveRule);
          }
          setParsedTx(null);
        }}
      />

      {/* In-Place Transaction Edit Modal */}
      {editingTx && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(4px)', padding: '1rem'
        }}>
          <div style={{
            background: 'var(--card-bg, #1e293b)', border: '1px solid var(--border-color)', borderRadius: '14px',
            maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={18} className="text-blue-400" /> Transaktion bearbeiten
              </h3>
              <button onClick={() => setEditingTx(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Typ</label>
                  <select
                    className="form-select"
                    value={editingTx.type}
                    onChange={e => setEditingTx({ ...editingTx, type: e.target.value as any })}
                  >
                    <option value="BUY">Kauf</option>
                    <option value="SELL">Verkauf</option>
                    <option value="DIVIDEND">Dividende</option>
                    <option value="DEPOSIT">Einzahlung</option>
                    <option value="WITHDRAWAL">Auszahlung</option>
                    <option value="STAKING">Staking</option>
                    <option value="AIRDROP">Airdrop</option>
                    <option value="MINING">Mining</option>
                    <option value="FEE">Gebühr</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Datum</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="DD.MM.YYYY"
                    value={editingTx.date}
                    onChange={e => setEditingTx({ ...editingTx, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Ticker / Symbol</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingTx.ticker}
                    onChange={e => setEditingTx({ ...editingTx, ticker: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Name / Bezeichnung</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingTx.name}
                    onChange={e => setEditingTx({ ...editingTx, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Stückzahl / Betrag</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    value={editingTx.amount}
                    onChange={e => setEditingTx({ ...editingTx, amount: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Ausführungskurs</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    value={editingTx.price}
                    onChange={e => setEditingTx({ ...editingTx, price: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Gebühren</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    value={editingTx.fee || 0}
                    onChange={e => setEditingTx({ ...editingTx, fee: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Steuern</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    value={editingTx.tax || 0}
                    onChange={e => setEditingTx({ ...editingTx, tax: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Broker / Depot</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="z.B. Trade Republic, Scalable, ING..."
                  value={editingTx.broker || ''}
                  onChange={e => setEditingTx({ ...editingTx, broker: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Notizen</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Optionale Notiz..."
                  value={editingTx.notes || ''}
                  onChange={e => setEditingTx({ ...editingTx, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem' }}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Check size={14} /> Änderungen speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
