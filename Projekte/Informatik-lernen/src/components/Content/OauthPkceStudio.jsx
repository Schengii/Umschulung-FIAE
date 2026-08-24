import React, { useState } from 'react';
import { Key, Shield, Lock, CheckCircle2, RefreshCw } from 'lucide-react';

export default function OauthPkceStudio({ onRewardXP }) {
  const [step, setStep] = useState(1);
  const [codeVerifier, setCodeVerifier] = useState('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk');
  const [codeChallenge, setCodeChallenge] = useState('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJS5U-9CU');
  const [authCode, setAuthCode] = useState('');
  const [jwtToken, setJwtToken] = useState(null);

  const handleGeneratePkce = () => {
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let verifier = '';
    for (let i = 0; i < 43; i++) {
      verifier += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    setCodeVerifier(verifier);
    setCodeChallenge(`CHALLENGE_${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
    setStep(2);
  };

  const handleAuthorize = () => {
    setAuthCode(`AUTH_CODE_${Math.random().toString(36).substring(2, 12).toUpperCase()}`);
    setStep(3);
  };

  const handleExchangeToken = () => {
    setJwtToken({
      header: { alg: 'RS256', typ: 'JWT', kid: 'key-2026-auth' },
      payload: {
        sub: 'usr_8829102',
        name: 'Alex Developer',
        email: 'alex@devgame.it',
        roles: ['ADMIN', 'DEVELOPER'],
        iss: 'https://auth.devgame.it',
        aud: 'devgame_app',
        exp: Math.floor(Date.now() / 1000) + 3600
      },
      signature: 'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    });
    setStep(4);
    if (onRewardXP) onRewardXP(40);
  };

  const resetFlow = () => {
    setStep(1);
    setAuthCode('');
    setJwtToken(null);
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Key size={14} /> OAuth 2.0 PKCE & OpenID Connect
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            🔐 OAuth2 PKCE & OIDC Identity Flow Studio
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Visuelle Simulation des OAuth2 Proof Key for Code Exchange (PKCE) Flows für Single Page Apps (SPA).
          </p>
        </div>

        <button className="btn btn-secondary" onClick={resetFlow} style={{ gap: '6px' }}>
          <RefreshCw size={16} /> Flow Zurücksetzen
        </button>
      </div>

      {/* Step Progress Tracker */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
        {[
          { num: 1, name: '1. PKCE Key Gen' },
          { num: 2, name: '2. User Auth' },
          { num: 3, name: '3. Token Exchange' },
          { num: 4, name: '4. JWT Claims' }
        ].map((s) => (
          <div
            key={s.num}
            style={{
              flex: 1,
              minWidth: '150px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: step === s.num ? 'var(--accent-primary)' : step > s.num ? 'rgba(16,185,129,0.15)' : 'var(--bg-primary)',
              color: step === s.num ? '#ffffff' : step > s.num ? 'var(--accent-emerald)' : 'var(--text-muted)',
              border: step === s.num ? '2px solid var(--accent-primary)' : step > s.num ? '1px solid var(--accent-emerald)' : '1px solid var(--border-color)',
              fontWeight: '700',
              fontSize: '0.85rem'
            }}
          >
            {s.name}
          </div>
        ))}
      </div>

      {/* Interactive Step Content */}
      <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        {step === 1 && (
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 8px 0' }}>
              Schritt 1: Generiere PKCE Code Verifier & Challenge
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '16px' }}>
              Ein zufälliger `code_verifier` wird generiert und via SHA256 zu einem `code_challenge` gehasht.
            </p>

            <button className="btn btn-primary" onClick={handleGeneratePkce} style={{ gap: '8px' }}>
              <Key size={16} /> Key Pair Generieren
            </button>

            <div style={{ marginTop: '16px', display: 'grid', gap: '8px' }}>
              <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: 'var(--radius-md)', color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                <span style={{ color: '#94a3b8' }}>code_verifier: </span>{codeVerifier}
              </div>
              <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: 'var(--radius-md)', color: '#34d399', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                <span style={{ color: '#94a3b8' }}>code_challenge (SHA256): </span>{codeChallenge}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 8px 0' }}>
              Schritt 2: Benutzer-Autorisierung auf dem Auth-Server
            </h4>
            <div style={{ background: '#0f172a', padding: '12px', borderRadius: 'var(--radius-md)', color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.82rem', marginBottom: '16px', wordBreak: 'break-all' }}>
              https://auth.devgame.it/authorize?response_type=code&client_id=spa_app&code_challenge={codeChallenge}&code_challenge_method=S256
            </div>

            <button className="btn btn-primary" onClick={handleAuthorize} style={{ gap: '8px' }}>
              <Shield size={16} /> Login Bestätigen & Code Erhalten
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 8px 0' }}>
              Schritt 3: Token-Austausch (`/oauth/token`)
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '12px' }}>
              Sende den empfangenen Authorization Code zusammen mit dem geheimen `code_verifier` an den Token Endpoint.
            </p>
            {authCode && (
              <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: 'var(--radius-md)', color: '#fbbf24', fontFamily: 'monospace', fontSize: '0.82rem', marginBottom: '16px' }}>
                <span style={{ color: '#94a3b8' }}>Empfangener Auth-Code: </span>{authCode}
              </div>
            )}

            <button className="btn btn-primary" onClick={handleExchangeToken} style={{ gap: '8px' }}>
              <Lock size={16} /> Access & ID Token Einlösen
            </button>
          </div>
        )}

        {step === 4 && jwtToken && (
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-emerald)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={20} /> PKCE Flow Erfolgreich! Entschlüsseltes JWT ID-Token:
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#0f172a', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #1e293b' }}>
                <div style={{ color: '#ec4899', fontSize: '0.75rem', fontWeight: '800' }}>HEADER (Algorithm):</div>
                <pre style={{ color: '#fbcfe8', fontFamily: 'monospace', margin: '4px 0 0 0', fontSize: '0.85rem' }}>
                  {JSON.stringify(jwtToken.header, null, 2)}
                </pre>
              </div>

              <div style={{ background: '#0f172a', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #1e293b' }}>
                <div style={{ color: '#6366f1', fontSize: '0.75rem', fontWeight: '800' }}>PAYLOAD (User Claims):</div>
                <pre style={{ color: '#a5b4fc', fontFamily: 'monospace', margin: '4px 0 0 0', fontSize: '0.85rem' }}>
                  {JSON.stringify(jwtToken.payload, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
