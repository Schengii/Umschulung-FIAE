import React, { useState, useMemo } from 'react';
import { Lock, Key, CheckCircle2, RefreshCw, Award, ArrowRight } from 'lucide-react';
import {
  validateAuthRequest,
  parseAndValidateJwt,
  simulateTokenRotation,
  OAUTH_OIDC_DRILL_QUESTIONS
} from '../../utils/oauthOidcEngine';
import LabDrillSection from '../Shared/LabDrillSection';
import SourceList from '../Shared/SourceList';

const INITIAL_JWT = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImF1dGgta2V5LTEifQ.eyJzdWIiOiJ1c2VyXzk4Mjc0MSIsIm5hbWUiOiJBbGV4IFNjaG1pZHQiLCJlbWFpbCI6ImFsZXhAZGV2Z2FtZS5kZSIsInJvbGVzIjpbImF6dWJpIiwiZGV2ZWxvcGVyIl0sImlzcyI6Imh0dHBzOi8vYXV0aC5pbmZvcm1hdGlrLWxlcm5lbi5kZSIsImF1ZCI6ImFwaS5pbmZvcm1hdGlrLWxlcm5lbi5kZSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDgwMDAwMDAwfQ.simulated_rsa_signature_verification_ok`;

const SOURCES = [
  { title: 'RFC 6749 – The OAuth 2.0 Authorization Framework', url: 'https://datatracker.ietf.org/doc/html/rfc6749', note: 'Rollen: Client, Resource Owner, Authorization Server, Resource Server' },
  { title: 'RFC 7636 – Proof Key for Code Exchange (PKCE)', url: 'https://datatracker.ietf.org/doc/html/rfc7636', note: 'Schutz vor Authorization Code Interception für Public Clients' },
  { title: 'OpenID Connect Core 1.0', url: 'https://openid.net/specs/openid-connect-core-1_0.html', note: 'ID Token, UserInfo Endpoint und Standard-Scopes (openid, profile, email)' },
  { title: 'OAuth 2.0 Security Best Current Practice', url: 'https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics', note: 'Empfehlung: Verbot des Implicit Flows, verpflichtendes PKCE, Token-Rotation' }
];

export default function OauthOidcLab({ onRewardXP }) {
  const [activeTab, setActiveTab] = useState('authRequest');
  const [xpClaimed, setXpClaimed] = useState(false);

  // Tab 1: Auth Request
  const [authParams, setAuthParams] = useState({
    response_type: 'code',
    client_id: 'spa-student-portal',
    redirect_uri: 'https://informatik-lernen.de/callback',
    scope: 'openid profile email api:read',
    state: 'sec_csrf_state_8392174',
    code_challenge: 'E9Melhoa2OwvFrGMTJguCH5rtx64ZnJSm91G3e3b50A',
    code_challenge_method: 'S256'
  });

  const authValidation = useMemo(
    () => validateAuthRequest(authParams),
    [authParams]
  );

  // Tab 2: JWT Decoder
  const [jwtInput, setJwtInput] = useState(INITIAL_JWT);
  const jwtDecoded = useMemo(
    () => parseAndValidateJwt(jwtInput),
    [jwtInput]
  );

  // Tab 3: Token Rotation Simulator
  const [activeRefreshToken, setActiveRefreshToken] = useState('rt_active_primary_1001');
  const [currentTokenHistory, setCurrentTokenHistory] = useState([
    { token: 'rt_active_primary_1001', status: 'Gültig (Aktiv)', time: 'Initial' }
  ]);
  const [simResult, setSimResult] = useState('');

  const handleRotate = (tokenToUse) => {
    const res = simulateTokenRotation(tokenToUse, activeRefreshToken);
    if (res.success && res.tokens) {
      setActiveRefreshToken(res.tokens.refresh_token);
      setCurrentTokenHistory((prev) => [
        { token: res.tokens.refresh_token, status: 'Gültig (Neu ausgestellt)', time: new Date().toLocaleTimeString() },
        ...prev.map((t) => t.token === tokenToUse ? { ...t, status: 'Ungültig (Verbraucht)' } : t)
      ]);
      setSimResult('Erfolg: Neuer Access Token & neuer Refresh Token ausgestellt. Der alte Refresh Token ist sofort ungültig.');
    } else {
      setSimResult(`ABGEWEHRT: ${res.error}`);
    }
  };

  const handleClaimLabXp = () => {
    if (!xpClaimed && onRewardXP && authValidation.isValid) {
      onRewardXP(45);
      setXpClaimed(true);
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header Panel */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px', border: '2px solid var(--accent-indigo)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Lock size={30} style={{ color: 'var(--accent-indigo)' }} /> OAuth 2.0 & OpenID Connect (OIDC) Studio
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem', maxWidth: '750px' }}>
              Authorization Code Flow mit PKCE, JWT-Claims-Inspektor, Refresh-Token-Rotation und IHK-Prüfungsdrill.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {authValidation.isValid && !xpClaimed && (
              <button
                className="btn btn-primary"
                onClick={handleClaimLabXp}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Award size={18} /> +45 XP Einlösen
              </button>
            )}
            {xpClaimed && (
              <span className="badge badge-success" style={{ padding: '8px 12px', fontSize: '0.9rem' }}>
                <CheckCircle2 size={16} /> 45 XP erhalten
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
        <button
          className={`btn ${activeTab === 'authRequest' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('authRequest')}
          style={{ minHeight: '44px' }}
        >
          <ArrowRight size={16} /> 1. Auth Flow & PKCE
        </button>
        <button
          className={`btn ${activeTab === 'jwt' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('jwt')}
          style={{ minHeight: '44px' }}
        >
          <Key size={16} /> 2. JWT & OIDC Decoder
        </button>
        <button
          className={`btn ${activeTab === 'rotation' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('rotation')}
          style={{ minHeight: '44px' }}
        >
          <RefreshCw size={16} /> 3. Token-Rotation
        </button>
        <button
          className={`btn ${activeTab === 'drill' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('drill')}
          style={{ minHeight: '44px' }}
        >
          <Award size={16} /> 4. IHK-Drill
        </button>
      </div>

      {/* Tab 1: Auth Flow & PKCE */}
      {activeTab === 'authRequest' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-main)' }}>
              Authorization Request URL Parameter
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label htmlFor="param-response-type" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  response_type:
                </label>
                <select
                  id="param-response-type"
                  value={authParams.response_type}
                  onChange={(e) => setAuthParams({ ...authParams, response_type: e.target.value })}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', marginTop: '4px' }}
                >
                  <option value="code">code (Empfohlen für Authorization Code Flow)</option>
                  <option value="token">token (Veralteter Implicit Flow)</option>
                </select>
              </div>

              <div>
                <label htmlFor="param-scope" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  scope (Leerstelle getrennt):
                </label>
                <input
                  id="param-scope"
                  type="text"
                  value={authParams.scope}
                  onChange={(e) => setAuthParams({ ...authParams, scope: e.target.value })}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', marginTop: '4px' }}
                />
              </div>

              <div>
                <label htmlFor="param-code-challenge" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  code_challenge (PKCE SHA-256 Base64URL):
                </label>
                <input
                  id="param-code-challenge"
                  type="text"
                  value={authParams.code_challenge}
                  onChange={(e) => setAuthParams({ ...authParams, code_challenge: e.target.value })}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', marginTop: '4px' }}
                />
              </div>

              <div>
                <label htmlFor="param-state" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  state (CSRF-Schutz Token):
                </label>
                <input
                  id="param-state"
                  type="text"
                  value={authParams.state}
                  onChange={(e) => setAuthParams({ ...authParams, state: e.target.value })}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', marginTop: '4px' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setAuthParams({
                  response_type: 'code',
                  client_id: 'spa-student-portal',
                  redirect_uri: 'https://informatik-lernen.de/callback',
                  scope: 'openid profile email api:read',
                  state: 'sec_csrf_state_8392174',
                  code_challenge: 'E9Melhoa2OwvFrGMTJguCH5rtx64ZnJSm91G3e3b50A',
                  code_challenge_method: 'S256'
                })}
              >
                <RefreshCw size={14} /> Vorlage: PKCE + OIDC
              </button>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-main)' }}>
              Sicherheits- & Standard-Audit
            </h3>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
              <span className={`badge ${authValidation.isOidc ? 'badge-primary' : 'badge-secondary'}`}>
                {authValidation.isOidc ? 'OpenID Connect (OIDC)' : 'Reines OAuth 2.0'}
              </span>
              <span className={`badge ${authValidation.isValid ? 'badge-success' : 'badge-danger'}`}>
                {authValidation.isValid ? 'OAuth 2.1 Konform' : 'Sicherheitsmängel'}
              </span>
            </div>

            {authValidation.issues.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {authValidation.issues.map((iss, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: iss.startsWith('Hinweis') || iss.startsWith('Best Practice') ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      borderLeft: `4px solid ${iss.startsWith('Hinweis') || iss.startsWith('Best Practice') ? 'var(--accent-amber)' : 'var(--accent-rose)'}`,
                      fontSize: '0.85rem',
                      color: 'var(--text-main)'
                    }}
                  >
                    {iss}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderLeft: '4px solid var(--accent-emerald)',
                color: 'var(--text-main)'
              }}>
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)' }} /> Perfekter Authorization Request
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Geschützt durch PKCE (S256), CSRF-State und standardisierten OIDC Scope.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: JWT & OIDC Decoder */}
      {activeTab === 'jwt' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>
            JSON Web Token (JWT) & Claims Inspektor
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.95rem' }}>
            Ein OIDC ID-Token oder OAuth Access-Token besteht aus drei Base64URL-kodierten Abschnitten: Header (Algorithmus), Payload (Claims) und Signatur.
          </p>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="jwt-raw-input" style={{ fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
              Roh-Token (JWT):
            </label>
            <textarea
              id="jwt-raw-input"
              value={jwtInput}
              onChange={(e) => setJwtInput(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.85rem',
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)'
              }}
            />
          </div>

          {jwtDecoded.isValid ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '16px' }}>
              <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontWeight: 800, color: 'var(--accent-rose)', marginBottom: '8px' }}>1. Header (JOSE)</h4>
                <pre style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  {JSON.stringify(jwtDecoded.header, null, 2)}
                </pre>
              </div>

              <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontWeight: 800, color: 'var(--accent-purple)', margin: 0 }}>2. Payload (Claims)</h4>
                  <span className={`badge ${jwtDecoded.isExpired ? 'badge-danger' : 'badge-success'}`}>
                    {jwtDecoded.isExpired ? 'Token Abgelaufen' : 'Token Gültig'}
                  </span>
                </div>
                <pre style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  {JSON.stringify(jwtDecoded.payload, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div style={{ padding: '14px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-rose)', borderRadius: 'var(--radius-sm)' }}>
              {jwtDecoded.error}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Token Rotation */}
      {activeTab === 'rotation' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>
            Refresh Token Rotation & Replay-Schutz
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.95rem' }}>
            Jeder Refresh Token darf nur genau einmal eingelöst werden (Single-Use). Der Server tauscht den alten Token gegen ein neues Paar aus.
          </p>

          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={() => handleRotate(activeRefreshToken)}
            >
              <RefreshCw size={16} /> Regulärer Token-Refresh (mit aktivem Token)
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
              Token Historie im Auth-Server:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentTokenHistory.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: item.status.includes('Gültig') ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)'
                  }}
                >
                  <div>
                    <code style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.token}</code>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '10px' }}>({item.time})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: item.status.includes('Gültig') ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                      {item.status}
                    </span>
                    {!item.status.includes('Gültig') && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleRotate(item.token)}
                        style={{ color: 'var(--accent-rose)' }}
                      >
                        Simuliere Replay-Angriff
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {simResult && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: simResult.startsWith('Erfolg') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderLeft: `4px solid ${simResult.startsWith('Erfolg') ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
              color: 'var(--text-main)',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}>
              {simResult}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Drill */}
      {activeTab === 'drill' && (
        <LabDrillSection
          title="OAuth 2.0 & OIDC Security IHK-Prüfungsdrill"
          questions={OAUTH_OIDC_DRILL_QUESTIONS}
          xpReward={55}
          onRewardXP={onRewardXP}
        />
      )}

      {/* Quellen */}
      <div style={{ marginTop: '28px' }}>
        <SourceList sources={SOURCES} />
      </div>
    </div>
  );
}
