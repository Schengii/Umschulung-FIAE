import React, { useState } from 'react';
import {
  srpRegister,
  srpClientHello,
  srpServerChallenge,
  srpComputeSharedKey
} from '../../utils/srpAuthEngine';
import {
  KeyRound,
  Lock,
  Award,
  RefreshCw,
  Terminal,
  Cpu,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function SrpZeroKnowledgeLab({ onRewardXP }) {
  const [username] = useState('alice_dev');
  const [password, setPassword] = useState('SecretIHK2026!');
  const [inputPassword, setInputPassword] = useState('SecretIHK2026!');
  const [clientASecret, setClientASecret] = useState(13n);
  const [serverBSecret, setServerBSecret] = useState(17n);
  const [isCompleted, setIsCompleted] = useState(false);

  // 1. Registrierung
  const registration = srpRegister(username, password, 42n);

  // 2. Handshake Phase
  const clientHello = srpClientHello(clientASecret);
  const serverChallenge = srpServerChallenge(registration.verifier, serverBSecret);

  // 3. Authentifizierungs-Versuch
  const loginClientReg = srpRegister(username, inputPassword, 42n);
  const authResult = srpComputeSharedKey(
    clientHello.A,
    serverChallenge.B,
    clientHello.a,
    serverChallenge.b,
    loginClientReg.x,
    registration.verifier
  );

  const handleFinish = () => {
    if (!isCompleted && authResult.isAuthenticated) {
      setIsCompleted(true);
      if (onRewardXP) onRewardXP(65);
    }
  };

  return (
    <div className="lab-container animate-fade-in" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="badge badge-teal" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Lock size={14} /> Zero-Knowledge Authentication
            </span>
            <span className="badge badge-indigo">RFC 2945 / RFC 5054 SRP-6a</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            Secure Remote Password (SRP) & Zero-Knowledge Auth Studio
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Mathematisch sichere Authentifizierung ohne jemals Passwörter oder Passworthashes über das Netzwerk zu senden.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleFinish}
          disabled={isCompleted || !authResult.isAuthenticated}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Award size={18} />
          {isCompleted ? 'Abgeschlossen (+65 XP)' : 'Labor abschließen (+65 XP)'}
        </button>
      </div>

      {/* Protocol Visualizer */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Client Side */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="var(--accent-teal)" /> Client-Seite (Browser)
          </h3>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Gespeichertes Passwort:
            </label>
            <input
              type="text"
              className="input-select"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Eingegebenes Login-Passwort (Angriffs-Simulation):
            </label>
            <input
              type="text"
              className="input-select"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                border: inputPassword === password ? '1px solid var(--accent-teal)' : '1px solid var(--accent-rose)'
              }}
            />
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'monospace', lineHeight: '1.6' }}>
            <div>Ephemeres Client-Geheimnis <code>a</code> = {clientHello.a.toString()}</div>
            <div style={{ color: 'var(--accent-teal)' }}>Public Key <code>A = g^a % N</code> = {clientHello.A.toString()}</div>
            <div>Berechneter Shared Key <code>S_client</code> = {authResult.clientS.toString()}</div>
            <div>Proof <code>M1 = H(A, B, S)</code> = {authResult.clientProofM1.toString()}</div>
          </div>
        </div>

        {/* Server Side */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={18} color="var(--accent-indigo)" /> Server-Datenbank & Challenge
          </h3>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'monospace', lineHeight: '1.6', marginBottom: '14px' }}>
            <div style={{ color: 'var(--text-muted)' }}># Was der Server speichert (KEIN Passwort!):</div>
            <div>Benutzer: <code>{registration.username}</code></div>
            <div>Salt <code>s</code>: {registration.salt.toString()}</div>
            <div>Password Verifier <code>v = g^x % N</code>: <strong>{registration.verifier.toString()}</strong></div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'monospace', lineHeight: '1.6' }}>
            <div style={{ color: 'var(--text-muted)' }}># Live Challenge Erzeugung:</div>
            <div>Ephemeres Server-Geheimnis <code>b</code> = {serverChallenge.b.toString()}</div>
            <div style={{ color: 'var(--accent-indigo)' }}>Public Challenge <code>B = (k*v + g^b) % N</code> = {serverChallenge.B.toString()}</div>
            <div>Berechneter Shared Key <code>S_server</code> = {authResult.serverS.toString()}</div>
            <div>Server Proof <code>M2 = H(A, M1, S)</code> = {authResult.serverProofM2.toString()}</div>
          </div>
        </div>
      </div>

      {/* Network Traffic Audit (Zero Knowledge Verification) */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <KeyRound size={18} color="var(--accent-amber)" /> Netzwerk-Sniffer Überprüfung (Wire-Traffic)
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <span className={`badge ${authResult.isAuthenticated ? 'badge-teal' : 'badge-rose'}`} style={{ fontSize: '1.05rem', padding: '6px 12px' }}>
            {authResult.isAuthenticated ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} /> Authentifizierung Erfolgreich (S_client == S_server)</span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><XCircle size={16} /> Fehlgeschlagen: Passwörter stimmen nicht überein</span>
            )}
          </span>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setClientASecret(BigInt(Math.floor(Math.random() * 20 + 5)));
              setServerBSecret(BigInt(Math.floor(Math.random() * 20 + 5)));
            }}
            style={{ fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} /> Neue ephemere Schlüssel würfeln
          </button>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', marginBottom: '8px', fontWeight: 600 }}>
            Über das Netzwerk übertragene Datenpakete:
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            <li>Client $\to$ Server: <code>{`{ username: "${username}", A: "${clientHello.A.toString()}" }`}</code></li>
            <li>Server $\to$ Client: <code>{`{ salt: "${registration.salt.toString()}", B: "${serverChallenge.B.toString()}" }`}</code></li>
            <li>Client $\to$ Server: <code>{`{ proofM1: "${authResult.clientProofM1.toString()}" }`}</code> (Beweis ohne Preisgabe)</li>
            <li>Server $\to$ Client: <code>{`{ proofM2: "${authResult.serverProofM2.toString()}" }`}</code> (Gegenseitige Authentifizierung)</li>
            <li style={{ color: 'var(--accent-teal)', marginTop: '4px' }}>
              <strong>Zero-Knowledge-Garantie:</strong> Weder das Klartext-Passwort noch ein Hash werden übertragen! Selbst ein Angreifer mit vollständigem Packet-Sniffing kann daraus das Passwort nicht ableiten.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
