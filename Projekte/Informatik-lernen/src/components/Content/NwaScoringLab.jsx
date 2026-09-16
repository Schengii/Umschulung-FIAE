import React, { useState, useMemo } from 'react';
import { 
  Calculator, Award, CheckCircle2, AlertTriangle, 
  Copy, FileText
} from 'lucide-react';
import { 
  calculateNwa, 
  generateNwaMarkdownReport, 
  DEFAULT_NWA_CRITERIA, 
  DEFAULT_NWA_OPTIONS 
} from '../../utils/nwaEngine';
import { useStore } from '../../store/useStore';

export default function NwaScoringLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [criteria, setCriteria] = useState(DEFAULT_NWA_CRITERIA);
  const [options, setOptions] = useState(DEFAULT_NWA_OPTIONS);
  const [copied, setCopied] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);

  const analysis = useMemo(() => {
    return calculateNwa({ criteria, options });
  }, [criteria, options]);

  const handleScoreChange = (optionId, critId, val) => {
    const score = Math.max(0, Math.min(10, Number(val) || 0));
    setOptions(prev => prev.map(opt => {
      if (opt.id !== optionId) return opt;
      return {
        ...opt,
        scores: { ...opt.scores, [critId]: score }
      };
    }));
  };

  const handleWeightChange = (critId, val) => {
    const weight = Math.max(0, Math.min(100, Number(val) || 0));
    setCriteria(prev => prev.map(c => c.id === critId ? { ...c, weight } : c));
  };

  const handleToggleKo = (critId) => {
    setCriteria(prev => prev.map(c => c.id === critId ? { ...c, isKo: !c.isKo } : c));
  };

  const handleMinScoreChange = (critId, val) => {
    const minScore = Math.max(1, Math.min(10, Number(val) || 1));
    setCriteria(prev => prev.map(c => c.id === critId ? { ...c, minScore } : c));
  };

  const handleCopyReport = () => {
    const report = generateNwaMarkdownReport(analysis);
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    if (!xpAwarded) {
      if (onRewardXP) onRewardXP(50);
      else awardXP(50, 'nwa_master');
      setXpAwarded(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div 
        className="glass-panel"
        style={{
          padding: '28px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-indigo" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calculator size={14} /> IHK Projekt-Standard
              </span>
              <span className="badge badge-teal">AO 2020 Konform</span>
              {analysis.isWeightValid ? (
                <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} /> Gewichtung 100%
                </span>
              ) : (
                <span className="badge badge-red" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={13} /> Summe: {analysis.totalWeight}% (Soll 100%)
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0', color: 'var(--text-main)' }}>
              IHK Nutzwertanalyse Studio (NWA)
            </h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '720px', fontSize: '0.96rem', lineHeight: '1.6' }}>
              Begründe technische und wirtschaftliche Architekturentscheidungen für deine IHK-Projektdokumentation und das Fachgespräch. Mit K.O.-Kriterien-Prüfung, Gewichtungsmatrix und Markdown-Export.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleCopyReport}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
            {copied ? 'Bericht kopiert!' : 'IHK Bericht exportieren (+50 XP)'}
          </button>
        </div>
      </div>

      {/* Best Option Highlight Banner */}
      {analysis.bestOption && (
        <div
          className="glass-panel"
          style={{
            padding: '20px 24px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(13, 148, 136, 0.1) 100%)',
            border: '2px solid var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ fontSize: '2.4rem' }}>🏆</div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                Wirtschaftlichkeits- &amp; Eignungssieger (Rang 1)
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {analysis.bestOption.name}
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Nutzwert: <strong>{analysis.bestOption.finalScore} / 10 Punkte</strong> ({analysis.bestOption.utilityPercent}% Zielerreichung)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Verifiziert nach IHK-Bewertungsschema
            </span>
          </div>
        </div>
      )}

      {/* Matrix Configuration Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Kriterien Tabelle */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)'
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--accent-primary)" />
            1. Bewertungskriterien &amp; Gewichtung
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {criteria.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{c.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={c.weight}
                      onChange={(e) => handleWeightChange(c.id, e.target.value)}
                      style={{
                        width: '60px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        fontWeight: 700,
                        textAlign: 'right'
                      }}
                    />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>%</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={c.isKo}
                      onChange={() => handleToggleKo(c.id)}
                    />
                    <span style={{ color: c.isKo ? 'var(--accent-rose)' : 'inherit', fontWeight: c.isKo ? 700 : 400 }}>
                      K.O.-Kriterium
                    </span>
                  </label>

                  {c.isKo && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>Mindestpunkte:</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={c.minScore}
                        onChange={(e) => handleMinScoreChange(c.id, e.target.value)}
                        style={{ width: '45px', padding: '2px 4px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alternativen & Scoring */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)'
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="var(--accent-teal)" />
            2. Handlungsalternativen bewerten (0 - 10 Punkte)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {options.map((opt) => {
              const res = analysis.results.find(r => r.id === opt.id);
              return (
                <div
                  key={opt.id}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: res?.isDisqualified ? 'rgba(225, 29, 72, 0.05)' : 'var(--bg-tertiary)',
                    border: res?.isDisqualified ? '1px solid var(--accent-rose)' : '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>{opt.name}</span>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>{opt.description}</p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      {res?.isDisqualified ? (
                        <span className="badge badge-red" style={{ fontSize: '0.78rem' }}>❌ K.O. Ausgeschieden</span>
                      ) : (
                        <span className="badge badge-indigo" style={{ fontSize: '0.85rem' }}>
                          Score: {res?.finalScore} Pkt. ({res?.utilityPercent}%)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Kriterium Slider / Inputs */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                    {criteria.map((crit) => (
                      <div key={crit.id} style={{ fontSize: '0.8rem' }}>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={crit.name}>
                          {crit.name.split(' ')[0]} ({crit.weight}%)
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={opt.scores[crit.id] ?? 0}
                          onChange={(e) => handleScoreChange(opt.id, crit.id, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '4px 6px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-card)',
                            fontWeight: 700
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {res?.isDisqualified && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={14} />
                      Unterschreitet K.O.-Kriterium: {res.koViolations.map(k => `${k.criterionName} (${k.score}/${k.required} Pkt.)`).join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
