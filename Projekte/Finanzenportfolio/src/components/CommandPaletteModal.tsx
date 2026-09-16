import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  PieChart, 
  Wallet, 
  Activity, 
  Sliders, 
  Calendar, 
  Eye, 
  Building, 
  Layers, 
  Settings, 
  Upload, 
  FileSpreadsheet, 
  Sparkles, 
  Scale, 
  Coins, 
  QrCode, 
  ShoppingCart, 
  Cloud, 
  RefreshCw, 
  Moon, 
  Sun, 
  Download,
  Columns,
  DollarSign,
  Camera,
  Repeat
} from 'lucide-react';
import type { Holding } from '../types';

export interface CommandPaletteAction {
  id: string;
  title: string;
  subtitle?: string;
  category: 'NAVIGATION' | 'ACTION' | 'HOLDING' | 'SETTINGS';
  icon: React.ReactNode;
  perform: () => void;
  keywords?: string;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
  holdings: Holding[];
  onOpenBatchPdf: () => void;
  onOpenCsvImport: () => void;
  onOpenSettings: () => void;
  onOpenTaxHarvesting: () => void;
  onOpenTaxReport: () => void;
  onOpenStressTest: () => void;
  onOpenOrderAssistant: () => void;
  onOpenCryptoTax: () => void;
  onOpenFactsheet: () => void;
  onOpenQrSync: () => void;
  onOpenCloudSync: () => void;
  onOpenCompare: () => void;
  onOpenWithholdingTax?: () => void;
  onOpenDrip?: () => void;
  onOpenReceiptScanner?: () => void;
  onOpenCalendarExport?: () => void;
  onRefreshPrices: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onExportBackup: () => void;
  onSelectHolding?: (holding: Holding) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  holdings,
  onOpenBatchPdf,
  onOpenCsvImport,
  onOpenSettings,
  onOpenTaxHarvesting,
  onOpenTaxReport,
  onOpenStressTest,
  onOpenOrderAssistant,
  onOpenCryptoTax,
  onOpenFactsheet,
  onOpenQrSync,
  onOpenCloudSync,
  onOpenCompare,
  onOpenWithholdingTax,
  onOpenDrip,
  onOpenReceiptScanner,
  onOpenCalendarExport,
  onRefreshPrices,
  isDarkMode,
  onToggleDarkMode,
  onExportBackup,
  onSelectHolding
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const allActions: CommandPaletteAction[] = useMemo(() => {
    const actions: CommandPaletteAction[] = [
      // Navigation Tabs
      {
        id: 'nav-dashboard',
        title: 'Dashboard öffnen',
        subtitle: 'Vermögensübersicht, Performance-Heatmap & Widgets',
        category: 'NAVIGATION',
        icon: <PieChart size={18} color="#3b82f6" />,
        perform: () => { onNavigateTab('dashboard'); onClose(); },
        keywords: 'dashboard uebersicht rendite heatmap'
      },
      {
        id: 'nav-holdings',
        title: 'Investments & Bestände',
        subtitle: 'Alle Positionen, Kurse, Buchgewinne & Tags',
        category: 'NAVIGATION',
        icon: <Wallet size={18} color="#10b981" />,
        perform: () => { onNavigateTab('holdings'); onClose(); },
        keywords: 'holdings aktien etfs krypto bestande positions'
      },
      {
        id: 'nav-transactions',
        title: 'Aktivitäten & Transaktionen',
        subtitle: 'Käufe, Verkäufe, Dividenden & Cashflow',
        category: 'NAVIGATION',
        icon: <Activity size={18} color="#8b5cf6" />,
        perform: () => { onNavigateTab('transactions'); onClose(); },
        keywords: 'transactions aktivitaeten kaeufe verkaeufe dividenden'
      },
      {
        id: 'nav-strategy',
        title: 'Strategie & Ziel-Allokation',
        subtitle: 'Soll-Ist Rebalancing, Korrelation & Klumpenrisiken',
        category: 'NAVIGATION',
        icon: <Sliders size={18} color="#ec4899" />,
        perform: () => { onNavigateTab('strategy'); onClose(); },
        keywords: 'strategy allokation rebalancing drift risiko'
      },
      {
        id: 'nav-dividends',
        title: 'Zahltage & Dividenden-Kalender',
        subtitle: 'Ausschüttungsprognosen & Ex-Tage',
        category: 'NAVIGATION',
        icon: <Calendar size={18} color="#f59e0b" />,
        perform: () => { onNavigateTab('dividend_calendar'); onClose(); },
        keywords: 'dividenden kalender zahltage passives einkommen yield'
      },
      {
        id: 'nav-watchlist',
        title: 'Watchlist & Kaufsignale',
        subtitle: 'Zielkurse und Benachrichtigungen',
        category: 'NAVIGATION',
        icon: <Eye size={18} color="#06b6d4" />,
        perform: () => { onNavigateTab('watchlist'); onClose(); },
        keywords: 'watchlist beobachtung kaufsignale kurse'
      },
      {
        id: 'nav-savings',
        title: 'Sparpläne & Karriere-Simulator',
        subtitle: 'Monatliche Sparraten & Inflationsprognose',
        category: 'NAVIGATION',
        icon: <Calendar size={18} color="#14b8a6" />,
        perform: () => { onNavigateTab('savings'); onClose(); },
        keywords: 'sparplan simulator zinseszins gehaltssprung'
      },
      {
        id: 'nav-realestate',
        title: 'Immobilien & Cashflow-Tracker',
        subtitle: 'Mietrenditen, LTV und Tilgung',
        category: 'NAVIGATION',
        icon: <Building size={18} color="#6366f1" />,
        perform: () => { onNavigateTab('real_estate'); onClose(); },
        keywords: 'immobilien miete cashflow darlehen ltv wohnung'
      },
      {
        id: 'nav-ladder',
        title: 'Zinstreppe & Tagesgeld',
        subtitle: 'Festgeld-Laufzeiten & Fälligkeitskalender',
        category: 'NAVIGATION',
        icon: <Layers size={18} color="#f97316" />,
        perform: () => { onNavigateTab('deposit_ladder'); onClose(); },
        keywords: 'zinstreppe festgeld tagesgeld sparbrife zinsen'
      },
      {
        id: 'nav-options',
        title: 'Optionen & Prämien-Tracker',
        subtitle: 'Covered Calls & Cash-Secured Puts (Delta/Theta)',
        category: 'NAVIGATION',
        icon: <DollarSign size={18} color="#84cc16" />,
        perform: () => { onNavigateTab('options'); onClose(); },
        keywords: 'optionen praemien theta delta calls puts'
      },

      // Quick Actions
      {
        id: 'act-batch-pdf',
        title: 'PDF Abrechnungen importieren (Batch)',
        subtitle: 'Trade Republic, Scalable, ING, Comdirect uvm.',
        category: 'ACTION',
        icon: <Upload size={18} color="#3b82f6" />,
        perform: () => { onClose(); onOpenBatchPdf(); },
        keywords: 'pdf import belege abrechnung broker upload'
      },
      {
        id: 'act-csv-import',
        title: 'Universal CSV-Import',
        subtitle: 'Portfolio Performance, Parqet & Neobroker CSVs',
        category: 'ACTION',
        icon: <FileSpreadsheet size={18} color="#10b981" />,
        perform: () => { onClose(); onOpenCsvImport(); },
        keywords: 'csv import excel tabelle portfolio performance parqet'
      },
      {
        id: 'act-refresh-prices',
        title: 'Echtzeit-Kurse & FX jetzt aktualisieren',
        subtitle: 'Yahoo Finance, CoinGecko & EZB-Kurse abrufen',
        category: 'ACTION',
        icon: <RefreshCw size={18} color="#06b6d4" />,
        perform: () => { onClose(); onRefreshPrices(); },
        keywords: 'refresh kurse preise fx update aktualisieren'
      },
      {
        id: 'act-tax-harvesting',
        title: 'Steuer-Optimierer (Tax-Loss & Freibetrag)',
        subtitle: 'Gezielte Verlustverrechnung & Freibetragsausschöpfung',
        category: 'ACTION',
        icon: <Scale size={18} color="#f59e0b" />,
        perform: () => { onClose(); onOpenTaxHarvesting(); },
        keywords: 'steuer freibetrag tax loss harvesting sparerpauschbetrag'
      },
      {
        id: 'act-tax-report',
        title: 'Anlage KAP Steuer-Report (WISO/Taxfix)',
        subtitle: 'Zeilengetreue Aufschlüsselung der Kapitalerträge',
        category: 'ACTION',
        icon: <FileSpreadsheet size={18} color="#ec4899" />,
        perform: () => { onClose(); onOpenTaxReport(); },
        keywords: 'steuererklaerung kap anlage wiso taxfix finanzamt'
      },
      {
        id: 'act-withholding-tax',
        title: 'Ausländische Quellensteuer-Rückerstattung',
        subtitle: 'Schweiz (Form 82 I), Frankreich, Österreich & USA DBA',
        category: 'ACTION',
        icon: <Scale size={18} color="#06b6d4" />,
        perform: () => { onClose(); if (onOpenWithholdingTax) onOpenWithholdingTax(); },
        keywords: 'quellensteuer schweiz erstattung dividenden formular 82 dba frankreich oesterreich'
      },
      {
        id: 'act-crypto-tax',
        title: 'Krypto FiFo Tranchen-Radar (§ 23 EStG)',
        subtitle: '1-Jahres Haltefristen & steuerfreie Bestände',
        category: 'ACTION',
        icon: <Coins size={18} color="#f59e0b" />,
        perform: () => { onClose(); onOpenCryptoTax(); },
        keywords: 'krypto steuer haltefrist fifo 23 estg bitcoin ethereum'
      },
      {
        id: 'act-factsheet',
        title: 'Fonds-Factsheet generieren (PDF Druck)',
        subtitle: '2-seitiger institutioneller Monatsbericht',
        category: 'ACTION',
        icon: <Download size={18} color="#8b5cf6" />,
        perform: () => { onClose(); onOpenFactsheet(); },
        keywords: 'factsheet pdf export druck monatsbericht report'
      },
      {
        id: 'act-stress-test',
        title: 'Monte Carlo & Makro-Stresstests',
        subtitle: 'Krisensimulationen (2008, Dotcom, Corona)',
        category: 'ACTION',
        icon: <Sparkles size={18} color="#a855f7" />,
        perform: () => { onClose(); onOpenStressTest(); },
        keywords: 'stresstest monte carlo krisen crash simulation'
      },
      {
        id: 'act-drip-compound',
        title: 'DRIP Zinseszins & Dividenden-Reinvestition',
        subtitle: 'Zinseszins-Simulation (5-30J) & 1-Klick Dividenden-Reinvestition',
        category: 'ACTION',
        icon: <Repeat size={18} color="#10b981" />,
        perform: () => { onClose(); if (onOpenDrip) onOpenDrip(); },
        keywords: 'drip reinvestition dividenden zinseszins compound sparplan yield'
      },
      {
        id: 'act-receipt-scanner',
        title: 'Smart Beleg & Foto Importer',
        subtitle: 'Trade Republic, Scalable, ING & Bitpanda Abrechnungen einlesen',
        category: 'ACTION',
        icon: <Camera size={18} color="#3b82f6" />,
        perform: () => { onClose(); if (onOpenReceiptScanner) onOpenReceiptScanner(); },
        keywords: 'beleg foto screenshot receipt ocr scanner pdf abrechnung import'
      },
      {
        id: 'act-calendar-export',
        title: 'Finanzkalender & iCal / .ics Export',
        subtitle: 'Zahltage & Zinstreppen-Fälligkeiten für Apple/Google Calendar',
        category: 'ACTION',
        icon: <Calendar size={18} color="#f59e0b" />,
        perform: () => { onClose(); if (onOpenCalendarExport) onOpenCalendarExport(); },
        keywords: 'kalender ical ics export zahltage dividenden termine outlook google apple'
      },
      {
        id: 'act-order-assistant',
        title: 'Neobroker Sparplan- & Order-Assistent',
        subtitle: 'Schnellkopier-Vorlagen für Trade Republic & Scalable',
        category: 'ACTION',
        icon: <ShoppingCart size={18} color="#10b981" />,
        perform: () => { onClose(); onOpenOrderAssistant(); },
        keywords: 'order assistent trade republic scalable kaufauftrag'
      },
      {
        id: 'act-compare',
        title: 'Dual Portfolio-Vergleichsmodus',
        subtitle: 'Zwei Portfolios oder Strategien direkt gegenüberstellen',
        category: 'ACTION',
        icon: <Columns size={18} color="#3b82f6" />,
        perform: () => { onClose(); onOpenCompare(); },
        keywords: 'vergleich dual portfolios nebeneinander benchmark'
      },
      {
        id: 'act-cloud-sync',
        title: 'Nextcloud & WebDAV Cloud Sync',
        subtitle: 'Ende-zu-Ende verschlüsselte Synchronisation',
        category: 'SETTINGS',
        icon: <Cloud size={18} color="#0284c7" />,
        perform: () => { onClose(); onOpenCloudSync(); },
        keywords: 'cloud sync nextcloud webdav backup verschluesselt'
      },
      {
        id: 'act-qr-sync',
        title: 'Air-Gapped QR-Code Vault Transfer',
        subtitle: 'Kontaktlose Datenübertragung ohne Internet',
        category: 'SETTINGS',
        icon: <QrCode size={18} color="#10b981" />,
        perform: () => { onClose(); onOpenQrSync(); },
        keywords: 'qr code air gap offline transfer sync handy'
      },
      {
        id: 'act-settings',
        title: 'Einstellungen & AES-256 Tresor',
        subtitle: 'PIN-Schutz, Rolling Backups & Währungen',
        category: 'SETTINGS',
        icon: <Settings size={18} color="#64748b" />,
        perform: () => { onClose(); onOpenSettings(); },
        keywords: 'einstellungen pin sicherheit tresor backup snapshot'
      },
      {
        id: 'act-toggle-dark',
        title: isDarkMode ? 'Hellen Modus aktivieren' : 'Dunklen Modus (Dark Mode) aktivieren',
        subtitle: 'Theme-Erscheinungsbild umschalten',
        category: 'SETTINGS',
        icon: isDarkMode ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />,
        perform: () => { onToggleDarkMode(); onClose(); },
        keywords: 'theme dark mode light hell dunkel design'
      },
      {
        id: 'act-export-backup',
        title: 'Backup-JSON jetzt herunterladen',
        subtitle: 'Vollständiges Offline-Backup aller Depots sichern',
        category: 'SETTINGS',
        icon: <Download size={18} color="#10b981" />,
        perform: () => { onExportBackup(); onClose(); },
        keywords: 'backup export json download sichern speichern'
      }
    ];

    // Add Holdings as search targets
    holdings.forEach(h => {
      actions.push({
        id: `holding-${h.ticker}`,
        title: `${h.name} (${h.ticker})`,
        subtitle: `${h.shares.toLocaleString('de-DE')} Stk. • ${h.currentValue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} (${h.totalGain >= 0 ? '+' : ''}${h.totalGainPercent.toFixed(1)}%)`,
        category: 'HOLDING',
        icon: <Wallet size={18} color={h.category === 'Crypto' ? '#f59e0b' : h.category === 'ETF' ? '#a855f7' : '#3b82f6'} />,
        perform: () => {
          if (onSelectHolding) {
            onSelectHolding(h);
          } else {
            onNavigateTab('holdings');
          }
          onClose();
        },
        keywords: `${h.name} ${h.ticker} ${h.category} ${(h.tags || []).join(' ')} ${h.sector || ''} ${h.broker || ''}`
      });
    });

    return actions;
  }, [
    holdings,
    isDarkMode,
    onNavigateTab,
    onClose,
    onOpenBatchPdf,
    onOpenCsvImport,
    onOpenSettings,
    onOpenTaxHarvesting,
    onOpenTaxReport,
    onOpenStressTest,
    onOpenOrderAssistant,
    onOpenCryptoTax,
    onOpenFactsheet,
    onOpenQrSync,
    onOpenCloudSync,
    onOpenCompare,
    onRefreshPrices,
    onToggleDarkMode,
    onExportBackup,
    onSelectHolding
  ]);

