import React, { useState, useMemo } from 'react';
import {
  TrendingUp, Award, Calculator, Download, Check, Sparkles, BarChart3, HelpCircle
} from 'lucide-react';
import { calculateNetPresentValue, generateIhkEconomicMarkdown } from '../../utils/wisoCapitalValueEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function WisoCapitalValueLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [projectName, setProjectName] = useState('Einführung Automated CI/CD & Cloud Migration');
  const [invest, setInvest] = useState(85000);
  const [rate, setRate] = useState(7.5);
  const [cf1, setCf1] = useState(30000);
  const [cf2, setCf2] = useState(35000);
  const [cf3, setCf3] = useState(38000);
  const [cf4, setCf4] = useState(25000);
  const [salvage, setSalvage] = useState(8000);
  const [solved, setSolved] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'doc' | 'theory'

  const npvData = useMemo(() => {
    return calculateNetPresentValue({
      anschaffungsauszahlung: invest,
      kalkulationszinssatzPercent: rate,
      cashflows: [cf1, cf2, cf3, cf4],
      liquidationserloes: salvage
    });
  }, [invest, rate, cf1, cf2, cf3, cf4, salvage]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(60);
      } else {
        awardXP(60, 'wiso_capital_value_master');
      }
    }
  };

  const copyMarkdownDoc = () => {
    const md = generateIhkEconomicMarkdown(npvData, projectName);
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    triggerHaptic('SUCCESS');
    setTimeout(() => setCopiedMd(false), 2500);
  };

  const handleDownloadDoc = () => {
    const md = generateIhkEconomicMarkdown(npvData, projectName);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `IHK_Kosten_Nutzen_Kapitalwert_${projectName.replace(/\s+/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
    triggerHaptic('SUCCESS');
  };

  // Vordefinierte IHK-Projektszenarien
  const loadScenario = (type) => {
    if (type === 'fiae_microservice') {
      setProjectName('Refactoring Legacy Monolith zu Event-Driven Microservices');
      setInvest(65000);
      setRate(8.0);
      setCf1(25000);
      setCf2(32000);
      setCf3(35000);
      setCf4(28000);
      setSalvage(5000);
    } else if (type === 'fisi_datacenter') {
      setProjectName('Migration On-Premise Rack Cluster zu Kubernetes Hybrid Cloud');
      setInvest(120000);
      setRate(6.5);
      setCf1(40000);
      setCf2(48000);
      setCf3(52000);
      setCf4(45000);
      setSalvage(12000);
    } else if (type === 'unrentabel') {
      setProjectName('Unwirtschaftliches Eigenentwicklungs-Projekt (Gegenbeispiel)');
      setInvest(140000);
      setRate(12.0);
      setCf1(20000);
      setCf2(25000);
      setCf3(30000);
      setCf4(20000);
      setSalvage(0);
    }
    triggerHaptic('SUCCESS');
  };

  return (
    <div className="container-responsive" style={{ padding: '24px 16px', color: 'var(--text-main)' }}>
      {/* Top Header Card */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Calculator size={14} /> IHK AP2 Wirtschaftlichkeitsrechnung
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={14} /> Kapitalwert (NPV) &amp; Diskontierung
            </span>
            <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <BarChart3 size={14} /> Interner Zinsfuß (IRR) &amp; Amortisation
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            📊 IHK Kosten-Nutzen-Analyse &amp; Kapitalwertmethode Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '850px' }}>
            Dynamische Investitionsrechnung nach IHK-Standard für AP2 Teil A (Projektdokumentation) &amp; WISO.
            Diskontiere zukünftige Cashflows mit dem Kalkulationszins (C_0 = -I_0 + &Sigma; R_t / (1+i)^t), ermittle den internen Zinsfuß (IRR) und exportiere die fertige Dokumentation.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={copyMarkdownDoc}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', fontSize: '0.88rem' }}
          >
            {copiedMd ? <Check size={16} color="var(--accent-emerald)" /> : <Download size={16} />}
            {copiedMd ? 'MD Kopiert!' : '1-Klick IHK Doku (.md)'}
          </button>

          <button
            onClick={handleClaim}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
          >
            <Award size={16} /> {solved ? 'Berechnung Bestätigt' : 'Kosten-Nutzen Validieren (+60 XP)'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`btn ${activeTab === 'calculator' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
        >
          <Calculator size={16} style={{ marginRight: '6px' }} /> Interaktiver Rechner
        </button>
        <button
          onClick={() => setActiveTab('doc')}
          className={`btn ${activeTab === 'doc' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
        >
          <Download size={16} style={{ marginRight: '6px' }} /> IHK Projektdoku-Vorschau
        </button>
        <button
          onClick={() => setActiveTab('theory')}
          className={`btn ${activeTab === 'theory' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
        >
          <HelpCircle size={16} style={{ marginRight: '6px' }} /> IHK Prüfungs-Wissen
        </button>
      </div>

      {activeTab === 'calculator' && (
        <>
          {/* Preset Buttons */}
          <div className="glass-panel" style={{ padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 'bold' }}>
              <Sparkles size={16} color="var(--accent-primary)" /> IHK Prüfungsszenarien:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => loadScenario('fiae_microservice')} className="btn btn-sm btn-outline">
                FIAE: Microservice Refactoring (80h)
              </button>
              <button onClick={() => loadScenario('fisi_datacenter')} className="btn btn-sm btn-outline">
                FISI: Hybrid Cloud Cluster (40h)
              </button>
              <button onClick={() => loadScenario('unrentabel')} className="btn btn-sm btn-outline" style={{ color: 'var(--accent-rose)' }}>
                Negativer Kapitalwert (Warn-Szenario)
              </button>
            </div>
          </div>

          {/* Key Metric Cards */}
          <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="glass-panel" style={{ padding: '18px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Summe Barwerte (&Sigma; BW):</span>
              <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--accent-primary)', marginTop: '4px' }}>
                {npvData.sumBarwerte.toLocaleString('de-DE')} €
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gegenwartswert der Rückflüsse</span>
            </div>

            <div className="glass-panel" style={{ padding: '18px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Kapitalwert (NPV = $C_0$):</span>
              <div style={{ fontSize: '1.45rem', fontWeight: '800', color: npvData.isProfitable ? 'var(--accent-emerald)' : 'var(--accent-rose)', marginTop: '4px' }}>
                {npvData.kapitalwert >= 0 ? '+' : ''}{npvData.kapitalwert.toLocaleString('de-DE')} €
              </div>
              <span style={{ fontSize: '0.75rem', color: npvData.isProfitable ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 'bold' }}>
                {npvData.isProfitable ? '✓ Investition vorteilhaft (>= 0 €)' : '✗ Unrentabel (< 0 €)'}
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '18px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Interner Zinsfuß (IRR / IZF):</span>
              <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--accent-amber)', marginTop: '4px' }}>
                {npvData.internalRateOfReturn !== null ? `${npvData.internalRateOfReturn}%` : 'n/a'}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Kalkulationszins: {rate}% ({npvData.internalRateOfReturn && npvData.internalRateOfReturn >= rate ? 'Rentabel' : 'Unzureichend'})
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '18px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Dynamische Amortisation:</span>
              <div style={{ fontSize: '1.45rem', fontWeight: '800', color: npvData.dynamicPaybackPeriod ? 'var(--accent-cyan)' : 'var(--accent-rose)', marginTop: '4px' }}>
                {npvData.dynamicPaybackPeriod ? `${npvData.dynamicPaybackPeriod} Jahre` : '> 4 Jahre'}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Profitabilitätsindex (PI): {npvData.profitabilityIndex}
              </span>
            </div>
          </div>

          {/* Cashflow Barwert Table */}
          <div className="glass-panel" style={{ padding: '22px', overflowX: 'auto', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>
                Diskontierungstabelle &amp; Barwert-Entwicklung ($i = {rate}\%$)
              </h3>
              <span className="badge badge-primary">Formel: BW = R_t / (1 + i)^t</span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Periode (t)</th>
                  <th style={{ padding: '10px' }}>Einzahlungsüberschuss (R_t)</th>
                  <th style={{ padding: '10px' }}>Abzinsungsfaktor (1/(1+i)^t)</th>
                  <th style={{ padding: '10px' }}>Barwert (Diskontiert)</th>
                  <th style={{ padding: '10px' }}>Kumulierter Barwert</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(239, 68, 68, 0.08)' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>t = 0 (Investition $I_0$)</td>
                  <td style={{ padding: '10px', color: 'var(--accent-rose)', fontWeight: 'bold' }}>-{invest.toLocaleString('de-DE')} €</td>
                  <td style={{ padding: '10px' }}>1.0000</td>
                  <td style={{ padding: '10px', color: 'var(--accent-rose)', fontWeight: 'bold' }}>-{invest.toLocaleString('de-DE')} €</td>
                  <td style={{ padding: '10px', color: 'var(--accent-rose)', fontWeight: 'bold' }}>-{invest.toLocaleString('de-DE')} €</td>
                </tr>
                {npvData.cashflowDetails.map(row => (
                  <tr key={row.jahr} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>Jahr {row.jahr}</td>
                    <td style={{ padding: '10px', color: 'var(--accent-emerald)', fontWeight: 'bold' }}>+{row.cashflow.toLocaleString('de-DE')} €</td>
                    <td style={{ padding: '10px', fontFamily: 'monospace' }}>{row.abzinsungsfaktor.toFixed(4)}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>+{row.barwert.toLocaleString('de-DE')} €</td>
                    <td style={{ padding: '10px', color: row.kumulierterBarwert >= invest ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                      {row.kumulierterBarwert.toLocaleString('de-DE')} € {row.kumulierterBarwert >= invest ? '✓ (Amortisiert)' : ''}
                    </td>
                  </tr>
                ))}
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(14, 165, 233, 0.06)' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>Jahr 4 (Restwert $L_4$)</td>
                  <td style={{ padding: '10px', color: 'var(--accent-cyan)' }}>+{salvage.toLocaleString('de-DE')} €</td>
                  <td style={{ padding: '10px', fontFamily: 'monospace' }}>{(1 / Math.pow(1 + rate/100, 4)).toFixed(4)}</td>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>+{npvData.barwertLn.toLocaleString('de-DE')} €</td>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                    {npvData.sumBarwerte.toLocaleString('de-DE')} € (Gesamtsumme)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sliders & Parameters */}
          <div className="glass-panel" style={{ padding: '22px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800' }}>
              Parameter der Investition &amp; Cashflows justieren
            </h3>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Projektbezeichnung (für IHK Dokumentation):
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-main)', fontSize: '0.9rem' }}
              />
            </div>

            <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Anschaffungsauszahlung ($I_0$): <strong>{invest.toLocaleString('de-DE')} €</strong>
                </label>
                <input type="range" min="20000" max="250000" step="5000" value={invest} onChange={(e) => setInvest(parseInt(e.target.value, 10))} style={{ width: '100%' }} />

                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '16px', marginBottom: '6px' }}>
                  Kalkulationszinssatz ($i$): <strong>{rate}% p.a.</strong>
                </label>
                <input type="range" min="1" max="15" step="0.5" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Cashflow Jahr 1 ($R_1$): <strong>{cf1.toLocaleString('de-DE')} €</strong>
                </label>
                <input type="range" min="5000" max="80000" step="2500" value={cf1} onChange={(e) => setCf1(parseInt(e.target.value, 10))} style={{ width: '100%' }} />

                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '16px', marginBottom: '6px' }}>
                  Cashflow Jahr 2 ($R_2$): <strong>{cf2.toLocaleString('de-DE')} €</strong>
                </label>
                <input type="range" min="5000" max="80000" step="2500" value={cf2} onChange={(e) => setCf2(parseInt(e.target.value, 10))} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Cashflow Jahr 3 ($R_3$): <strong>{cf3.toLocaleString('de-DE')} €</strong>
                </label>
                <input type="range" min="5000" max="80000" step="2500" value={cf3} onChange={(e) => setCf3(parseInt(e.target.value, 10))} style={{ width: '100%' }} />

                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '16px', marginBottom: '6px' }}>
                  Cashflow Jahr 4 ($R_4$): <strong>{cf4.toLocaleString('de-DE')} €</strong>
                </label>
                <input type="range" min="5000" max="80000" step="2500" value={cf4} onChange={(e) => setCf4(parseInt(e.target.value, 10))} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Liquidationserlös / Restwert ($L_4$): <strong>{salvage.toLocaleString('de-DE')} €</strong>
                </label>
                <input type="range" min="0" max="30000" step="1000" value={salvage} onChange={(e) => setSalvage(parseInt(e.target.value, 10))} style={{ width: '100%' }} />

                <div style={{ marginTop: '20px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  💡 <strong>IHK Tipp:</strong> Ist der Kapitalwert $C_0 \ge 0$, erwirtschaftet das Projekt eine Verzinsung mindestens in Höhe des Kalkulationszinses $i$ und ist vorteilhaft.
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'doc' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>
              IHK Projektdokumentations-Anhang (Markdown Export)
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={copyMarkdownDoc} className="btn btn-outline btn-sm">
                {copiedMd ? 'Kopiert!' : 'Kopieren'}
              </button>
              <button onClick={handleDownloadDoc} className="btn btn-primary btn-sm">
                Als .md herunterladen
              </button>
            </div>
          </div>

          <pre style={{
            background: 'var(--bg-tertiary)',
            padding: '20px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            lineHeight: 1.6,
            border: '1px solid var(--border-color)'
          }}>
            {generateIhkEconomicMarkdown(npvData, projectName)}
          </pre>
        </div>
      )}

      {activeTab === 'theory' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '16px' }}>
            📚 IHK Fachwissen: Dynamische vs. Statische Investitionsrechnung
          </h2>

          <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '18px', borderRadius: '10px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '8px' }}>
                1. Warum dynamische Diskontierung?
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Statische Methoden (z. B. einfache Kostenvergleichsrechnung oder statische Amortisation) ignorieren den <strong>Zeitwert des Geldes</strong>. 10.000 € in 3 Jahren sind wegen Zinseszins und Inflation heute weniger wert als 10.000 € heute.
              </p>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '18px', borderRadius: '10px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--accent-emerald)', marginBottom: '8px' }}>
                2. Die Kapitalwert-Formel
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, fontFamily: 'monospace' }}>
                C_0 = -I_0 + &Sigma; [ R_t / (1 + i)^t ] + [ L_n / (1 + i)^n ]
              </p>
              <ul style={{ fontSize: '0.82rem', color: 'var(--text-muted)', paddingLeft: '18px', marginTop: '6px' }}>
                <li>$I_0$: Anschaffungsauszahlung (t=0)</li>
                <li>$R_t$: Jährlicher Netto-Rückfluss</li>
                <li>$i$: Kalkulationszinssatz (WACC / Mindestverzinsung)</li>
                <li>$L_n$: Liquidationserlös / Restwert</li>
              </ul>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '18px', borderRadius: '10px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--accent-amber)', marginBottom: '8px' }}>
                3. Entscheidungskriterien der IHK
              </h3>
              <ul style={{ fontSize: '0.86rem', color: 'var(--text-muted)', paddingLeft: '18px', lineHeight: 1.6 }}>
                <li><strong>C_0 &gt; 0:</strong> Investition rentabel. Verzinsung liegt über $i$.</li>
                <li><strong>C_0 = 0:</strong> Investition deckt exakt den Zinssatz $i$.</li>
                <li><strong>C_0 &lt; 0:</strong> Investition unrentabel. Alternative Anlage am Kapitalmarkt bringt mehr Ertrag.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
