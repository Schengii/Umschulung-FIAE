import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, AlertTriangle, FileText, CheckCircle2, 
  XCircle, Clock, Server, Copy, Check 
} from 'lucide-react';
import { 
  PROTECTION_LEVELS, 
  DEFAULT_ASSETS, 
  BSI_MODULES, 
  NIS2_OBLIGATIONS,
  calculateOverallNeed, 
  evaluateBsiCompliance, 
  exportBsiReportMarkdown 
} from '../../utils/bsiGrundschutzEngine';
import { useStore } from '../../store/useStore';

export default function BsiGrundschutzLab() {
  const { awardXP } = useStore();
  const [activeSubTab, setActiveSubTab] = useState('protection'); // 'protection' | 'modules' | 'nis2' | 'export'
  const [assets, setAssets] = useState(DEFAULT_ASSETS);
  const [modules, setModules] = useState(BSI_MODULES);
  const [projectName, setProjectName] = useState('Absicherung Kundenportal & DB-Cluster (AP2)');
  const [copied, setCopied] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);

  // Asset Schutzbedarf ändern
  const handleUpdateAssetNeed = (assetId, field, val) => {
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, [field]: val } : a));
  };

  // Status einer Maßnahme umschalten (yes -> partially -> no -> yes)
  const handleToggleMeasureStatus = (moduleId, measureId) => {
    setModules(prev => prev.map(mod => {
      if (mod.id !== moduleId) return mod;
      return {
        ...mod,
        measures: mod.measures.map(m => {
          if (m.id !== measureId) return m;
          const next = m.status === 'yes' ? 'partially' : m.status === 'partially' ? 'no' : 'yes';
          return { ...m, status: next };
        })
      };
    }));
  };

  const evaluation = useMemo(() => evaluateBsiCompliance(modules), [modules]);
  const markdownReport = useMemo(() => exportBsiReportMarkdown({ assets, modules }, projectName), [assets, modules, projectName]);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimXP = () => {
    if (!xpClaimed && awardXP) {
      awardXP(60, 'BSI IT-Grundschutz & NIS-2 Risiko-Studio gemeistert!');
      setXpClaimed(true);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-color, #1e293b)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', padding: '10px', borderRadius: '12px', color: '#fff' }}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                BSI IT-Grundschutz & NIS-2 Risiko-Studio
              </h1>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary, #64748b)', fontSize: '0.95rem' }}>
                Schutzbedarfsfeststellung (BSI 200-2), Baustein-Audit (BSI 200-3) und NIS-2 EU-Compliance für die IHK-Abschlussarbeit
              </p>
            </div>
          </div>
        </div>

        {/* Global Compliance Score Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--card-bg, #ffffff)', padding: '12px 20px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>BSI Erfüllungsgrad</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: evaluation.complianceScore >= 80 ? '#10b981' : evaluation.complianceScore >= 50 ? '#f59e0b' : '#ef4444' }}>
              {evaluation.complianceScore}%
            </div>
          </div>
          <button
            onClick={handleClaimXP}
            disabled={xpClaimed}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              background: xpClaimed ? '#10b981' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: xpClaimed ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {xpClaimed ? <Check size={16} /> : <ShieldCheck size={16} />}
            {xpClaimed ? 'XP gutgeschrieben' : '+60 XP beanspruchen'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--border-color, #e2e8f0)', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'protection', label: '1. Schutzbedarfsfeststellung (CIA)', icon: Server },
          { id: 'modules', label: '2. BSI IT-Grundschutz Bausteine', icon: ShieldCheck },
          { id: 'nis2', label: '3. NIS-2 Pflichtenkatalog', icon: AlertTriangle },
          { id: 'export', label: '4. IHK Dokumentations-Export', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                border: 'none',
                background: isActive ? 'var(--card-bg, #ffffff)' : 'transparent',
                borderBottom: isActive ? '3px solid #0284c7' : '3px solid transparent',
                borderRadius: '8px 8px 0 0',
                color: isActive ? '#0284c7' : 'var(--text-secondary, #64748b)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Schutzbedarfsfeststellung */}
      {activeSubTab === 'protection' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 12px' }}>
              Schutzbedarfsdefinition (Vertraulichkeit, Integrität, Verfügbarkeit)
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #64748b)', margin: '0 0 16px' }}>
              Nach dem <strong>Maximum-Prinzip</strong> (BSI 200-2) bestimmt die höchste Einzeleinstufung den kumulierten Gesamtschutzbedarf des Zielobjekts.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {Object.values(PROTECTION_LEVELS).map(lvl => (
                <div key={lvl.id} style={{ padding: '12px 16px', borderRadius: '12px', borderLeft: `4px solid ${lvl.color}`, background: 'var(--bg-subtle, rgba(0,0,0,0.02))' }}>
                  <div style={{ fontWeight: 700, color: lvl.color, fontSize: '0.95rem' }}>{lvl.label}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary, #64748b)', marginTop: '4px' }}>{lvl.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Asset List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {assets.map(asset => {
              const overall = calculateOverallNeed(asset);
              const overallInfo = PROTECTION_LEVELS[overall.toUpperCase()] || PROTECTION_LEVELS.NORMAL;

              return (
                <div key={asset.id} style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', padding: '3px 8px', borderRadius: '6px', background: 'var(--badge-bg, #e0f2fe)', color: '#0369a1' }}>
                        {asset.type}
                      </span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '8px 0 4px' }}>{asset.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)', margin: 0 }}>{asset.rationale}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: `${overallInfo.color}15`, padding: '8px 16px', borderRadius: '12px', border: `1px solid ${overallInfo.color}40` }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Gesamtschutz:</span>
                      <span style={{ fontWeight: 800, color: overallInfo.color, fontSize: '0.95rem' }}>
                        {overallInfo.label.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Selectors */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {[
                      { key: 'confidentiality', label: 'Vertraulichkeit (Confidentiality)' },
                      { key: 'integrity', label: 'Integrität (Integrity)' },
                      { key: 'availability', label: 'Verfügbarkeit (Availability)' }
                    ].map(dim => (
                      <div key={dim.key}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '6px' }}>
                          {dim.label}
                        </label>
                        <select
                          value={asset[dim.key]}
                          onChange={(e) => handleUpdateAssetNeed(asset.id, dim.key, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color, #cbd5e1)',
                            background: 'var(--input-bg, #ffffff)',
                            color: 'inherit',
                            fontSize: '0.9rem',
                            fontWeight: 600
                          }}
                        >
                          <option value="normal">Normal</option>
                          <option value="high">Hoch</option>
                          <option value="very_high">Sehr hoch</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: BSI IT-Grundschutz Bausteine */}
      {activeSubTab === 'modules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'var(--card-bg, #ffffff)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>BASIS-ANFORDERUNGEN</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', color: evaluation.basisFulfilled ? '#10b981' : '#ef4444' }}>
                {evaluation.basisFulfilled ? 'Vollständig erfüllt' : `${evaluation.basisImplemented} / ${evaluation.basisTotal} erfüllt`}
              </div>
            </div>
            <div style={{ background: 'var(--card-bg, #ffffff)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>MASSNAHMEN STATUS</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '6px', display: 'flex', gap: '12px' }}>
                <span style={{ color: '#10b981' }}>✔ {evaluation.implemented} Erfüllt</span>
                <span style={{ color: '#f59e0b' }}>◐ {evaluation.partial} Teilweise</span>
                <span style={{ color: '#ef4444' }}>✖ {evaluation.missing} Offen</span>
              </div>
            </div>
          </div>

          {modules.map(mod => (
            <div key={mod.id} style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontWeight: 800, color: '#0284c7', fontSize: '0.9rem', marginRight: '8px' }}>{mod.code}</span>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{mod.name}</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', background: '#f1f5f9', color: '#475569' }}>
                  {mod.category}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)', margin: '0 0 16px' }}>{mod.description}</p>

              {/* Measures */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {mod.measures.map(m => {
                  const statusColor = m.status === 'yes' ? '#10b981' : m.status === 'partially' ? '#f59e0b' : '#ef4444';
                  const statusBg = m.status === 'yes' ? 'rgba(16, 185, 129, 0.1)' : m.status === 'partially' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)';

                  return (
                    <div
                      key={m.id}
                      onClick={() => handleToggleMeasureStatus(mod.id, m.id)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color, #e2e8f0)',
                        background: 'var(--bg-subtle, rgba(0,0,0,0.01))',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          background: m.type === 'basis' ? '#fee2e2' : m.type === 'standard' ? '#e0f2fe' : '#fef3c7',
                          color: m.type === 'basis' ? '#b91c1c' : m.type === 'standard' ? '#0369a1' : '#b45309'
                        }}>
                          {m.type === 'basis' ? 'Basis' : m.type === 'standard' ? 'Standard' : 'Hoch'}
                        </span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{m.name}</span>
                      </div>

                      <div style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        background: statusBg,
                        color: statusColor,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {m.status === 'yes' ? <CheckCircle2 size={16} /> : m.status === 'partially' ? <Clock size={16} /> : <XCircle size={16} />}
                        {m.status === 'yes' ? 'Erfüllt' : m.status === 'partially' ? 'Teilweise' : 'Offen'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: NIS-2 Pflichtenkatalog */}
      {activeSubTab === 'nis2' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px' }}>
              NIS-2 Richtlinie (EU 2022/2555) & IHK Relevanz
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #64748b)', margin: 0 }}>
              NIS-2 erweitert den Kreis betroffener Unternehmen drastisch (Wesentliche vs. Wichtige Einrichtungen) und fordert persönliche Haftung der Geschäftsleitung sowie strikte Incident-Response- und Supply-Chain-Vorgaben.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {NIS2_OBLIGATIONS.map(req => (
              <div key={req.id} style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color="#0284c7" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{req.title}</h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)', margin: 0 }}>
                  {req.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: IHK Export */}
      {activeSubTab === 'export' && (
        <div style={{ background: 'var(--card-bg, #ffffff)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '4px' }}>
                Projektbezeichnung für IHK-Dokumentation:
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  background: 'var(--input-bg, #ffffff)',
                  color: 'inherit',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              />
            </div>

            <button
              onClick={handleCopy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                background: '#0284c7',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Kopiert!' : 'Markdown kopieren'}
            </button>
          </div>

          <pre style={{
            background: 'var(--code-bg, #0f172a)',
            color: '#f8fafc',
            padding: '20px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            overflowX: 'auto',
            maxHeight: '480px'
          }}>
            {markdownReport}
          </pre>
        </div>
      )}
    </div>
  );
}