  const filteredActions = useMemo(() => {
    if (!query.trim()) {
      return allActions.slice(0, 12);
    }
    const cleanQuery = query.toLowerCase().trim();
    return allActions.filter(a => {
      return (
        a.title.toLowerCase().includes(cleanQuery) ||
        (a.subtitle && a.subtitle.toLowerCase().includes(cleanQuery)) ||
        (a.keywords && a.keywords.toLowerCase().includes(cleanQuery))
      );
    });
  }, [allActions, query]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredActions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredActions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].perform();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh'
      }}
    >
      <div 
        className="command-palette-container"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: 'var(--card-bg, #1e222d)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease-out'
        }}
      >
        {/* Search Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <Search size={20} color="#94a3b8" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Tippe einen Befehl, Asset (z.B. AAPL, MSCI World) oder Aktion..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-color, #f8fafc)',
              fontSize: '1.1rem',
              fontWeight: 500
            }}
          />
          <span style={{
            fontSize: '0.75rem',
            padding: '2px 6px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#94a3b8',
            fontFamily: 'monospace'
          }}>
            ESC
          </span>
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          style={{
            maxHeight: '420px',
            overflowY: 'auto',
            padding: '8px'
          }}
        >
          {filteredActions.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <Search size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ margin: 0, fontWeight: 500 }}>Keine passenden Befehle oder Bestände gefunden</p>
              <p style={{ fontSize: '0.85rem', marginTop: '4px', opacity: 0.7 }}>Versuche Suchbegriffe wie "Dashboard", "Krypto", "Steuer", "Rebalancing" oder Ticker</p>
            </div>
          ) : (
            filteredActions.map((action, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={action.id}
                  onClick={() => action.perform()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    border: isSelected ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      flexShrink: 0
                    }}>
                      {action.icon}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        color: isSelected ? '#60a5fa' : 'var(--text-color, #f8fafc)',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden'
                      }}>
                        {action.title}
                      </div>
                      {action.subtitle && (
                        <div style={{
                          fontSize: '0.8rem',
                          color: '#94a3b8',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden'
                        }}>
                          {action.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.7rem',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    flexShrink: 0
                  }}>
                    {action.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
          fontSize: '0.78rem',
          color: '#94a3b8'
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px' }}>↑↓</kbd> Navigieren</span>
            <span><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px' }}>↵</kbd> Auswählen</span>
          </div>
          <span>Shortcut: <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px' }}>Strg + K</kbd></span>
        </div>
      </div>
    </div>
  );
};
