import React, { useState } from 'react';
import { 
  ShieldAlert, ShieldCheck, Key, Lock, AlertTriangle, Check, Award, Copy, RefreshCw, Terminal
} from 'lucide-react';
import { 
  createSampleRs256Token, 
  verifyJwtToken, 
  forgeAlgorithmConfusionToken, 
  forgeNoneAlgToken,
  SAMPLE_RSA_PUBLIC_KEY
} from '../../utils/jwtConfusionEngine';
import { useStore } from '../../store/useStore';

export default function JwtConfusionLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [tokenData, setTokenData] = useState(() => createSampleRs256Token());
  const [currentToken, setCurrentToken] = useState(tokenData.token);
  const [targetRole, setTargetRole] = useState('admin');
  const [vulnerableToConfusion, setVulnerableToConfusion] = useState(false);
  const [allowNoneAlg, setAllowNoneAlg] = useState(false);
  const [verificationResult, setVerificationResult] = useState(() => verifyJwtToken(tokenData.token));
  const [xpAwarded, setXpAwarded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleResetToken = () => {
    const fresh = createSampleRs256Token();
    setTokenData(fresh);
    setCurrentToken(fresh.token);
    setVerificationResult(verifyJwtToken(fresh.token, {
      vulnerableToAlgConfusion: vulnerableToConfusion,
      allowNoneAlg
    }));
  };

  const handleVerify = (tokenToTest = currentToken) => {
    const res = verifyJwtToken(tokenToTest, {
      vulnerableToAlgConfusion: vulnerableToConfusion,
      allowNoneAlg,
      serverConfiguredAlg: 'RS256'
    });
    setVerificationResult(res);

    if (res.valid && res.vulnerabilityTriggered && !xpAwarded) {
      setXpAwarded(true);
      if (onRewardXP) onRewardXP(65);
      else awardXP(65, 'jwt_confusion_master');
    }
  };

  const handleSimulateConfusionAttack = () => {
    const forged = forgeAlgorithmConfusionToken(currentToken, targetRole);
    setCurrentToken(forged);
    handleVerify(forged);
  };

  const handleSimulateNoneAttack = () => {
    const forged = forgeNoneAlgToken(currentToken, targetRole);
    setCurrentToken(forged);
    handleVerify(forged);
  };

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Decode parts for visual inspection
  const parts = currentToken.split('.');
  const headerPreview = parts[0] ? atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')) : '';
  const payloadPreview = parts[1] ? atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')) : '';

  return (
    <div className="container-responsive" style={{ padding: '30px 16px', color: 'var(--text-main)' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gradient-cyber)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 16px rgba(79, 70, 229, 0.3)' }}>
            <Key size={26} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
              JWT Security &amp; Algorithm Confusion Attack Studio
            </h1>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              RFC 7519 / RFC 7518: Asymmetrische RS256 vs. symmetrische HS256 Key-Confusion &amp; None-Algorithm Defense
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {xpAwarded ? (
            <span className="badge badge-green" style={{ fontSize: '0.85rem' }}>
              <Check size={16} /> 65 XP erhalten!
            </span>
          ) : (
            <span className="badge badge-amber" style={{ fontSize: '0.85rem' }}>
              <Award size={16} /> 65 XP verfügbar
            </span>
          )}
        </div>
      </div>

      {/* Grid Layout: Config, Attack Workbench & Server Verification */}
      <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Left: Server Configuration (Vulnerable vs Hardened) */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} color="var(--accent-primary)" /> Server Auth-Gateway Konfiguration
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Simuliert, wie das Backend Token validiert. In vielen realen Bibliotheken vertraut der Server blind dem <code>alg</code>-Feld im JWT-Header!
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '10px', cursor: 'pointer' }}>
              <div>
                <strong style={{ fontSize: '0.9rem', display: 'block' }}>Algorithm Confusion Vulnerability</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Akzeptiert HS256 &amp; nutzt Public Key als Secret</span>
              </div>
              <input 
                type="checkbox" 
                checked={vulnerableToConfusion} 
                onChange={(e) => {
                  setVulnerableToConfusion(e.target.checked);
                  handleVerify();
                }} 
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '10px', cursor: 'pointer' }}>
              <div>
                <strong style={{ fontSize: '0.9rem', display: 'block' }}>"none" Algorithm Exploit (CVE-2015-9235)</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Akzeptiert unverschlüsselte Tokens ohne Signatur</span>
              </div>
              <input 
                type="checkbox" 
                checked={allowNoneAlg} 
                onChange={(e) => {
                  setAllowNoneAlg(e.target.checked);
                  handleVerify();
                }} 
              />
            </label>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
            <strong>Öffentlicher Server-Schlüssel (Public Key):</strong>
            <pre style={{ margin: '6px 0 0', overflowX: 'auto', color: 'var(--accent-teal)', fontFamily: 'var(--font-code)' }}>
              {SAMPLE_RSA_PUBLIC_KEY}
            </pre>
          </div>
        </div>

        {/* Center: Token Inspector & Attack Generator */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} color="var(--accent-rose)" /> Exploit Workbench
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Erstelle Privilege Escalation Payloads zur Erlangung von <code>admin</code>- oder <code>root</code>-Rechten:
          </p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <input 
              type="text" 
              className="btn btn-secondary" 
              style={{ flex: 1, textAlign: 'left', minHeight: '40px' }} 
              value={targetRole} 
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Ziel-Rolle (z. B. admin)" 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <button className="btn btn-primary btn-sm" onClick={handleSimulateConfusionAttack}>
              🔥 Algorithm Confusion (RS256 ➔ HS256) Exploit
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleSimulateNoneAttack}>
              ⚠️ "none" Algorithm Bypass Token erzeugen
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleResetToken}>
              <RefreshCw size={14} /> Ursprünglichen legitimen Token wiederherstellen
            </button>
          </div>

          {/* Current Raw Token Input/View */}
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Aktueller JWT String:</label>
              <button 
                onClick={() => handleCopy(currentToken)}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Copy size={12} /> {copied ? 'Kopiert!' : 'Kopieren'}
              </button>
            </div>
            <textarea 
              rows={3} 
              value={currentToken} 
              onChange={(e) => {
                setCurrentToken(e.target.value);
                handleVerify(e.target.value);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-code)',
                fontSize: '0.78rem',
                resize: 'none'
              }}
            />
          </div>
        </div>

        {/* Right: Live Token Structure & Decoded Claims */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={18} color="var(--accent-teal)" /> Token-Dekoder &amp; Claims
          </h2>

          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-rose)', textTransform: 'uppercase' }}>Header (Algorithmus):</span>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-main)', fontFamily: 'var(--font-code)', marginTop: '4px' }}>
              {headerPreview || '{}'}
            </pre>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase' }}>Payload (Rechte &amp; Claims):</span>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-main)', fontFamily: 'var(--font-code)', marginTop: '4px' }}>
              {payloadPreview || '{}'}
            </pre>
          </div>
        </div>
      </div>

      {/* Verification Status & Security Audit Banner */}
      <div className="glass-panel" style={{ padding: '24px', borderLeft: `6px solid ${verificationResult.valid ? (verificationResult.vulnerabilityTriggered ? '#ef4444' : '#10b981') : '#ef4444'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          {verificationResult.valid ? (
            verificationResult.vulnerabilityTriggered ? (
              <AlertTriangle size={24} color="#ef4444" />
            ) : (
              <ShieldCheck size={24} color="#10b981" />
            )
          ) : (
            <ShieldAlert size={24} color="#ef4444" />
          )}
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
            {verificationResult.valid 
              ? (verificationResult.vulnerabilityTriggered ? 'SICHERHEITSALARM: Angriff erfolgreich!' : 'Token Gültig & Sicher Verifiziert')
              : 'Verifikation Fehlgeschlagen (Angriff blockiert)'}
          </h3>
        </div>

        {verificationResult.warning && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px' }}>
            {verificationResult.warning}
          </div>
        )}

        {verificationResult.error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '12px' }}>
            {verificationResult.error}
          </div>
        )}

        {verificationResult.info && (
          <p style={{ color: 'var(--accent-emerald)', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>
            {verificationResult.info}
          </p>
        )}

        {verificationResult.claims && (
          <div style={{ marginTop: '12px', fontSize: '0.85rem' }}>
            <strong>Erkannte Identität:</strong> <code>{verificationResult.claims.name} ({verificationResult.claims.sub})</code> | <strong>Rolle:</strong> <span className={verificationResult.claims.role === 'admin' ? 'badge badge-rose' : 'badge badge-indigo'}>{verificationResult.claims.role}</span>
          </div>
        )}
      </div>
    </div>
  );
}
