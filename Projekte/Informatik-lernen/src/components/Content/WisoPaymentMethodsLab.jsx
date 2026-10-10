import React, { useState, useMemo } from 'react';
import { CreditCard, Info, ChevronRight, Award, CheckCircle2, AlertCircle, Calculator, FileText } from 'lucide-react';
import { useStore } from '../../store/useStore';
import {
  ZAHLUNGSARTEN,
  PREISNACHLAESSE,
  IHK_ZAHLUNGSAUFGABEN,
  SEPA_MANDAT_INFO,
  berechneSkontovorteil,
  berechneWechseldiskont,
} from '../../utils/wisoPaymentEngine';

const XP_REWARD = 60;

export default function WisoPaymentMethodsLab({ onXPGain }) {
  const addXP = useStore((s) => s.addXP);
  const [aktivesTab, setAktivesTab] = useState('zahlungsarten');
  const [gewaehltZahlungsart, setGewaehltZahlungsart] = useState(ZAHLUNGSARTEN[0]);
  const [xpVergeben, setXpVergeben] = useState(false);

  // Skonto-Rechner
  const [skontoProzent, setSkontoProzent] = useState(2);
  const [zahlungsziel, setZahlungsziel] = useState(60);
  const [skontofrist, setSkontofrist] = useState(14);

  // Wechseldiskont-Rechner
  const [wNennwert, setWNennwert] = useState(12000);
  const [wDiskontsatz, setWDiskontsatz] = useState(6);
  const [wLaufzeit, setWLaufzeit] = useState(45);

  // Aufgaben-Tracker
  const [aufgabeIndex, setAufgabeIndex] = useState(0);
  const [geloeste, setGeloeste] = useState(new Set());
  const [zeigeLoesungen, setZeigeLoesungen] = useState(new Set());

  const skontoErgebnis = useMemo(() => {
    try {
      return berechneSkontovorteil(skontoProzent, zahlungsziel, skontofrist);
    } catch { return null; }
  }, [skontoProzent, zahlungsziel, skontofrist]);

  const wechselErgebnis = useMemo(() => {
    try {
      return berechneWechseldiskont(wNennwert, wDiskontsatz, wLaufzeit);
    } catch { return null; }
  }, [wNennwert, wDiskontsatz, wLaufzeit]);

  const handleAufgabeLoesung = (id) => {
    const neu = new Set(zeigeLoesungen);
    neu.add(id);
    setZeigeLoesungen(neu);
    const geloestNeu = new Set(geloeste);
    geloestNeu.add(id);
    setGeloeste(geloestNeu);
    if (geloestNeu.size >= IHK_ZAHLUNGSAUFGABEN.length && !xpVergeben) {
      const xpFn = onXPGain || addXP;
      xpFn?.(XP_REWARD, 'IHK WISO Zahlungsverkehr');
      setXpVergeben(true);
    }
  };

  const fmt = (n) => typeof n === 'number'
    ? n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—';

  const aufgabe = IHK_ZAHLUNGSAUFGABEN[aufgabeIndex];

  return (
    <div className="lab-container">
      <div className="lab-header">
        <CreditCard size={28} className="lab-icon" />
        <div>
          <h2>IHK WISO Zahlungsverkehr</h2>
          <p className="lab-subtitle">SEPA · Wechsel · Skonto/Rabatt/Bonus · Effektivzins — IHK AP2 Standard</p>
        </div>
        {xpVergeben && <div className="xp-badge"><Award size={16} /> +{XP_REWARD} XP</div>}
      </div>

      <div className="lab-tabs">
        {[
          { id: 'zahlungsarten', label: 'Zahlungsarten' },
          { id: 'rechner', label: 'Rechner' },
          { id: 'aufgaben', label: 'IHK-Aufgaben' },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`lab-tab${aktivesTab === tab.id ? ' active' : ''}`}
            onClick={() => setAktivesTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Zahlungsarten ── */}
      {aktivesTab === 'zahlungsarten' && (
        <div className="payment-learn animate-fade-in">
          <div className="info-box">
            <Info size={16} />
            <span>
              Im Zahlungsverkehr unterscheidet man <strong>beleggebundene</strong> (Scheck, Wechsel)
              und <strong>beleglose</strong> (SEPA-Überweisung, SEPA-Lastschrift) Zahlungsformen.
              Kennzeichne die <strong>Vorlaufzeiten</strong> und das <strong>Widerspruchsrecht</strong> der SEPA-Lastschrift
              als IHK-Prüfungsschwerpunkt!
            </span>
          </div>

          <div className="payment-grid">
            {ZAHLUNGSARTEN.map((z) => (
              <button
                key={z.id}
                className={`payment-card${gewaehltZahlungsart.id === z.id ? ' active' : ''}`}
                onClick={() => setGewaehltZahlungsart(z)}
              >
                <div className="payment-card-header">
                  <span className="payment-card-name">{z.name}</span>
                  <span className={`risiko-badge risiko-${z.risiko}`}>{z.risiko}</span>
                </div>
                <div className="payment-card-kosten">{z.kosten}</div>
              </button>
            ))}
          </div>

          <div className="payment-detail">
            <h3>{gewaehltZahlungsart.name}</h3>
            <p className="payment-beschreibung">{gewaehltZahlungsart.beschreibung}</p>

            <div className="payment-merkmale">
              <div className="merkmale-titel">Wichtige Merkmale (IHK-Prüfung):</div>
              <ul>
                {gewaehltZahlungsart.merkmale.map((m, i) => (
                  <li key={i}><ChevronRight size={13} className="merkmal-icon" />{m}</li>
                ))}
              </ul>
            </div>

            {gewaehltZahlungsart.id === 'sepa_lastschrift' && (
              <div className="sepa-mandat-box">
                <h4>SEPA-Mandat (Prüfungswissen)</h4>
                <div className="mandat-grid">
                  <div>
                    <div className="mandat-titel">Pflichtangaben im Mandat:</div>
                    <ul className="mandat-list">
                      {SEPA_MANDAT_INFO.pflichtangaben.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="mandat-titel">Vorlaufzeiten:</div>
                    <table className="vorlauf-table">
                      <tbody>
                        {Object.entries(SEPA_MANDAT_INFO.vorlaufzeiten).map(([k, v]) => (
                          <tr key={k}>
                            <td className="vorlauf-key">{k.replace(/_/g, ' ').toUpperCase()}</td>
                            <td>{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preisnachlässe */}
          <h3 style={{ marginTop: '28px', marginBottom: '12px' }}>
            Skonto · Rabatt · Bonus — Unterschiede (IHK-Kernthema)
          </h3>
          <div className="nachlass-grid">
            {PREISNACHLAESSE.map((p) => (
              <div key={p.typ} className={`nachlass-card nachlass-${p.typ.toLowerCase()}`}>
                <div className="nachlass-header">{p.typ}</div>
                <div className="nachlass-def">{p.definition}</div>
                <div className="nachlass-zeitpunkt">
                  <strong>Zeitpunkt:</strong> {p.zeitpunkt}
                </div>
                <div className="nachlass-beispiel">
                  <strong>Beispiel:</strong> {p.beispiel}
                </div>
                <div className="nachlass-steuer">§ {p.steuerlich}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: Rechner ── */}
      {aktivesTab === 'rechner' && (
        <div className="rechner-panel animate-fade-in">
          <div className="rechner-grid">
            {/* Skonto-Effektivzins */}
            <div className="rechner-card">
              <div className="rechner-card-header">
                <Calculator size={18} />
                <span>Skonto-Effektivzins Rechner</span>
              </div>
              <div className="info-box" style={{ marginTop: '12px' }}>
                <Info size={14} />
                <span style={{ fontSize: '0.82rem' }}>
                  <strong>Formel (IHK):</strong>{' '}
                  <code>Eff.zins = (S% / (100−S%)) × (360 / (ZZ − SF)) × 100</code>
                </span>
              </div>

              <div className="rechner-inputs">
                <label>Skonto-% <input type="number" value={skontoProzent} onChange={(e) => setSkontoProzent(parseFloat(e.target.value) || 0)} step="0.5" min="0.1" max="10" /></label>
                <label>Zahlungsziel (Tage) <input type="number" value={zahlungsziel} onChange={(e) => setZahlungsziel(parseInt(e.target.value) || 1)} min="1" /></label>
                <label>Skontofrist (Tage) <input type="number" value={skontofrist} onChange={(e) => setSkontofrist(parseInt(e.target.value) || 1)} min="1" /></label>
              </div>

              {skontoErgebnis ? (
                <div className="rechner-ergebnis">
                  <div className="ergebnis-hauptwert">
                    <span className="ergebnis-zahl">{skontoErgebnis.effektivzins.toFixed(2)} %</span>
                    <span className="ergebnis-label">Effektiver Jahreszins</span>
                  </div>
                  <div className={`empfehlung-box ${skontoErgebnis.effektivzins > skontoErgebnis.kreditzins ? 'empfehlung-ja' : 'empfehlung-nein'}`}>
                    {skontoErgebnis.effektivzins > skontoErgebnis.kreditzins
                      ? <CheckCircle2 size={16} />
                      : <AlertCircle size={16} />}
                    {skontoErgebnis.empfehlung}
                  </div>
                  <div className="rechner-schema">
                    <div>Skontofrist: <strong>{skontofrist} Tage</strong></div>
                    <div>Kreditlaufzeit: <strong>{zahlungsziel - skontofrist} Tage</strong></div>
                    <div>Vergleich Kontokorrent: <strong>{skontoErgebnis.kreditzins} %</strong></div>
                  </div>
                </div>
              ) : (
                <div className="rechner-fehler">Zahlungsziel muss größer als Skontofrist sein.</div>
              )}
            </div>

            {/* Wechseldiskont */}
            <div className="rechner-card">
              <div className="rechner-card-header">
                <FileText size={18} />
                <span>Wechseldiskont Rechner</span>
              </div>
              <div className="info-box" style={{ marginTop: '12px' }}>
                <Info size={14} />
                <span style={{ fontSize: '0.82rem' }}>
                  <strong>Formel:</strong>{' '}
                  <code>Diskont = (Nennwert × Satz × Tage) / (360 × 100)</code>
                </span>
              </div>

              <div className="rechner-inputs">
                <label>Nennwert (€) <input type="number" value={wNennwert} onChange={(e) => setWNennwert(parseFloat(e.target.value) || 0)} min="100" /></label>
                <label>Diskontsatz (% p. a.) <input type="number" value={wDiskontsatz} onChange={(e) => setWDiskontsatz(parseFloat(e.target.value) || 0)} step="0.5" min="0.1" /></label>
                <label>Restlaufzeit (Tage) <input type="number" value={wLaufzeit} onChange={(e) => setWLaufzeit(parseInt(e.target.value) || 1)} min="1" /></label>
              </div>

              {wechselErgebnis ? (
                <div className="rechner-ergebnis">
                  <div className="wechsel-schema">
                    <div className="wechsel-zeile">
                      <span>Nennwert des Wechsels</span>
                      <span className="wechsel-betrag">{fmt(wNennwert)} €</span>
                    </div>
                    <div className="wechsel-zeile minus">
                      <span>− Diskontbetrag</span>
                      <span className="wechsel-betrag">{fmt(wechselErgebnis.diskont)} €</span>
                    </div>
                    <div className="wechsel-zeile summe">
                      <span>= Auszahlungsbetrag</span>
                      <span className="wechsel-betrag">{fmt(wechselErgebnis.auszahlung)} €</span>
                    </div>
                    <div className="wechsel-zeile effektiv">
                      <span>Effektivzins</span>
                      <span className="wechsel-betrag">{wechselErgebnis.effektivzins.toFixed(2)} %</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rechner-fehler">Ungültige Eingaben — alle Werte müssen positiv sein.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: IHK-Aufgaben ── */}
      {aktivesTab === 'aufgaben' && (
        <div className="aufgaben-panel animate-fade-in">
          <div className="aufgaben-nav">
            {IHK_ZAHLUNGSAUFGABEN.map((a, i) => (
              <button
                key={a.id}
                className={`aufgabe-btn${aufgabeIndex === i ? ' active' : ''}${geloeste.has(a.id) ? ' solved' : ''}`}
                onClick={() => setAufgabeIndex(i)}
              >
                {geloeste.has(a.id) ? <CheckCircle2 size={14} /> : <ChevronRight size={14} />}
                {a.titel}
              </button>
            ))}
          </div>

          <div className="aufgabe-detail">
            <div className="aufgabe-kopf">
              <span className={`aufgabe-typ-badge aufgabe-typ-${aufgabe.typ}`}>{aufgabe.typ}</span>
              <h3>{aufgabe.titel}</h3>
            </div>

            <div className="aufgabe-text">{aufgabe.aufgabe}</div>

            {aufgabe.typ === 'skonto' && aufgabe.skontoProzent && (
              <div className="aufgabe-daten">
                <strong>Gegeben:</strong>{' '}
                {aufgabe.skontoProzent} % Skonto · Zahlungsziel {aufgabe.zahlungsziel} Tage · Skontofrist {aufgabe.skontofrist} Tage
              </div>
            )}
            {aufgabe.typ === 'wechsel' && aufgabe.nennwert && (
              <div className="aufgabe-daten">
                <strong>Gegeben:</strong>{' '}
                Nennwert {fmt(aufgabe.nennwert)} € · Diskontsatz {aufgabe.diskontsatz} % · Laufzeit {aufgabe.laufzeitTage} Tage
              </div>
            )}

            <div className="aufgabe-hinweis">
              <Info size={14} /> <strong>Hinweis:</strong> {aufgabe.hinweis}
            </div>

            {zeigeLoesungen.has(aufgabe.id) ? (
              <div className="loesung-box">
                <CheckCircle2 size={16} />
                <div>
                  <div className="loesung-titel">Musterlösung:</div>
                  <div className="loesung-text">{aufgabe.loesung}</div>
                </div>
              </div>
            ) : (
              <button className="btn-primary" onClick={() => handleAufgabeLoesung(aufgabe.id)}>
                <ChevronRight size={16} /> Lösung anzeigen
              </button>
            )}

            <div className="progress-bar-row">
              <span>Fortschritt: {geloeste.size}/{IHK_ZAHLUNGSAUFGABEN.length} Aufgaben</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(geloeste.size / IHK_ZAHLUNGSAUFGABEN.length) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
