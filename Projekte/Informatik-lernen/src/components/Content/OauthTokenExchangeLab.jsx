import React, { useState, useMemo } from 'react';
import { KeyRound, Award, Shield, Check, Copy } from 'lucide-react';
import { OAuthTokenExchangeSimulator } from '../../utils/oauthTokenExchangeEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function OauthTokenExchangeLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [exchangeMode, setExchangeMode] = useState('DELEGATION');
  const [subjectUser, setSubjectUser] = useState('alice_dev');
  const [intermediaryService, setIntermediaryService] = useState('gateway_bff');
  const [copied, setCopied] = useState(false);
  const [solved, setSolved] = useState(false);

  const exchangeResult = useMemo(() => {
    const sts = new OAuthTokenExchangeSimulator();
    sts.exchangeMode = exchangeMode;
    return sts.performExchange(subjectUser, intermediaryService);
  }, [exchangeMode, subjectUser, intermediaryService]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'oauth_token_exchange_master');
      }
    }
  };

  const handleCopyJwt = () => {
    navigator.clipboard.writeText(JSON.stringify(exchangeResult.issuedJwtClaims, null, 2));
    setCopied(true);
    triggerHaptic('SUCCESS');
    setTimeout(() => setCopied(false), 2000);
    handleClaim();
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <KeyRound size={14} /> OAuth 2.0 Security Extensions
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} /> RFC 8693 Token Exchange &amp; Delegation
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            🔑 OAuth 2.0 Token Exchange &amp; RFC 8693 Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Erkunde tokenbasierte Delegation und Impersonation in Microservice-Architekturen mit dem RFC 8693 Token Exchange Grant und dem `act` (Actor) Claim.
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> Token Exchange Bestätigen (+45 XP)
        </button>
      </div>

      {/* Mode Selection Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => { setExchangeMode('DELEGATION'); triggerHaptic('SELECTION'); }}
          className={`btn ${exchangeMode === 'DELEGATION' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '12px', textAlign: 'center' }}
        >
          <div style={{ fontWeight: 'bold' }}>1. Delegation (`act` Actor Claim)</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>Sicher: Kette von User &amp; Service</div>
        </button>

        <button
          onClick={() => { setExchangeMode('IMPERSONATION'); triggerHaptic('SELECTION'); }}
          className={`btn ${exchangeMode === 'IMPERSONATION' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '12px', textAlign: 'center' }}
        >
          <div style={{ fontWeight: 'bold' }}>2. Impersonation (Maskierung)</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>Service gibt sich direkt als User aus</div>
        </button>
      </div>

      {/* Input Parameters */}
      <div style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ flex: 1, minWidth: '180px' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Subject User:</label>
          <input
            type="text"
            value={subjectUser}
            onChange={(e) => setSubjectUser(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ flex: 1, minWidth: '180px' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Intermediary Service (Actor):</label>
          <input
            type="text"
            value={intermediaryService}
            onChange={(e) => setIntermediaryService(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* RFC 8693 POST Request & Downstream JWT Claims Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Token Request */}
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
            POST /oauth/token (RFC 8693 Request Payload):
          </span>
          <pre style={{ margin: 0, padding: '14px', background: '#090d16', color: '#38bdf8', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.78rem', lineHeight: '1.4', overflowX: 'auto' }}>
            {JSON.stringify(exchangeResult.requestPayload, null, 2)}
          </pre>
        </div>

        {/* Issued Downstream JWT */}
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
              Ausgestelltes Downstream JWT:
            </span>
            <button
              onClick={handleCopyJwt}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', fontSize: '0.75rem' }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Kopiert!' : 'JSON Kopieren'}
            </button>
          </div>

          <pre style={{ margin: 0, padding: '14px', background: '#090d16', color: '#10b981', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.78rem', lineHeight: '1.4', overflowX: 'auto' }}>
            {JSON.stringify(exchangeResult.issuedJwtClaims, null, 2)}
          </pre>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            {exchangeResult.description}
          </div>
        </div>
      </div>
    </div>
  );
}
