import React, { useState, useMemo } from 'react';

import { Sparkles, Brain, Sliders, Activity, Play, Layers } from 'lucide-react';
import {
  SAMPLE_SENTENCES, calculateAttentionMatrix,
  sampleNextTokenDistribution, REACT_AGENT_SAMPLE_RUN
} from '../../utils/transformerAttentionEngine';

export default function TransformerAttentionLab() {
  const [activeTab, setActiveTab] = useState('attention'); // 'attention' | 'sampling' | 'react_agent'

  // Attention State
  const [selectedSentenceId, setSelectedSentenceId] = useState('s1');
  const [hoveredTokenIdx, setHoveredTokenIdx] = useState(null);

  // Sampling State
  const [temperature, setTemperature] = useState(0.7);
  const [topK, setTopK] = useState(5);
  const [topP, setTopP] = useState(0.9);
  const [candidateTokens] = useState([
    { token: 'PostgreSQL', logit: 4.8 },
    { token: 'Redis Cache', logit: 3.9 },
    { token: 'MongoDB', logit: 3.2 },
    { token: 'SQLite DB', logit: 2.4 },
    { token: 'Cassandra', logit: 1.6 },
    { token: 'DynamoDB', logit: 1.1 }
  ]);

  // ReAct State
  const [reactCurrentStep, setReactCurrentStep] = useState(REACT_AGENT_SAMPLE_RUN.steps.length);

  // Active Sentence Tokens & Matrix
  const activeSentence = SAMPLE_SENTENCES.find(s => s.id === selectedSentenceId) || SAMPLE_SENTENCES[0];
  const tokens = useMemo(() => activeSentence.text.split(' '), [activeSentence]);
  const attentionMatrix = useMemo(() => calculateAttentionMatrix(tokens), [tokens]);

  // Sampled Probabilities
  const samplingResults = useMemo(() => {
    return sampleNextTokenDistribution(candidateTokens, temperature, topK, topP);
  }, [candidateTokens, temperature, topK, topP]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-indigo"><Brain size={14} /> KI &amp; Deep Learning</span>
              <span className="badge badge-teal"><Sparkles size={14} /> Transformer Attention &amp; LLM Studio</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
              Transformer Self-Attention &amp; LLM Playground
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px', maxWidth: '750px', fontSize: '0.95rem' }}>
              Erforsche die Funktionsweise moderner Large Language Models: Scaled Dot-Product Self-Attention Heatmaps, Temperature &amp; Top-P Sampling sowie autonome AI-Agenten ReAct-Loops.
            </p>
          </div>

          {/* Sub Navigation */}
          <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-secondary)', padding: '6px', borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => setActiveTab('attention')}
              className={`btn ${activeTab === 'attention' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '8px 16px', fontSize: '0.88rem' }}
            >
              <Brain size={16} /> Self-Attention Matrix
            </button>
            <button
              onClick={() => setActiveTab('sampling')}
              className={`btn ${activeTab === 'sampling' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '8px 16px', fontSize: '0.88rem' }}
            >
              <Sliders size={16} /> Token Sampling &amp; Temperature
            </button>
            <button
              onClick={() => setActiveTab('react_agent')}
              className={`btn ${activeTab === 'react_agent' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '8px 16px', fontSize: '0.88rem' }}
            >
              <Activity size={16} /> AI Agent ReAct-Loop
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'attention' && (
        <div className="space-y-6">
          {/* Sentence Selector Bar */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Beispielsatz auswählen:
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {SAMPLE_SENTENCES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSentenceId(s.id)}
                  className={`btn ${selectedSentenceId === s.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '8px 14px', fontSize: '0.88rem' }}
                >
                  "{s.text}"
                </button>
              ))}
            </div>
          </div>

          {/* Attention Heatmap Matrix */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--accent-teal)" /> Scaled Dot-Product Attention Heatmap (QK^T / sqrt(d_k))
            </h2>

            <div style={{ overflowX: 'auto', padding: '10px 0' }}>
              <table style={{ borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.85rem', margin: '0 auto' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px', color: 'var(--text-muted)' }}>Q \ K</th>
                    {tokens.map((tok, j) => (
                      <th key={j} style={{ padding: '8px 12px', fontWeight: '700', color: hoveredTokenIdx === j ? 'var(--accent-teal)' : 'var(--text-main)' }}>
                        {tok}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((qTok, i) => (
                    <tr key={i}>
                      <td style={{ padding: '8px 12px', fontWeight: '700', textAlign: 'right', color: hoveredTokenIdx === i ? 'var(--accent-teal)' : 'var(--text-main)' }}>
                        {qTok}
                      </td>
                      {attentionMatrix[i]?.map((weight, j) => {
                        const intensity = Math.min(1, weight * 2.5);
                        return (
                          <td
                            key={j}
                            onMouseEnter={() => setHoveredTokenIdx(i)}
                            onMouseLeave={() => setHoveredTokenIdx(null)}
                            style={{
                              padding: '10px 14px',
                              background: `rgba(99, 102, 241, ${intensity})`,
                              color: intensity > 0.4 ? '#ffffff' : 'var(--text-muted)',
                              fontWeight: intensity > 0.4 ? '800' : 'normal',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            title={`Attention (${qTok} -> ${tokens[j]}): ${(weight * 100).toFixed(1)}%`}
                          >
                            {(weight * 100).toFixed(0)}%
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '16px', textAlign: 'center' }}>
              💡 <strong>Erklärung:</strong> Hohe Prozentwerte zeigen an, welche Wörter im Kontext besonders stark aufeinander achten (z. B. Pronomen "er" auf "Server").
            </p>
          </div>
        </div>
      )}

      {activeTab === 'sampling' && (
        <div className="space-y-6">
          {/* Hyperparameter Sliders */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} color="var(--accent-indigo)" /> Sampling Hyperparameter Steuerung
            </h2>

            <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {/* Temperature */}
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Temperature (T)</span>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: '800' }}>{temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.8"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                  Niedrig = deterministisch, Hoch = kreativ / chaotisch.
                </span>
              </div>

              {/* Top-K */}
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Top-K Filter</span>
                  <span style={{ color: 'var(--accent-teal)', fontWeight: '800' }}>{topK} Tokens</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="1"
                  value={topK}
                  onChange={(e) => setTopK(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                  Beschränkt Auswahl auf die K wahrscheinlichsten Tokens.
                </span>
              </div>

              {/* Top-P */}
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Top-P (Nucleus)</span>
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: '800' }}>{(topP * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="1.0"
                  step="0.05"
                  value={topP}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                  Kumulative Wahrscheinlichkeitsschwelle.
                </span>
              </div>
            </div>
          </div>

          {/* Probability Distribution Visualizer */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>
              Wahrscheinlichkeitsverteilung des nächsten Tokens (P(Token))
            </h2>

            <div className="space-y-3">
              {samplingResults.map(item => (
                <div key={item.token} style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.92rem' }}>
                    <span style={{ fontWeight: '700', fontFamily: 'monospace' }}>"{item.token}"</span>
                    <span style={{ fontWeight: '800', color: 'var(--accent-teal)' }}>{item.percentage}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${item.percentage}%`,
                        background: 'var(--gradient-cyber)',
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'react_agent' && (
        <div className="space-y-6">
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} color="var(--accent-teal)" /> Autonomer AI-Agent: ReAct-Ablauf (Reason + Act)
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
                  Ziel: <strong>{REACT_AGENT_SAMPLE_RUN.goal}</strong>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setReactCurrentStep(prev => Math.min(REACT_AGENT_SAMPLE_RUN.steps.length, prev + 1))}
                  className="btn btn-primary"
                  style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                >
                  <Play size={14} /> Nächster Schritt
                </button>
                <button
                  onClick={() => setReactCurrentStep(1)}
                  className="btn btn-ghost"
                  style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Steps Timeline */}
            <div className="space-y-3">
              {REACT_AGENT_SAMPLE_RUN.steps.slice(0, reactCurrentStep).map(step => (
                <div
                  key={step.step}
                  style={{
                    background: 'var(--bg-secondary)',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: `4px solid ${step.type === 'Thought' ? 'var(--accent-indigo)' : step.type === 'Action' ? 'var(--accent-amber)' : step.type === 'Observation' ? 'var(--accent-cyan)' : 'var(--accent-emerald)'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-indigo" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                      Schritt {step.step}: {step.type}
                    </span>
                    {step.tool && (
                      <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--accent-amber)' }}>
                        Tool: {step.tool}()
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                    {step.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
