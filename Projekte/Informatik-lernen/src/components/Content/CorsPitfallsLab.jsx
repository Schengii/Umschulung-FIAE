import React, { useState, useMemo } from 'react';
import { Globe2, Award, ShieldAlert, ShieldCheck, Bug } from 'lucide-react';
import { evaluateCorsRequest, CORS_SCENARIOS } from '../../utils/corsEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function CorsPitfallsLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [serverConfig, setServerConfig] = useState('reflect_wildcard');
  const [requestOrigin, setRequestOrigin] = useState('https://evil-attacker.com');
  const [withCredentials, setWithCredentials] = useState(true);
  const [xpClaimed, setXpClaimed] = useState(false);

  const result = useMemo(
    () => evaluateCorsRequest({ requestOrigin, serverConfig, withCredentials }),
    [requestOrigin, serverConfig, withCredentials]
  );

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!xpClaimed) {
      setXpClaimed(true);
      if (onRewardXP) {
        onRewardXP(40);
      } else {
        awardXP(40, 'cors_defender');
      }
    }
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-rose" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={14} /> Web-Sicherheit
            </span>
            <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Globe2 size={14} /> CORS Fallstricke Sandbox
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            🌐 CORS Fehlkonfigurationen Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Simuliere, wie ein Browser einen Cross-Origin-Request auswertet, und finde die drei häufigsten CORS-Fehlkonfigurationen: Origin-Reflection, laxe Regex-Allowlists und den verbotenen Wildcard+Credentials-Konflikt.
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          disabled={xpClaimed}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> {xpClaimed ? 'XP gesichert!' : 'CORS-Analyse Bestätigen (+40 XP)'}
        </button>
      </div>

      {/* Config */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Server CORS-Strategie:
            </label>
            <select
              value={serverConfig}
              onChange={(e) => setServerConfig(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.85rem' }}
            >
              {CORS_SCENARIOS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Anfragender Origin (Angreiferseite):
            </label>
            <input
              type="text"
              value={requestOrigin}
              onChange={(e) => setRequestOrigin(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.85rem', fontFamily: 'monospace' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={() => setWithCredentials(!withCredentials)}
              className={`btn ${withCredentials ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 14px', fontSize: '0.8rem', width: '100%' }}
            >
              fetch(..., {'{'} credentials: {withCredentials ? "'include'" : "'omit'"} {'}'})
            </button>
          </div>
        </div>
      </div>

      {/* Result */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
            HTTP-Response-Header (vom Server gesendet):
          </span>
          <pre style={{ margin: 0, padding: '12px', background: '#090d16', color: '#38bdf8', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: '1.6', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
Access-Control-Allow-Origin: {result.allowOriginHeader ?? '(nicht gesetzt)'}
Access-Control-Allow-Credentials: {String(result.allowCredentialsHeader)}
          </pre>

          <p style={{ marginTop: '14px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            {result.serverExplanation}
          </p>

          {result.isWildcardCredentialConflict && (
            <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid #f59e0b', borderRadius: '8px', fontSize: '0.8rem', color: '#f59e0b' }}>
              ⚠️ Verbotene Kombination: <code>Access-Control-Allow-Origin: *</code> zusammen mit <code>Access-Control-Allow-Credentials: true</code> ist laut Fetch-Spezifikation nicht erlaubt — Browser blockieren dies immer.
            </div>
          )}
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
            Browser-Entscheidung:
          </span>

          <div style={{
            padding: '16px', borderRadius: '10px',
            background: result.browserAllows ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            border: `1px solid ${result.browserAllows ? '#ef4444' : '#10b981'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: result.browserAllows ? '#ef4444' : '#10b981', marginBottom: '6px' }}>
              {result.browserAllows ? <Bug size={16} /> : <ShieldCheck size={16} />}
              {result.browserAllows ? 'Response lesbar für den Angreifer' : 'Response blockiert'}
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)' }}>{result.verdict}</p>
          </div>

          <p style={{ marginTop: '14px', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            💡 Wichtig: CORS schützt nicht davor, dass der Request überhaupt gesendet wird (das tut z. B. ein CSRF-Token) — es verhindert nur, dass JavaScript auf der fremden Seite die <strong>Antwort lesen</strong> kann.
          </p>
        </div>
      </div>
    </div>
  );
}
