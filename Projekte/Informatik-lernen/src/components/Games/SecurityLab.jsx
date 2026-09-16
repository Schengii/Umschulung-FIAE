import React, { useState } from 'react';
import { SECURITY_LAB_SCENARIOS } from '../../data/gamesData';
import { ShieldAlert, ShieldCheck, Bug, AlertTriangle } from 'lucide-react';

export default function SecurityLab({ onCompleteGame }) {
  const [labIdx, setLabIdx] = useState(0);
  const currentLab = SECURITY_LAB_SCENARIOS[labIdx];

  const [selectedOpt, setSelectedOpt] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [completedLabs, setCompletedLabs] = useState([]);

  const handleSelectOption = (opt) => {
    setSelectedOpt(opt.id);
    setFeedback(opt);

    if (opt.isCorrect && !completedLabs.includes(currentLab.id)) {
      setCompletedLabs(prev => [...prev, currentLab.id]);
      onCompleteGame(currentLab.id, 80);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={28} color="var(--accent-rose)" /> Cyber Defense Lab
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Analysiere echten Quellcode auf Sicherheitslücken und wende Security-Fixes an.
          </p>
        </div>

        {/* Lab selector */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {SECURITY_LAB_SCENARIOS.map((lab, idx) => (
            <button
              key={lab.id}
              onClick={() => {
                setLabIdx(idx);
                setSelectedOpt(null);
                setFeedback(null);
              }}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: labIdx === idx ? 'var(--gradient-rose)' : 'var(--bg-tertiary)',
                color: '#fff',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              Lab #{idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span className="badge badge-rose">{currentLab.title}</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', fontWeight: '700' }}>+80 XP</span>
        </div>

        {/* Threat Banner */}
        <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid var(--accent-rose)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle size={24} color="var(--accent-rose)" />
          <div>
            <strong style={{ color: 'var(--accent-rose)' }}>Gefahrenmeldung:</strong>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{currentLab.threat}</p>
          </div>
        </div>

        {/* Vulnerable Code snippet */}
        {currentLab.codeVulnerable && (
          <div className="code-window" style={{ marginBottom: '24px' }}>
            <div className="code-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-rose)' }}>
                <Bug size={16} /> Verwundbarer Code-Auszug
              </span>
              <span>UNSICHER</span>
            </div>
            <pre className="code-body">
              <code>{currentLab.codeVulnerable}</code>
            </pre>
          </div>
        )}

        {/* Options / Solutions */}
        <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px' }}>
          Wie behebst du diese Sicherheitslücke?
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {currentLab.options.map(opt => {
            const isSelected = selectedOpt === opt.id;
            let bg = 'var(--bg-secondary)';
            let border = 'var(--border-color)';

            if (isSelected) {
              bg = opt.isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)';
              border = opt.isCorrect ? 'var(--accent-green)' : 'var(--accent-rose)';
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt)}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: bg,
                  border: `1px solid ${border}`,
                  color: 'var(--text-main)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.92rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Patch Feedback & Fixed Code */}
        {feedback && (
          <div style={{
            background: feedback.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            border: `1px solid ${feedback.isCorrect ? 'var(--accent-green)' : 'var(--accent-rose)'}`,
            padding: '20px',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: feedback.isCorrect ? 'var(--accent-green)' : 'var(--accent-rose)', fontWeight: '700', marginBottom: '8px' }}>
              {feedback.isCorrect ? <ShieldCheck size={24} /> : <AlertTriangle size={24} />}
              <span>{feedback.feedback}</span>
            </div>

            {feedback.isCorrect && feedback.codeFixed && (
              <div className="code-window" style={{ marginTop: '16px' }}>
                <div className="code-header">
                  <span style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} /> Gehärteter & Geschützter Code
                  </span>
                  <span>SECURE FIX</span>
                </div>
                <pre className="code-body">
                  <code>{feedback.codeFixed}</code>
                </pre>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
