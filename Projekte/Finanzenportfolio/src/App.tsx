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
import { Wallet, PieChart, Activity, Sliders, Eye, FolderOpen, Calendar, Settings, Upload, FileText, RefreshCw, FileSpreadsheet, Sparkles } from 'lucide-react';
import './App.css';

const BatchPdfUploadModal = lazy(() => import('./components/BatchPdfUploadModal').then(m => ({ default: m.BatchPdfUploadModal })));
const TaxReportModal = lazy(() => import('./components/TaxReportModal').then(m => ({ default: m.TaxReportModal })));
const StressTestModal = lazy(() => import('./components/StressTestModal').then(m => ({ default: m.StressTestModal })));
const SettingsModal = lazy(() => import('./components/SettingsModal').then(m => ({ default: m.SettingsModal })));
const CsvImportModal = lazy(() => import('./components/CsvImportModal').then(m => ({ default: m.CsvImportModal })));
const PdfExportModal = lazy(() => import('./components/PdfExportModal').then(m => ({ default: m.PdfExportModal })));

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
    holdings,
    stats,
    switchPortfolio,
    createPortfolio,
    deletePortfolio,
    addTransaction,
    deleteTransaction,
    addWatchlistItem,
    removeWatchlistItem,
    addSavingsPlan,
    toggleSavingsPlan,
    removeSavingsPlan,
    addMappingRule,
    deleteMappingRule,
    refreshPrices,
    importBackup
  } = usePortfolio();

  const [currentTab, setCurrentTab] = useState<'dashboard' | 'holdings' | 'transactions' | 'strategy' | 'dividend_calendar' | 'watchlist' | 'savings' | 'mapping_rules'>('dashboard');
  const [showBatchPdfModal, setShowBatchPdfModal] = useState(false);
  const [showTaxReportModal, setShowTaxReportModal] = useState(false);
  const [showStressTestModal, setShowStressTestModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCsvImportModal, setShowCsvImportModal] = useState(false);
  const [showPdfExportModal, setShowPdfExportModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
            onClick={handleRefreshPrices}
            disabled={isRefreshing}
            className="theme-toggle-btn"
            title="Echtzeit-Kurse & Währungen aktualisieren"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => setShowBatchPdfModal(true)}
            className="theme-toggle-btn"
            title="Stapel PDF Upload (Batch Import)"
          >
            <Upload size={16} />
          </button>

          <button
            onClick={() => setShowCsvImportModal(true)}
            className="theme-toggle-btn"
            title="Universal CSV Auto-Detector Importer"
          >
            <FileSpreadsheet size={16} />
          </button>

          <button
            onClick={() => setShowStressTestModal(true)}
            className="theme-toggle-btn"
            title="Monte Carlo & Stress-Testing"
          >
            <Sparkles size={16} />
          </button>

          <button
            onClick={() => setShowPdfExportModal(true)}
            className="theme-toggle-btn"
            title="PDF Bericht drucken / speichern"
          >
            <FileText size={16} />
          </button>

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
    </div>
  );
}

export default App;
