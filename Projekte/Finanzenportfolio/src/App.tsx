import { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { Dashboard } from './components/Dashboard';
import { Holdings } from './components/Holdings';
import { Transactions } from './components/Transactions';
import { Strategy } from './components/Strategy';
import { Watchlist } from './components/Watchlist';
import { SavingsSimulator } from './components/SavingsSimulator';
import { DividendCalendar } from './components/DividendCalendar';
import { MappingEditor } from './components/MappingEditor';
import { usePortfolio } from './context/PortfolioContext';
import { Wallet, PieChart, Activity, Sliders, Eye, FolderOpen, Calendar, Settings, Upload, FileText, RefreshCw, FileSpreadsheet, Sparkles, Building, Layers } from 'lucide-react';
import './App.css';

import { RealEstateTracker } from './components/RealEstateTracker';
import { DepositLadderWidget } from './components/DepositLadderWidget';
import { CloudSyncModal } from './components/CloudSyncModal';
import { OrderAssistantModal } from './components/OrderAssistantModal';
import { QrSyncModal } from './components/QrSyncModal';
import { CryptoTaxLossHarvestingModal } from './components/CryptoTaxLossHarvestingModal';
import { PdfFactsheetExporter } from './components/PdfFactsheetExporter';
import { DualPortfolioCompareModal } from './components/DualPortfolioCompareModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { WithholdingTaxRefundModal } from './components/WithholdingTaxRefundModal';
import { DripCompoundModal } from './components/DripCompoundModal';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { CalendarExportModal } from './components/CalendarExportModal';
import { Cloud, ShoppingCart, QrCode, Coins, Columns, Search, Landmark, Repeat, Camera } from 'lucide-react';

const BatchPdfUploadModal = lazy(() => import('./components/BatchPdfUploadModal').then(m => ({ default: m.BatchPdfUploadModal })));
const TaxReportModal = lazy(() => import('./components/TaxReportModal').then(m => ({ default: m.TaxReportModal })));
const StressTestModal = lazy(() => import('./components/StressTestModal').then(m => ({ default: m.StressTestModal })));
const SettingsModal = lazy(() => import('./components/SettingsModal').then(m => ({ default: m.SettingsModal })));
const CsvImportModal = lazy(() => import('./components/CsvImportModal').then(m => ({ default: m.CsvImportModal })));
const PdfExportModal = lazy(() => import('./components/PdfExportModal').then(m => ({ default: m.PdfExportModal })));

import { VaultUnlockModal } from './components/VaultUnlockModal';
import { TaxLossHarvestingModal } from './components/TaxLossHarvestingModal';
import { OptionIncomeTracker } from './components/OptionIncomeTracker';
import { Scale, DollarSign } from 'lucide-react';

function App() {
  const {
    portfolios,
    activePortfolio,
    activePortfolioId,
    currentPrices,
    baseCurrency,
    setBaseCurrency,
    isDarkMode,
    setIsDarkMode,
    activeBrokerFilter,
    setActiveBrokerFilter,
    isVaultLocked,
    unlockVault,
    resetVault,
    holdings,
    stats,
    switchPortfolio,
    createPortfolio,
    deletePortfolio,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addWatchlistItem,
    removeWatchlistItem,
    addSavingsPlan,
    toggleSavingsPlan,
    removeSavingsPlan,
    executeSavingsPlans,
    addMappingRule,
    deleteMappingRule,
    refreshPrices,
    importBackup,
    addRealEstate,
    updateRealEstate,
    deleteRealEstate,
    addDepositLadderItem,
    updateDepositLadderItem,
    deleteDepositLadderItem
  } = usePortfolio();

  const [currentTab, setCurrentTab] = useState<'dashboard' | 'holdings' | 'transactions' | 'strategy' | 'dividend_calendar' | 'watchlist' | 'savings' | 'options' | 'real_estate' | 'deposit_ladder' | 'mapping_rules'>('dashboard');
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showBatchPdfModal, setShowBatchPdfModal] = useState(false);
  const [showTaxReportModal, setShowTaxReportModal] = useState(false);
  const [showTaxHarvestingModal, setShowTaxHarvestingModal] = useState(false);
  const [showWithholdingTaxModal, setShowWithholdingTaxModal] = useState(false);
  const [showStressTestModal, setShowStressTestModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCsvImportModal, setShowCsvImportModal] = useState(false);
  const [showPdfExportModal, setShowPdfExportModal] = useState(false);
  const [showCloudSyncModal, setShowCloudSyncModal] = useState(false);
  const [showOrderAssistantModal, setShowOrderAssistantModal] = useState(false);
  const [showQrSyncModal, setShowQrSyncModal] = useState(false);
  const [showCryptoTaxModal, setShowCryptoTaxModal] = useState(false);
  const [showFactsheetModal, setShowFactsheetModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showDripModal, setShowDripModal] = useState(false);
  const [showReceiptScannerModal, setShowReceiptScannerModal] = useState(false);
  const [showCalendarExportModal, setShowCalendarExportModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Global Keyboard Shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddTransaction = (tx: any) => {
    addTransaction({ ...tx, id: `tx-${Date.now()}` });
  };

  const handleAddRule = (rule: any) => {
    addMappingRule({ ...rule, id: `rule-${Date.now()}` });
  };

  const handleAddWatchlist = (item: any) => {
    addWatchlistItem({
      ...item,
      id: `w-${Date.now()}`,
      addedAt: new Date().toLocaleDateString('de-DE')
    });
  };

  const handleAddSavingsPlan = (plan: any) => {
    addSavingsPlan({ ...plan, id: `sp-${Date.now()}` });
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }, [isDarkMode]);

  const triggeredWatchlist = useMemo(() => {
    const list = activePortfolio.watchlist || [];
    return list.filter(item => {
      const price = currentPrices[item.ticker];
      return price && price <= item.targetPrice;
    });
  }, [activePortfolio.watchlist, currentPrices]);

  const handleRefreshPrices = async () => {
    setIsRefreshing(true);
    await refreshPrices();
    setIsRefreshing(false);
  };

  const handleExportBackup = () => {
    const json = JSON.stringify(portfolios, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finanzenportfolio_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (Array.isArray(parsed)) {
          importBackup(parsed);
          alert('Backup erfolgreich wiederhergestellt!');
        }
      } catch {
        alert('Fehler beim Lesen der Backup-Datei.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-icon">
            <Wallet size={20} color="#fff" />
          </div>
          <span className="logo-text">FinanzPortfolio CoPilot</span>
        </div>

        {/* Action Controls & Switcher */}
        <div className="header-controls-group">
          <button
            onClick={() => setShowCommandPalette(true)}
            className="theme-toggle-btn"
            title="Befehlspalette / Spotlight-Suche öffnen (Strg + K)"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 0.6rem', width: 'auto' }}
          >
            <Search size={15} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Strg+K</span>
          </button>

          <button 
            onClick={handleRefreshPrices}
            disabled={isRefreshing}
            className="theme-toggle-btn"
            title="Echtzeit-Kurse & Währungen aktualisieren"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>

          {/* Categorized Tools & Assistants Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowToolsDropdown(prev => !prev)}
              className="theme-toggle-btn"
              title="Werkzeuge, Steuern & Assistenten öffnen"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 0.75rem',
                width: 'auto',
                background: showToolsDropdown ? 'var(--accent-blue, #3b82f6)' : undefined,
                color: showToolsDropdown ? '#fff' : undefined,
                fontWeight: 600
              }}
            >
              <Sparkles size={15} />
              <span style={{ fontSize: '0.75rem' }}>Werkzeuge</span>
            </button>

            {showToolsDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '115%',
                  right: 0,
                  width: '320px',
                  background: 'var(--card-bg, #0f172a)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
                  padding: '0.75rem',
                  zIndex: 200,
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                {/* Section 1: Analyse & Berichte */}
                <div>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 700 }}>
                    📊 Analyse & Berichte
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button
                      onClick={() => { setShowCompareModal(true); setShowToolsDropdown(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.4rem 0.5rem', background: 'transparent', border: 'none', borderRadius: '6px', color: 'var(--text-color)', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem' }}
                      className="hover:bg-slate-800"
                    >
                      <Columns size={14} style={{ color: '#3b82f6' }} /> Dual Portfolio-Vergleich
                    </button>
                    <button
                      onClick={() => { setShowFactsheetModal(true); setShowToolsDropdown(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.4rem 0.5rem', background: 'transparent', border: 'none', borderRadius: '6px', color: 'var(--text-color)', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem' }}
                      className="hover:bg-slate-800"
                    >
                      <FileSpreadsheet size={14} style={{ color: '#8b5cf6' }} /> Fonds-Factsheet (PDF)
                    </button>
                    <button
                      onClick={() => { setShowDripModal(true); setShowToolsDropdown(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.4rem 0.5rem', background: 'transparent', border: 'none', borderRadius: '6px', color: 'var(--text-color)', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem' }}
                      className="hover:bg-slate-800"
                    >
                      <Repeat size={14} style={{ color: '#10b981' }} /> DRIP Dividenden-Zinseszins
                    </button>
                    <button
                      onClick={() => { setShowCalendarExportModal(true); setShowToolsDropdown(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.4rem 0.5rem', background: 'transparent', border: 'none', borderRadius: '6px', color: 'var(--text-color)', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem' }}
                      className="hover:bg-slate-800"
                    >
                      <Calendar size={14} style={{ color: '#f59e0b' }} /> Finanzkalender & iCal Export
                    </button>
                    <button
                      onClick={() => { setShowStressTestModal(true); setShowToolsDropdown(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.4rem 0.5rem', background: 'transparent', border: 'none', borderRadius: '6px', color: 'var(--text-color)', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem' }}
                      className="hover:bg-slate-800"
                    >
                      <Sparkles size={14} style={{ color: '#ec4899' }} /> Monte Carlo & Stresstests
                    </button>
                    <button
                      onClick={() => { setShowPdfExportModal(true); setShowToolsDropdown(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.4rem 0.5rem', background: 'transparent', border: 'none', borderRadius: '6px', color: 'var(--text-color)', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem' }}
                      className="hover:bg-slate-800"
                    >
                      <FileText size={14} style={{ color: '#10b981' }} /> PDF Monatsbericht drucken
                    </button>
                  </div>
                </div>

                {/* Section 2: Steuern & DACH */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 700 }}>
                    📑 Steuern & DACH
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button
                      onClick={() => { setShowTaxReportModal(true); setShowToolsDropdown(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.4rem 0.5rem', background: 'transparent', border: 'none', borderRadius: '6px', color: 'var(--text-color)', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem' }}
                      className="hover:bg-slate-800"
                    >
                      <FileText size={14} style={{ color: '#f59e0b' }} /> Steuer- & Verlusttöpfe Report
                    </button>
                    <button
                      onClick={() => { setShowTaxHarvestingModal(true); setShowToolsDropdown(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.4rem 0.5rem', background: 'transparent', border: 'none', borderRadius: '6px', color: 'var(--text-color)', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem' }}
                      className="hover:bg-slate-800"
                    >
                      <Scale size={14} style={{ color: '#10b981' }} /> Tax Loss Harvesting & Freibetrag
                    </button>
                    <button
                      onClick={() => { setShowWithholdingTaxModal(true); setShowToolsDropdown(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.4rem 0.5rem', background: 'transparent', border: 'none', borderRadius: '6px', color: 'var(--text-color)', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem' }}
                      className="hover:bg-slate-800"
                    >
                      <Landmark size={14} style={{ color: '#06b6d4' }} /> Quellensteuer-Rückerstattung
                    </button>
                    <button
                      onClick={() => { setShowCryptoTaxModal(true); setShowToolsDropdown(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.4rem 0.5rem', background: 'transparent', border: 'none', borderRadius: '6px', color: 'var(--text-color)', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem' }}
                      className="hover:bg-slate-800"
                    >
                      <Coins size={14} style={{ color: '#eab308' }} /> Krypto FiFo Tranchen-Radar
                    </button>
                  </div>
                </div>

                {/* Section 3: Daten & Cloud */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 700 }}>
                    📥 Daten, Import & Sync
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button
                      onClick={() => { setShowBatchPdfModal(true); setShowToolsDropdown(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.4rem 0.5rem', background: 'transparent', border: 'none', borderRadius: '6px', color: 'var(--text-color)', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem' }}
                      className="hover:bg-slate-800"
                    >
                      <Upload size={14} style={{ color: '#3b82f6' }} /> Stapel PDF Upload
                    </button>
                    <button
                      onClick={() => { setShowReceiptScannerModal(true); setShowToolsDropdown(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.4rem 0.5rem', background: 'transparent', border: 'none', borderRadius: '6px', color: 'var(--text-color)', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem' }}
                      className="hover:bg-slate-800"
                    >
                      <Camera size={14} style={{ color: '#06b6d4' }} /> Smart Beleg- & Foto-Scanner
                    </button>
                    <button
                      onClick={() => { setShowCsvImportModal(true); setShowToolsDropdown(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.4rem 0.5rem', background: 'transparent', border: 'none', borderRadius: '6px', color: 'var(--text-color)', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem' }}
                      className="hover:bg-slate-800"
                    >
                      <FileSpreadsheet size={14} style={{ color: '#10b981' }} /> Universal CSV Importer
                    </button>
                    <button
                      onClick={() => { setShowOrderAssistantModal(true); setShowToolsDropdown(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.4rem 0.5rem', background: 'transparent', border: 'none', borderRadius: '6px', color: 'var(--text-color)', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem' }}
                      className="hover:bg-slate-800"
                    >
                      <ShoppingCart size={14} style={{ color: '#14b8a6' }} /> Neobroker Order-Assistent
                    </button>
                    <button
                      onClick={() => { setShowCloudSyncModal(true); setShowToolsDropdown(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.4rem 0.5rem', background: 'transparent', border: 'none', borderRadius: '6px', color: 'var(--text-color)', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem' }}
                      className="hover:bg-slate-800"
                    >
                      <Cloud size={14} style={{ color: '#6366f1' }} /> Nextcloud / WebDAV Sync
                    </button>
                    <button
                      onClick={() => { setShowQrSyncModal(true); setShowToolsDropdown(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.4rem 0.5rem', background: 'transparent', border: 'none', borderRadius: '6px', color: 'var(--text-color)', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem' }}
                      className="hover:bg-slate-800"
                    >
                      <QrCode size={14} style={{ color: '#a855f7' }} /> Offline QR-Code Transfer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="theme-toggle-btn"
            title="Einstellungen & Sicherheit (PIN)"
          >
            <Settings size={16} />
          </button>

          <div className="portfolio-selector-container">
            <select
              value={activeBrokerFilter}
              onChange={(e) => setActiveBrokerFilter(e.target.value)}
              className="portfolio-select"
              title="Nach Broker filtern"
            >
              <option value="ALL">Alle Broker</option>
              <option value="Trade Republic">Trade Republic</option>
              <option value="Scalable Capital">Scalable Capital</option>
              <option value="ING">ING-DiBa</option>
              <option value="Comdirect">Comdirect</option>
              <option value="Consorsbank">Consorsbank</option>
              <option value="Finanzen.net Zero">Finanzen.net ZERO</option>
              <option value="Bitpanda">Bitpanda / Crypto</option>
            </select>
          </div>

          <div className="portfolio-selector-container">
            <FolderOpen size={16} className="portfolio-select-icon" />
            <select 
              value={activePortfolioId}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'CREATE_NEW') {
                  const name = prompt('Name des neuen Portfolios:');
                  if (name && name.trim()) createPortfolio(name.trim());
                } else if (val === 'DELETE_CURRENT') {
                  if (confirm(`Möchtest du "${activePortfolio.name}" wirklich löschen?`)) {
                    deletePortfolio(activePortfolioId);
                  }
                } else {
                  switchPortfolio(val);
                }
              }}
              className="portfolio-select"
            >
              <option value="FAMILY_ALL">👨‍👩‍👧‍👦 Familien-Gesamtsicht (Alle Depots)</option>
              {portfolios.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
              <option value="" disabled>──────────</option>
              <option value="CREATE_NEW">+ Neues Portfolio...</option>
              <option value="DELETE_CURRENT">🗑️ Aktuelles Portfolio löschen</option>
            </select>
          </div>
        </div>

        <nav className="navigation-tabs">
          <button className={`nav-tab ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentTab('dashboard')}>
            <PieChart size={16} /> Dashboard
          </button>
          <button className={`nav-tab ${currentTab === 'holdings' ? 'active' : ''}`} onClick={() => setCurrentTab('holdings')}>
            <Wallet size={16} /> Investments
          </button>
          <button className={`nav-tab ${currentTab === 'transactions' ? 'active' : ''}`} onClick={() => setCurrentTab('transactions')}>
            <Activity size={16} /> Aktivitäten
          </button>
          <button className={`nav-tab ${currentTab === 'strategy' ? 'active' : ''}`} onClick={() => setCurrentTab('strategy')}>
            <Sliders size={16} /> Strategie
          </button>
          <button className={`nav-tab ${currentTab === 'dividend_calendar' ? 'active' : ''}`} onClick={() => setCurrentTab('dividend_calendar')}>
            <Calendar size={16} /> Zahltage
          </button>
          <button className={`nav-tab ${currentTab === 'watchlist' ? 'active' : ''}`} onClick={() => setCurrentTab('watchlist')}>
            <Eye size={16} /> Watchlist
          </button>
          <button className={`nav-tab ${currentTab === 'savings' ? 'active' : ''}`} onClick={() => setCurrentTab('savings')}>
            <Calendar size={16} /> Sparpläne
          </button>
          <button className={`nav-tab ${currentTab === 'options' ? 'active' : ''}`} onClick={() => setCurrentTab('options')}>
            <DollarSign size={16} /> Optionen
          </button>
          <button className={`nav-tab ${currentTab === 'real_estate' ? 'active' : ''}`} onClick={() => setCurrentTab('real_estate')}>
            <Building size={16} /> Immobilien
          </button>
          <button className={`nav-tab ${currentTab === 'deposit_ladder' ? 'active' : ''}`} onClick={() => setCurrentTab('deposit_ladder')}>
            <Layers size={16} /> Zinstreppe
          </button>
          <button className={`nav-tab ${currentTab === 'mapping_rules' ? 'active' : ''}`} onClick={() => setCurrentTab('mapping_rules')}>
            <Settings size={16} /> PDF-Regeln
          </button>
        </nav>
      </header>

      {/* Global Watchlist Notification Banner */}
      {triggeredWatchlist.length > 0 && (
        <div className="wl-global-banner" style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))',
          borderBottom: '1px solid rgba(16, 185, 129, 0.3)',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🔔</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: 500 }}>
              Kaufsignale! <strong>{triggeredWatchlist.length} beobachtete Werte</strong> haben ihren Zielpreis erreicht: {triggeredWatchlist.map(item => `${item.ticker} (${item.targetPrice}€)`).join(', ')}
            </span>
          </div>
          <button className="btn btn-primary" onClick={() => setCurrentTab('watchlist')}>
            Zur Watchlist
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="app-main-content">
        {currentTab === 'dashboard' && (
          <Dashboard 
            stats={stats} 
            holdings={holdings} 
            transactions={activePortfolio.transactions || []} 
            onExportAll={handleExportBackup}
            onImportAll={handleImportBackup}
            onExportCSV={handleExportBackup}
            onImportCSV={handleImportBackup}
            baseCurrency={baseCurrency}
          />
        )}
        {currentTab === 'holdings' && (
          <Holdings 
            holdings={holdings} 
            transactions={activePortfolio.transactions || []}
            onTriggerPriceRefresh={handleRefreshPrices}
            baseCurrency={baseCurrency}
            onBaseCurrencyChange={setBaseCurrency}
          />
        )}
        {currentTab === 'transactions' && (
          <Transactions 
            transactions={activePortfolio.transactions || []}
            onAddTransaction={handleAddTransaction}
            onUpdateTransaction={updateTransaction}
            onDeleteTransaction={deleteTransaction}
            mappingRules={activePortfolio.mappingRules || []}
            onAddRule={handleAddRule}
          />
        )}
        {currentTab === 'strategy' && (
          <Strategy 
            holdings={holdings} 
            totalValue={stats.totalValue} 
          />
        )}
        {currentTab === 'dividend_calendar' && (
          <DividendCalendar 
            transactions={activePortfolio.transactions || []}
            holdings={holdings}
            baseCurrency={baseCurrency}
          />
        )}
        {currentTab === 'watchlist' && (
          <Watchlist 
            watchlist={activePortfolio.watchlist || []} 
            currentPrices={currentPrices} 
            onAddWatchlist={handleAddWatchlist} 
            onRemoveWatchlist={removeWatchlistItem} 
            onQuickBuy={(ticker, name, category, price) => handleAddTransaction({
              type: 'BUY',
              date: new Date().toLocaleDateString('de-DE'),
              ticker,
              name,
              amount: 1,
              price: price || currentPrices[ticker] || 100,
              fee: 1.0,
              tax: 0,
              category,
              currency: 'EUR'
            })}
          />
        )}
        {currentTab === 'savings' && (
          <SavingsSimulator 
            savingsPlans={activePortfolio.savingsPlans || []} 
            portfolioValue={stats.totalValue} 
            onAddSavingsPlan={handleAddSavingsPlan} 
            onDeleteSavingsPlan={removeSavingsPlan} 
            onToggleSavingsPlan={toggleSavingsPlan} 
            onExecuteSavingsPlans={executeSavingsPlans}
          />
        )}
        {currentTab === 'options' && (
          <OptionIncomeTracker 
            transactions={activePortfolio.transactions || []}
            onAddTransaction={handleAddTransaction}
            baseCurrency={baseCurrency}
          />
        )}
        {currentTab === 'real_estate' && (
          <RealEstateTracker 
            properties={activePortfolio.realEstate || []}
            onAddProperty={addRealEstate}
            onUpdateProperty={updateRealEstate}
            onDeleteProperty={deleteRealEstate}
            baseCurrency={baseCurrency}
          />
        )}
        {currentTab === 'deposit_ladder' && (
          <DepositLadderWidget 
            deposits={activePortfolio.depositLadder || []}
            onAddDeposit={addDepositLadderItem}
            onUpdateDeposit={updateDepositLadderItem}
            onDeleteDeposit={deleteDepositLadderItem}
            baseCurrency={baseCurrency}
          />
        )}
        {currentTab === 'mapping_rules' && (
          <MappingEditor 
            rules={activePortfolio.mappingRules || []}
            onAddRule={handleAddRule}
            onRemoveRule={deleteMappingRule}
          />
        )}
      </main>

      {/* Lazy Loaded Modals */}
      <Suspense fallback={null}>
        {showBatchPdfModal && (
          <BatchPdfUploadModal
            isOpen={showBatchPdfModal}
            onClose={() => setShowBatchPdfModal(false)}
            onImportBatch={(txs) => txs.forEach(addTransaction)}
            mappingRules={activePortfolio.mappingRules || []}
          />
        )}
        {showTaxReportModal && (
          <TaxReportModal
            isOpen={showTaxReportModal}
            onClose={() => setShowTaxReportModal(false)}
            portfolio={activePortfolio}
            taxExemptionLimit={1000}
          />
        )}
        {showTaxHarvestingModal && (
          <TaxLossHarvestingModal
            isOpen={showTaxHarvestingModal}
            onClose={() => setShowTaxHarvestingModal(false)}
            holdings={holdings}
            usedExemptionEur={stats.taxExemptionUsed}
            baseCurrency={baseCurrency}
          />
        )}
        {showStressTestModal && (
          <StressTestModal
            isOpen={showStressTestModal}
            onClose={() => setShowStressTestModal(false)}
            currentPortfolioValue={stats.totalValue}
            monthlySavings={150}
            baseCurrency={baseCurrency}
          />
        )}
        {showSettingsModal && (
          <SettingsModal
            isOpen={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
            baseCurrency={baseCurrency}
            onBaseCurrencyChange={setBaseCurrency}
            isDarkMode={isDarkMode}
            onToggleDarkMode={setIsDarkMode}
          />
        )}
        {showCsvImportModal && (
          <CsvImportModal
            isOpen={showCsvImportModal}
            onClose={() => setShowCsvImportModal(false)}
            onImportTransactions={(txs) => txs.forEach(addTransaction)}
          />
        )}
        {showPdfExportModal && (
          <PdfExportModal
            isOpen={showPdfExportModal}
            onClose={() => setShowPdfExportModal(false)}
            portfolio={activePortfolio}
            baseCurrency={baseCurrency}
          />
        )}
      </Suspense>

      {/* Cloud Sync Modal */}
      {showCloudSyncModal && (
        <CloudSyncModal
          isOpen={showCloudSyncModal}
          onClose={() => setShowCloudSyncModal(false)}
          portfolios={portfolios}
          onImportSyncData={importBackup}
        />
      )}

      {/* Neobroker Order Assistant Modal */}
      {showOrderAssistantModal && (
        <OrderAssistantModal
          isOpen={showOrderAssistantModal}
          onClose={() => setShowOrderAssistantModal(false)}
          savingsPlans={activePortfolio.savingsPlans || []}
          holdings={holdings}
          baseCurrency={baseCurrency}
        />
      )}

      {/* Air-Gapped QR-Code Sync Modal */}
      {showQrSyncModal && (
        <QrSyncModal
          isOpen={showQrSyncModal}
          onClose={() => setShowQrSyncModal(false)}
          portfolios={portfolios}
          onImportDecrypted={importBackup}
        />
      )}

      {/* Crypto Tax Tranches & Harvesting Modal */}
      {showCryptoTaxModal && (
        <CryptoTaxLossHarvestingModal
          isOpen={showCryptoTaxModal}
          onClose={() => setShowCryptoTaxModal(false)}
          transactions={activePortfolio.transactions || []}
          currentPrices={currentPrices}
          baseCurrency={baseCurrency}
        />
      )}

      {/* Ausländische Quellensteuer-Rückerstattung */}
      {showWithholdingTaxModal && (
        <WithholdingTaxRefundModal
          isOpen={showWithholdingTaxModal}
          onClose={() => setShowWithholdingTaxModal(false)}
          transactions={activePortfolio.transactions || []}
          baseCurrency={baseCurrency}
        />
      )}

      {/* Institutional PDF Factsheet Report */}
      {showFactsheetModal && (
        <PdfFactsheetExporter
          isOpen={showFactsheetModal}
          onClose={() => setShowFactsheetModal(false)}
          portfolio={activePortfolio}
          holdings={holdings}
          baseCurrency={baseCurrency}
        />
      )}

      {/* Dual Portfolio Comparison Modal */}
      {showCompareModal && (
        <DualPortfolioCompareModal
          isOpen={showCompareModal}
          onClose={() => setShowCompareModal(false)}
          portfolios={portfolios}
          baseCurrency={baseCurrency}
        />
      )}

      {/* Global Command Palette (Strg + K) */}
      <CommandPaletteModal
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigateTab={(tab) => { setCurrentTab(tab); setShowCommandPalette(false); }}
        holdings={holdings}
        onOpenBatchPdf={() => setShowBatchPdfModal(true)}
        onOpenCsvImport={() => setShowCsvImportModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenTaxHarvesting={() => setShowTaxHarvestingModal(true)}
        onOpenTaxReport={() => setShowTaxReportModal(true)}
        onOpenStressTest={() => setShowStressTestModal(true)}
        onOpenOrderAssistant={() => setShowOrderAssistantModal(true)}
        onOpenCryptoTax={() => setShowCryptoTaxModal(true)}
        onOpenFactsheet={() => setShowFactsheetModal(true)}
        onOpenQrSync={() => setShowQrSyncModal(true)}
        onOpenCloudSync={() => setShowCloudSyncModal(true)}
        onOpenCompare={() => setShowCompareModal(true)}
        onOpenWithholdingTax={() => setShowWithholdingTaxModal(true)}
        onOpenDrip={() => setShowDripModal(true)}
        onOpenReceiptScanner={() => setShowReceiptScannerModal(true)}
        onOpenCalendarExport={() => setShowCalendarExportModal(true)}
        onRefreshPrices={handleRefreshPrices}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onExportBackup={handleExportBackup}
        onSelectHolding={(_h) => { setCurrentTab('holdings'); setShowCommandPalette(false); }}
      />

      {/* DRIP Dividenden Reinvestitions Automatik Modal */}
      {showDripModal && (
        <DripCompoundModal
          isOpen={showDripModal}
          onClose={() => setShowDripModal(false)}
          holdings={holdings}
          transactions={activePortfolio.transactions}
          onAddTransaction={handleAddTransaction}
          baseCurrency={baseCurrency}
        />
      )}

      {/* Smart Beleg & Foto Importer Modal */}
      {showReceiptScannerModal && (
        <ReceiptScannerModal
          isOpen={showReceiptScannerModal}
          onClose={() => setShowReceiptScannerModal(false)}
          onAddTransaction={handleAddTransaction}
          baseCurrency={baseCurrency}
        />
      )}

      {/* Comprehensive Finanzkalender iCal Export Modal */}
      {showCalendarExportModal && (
        <CalendarExportModal
          isOpen={showCalendarExportModal}
          onClose={() => setShowCalendarExportModal(false)}
          transactions={activePortfolio.transactions}
          holdings={holdings}
          depositLadder={activePortfolio.depositLadder || []}
        />
      )}

      {/* Security Master PIN Unlock Modal */}
      <VaultUnlockModal
        isOpen={isVaultLocked}
        onUnlocked={unlockVault}
        onResetVault={resetVault}
      />
    </div>
  );
}

export default App;
