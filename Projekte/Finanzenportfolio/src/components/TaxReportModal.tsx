import React, { useState } from 'react';
import type { Portfolio, TaxCountry, Holding } from '../types';
import {
  calculateEnhancedGermanTax,
  calculateVorabpauschaleDetails,
  calculateCryptoFifoTranches,
  calculateDachTax
} from './performanceUtils';
import { calculateLossPoolCarryForward } from '../utils/lossPoolCarryForwardUtils';
import { calculateSwissWealthTax, SWISS_CANTON_WEALTH_TAX_DATA, type SwissCanton } from '../utils/wealthTaxUtils';
import { calculateTaxWaterfallLiquidation, buildWaterfallBucketsFromPortfolio } from '../utils/taxWaterfallUtils';
import { FileText, Printer, Copy, Check, X, ShieldAlert, Globe, Scale, ArrowDownCircle, Layers } from 'lucide-react';

interface TaxReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: Portfolio;
  taxExemptionLimit: number;
  holdings?: Holding[];
  taxCountry?: TaxCountry;
}

export const TaxReportModal: React.FC<TaxReportModalProps> = ({
  isOpen,
  onClose,
  portfolio,
  taxExemptionLimit,
  holdings = [],
  taxCountry
}) => {
  const [selectedCountry, setSelectedCountry] = useState<TaxCountry>(
    taxCountry || (localStorage.getItem('finanz_tax_country') as TaxCountry) || 'DE'
  );
  const [personalTaxRate, setPersonalTaxRate] = useState<number>(18);
  const [enableGuenstiger, setEnableGuenstiger] = useState<boolean>(true);
  const [hasChurchTax, setHasChurchTax] = useState<boolean>(false);
  const [churchTaxRate, setChurchTaxRate] = useState<number>(9);
  const [swissCanton, setSwissCanton] = useState<SwissCanton>('ZH');
  const [isMarried, setIsMarried] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTaxTab, setActiveTaxTab] = useState<'KAP' | 'SO' | 'POOLS' | 'WATERFALL'>('KAP');
  const [targetWithdrawalEur, setTargetWithdrawalEur] = useState<number>(10000);

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();

  const lossPoolDetail = calculateLossPoolCarryForward(
    portfolio.transactions || [],
    portfolio.taxLossPools?.stockLossPool || 0,
    portfolio.taxLossPools?.generalLossPool || 0,
    currentYear
  );

  // Effective holdings either from props or reconstructed from transactions
  const effectiveHoldings: Holding[] = holdings.length > 0
    ? holdings
    : (portfolio.transactions || []).map(t => ({
        ticker: t.ticker,
        name: t.name,
        category: t.category,
        shares: t.amount,
        averageBuyPrice: t.price,
        currentPrice: t.price,
        totalCost: t.amount * t.price,
        currentValue: t.amount * t.price,
        totalGain: 0,
        totalGainPercent: 0,
        portfolioWeight: 0,
        yieldOnCost: 0,
        teilfreistellungRate: 0.30
      }));

  const totalHoldingsValue = effectiveHoldings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
  const swissWealthTax = calculateSwissWealthTax({
    totalAssetsChf: totalHoldingsValue,
    canton: swissCanton,
    isMarried
  });

  // DACH Tax calculation
  const dachTax = calculateDachTax(
    portfolio.transactions,
    selectedCountry,
    taxExemptionLimit,
    effectiveHoldings
  );

  // Enhanced German Tax for DE details
  const enhancedTax = calculateEnhancedGermanTax(
    portfolio.transactions,
    taxExemptionLimit,
    portfolio.taxLossPools?.stockLossPool || 0,
    portfolio.taxLossPools?.generalLossPool || 0,
    enableGuenstiger ? personalTaxRate : undefined,
    hasChurchTax,
    churchTaxRate
  );

  // Vorabpauschale calculation on real holdings
  const vorabpauschaleRes = calculateVorabpauschaleDetails(
    effectiveHoldings,
    0.0229
  );
  const vorabpauschale = vorabpauschaleRes.totalVorabpauschale;

  // Crypto FiFo tax
  const cryptoFifo = calculateCryptoFifoTranches(portfolio.transactions, {});
  const cryptoTaxableGains = cryptoFifo.totalTaxableGainEur;
  const cryptoFreigrenze = 1000;
  const isCryptoTaxFree = cryptoTaxableGains <= cryptoFreigrenze;

  // Staking, Airdrop, Mining under § 22 Nr. 3 EStG
  const cryptoStakingIncome = portfolio.transactions
    .filter(t => (t.type === 'STAKING' || t.type === 'AIRDROP' || t.type === 'MINING'))
    .reduce((sum, t) => sum + (t.amount * t.price) / (t.exchangeRate || 1.0), 0);
  const cryptoStakingFreigrenze = 256; // 256 € Freigrenze p.a. gem. § 22 Nr. 3 Satz 2 EStG
  const isCryptoStakingTaxFree = cryptoStakingIncome <= cryptoStakingFreigrenze;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    let text = '';
    if (selectedCountry === 'DE') {
      text = `=== FINANZPORTFOLIO COPILOT - STEUERBERICHT DEUTSCHLAND (${currentYear}) ===
[ANLAGE KAP - EINKÜNFTE AUS KAPITALVERMÖGEN]
- Zeile 7 (Inländische Kapitalerträge): ${enhancedTax.taxableGainsFinalEur.toFixed(2)} €
- Zeile 8 (Gewinne aus Aktienverkäufen): ${enhancedTax.realizedStockGainsEur.toFixed(2)} €
- Zeile 14 (Verluste ohne Aktien / Sonstiges): ${enhancedTax.realizedOtherLossesEur.toFixed(2)} €
- Zeile 15 (Verluste aus Aktienverkäufen): ${enhancedTax.realizedStockLossesEur.toFixed(2)} €
- Zeile 16/17 (In Anspruch genommener Sparer-Pauschbetrag): ${Math.min(taxExemptionLimit, enhancedTax.taxableGainsFinalEur).toFixed(2)} €
- Geschätzte Vorabpauschale (§ 18 InvStG): ${vorabpauschale.toFixed(2)} €
- Voraussichtliche Steuerlast: ${enhancedTax.abgeltungsteuerStandardEur.toFixed(2)} €

[ANLAGE SO - SONSTIGE EINKÜNFTE (§ 22/23 EStG - KRYPTO)]
- Steuerpflichtige Krypto-Gewinne (< 1 Jahr Haltefrist): ${cryptoTaxableGains.toFixed(2)} €
- Steuerfreie Krypto-Gewinne (> 1 Jahr Haltefrist): ${cryptoFifo.totalTaxFreeGainEur.toFixed(2)} €
- Freigrenze (§ 23 Abs. 3 EStG): 1.000,00 € (Status: ${isCryptoTaxFree ? 'Steuerfrei unter Freigrenze' : 'Voll steuerpflichtig zum pers. Steuersatz'})
- Einkünfte aus Staking / Airdrops / Mining (§ 22 Nr. 3 EStG): ${cryptoStakingIncome.toFixed(2)} €
- Freigrenze Staking/Mining (§ 22 Nr. 3 EStG): 256,00 € (Status: ${isCryptoStakingTaxFree ? 'Steuerfrei unter Freigrenze' : 'Voll steuerpflichtig zum pers. Steuersatz'})
`;
    } else if (selectedCountry === 'AT') {
      text = `=== FINANZPORTFOLIO COPILOT - STEUERBERICHT ÖSTERREICH (${currentYear}) ===
- Land: Österreich (KESt 27,5% flat)
- Zu versteuernde Kapitalerträge: ${dachTax.totalTaxableIncomeEur.toFixed(2)} €
- Geschätzte KESt (27,5%): ${dachTax.totalTaxDueEur.toFixed(2)} €
- Sparer-Freibetrag: Nicht anwendbar im österr. EStG
- Hinweis: Verlustausgleichstopf wird bankintern über die KESt-Bescheinigung geführt.
`;
    } else {
      text = `=== FINANZPORTFOLIO COPILOT - STEUERBERICHT SCHWEIZ (${currentYear}) ===
- Land: Schweiz
- Steuerfreie private Kapitalgewinne: ${cryptoFifo.totalTaxFreeGainEur.toFixed(2)} € (Wertschriften des Privatvermögens grundsätzlich steuerfrei)
- Steuerbare Einkünfte (Dividenden & Zinsen): ${dachTax.totalTaxableIncomeEur.toFixed(2)} €
- Geschätzte Einkommenssteuer (~20%): ${dachTax.totalTaxDueEur.toFixed(2)} €
- Verrechnungssteuer (35% VSt): Wird im Wertschriftenverzeichnis des Steuernachweises deklariert und voll angerechnet.
`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--card-bg, #0f172a)', border: '1px solid var(--border-color)', borderRadius: '16px',
        maxWidth: '820px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px' }}>
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Steuer- & Verlusttöpfe Report ({currentYear})</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                DACH-Steueroptimierung: Deutschland, Österreich & Schweiz
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleCopySummary} className="btn btn-secondary" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              {copied ? 'Kopiert!' : 'Zusammenfassung kopieren'}
            </button>
            <button onClick={handlePrint} className="btn btn-secondary" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Printer size={14} /> Drucken / PDF
            </button>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Country Selector Switcher */}
        <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Globe size={16} /> Steuerrecht / Steuerwohnsitz:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setSelectedCountry('DE')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                background: selectedCountry === 'DE' ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                color: selectedCountry === 'DE' ? '#fff' : 'var(--text-muted)'
              }}
            >
              🇩🇪 Deutschland
            </button>
            <button
              onClick={() => setSelectedCountry('AT')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                background: selectedCountry === 'AT' ? '#ef4444' : 'rgba(255,255,255,0.05)',
                color: selectedCountry === 'AT' ? '#fff' : 'var(--text-muted)'
              }}
            >
              🇦🇹 Österreich
            </button>
            <button
              onClick={() => setSelectedCountry('CH')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                background: selectedCountry === 'CH' ? '#10b981' : 'rgba(255,255,255,0.05)',
                color: selectedCountry === 'CH' ? '#fff' : 'var(--text-muted)'
              }}
            >
              🇨🇭 Schweiz
            </button>
          </div>
        </div>

        {/* Sub-Tabs for Germany */}
        {selectedCountry === 'DE' && (
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', padding: '0 1rem' }}>
            <button
              onClick={() => setActiveTaxTab('KAP')}
              style={{
                padding: '0.75rem 1.25rem',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTaxTab === 'KAP' ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTaxTab === 'KAP' ? '#3b82f6' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              📑 Anlage KAP (Wertpapiere & ETFs)
            </button>
            <button
              onClick={() => setActiveTaxTab('SO')}
              style={{
                padding: '0.75rem 1.25rem',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTaxTab === 'SO' ? '2px solid #f59e0b' : '2px solid transparent',
                color: activeTaxTab === 'SO' ? '#f59e0b' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              🪙 Anlage SO (§ 22/23 EStG Krypto)
            </button>
            <button
              onClick={() => setActiveTaxTab('POOLS')}
              style={{
                padding: '0.75rem 1.25rem',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTaxTab === 'POOLS' ? '2px solid #10b981' : '2px solid transparent',
                color: activeTaxTab === 'POOLS' ? '#10b981' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              ⚖️ Verlusttöpfe & Übertrag (§ 20 Abs. 6 EStG)
            </button>
            <button
              onClick={() => setActiveTaxTab('WATERFALL')}
              style={{
                padding: '0.75rem 1.25rem',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTaxTab === 'WATERFALL' ? '2px solid #8b5cf6' : '2px solid transparent',
                color: activeTaxTab === 'WATERFALL' ? '#8b5cf6' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              🌊 Steuer-Kaskade (Entnahme-Plan)
            </button>
          </div>
        )}

        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {selectedCountry === 'AT' ? (
            /* Austria Tax View */
            <>
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '1.25rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '1rem', color: '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🇦🇹 Steuerrecht Österreich - Kapitalertragsteuer (KESt)
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>
                  In Österreich gilt für Realisationsgewinne aus Aktien, ETFs und Dividenden ein pauschaler Steuersatz von <strong>27,5% KESt</strong>.
                  Ein Sparer-Pauschbetrag wie in Deutschland existiert im österreichischen Einkommensteuerrecht nicht.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Zu versteuernde Erträge (brutto)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.4rem', color: 'var(--text-color)' }}>
                    {dachTax.totalTaxableIncomeEur.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Kursgewinne + Dividenden</div>
                </div>

                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>KESt-Satz</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.4rem', color: '#ef4444' }}>
                    27,5%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Pauschalabzug mit Endbesteuerung</div>
                </div>

                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Geschätzte Steuerlast (KESt)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.4rem', color: '#ef4444' }}>
                    {dachTax.totalTaxDueEur.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Automatischer Bankenabzug</div>
                </div>
              </div>

              <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', background: 'rgba(255,255,255,0.02)' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 'bold' }}>Österreichische Besonderheiten & Tipps</h4>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {dachTax.details.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                  <li>Meldefonds (OeKB): Ausschüttungsgleiche Erträge (AgE) werden einmal jährlich über die Kontrollbank gemeldet.</li>
                  <li>Regelbesteuerungsoption: Liegt dein persönlicher Grenzsteuersatz unter 27,5%, kannst du in der Steuererklärung (E1kv) optieren.</li>
                </ul>
              </div>
            </>
          ) : selectedCountry === 'CH' ? (
            /* Switzerland Tax View */
            <>
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '1.25rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '1rem', color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🇨🇭 Steuerrecht Schweiz - Steuerfreie Kapitalgewinne für Privatpersonen
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>
                  In der Schweiz sind <strong>Kapitalgewinne aus Wertschriften des Privatvermögens steuerfrei</strong> (keine Spekulationsfrist).
                  Dividenden und Zinsen unterliegen jedoch als Einkommen der regulären Einkommenssteuer von Bund, Kanton und Gemeinde.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Steuerfreie Kapitalgewinne</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.4rem', color: '#10b981' }}>
                    100% Steuerfrei
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Privates Vermögensmanagement</div>
                </div>

                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Steuerbare Dividenden / Zinsen</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.4rem', color: '#3b82f6' }}>
                    {dachTax.totalTaxableIncomeEur.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Als ordentliches Einkommen</div>
                </div>

                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Geschätzte Steuerlast (~20% Ø)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.4rem', color: '#f59e0b' }}>
                    {dachTax.totalTaxDueEur.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Abhängig vom Wohnkanton</div>
                </div>
              </div>

              {/* Kantonale Vermögenssteuer Simulator */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold', color: '#10b981' }}>
                    🇨🇭 Kantonale Vermögenssteuer-Kalkulation (ESTV-Tarif 2026)
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wohnkanton:</label>
                    <select
                      value={swissCanton}
                      onChange={(e) => setSwissCanton(e.target.value as SwissCanton)}
                      style={{ padding: '0.3rem 0.6rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 'bold' }}
                    >
                      {Object.values(SWISS_CANTON_WEALTH_TAX_DATA).map((c) => (
                        <option key={c.code} value={c.code}>{c.code} - {c.cantonName} (~{c.averageTaxRatePromille} ‰)</option>
                      ))}
                    </select>
                    <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={isMarried} onChange={(e) => setIsMarried(e.target.checked)} />
                      Verheiratet
                    </label>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <div style={{ background: 'var(--card-bg)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Freibetrag ({swissWealthTax.cantonName})</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{swissWealthTax.allowanceChf.toLocaleString('de-CH')} CHF</div>
                  </div>
                  <div style={{ background: 'var(--card-bg)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Steuerbares Vermögen</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{swissWealthTax.taxableAssetsChf.toLocaleString('de-CH')} CHF</div>
                  </div>
                  <div style={{ background: 'var(--card-bg)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Geschätzte Vermögenssteuer</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981' }}>{swissWealthTax.effectiveTaxDueChf.toLocaleString('de-CH')} CHF/Jahr</div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>~{swissWealthTax.effectiveTaxDueEur.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {swissWealthTax.summaryNote} Eidg. Verrechnungssteuer (35% VSt) wird bei korrekter Deklaration im Wertschriftenverzeichnis voll rückvergütet.
                </div>
              </div>
            </>
          ) : activeTaxTab === 'KAP' ? (
            /* Germany - Anlage KAP */
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    Persönlicher Grenzsteuersatz (%)
                  </label>
                  <input
                    type="number"
                    value={personalTaxRate}
                    onChange={e => setPersonalTaxRate(Number(e.target.value))}
                    min={0}
                    max={45}
                    style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', marginTop: '0.2rem' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                  <input
                    type="checkbox"
                    id="guenstiger"
                    checked={enableGuenstiger}
                    onChange={e => setEnableGuenstiger(e.target.checked)}
                  />
                  <label htmlFor="guenstiger" style={{ fontSize: '0.8rem', cursor: 'pointer' }}>Günstigerprüfung anwenden</label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="churchTax"
                      checked={hasChurchTax}
                      onChange={e => setHasChurchTax(e.target.checked)}
                    />
                    <label htmlFor="churchTax" style={{ fontSize: '0.8rem', cursor: 'pointer' }}>Kirchensteuerpflicht</label>
                  </div>
                  {hasChurchTax && (
                    <select
                      value={churchTaxRate}
                      onChange={e => setChurchTaxRate(Number(e.target.value))}
                      style={{ padding: '0.2rem 0.5rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-main)' }}
                    >
                      <option value={9}>9% (Übrige Bundesländer)</option>
                      <option value={8}>8% (Bayern & Baden-Württemberg)</option>
                    </select>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 'bold' }}>📉 Aktien-Verlusttopf (§ 20 Abs. 6 S. 4 EStG)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ef4444', marginTop: '0.25rem' }}>
                    {enhancedTax.stockLossPoolRemainingEur.toFixed(2)} €
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Ausschließlich verrechenbar mit Gewinnen aus Aktienverkäufen.
                  </div>
                </div>

                <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 'bold' }}>📊 Sonstiger Verlusttopf (ETFs, Zinsen)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#3b82f6', marginTop: '0.25rem' }}>
                    {enhancedTax.generalLossPoolRemainingEur.toFixed(2)} €
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Verrechenbar mit ETFs, Fonds, Dividenden und Zinsen.
                  </div>
                </div>
              </div>

              <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                  Steuerberechnung & Freibeträge (Deutschland)
                </div>
                <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Sparer-Pauschbetrag</span>
                    <strong>{taxExemptionLimit.toFixed(2)} €</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Zu versteuernde Erträge (nach Teilfreistellung)</span>
                    <strong style={{ color: '#10b981' }}>{enhancedTax.taxableGainsFinalEur.toFixed(2)} €</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                    <span>Standard-Abgeltungsteuer (25% + Soli = 26,375%)</span>
                    <strong>{enhancedTax.abgeltungsteuerStandardEur.toFixed(2)} €</strong>
                  </div>
                  {enhancedTax.guenstigerpruefungTaxEur !== undefined && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 'bold' }}>
                      <span>Steuer nach Günstigerprüfung ({personalTaxRate}%)</span>
                      <span>{enhancedTax.guenstigerpruefungTaxEur.toFixed(2)} € (Ersparnis: {enhancedTax.taxSavingViaGuenstigerpruefungEur.toFixed(2)} €)</span>
                    </div>
                  )}
                  {hasChurchTax && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a855f7' }}>
                      <span>Kirchensteuer (geschätzt)</span>
                      <span>{enhancedTax.churchTaxEstimateEur.toFixed(2)} €</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                    <span>Geschätzte Vorabpauschale 2025/2026 (§ 18 InvStG)</span>
                    <strong style={{ color: '#3b82f6' }}>{vorabpauschale.toFixed(2)} €</strong>
                  </div>
                </div>
              </div>

              <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(59, 130, 246, 0.08)', fontWeight: 'bold', fontSize: '0.85rem', color: '#3b82f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>📑 Offizielle Kennziffern für Anlage KAP (WISO / Taxfix / Steuerberater)</span>
                </div>
                <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.3rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Zeile 7 (Inländische Kapitalerträge):</span>
                    <strong>{enhancedTax.taxableGainsFinalEur.toFixed(2)} €</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.3rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Zeile 8 (Gewinne aus Aktienverkäufen):</span>
                    <strong>{enhancedTax.realizedStockGainsEur.toFixed(2)} €</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.3rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Zeile 14 (Verluste ohne Aktien):</span>
                    <strong style={{ color: '#3b82f6' }}>{enhancedTax.realizedOtherLossesEur.toFixed(2)} €</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.3rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Zeile 15 (Verluste aus Aktienverkäufen):</span>
                    <strong style={{ color: '#ef4444' }}>{enhancedTax.realizedStockLossesEur.toFixed(2)} €</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Zeile 16/17 (In Anspruch genommener Sparer-Pauschbetrag):</span>
                    <strong>{Math.min(taxExemptionLimit, enhancedTax.taxableGainsFinalEur).toFixed(2)} €</strong>
                  </div>
                </div>
              </div>
            </>
          ) : activeTaxTab === 'SO' ? (
            /* Germany - Anlage SO */
            <>
              <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert size={16} /> Anlage SO - Private Veräußerungsgeschäfte (§ 23 EStG)
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.4rem 0 0 0' }}>
                  Kryptowährungen gelten im deutschen Steuerrecht als Wirtschaftsgüter. Gewinne aus Verkäufen innerhalb der 1-jährigen Spekulationsfrist sind bis zur Freigrenze von 1.000 € (ab 2024) steuerfrei.
                </p>
              </div>

              <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                  Krypto-Besteuerung nach FiFo-Prinzip (§ 23 EStG)
                </div>
                <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Steuerfreie Gewinne (&gt; 1 Jahr Haltedauer)</span>
                    <strong style={{ color: '#10b981' }}>{cryptoFifo.totalTaxFreeGainEur.toFixed(2)} € (100% steuerfrei)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                    <span>Steuerpflichtige Gewinne (&lt; 1 Jahr Haltedauer)</span>
                    <strong style={{ color: isCryptoTaxFree ? '#10b981' : '#ef4444' }}>
                      {cryptoTaxableGains.toFixed(2)} €
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Gesetzliche Freigrenze (§ 23 Abs. 3 EStG)</span>
                    <strong>1.000,00 €</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', color: isCryptoTaxFree ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>
                    <span>Steuer-Status private Veräußerung</span>
                    <span>{isCryptoTaxFree ? '✅ Steuerfrei (Gewinn unter Freigrenze)' : '⚠️ Steuerpflichtig zum pers. Einkommensteuersatz'}</span>
                  </div>
                </div>
              </div>

              {/* Staking / Airdrops / Mining Section § 22 Nr. 3 EStG */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', marginTop: '1rem' }}>
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(245, 158, 11, 0.06)', fontWeight: 'bold', fontSize: '0.85rem', color: '#f59e0b', display: 'flex', justifyContent: 'space-between' }}>
                  <span>⛏️ Staking, Airdrops & Mining (§ 22 Nr. 3 EStG)</span>
                  <span>Freigrenze: 256 € p.a.</span>
                </div>
                <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Zufluss-Einkünfte (Staking / Airdrop / Mining)</span>
                    <strong style={{ color: isCryptoStakingTaxFree ? '#10b981' : '#ef4444' }}>
                      {cryptoStakingIncome.toFixed(2)} €
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Freigrenze gem. § 22 Nr. 3 Satz 2 EStG</span>
                    <strong>256,00 €</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', color: isCryptoStakingTaxFree ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                    <span>Steuer-Status Zufluss</span>
                    <span>{isCryptoStakingTaxFree ? '✅ Steuerfrei (Einnahmen unter 256 € Freigrenze)' : '⚠️ Voll steuerpflichtig (Freigrenze überschritten)'}</span>
                  </div>
                  <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Hinweis nach BMF-Schreiben: Der Zufluss von Staking/Mining ist als sonstige Leistung bei Erhalt steuerbar. Die Haltefrist für die veräußerten Coins beträgt dennoch regulär 1 Jahr ab Zufluss.
                  </p>
                </div>
              </div>
            </>
          ) : activeTaxTab === 'POOLS' ? (
            /* Germany - Verlusttöpfe & Übertrag (§ 20 Abs. 6 EStG) */
            <>
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Scale size={16} /> Verlustverrechnungstöpfe & Übertrag (§ 20 Abs. 6 EStG)
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.4rem 0 0 0' }}>
                  Verluste aus Aktien dürfen nach § 20 Abs. 6 Satz 4 EStG nur mit Aktiengewinnen verrechnet werden. Allgemeine Verluste (ETFs, Derivate, Zinsen) dürfen mit allen Erträgen verrechnet werden. Nicht verrechnete Verluste werden unbegrenzt in das Folgejahr vorgetragen.
                </p>
              </div>

              {/* Status Töpfe Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aktien-Verlusttopf Start</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ef4444', marginTop: '0.25rem' }}>
                    {lossPoolDetail.initialStockLossPoolEur.toFixed(2)} €
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Vortrag aus Vorjahren</span>
                </div>

                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sonstiger Verlusttopf Start</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6', marginTop: '0.25rem' }}>
                    {lossPoolDetail.initialGeneralLossPoolEur.toFixed(2)} €
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ETFs, Anleihen, Optionen</span>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Ersparte Steuer durch Verrechnung</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.25rem' }}>
                    {lossPoolDetail.totalTaxSavedByLossOffsetEur.toFixed(2)} €
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>26,375% Abgeltungsteuer + Soli</span>
                </div>
              </div>

              {/* Detail Offsetting Table */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                  Verrechnungssimulation & Übertrag ins Folgejahr ({currentYear + 1})
                </div>
                <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Realisierte Aktiengewinne im laufenden Jahr:</span>
                    <strong>{lossPoolDetail.stockGainsEur.toFixed(2)} €</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                    <span>Verrechnet mit Aktien-Verlusttopf:</span>
                    <strong>-{lossPoolDetail.stockLossesUsedEur.toFixed(2)} €</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem' }}>
                    <span>Sonstige Erträge (ETFs, Fonds, Dividenden, Zinsen):</span>
                    <strong>{lossPoolDetail.otherGainsEur.toFixed(2)} €</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                    <span>Verrechnet mit allgemeinem Verlusttopf:</span>
                    <strong>-{lossPoolDetail.otherLossesUsedEur.toFixed(2)} €</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', fontWeight: 'bold' }}>
                    <span>Verbleibende steuerpflichtige Kapitalerträge:</span>
                    <strong>{lossPoolDetail.totalTaxableCapitalGainsEur.toFixed(2)} €</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '6px', marginTop: '0.3rem' }}>
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>Verlustvortrag Aktien in {currentYear + 1}:</span>
                    <strong style={{ color: '#ef4444' }}>{lossPoolDetail.finalStockLossPoolEur.toFixed(2)} €</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '6px' }}>
                    <span style={{ color: '#3b82f6', fontWeight: 600 }}>Verlustvortrag Sonstiges in {currentYear + 1}:</span>
                    <strong style={{ color: '#3b82f6' }}>{lossPoolDetail.finalGeneralLossPoolEur.toFixed(2)} €</strong>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Germany - Steuer-Kaskade (Entnahme-Plan & Steuer-Reihenfolge) */
            <>
              <div style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.9rem', color: '#a78bfa', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={18} /> Steuersparende Liquidations-Kaskade (Entnahme-Planung)
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.4rem 0 0 0' }}>
                  Optimierte Verkaufsreihenfolge (Cash &rarr; Verlustpositionen &rarr; Dividenden &rarr; ETF-Gewinne mit Teilfreistellung), um die effektive Steuerlast bei Entnahmen drastisch zu senken.
                </p>
              </div>

              {/* Target Input and Calculation */}
              {(() => {
                const buckets = buildWaterfallBucketsFromPortfolio(effectiveHoldings, 5000);
                const waterfallResult = calculateTaxWaterfallLiquidation(buckets, targetWithdrawalEur, Math.max(0, taxExemptionLimit - enhancedTax.taxableGainsFinalEur));

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                      <div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block' }}>Gewünschte Netto-Auszahlung:</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Betrag, der nach Steuern auf deinem Girokonto ankommen soll</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="number"
                          step={1000}
                          min={1000}
                          value={targetWithdrawalEur}
                          onChange={(e) => setTargetWithdrawalEur(Math.max(0, Number(e.target.value)))}
                          style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            color: '#fff',
                            padding: '0.4rem 0.75rem',
                            fontWeight: 'bold',
                            width: '130px',
                            textAlign: 'right'
                          }}
                        />
                        <span style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>€</span>
                      </div>
                    </div>

                    {/* Metric Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '10px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Brutto-Auflösung</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.25rem' }}>
                          {waterfallResult.totalGrossLiquidatedEur.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Verkaufsvolumen</span>
                      </div>

                      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '10px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Effektiver Steuersatz</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: waterfallResult.effectiveTaxRatePercent <= 10 ? '#10b981' : '#f59e0b', marginTop: '0.25rem' }}>
                          {waterfallResult.effectiveTaxRatePercent.toFixed(1)} %
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>statt 26,375 % Abgeltungsteuer</span>
                      </div>

                      <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '10px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Steuerersparnis Kaskade</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.25rem' }}>
                          {waterfallResult.taxSavingsVsNaivePercent.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ggü. unüberlegtem Verkauf</span>
                      </div>
                    </div>

                    {/* Step-by-Step Liquidation Sequence */}
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowDownCircle size={16} color="#8b5cf6" />
                        Empfohlene Verkaufsreihenfolge (Schritt für Schritt)
                      </div>
                      <div style={{ padding: '0.5rem 1rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                          <thead>
                            <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                              <th style={{ padding: '0.5rem 0' }}>Priorität & Asset-Topf</th>
                              <th style={{ padding: '0.5rem 0' }}>Typ</th>
                              <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Brutto-Verkauf</th>
                              <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Steuerabzug</th>
                              <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Netto-Auszahlung</th>
                            </tr>
                          </thead>
                          <tbody>
                            {waterfallResult.steps.map((st, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '0.5rem 0', fontWeight: 'bold' }}>
                                  #{idx + 1} {st.bucketName}
                                </td>
                                <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                  {st.category}
                                </td>
                                <td style={{ padding: '0.5rem 0', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                                  {st.withdrawnGrossEur.toFixed(2)} €
                                </td>
                                <td style={{ padding: '0.5rem 0', textAlign: 'right', color: st.taxPaidEur > 0 ? '#ef4444' : '#10b981', fontVariantNumeric: 'tabular-nums' }}>
                                  {st.taxPaidEur.toFixed(2)} €
                                </td>
                                <td style={{ padding: '0.5rem 0', textAlign: 'right', fontWeight: 'bold', color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>
                                  {st.withdrawnNetEur.toFixed(2)} €
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
