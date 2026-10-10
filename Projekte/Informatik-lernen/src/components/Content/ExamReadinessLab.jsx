import React, { useState } from 'react';
import {
  calculateExamCountdown,
  calculateExamReadiness
} from '../../utils/examReadinessEngine';
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Award,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';

export default function ExamReadinessLab({ onRewardXP }) {
  const [currentDate] = useState(new Date());
  const [completedScores, setCompletedScores] = useState({
    ap1: { completed: 12, scoreSum: 1080 },
    ap2_1: { completed: 8, scoreSum: 640 },
    ap2_2: { completed: 6, scoreSum: 420 },
    wiso: { completed: 15, scoreSum: 1350 },
    project: { completed: 7, scoreSum: 630 }
  });
  const [isCompleted, setIsCompleted] = useState(false);

  const countdown = calculateExamCountdown(currentDate);
  const readiness = calculateExamReadiness(completedScores);

  const updateDomain = (key, completed, score) => {
    setCompletedScores(prev => ({
      ...prev,
      [key]: { completed: Number(completed), scoreSum: Number(completed) * Number(score) }
    }));
  };

  const handleFinish = () => {
    if (!isCompleted) {
      setIsCompleted(true);
      if (onRewardXP) onRewardXP(60);
    }
  };

  return (
    <div className="lab-container animate-fade-in" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="badge badge-teal" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={14} /> IHK Exam Readiness
            </span>
            <span className="badge badge-amber">Prüfungsordnung AO 2020</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            Adaptiver IHK Prüfungspfad & Countdown-Planer
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Echtzeit-Bereitschaftsanalyse für die IHK Abschlussprüfung mit Countdown, Notenprognose und gezielten Modul-Empfehlungen.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleFinish}
          disabled={isCompleted}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Award size={18} />
          {isCompleted ? 'Abgeschlossen (+60 XP)' : 'Labor abschließen (+60 XP)'}
        </button>
      </div>

      {/* Countdown & Readiness Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <Clock size={32} color="var(--accent-teal)" style={{ margin: '0 auto 10px' }} />
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nächster IHK Prüfungstermin</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0' }}>
            {countdown.daysRemaining} Tage
          </div>
          <div className="badge badge-teal" style={{ marginTop: '6px' }}>
            {countdown.targetSeason} ({countdown.examDateStr})
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <Sparkles size={32} color="var(--accent-amber)" style={{ margin: '0 auto 10px' }} />
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Prüfungsbereitschaft (Score)</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: readiness.isReady ? 'var(--accent-teal)' : 'var(--accent-rose)', margin: '4px 0' }}>
            {readiness.overallReadinessPercent}%
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '6px' }}>
            Prognose: {readiness.gradeEstimate}
          </div>
        </div>
      </div>

      {/* Domain Breakdown */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="var(--accent-teal)" /> IHK Prüfungsbereiche & Lernstands-Eingabe
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {readiness.domains.map(d => {
            const stat = completedScores[d.domainKey] || { completed: 0, scoreSum: 0 };
            const currentScore = stat.completed > 0 ? Math.round(stat.scoreSum / stat.completed) : 70;

            return (
              <div
                key={d.domainKey}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  padding: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{d.title}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Gewichtung: {Math.round(d.weight * 100)}% • Soll: {d.requiredTasks} Aufgaben
                    </div>
                  </div>
                  <span className="badge badge-teal">
                    Ø {d.averageScore}% Erfolg
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '160px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Erledigte Aufgaben ({stat.completed}/{d.requiredTasks}):</label>
                    <input
                      type="range"
                      min="0"
                      max={d.requiredTasks * 1.5}
                      value={stat.completed}
                      onChange={(e) => updateDomain(d.domainKey, e.target.value, currentScore)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '160px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Test-Erfolg ({currentScore}%):</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentScore}
                      onChange={(e) => updateDomain(d.domainKey, stat.completed, e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} color="var(--accent-amber)" /> Handlungsempfehlungen & Schwachstellen-Fokus
        </h3>
        {readiness.recommendedFocus.length > 0 ? (
          <div>
            <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              In folgenden Prüfungsbereichen liegt deine Bereitschaft noch unter 60%. Es wird empfohlen, hier vorrangig Simulationen und Übungen durchzuführen:
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {readiness.recommendedFocus.map((focus, idx) => (
                <span key={idx} className="badge badge-amber" style={{ padding: '6px 12px', fontSize: '0.88rem' }}>
                  {focus}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-teal)' }}>
            <CheckCircle2 size={20} />
            <span>Hervorragend vorbereitet! Alle Kompetenzbereiche liegen im grünen Bereich.</span>
          </div>
        )}
      </div>
    </div>
  );
}
