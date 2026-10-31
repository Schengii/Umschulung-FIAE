import React, { useState, useMemo } from 'react';
import { KeyRound, Award, ShieldAlert, ShieldCheck, Bug } from 'lucide-react';
import {
  decodeJwt,
  forgeAlgNoneToken,
  verifyAlgNoneDefense,
  bruteForceWeakSecret,
  evaluateKidInjection
} from '../../utils/jwtAttackEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

const SAMPLE_TOKEN = (() => {
  const b64 = (obj) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: 'user_42', role: 'user', iat: 1700000000 })}.dGhpc19pc19hX2Zha2Vfc2ln`;
})();

export default function JwtAttackLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [tab, setTab] = useState('alg_none'); // 'alg_none' | 'weak_secret' | 'kid_injection'
  const [xpClaimed, setXpClaimed] = useState(false);

  // alg:none state
  const [defenseEnabled, setDefenseEnabled] = useState(true);
  const decodedOriginal = useMemo(() => decodeJwt(SAMPLE_TOKEN), []);
  const forged = useMemo(() => forgeAlgNoneToken(SAMPLE_TOKEN, { role: 'admin' }), []);
  const algNoneVerdict = useMemo(
    () => verifyAlgNoneDefense(forged.forgedToken, { rejectAlgNone: defenseEnabled }),
    [forged, defenseEnabled]
  );

  // weak secret state
  const [actualSecret, setActualSecret] = useState('secret');
  const crackResult = useMemo(() => bruteForceWeakSecret(actualSecret), [actualSecret]);

  // kid injection state
  const [kidValue, setKidValue] = useState('../../dev/null');
  const [kidSanitized, setKidSanitized] = useState(true);
  const kidVerdict = useMemo(() => evaluateKidInjection(kidValue, { sanitizesKid: kidSanitized }), [kidValue, kidSanitized]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!xpClaimed) {
      setXpClaimed(true);
      if (onRewardXP) {
        onRewardXP(50);
      } else {
        awardXP(50, 'jwt_attack_defender');
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
              <ShieldAlert size={14} /> OWASP / API Security
            </span>
            <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <KeyRound size={14} /> JWT Angriffs- & Verteidigungs-Sandbox
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            🔑 JWT Sicherheitslücken Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Untersuche drei klassische JWT-Implementierungsfehler — "alg: none" Fälschung, schwache HMAC-Secrets und kid-Header-Injection — und lerne die jeweils korrekte serverseitige Absicherung.
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          disabled={xpClaimed}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> {xpClaimed ? 'XP gesichert!' : 'JWT-Sicherheit Bestätigen (+50 XP)'}
        </button>
      </div>

      {/* Mode Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => { setTab('alg_none'); triggerHaptic('SELECTION'); }}
          className={`btn ${tab === 'alg_none' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px' }}
        >
          1. "alg: none" Fälschung
        </button>
        <button
          onClick={() => { setTab('weak_secret'); triggerHaptic('SELECTION'); }}
          className={`btn ${tab === 'weak_secret' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px' }}
        >
          2. Schwaches HMAC-Secret
        </button>
        <button
          onClick={() => { setTab('kid_injection'); triggerHaptic('SELECTION'); }}
          className={`btn ${tab === 'kid_injection' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px' }}
        >
          3. kid-Header Injection
        </button>
      </div>

      {tab === 'alg_none' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
              Original-Token (Payload):
            </span>
            <pre style={{ margin: '0 0 14px 0', padding: '12px', background: '#090d16', color: '#38bdf8', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.78rem', overflowX: 'auto' }}>
{JSON.stringify(decodedOriginal.payload, null, 2)}
            </pre>

            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-rose)', display: 'block', marginBottom: '10px' }}>
              Gefälschtes Token (role → admin, unsigniert):
            </span>
            <pre style={{ margin: 0, padding: '12px', background: '#090d16', color: '#f87171', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.78rem', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
{JSON.stringify(forged.forgedPayload, null, 2)}
            </pre>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Server-Verteidigung (Algorithmus-Allowlist):</label>
              <button
                onClick={() => setDefenseEnabled(!defenseEnabled)}
                className={`btn ${defenseEnabled ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 12px', fontSize: '0.75rem' }}
              >
                {defenseEnabled ? 'AKTIV' : 'DEAKTIVIERT'}
              </button>
            </div>

            <div style={{
              padding: '16px', borderRadius: '10px',
              background: algNoneVerdict.accepted ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              border: `1px solid ${algNoneVerdict.accepted ? '#ef4444' : '#10b981'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: algNoneVerdict.accepted ? '#ef4444' : '#10b981', marginBottom: '6px' }}>
                {algNoneVerdict.accepted ? <Bug size={16} /> : <ShieldCheck size={16} />}
                {algNoneVerdict.accepted ? 'Angriff erfolgreich!' : 'Angriff blockiert'}
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)' }}>{algNoneVerdict.reason}</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'weak_secret' && (
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Tatsächliches Server-Secret (probiere z. B. "secret" oder ein starkes Secret):
          </label>
          <input
            type="text"
            value={actualSecret}
            onChange={(e) => setActualSecret(e.target.value)}
            style={{ width: '100%', maxWidth: '400px', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.85rem', marginBottom: '16px' }}
          />

          <div style={{
            padding: '16px', borderRadius: '10px', marginBottom: '16px',
            background: crackResult.cracked ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            border: `1px solid ${crackResult.cracked ? '#ef4444' : '#10b981'}`
          }}>
            <div style={{ fontWeight: 'bold', color: crackResult.cracked ? '#ef4444' : '#10b981' }}>
              {crackResult.cracked ? `❌ Secret geknackt: "${crackResult.secret}" (Wordlist-Treffer)` : '✅ Secret nicht in gängiger Wordlist gefunden'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
            {crackResult.attempts.map((a, idx) => (
              <div key={idx} style={{ color: a.matched ? '#ef4444' : 'var(--text-muted)' }}>
                {a.matched ? '✓' : '✗'} Versuch: "{a.candidate}"
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'kid_injection' && (
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            "kid" Header-Wert (probiere Pfad-Traversal wie "../../dev/null"):
          </label>
          <input
            type="text"
            value={kidValue}
            onChange={(e) => setKidValue(e.target.value)}
            style={{ width: '100%', maxWidth: '400px', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.85rem', fontFamily: 'monospace', marginBottom: '12px' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Server sanitisiert kid (Allowlist):</label>
            <button
              onClick={() => setKidSanitized(!kidSanitized)}
              className={`btn ${kidSanitized ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 12px', fontSize: '0.75rem' }}
            >
              {kidSanitized ? 'AKTIV' : 'DEAKTIVIERT'}
            </button>
          </div>

          <div style={{
            padding: '16px', borderRadius: '10px',
            background: kidVerdict.vulnerable ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            border: `1px solid ${kidVerdict.vulnerable ? '#ef4444' : '#10b981'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: kidVerdict.vulnerable ? '#ef4444' : '#10b981', marginBottom: '6px' }}>
              {kidVerdict.vulnerable ? <Bug size={16} /> : <ShieldCheck size={16} />}
              {kidVerdict.vulnerable ? 'Verwundbar' : 'Abgesichert'}
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)' }}>{kidVerdict.reason}</p>
          </div>
        </div>
      )}
    </div>
  );
}
