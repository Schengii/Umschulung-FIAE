import React, { useState } from 'react';
import {
  MTLS_MESH_CONFIG,
  validateMtlsHandshake
} from '../../utils/mtlsZtnaEngine';
import {
  ShieldCheck,
  Lock,
  Award,
  Server,
  Network,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function MtlsZtnaLab({ onRewardXP }) {
  const [selectedServiceId, setSelectedServiceId] = useState('order-service');
  const [requestedEndpoint, setRequestedEndpoint] = useState('POST /orders');
  const [isCompleted, setIsCompleted] = useState(false);

  const clientCert = MTLS_MESH_CONFIG.services[selectedServiceId];
  const result = validateMtlsHandshake(clientCert, requestedEndpoint);

  const handleFinish = () => {
    if (!isCompleted && result.handshakeSuccess && result.httpStatus === 200) {
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
              <Lock size={14} /> Zero-Trust Network Access
            </span>
            <span className="badge badge-indigo">mTLS 1.3 / RFC 8446</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            Mutual TLS (mTLS) & Zero-Trust Service-Mesh Studio
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Untersuche gegenseitige X.509 Zertifikats-Authentifizierung auf Transportschicht und granulare RBAC-Sicherheitsrichtlinien in Cloud-Native Architekturen.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleFinish}
          disabled={isCompleted || !result.handshakeSuccess || result.httpStatus !== 200}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Award size={18} />
          {isCompleted ? 'Abgeschlossen (+65 XP)' : 'Labor abschließen (+65 XP)'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Service & Request Selektor */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} color="var(--accent-teal)" /> Client-Service & Request Auswahl
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Aufrufender Client-Microservice:
            </label>
            <select
              className="input-select"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
            >
              <option value="order-service">Order Service (Zertifikat Gültig • order-service.internal.corp)</option>
              <option value="payment-service">Payment Service (Zertifikat Gültig • payment-service.internal.corp)</option>
              <option value="compromised-service">Compromised Rogue Bot (Zertifikat Widerrufen / CRL Revoked!)</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Ziel-API Endpunkt:
            </label>
            <select
              className="input-select"
              value={requestedEndpoint}
              onChange={(e) => setRequestedEndpoint(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
            >
              <option value="POST /orders">POST /orders (Bestellung anlegen)</option>
              <option value="POST /checkout">POST /checkout (Warenkorb abschließen)</option>
              <option value="POST /charges">POST /charges (Kreditkarten-Belastung via Payment-Gateway)</option>
              <option value="POST /refunds">POST /refunds (Rückbuchung)</option>
            </select>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'monospace', lineHeight: '1.6' }}>
            <div style={{ color: 'var(--accent-teal)' }}># Client X.509 Identity:</div>
            <div>Common Name: <strong>{clientCert.commonName}</strong></div>
            <div>Serial: <code>{clientCert.serialNumber}</code></div>
            <div>Issuer: {clientCert.issuer}</div>
            <div>Revocation Status: {clientCert.isRevoked ? <span style={{ color: 'var(--accent-rose)' }}>REVOKED</span> : <span style={{ color: 'var(--accent-teal)' }}>ACTIVE</span>}</div>
          </div>
        </div>

        {/* Handshake & Gateway Status */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Network size={18} color="var(--accent-amber)" /> Handshake & Zero-Trust Decision
          </h3>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
            <span
              className={`badge ${result.httpStatus === 200 ? 'badge-teal' : result.httpStatus === 403 ? 'badge-amber' : 'badge-rose'}`}
              style={{ fontSize: '1.05rem', padding: '6px 12px' }}
            >
              HTTP {result.httpStatus} {result.httpStatus === 200 ? 'Authorized & Encrypted' : result.httpStatus === 403 ? 'RBAC Forbidden' : 'TLS Handshake Failed'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            {result.handshakeSteps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '0.85rem'
                }}
              >
                {step.status === 'ok' ? (
                  <CheckCircle2 size={16} color="var(--accent-teal)" style={{ marginTop: '2px', flexShrink: 0 }} />
                ) : (
                  <XCircle size={16} color="var(--accent-rose)" style={{ marginTop: '2px', flexShrink: 0 }} />
                )}
                <div>
                  <strong style={{ color: 'var(--text-main)' }}>{step.step}:</strong>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{step.details}</div>
                </div>
              </div>
            ))}
          </div>

          {result.errorMessage && (
            <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--accent-rose)', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--accent-rose)' }}>
              {result.errorMessage}
            </div>
          )}
        </div>
      </div>

      {/* IHK Wissen */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="var(--accent-teal)" /> IHK AP2 Kernwissen: Normales TLS vs. Mutual TLS (mTLS)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          <div>
            <strong style={{ color: 'var(--text-main)' }}>Klassisches One-Way TLS:</strong>
            <p style={{ margin: '4px 0 0' }}>Nur der Server weist seine Identität per X.509 Zertifikat nach (z. B. im Webbrowser). Der Client authentifiziert sich erst später auf Applikationsebene (Passwort / Token).</p>
          </div>
          <div>
            <strong style={{ color: 'var(--text-main)' }}>Mutual TLS (mTLS):</strong>
            <p style={{ margin: '4px 0 0' }}>Beide Parteien authentifizieren sich gegenseitig über kryptografische Zertifikate. Der Server lehnt Verbindungen ohne vertrauenswürdiges Client-Zertifikat sofort auf TCP/TLS-Ebene ab.</p>
          </div>
          <div>
            <strong style={{ color: 'var(--text-main)' }}>Zero-Trust Architektur:</strong>
            <p style={{ margin: '4px 0 0' }}><em>"Never trust, always verify"</em>: Auch interner Netzwerkverkehr zwischen Microservices im Kubernetes-Cluster wird vollständig per mTLS verschlüsselt und per RBAC autorisiert.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
