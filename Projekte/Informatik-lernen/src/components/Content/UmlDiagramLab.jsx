import React, { useState, useMemo } from 'react';
import { 
  Layers, Award, CheckCircle2, 
  Copy, ArrowRight, FileText
} from 'lucide-react';
import { 
  generateMermaidSequence, 
  validateSequenceDiagram, 
  generateMermaidActivity,
  DEFAULT_SEQUENCE_PARTICIPANTS,
  DEFAULT_SEQUENCE_MESSAGES,
  DEFAULT_ACTIVITY_STEPS 
} from '../../utils/umlEngine';
import { useStore } from '../../store/useStore';

export default function UmlDiagramLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [activeTab, setActiveTab] = useState('sequence');
  const [participants] = useState(DEFAULT_SEQUENCE_PARTICIPANTS);
  const [messages] = useState(DEFAULT_SEQUENCE_MESSAGES);
  const [activitySteps] = useState(DEFAULT_ACTIVITY_STEPS);
  const [copied, setCopied] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);

  const mermaidSequence = useMemo(() => {
    return generateMermaidSequence({ participants, messages });
  }, [participants, messages]);

  const sequenceValidation = useMemo(() => {
    return validateSequenceDiagram({ participants, messages });
  }, [participants, messages]);

  const mermaidActivity = useMemo(() => {
    return generateMermaidActivity({ steps: activitySteps });
  }, [activitySteps]);

  const handleClaimXP = () => {
    if (!xpClaimed) {
      if (onRewardXP) onRewardXP(45);
      else awardXP(45, 'uml_master');
      setXpClaimed(true);
    }
  };

  const handleCopyCode = () => {
    const code = activeTab === 'sequence' ? mermaidSequence : mermaidActivity;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                <Layers size={14} /> OMG UML 2.5 Standard
              </span>
              <span className="badge badge-teal">IHK AP1 &amp; AP2 Doku</span>
              <span className="badge badge-green">Mermaid.js Export</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0', color: 'var(--text-main)' }}>
              UML Studio (Sequenz- &amp; Aktivitätsdiagramme)
            </h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '750px', fontSize: '0.96rem', lineHeight: '1.6' }}>
              Modelliere synchrone/asynchrone Nachrichtenflüsse, Lifelines, Verzweigungs-Guards und Entscheidungsknoten. Validiere deine Diagramme nach IHK-Bewertungskriterien und exportiere sie direkt nach Mermaid.js.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={handleCopyCode}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Copy size={16} />
              {copied ? 'Kopiert!' : 'Mermaid Code kopieren'}
            </button>
            <button
              className="btn btn-primary"
              onClick={handleClaimXP}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Award size={18} />
              {xpClaimed ? 'XP erhalten!' : 'UML Meister (+45 XP)'}
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            className={`btn ${activeTab === 'sequence' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('sequence')}
          >
            📊 Sequenzdiagramm (Interaktion)
          </button>
          <button
            className={`btn ${activeTab === 'activity' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('activity')}
          >
            🔄 Aktivitätsdiagramm (Geschäftsprozess)
          </button>
        </div>
      </div>

      {activeTab === 'sequence' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Messages Flow List */}
          <div 
            className="glass-panel"
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)'
            }}
          >
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
              Nachrichtenabfolge (Chronologischer Aufruf)
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.map((m, idx) => (
                <div 
                  key={m.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <span style={{ fontWeight: 800, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    #{idx + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700 }}>
                      <span style={{ color: 'var(--accent-primary)' }}>{m.from}</span>
                      <ArrowRight size={13} color="var(--text-muted)" />
                      <span style={{ color: 'var(--accent-teal)' }}>{m.to}</span>
                      <span className="badge badge-indigo" style={{ fontSize: '0.68rem', marginLeft: 'auto' }}>
                        {m.type === 'reply' ? 'Rückgabe' : m.type === 'sync' ? 'Synchron' : 'Asynchron'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.88rem', marginTop: '4px', color: 'var(--text-main)', fontFamily: 'monospace' }}>
                      {m.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code & Validation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Validation Box */}
            <div 
              className="glass-panel"
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)'
              }}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="var(--accent-emerald)" />
                IHK Konformitäts-Audit
              </h3>
              {sequenceValidation.issues.length === 0 ? (
                <div style={{ color: 'var(--accent-emerald)', fontSize: '0.9rem' }}>
                  ✓ Keine Fehler oder Warnungen gefunden.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {sequenceValidation.issues.map((iss, i) => (
                    <div key={i} style={{ fontSize: '0.84rem', color: iss.type === 'error' ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>
                      • {iss.message}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mermaid Source Code */}
            <div 
              className="glass-panel"
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                flex: 1
              }}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--accent-primary)" />
                Mermaid.js Quellcode
              </h3>
              <pre style={{
                background: 'var(--bg-primary)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                overflowX: 'auto',
                border: '1px solid var(--border-color)',
                color: 'var(--accent-teal)'
              }}>
                {mermaidSequence}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        /* Activity Diagram View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div 
            className="glass-panel"
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)'
            }}
          >
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
              Geschäftsprozess Schritte &amp; Verzweigungen
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activitySteps.map((step) => (
                <div 
                  key={step.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--accent-primary)' }}>
                      [{step.id}]
                    </span>
                    <span className="badge badge-teal" style={{ fontSize: '0.68rem' }}>
                      {step.type}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {step.label}
                  </div>
                  {step.type === 'decision' && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      Ja ➔ {step.yesTarget} | Nein ➔ {step.noTarget}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div 
            className="glass-panel"
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)'
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--accent-primary)" />
              Mermaid.js Flowchart Code
            </h3>
            <pre style={{
              background: 'var(--bg-primary)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              overflowX: 'auto',
              border: '1px solid var(--border-color)',
              color: 'var(--accent-teal)'
            }}>
              {mermaidActivity}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
