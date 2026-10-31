import React, { useState } from 'react';
import {
  Globe,
  Key,
  ShieldCheck,
  RefreshCw,
  Award,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import {
  initZoneRollover,
  advanceRolloverStep
} from '../../utils/dnssecRolloverEngine';
import { useStore } from '../../store/useStore';

export default function DnssecRolloverLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [completed, setCompleted] = useState(false);

  const [method, setMethod] = useState(/** @type {'ZSK_PRE_PUBLISH' | 'KSK_DOUBLE_DS'} */ ('ZSK_PRE_PUBLISH'));
  const [state, setState] = useState(() => initZoneRollover('informatik-lernen.de', 'ZSK_PRE_PUBLISH'));

  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
    setState(initZoneRollover('informatik-lernen.de', newMethod));
  };

  const handleNextStep = () => {
    const next = advanceRolloverStep(state);
    setState(next);

    if (next.currentPhase === 'COMPLETED' && !completed) {
      setCompleted(true);
      if (onRewardXP) onRewardXP(65);
      else awardXP(65, 'dnssec_rollover_master');
    }
  };

  const handleReset = () => {
    setState(initZoneRollover('informatik-lernen.de', method));
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px', border: '2px solid var(--accent-indigo)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Globe size={14} /> DNS &amp; Netzwerksicherheit
              </span>
              <span className="badge badge-teal" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Key size={14} /> RFC 6781 DNSSEC Rollover
              </span>
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: '800', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={28} style={{ color: 'var(--accent-indigo)' }} />
              DNSSEC KSK &amp; ZSK Key Rollover Simulator
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px', maxWidth: '820px' }}>
              Schrittweise Simulation kryptografischer Schlüsselwechsel ohne Ausfallzeiten: <strong>ZSK Pre-Publish</strong> (Resolver-Caching vor Signaturwechsel) 
              und <strong>KSK Double-DS</strong> (Synchronisation mit der Parent-Registry via DS-Records) nach RFC 6781.
            </p>
          </div>

          <div>
            {completed && (
              <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Award size={16} /> +65 XP erhalten
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Workflow Controller & Keyring Inspector */}
      <div className="grid-responsive" style={{ gap: '20px', marginBottom: '24px' }}>
        {/* Left: Workflow Controller */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={18} style={{ color: 'var(--accent-teal)' }} /> Rollover-Verfahren &amp; Schritt-Steuerung
          </h2>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Rollover-Methode:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleMethodChange('ZSK_PRE_PUBLISH')}
                className={`btn ${method === 'ZSK_PRE_PUBLISH' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
              >
                ZSK Pre-Publish (Zone Key)
              </button>
              <button
                onClick={() => handleMethodChange('KSK_DOUBLE_DS')}
                className={`btn ${method === 'KSK_DOUBLE_DS' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
              >
                KSK Double-DS (Parent Registry)
              </button>
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aktuelle Phase:</span>
              <span className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>{state.currentPhase}</span>
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
              {state.statusMessage}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Clock size={14} /> Simulierte Zeit seit Start: <strong>{state.simulatedElapsedHours} Stunden</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {state.currentPhase !== 'COMPLETED' ? (
              <button
                onClick={handleNextStep}
                className="btn btn-primary"
                style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px', fontWeight: '700' }}
              >
                <ArrowRight size={18} /> Nächsten Rollover-Schritt ausführen
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="btn btn-secondary"
                style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px' }}
              >
                <RefreshCw size={18} /> Rollover neu starten
              </button>
            )}
          </div>
        </div>

        {/* Right: DNSSEC Chain Status */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} style={{ color: 'var(--accent-emerald)' }} /> DNSSEC Vertrauenskette (Chain of Trust)
          </h2>

          <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid var(--accent-emerald)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <CheckCircle size={20} style={{ color: 'var(--accent-emerald)' }} />
              <strong style={{ color: 'var(--accent-emerald)', fontSize: '0.95rem' }}>Status: RRSIG-Signaturen lückenlos valide</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
              Keine BOGUS- oder SERVFAIL-Antworten bei rekursiven DNS-Resolvern. 
              {method === 'ZSK_PRE_PUBLISH'
                ? ' Der neue ZSK wurde vor der Signierung im Cache verteilt.'
                : ' Der neue KSK wurde mit Double-DS in der Registry verankert.'}
            </p>
          </div>

          <h3 style={{ fontSize: '0.92rem', fontWeight: '700', marginBottom: '10px' }}>Aktive Schlüssel in der Zone:</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {state.activeKeys.map(k => (
              <div key={k.id} style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Key size={14} style={{ color: k.type === 'KSK' ? 'var(--accent-rose)' : 'var(--accent-teal)' }} />
                    <span style={{ fontWeight: '700', fontSize: '0.88rem' }}>{k.type} (Tag: {k.keyTag})</span>
                  </div>
                  <span className={`badge ${k.state === 'ACTIVE_SIGNING' ? 'badge-emerald' : k.state === 'PUBLISHED' ? 'badge-amber' : 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>
                    {k.state}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  Alg: {k.algorithm} (13) | TTL: {k.ttl}s
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
