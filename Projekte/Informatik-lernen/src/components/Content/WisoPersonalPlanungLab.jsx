import React, { useState } from 'react';
import {
  calculatePersonalbedarf,
  calculateHrMetrics
} from '../../utils/wisoPersonalPlanungEngine';
import {
  Users,
  Award,
  Activity,
  Calculator
} from 'lucide-react';

export default function WisoPersonalPlanungLab({ onRewardXP }) {
  // Personalbedarf State
  const [einsatzbedarf, setEinsatzbedarf] = useState(25);
  const [reservebedarfProzent, setReservebedarfProzent] = useState(12);
  const [aktuellerBestand, setAktuellerBestand] = useState(28);
  const [feststehendeAbgaenge, setFeststehendeAbgaenge] = useState(4);
  const [feststehendeZugaenge, setFeststehendeZugaenge] = useState(2);

  // HR Kennzahlen State
  const [abgaenge, setAbgaenge] = useState(6);
  const [anfangsbestand, setAnfangsbestand] = useState(60);
  const [endbestand, setEndbestand] = useState(58);
  const [zugaenge, setZugaenge] = useState(4);
  const krankheitstage = 150;
  const sollArbeitstage = 2500;

  const [isCompleted, setIsCompleted] = useState(false);

  const bedarfResult = calculatePersonalbedarf({
    einsatzbedarf,
    reservebedarfProzent,
    aktuellerBestand,
    feststehendeAbgaenge,
    feststehendeZugaenge
  });

  const hrMetrics = calculateHrMetrics({
    abgaenge,
    anfangsbestand,
    endbestand,
    zugaenge,
    krankheitstageGesamt: krankheitstage,
    sollArbeitstageGesamt: sollArbeitstage
  });

  const handleFinish = () => {
    if (!isCompleted) {
      setIsCompleted(true);
      if (onRewardXP) onRewardXP(60);
    }
  };

  return (
    <div className="lab-container animate-fade-in" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="badge badge-teal" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Users size={14} /> IHK WISO Personalplanung
            </span>
            <span className="badge badge-indigo">Brutto/Netto-Bedarf & HR-KPIs</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            Personalbedarfsermittlung & HR-Kennzahlen Studio
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Ermittle Brutto- und Netto-Personalbedarf nach IHK-Standard sowie Fluktuationsraten (ZVEI vs. BDA) und Krankenquote.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleFinish}
          disabled={isCompleted}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Award size={18} />
          {isCompleted ? 'Abgeschlossen (+60 XP)' : 'Labor abschließen (+60 XP)'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Modul 1: Personalbedarfsrechner */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator size={18} color="var(--accent-teal)" /> 1. Personalbedarfsermittlung
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Einsatzbedarf (Stellen zur Aufgabenerfüllung): <strong>{einsatzbedarf} VK</strong>
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={einsatzbedarf}
                onChange={(e) => setEinsatzbedarf(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Reservebedarf (% für Urlaub, Krankheit): <strong>{reservebedarfProzent}% ({bedarfResult.reservebedarf} VK)</strong>
              </label>
              <input
                type="range"
                min="0"
                max="30"
                value={reservebedarfProzent}
                onChange={(e) => setReservebedarfProzent(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Aktueller Personalbestand: <strong>{aktuellerBestand} MA</strong>
              </label>
              <input
                type="range"
                min="5"
                max="60"
                value={aktuellerBestand}
                onChange={(e) => setAktuellerBestand(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Abgänge (-):</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={feststehendeAbgaenge}
                  onChange={(e) => setFeststehendeAbgaenge(Number(e.target.value))}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Zugänge (+):</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={feststehendeZugaenge}
                  onChange={(e) => setFeststehendeZugaenge(Number(e.target.value))}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                />
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px', lineHeight: '1.6', fontSize: '0.88rem' }}>
            <div>Brutto-Bedarf = {einsatzbedarf} + {bedarfResult.reservebedarf} = <strong>{bedarfResult.bruttoPersonalbedarf} VK</strong></div>
            <div>Zukünftiger Bestand = {aktuellerBestand} - {feststehendeAbgaenge} + {feststehendeZugaenge} = <strong>{bedarfResult.zukuenftigerPersonalbestand} VK</strong></div>
            <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <strong>Netto-Personalbedarf:</strong>{' '}
              <span className={`badge ${bedarfResult.nettoPersonalbedarf > 0 ? 'badge-amber' : bedarfResult.nettoPersonalbedarf < 0 ? 'badge-rose' : 'badge-teal'}`}>
                {bedarfResult.nettoPersonalbedarf > 0 ? `+${bedarfResult.nettoPersonalbedarf} (${bedarfResult.actionType})` : bedarfResult.nettoPersonalbedarf < 0 ? `${bedarfResult.nettoPersonalbedarf} (${bedarfResult.actionType})` : '0 (Ausgeglichen)'}
              </span>
            </div>
          </div>
        </div>

        {/* Modul 2: HR Kennzahlen (Fluktuation & Krankheit) */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--accent-amber)" /> 2. HR Kennzahlen (Fluktuation & Quote)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Anfangsbestand:</label>
              <input
                type="number"
                value={anfangsbestand}
                onChange={(e) => setAnfangsbestand(Number(e.target.value))}
                style={{ width: '100%', padding: '6px', borderRadius: '4px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Endbestand:</label>
              <input
                type="number"
                value={endbestand}
                onChange={(e) => setEndbestand(Number(e.target.value))}
                style={{ width: '100%', padding: '6px', borderRadius: '4px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Abgänge im Jahr:</label>
              <input
                type="number"
                value={abgaenge}
                onChange={(e) => setAbgaenge(Number(e.target.value))}
                style={{ width: '100%', padding: '6px', borderRadius: '4px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Zugänge im Jahr:</label>
              <input
                type="number"
                value={zugaenge}
                onChange={(e) => setZugaenge(Number(e.target.value))}
                style={{ width: '100%', padding: '6px', borderRadius: '4px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px', fontSize: '0.88rem' }}>
            <div>
              <strong>Fluktuationsrate (ZVEI-Formel):</strong>{' '}
              <span style={{ color: 'var(--accent-teal)', fontWeight: 'bold' }}>{hrMetrics.fluktuationZveiPercent}%</span>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Abgänge / Ø-Bestand ({hrMetrics.durchschnittsbestand})</div>
            </div>
            <div>
              <strong>Fluktuationsrate (BDA-Formel):</strong>{' '}
              <span style={{ color: 'var(--accent-indigo)', fontWeight: 'bold' }}>{hrMetrics.fluktuationBdaPercent}%</span>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Abgänge / (Anfangsbestand + Zugänge)</div>
            </div>
            <div style={{ paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <strong>Krankenquote:</strong>{' '}
              <span style={{ color: 'var(--accent-amber)', fontWeight: 'bold' }}>{hrMetrics.krankenquotePercent}%</span>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{krankheitstage} Krankheitstage / {sollArbeitstage} Solltage</div>
            </div>
          </div>
        </div>
      </div>

      {/* IHK Wissen */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={18} color="var(--accent-teal)" /> IHK AP2 WISO Prüfungswissen
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          <div>
            <strong style={{ color: 'var(--text-main)' }}>Brutto- vs. Netto-Bedarf:</strong>
            <p style={{ margin: '4px 0 0' }}>Der Bruttobedarf beziffert, wie viele Personen zur Erfüllung aller Aufgaben inkl. Vertretung nötig sind. Der Nettobedarf bestimmt die konkreten Personalmaßnahmen (Einstellung oder Freisetzung).</p>
          </div>
          <div>
            <strong style={{ color: 'var(--text-main)' }}>ZVEI vs. BDA Fluktuation:</strong>
            <p style={{ margin: '4px 0 0' }}>Die ZVEI-Formel bezieht sich auf den statistischen Durchschnittsbestand, die BDA-Formel auf das gesamte Personalvolumen der Periode (Anfangsbestand + Zugänge).</p>
          </div>
          <div>
            <strong style={{ color: 'var(--text-main)' }}>Interne vs. Externe Beschaffung:</strong>
            <p style={{ margin: '4px 0 0' }}>Intern: Schnelle Einarbeitung, Betriebsklima, aber "Betriebsblindheit". Extern: Neues Know-how, aber höhere Kosten und Risiko von Fehlbesetzungen.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
