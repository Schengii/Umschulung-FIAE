import React, { useState, useMemo } from 'react';
import { Calculator, Info, ChevronRight, Award, HelpCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import {
  berechneBab,
  berechneZuschlagskalkulation,
  berechneBab2Kostenueberdeckung,
  IHK_BAB_BEISPIEL,
  IHK_NORMAL_ZUSCHLAGSSAETZE,
  IHK_BAB_DRILL_QUESTIONS,
  KOSTENSTELLEN,
  ZUSCHLAGSAETZE_ERLAEUTERUNG,
} from '../../utils/wisoBabEngine';

const XP_REWARD = 65;

export default function WisoBabLab({ onXPGain }) {
  const addXP = useStore((s) => s.addXP);
  const [aktivesTab, setAktivesTab] = useState('bab');
  const [xpVergeben, setXpVergeben] = useState(false);

  // BAB-Eingaben (MEK, FEK & Gemeinkosten-Gesamtbeträge, Schlüssel sind fix für Einfachheit)
  const [mek, setMek] = useState(IHK_BAB_BEISPIEL.materialeinzelkosten);
  const [fek, setFek] = useState(IHK_BAB_BEISPIEL.fertigungseinzelkosten);

  // BAB II Normalkosten-Zuschlagssätze
  const [normalMgk, setNormalMgk] = useState(IHK_NORMAL_ZUSCHLAGSSAETZE.mgkSatz);
  const [normalFgk, setNormalFgk] = useState(IHK_NORMAL_ZUSCHLAGSSAETZE.fgkSatz);
  const [normalVwgk, setNormalVwgk] = useState(IHK_NORMAL_ZUSCHLAGSSAETZE.vwgkSatz);
  const [normalVtrgk, setNormalVtrgk] = useState(IHK_NORMAL_ZUSCHLAGSSAETZE.vtrgkSatz);

  // Drill State
  const [drillAnswers, setDrillAnswers] = useState({});
  const [drillSubmitted, setDrillSubmitted] = useState(false);
  const [drillXpVergeben, setDrillXpVergeben] = useState(false);

  // Zuschlagskalkulation
  const [kalkmek, setKalkmek] = useState(200);
  const [kalkfek, setKalkfek] = useState(300);
  const [kalkGewinn, setKalkGewinn] = useState(15);
  const [kalkuliertXp, setKalkuliertXp] = useState(false);

  const babErgebnis = useMemo(() => {
    try {
      return berechneBab({ ...IHK_BAB_BEISPIEL, materialeinzelkosten: mek, fertigungseinzelkosten: fek });
    } catch {
      return null;
    }
  }, [mek, fek]);

  const bab2Ergebnis = useMemo(() => {
    if (!babErgebnis) return null;
    return berechneBab2Kostenueberdeckung({
      istKostenstellenSummen: babErgebnis.kostenstellenSummen,
      materialeinzelkosten: mek,
      fertigungseinzelkosten: fek,
      herstellkosten: babErgebnis.herstellkosten,
      normalZuschlagssaetze: {
        mgkSatz: normalMgk,
        fgkSatz: normalFgk,
        vwgkSatz: normalVwgk,
        vtrgkSatz: normalVtrgk,
      },
    });
  }, [babErgebnis, mek, fek, normalMgk, normalFgk, normalVwgk, normalVtrgk]);

  const kalkErgebnis = useMemo(() => {
    if (!babErgebnis) return null;
    return berechneZuschlagskalkulation({
      mek: kalkmek,
      fek: kalkfek,
      mgkSatz: babErgebnis.zuschlagsaetze.mgkSatz,
      fgkSatz: babErgebnis.zuschlagsaetze.fgkSatz,
      vwgkSatz: babErgebnis.zuschlagsaetze.vwgkSatz,
      vtrgkSatz: babErgebnis.zuschlagsaetze.vtrgkSatz,
      gewinnzuschlag: kalkGewinn,
    });
  }, [babErgebnis, kalkmek, kalkfek, kalkGewinn]);

  const handleKalkXP = () => {
    if (!kalkuliertXp) {
      const xpFn = onXPGain || addXP;
      xpFn?.(XP_REWARD, 'IHK WISO BAB & Kostenstellenrechnung');
      setKalkuliertXp(true);
      setXpVergeben(true);
    }
  };

  const handleDrillSubmit = () => {
    setDrillSubmitted(true);
    const score = IHK_BAB_DRILL_QUESTIONS.reduce(
      (acc, q) => acc + (drillAnswers[q.id] === q.richtigIndex ? 1 : 0),
      0
    );
    if (score === IHK_BAB_DRILL_QUESTIONS.length && !drillXpVergeben) {
      const xpFn = onXPGain || addXP;
      xpFn?.(40, 'IHK WISO BAB-Meister Drill');
      setDrillXpVergeben(true);
    }
  };

  const fmt = (n) => typeof n === 'number' ? n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';

  return (
    <div className="lab-container">
      <div className="lab-header">
        <Calculator size={28} className="lab-icon" />
        <div>
          <h2>IHK WISO Betriebsabrechnungsbogen (BAB) &amp; BAB II</h2>
          <p className="lab-subtitle">Kostenstellenrechnung · Normalkosten vs. Istkosten · Kostenüberdeckung · IHK AP2 Standard</p>
        </div>
        {xpVergeben && <div className="xp-badge"><Award size={16} /> +{XP_REWARD} XP</div>}
        {drillXpVergeben && <div className="xp-badge" style={{ background: 'var(--accent-emerald)' }}><Award size={16} /> +40 XP Drill</div>}
      </div>

      <div className="lab-tabs">
        {[
          { id: 'bab', label: 'BAB-Übersicht (Ist)' },
          { id: 'zuschlaege', label: 'Zuschlagssätze' },
          { id: 'bab2', label: 'BAB II (Normal vs. Ist)' },
          { id: 'kalkulation', label: 'Zuschlagskalkulation' },
          { id: 'drill', label: 'IHK-Prüfungs-Drill' },
        ].map((tab) => (
          <button key={tab.id} className={`lab-tab${aktivesTab === tab.id ? ' active' : ''}`} onClick={() => setAktivesTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {aktivesTab === 'bab' && babErgebnis && (
        <div className="bab-panel">
          <div className="info-box">
            <Info size={16} />
            <span>
              Der <strong>Betriebsabrechnungsbogen (BAB)</strong> verteilt die Gemeinkosten des Unternehmens auf die
              Kostenstellen <em>Material, Fertigung, Verwaltung und Vertrieb</em>. Die Zuschlagssätze
              bilden die Basis für die Kalkulation des Selbstkostenpreises.
            </span>
          </div>

          <div className="bab-inputs-row">
            <label>
              Materialeinzelkosten (MEK) [€]
              <input type="number" value={mek} onChange={(e) => setMek(Number(e.target.value))} min="1" />
            </label>
            <label>
              Fertigungseinzelkosten (FEK) [€]
              <input type="number" value={fek} onChange={(e) => setFek(Number(e.target.value))} min="1" />
            </label>
          </div>

          <div className="bab-table-wrapper">
            <table className="bab-table">
              <thead>
                <tr>
                  <th>Kostenart</th>
                  <th>Gesamt (€)</th>
                  {KOSTENSTELLEN.map((ks) => <th key={ks}>{ks}</th>)}
                </tr>
              </thead>
              <tbody>
                {IHK_BAB_BEISPIEL.gemeinkosten.map((art) => {
                  const verteilung = babErgebnis.bab[art.name] || {};
                  return (
                    <tr key={art.name}>
                      <td>{art.name}</td>
                      <td className="betrag-cell">{fmt(art.gesamt)}</td>
                      {KOSTENSTELLEN.map((ks) => <td key={ks} className="betrag-cell">{fmt(verteilung[ks] || 0)}</td>)}
                    </tr>
                  );
                })}
                <tr className="summen-row">
                  <td><strong>Summe Gemeinkosten</strong></td>
                  <td className="betrag-cell"><strong>{fmt(IHK_BAB_BEISPIEL.gemeinkosten.reduce((s, a) => s + a.gesamt, 0))}</strong></td>
                  {KOSTENSTELLEN.map((ks) => (
                    <td key={ks} className="betrag-cell"><strong>{fmt(babErgebnis.kostenstellenSummen[ks] || 0)}</strong></td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {aktivesTab === 'zuschlaege' && babErgebnis && (
        <div className="zuschlaege-panel">
          <h3>Berechnete Zuschlagssätze</h3>
          <div className="zuschlagsatz-grid">
            {[
              { key: 'mgkSatz', label: 'MGK-Zuschlag', basis: `MEK = ${fmt(mek)} €`, farbe: 'material' },
              { key: 'fgkSatz', label: 'FGK-Zuschlag', basis: `FEK = ${fmt(fek)} €`, farbe: 'fertigung' },
              { key: 'vwgkSatz', label: 'VwGK-Zuschlag', basis: `HK = ${fmt(babErgebnis.herstellkosten)} €`, farbe: 'verwaltung' },
              { key: 'vtrgkSatz', label: 'VtrGK-Zuschlag', basis: `HK = ${fmt(babErgebnis.herstellkosten)} €`, farbe: 'vertrieb' },
            ].map(({ key, label, basis, farbe }) => (
              <div key={key} className={`zuschlagsatz-card zuschlagsatz-${farbe}`}>
                <div className="zuschlagsatz-wert">{fmt(babErgebnis.zuschlagsaetze[key])} %</div>
                <div className="zuschlagsatz-label">{label}</div>
                <div className="zuschlagsatz-basis">Bezugsbasis: {basis}</div>
                <div className="zuschlagsatz-formel">{ZUSCHLAGSAETZE_ERLAEUTERUNG[key]}</div>
              </div>
            ))}
          </div>

          <div className="herstellkosten-card">
            <div className="herstellkosten-schema">
              <div>MEK: {fmt(mek)} €</div>
              <div className="plus">+ MGK ({fmt(babErgebnis.zuschlagsaetze.mgkSatz)} %): {fmt(mek * babErgebnis.zuschlagsaetze.mgkSatz / 100)} €</div>
              <div className="plus">+ FEK: {fmt(fek)} €</div>
              <div className="plus">+ FGK ({fmt(babErgebnis.zuschlagsaetze.fgkSatz)} %): {fmt(fek * babErgebnis.zuschlagsaetze.fgkSatz / 100)} €</div>
              <div className="summe-zeile">= Herstellkosten: {fmt(babErgebnis.herstellkosten)} €</div>
              <div className="plus">+ VwGK ({fmt(babErgebnis.zuschlagsaetze.vwgkSatz)} %): {fmt(babErgebnis.herstellkosten * babErgebnis.zuschlagsaetze.vwgkSatz / 100)} €</div>
              <div className="plus">+ VtrGK ({fmt(babErgebnis.zuschlagsaetze.vtrgkSatz)} %): {fmt(babErgebnis.herstellkosten * babErgebnis.zuschlagsaetze.vtrgkSatz / 100)} €</div>
              <div className="summe-zeile highlight">= Selbstkosten: {fmt(babErgebnis.selbstkosten)} €</div>
            </div>
          </div>
        </div>
      )}

      {aktivesTab === 'kalkulation' && kalkErgebnis && (
        <div className="kalkulation-panel">
          <div className="info-box">
            <Info size={16} />
            <span>
              Die <strong>Zuschlagskalkulation</strong> verwendet die BAB-Zuschlagssätze,
              um den Selbstkostenpreis und den Angebotspreis für ein einzelnes Produkt zu berechnen.
            </span>
          </div>
          <div className="kalk-inputs-row">
            <label>MEK pro Stück (€) <input type="number" value={kalkmek} onChange={(e) => setKalkmek(Number(e.target.value))} min="0" /></label>
            <label>FEK pro Stück (€) <input type="number" value={kalkfek} onChange={(e) => setKalkfek(Number(e.target.value))} min="0" /></label>
            <label>Gewinnzuschlag (%) <input type="number" value={kalkGewinn} onChange={(e) => setKalkGewinn(Number(e.target.value))} min="0" max="100" /></label>
          </div>

          <div className="kalk-schema">
            {[
              { label: 'Materialeinzelkosten (MEK)', wert: kalkErgebnis.mek },
              { label: `+ Materialgemeinkosten (MGK, ${fmt(babErgebnis?.zuschlagsaetze.mgkSatz)} %)`, wert: kalkErgebnis.mgk },
              { label: 'Fertigungseinzelkosten (FEK)', wert: kalkErgebnis.fek },
              { label: `+ Fertigungsgemeinkosten (FGK, ${fmt(babErgebnis?.zuschlagsaetze.fgkSatz)} %)`, wert: kalkErgebnis.fgk },
              { label: '= Herstellkosten (HK)', wert: kalkErgebnis.herstellkosten, highlight: true },
              { label: `+ Verwaltungsgemeinkosten (VwGK, ${fmt(babErgebnis?.zuschlagsaetze.vwgkSatz)} %)`, wert: kalkErgebnis.vwgk },
              { label: `+ Vertriebsgemeinkosten (VtrGK, ${fmt(babErgebnis?.zuschlagsaetze.vtrgkSatz)} %)`, wert: kalkErgebnis.vtrgk },
              { label: '= Selbstkosten (SK)', wert: kalkErgebnis.selbstkosten, highlight: true },
              { label: `+ Gewinn (${kalkGewinn} %)`, wert: kalkErgebnis.gewinn },
              { label: '= Angebotspreis (netto)', wert: kalkErgebnis.angebotspreis, highlight: true, gross: true },
            ].map(({ label, wert, highlight, gross }) => (
              <div key={label} className={`kalk-zeile${highlight ? ' kalk-highlight' : ''}${gross ? ' kalk-gross' : ''}`}>
                <span>{label}</span>
                <span className="kalk-betrag">{fmt(wert)} €</span>
              </div>
            ))}
          </div>

          <div className="kalk-actions">
            <button className="btn-primary" onClick={handleKalkXP} disabled={kalkuliertXp}>
              {kalkuliertXp ? <><Award size={16} /> +{XP_REWARD} XP verdient!</> : <><ChevronRight size={16} /> Aufgabe abschließen & {XP_REWARD} XP verdienen</>}
            </button>
          </div>
        </div>
      )}

      {aktivesTab === 'bab2' && bab2Ergebnis && babErgebnis && (
        <div className="bab2-panel">
          <div className="info-box">
            <Info size={16} />
            <span>
              Im <strong>BAB II (Normalkostenrechnung)</strong> werden die auf Normalbasis (Erfahrungswerte) vorkalkulierten
              Gemeinkosten mit den tatsächlichen Ist-Gemeinkosten verglichen.
              Eine <strong>Überdeckung</strong> entsteht, wenn Normal-GK &gt; Ist-GK (Kostenersparnis).
              Eine <strong>Unterdeckung</strong> entsteht, wenn Normal-GK &lt; Ist-GK (Kostenüberschreitung).
            </span>
          </div>

          <div className="kalk-inputs-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <label>
              Normal-MGK (%)
              <input type="number" step="0.5" value={normalMgk} onChange={(e) => setNormalMgk(Number(e.target.value))} />
            </label>
            <label>
              Normal-FGK (%)
              <input type="number" step="0.5" value={normalFgk} onChange={(e) => setNormalFgk(Number(e.target.value))} />
            </label>
            <label>
              Normal-VwGK (%)
              <input type="number" step="0.5" value={normalVwgk} onChange={(e) => setNormalVwgk(Number(e.target.value))} />
            </label>
            <label>
              Normal-VtrGK (%)
              <input type="number" step="0.5" value={normalVtrgk} onChange={(e) => setNormalVtrgk(Number(e.target.value))} />
            </label>
          </div>

          <div className="bab-table-wrapper" style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table className="bab-table">
              <thead>
                <tr>
                  <th>Kostenstelle</th>
                  <th>Ist-Gemeinkosten (€)</th>
                  <th>Normal-Zuschlag (%)</th>
                  <th>Bezugsbasis (€)</th>
                  <th>Normal-Gemeinkosten (€)</th>
                  <th>Differenz (€)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bab2Ergebnis.auswertung.map((row) => (
                  <tr key={row.kostenstelle}>
                    <td><strong>{row.kostenstelle}</strong></td>
                    <td className="betrag-cell">{fmt(row.istGemeinkosten)}</td>
                    <td className="betrag-cell">{row.normalZuschlagssatz.toFixed(1)} %</td>
                    <td className="betrag-cell">{fmt(row.bezugsbasis)}</td>
                    <td className="betrag-cell">{fmt(row.normalGemeinkosten)}</td>
                    <td className="betrag-cell" style={{ color: row.differenz >= 0 ? 'var(--accent-emerald, #10b981)' : 'var(--accent-rose, #ef4444)', fontWeight: 'bold' }}>
                      {row.differenz >= 0 ? `+${fmt(row.differenz)}` : fmt(row.differenz)}
                    </td>
                    <td>
                      <span className={`badge ${row.status === 'Überdeckung' ? 'badge-emerald' : row.status === 'Unterdeckung' ? 'badge-rose' : 'badge-slate'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="summen-row">
                  <td><strong>Gesamtergebnis BAB II</strong></td>
                  <td className="betrag-cell"><strong>{fmt(bab2Ergebnis.auswertung.reduce((s, r) => s + r.istGemeinkosten, 0))}</strong></td>
                  <td>—</td>
                  <td>—</td>
                  <td className="betrag-cell"><strong>{fmt(bab2Ergebnis.auswertung.reduce((s, r) => s + r.normalGemeinkosten, 0))}</strong></td>
                  <td className="betrag-cell" style={{ color: bab2Ergebnis.gesamtDifferenz >= 0 ? 'var(--accent-emerald, #10b981)' : 'var(--accent-rose, #ef4444)', fontWeight: 'bold' }}>
                    {bab2Ergebnis.gesamtDifferenz >= 0 ? `+${fmt(bab2Ergebnis.gesamtDifferenz)}` : fmt(bab2Ergebnis.gesamtDifferenz)}
                  </td>
                  <td>
                    <span className={`badge ${bab2Ergebnis.gesamtStatus === 'Überdeckung' ? 'badge-emerald' : 'badge-rose'}`}>
                      Gesamt: {bab2Ergebnis.gesamtStatus}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {aktivesTab === 'drill' && (
        <div className="drill-panel">
          <div className="info-box">
            <HelpCircle size={16} />
            <span>
              <strong>IHK-Prüfungs-Drill BAB &amp; Kostenstellenrechnung:</strong> Teste dein Wissen zu Bezugsbasen,
              Normalkostenrechnung und BAB-II-Über-/Unterdeckungen für die IHK AP2 Abschlussprüfung.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
            {IHK_BAB_DRILL_QUESTIONS.map((q, qIdx) => {
              const isCorrect = drillAnswers[q.id] === q.richtigIndex;
              return (
                <div
                  key={q.id}
                  style={{
                    padding: '18px',
                    borderRadius: '10px',
                    background: 'var(--bg-secondary, #1e293b)',
                    border: '1px solid var(--border-color, #334155)',
                  }}
                >
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--text-main, #f8fafc)' }}>
                    {qIdx + 1}. {q.frage}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.optionen.map((opt, oIdx) => {
                      const optSelected = drillAnswers[q.id] === oIdx;
                      let btnBg = 'var(--bg-surface, #0f172a)';
                      let border = '1px solid var(--border-color, #334155)';
                      if (drillSubmitted) {
                        if (oIdx === q.richtigIndex) {
                          btnBg = 'rgba(16, 185, 129, 0.2)';
                          border = '1px solid #10b981';
                        } else if (optSelected) {
                          btnBg = 'rgba(239, 68, 68, 0.2)';
                          border = '1px solid #ef4444';
                        }
                      } else if (optSelected) {
                        btnBg = 'rgba(59, 130, 246, 0.2)';
                        border = '1px solid #3b82f6';
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => !drillSubmitted && setDrillAnswers((prev) => ({ ...prev, [q.id]: oIdx }))}
                          disabled={drillSubmitted}
                          style={{
                            textAlign: 'left',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            background: btnBg,
                            border,
                            color: 'var(--text-main, #f8fafc)',
                            cursor: drillSubmitted ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                          }}
                        >
                          <span style={{ fontWeight: 'bold', width: '22px' }}>
                            {String.fromCharCode(65 + oIdx)})
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {drillSubmitted && (
                    <div style={{ marginTop: '12px', fontSize: '0.85rem', color: isCorrect ? '#10b981' : '#f87171' }}>
                      <p style={{ margin: '4px 0', fontWeight: 'bold' }}>
                        {isCorrect ? '✓ Richtig!' : '✗ Falsch!'}
                      </p>
                      <p style={{ margin: 0, color: 'var(--text-muted, #94a3b8)' }}>{q.erklaerung}</p>
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
              {!drillSubmitted ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleDrillSubmit}
                  disabled={Object.keys(drillAnswers).length < IHK_BAB_DRILL_QUESTIONS.length}
                >
                  Antworten prüfen &amp; +40 XP sichern
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setDrillSubmitted(false);
                    setDrillAnswers({});
                  }}
                >
                  Drill wiederholen
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
