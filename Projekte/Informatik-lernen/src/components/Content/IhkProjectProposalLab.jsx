import React, { useState, useMemo } from 'react';
import { 
  FileCheck2, AlertCircle, CheckCircle2, Clock, 
  Copy, AlertTriangle 
} from 'lucide-react';
import { 
  evaluateIhkProjectProposal, 
  IHK_PROJECT_OCCUPATIONS, 
  DEFAULT_PROPOSAL_PHASES, 
  IHK_PROPOSAL_CHECKLIST 
} from '../../utils/ihkProjectProposalEngine';
import { useStore } from '../../store/useStore';

export default function IhkProjectProposalLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [occupationId, setOccupationId] = useState('fiae');
  const [phases, setPhases] = useState(DEFAULT_PROPOSAL_PHASES);
  const [checkedItems, setCheckedItems] = useState([
    'chk_scope', 'chk_decision', 'chk_economic', 'chk_security', 'chk_handover'
  ]);
  const [copied, setCopied] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);

  // When switching occupation, adjust default phases for FISI (40h) vs FIAE (80h)
  const handleOccupationChange = (id) => {
    setOccupationId(id);
    if (id === 'fisi') {
      setPhases([
        { id: 'p1', name: '1. Analysephase (Ist-Analyse, Soll-Konzept & NWA)', hours: 6, category: 'analyse' },
        { id: 'p2', name: '2. Entwurfsphase (Netzwerk-Architektur & Hardware-Auswahl)', hours: 8, category: 'entwurf' },
        { id: 'p3', name: '3. Implementierungsphase (Installation & Konfiguration)', hours: 16, category: 'umsetzung' },
        { id: 'p4', name: '4. Qualitätssicherung (Funktionstests & Abnahme)', hours: 5, category: 'qs' },
        { id: 'p5', name: '5. Dokumentation (Kundendoku & Projektdokumentation)', hours: 5, category: 'doku' }
      ]);
    } else {
      setPhases(DEFAULT_PROPOSAL_PHASES);
    }
  };

  const handleHourChange = (phaseId, val) => {
    const hours = Math.max(1, Number(val) || 1);
    setPhases(prev => prev.map(p => p.id === phaseId ? { ...p, hours } : p));
  };

  const handleToggleChecklist = (chkId) => {
    setCheckedItems(prev => 
      prev.includes(chkId) ? prev.filter(id => id !== chkId) : [...prev, chkId]
    );
  };

  const evaluation = useMemo(() => {
    return evaluateIhkProjectProposal({
      occupationId,
      phases,
      checkedItems
    });
  }, [occupationId, phases, checkedItems]);

  const handleCopyProposal = () => {
    let text = `IHK PROJEKTANTRAG (AO 2020) - ${evaluation.occupation.name}\n\n`;
    text += `Gesamtstunden: ${evaluation.totalHours} von max. ${evaluation.maxHours} Std.\n`;
    text += `Prüfungsstatus: ${evaluation.status}\n\n`;
    text += `PHASEN- & ZEITPLANUNG:\n`;
    evaluation.phaseAnalysis.forEach(p => {
      text += `- ${p.name}: ${p.hours} Std. (${p.percent}%)\n`;
    });
    text += `\nGENEHMIGUNGS-CHECKLISTE:\n`;
    IHK_PROPOSAL_CHECKLIST.forEach(c => {
      const isChecked = checkedItems.includes(c.id);
      text += `[${isChecked ? 'X' : ' '}] ${c.label}\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    if (!xpClaimed && evaluation.status === 'APPROVED') {
      if (onRewardXP) onRewardXP(50);
      else awardXP(50, 'proposal_master');
      setXpClaimed(true);
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
                <FileCheck2 size={14} /> IHK Projektprüfung
              </span>
              <span className="badge badge-teal">AO 2020 Konform</span>
              {evaluation.status === 'APPROVED' && (
                <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} /> Antrag Genehmigungsfähig
                </span>
              )}
              {evaluation.status === 'CONDITIONAL' && (
                <span className="badge badge-amber" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={13} /> Nachbesserung empfohlen
                </span>
              )}
              {evaluation.status === 'REJECTED' && (
                <span className="badge badge-red" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={13} /> Ablehnung wahrscheinlich
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0', color: 'var(--text-main)' }}>
              IHK Projektantrag &amp; Meilenstein-Planer
            </h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '720px', fontSize: '0.96rem', lineHeight: '1.6' }}>
              Vermeide typische Ablehnungsgründe deines IHK-Projektantrags. Automatische Stundenprüfung für FIAE (80h) und FISI (40h), Phasenverteilung und Checkliste.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleCopyProposal}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Copy size={18} />
            {copied ? 'Antrag kopiert!' : 'Projektantrag exportieren (+50 XP)'}
          </button>
        </div>
      </div>

      {/* Occupation Tabs */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {Object.values(IHK_PROJECT_OCCUPATIONS).map((occ) => (
          <button
            key={occ.id}
            className={`btn ${occupationId === occ.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => handleOccupationChange(occ.id)}
            style={{ minHeight: '40px', fontWeight: 700 }}
          >
            {occ.name} (max. {occ.maxHours}h)
          </button>
        ))}
      </div>

      {/* Hours Overview Card */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Geplante Projektstunden:</span>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: evaluation.isHoursExact ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
            {evaluation.totalHours} <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-muted)' }}>/ {evaluation.maxHours} Std.</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '400px' }}>
          {evaluation.errors.map((err, i) => (
            <div key={i} style={{ color: 'var(--accent-rose)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={15} /> {err}
            </div>
          ))}
          {evaluation.warnings.map((warn, i) => (
            <div key={i} style={{ color: 'var(--accent-amber)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={15} /> {warn}
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Phases & Checklist */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Phase Breakdown */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--accent-primary)" />
            1. Phasen- &amp; Zeitplanung
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {evaluation.phaseAnalysis.map((phase) => (
              <div
                key={phase.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{phase.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      min="1"
                      value={phase.hours}
                      onChange={(e) => handleHourChange(phase.id, e.target.value)}
                      style={{ width: '60px', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', fontWeight: 800, textAlign: 'right' }}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Std. ({phase.percent}%)</span>
                  </div>
                </div>

                <div style={{ height: '6px', borderRadius: '3px', background: 'var(--border-color)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, phase.percent)}%`,
                      height: '100%',
                      background: 'var(--accent-primary)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* IHK Genehmigungs-Checkliste */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="var(--accent-emerald)" />
            2. IHK Genehmigungs-Checkliste
          </h2>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Die IHK-Prüfungskommission prüft jeden Antrag auf diese formalen und fachlichen Mindeststandards:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {IHK_PROPOSAL_CHECKLIST.map((item) => {
              const isChecked = checkedItems.includes(item.id);
              return (
                <label
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    background: isChecked ? 'rgba(5, 150, 105, 0.06)' : 'var(--bg-tertiary)',
                    border: isChecked ? '1px solid var(--accent-emerald)' : '1px solid var(--border-color)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleChecklist(item.id)}
                    style={{ marginTop: '2px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.88rem', fontWeight: isChecked ? 600 : 400, color: 'var(--text-main)' }}>
                    {item.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
