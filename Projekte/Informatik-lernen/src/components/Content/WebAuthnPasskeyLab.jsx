import React, { useState } from 'react';
import { 
  Key, Fingerprint, CheckCircle2, 
  AlertTriangle, Sparkles 
} from 'lucide-react';
import { registerPasskey, authenticatePasskey, testRealWebAuthnHardware } from '../../utils/webAuthnEngine';
import { useStore } from '../../store/useStore';

export default function WebAuthnPasskeyLab() {
  const { awardXP } = useStore();
  const [username, setUsername] = useState('dev.azubi@it-firma.de');
  const [authenticatorType, setAuthenticatorType] = useState('platform'); // 'platform' | 'cross-platform'
  const [credential, setCredential] = useState(null);
  const [authResult, setAuthResult] = useState(null);
  const [hardwareCheckResult, setHardwareCheckResult] = useState(null);
  const [isPhishingDomainActive, setIsPhishingDomainActive] = useState(false);
  const [activeStep, setActiveStep] = useState('register'); // 'register' | 'auth' | 'inspector'
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const officialOrigin = 'https://it-devgame.local';
  const simulatedOrigin = isPhishingDomainActive ? 'https://it-devgame-phishing-attacker.com' : officialOrigin;

  const handleRegister = () => {
    const cred = registerPasskey({
      username,
      rpId: 'it-devgame.local',
      origin: officialOrigin,
      authenticatorType,
      userVerification: 'required'
    });
    setCredential(cred);
    setAuthResult(null);
    setActiveStep('auth');
  };

  const handleAuthenticate = () => {
    if (!credential) return;
    const res = authenticatePasskey({
      registeredCredential: credential,
      clientOrigin: simulatedOrigin,
      simulatedUserPresence: true,
      simulatedUserVerified: true
    });
    setAuthResult(res);

    if (res.success && !rewardClaimed) {
      awardXP(75, 'WebAuthn & Passkey FIDO2 Master');
      setRewardClaimed(true);
    }
  };

  return (
    <div className="lab-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '20px', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
            <Key size={16} /> FIDO2 / W3C Web Authentication Standard (Passkeys)
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            FIDO2 WebAuthn & Passkey Studio
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Erlebe asymmetrische passwortlose Authentifizierung via Hardware-Tokens (YubiKey) oder Biometrie (TouchID / Windows Hello) und teste die Phishing-Resistenz.
          </p>
        </div>

        {/* Step Tabs */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '10px' }}>
          <button
            onClick={() => setActiveStep('register')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeStep === 'register' ? 'var(--accent-primary)' : 'transparent',
              color: activeStep === 'register' ? 'var(--text-on-accent)' : 'var(--text-main)',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            1. Registrierung (Attestation)
          </button>
          <button
            onClick={() => setActiveStep('auth')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeStep === 'auth' ? 'var(--accent-primary)' : 'transparent',
              color: activeStep === 'auth' ? 'var(--text-on-accent)' : 'var(--text-main)',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            2. Anmeldung (Assertion)
          </button>
          <button
            onClick={() => setActiveStep('inspector')}
            disabled={!credential}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeStep === 'inspector' ? 'var(--accent-primary)' : 'transparent',
              color: credential ? 'var(--text-main)' : 'var(--text-dim)',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: credential ? 'pointer' : 'not-allowed'
            }}
          >
            3. COSE & Flags Inspector
          </button>
        </div>
      </div>

      {/* STEP 1: Registration */}
      {activeStep === 'register' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '20px' }}>
          <div style={{ background: 'var(--card-bg, #1e293b)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 16px 0' }}>
              Passkey anlegen (navigator.credentials.create)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label htmlFor="web-authn-passkey-lab-1" style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                  Benutzername / Identität:
                </label>
                <input id="web-authn-passkey-lab-1"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
                  Authenticator-Typ wählen:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    onClick={() => setAuthenticatorType('platform')}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: authenticatorType === 'platform' ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                      background: authenticatorType === 'platform' ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-tertiary)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Fingerprint size={20} color="#818cf8" />
                    <span>Plattform-Biometrie (TouchID / Windows Hello)</span>
                  </button>

                  <button
                    onClick={() => setAuthenticatorType('cross-platform')}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: authenticatorType === 'cross-platform' ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                      background: authenticatorType === 'cross-platform' ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-tertiary)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Key size={20} color="#fbbf24" />
                    <span>USB Hardware Token (YubiKey FIDO2)</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleRegister}
                style={{
                  marginTop: '10px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'var(--accent-primary)',
                  color: 'var(--text-on-accent)',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Sparkles size={18} /> Asymmetrisches Schlüsselpaar erzeugen & registrieren
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--card-bg, #1e293b)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 14px 0' }}>
              Wie funktioniert die Registrierung?
            </h3>
            <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
              <li>Der Server generiert eine kryptografische Zufalls-Challenge (32 Bytes).</li>
              <li>Der Browser ruft <code>navigator.credentials.create()</code> auf.</li>
              <li>Das Hardware-Token erzeugt im Secure Enclave ein <strong>neues Schlüsselpaar</strong> (z. B. ECDSA P-256).</li>
              <li>Der <strong>private Schlüssel verlässt niemals das Gerät</strong>.</li>
              <li>Nur der <strong>öffentliche Schlüssel</strong> (Public Key) wird zusammen mit dem Attestation-Objekt an den Server gesendet.</li>
            </ol>

            {credential && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--accent-emerald)' }}>
                ✓ Passkey registriert: <code>{credential.credentialId}</code> (Algorithmus: ES256)
              </div>
            )}

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={async () => {
                  const res = await testRealWebAuthnHardware(username);
                  setHardwareCheckResult(res);
                }}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Fingerprint size={14} /> Reale Client-Hardware prüfen (Web Crypto &amp; Platform Authenticator)
              </button>
              {hardwareCheckResult && (
                <div style={{ marginTop: '8px', fontSize: '0.78rem', color: hardwareCheckResult.isSupported ? 'var(--accent-cyan)' : 'var(--accent-rose)' }}>
                  {hardwareCheckResult.isSupported 
                    ? `✓ WebAuthn unterstützt. Platform-Authenticator (z. B. Windows Hello / TouchID): ${hardwareCheckResult.hasPlatformAuthenticator ? 'Verfügbar' : 'Nicht erkannt / Externes Token erforderlich'}`
                    : `⚠️ ${hardwareCheckResult.error}`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Authentication */}
      {activeStep === 'auth' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Phishing Toggle Bar */}
          <div style={{ background: 'var(--card-bg, #1e293b)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', display: 'block' }}>Aktuelle Browser URL Bar (Origin):</span>
              <strong style={{ fontSize: '1.1rem', color: isPhishingDomainActive ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                {simulatedOrigin}
              </strong>
            </div>

            <button
              onClick={() => setIsPhishingDomainActive(prev => !prev)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: isPhishingDomainActive ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.2)',
                background: isPhishingDomainActive ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-tertiary)',
                color: isPhishingDomainActive ? 'var(--accent-rose)' : 'var(--text-main)',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertTriangle size={16} color={isPhishingDomainActive ? '#ef4444' : '#fbbf24'} />
              <span>Phishing-Angriff simulieren: {isPhishingDomainActive ? 'AKTIV' : 'AUS'}</span>
            </button>
          </div>

          <div style={{ background: 'var(--card-bg, #1e293b)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 8px 0' }}>
              Mit Passkey anmelden (navigator.credentials.get)
            </h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Kein Passwort erforderlich. Bestätige deine Anwesenheit via Touch/Biometrie.
            </p>

            <button
              onClick={handleAuthenticate}
              disabled={!credential}
              style={{
                padding: '12px 28px',
                borderRadius: '8px',
                background: !credential ? 'var(--bg-card-hover)' : isPhishingDomainActive ? '#dc2626' : '#6366f1',
                color: 'var(--text-main)',
                fontWeight: 'bold',
                fontSize: '1rem',
                border: 'none',
                cursor: !credential ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Fingerprint size={20} />
              <span>{isPhishingDomainActive ? 'Anmeldeversuch auf Phishing-Seite' : 'Passkey bestätigen & anmelden'}</span>
            </button>

            {!credential && (
              <p style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', marginTop: '12px' }}>
                ⚠️ Bitte lege zuerst in Schritt 1 einen Passkey an.
              </p>
            )}

            {authResult && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                borderRadius: '10px',
                textAlign: 'left',
                background: authResult.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: authResult.success ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '1rem', color: authResult.success ? 'var(--accent-emerald)' : 'var(--accent-rose)', marginBottom: '6px' }}>
                  {authResult.success ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  <span>{authResult.success ? 'Authentifizierung erfolgreich!' : 'Authentifizierung blockiert!'}</span>
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  {authResult.success ? authResult.message : authResult.error}
                </div>
                {authResult.isPhishingBlocked && (
                  <div style={{ marginTop: '10px', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--accent-rose)' }}>
                    🛡️ <strong>Warum Passkeys immun gegen Phishing sind:</strong> Der Browser erfasst automatisch den echten Domainnamen aus der Adresszeile im <code>clientDataJSON</code>. Selbst wenn der Nutzer auf eine gefälschte Website hereinfällt, signiert das Token den Hash der gefälschten Domain, den der echte Server sofort zurückweist!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: Inspector */}
      {activeStep === 'inspector' && credential && (
        <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 14px 0' }}>
            Authenticator Data & COSE Public Key
          </h3>

          <pre style={{ margin: 0, padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '8px', color: 'var(--accent-primary)', fontSize: '0.85rem', lineHeight: '1.6', overflowX: 'auto' }}>
            <code>{JSON.stringify(credential.attestationObject, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
