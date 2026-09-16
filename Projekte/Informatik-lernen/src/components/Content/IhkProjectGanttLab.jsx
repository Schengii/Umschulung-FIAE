import React, { useState, useMemo } from 'react';
import { 
  Calendar, Clock, CheckCircle, AlertTriangle, 
  Copy, Plus, Trash2, Milestone, Info
} from 'lucide-react';
import { 
  IHK_PROFILES, 
  validateIhkProjectPlan, 
  calculateGanttTimeline, 
  exportGanttToMarkdown 
} from '../../utils/ihkProjectGanttEngine';
import { useStore } from '../../store/useStore';

export default function IhkProjectGanttLab() {
  const { awardXP } = useStore();
  const [selectedProfile, setSelectedProfile] = useState('FIAE');
  const [projectName, setProjectName] = useState('Entwicklung einer Microservice-basierten Telemetrie-Schnittstelle');
  const [startDate, setStartDate] = useState('2026-04-01');
  const [phases, setPhases] = useState(() => IHK_PROFILES.FIAE.defaultPhases);
  const [copied, setCopied] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const handleProfileChange = (profKey) => {
    setSelectedProfile(profKey);
    setPhases(IHK_PROFILES[profKey].defaultPhases);
  };

  const validation = useMemo(() => {
    return validateIhkProjectPlan(phases, selectedProfile);
  }, [phases, selectedProfile]);

  const timeline = useMemo(() => {
    return calculateGanttTimeline(phases, startDate, 8);
  }, [phases, startDate]);

  const handleHourChange = (idx, newHours) => {
    const parsed = Math.max(1, parseInt(newHours, 10) || 0);
    setPhases(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], hours: parsed };
      return updated;
    });
  };

  const handleNameChange = (idx, newName) => {
    setPhases(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], name: newName };
      return updated;
    });
  };

  const handleAddPhase = () => {
    setPhases(prev => [
      ...prev,
      {
        id: `phase-${Date.now()}`,
        name: `Neue Teilaufgabe / Phase`,
        hours: 4,
        description: 'Beschreibung der Aufgabenpakete',
        milestones: ['Neuer Meilenstein']
      }
    ]);
  };

  const handleDeletePhase = (idx) => {
    if (phases.length <= 2) return;
    setPhases(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCopyMarkdown = () => {
    const md = exportGanttToMarkdown(phases, selectedProfile, projectName);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    if (!rewardClaimed && validation.isValid) {
      awardXP(60, 'IHK AP2 Zeit- & Meilensteinplanung');
      setRewardClaimed(true);
    }
  };

  const maxPhaseHours = Math.max(...phases.map(p => p.hours), 35);

  return (
    <div className="lab-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '20px', color: '#60a5fa', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
            <Calendar size={16} /> IHK Abschlussprüfung Teil 2 (AP2) Projektantrag
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            IHK Projekt-Gantt & Meilenstein-Editor
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Plane deine 80 Stunden (FIAE) bzw. 40 Stunden (FISI) nach IHK-Prüfungsvorschriften mit Soll-Phasen, Meilensteinen und Validierung.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => handleProfileChange('FIAE')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: selectedProfile === 'FIAE' ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
              background: selectedProfile === 'FIAE' ? 'rgba(59, 130, 246, 0.2)' : 'var(--card-bg, #1e293b)',
              color: selectedProfile === 'FIAE' ? '#60a5fa' : '#94a3b8',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            FIAE (80h)
          </button>
          <button
            onClick={() => handleProfileChange('FISI')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: selectedProfile === 'FISI' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
              background: selectedProfile === 'FISI' ? 'rgba(16, 185, 129, 0.2)' : 'var(--card-bg, #1e293b)',
              color: selectedProfile === 'FISI' ? '#34d399' : '#94a3b8',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            FISI (40h)
          </button>
          <button
            onClick={handleCopyMarkdown}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              background: copied ? '#10b981' : '#3b82f6',
              color: '#fff',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Markdown kopiert!' : 'Exportieren (Markdown)'}</span>
          </button>
        </div>
      </div>

      {/* Meta Input Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--card-bg, #1e293b)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 'bold' }}>
            Projektbezeichnung (Antrag):
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <div style={{ background: 'var(--card-bg, #1e293b)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 'bold' }}>
            Projekt-Startdatum (Werktag):
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <div style={{ background: 'var(--card-bg, #1e293b)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'bold' }}>Stunden-Sollprüfung:</span>
            <span style={{ 
              fontWeight: '800', 
              fontSize: '1.1rem',
              color: validation.isValid ? '#10b981' : '#ef4444' 
            }}>
              {validation.totalHours} / {validation.targetHours} Std.
            </span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${Math.min(100, (validation.totalHours / validation.targetHours) * 100)}%`,
                background: validation.isValid ? '#10b981' : validation.totalHours > validation.targetHours ? '#ef4444' : '#f59e0b',
                transition: 'width 0.3s ease'
              }} 
            />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>
            {validation.isValid ? '✓ Punktgenaue 100% Stundenvorgabe erreicht' : `Differenz: ${validation.diffHours > 0 ? '+' : ''}${validation.diffHours}h`}
          </div>
        </div>
      </div>

      {/* Validation Warnings / Feedback Box */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div style={{ 
          background: validation.errors.length > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
          border: validation.errors.length > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: validation.errors.length > 0 ? '#f87171' : '#fbbf24', marginBottom: '8px' }}>
            <AlertTriangle size={18} />
            <span>IHK-Prüfungsordnung Feedback:</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.88rem', color: '#e2e8f0', lineHeight: '1.6' }}>
            {validation.errors.map((err, i) => (
              <li key={`err-${i}`} style={{ color: '#fca5a5' }}><strong>Fehler:</strong> {err}</li>
            ))}
            {validation.warnings.map((warn, i) => (
              <li key={`warn-${i}`} style={{ color: '#fde68a' }}><strong>Hinweis:</strong> {warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Interactive Gantt Timeline Visualization */}
      <div style={{ background: 'var(--card-bg, #1e293b)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#60a5fa" /> Gantt-Diagramm Zeitstrahl (Arbeitstage ohne Sa/So)
          </h3>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Gesamtdauer: ~{timeline.reduce((acc, t) => acc + t.durationDays, 0)} Arbeitstage
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {timeline.map((item, idx) => {
            const barWidth = `${Math.max(8, (item.hours / maxPhaseHours) * 100)}%`;
            const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
            const phaseColor = colors[idx % colors.length];

            return (
              <div key={item.id} style={{ background: 'rgba(0,0,0,0.25)', padding: '12px 16px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: phaseColor }} />
                    <strong style={{ color: '#e2e8f0' }}>{item.name}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#94a3b8', fontSize: '0.82rem' }}>
                    <span>{item.startDate} → {item.endDate}</span>
                    <strong style={{ color: '#fff', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                      {item.hours}h ({item.durationDays} AT)
                    </strong>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ height: '14px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: barWidth, 
                      background: phaseColor,
                      borderRadius: '6px',
                      transition: 'width 0.3s ease'
                    }} 
                  />
                </div>

                {/* Milestones tags */}
                {item.milestones.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <Milestone size={14} color="#f59e0b" />
                    {item.milestones.map((ms, mi) => (
                      <span key={mi} style={{ fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '2px 8px', borderRadius: '4px' }}>
                        🚩 {ms}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase Editor Table */}
      <div style={{ background: 'var(--card-bg, #1e293b)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>
            Phasen & Arbeitspakete anpassen
          </h3>
          <button
            onClick={handleAddPhase}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid #3b82f6',
              color: '#60a5fa',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={14} /> Phase hinzufügen
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {phases.map((phase, idx) => (
            <div 
              key={phase.id || idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 100px 40px',
                gap: '12px',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.2)',
                padding: '10px 14px',
                borderRadius: '8px'
              }}
            >
              <input
                type="text"
                value={phase.name}
                onChange={(e) => handleNameChange(idx, e.target.value)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: '#fff',
                  padding: '6px 10px',
                  fontSize: '0.9rem'
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={phase.hours}
                  onChange={(e) => handleHourChange(idx, e.target.value)}
                  style={{
                    width: '65px',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    color: '#60a5fa',
                    fontWeight: 'bold',
                    padding: '6px',
                    textAlign: 'center'
                  }}
                />
                <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>h</span>
              </div>
              <button
                onClick={() => handleDeletePhase(idx)}
                title="Phase entfernen"
                disabled={phases.length <= 2}
                style={{
                  background: 'none',
                  border: 'none',
                  color: phases.length <= 2 ? '#475569' : '#ef4444',
                  cursor: phases.length <= 2 ? 'not-allowed' : 'pointer',
                  padding: '4px'
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Practical IHK Tips Footer */}
      <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <Info size={20} color="#60a5fa" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
          <strong>Prüfungs-Tipp für den Projektantrag:</strong> Die IHK fordert eine plausible und detaillierte Phasengliederung. Die Realisierungsphase sollte nicht mehr als 50% der Gesamtdauer einnehmen, um zu beweisen, dass die Arbeit eine vollwertige ingenieurmäßige/ganzheitliche Projektleistung darstellt und nicht nur reines Coden oder Zusammenschrauben ist.
        </div>
      </div>
    </div>
  );
}
