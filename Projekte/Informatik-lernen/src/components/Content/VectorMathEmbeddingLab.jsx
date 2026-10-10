import React, { useState, useMemo } from 'react';
import {
  Brain, Compass, Award, Layers
} from 'lucide-react';
import {
  normalizeVector, analyzeVectorMetrics
} from '../../utils/vectorMathEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function VectorMathEmbeddingLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [vecA, setVecA] = useState([0.75, 0.45, 0.20, 0.10]);
  const [vecB, setVecB] = useState([0.65, 0.55, 0.15, 0.30]);
  const [solved, setSolved] = useState(false);

  const metrics = useMemo(() => {
    return analyzeVectorMetrics(vecA, vecB);
  }, [vecA, vecB]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(65);
      } else {
        awardXP(65, 'vector_math_master');
      }
    }
  };

  const handleNormalizeBoth = () => {
    setVecA(normalizeVector(vecA));
    setVecB(normalizeVector(vecB));
    triggerHaptic('SUCCESS');
  };

  const loadPreset = (type) => {
    if (type === 'orthogonal') {
      setVecA([1.0, 0.0, 0.0, 0.0]);
      setVecB([0.0, 1.0, 0.0, 0.0]);
    } else if (type === 'similar') {
      setVecA([0.5, 0.8, 0.3, 0.1]);
      setVecB([0.48, 0.82, 0.31, 0.09]);
    } else if (type === 'opposite') {
      setVecA([0.6, 0.8, 0.0, 0.0]);
      setVecB([-0.6, -0.8, 0.0, 0.0]);
    }
    triggerHaptic('SUCCESS');
  };

  return (
    <div className="container-responsive" style={{ padding: '24px 16px', color: 'var(--text-main)' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Brain size={14} /> AI &amp; LLM Vector Mathematics
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Compass size={14} /> High-Dimensional Distance Metrics
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            📐 Vektor-Mathematik &amp; Embedding-Distanz Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '850px' }}>
            Mathematisches Fundament moderner Vektordatenbanken (Pinecone, Qdrant, Milvus, ChromaDB): Berechne Cosine-Similarity, Euklidische L2-Distanz, Manhattan L1-Abstand und Skalarprodukte in Echtzeit.
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> {solved ? 'Vektor-Meister' : 'Lab Validieren (+65 XP)'}
        </button>
      </div>

      {/* Preset Controls */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} color="var(--accent-primary)" />
          <strong>Vektor-Presets:</strong>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => loadPreset('similar')} className="btn btn-outline btn-sm">
            Semantisch Ähnlich (Cos ≈ 0.99)
          </button>
          <button onClick={() => loadPreset('orthogonal')} className="btn btn-outline btn-sm">
            Orthogonal (90° Winkel, Cos = 0.0)
          </button>
          <button onClick={() => loadPreset('opposite')} className="btn btn-outline btn-sm" style={{ color: 'var(--accent-rose)' }}>
            Gegensätzlich (180° Winkel, Cos = -1.0)
          </button>
          <button onClick={handleNormalizeBoth} className="btn btn-primary btn-sm">
            L2-Normalisieren (||v|| = 1.0)
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Cosine Similarity:</span>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--accent-emerald)', marginTop: '4px' }}>
            {metrics.cosineSimilarity}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Winkel: {metrics.angularDegree}°</span>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Euklidische Distanz (L2):</span>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--accent-cyan)', marginTop: '4px' }}>
            {metrics.euclideanDistance}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Geometrischer Abstand im Raum</span>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Skalarprodukt (Dot Product):</span>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--accent-primary)', marginTop: '4px' }}>
            {metrics.dotProduct}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bei Normalisierung = Cosine Sim</span>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Manhattan Distanz (L1):</span>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--accent-amber)', marginTop: '4px' }}>
            {metrics.manhattanDistance}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Summe der Achsen-Abschnitte</span>
        </div>
      </div>

      {/* Vector Sliders */}
      <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Vektor A */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '1.05rem', fontWeight: '800', display: 'flex', justifyContent: 'space-between' }}>
            <span>Vektor A (Dimensionen 1..4)</span>
            <span className="badge badge-indigo">||A|| = {metrics.magnitudeA}</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {vecA.map((val, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Dimension {idx + 1}</span>
                  <code>{val.toFixed(2)}</code>
                </div>
                <input
                  type="range"
                  min="-1.0"
                  max="1.0"
                  step="0.05"
                  value={val}
                  onChange={(e) => {
                    const next = [...vecA];
                    next[idx] = parseFloat(e.target.value);
                    setVecA(next);
                  }}
                  style={{ width: '100%' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Vektor B */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '1.05rem', fontWeight: '800', display: 'flex', justifyContent: 'space-between' }}>
            <span>Vektor B (Dimensionen 1..4)</span>
            <span className="badge badge-emerald">||B|| = {metrics.magnitudeB}</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {vecB.map((val, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Dimension {idx + 1}</span>
                  <code>{val.toFixed(2)}</code>
                </div>
                <input
                  type="range"
                  min="-1.0"
                  max="1.0"
                  step="0.05"
                  value={val}
                  onChange={(e) => {
                    const next = [...vecB];
                    next[idx] = parseFloat(e.target.value);
                    setVecB(next);
                  }}
                  style={{ width: '100%' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
