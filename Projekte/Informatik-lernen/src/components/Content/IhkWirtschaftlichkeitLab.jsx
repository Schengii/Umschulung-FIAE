import React, { useState, useMemo } from 'react';
import { 
  Calculator, TrendingUp, DollarSign, CheckCircle2, 
  Copy, Layers, Info
} from 'lucide-react';
import { 
  calculateAmortisation, 
  calculateMakeOrBuy, 
  calculateCostComparison, 
  exportWirtschaftlichkeitMarkdown 
} from '../../utils/ihkWirtschaftlichkeitEngine';
import { useStore } from '../../store/useStore';

export default function IhkWirtschaftlichkeitLab() {
  const { awardXP } = useStore();
  const [activeTab, setActiveTab] = useState('amortisation'); // 'amortisation' | 'makeorbuy' | 'comparison'
  const [projectName, setProjectName] = useState('Automatisierte CI/CD & Testinfrastruktur');
  const [copied, setCopied] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  // Parameter für Amortisation
  const [initialInvestment, setInitialInvestment] = useState(8500);
  const [yearlyCostSavings, setYearlyCostSavings] = useState(4200);
  const [additionalRunningCosts, setAdditionalRunningCosts] = useState(600);
  const [analysisPeriodYears, setAnalysisPeriodYears] = useState(4);

  // Parameter für Make-or-Buy
  const [devHours, setDevHours] = useState(80);
  const [devHourlyRate, setDevHourlyRate] = useState(65);
  const [hardwareOnce, setHardwareOnce] = useState(1200);
  const [makeMaintenance, setMakeMaintenance] = useState(800);
  const [saasSetup, setSaasSetup] = useState(1500);
  const [saasYearlyLicense, setSaasYearlyLicense] = useState(3200);
  const [mobYears, setMobYears] = useState(3);

  const amortisationResult = useMemo(() => {
    return calculateAmortisation({
      initialInvestment,
      yearlyCostSavings,
      additionalYearlyRunningCosts: additionalRunningCosts,
      analysisPeriodYears
    });
  }, [initialInvestment, yearlyCostSavings, additionalRunningCosts, analysisPeriodYears]);

  const makeOrBuyResult = useMemo(() => {
    return calculateMakeOrBuy({
      developmentHours: devHours,
      hourlyRateInternal: devHourlyRate,
      hardwareSoftwareOnce: hardwareOnce,
      yearlyMaintenanceInternal: makeMaintenance,
      saasSetupCost: saasSetup,
      yearlySaasLicense: saasYearlyLicense,
      periodYears: mobYears
    });
  }, [devHours, devHourlyRate, hardwareOnce, makeMaintenance, saasSetup, saasYearlyLicense, mobYears]);

  const comparisonResult = useMemo(() => {
    return calculateCostComparison({
      oldSystem: { personnelYearly: 14000, licenseYearly: 2500, hostingYearly: 1000 },
      newSystem: { investmentOnce: initialInvestment, personnelYearly: 4500, licenseYearly: 1200, hostingYearly: 600 },
      years: analysisPeriodYears
    });
  }, [initialInvestment, analysisPeriodYears]);

  const handleCopyMarkdown = () => {
    const md = exportWirtschaftlichkeitMarkdown(amortisationResult, makeOrBuyResult, comparisonResult, projectName);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    if (!rewardClaimed) {
      awardXP(65, 'IHK AP2 Wirtschaftlichkeits- & Amortisationsrechnung');
      setRewardClaimed(true);
    }
  };

  return (
    <div className="lab-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '20px', color: '#34d399', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
            <Calculator size={16} /> IHK Abschlussprüfung Teil 2 (AP2) Projektdokumentation
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            IHK Wirtschaftlichkeits- & Amortisations-Studio
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Erstelle die obligatorische kaufmännische Wirtschaftlichkeitsrechnung: Amortisation (Pay-Off), Make-or-Buy & 3-5 Jahres Kostenvergleich.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleCopyMarkdown}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              background: copied ? '#10b981' : '#059669',
              color: '#fff',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Doku-Markdown kopiert!' : 'Exportieren (Markdown)'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('amortisation')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'amortisation' ? '#10b981' : 'transparent',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <TrendingUp size={15} /> 1. Amortisationsdauer & ROI
        </button>
        <button
          onClick={() => setActiveTab('makeorbuy')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'makeorbuy' ? '#10b981' : 'transparent',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Layers size={15} /> 2. Make-or-Buy Entscheidungsmatrix
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'comparison' ? '#10b981' : 'transparent',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <DollarSign size={15} /> 3. Mehrjahres-Kostenvergleich (Alt vs. Neu)
        </button>
      </div>

      {/* TAB 1: Amortisation */}
      {activeTab === 'amortisation' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Eingabe-Formular */}
          <div style={{ background: 'var(--card-bg, #1e293b)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', margin: '0 0 16px 0' }}>
              Projekt-Parameter (Amortisation)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>
                  Projektbezeichnung:
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>
                  Einmalige Projekt- & Einführungskosten (€):
                </label>
                <input
                  type="number"
                  step="100"
                  value={initialInvestment}
                  onChange={(e) => setInitialInvestment(Math.max(1, Number(e.target.value)))}
                  style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>
                  Jährliche Brutto-Kosteneinsparung (€ / Jahr):
                </label>
                <input
                  type="number"
                  step="100"
                  value={yearlyCostSavings}
                  onChange={(e) => setYearlyCostSavings(Math.max(0, Number(e.target.value)))}
                  style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>
                  Zusätzliche laufende Betriebskosten (€ / Jahr):
                </label>
                <input
                  type="number"
                  step="50"
                  value={additionalRunningCosts}
                  onChange={(e) => setAdditionalRunningCosts(Math.max(0, Number(e.target.value)))}
                  style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>
                  Betrachtungszeitraum ({analysisPeriodYears} Jahre):
                </label>
                <input
                  type="range"
                  min="2"
                  max="6"
                  value={analysisPeriodYears}
                  onChange={(e) => setAnalysisPeriodYears(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
              </div>
            </div>
          </div>

          {/* KPI Display */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '2px solid #10b981', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '0.85rem', color: '#6ee7b7', marginBottom: '4px', fontWeight: 'bold' }}>
                Statische Amortisationsdauer (Pay-Off Zeitpunkt)
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>
                {amortisationResult.amortisationMonths !== null ? `${amortisationResult.amortisationMonths} Monate` : 'Nicht amortisierbar'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                Entspricht <strong>~{amortisationResult.amortisationYears} Jahren</strong> bei jährlicher Netto-Einsparung von <strong>{amortisationResult.netYearlySavings.toLocaleString('de-DE')} €</strong>.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div style={{ background: 'var(--card-bg, #1e293b)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Return on Investment (ROI):</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: amortisationResult.roiPercent > 0 ? '#34d399' : '#ef4444' }}>
                  {amortisationResult.roiPercent}%
                </div>
              </div>

              <div style={{ background: 'var(--card-bg, #1e293b)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Kumulierter Netto-Gewinn:</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#60a5fa' }}>
                  {amortisationResult.totalNetGain.toLocaleString('de-DE')} €
                </div>
              </div>
            </div>

            {/* Visual Amortisation Timeline */}
            <div style={{ background: 'var(--card-bg, #1e293b)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}>
                Investition vs. Einsparungen über {analysisPeriodYears} Jahre:
              </div>
              <div style={{ height: '14px', background: 'rgba(255,255,255,0.1)', borderRadius: '7px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${Math.min(100, (amortisationResult.amortisationMonths / (analysisPeriodYears * 12)) * 100)}%`,
                    background: '#10b981',
                    borderRadius: '7px'
                  }} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>
                <span>Start (0 M)</span>
                <span style={{ color: '#34d399', fontWeight: 'bold' }}>Break-Even: {amortisationResult.amortisationMonths} Monate</span>
                <span>{analysisPeriodYears * 12} Monate</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Make or Buy */}
      {activeTab === 'makeorbuy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Make Inputs */}
            <div style={{ background: 'var(--card-bg, #1e293b)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#60a5fa', margin: '0 0 14px 0' }}>
                Option A: Make (Eigenentwicklung)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ color: '#94a3b8' }}>Entwicklungszeit (Stunden):</label>
                  <input
                    type="number"
                    value={devHours}
                    onChange={(e) => setDevHours(Number(e.target.value))}
                    style={{ width: '100%', padding: '6px 8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ color: '#94a3b8' }}>Interner Stundensatz (€ / Std.):</label>
                  <input
                    type="number"
                    value={devHourlyRate}
                    onChange={(e) => setDevHourlyRate(Number(e.target.value))}
                    style={{ width: '100%', padding: '6px 8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ color: '#94a3b8' }}>Hardware/Software einmalig (€):</label>
                  <input
                    type="number"
                    value={hardwareOnce}
                    onChange={(e) => setHardwareOnce(Number(e.target.value))}
                    style={{ width: '100%', padding: '6px 8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ color: '#94a3b8' }}>Jährliche Wartungskosten intern (€ / Jahr):</label>
                  <input
                    type="number"
                    value={makeMaintenance}
                    onChange={(e) => setMakeMaintenance(Number(e.target.value))}
                    style={{ width: '100%', padding: '6px 8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
              </div>
            </div>

            {/* Buy Inputs */}
            <div style={{ background: 'var(--card-bg, #1e293b)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fbbf24', margin: '0 0 14px 0' }}>
                Option B: Buy (Kauf / SaaS-Lizenz)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ color: '#94a3b8' }}>Einmalige Einrichtungsgebühr (€):</label>
                  <input
                    type="number"
                    value={saasSetup}
                    onChange={(e) => setSaasSetup(Number(e.target.value))}
                    style={{ width: '100%', padding: '6px 8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ color: '#94a3b8' }}>Jährliche SaaS / Support-Lizenz (€ / Jahr):</label>
                  <input
                    type="number"
                    value={saasYearlyLicense}
                    onChange={(e) => setSaasYearlyLicense(Number(e.target.value))}
                    style={{ width: '100%', padding: '6px 8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ color: '#94a3b8' }}>Betrachtungszeitraum (Jahre):</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={mobYears}
                    onChange={(e) => setMobYears(Math.max(1, Number(e.target.value)))}
                    style={{ width: '100%', padding: '6px 8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Make or Buy Result Card */}
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '2px solid #10b981', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#6ee7b7', fontWeight: 'bold' }}>IHK Wirtschaftlichkeits-Empfehlung:</span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', margin: '4px 0' }}>
                  Option {makeOrBuyResult.recommendation} ({makeOrBuyResult.recommendation === 'Make' ? 'Eigenentwicklung' : 'Fremdbezug / Kauf'})
                </h2>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1' }}>
                  Gesamtkostenvorteil über {mobYears} Jahre: <strong style={{ color: '#34d399' }}>{makeOrBuyResult.difference.toLocaleString('de-DE')} €</strong>
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Make Gesamtkosten: <strong>{makeOrBuyResult.make.totalCost.toLocaleString('de-DE')} €</strong></div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Buy Gesamtkosten: <strong>{makeOrBuyResult.buy.totalCost.toLocaleString('de-DE')} €</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Cost Comparison */}
      {activeTab === 'comparison' && (
        <div style={{ background: 'var(--card-bg, #1e293b)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', margin: '0 0 16px 0' }}>
            Kostenvergleichsanalyse Altsystem vs. Neusystem (über {analysisPeriodYears} Jahre)
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                  <th style={{ padding: '10px' }}>Jahr</th>
                  <th style={{ padding: '10px' }}>Altsystem (laufend)</th>
                  <th style={{ padding: '10px' }}>Altsystem (kumuliert)</th>
                  <th style={{ padding: '10px' }}>Neusystem (inkl. Investition)</th>
                  <th style={{ padding: '10px' }}>Netto-Vorteil Neusystem</th>
                </tr>
              </thead>
              <tbody>
                {comparisonResult.yearlyBreakdown.map(row => (
                  <tr key={row.year} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#fff' }}>Jahr {row.year}</td>
                    <td style={{ padding: '10px', color: '#f87171' }}>{row.oldCostYear.toLocaleString('de-DE')} €</td>
                    <td style={{ padding: '10px', color: '#ef4444' }}>{row.cumulativeOld.toLocaleString('de-DE')} €</td>
                    <td style={{ padding: '10px', color: '#60a5fa' }}>{row.cumulativeNew.toLocaleString('de-DE')} €</td>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: row.cumulativeDifference >= 0 ? '#34d399' : '#f87171' }}>
                      {row.cumulativeDifference >= 0 ? '+' : ''}{row.cumulativeDifference.toLocaleString('de-DE')} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', fontSize: '0.9rem', color: '#34d399', fontWeight: 'bold' }}>
            ✓ Gesamter wirtschaftlicher Netto-Vorteil nach {analysisPeriodYears} Jahren: {comparisonResult.totalSavings.toLocaleString('de-DE')} €
          </div>
        </div>
      )}

      {/* Practical IHK Advice Banner */}
      <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <Info size={20} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
          <strong>Prüfungs-Leitfaden für den IHK-Abschlussbericht:</strong> Eine reine technische Lösung reicht für die IHK nicht aus. Prüfungsausschüsse verlangen zwingend eine nachvollziehbare Wirtschaftlichkeitsbetrachtung. Zeige transparent auf, ab welchem Monat sich die Entwicklungsstunden durch Einsparungen bei manuellen Arbeitszeiten amortisiert haben.
        </div>
      </div>
    </div>
  );
}
