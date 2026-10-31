import React, { useState } from 'react';

import { Key, ShieldCheck, RefreshCw, CheckCircle2, Lock } from 'lucide-react';
import { JWKS_SETS } from '../../data/cloudArchLabsData';
import { useStore } from '../../store/useStore';

export default function JwksRotationLab() {
  const { awardXP } = useStore();
  const [activeKid, setActiveKid] = useState(JWKS_SETS.currentKeyId);
  const [isRotated, setIsRotated] = useState(false);
  const [isValidated, setIsValidated] = useState(false);

  const handleRotateKey = () => {
    if (isRotated) return;
    setIsRotated(true);
    setActiveKid('key-2027-future-v3');
    awardXP(75, 'Security Architect: OAuth2 JWKS Key Rotation');
  };

  const handleValidateJwt = () => {
    setIsValidated(true);
  };

  return (
    <div className="lab-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(168, 85, 247, 0.15)', borderRadius: '20px', color: 'var(--accent-purple)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
            <Key size={16} /> OpenID Connect & Asymmetric Token Verification (RS256)
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            OAuth2 JWKS Key Rotation & RS256 Studio
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Erlebe Zero-Downtime Key Rotation: Wie Resource Server asymmetrische JWTs über `/.well-known/jwks.json` validieren.
          </p>
        </div>

        <button
          onClick={handleRotateKey}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            background: 'linear-gradient(90deg, #9333ea, #c084fc)',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '0.88rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(147, 51, 234, 0.35)'
          }}
        >
          <RefreshCw size={16} /> Schlüsselpaar Rotieren (Rotate Key)
        </button>
      </div>

      {/* Grid: JWKS Set & Decoded JWT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(420px, 100%), 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Left: JWKS JSON Set */}
        <div style={{ background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.3)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: 'rgba(168, 85, 247, 0.15)', borderBottom: '1px solid rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--accent-purple)', fontWeight: 'bold', fontSize: '0.88rem' }}>GET /.well-known/jwks.json</span>
            <span style={{ fontSize: '0.75rem', background: 'var(--accent-purple)', color: 'var(--text-on-accent)', padding: '2px 8px', borderRadius: '4px' }}>PUBLIC KEYS</span>
          </div>

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {JWKS_SETS.keys.map(k => (
              <div key={k.kid} style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px', border: k.kid === activeKid ? '1px solid #c084fc' : '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: 'var(--accent-purple)', fontFamily: 'monospace', fontSize: '0.88rem' }}>kid: "{k.kid}"</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)' }}>alg: {k.alg}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Status: {k.status}</div>
              </div>
            ))}
            {isRotated && (
              <div style={{ background: 'rgba(34, 197, 94, 0.15)', padding: '12px', borderRadius: '8px', border: '1px solid #22c55e' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: 'var(--accent-emerald)', fontFamily: 'monospace', fontSize: '0.88rem' }}>kid: "key-2027-future-v3"</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>NEU AKTIV</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>Status: ACTIVE (Neuer privater RSA-Key rotiert)</div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Decoded JWT Token */}
        <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, var(--border-color))', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                <Lock size={17} color="var(--accent-amber)" /> Bearer JWT Payload & Signature Check
              </div>
              <span style={{ fontSize: '0.75rem', background: 'var(--accent-emerald)', color: 'var(--text-on-accent)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                RS256 SIGNED
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: 'Fira Code, monospace', fontSize: '0.82rem' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <div style={{ color: 'var(--accent-rose)', fontWeight: 'bold' }}>// 1. Header (enthält kid für JWKS Matching)</div>
                <div style={{ color: 'var(--accent-rose)' }}>{JSON.stringify(JWKS_SETS.sampleJwt.header)}</div>
              </div>

              <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                <div style={{ color: 'var(--accent-purple)', fontWeight: 'bold' }}>// 2. Claims Payload</div>
                <div style={{ color: 'var(--accent-purple)' }}>{JSON.stringify(JWKS_SETS.sampleJwt.payload)}</div>
              </div>

              <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                <div style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>// 3. RSA Signature (Geprüft mit Public Key)</div>
                <div style={{ color: 'var(--accent-cyan)' }}>{JWKS_SETS.sampleJwt.signature}</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleValidateJwt}
            style={{
              marginTop: '16px',
              padding: '12px',
              borderRadius: '8px',
              background: isValidated ? 'var(--accent-emerald)' : 'var(--accent-primary)',
              color: 'var(--text-on-accent)',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isValidated ? <CheckCircle2 size={16} /> : <ShieldCheck size={16} />}
            {isValidated ? 'Signatur & kid erfolgreich validiert (200 OK)' : 'JWT Signatur mit JWKS prüfen'}
          </button>
        </div>

      </div>
    </div>
  );
}
