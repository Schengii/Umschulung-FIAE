import React, { useState } from 'react';
import {
  evaluateDefectNoticeDeadline,
  evaluateBuyerRights
} from '../../utils/wisoContractBreachEngine';
import {
  Scale,
  AlertOctagon,
  Award,
  FileCheck,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';

export default function WisoContractBreachLab({ onRewardXP }) {
  const [partyType, setPartyType] = useState('b2b'); // 'b2b' | 'b2c'
  const [defectType, setDefectType] = useState('offen'); // 'offen' | 'versteckt' | 'arglistig'
  const [failedRepairAttempts, setFailedRepairAttempts] = useState(0);
  const [sellerRefused, setSellerRefused] = useState(false);
  const [deadlineExpired, setDeadlineExpired] = useState(false);
  const [isImmaterialDefect, setIsImmaterialDefect] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const noticeResult = evaluateDefectNoticeDeadline(partyType, defectType);
  const rightsResult = evaluateBuyerRights({
    failedRepairAttempts,
    sellerRefused,
    deadlineExpired,
    isImmaterialDefect
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
              <Scale size={14} /> IHK WISO Kaufvertragsstörungen
            </span>
            <span className="badge badge-amber">BGB §§ 433–441 & HGB § 377</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            Kaufvertragsstörungen & Sachmängelhaftung Studio
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Prüfe gesetzliche Rügefristen (HGB § 377 vs. BGB), den Vorrang der Nacherfüllung und nachrangige Käuferrechte.
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Fall-Konfiguration */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertOctagon size={18} color="var(--accent-amber)" /> Fall-Konfiguration
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Vertragsparteien:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className={`btn ${partyType === 'b2b' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPartyType('b2b')}
                style={{ flex: 1, fontSize: '0.85rem' }}
              >
                B2B (Handelskauf)
              </button>
              <button
                className={`btn ${partyType === 'b2c' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPartyType('b2c')}
                style={{ flex: 1, fontSize: '0.85rem' }}
              >
                B2C (Verbraucher)
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Art des Mangels:
            </label>
            <select
              className="input-select"
              value={defectType}
              onChange={(e) => setDefectType(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
            >
              <option value="offen">Offener Mangel (sofort bei Sichtprüfung erkennbar)</option>
              <option value="versteckt">Versteckter Mangel (erst bei Nutzung bemerkbar)</option>
              <option value="arglistig">Arglistig verschwiegener Mangel (Täuschung durch Verkäufer)</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Fehlgeschlagene Nachbesserungsversuche: <strong>{failedRepairAttempts}</strong>
            </label>
            <input
              type="range"
              min="0"
              max="3"
              value={failedRepairAttempts}
              onChange={(e) => setFailedRepairAttempts(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
              <input
                type="checkbox"
                checked={sellerRefused}
                onChange={(e) => setSellerRefused(e.target.checked)}
              />
              <span>Verkäufer verweigert Nacherfüllung ernsthaft</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
              <input
                type="checkbox"
                checked={deadlineExpired}
                onChange={(e) => setDeadlineExpired(e.target.checked)}
              />
              <span>Gesetzte Frist zur Nacherfüllung fruchtlos verstrichen</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
              <input
                type="checkbox"
                checked={isImmaterialDefect}
                onChange={(e) => setIsImmaterialDefect(e.target.checked)}
              />
              <span>Unerheblicher Bagatellmangel (z. B. winziger Kratzer)</span>
            </label>
          </div>
        </div>

        {/* Rechtliche Bewertung */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck size={18} color="var(--accent-teal)" /> Rügefristen & Rechtsfolgen
          </h3>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px', marginBottom: '16px', lineHeight: '1.6', fontSize: '0.9rem' }}>
            <div><strong>Rechtsgrundlage:</strong> <span className="badge badge-indigo">{noticeResult.legalBasis}</span></div>
            <div style={{ marginTop: '6px' }}><strong>Gesetzliche Rügefrist:</strong></div>
            <div style={{ color: 'var(--text-main)', marginTop: '2px' }}>{noticeResult.duePeriodText}</div>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {noticeResult.lossOfWarrantyOnDelay ? (
                <span style={{ color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <XCircle size={15} /> Versäumnis führt zum vollständigen Verlust der Gewährleistung!
                </span>
              ) : (
                <span style={{ color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={15} /> Keine Rügepflicht / Schutz vor Verlust der Ansprüche.
                </span>
              )}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--accent-teal)' }}>
              1. Vorrangige Rechte (§ 439 BGB):
            </h4>
            <ul style={{ margin: '0 0 14px', paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {rightsResult.primaryRights.map((r, i) => <li key={i}>{r}</li>)}
            </ul>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 8px', color: rightsResult.secondaryRights.length > 0 ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
              2. Nachrangige Rechte (Sekundärrechte):
            </h4>
            {rightsResult.secondaryRights.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                {rightsResult.secondaryRights.map((r, i) => <li key={i}><strong>{r}</strong></li>)}
              </ul>
            ) : (
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Gesperrt! Nacherfüllung hat Vorrang, bis Frist abgelaufen oder 2 Reparaturversuche fehlgeschlagen sind.
              </p>
            )}

            <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--accent-amber)', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px' }}>
              {rightsResult.explanation}
            </p>
          </div>
        </div>
      </div>

      {/* IHK Wissen Box */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={18} color="var(--accent-teal)" /> IHK AP2 WISO Kernregeln
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          <div>
            <strong style={{ color: 'var(--text-main)' }}>HGB § 377 (Handelskauf B2B):</strong>
            <p style={{ margin: '4px 0 0' }}>Kaufleute müssen gelieferte Ware unverzüglich untersuchen und offene Mängel sofort rügen. Andernfalls gilt die Ware als genehmigt!</p>
          </div>
          <div>
            <strong style={{ color: 'var(--text-main)' }}>BGB § 440 (Zweimalige Nachbesserung):</strong>
            <p style={{ margin: '4px 0 0' }}>Eine Nachbesserung gilt nach dem erfolglosen zweiten Versuch als fehlgeschlagen, es sei denn, die Art der Sache erfordert mehr Versuche.</p>
          </div>
          <div>
            <strong style={{ color: 'var(--text-main)' }}>Unerheblicher Mangel (§ 323 Abs. 5 BGB):</strong>
            <p style={{ margin: '4px 0 0' }}>Bei geringfügigen optischen Mängeln ist der Rücktritt vom Vertrag ausgeschlossen. Der Käufer kann nur den Preis mindern.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
