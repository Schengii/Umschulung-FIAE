import React, { useState } from 'react';
import { 
  Lock, Key, ShieldAlert, 
  RefreshCw, Check, Award, Server, Terminal
} from 'lucide-react';
import { OAuthRevocationIntrospectionEngine } from '../../utils/oauthRevocationIntrospectionEngine';
import { useStore } from '../../store/useStore';

export default function OauthRevocationIntrospectionLab() {
  const { awardXP } = useStore();
  const [engine] = useState(() => new OAuthRevocationIntrospectionEngine());
  const [tokens, setTokens] = useState(() => engine.getAllTokens());
  const [selectedToken, setSelectedToken] = useState('at_valid_9921');
  const [introspectionResult, setIntrospectionResult] = useState(null);
  const [revocationLog, setRevocationLog] = useState([]);
  const [xpAwarded, setXpAwarded] = useState(false);

  // New token form
  const [newSub, setNewSub] = useState('employee@enterprise.de');
  const [newScope, setNewScope] = useState('api:read api:write');
  const [newType, setNewType] = useState('access_token');

  const refreshList = () => {
    setTokens(engine.getAllTokens());
  };

  const handleIntrospect = (tokStr = selectedToken) => {
    const res = engine.introspect(tokStr, 'api_gateway_service');
    setIntrospectionResult(res);
  };

  const handleRevoke = (tokStr = selectedToken) => {
    const res = engine.revoke(tokStr);
    setRevocationLog((prev) => [
      {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        token: tokStr,
        ...res
      },
      ...prev.slice(0, 7)
    ]);
    refreshList();
    handleIntrospect(tokStr);

    if (!xpAwarded) {
      setXpAwarded(true);
      awardXP(65, 'oauth_revocation_master');
    }
  };

  const handleCreateToken = (e) => {
    e.preventDefault();
    const created = engine.issueToken(newSub, newScope, newType);
    refreshList();
    setSelectedToken(created.token);
    handleIntrospect(created.token);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-main)' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '16px',
        marginBottom: '24px',
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(245, 158, 11, 0.25)'
          }}>
            <Lock size={26} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
              OAuth 2.0 Token Revocation & Introspection Studio
            </h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              RFC 7009 Token Revocation & RFC 7662 Token Introspection am API Gateway
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {xpAwarded ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'rgba(16, 185, 129, 0.2)', 
              color: '#10b981', 
              padding: '6px 14px', 
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
              <Check size={16} /> 65 XP erhalten!
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'rgba(245, 158, 11, 0.15)', 
              color: '#f59e0b', 
              padding: '6px 14px', 
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
              <Award size={16} /> 65 XP verfügbar
            </div>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Token Inventory */}
        <div style={{
          background: 'var(--surface-card, #1e293b)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: 0, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} color="#f59e0b" /> Aktiver Token-Speicher (Auth-Server)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tokens.map((t) => {
              const isSelected = t.token === selectedToken;
              const isRevoked = t.revokedAt !== null;
              const isExpired = Math.floor(Date.now() / 1000) >= t.exp;

              return (
                <div 
                  key={t.token}
                  onClick={() => {
                    setSelectedToken(t.token);
                    handleIntrospect(t.token);
                  }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(245, 158, 11, 0.15)' : 'rgba(0, 0, 0, 0.2)',
                    border: isSelected ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <code style={{ fontSize: '0.88rem', fontWeight: 600, color: isSelected ? '#f59e0b' : 'var(--text-main)' }}>
                      {t.token}
                    </code>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      background: isRevoked ? 'rgba(239, 68, 68, 0.2)' : isExpired ? 'rgba(148, 163, 184, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: isRevoked ? '#ef4444' : isExpired ? '#94a3b8' : '#10b981'
                    }}>
                      {isRevoked ? 'Revoked' : isExpired ? 'Expired' : 'Active'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Typ: <strong>{t.tokenType}</strong></span>
                    <span>Sub: {t.sub}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Create Token Mini-Form */}
          <form onSubmit={handleCreateToken} style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h3 style={{ fontSize: '0.9rem', margin: '0 0 10px 0', color: 'var(--text-muted)' }}>Neuen Test-Token ausstellen</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input 
                type="text" 
                value={newSub} 
                onChange={(e) => setNewSub(e.target.value)} 
                placeholder="Subject (Nutzer-ID)" 
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  color: '#ffffff',
                  fontSize: '0.85rem'
                }}
              />
              <input 
                type="text" 
                value={newScope} 
                onChange={(e) => setNewScope(e.target.value)} 
                placeholder="Scope (z. B. api:read)" 
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  color: '#ffffff',
                  fontSize: '0.85rem'
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <select 
                  value={newType} 
                  onChange={(e) => setNewType(/** @type {'access_token' | 'refresh_token'} */ (e.target.value))}
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    flex: 1
                  }}
                >
                  <option value="access_token">Access Token</option>
                  <option value="refresh_token">Refresh Token</option>
                </select>
                <button
                  type="submit"
                  style={{
                    background: '#f59e0b',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 14px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Ausstellen
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Introspection & Actions Panel */}
        <div style={{
          background: 'var(--surface-card, #1e293b)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: 0, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} color="#3b82f6" /> API Gateway Token-Inspektion
          </h2>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <button
              onClick={() => handleIntrospect()}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={16} /> RFC 7662 Introspect
            </button>
            <button
              onClick={() => handleRevoke()}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <ShieldAlert size={16} /> RFC 7009 Revoke
            </button>
          </div>

          {/* Introspection Result Box */}
          <div style={{
            flex: 1,
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '10px',
            padding: '14px',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            overflowX: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.78rem' }}>
              POST /oauth/introspect (RFC 7662 Response)
            </div>
            {introspectionResult ? (
              <pre style={{ margin: 0, color: introspectionResult.active ? '#10b981' : '#ef4444' }}>
                {JSON.stringify(introspectionResult, null, 2)}
              </pre>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>Wähle einen Token und klicke auf "RFC 7662 Introspect"</span>
            )}
          </div>
        </div>

      </div>

      {/* Revocation Audit Log */}
      <div style={{
        background: 'var(--surface-card, #1e293b)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={18} color="#a855f7" /> RFC 7009 Revocation Log & Audit Trail
        </h3>
        {revocationLog.length === 0 ? (
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Noch keine Tokens revidiert. Klicke auf "RFC 7009 Revoke", um die serverseitige Entwertung und Kaskadierung zu simulieren.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {revocationLog.map((log) => (
              <div key={log.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.82rem'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>[{log.timestamp}]</span>
                <span style={{ fontWeight: 600, color: '#f59e0b' }}>{log.token}</span>
                <span style={{ color: '#10b981' }}>HTTP {log.httpStatus} OK</span>
                <span style={{ color: 'var(--text-muted)' }}>{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
