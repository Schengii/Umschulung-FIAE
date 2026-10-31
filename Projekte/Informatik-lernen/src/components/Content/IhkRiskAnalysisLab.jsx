import React, { useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Copy, Plus, Trash2, FileText, ShieldAlert } from 'lucide-react';
import { 
  DEFAULT_IHK_RISKS, 
  analyzeProjectRisks, 
  exportRiskAnalysisMarkdown, 
  RISK_STRATEGIES 
} from '../../utils/ihkRiskAnalysisEngine';
import { useStore } from '../../store/useStore';

export default function IhkRiskAnalysisLab() {
  const { awardXP } = useStore();
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'table' | 'export'
  const [projectName, setProjectName] = useState('Automatisierte CI/CD Bereitstellung (IHK AP2)');
  const [risks, setRisks] = useState(() => DEFAULT_IHK_RISKS);
  const [copied, setCopied] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  // Neues Risiko Eingabeformular
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Technologie');
  const [newProb, setNewProb] = useState(3);
  const [newImpact, setNewImpact] = useState(3);
  const [newStrategy, setNewStrategy] = useState('mitigate');
  const [newPreventive, setNewPreventive] = useState('');
  const [newContingency, setNewContingency] = useState('');

  const analysis = useMemo(() => {
    return analyzeProjectRisks(risks);
  }, [risks]);

  const handleAddRisk = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem = {
      id: 'risk-' + Date.now(),
      title: newTitle,
      category: newCategory,
      probability: Number(newProb),
      impact: Number(newImpact),
      strategy: newStrategy,
      preventiveMeasure: newPreventive || 'Regelmäßige Reviews & Überwachung',
      contingencyPlan: newContingency || 'Eskalation an den Projektleiter'
    };

    setRisks(prev => [...prev, newItem]);
    setNewTitle('');
    setNewPreventive('');
    setNewContingency('');
  };

  const handleDeleteRisk = (id) => {
    setRisks(prev => prev.filter(r => r.id !== id));
  };

  const handleCopyMarkdown = () => {
    const md = exportRiskAnalysisMarkdown(analysis, projectName);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    if (!rewardClaimed) {
      awardXP(60, 'IHK Risikoanalyse & DIN EN 31010 Matrix');
      setRewardClaimed(true);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', color: '#f8fafc' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', padding: '10px', borderRadius: '12px', color: '#fff' }}>
              <ShieldAlert size={28} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold' }}>
                IHK Risikoanalyse & Risikomatrix Studio
              </h1>
              <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                DIN EN 31010 / FMEA Standard für die IHK-Abschlussarbeit (AP2 Teil A Pflichtkapitel)
              </p>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setActiveTab('matrix')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'matrix' ? '#f59e0b' : 'transparent',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            5x5 Risikomatrix
          </button>
          <button
            onClick={() => setActiveTab('table')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'table' ? '#f59e0b' : 'transparent',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Risikotabelle ({risks.length})
          </button>
          <button
            onClick={() => setActiveTab('export')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'export' ? '#f59e0b' : 'transparent',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={16} /> IHK-Export
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--card-bg, #1e293b)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Erfasste Projektrisiken</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#38bdf8' }}>{analysis.totalCount}</div>
        </div>

        <div style={{ background: 'var(--card-bg, #1e293b)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <div style={{ fontSize: '0.8rem', color: '#fca5a5' }}>Kritische Risiken (RPZ 15–25)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ef4444' }}>{analysis.highCount}</div>
        </div>

        <div style={{ background: 'var(--card-bg, #1e293b)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <div style={{ fontSize: '0.8rem', color: '#fcd34d' }}>Mittlere Risiken (RPZ 7–14)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f59e0b' }}>{analysis.mediumCount}</div>
        </div>

        <div style={{ background: 'var(--card-bg, #1e293b)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
          <div style={{ fontSize: '0.8rem', color: '#86efac' }}>IHK-Prüfungsstatus</div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: analysis.ihkCompliance.isCompliant ? '#22c55e' : '#f87171', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            {analysis.ihkCompliance.isCompliant ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            {analysis.ihkCompliance.isCompliant ? 'IHK-Konform' : 'Unvollständig'}
          </div>
        </div>
      </div>

      {/* TAB 1: 5x5 Matrix Visualizer */}
      {activeTab === 'matrix' && (
        <div style={{ background: 'var(--card-bg, #1e293b)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 16px 0', color: '#fbbf24' }}>
            5x5 Risikomatrix (Eintrittswahrscheinlichkeit W × Schadensausmaß S)
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.4)', color: '#94a3b8' }}>
                    W \ S
                  </th>
                  {[1, 2, 3, 4, 5].map(s => (
                    <th key={s} style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.4)', color: '#94a3b8' }}>
                      Schaden {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[5, 4, 3, 2, 1].map(w => (
                  <tr key={w}>
                    <td style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.4)', fontWeight: 'bold', color: '#94a3b8' }}>
                      Wahrsch. {w}
                    </td>
                    {[1, 2, 3, 4, 5].map(s => {
                      const cellRpz = w * s;
                      const isHigh = cellRpz >= 15;
                      const isMed = cellRpz >= 7 && cellRpz < 15;
                      const bg = isHigh ? 'rgba(239, 68, 68, 0.35)' : isMed ? 'rgba(245, 158, 11, 0.35)' : 'rgba(34, 197, 94, 0.35)';
                      const cellRisks = analysis.evaluatedRisks.filter(r => r.probability === w && r.impact === s);

                      return (
                        <td
                          key={s}
                          style={{
                            padding: '12px 6px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: bg,
                            position: 'relative',
                            minWidth: '100px',
                            height: '70px',
                            verticalAlign: 'top'
                          }}
                        >
                          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                            RPZ {cellRpz}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                            {cellRisks.map((r, idx) => (
                              <span
                                key={idx}
                                title={`${r.title} (RPZ ${r.rpz})`}
                                style={{
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: '#0f172a',
                                  color: '#fff',
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold',
                                  border: '1px solid rgba(255,255,255,0.2)'
                                }}
                              >
                                {r.title.substring(0, 14)}...
                              </span>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '0.8rem', color: '#cbd5e1', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.6)' }} />
              <span>Grün (1–6): Akzeptables Restrisiko</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.6)' }} />
              <span>Gelb (7–14): Überwachung & Minderung</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.6)' }} />
              <span>Rot (15–25): Kritisches Projektrisiko</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Risikotabelle & CRUD Form */}
      {activeTab === 'table' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Add Risk Form */}
          <form onSubmit={handleAddRisk} style={{ background: 'var(--card-bg, #1e293b)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '1.1rem', color: '#f59e0b', fontWeight: 'bold' }}>
              Neues Projektrisiko erfassen
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Risikobeschreibung:</label>
                <input
                  type="text"
                  placeholder="z. B. Ausfall Staging-Server"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Kategorie:</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Eintrittswahrscheinlichkeit W (1–5):</label>
                <select
                  value={newProb}
                  onChange={(e) => setNewProb(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                >
                  <option value={1}>1 - Sehr unwahrscheinlich</option>
                  <option value={2}>2 - Selten</option>
                  <option value={3}>3 - Gelegentlich</option>
                  <option value={4}>4 - Wahrscheinlich</option>
                  <option value={5}>5 - Sehr wahrscheinlich</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Schadensausmaß S (1–5):</label>
                <select
                  value={newImpact}
                  onChange={(e) => setNewImpact(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                >
                  <option value={1}>1 - Vernachlässigbar</option>
                  <option value={2}>2 - Gering</option>
                  <option value={3}>3 - Mäßig</option>
                  <option value={4}>4 - Schwerwiegend</option>
                  <option value={5}>5 - Projektabbruch</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Handlungsstrategie:</label>
                <select
                  value={newStrategy}
                  onChange={(e) => setNewStrategy(e.target.value)}
                  style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                >
                  {Object.values(RISK_STRATEGIES).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Präventivmaßnahme (Vermeidung):</label>
                <input
                  type="text"
                  placeholder="Was tun wir vorab?"
                  value={newPreventive}
                  onChange={(e) => setNewPreventive(e.target.value)}
                  style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Notfallplan (Contingency Plan):</label>
                <input
                  type="text"
                  placeholder="Was tun wir, wenn das Risiko eintritt?"
                  value={newContingency}
                  onChange={(e) => setNewContingency(e.target.value)}
                  style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                padding: '10px 18px',
                background: '#f59e0b',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Plus size={16} /> Risiko zur Matrix hinzufügen
            </button>
          </form>

          {/* List Table */}
          <div style={{ background: 'var(--card-bg, #1e293b)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Risiko</th>
                  <th style={{ padding: '8px' }}>W</th>
                  <th style={{ padding: '8px' }}>S</th>
                  <th style={{ padding: '8px' }}>RPZ</th>
                  <th style={{ padding: '8px' }}>Strategie</th>
                  <th style={{ padding: '8px' }}>Präventivmaßnahme</th>
                  <th style={{ padding: '8px' }}>Notfallplan</th>
                  <th style={{ padding: '8px' }}>Aktion</th>
                </tr>
              </thead>
              <tbody>
                {analysis.evaluatedRisks.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 'bold', color: '#fff' }}>{r.title}</td>
                    <td style={{ padding: '10px 8px' }}>{r.probability}</td>
                    <td style={{ padding: '10px 8px' }}>{r.impact}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '6px', background: r.level.bg, color: r.level.color, fontWeight: 'bold' }}>
                        {r.rpz} ({r.levelKey})
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', color: '#a78bfa' }}>{r.strategy}</td>
                    <td style={{ padding: '10px 8px', color: '#cbd5e1' }}>{r.preventiveMeasure}</td>
                    <td style={{ padding: '10px 8px', color: '#cbd5e1' }}>{r.contingencyPlan}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <button
                        onClick={() => handleDeleteRisk(r.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        title="Löschen"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: IHK Markdown Export */}
      {activeTab === 'export' && (
        <div style={{ background: 'var(--card-bg, #1e293b)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: '#f59e0b' }}>
                IHK-Dokumentations-Export (DIN EN 31010)
              </h2>
              <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                Formatierte Risikotabelle zur direkten Übernahme in dein Fachdokumentations-Kapitel
              </p>
            </div>
            <button
              onClick={handleCopyMarkdown}
              style={{
                padding: '10px 20px',
                background: copied ? '#10b981' : '#f59e0b',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              {copied ? 'Kopiert! (+60 XP)' : 'Markdown in Zwischenablage kopieren'}
            </button>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
              Projektname für die Dokumentation:
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              style={{ width: '100%', maxWidth: '500px', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
            />
          </div>

          <pre style={{
            background: 'rgba(0,0,0,0.4)',
            padding: '16px',
            borderRadius: '8px',
            overflowX: 'auto',
            fontSize: '0.8rem',
            fontFamily: 'monospace',
            color: '#cbd5e1',
            lineHeight: '1.5'
          }}>
            {exportRiskAnalysisMarkdown(analysis, projectName)}
          </pre>
        </div>
      )}
    </div>
  );
}
