import React, { useState, useMemo } from 'react';
import { 
  Globe, Award, Check, Network, Layers
} from 'lucide-react';
import { 
  DEFAULT_BGP_CANDIDATES, 
  selectBestBgpPath 
} from '../../utils/bgpPathSelectionEngine';
import { useStore } from '../../store/useStore';

export default function BgpPathSelectionLab() {
  const { awardXP } = useStore();
  const [candidates, setCandidates] = useState(DEFAULT_BGP_CANDIDATES);
  const [xpAwarded, setXpAwarded] = useState(false);

  const evaluation = useMemo(() => {
    return selectBestBgpPath(candidates);
  }, [candidates]);

  const updateCandidate = (index, field, value) => {
    setCandidates((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value
      };
      return copy;
    });

    if (!xpAwarded) {
      setXpAwarded(true);
      awardXP(65, 'bgp_path_selection_master');
    }
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
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.25)'
          }}>
            <Globe size={26} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
              BGP Path Selection & Decision Algorithm Studio
            </h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              RFC 4271 8-Stufen-Entscheidungsprozess: Weight, LocalPref, AS-Path, Origin, MED & Tie-Breaker
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
              background: 'rgba(59, 130, 246, 0.15)', 
              color: '#3b82f6', 
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

      {/* Winning Route Banner */}
      <div style={{
        background: 'rgba(16, 185, 129, 0.12)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ★ Aktiver BGP Best-Path (Gewinner-Route)
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
            {evaluation.bestRoute?.peerName} ({evaluation.bestRoute?.prefix})
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Entschieden durch Kriterium: <strong style={{ color: '#10b981' }}>{evaluation.winningCriteria}</strong>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
          <span style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '8px' }}>
            LocalPref: <strong>{evaluation.bestRoute?.localPref}</strong>
          </span>
          <span style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '8px' }}>
            AS-Path: <strong>{evaluation.bestRoute?.asPath.join(' -> ')}</strong>
          </span>
          <span style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '8px' }}>
            MED: <strong>{evaluation.bestRoute?.med}</strong>
          </span>
        </div>
      </div>

      {/* Candidates List & Editor */}
      <div style={{
        background: 'var(--surface-card, #1e293b)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '24px'
      }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Network size={18} color="#3b82f6" /> BGP Peer Route Candidates (Attribute modifizieren)
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {candidates.map((c, i) => {
            const isWinner = evaluation.bestRoute?.peerName === c.peerName;
            return (
              <div 
                key={c.peerName}
                style={{
                  background: isWinner ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0, 0, 0, 0.25)',
                  border: isWinner ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: isWinner ? '#10b981' : '#ffffff' }}>
                    {c.peerName} {isWinner && '★'}
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', padding: '2px 8px', borderRadius: '12px' }}>
                    {c.peerType}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ color: 'var(--text-muted)' }}>Local Preference:</label>
                    <input 
                      type="number"
                      value={c.localPref}
                      onChange={(e) => updateCandidate(i, 'localPref', parseInt(e.target.value, 10) || 0)}
                      style={{ width: '80px', padding: '4px 8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#ffffff', textAlign: 'center' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ color: 'var(--text-muted)' }}>Weight (Cisco Local):</label>
                    <input 
                      type="number"
                      value={c.weight}
                      onChange={(e) => updateCandidate(i, 'weight', parseInt(e.target.value, 10) || 0)}
                      style={{ width: '80px', padding: '4px 8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#ffffff', textAlign: 'center' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ color: 'var(--text-muted)' }}>MED (Metric):</label>
                    <input 
                      type="number"
                      value={c.med}
                      onChange={(e) => updateCandidate(i, 'med', parseInt(e.target.value, 10) || 0)}
                      style={{ width: '80px', padding: '4px 8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#ffffff', textAlign: 'center' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ color: 'var(--text-muted)' }}>AS-Path Länge:</label>
                    <span style={{ fontWeight: 600 }}>{c.asPath.length} Hops ({c.asPath.join(', ')})</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ color: 'var(--text-muted)' }}>Origin Code:</label>
                    <select
                      value={c.origin}
                      onChange={(e) => updateCandidate(i, 'origin', e.target.value)}
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#ffffff', padding: '4px 8px' }}
                    >
                      <option value="IGP">IGP (Priorität 1)</option>
                      <option value="EGP">EGP (Priorität 2)</option>
                      <option value="INCOMPLETE">INCOMPLETE (Priorität 3)</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decision Steps Audit */}
      <div style={{
        background: 'var(--surface-card, #1e293b)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <h3 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="#3b82f6" /> RFC 4271 Entscheidungsprotokoll (Eliminierungs-Schritte)
        </h3>
        {evaluation.decisionSteps.length === 0 ? (
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Alle Kriterien gleich. Gewinner via Router-ID Tie-breaker ermittelt.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {evaluation.decisionSteps.map((step) => (
              <div key={step.name} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem'
              }}>
                <span style={{ fontWeight: 600, color: '#3b82f6' }}>Stufe {step.step}: {step.name}</span>
                <span style={{ color: 'var(--text-muted)' }}>{step.description}</span>
                <span style={{ color: '#ef4444', fontWeight: 600 }}>Eliminiert: {step.eliminated.join(', ')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
