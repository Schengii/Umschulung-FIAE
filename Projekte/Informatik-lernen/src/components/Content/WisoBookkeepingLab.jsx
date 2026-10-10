import React, { useState, useCallback } from 'react';
import { BookOpen, Check, X, TrendingUp, TrendingDown, Info, ChevronRight, RotateCcw, Award } from 'lucide-react';
import { useStore } from '../../store/useStore';
import {
  KONTENRAHMEN,
  IHK_SZENARIEN,
  validateBuchungssatz,
  buchungssaetzeZuTKontoBuchungen,
  berechneJahresabschluss,
  erklaereBuchungsregel,
  getKonto,
} from '../../utils/wisoBookkeepingEngine';

const XP_REWARD = 65;

export default function WisoBookkeepingLab({ onXPGain }) {
  const addXP = useStore((s) => s.addXP);
  const [aktivesTab, setAktivesTab] = useState('lernen');
  const [gewaehltesSzenario, setGewaehltesSzenario] = useState(IHK_SZENARIEN[0]);
  const [userSoll, setUserSoll] = useState('');
  const [userHaben, setUserHaben] = useState('');
  const [userBetrag, setUserBetrag] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [geloesteAufgaben, setGeloesteAufgaben] = useState(new Set());
  const [buchungen, setBuchungen] = useState([]);
  const [xpVergeben, setXpVergeben] = useState(false);

  const pruefeAntwort = useCallback(() => {
    const betrag = parseFloat(userBetrag);
    const validation = validateBuchungssatz({ soll: userSoll, haben: userHaben, betrag, beschreibung: '' });
    if (!validation.valid) {
      setFeedback({ typ: 'fehler', text: validation.fehler });
      return;
    }
    const korrekt =
      userSoll === gewaehltesSzenario.soll &&
      userHaben === gewaehltesSzenario.haben &&
      betrag === gewaehltesSzenario.betrag;

    if (korrekt) {
      const neu = new Set(geloesteAufgaben);
      neu.add(gewaehltesSzenario.id);
      setGeloesteAufgaben(neu);
      setBuchungen((prev) => [
        ...prev,
        { soll: userSoll, haben: userHaben, betrag, beschreibung: gewaehltesSzenario.titel },
      ]);
      setFeedback({ typ: 'korrekt', text: `✓ Richtig! ${gewaehltesSzenario.erlaeuterung}` });
      if (neu.size === IHK_SZENARIEN.length && !xpVergeben) {
        const xpFn = onXPGain || addXP;
        xpFn?.(XP_REWARD, 'IHK WISO Doppelte Buchführung');
        setXpVergeben(true);
      }
    } else {
      setFeedback({ typ: 'falsch', text: `✗ Nicht korrekt. Prüfe Soll- und Haben-Konto sowie den Betrag.` });
    }
  }, [userSoll, userHaben, userBetrag, gewaehltesSzenario, geloesteAufgaben, xpVergeben, onXPGain, addXP]);

  const reset = () => {
    setUserSoll('');
    setUserHaben('');
    setUserBetrag('');
    setFeedback(null);
  };

  const tKontoBuchungen = buchungssaetzeZuTKontoBuchungen(buchungen);
  const abschluss = berechneJahresabschluss(tKontoBuchungen);

  const aktivkonten = KONTENRAHMEN.filter((k) => k.typ === 'aktiv');
  const passivkonten = KONTENRAHMEN.filter((k) => k.typ === 'passiv' && k.id !== '9000' && k.id !== '9100');
  const aufwandskonten = KONTENRAHMEN.filter((k) => k.typ === 'aufwand');
  const ertragskonten = KONTENRAHMEN.filter((k) => k.typ === 'ertrag');

  return (
    <div className="lab-container">
      <div className="lab-header">
        <BookOpen size={28} className="lab-icon" />
        <div>
          <h2>IHK WISO Doppelte Buchführung</h2>
          <p className="lab-subtitle">T-Konten · Buchungssätze · GuV & Bilanz — IHK AP2 Standard (SKR03)</p>
        </div>
        {geloesteAufgaben.size === IHK_SZENARIEN.length && (
          <div className="xp-badge"><Award size={16} /> +{XP_REWARD} XP</div>
        )}
      </div>

      <div className="lab-tabs">
        {['lernen', 'ueben', 'jahresabschluss'].map((tab) => (
          <button
            key={tab}
            className={`lab-tab${aktivesTab === tab ? ' active' : ''}`}
            onClick={() => setAktivesTab(tab)}
          >
            {tab === 'lernen' ? 'Grundlagen' : tab === 'ueben' ? 'Übungen' : 'Jahresabschluss'}
          </button>
        ))}
      </div>

      {aktivesTab === 'lernen' && (
        <div className="bookkeeping-learn">
          <div className="info-box">
            <Info size={16} />
            <span>
              <strong>Das Prinzip der Doppik:</strong> Jeder Geschäftsvorfall wird auf mindestens zwei Konten gebucht —
              einmal im <strong>Soll</strong> (linke Seite) und einmal im <strong>Haben</strong> (rechte Seite). Die
              Summe aller Sollbuchungen muss stets der Summe aller Habenbuchungen entsprechen.
            </span>
          </div>

          <h3>Buchungsregeln nach Kontotyp</h3>
          <div className="booking-rules-grid">
            {(['aktiv', 'passiv', 'aufwand', 'ertrag'] ).map((typ) => (
              <div key={typ} className={`booking-rule-card konto-typ-${typ}`}>
                <div className="rule-header">
                  {typ === 'aktiv' ? 'Aktivkonto' : typ === 'passiv' ? 'Passivkonto' : typ === 'aufwand' ? 'Aufwandskonto' : 'Ertragskonto'}
                  <span className="konto-typ-badge">{typ}</span>
                </div>
                <div className="t-account-mini">
                  <div className="t-side soll">
                    <div className="t-label">Soll</div>
                    <div className="t-regel">{erklaereBuchungsregel(typ, 'soll')}</div>
                  </div>
                  <div className="t-divider" />
                  <div className="t-side haben">
                    <div className="t-label">Haben</div>
                    <div className="t-regel">{erklaereBuchungsregel(typ, 'haben')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: '1.5rem' }}>Kontenrahmen SKR03 (IHK-Auszug)</h3>
          <div className="kontenrahmen-grid">
            {[
              { titel: 'Aktivkonten (Vermögen)', konten: aktivkonten },
              { titel: 'Passivkonten (Schulden)', konten: passivkonten },
              { titel: 'Aufwandskonten (GuV)', konten: aufwandskonten },
              { titel: 'Ertragskonten (GuV)', konten: ertragskonten },
            ].map(({ titel, konten }) => (
              <div key={titel} className="konto-gruppe">
                <div className="konto-gruppe-titel">{titel}</div>
                {konten.map((k) => (
                  <div key={k.id} className="konto-zeile">
                    <span className="konto-id">{k.id}</span>
                    <span className="konto-name">{k.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {aktivesTab === 'ueben' && (
        <div className="bookkeeping-exercise">
          <div className="scenario-list">
            {IHK_SZENARIEN.map((sz) => (
              <button
                key={sz.id}
                className={`scenario-btn${gewaehltesSzenario.id === sz.id ? ' active' : ''}${geloesteAufgaben.has(sz.id) ? ' solved' : ''}`}
                onClick={() => { setGewaehltesSzenario(sz); reset(); }}
              >
                {geloesteAufgaben.has(sz.id) ? <Check size={14} /> : <ChevronRight size={14} />}
                {sz.titel}
              </button>
            ))}
          </div>

          <div className="exercise-panel">
            <div className="scenario-description">
              <h3>{gewaehltesSzenario.titel}</h3>
              <p>{gewaehltesSzenario.beschreibung}</p>
              <div className="betrag-hint">Betrag: <strong>{gewaehltesSzenario.betrag.toLocaleString('de-DE')} €</strong></div>
            </div>

            <div className="buchungssatz-form">
              <div className="buchungssatz-row">
                <div className="buchungssatz-field">
                  <label>Soll-Konto</label>
                  <select value={userSoll} onChange={(e) => setUserSoll(e.target.value)}>
                    <option value="">— Konto wählen —</option>
                    {KONTENRAHMEN.filter((k) => k.id !== '9000' && k.id !== '9100').map((k) => (
                      <option key={k.id} value={k.id}>{k.id} – {k.name}</option>
                    ))}
                  </select>
                  {userSoll && (
                    <div className="konto-typ-hint">
                      Typ: <em>{getKonto(userSoll)?.typ}</em> — {erklaereBuchungsregel(getKonto(userSoll)?.typ, 'soll')}
                    </div>
                  )}
                </div>

                <div className="buchungssatz-separator">an</div>

                <div className="buchungssatz-field">
                  <label>Haben-Konto</label>
                  <select value={userHaben} onChange={(e) => setUserHaben(e.target.value)}>
                    <option value="">— Konto wählen —</option>
                    {KONTENRAHMEN.filter((k) => k.id !== '9000' && k.id !== '9100').map((k) => (
                      <option key={k.id} value={k.id}>{k.id} – {k.name}</option>
                    ))}
                  </select>
                  {userHaben && (
                    <div className="konto-typ-hint">
                      Typ: <em>{getKonto(userHaben)?.typ}</em> — {erklaereBuchungsregel(getKonto(userHaben)?.typ, 'haben')}
                    </div>
                  )}
                </div>
              </div>

              <div className="betrag-row">
                <label>Betrag (€)</label>
                <input
                  type="number"
                  value={userBetrag}
                  onChange={(e) => setUserBetrag(e.target.value)}
                  placeholder="z. B. 5000"
                  min="0"
                />
              </div>

              <div className="exercise-actions">
                <button className="btn-primary" onClick={pruefeAntwort}>Buchungssatz prüfen</button>
                <button className="btn-ghost" onClick={reset}><RotateCcw size={14} /> Zurücksetzen</button>
              </div>

              {feedback && (
                <div className={`feedback-box feedback-${feedback.typ}`}>
                  {feedback.typ === 'korrekt' ? <Check size={16} /> : <X size={16} />}
                  <span>{feedback.text}</span>
                </div>
              )}
            </div>

            <div className="progress-bar-row">
              <span>Fortschritt: {geloesteAufgaben.size}/{IHK_SZENARIEN.length} Buchungssätze gelöst</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(geloesteAufgaben.size / IHK_SZENARIEN.length) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {aktivesTab === 'jahresabschluss' && (
        <div className="jahresabschluss-panel">
          {buchungen.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={48} />
              <p>Löse zuerst Buchungsaufgaben im Tab <strong>Übungen</strong>, um hier den Jahresabschluss zu sehen.</p>
            </div>
          ) : (
            <>
              <div className="guv-bilanz-grid">
                <div className="guv-card">
                  <h3>Gewinn- und Verlustrechnung (GuV)</h3>
                  <div className="guv-row ertraege">
                    <TrendingUp size={16} />
                    <span>Erträge</span>
                    <strong>+ {abschluss.guv.ertraege.toLocaleString('de-DE')} €</strong>
                  </div>
                  <div className="guv-row aufwendungen">
                    <TrendingDown size={16} />
                    <span>Aufwendungen</span>
                    <strong>− {abschluss.guv.aufwendungen.toLocaleString('de-DE')} €</strong>
                  </div>
                  <div className={`guv-row ergebnis ${abschluss.guv.ergebnis >= 0 ? 'gewinn' : 'verlust'}`}>
                    <span>{abschluss.guv.ergebnis >= 0 ? '✓ Jahresgewinn' : '⚠ Jahresverlust'}</span>
                    <strong>{abschluss.guv.ergebnis.toLocaleString('de-DE')} €</strong>
                  </div>
                </div>

                <div className="bilanz-card">
                  <h3>Schlussbilanz (vereinfacht)</h3>
                  <div className="bilanz-row">
                    <div className="bilanz-seite aktiva">
                      <div className="bilanz-titel">AKTIVA</div>
                      <div className="bilanz-betrag">{abschluss.aktiva.toLocaleString('de-DE')} €</div>
                    </div>
                    <div className="bilanz-seite passiva">
                      <div className="bilanz-titel">PASSIVA</div>
                      <div className="bilanz-betrag">{abschluss.passiva.toLocaleString('de-DE')} €</div>
                    </div>
                  </div>
                  <div className={`bilanz-balance ${Math.abs(abschluss.aktiva - abschluss.passiva) < 1 ? 'ausgeglichen' : 'unausgeglichen'}`}>
                    {Math.abs(abschluss.aktiva - abschluss.passiva) < 1 ? '✓ Bilanz ausgeglichen' : '⚠ Bilanz nicht ausgeglichen'}
                  </div>
                </div>
              </div>

              <h3>Gebuchte Buchungssätze</h3>
              <table className="buchungen-table">
                <thead>
                  <tr><th>#</th><th>Beschreibung</th><th>Soll</th><th>Haben</th><th>Betrag</th></tr>
                </thead>
                <tbody>
                  {buchungen.map((b, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{b.beschreibung}</td>
                      <td><span className="konto-chip">{b.soll} {getKonto(b.soll)?.name}</span></td>
                      <td><span className="konto-chip">{b.haben} {getKonto(b.haben)?.name}</span></td>
                      <td className="betrag-cell">{b.betrag.toLocaleString('de-DE')} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
}
