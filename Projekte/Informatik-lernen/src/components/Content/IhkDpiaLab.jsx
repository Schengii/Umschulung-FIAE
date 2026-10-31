import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, AlertTriangle, FileText, CheckCircle2, 
  Download, Award, Scale, Check
} from 'lucide-react';
import { 
  DPIA_CRITERIA, DEFAULT_DPIA_RISKS, IHK_DPIA_SCENARIOS,
  evaluateDpiaThreshold, calculateRiskScores, generateDpiaMarkdownDoc 
} from '../../utils/ihkDpiaEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function IhkDpiaLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [projectTitle, setProjectTitle] = useState('Einführung WebAuthn & Zero-Trust IAM');
  const [selectedCriteria, setSelectedCriteria] = useState(['crit_eval_scoring', 'crit_special_categories']);
  const [risks, setRisks] = useState(DEFAULT_DPIA_RISKS);
  const [activeTab, setActiveTab] = useState('threshold'); // 'threshold' | 'risks' | 'preview'
  const [solved, setSolved] = useState(false);

  const handleSelectScenario = (scenario) => {
    setProjectTitle(scenario.title);
    setSelectedCriteria(scenario.criteria);
    setRisks(scenario.risks);
    triggerHaptic('SUCCESS');
  };

  const threshold = useMemo(() => evaluateDpiaThreshold(selectedCriteria), [selectedCriteria]);
  const evaluatedRisks = useMemo(() => calculateRiskScores(risks), [risks]);

  const toggleCriterion = (id) => {
    setSelectedCriteria(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(60);
      } else {
        awardXP(60, 'ihk_dpia_master');
      }
    }
  };

  const handleDownloadDoc = () => {
    const md = generateDpiaMarkdownDoc(projectTitle, selectedCriteria, evaluatedRisks);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DSFA_Art35_${projectTitle.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-rose" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={14} /> Art. 35 DSGVO
            </span>
            <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Scale size={14} /> Datenschutz-Folgenabschätzung
            </span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '4px 0 8px 0', color: 'var(--text-main)' }}>
            IHK DSFA / DPIA Studio &amp; Schwellenwert-Assistent
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '820px', margin: 0 }}>
            Offizielles Prüfungstool für die Datenschutz-Folgenabschätzung nach Art. 35 DSGVO. Schwellenwertanalyse (DSK-Blacklist), Risikomatrix für Grundrechte Betroffener und 1-Klick Markdown-Export für den Anhang deiner IHK-Projektdokumentation.
          </p>
        </div>

        <button
          onClick={handleClaim}
          disabled={solved}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Award size={16} />
          {solved ? 'DSFA Mastery Freigeschaltet (+60 XP)' : 'DSFA Audit abschließen'}
        </button>
      </div>

      {/* IHK-Prüfungsszenarien Schnellauswahl */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>IHK-Klausurfälle:</span>
        {IHK_DPIA_SCENARIOS.map((sc) => (
          <button
            key={sc.id}
            className={`btn ${projectTitle === sc.title ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ fontSize: '0.8rem', padding: '4px 10px' }}
            onClick={() => handleSelectScenario(sc)}
          >
            {sc.id === 'ai_copilot' ? '🤖 KI-Copilot' : sc.id === 'cctv_server_room' ? '📹 Serverraum-Video' : '☁️ US-Cloud-Migration'}
          </button>
        ))}
      </div>

      {/* Project Title Input */}
      <div style={{ marginBottom: '20px', background: 'var(--bg-card-hover)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
          Titel deines IHK-Abschlussprojekts:
        </label>
        <input
          type="text"
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          placeholder="z.B. Einführung einer Zero-Trust Architektur mit Keycloak & Passkeys"
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            fontSize: '0.95rem'
          }}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('threshold')}
          className={`btn ${activeTab === 'threshold' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.9rem', padding: '8px 16px' }}
        >
          <AlertTriangle size={15} style={{ marginRight: '6px' }} />
          1. Schwellenwertprüfung (DSK-Blacklist)
        </button>
        <button
          onClick={() => setActiveTab('risks')}
          className={`btn ${activeTab === 'risks' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.9rem', padding: '8px 16px' }}
        >
          <ShieldAlert size={15} style={{ marginRight: '6px' }} />
          2. Risikomatrix &amp; Abhilfemaßnahmen
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`btn ${activeTab === 'preview' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.9rem', padding: '8px 16px' }}
        >
          <FileText size={15} style={{ marginRight: '6px' }} />
          3. IHK-Dokumenten-Vorschau &amp; Export
        </button>
      </div>

      {/* TAB 1: Schwellenwertprüfung */}
      {activeTab === 'threshold' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>
              Kriterien der Datenschutzkonferenz (DSK) &amp; Art. 35 Abs. 3
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Wähle alle Kriterien aus, die auf die geplante Verarbeitung zutreffen. Sind <strong>2 oder mehr Kriterien</strong> erfüllt, ist eine DSFA gesetzlich zwingend vorgeschrieben.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {DPIA_CRITERIA.map(crit => {
                const isSelected = selectedCriteria.includes(crit.id);
                return (
                  <div
                    key={crit.id}
                    onClick={() => toggleCriterion(crit.id)}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-card-hover)',
                      border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      border: isSelected ? '2px solid var(--accent-primary)' : '2px solid var(--text-muted)',
                      background: isSelected ? 'var(--accent-primary)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      marginTop: '2px',
                      flexShrink: 0
                    }}>
                      {isSelected && <Check size={14} />}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>{crit.title}</strong>
                        <span className="badge" style={{ fontSize: '0.7rem' }}>Gewicht: {crit.weight}</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                        {crit.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ergebnis Card */}
          <div>
            <div style={{
              background: 'var(--bg-card-hover)',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              border: threshold.isDpiaRequired ? '2px solid #ef4444' : threshold.selectedCount === 1 ? '2px solid #f59e0b' : '2px solid #10b981',
              position: 'sticky',
              top: '20px'
            }}>
              <span className={`badge ${threshold.isDpiaRequired ? 'badge-rose' : threshold.selectedCount === 1 ? 'badge-amber' : 'badge-emerald'}`} style={{ marginBottom: '12px' }}>
                {threshold.isDpiaRequired ? 'Pflicht zur DSFA' : threshold.selectedCount === 1 ? 'Grenzfall / Empfohlen' : 'Keine DSFA-Pflicht'}
              </span>

              <h4 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '8px 0', color: 'var(--text-main)' }}>
                {threshold.thresholdSummary}
              </h4>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {threshold.recommendation}
              </p>

              <div style={{ marginTop: '20px', padding: '14px', background: 'var(--bg-card)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Erfüllte Kriterien:</span>
                  <strong>{threshold.selectedCount} von {DPIA_CRITERIA.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Gesamt-Risikogewichtung:</span>
                  <strong style={{ color: 'var(--accent-primary)' }}>{threshold.score} Punkte</strong>
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <strong>IHK Prüfungstipp:</strong> Auch wenn eine DSFA nicht verpflichtend ist, demonstriert eine durchgeführte Schwellenwertprüfung in der Projektdokumentation (Kapitel Datenschutz) höchste methodische Fachkompetenz nach AO 2020!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Risikomatrix */}
      {activeTab === 'risks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {evaluatedRisks.map(r => (
              <div
                key={r.id}
                style={{
                  background: 'var(--bg-card-hover)',
                  padding: '20px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <span className="badge badge-indigo" style={{ marginBottom: '8px' }}>{r.category}</span>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '4px 0 10px 0', color: 'var(--text-main)' }}>
                    {r.description}
                  </h4>

                  <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ flex: 1, padding: '8px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '6px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#ef4444', display: 'block' }}>Initiales Risiko</span>
                      <strong style={{ fontSize: '1.1rem', color: '#ef4444' }}>{r.rawScore}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>({r.impact} × {r.likelihood})</span>
                    </div>

                    <div style={{ flex: 1, padding: '8px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '6px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'block' }}>Restrisiko</span>
                      <strong style={{ fontSize: '1.1rem', color: '#10b981' }}>{r.residualScore}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>(-{r.reductionPercent}%)</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Geplante Schutzmaßnahmen:</strong>
                    {r.mitigation}
                  </div>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status:</span>
                  <span className={`badge ${r.isAcceptable ? 'badge-emerald' : 'badge-amber'}`}>
                    {r.isAcceptable ? 'Akzeptables Restrisiko' : 'Weitere Minderung nötig'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={24} style={{ color: '#10b981', flexShrink: 0 }} />
            <div style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
              <strong>Art. 36 DSGVO Freigabe:</strong> Da alle Restrisiken nach Implementierung der technischen und organisatorischen Maßnahmen im vertretbaren Bereich liegen, ist keine vorherige Abstimmung mit der Datenschutzaufsichtsbehörde nötig.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Vorschau & Export */}
      {activeTab === 'preview' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Druckfertige Markdown-Dokumentation für den Anhang deiner Projektdokumentation:
            </span>
            <button
              onClick={handleDownloadDoc}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Download size={16} />
              Markdown-Datei herunterladen (.md)
            </button>
          </div>

          <pre style={{
            background: 'var(--bg-card-hover)',
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            fontSize: '0.82rem',
            lineHeight: 1.5,
            overflowX: 'auto',
            maxHeight: '450px',
            color: 'var(--text-main)'
          }}>
            {generateDpiaMarkdownDoc(projectTitle, selectedCriteria, evaluatedRisks)}
          </pre>
        </div>
      )}
    </div>
  );
}
