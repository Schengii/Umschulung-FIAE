import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Lock, CheckCircle2, RefreshCw, ArrowRight, ExternalLink, UserCheck, ShieldCheck, Terminal } from 'lucide-react';
import { useStore } from '../../store/useStore';
import {
  generateCodeVerifier,
  computeCodeChallengeS256,
  buildAuthorizationUrl,
  exchangeCodeForTokens
} from '../../utils/oauthPkceEngine';

export default function OauthPkceStudioLab() {
  const { awardXP } = useStore();
  const [step, setStep] = useState(1);
  const [xpClaimed, setXpClaimed] = useState(false);
  const [clientId] = useState('spa-devgame-client-app');
  const [redirectUri] = useState('https://app.devgame.it/oauth/callback');
  const [scope] = useState('openid profile email api:read');
  const [codeVerifier, setCodeVerifier] = useState('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk');
  const [codeChallenge, setCodeChallenge] = useState(() => computeCodeChallengeS256('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'));
  const [state] = useState('xyz_secure_state_8912');
  const [nonce] = useState('nonce_secure_random_4421');
  
  const [authSession, setAuthSession] = useState(null);
  const [tokenResponse, setTokenResponse] = useState(null);
  const [activeJwtTab, setActiveJwtTab] = useState('id_token');
  const [apiResponse, setApiResponse] = useState(null);
  const [isTampered, setIsTampered] = useState(false);

  // Step 1: Generate PKCE
  const handleRegeneratePkce = () => {
    const newVerifier = generateCodeVerifier(56);
    const newChallenge = computeCodeChallengeS256(newVerifier);
    setCodeVerifier(newVerifier);
    setCodeChallenge(newChallenge);
    setIsTampered(false);
  };

  // Step 2: Send Authorization Request & Mock IdP Consent
  const authUrl = buildAuthorizationUrl({
    authEndpoint: 'https://auth.devgame.it/oauth/v2/authorize',
    clientId,
    redirectUri,
    scope,
    state,
    nonce,
    codeChallenge,
    codeChallengeMethod: 'S256'
  });

  const handleAuthorizeLogin = () => {
    const mockCode = 'authcode_' + Math.random().toString(36).substring(2, 14) + '_sec';
    setAuthSession({
      code: mockCode,
      codeChallenge,
      codeChallengeMethod: 'S256',
      redirectUri,
      scope,
      nonce,
      user: {
        id: 'usr_8829102',
        name: 'Max Mustermann',
        email: 'max.mustermann@fiae-azubi.de',
        roles: ['DEVELOPER', 'STUDENT']
      }
    });
    setStep(3);
  };

  // Step 3: Token Exchange (POST /oauth/token with PKCE verifier)
  const handleExchangeTokens = () => {
    const verifierToSend = isTampered ? 'manipulated_wrong_verifier_xyz' : codeVerifier;
    const res = exchangeCodeForTokens({
      code: authSession.code,
      codeVerifier: verifierToSend,
      authSession,
      clientId,
      redirectUri
    });

    if (res.success) {
      setTokenResponse(res.tokens);
      setStep(4);
      if (!xpClaimed) {
        setXpClaimed(true);
        awardXP(45, 'OAuth2 & OIDC Security Expert (PKCE)');
      }
    } else {
      alert(`[OAuth Error: ${res.error}] ${res.error_description}`);
    }
  };

  // Step 4: Call Protected API (/userinfo)
  const handleCallProtectedApi = () => {
    if (!tokenResponse) return;
    setApiResponse({
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      data: {
        sub: tokenResponse.decoded.idToken.sub,
        name: tokenResponse.decoded.idToken.name,
        email: tokenResponse.decoded.idToken.email,
        roles: tokenResponse.decoded.idToken.roles,
        access_granted: true,
        authenticated_via: 'OAuth 2.0 PKCE + RS256 JWT Bearer'
      }
    });
  };

  const handleReset = () => {
    setStep(1);
    setAuthSession(null);
    setTokenResponse(null);
    setApiResponse(null);
    setIsTampered(false);
  };

  return (
    <div className="space-y-6" style={{ maxWidth: '1300px', margin: '0 auto', padding: '16px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-indigo"><Key size={14} /> RFC 7636 PKCE &amp; OIDC Core 1.0</span>
              <span className="badge badge-teal"><ShieldCheck size={14} /> S256 SHA-256 Code Challenge</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
              OAuth 2.0 PKCE &amp; OpenID Connect (OIDC) Flow Studio
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px', maxWidth: '800px', fontSize: '0.95rem' }}>
              Simuliere den sichersten Authentifizierungs- &amp; Autorisierungs-Flow für Single Page Apps (SPA) und mobile Clients.
              Erlebe die SHA-256 Code-Challenge-Validierung, ID-Token-Dekodierung und Token-Exchange ohne Client-Secret.
            </p>
          </div>
          <button onClick={handleReset} className="action-button secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={16} /> Workflow zurücksetzen
          </button>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="glass-panel" style={{ padding: '16px 24px', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {[
            { num: 1, title: '1. PKCE Keygen', desc: 'Verifier & S256 Challenge' },
            { num: 2, title: '2. Auth Request', desc: 'Redirect zum Auth Server' },
            { num: 3, title: '3. Token Exchange', desc: 'Code + Verifier -> JWT' },
            { num: 4, title: '4. Resource API', desc: 'Bearer Token Zugriff' }
          ].map((st) => (
            <div 
              key={st.num}
              onClick={() => st.num <= step && setStep(st.num)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                opacity: step >= st.num ? 1 : 0.45,
                cursor: st.num <= step ? 'pointer' : 'default'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: step === st.num ? 'var(--accent-primary)' : step > st.num ? 'var(--accent-green, #10b981)' : 'var(--bg-tertiary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '0.95rem'
              }}>
                {step > st.num ? <CheckCircle2 size={20} /> : st.num}
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: step === st.num ? 'var(--accent-primary)' : 'var(--text-main)' }}>{st.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{st.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: PKCE Pair Generation */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={20} color="var(--accent-primary)" /> Schritt 1: Erzeugung des kryptographischen PKCE-Schlüsselpaars
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px' }}>
            Da SPAs und Mobile Apps keinen sicheren Speicher für ein <code>client_secret</code> haben, schützt PKCE (RFC 7636) vor Authorization Code Injection &amp; Interception Attacken.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--accent-purple)' }}>
                  🔐 Code Verifier (Kryptographisches Geheimnis)
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Client-Side Only</span>
              </div>
              <pre style={{ margin: 0, padding: '12px', background: '#0f172a', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: '#38bdf8', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                {codeVerifier}
              </pre>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Zufälliger String hoher Entropie (43 - 128 Zeichen, RFC 7636).
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--accent-teal, #14b8a6)' }}>
                  ⚡ Code Challenge (S256)
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Public</span>
              </div>
              <pre style={{ margin: 0, padding: '12px', background: '#0f172a', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: '#4ade80', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                {codeChallenge}
              </pre>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Formel: <code>BASE64URL(SHA256(code_verifier))</code>.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button onClick={handleRegeneratePkce} className="action-button secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={16} /> Neues Paar generieren
            </button>
            <button onClick={() => setStep(2)} className="action-button primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Weiter zu Schritt 2: Authorization Request <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Authorization Request */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ExternalLink size={20} color="var(--accent-primary)" /> Schritt 2: Browser-Redirect zum Authorization Server
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '16px' }}>
            Die Client-App leitet den Benutzer mit der <code>code_challenge</code> und Scopes zur Login-Maske weiter.
          </p>

          <div style={{ background: '#0f172a', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', overflowX: 'auto' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', marginBottom: '6px', fontWeight: 'bold' }}>HTTP GET Authorization Request URL:</div>
            <code style={{ fontSize: '0.88rem', color: '#e2e8f0', wordBreak: 'break-all' }}>
              {authUrl}
            </code>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={18} color="var(--accent-green, #10b981)" /> Simulierter IdP Consent &amp; Login Screen
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.9rem' }}>
              <div><strong>Client:</strong> {clientId}</div>
              <div><strong>Redirect URI:</strong> {redirectUri}</div>
              <div><strong>Scope:</strong> {scope}</div>
              <div><strong>User:</strong> max.mustermann@fiae-azubi.de</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button onClick={() => setStep(1)} className="action-button secondary">
              Zurück
            </button>
            <button onClick={handleAuthorizeLogin} className="action-button primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Einloggen &amp; Consent erteilen (Auth Code ausstellen) <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Token Exchange with PKCE Verification */}
      {step === 3 && authSession && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={20} color="var(--accent-primary)" /> Schritt 3: Backchannel Token Exchange (POST /oauth/token)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '16px' }}>
            Die SPA sendet den <code>code</code> zusammen mit dem geheimen <code>code_verifier</code> per POST-Request an den Authorization Server. Der Server verifiziert <code>SHA256(verifier) == challenge</code>.
          </p>

          <div style={{ background: '#0f172a', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
            <div style={{ color: '#ec4899', fontWeight: 'bold', marginBottom: '4px' }}>POST /oauth/v2/token HTTP/1.1</div>
            <div style={{ color: '#94a3b8' }}>Host: auth.devgame.it</div>
            <div style={{ color: '#94a3b8' }}>Content-Type: application/x-www-form-urlencoded</div>
            <div style={{ marginTop: '8px', color: '#38bdf8' }}>
              grant_type=authorization_code&amp;<br/>
              client_id={clientId}&amp;<br/>
              redirect_uri={redirectUri}&amp;<br/>
              code={authSession.code}&amp;<br/>
              code_verifier={isTampered ? 'manipulated_wrong_verifier_xyz' : codeVerifier}
            </div>
          </div>

          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <input 
              type="checkbox" 
              id="tamper-checkbox"
              checked={isTampered}
              onChange={(e) => setIsTampered(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="tamper-checkbox" style={{ fontSize: '0.9rem', color: '#fca5a5', cursor: 'pointer' }}>
              <strong>Angriff simulieren:</strong> Manipulierten Code-Verifier senden (Testet PKCE Ablehnung / Invalid Grant)
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button onClick={() => setStep(2)} className="action-button secondary">
              Zurück
            </button>
            <button onClick={handleExchangeTokens} className="action-button primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Token-Request absenden &amp; PKCE prüfen <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 4: Tokens & Resource Inspection */}
      {step === 4 && tokenResponse && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="var(--accent-green, #10b981)" /> Schritt 4: Ausgestellte Token-Payloads &amp; JWT Inspektion
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setActiveJwtTab('id_token')}
                  className={`action-button ${activeJwtTab === 'id_token' ? 'primary' : 'secondary'}`}
                  style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                >
                  OIDC ID Token (JWT)
                </button>
                <button 
                  onClick={() => setActiveJwtTab('access_token')}
                  className={`action-button ${activeJwtTab === 'access_token' ? 'primary' : 'secondary'}`}
                  style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                >
                  Access Token (Bearer)
                </button>
              </div>
            </div>

            {/* JWT Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#0f172a', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.82rem', color: '#f43f5e', fontWeight: 'bold', marginBottom: '6px' }}>HEADER (Algorithm &amp; Key ID):</div>
                <pre style={{ margin: 0, color: '#fda4af', fontSize: '0.85rem' }}>
                  {JSON.stringify(tokenResponse.decoded.header, null, 2)}
                </pre>
              </div>

              <div style={{ background: '#0f172a', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.82rem', color: '#a855f7', fontWeight: 'bold', marginBottom: '6px' }}>
                  PAYLOAD CLAIMS ({activeJwtTab === 'id_token' ? 'OpenID User Identity' : 'API Scopes & Permissions'}):
                </div>
                <pre style={{ margin: 0, color: '#d8b4fe', fontSize: '0.85rem' }}>
                  {JSON.stringify(activeJwtTab === 'id_token' ? tokenResponse.decoded.idToken : tokenResponse.decoded.accessToken, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Protected Resource API Call */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Terminal size={18} color="var(--accent-primary)" /> Protected Resource API Call (/userinfo)
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                  Sende den Access Token im <code>Authorization: Bearer</code> Header an die API.
                </p>
              </div>
              <button onClick={handleCallProtectedApi} className="action-button primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                API abfragen (GET /userinfo)
              </button>
            </div>

            {apiResponse && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: '#0f172a', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-green, #10b981)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
                  <span style={{ color: '#4ade80', fontWeight: 'bold' }}>HTTP 200 OK</span>
                  <span style={{ color: 'var(--text-muted)' }}>Response Body:</span>
                </div>
                <pre style={{ margin: 0, color: '#38bdf8', fontSize: '0.85rem' }}>
                  {JSON.stringify(apiResponse.data, null, 2)}
                </pre>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
