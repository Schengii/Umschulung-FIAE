import React, { useState } from 'react';
import { Database, Sparkles } from 'lucide-react';

const DOCUMENT_CORPUS = [
  { id: 1, title: 'Python Basics', text: 'Python ist eine einfach zu lernende, interpretierte Programmiersprache mit klarer Syntax.', vector: [0.82, 0.15, 0.94, 0.05, 0.78] },
  { id: 2, title: 'JavaScript & React', text: 'JavaScript läuft im Browser und Server. React ist eine deklarative Komponenten-Bibliothek.', vector: [0.75, 0.88, 0.21, 0.65, 0.42] },
  { id: 3, title: 'Docker Container', text: 'Docker isoliert Anwendungen in leichten Containern für konsistente Deployments.', vector: [0.12, 0.34, 0.08, 0.92, 0.85] },
  { id: 4, title: 'Kubernetes Cluster', text: 'Kubernetes orchestriert automatisierte Skalierung, Failover und Container-Pods.', vector: [0.18, 0.29, 0.05, 0.95, 0.89] },
  { id: 5, title: 'Deep Learning & Neural Networks', text: 'Künstliche Neuronal Netzwerke nutzen Backpropagation zur Bild- und Textverarbeitung.', vector: [0.91, 0.05, 0.85, 0.40, 0.30] }
];

export default function VectorSearchLab({ onRewardXP }) {
  const [queryText, setQueryText] = useState('Wie lerne ich Skriptsprachen und Frontend Development?');
  const [queryVector, setQueryVector] = useState([0.78, 0.72, 0.45, 0.50, 0.55]);
  const [results, setResults] = useState(null);

  // Compute Cosine Similarity between two N-dimensional vectors
  const calculateCosineSimilarity = (vecA, vecB) => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return (dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))).toFixed(4);
  };

  const handleRunVectorSearch = () => {
    // Generate simulated query vector based on text
    const textLen = queryText.length;
    const simVector = [
      Math.abs(Math.sin(textLen * 0.1)).toFixed(2),
      Math.abs(Math.cos(textLen * 0.2)).toFixed(2),
      Math.abs(Math.sin(textLen * 0.3)).toFixed(2),
      Math.abs(Math.cos(textLen * 0.4)).toFixed(2),
      Math.abs(Math.sin(textLen * 0.5)).toFixed(2)
    ].map(Number);

    setQueryVector(simVector);

    const scoredDocs = DOCUMENT_CORPUS.map(doc => {
      const score = calculateCosineSimilarity(simVector, doc.vector);
      return { ...doc, score: Number(score) };
    }).sort((a, b) => b.score - a.score);

    setResults(scoredDocs);
    if (onRewardXP) onRewardXP(35);
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Database size={14} /> AI & RAG Vector Search Engine
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            🧠 Local RAG Vector Database & Embedding Explorer
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Berechne Kosinus-Ähnlichkeit (Cosine Similarity) & erstelle Vektor-Einbettungen für Retrieval-Augmented Generation (RAG).
          </p>
        </div>
      </div>

      {/* Query Bar */}
      <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
          🔍 Nutzer-Abfrage (Semantic Search Query):
        </label>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Frag etwas über Python, Docker, Kubernetes oder AI..."
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              fontSize: '0.95rem',
              minWidth: '280px'
            }}
          />
          <button className="btn btn-primary" onClick={handleRunVectorSearch} style={{ gap: '8px', padding: '0 24px' }}>
            <Sparkles size={18} /> Embeddings & Search
          </button>
        </div>

        {/* Vector Embedding Representation */}
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>Vektor Array:</span>
          <div style={{ display: 'flex', gap: '6px', fontFamily: 'monospace' }}>
            {queryVector.map((val, idx) => (
              <span key={idx} style={{ background: '#0f172a', color: '#38bdf8', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                v{idx + 1}: {val}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Search Results Grid */}
      {results && (
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '16px' }}>
            📊 Ranking nach Kosinus-Ähnlichkeit ($\cos \theta$):
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {results.map((doc, idx) => {
              const scorePct = Math.round(doc.score * 100);
              return (
                <div
                  key={doc.id}
                  style={{
                    background: 'var(--bg-primary)',
                    padding: '18px',
                    borderRadius: 'var(--radius-lg)',
                    border: idx === 0 ? '2px solid var(--accent-emerald)' : '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        background: idx === 0 ? 'var(--accent-emerald)' : 'var(--bg-card)',
                        color: idx === 0 ? '#ffffff' : 'var(--text-main)',
                        fontWeight: '800',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem'
                      }}>
                        #{idx + 1} Match
                      </span>
                      <h5 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)' }}>{doc.title}</h5>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Similarity:</span>
                      <span style={{
                        color: scorePct > 70 ? 'var(--accent-emerald)' : scorePct > 50 ? 'var(--accent-indigo)' : 'var(--text-muted)',
                        fontWeight: '800',
                        fontSize: '1rem'
                      }}>
                        {doc.score} ({scorePct}%)
                      </span>
                    </div>
                  </div>

                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5' }}>
                    {doc.text}
                  </p>

                  <div style={{ display: 'flex', gap: '6px', fontFamily: 'monospace', fontSize: '0.78rem', opacity: 0.8 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Doc Vector:</span> [{doc.vector.join(', ')}]
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
