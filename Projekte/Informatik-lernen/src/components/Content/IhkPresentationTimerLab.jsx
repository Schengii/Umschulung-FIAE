import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Pause, RotateCcw, Clock, Award, 
  CheckCircle2, ChevronRight, ChevronLeft,
  Volume2, VolumeX, ListChecks, HelpCircle 
} from 'lucide-react';
import { 
  TOTAL_PRESENTATION_SECONDS, 
  DEFAULT_PRESENTATION_PHASES, 
  PRESENTATION_RUBRICS,
  getCurrentPhaseInfo, 
  getTimingStatus, 
  calculatePresentationGrade, 
  formatTimeMMSS 
} from '../../utils/ihkPresentationTimerEngine';
import { useStore } from '../../store/useStore';

export default function IhkPresentationTimerLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [xpClaimed, setXpClaimed] = useState(false);
  const [rubricScores, setRubricScores] = useState({
    rubric_structure: 85,
    rubric_technical: 90,
    rubric_media: 80,
    rubric_presentation: 85,
    rubric_timing: 90
  });

  const timerRef = useRef(null);

  // Web Audio Gong Chime
  const playChime = useCallback((freq = 440, type = 'sine', duration = 0.5) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio fallback
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => {
          const next = prev + 1;
          // Akustisches Signal bei Phasenwechsel oder 14 Minuten
          if (next === 120 || next === 360 || next === 720) {
            playChime(660, 'triangle', 0.6);
          } else if (next === 840) {
            playChime(880, 'sine', 0.8); // 1-Minuten Warnung
          }
          return next;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, playChime]);

  const phaseInfo = getCurrentPhaseInfo(elapsedSeconds, DEFAULT_PRESENTATION_PHASES);
  const timingStatus = getTimingStatus(elapsedSeconds);
  const remainingTotal = Math.max(0, TOTAL_PRESENTATION_SECONDS - elapsedSeconds);
  const evaluationResult = calculatePresentationGrade(rubricScores);

  const activePhase = DEFAULT_PRESENTATION_PHASES[currentPhaseIdx];

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setCurrentPhaseIdx(0);
  };

  const handleClaimXP = () => {
    if (!xpClaimed && elapsedSeconds >= 300) { // mind. 5 Minuten geübt
      if (onRewardXP) onRewardXP(45);
      else awardXP(45, 'presentation_master');
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
                <Clock size={14} /> IHK Abschlussprüfung Teil 2
              </span>
              <span className="badge badge-teal">Teil A (15 Minuten)</span>
              <span className="badge badge-green">Folien-Gliederung</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0', color: 'var(--text-main)' }}>
              IHK Präsentations-Stoppuhr &amp; Folien-Gliederungs Studio
            </h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '750px', fontSize: '0.96rem', lineHeight: '1.6' }}>
              Trainiere die exakt 15-minütige Projektpräsentation vor dem Prüfungsausschuss. Kontrolliere Folienphasen, visualisiere Zeitbudgets und erhalte akustische Warnungen vor Überziehung.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title="Akustische Warnsignale ein/aus"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {soundEnabled ? <Volume2 size={16} color="var(--accent-teal)" /> : <VolumeX size={16} />}
              {soundEnabled ? 'Ton an' : 'Stumm'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleReset}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <RotateCcw size={16} /> Zurücksetzen
            </button>
            <button
              className={`btn ${isRunning ? 'btn-rose' : 'btn-primary'}`}
              onClick={() => setIsRunning(!isRunning)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
              {isRunning ? 'Pause' : 'Starten'}
            </button>
          </div>
        </div>

        {/* Big Timer Display */}
        <div style={{
          marginTop: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          background: 'var(--bg-tertiary)',
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Verstrichene Zeit
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: timingStatus.status === 'danger' ? 'var(--accent-rose)' : 'var(--text-main)', fontFamily: 'monospace' }}>
              {formatTimeMMSS(elapsedSeconds)}
            </div>
            <div style={{ fontSize: '0.82rem', color: timingStatus.status === 'danger' ? 'var(--accent-rose)' : timingStatus.status === 'warning' ? 'var(--accent-amber)' : 'var(--accent-emerald)', marginTop: '4px' }}>
              {timingStatus.message}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Verbleibende Zeit (15 Min Limit)
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: remainingTotal <= 60 ? 'var(--accent-amber)' : 'var(--accent-teal)', fontFamily: 'monospace' }}>
              {formatTimeMMSS(remainingTotal)}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Gesamtdauer: 15:00 Minuten
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Aktive Phase laut Zeit
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: phaseInfo.phase.color, marginTop: '8px' }}>
              {phaseInfo.phase.title}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Phasen-Fortschritt: {phaseInfo.phaseProgressPct}% ({formatTimeMMSS(phaseInfo.phaseRemaining)} übrig)
            </div>
          </div>
        </div>

        {/* Phase Progress Bar */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', height: '14px', borderRadius: '7px', overflow: 'hidden', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
            {DEFAULT_PRESENTATION_PHASES.map((phase) => {
              const widthPct = (phase.targetDurationSec / TOTAL_PRESENTATION_SECONDS) * 100;
              return (
                <div 
                  key={phase.id} 
                  style={{ 
                    width: `${widthPct}%`, 
                    background: phase.color,
                    opacity: phaseInfo.phase.id === phase.id ? 1 : 0.45,
                    transition: 'opacity 0.3s ease',
                    borderRight: '1px solid var(--bg-card)'
                  }} 
                  title={`${phase.title}: ${formatTimeMMSS(phase.targetDurationSec)}`}
                />
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            <span>00:00 (Start)</span>
            <span>02:00 (Analyse)</span>
            <span>06:00 (Realisierung)</span>
            <span>12:00 (Fazit)</span>
            <span>15:00 (Schluss)</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Slide Guide & Rubric Evaluation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Slide Navigation & Talking Points */}
        <div 
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={18} color="var(--accent-primary)" />
              Folien-Gliederung &amp; Leitfaden
            </h2>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPhaseIdx === 0}
                onClick={() => setCurrentPhaseIdx(prev => Math.max(0, prev - 1))}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPhaseIdx === DEFAULT_PRESENTATION_PHASES.length - 1}
                onClick={() => setCurrentPhaseIdx(prev => Math.min(DEFAULT_PRESENTATION_PHASES.length - 1, prev + 1))}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-tertiary)',
            borderLeft: `4px solid ${activePhase.color}`,
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                {activePhase.title}
              </h3>
              <span className="badge badge-teal" style={{ fontSize: '0.75rem' }}>
                {activePhase.recommendedSlides}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Empfohlene Dauer: {formatTimeMMSS(activePhase.targetDurationSec)} Minuten
            </div>
          </div>

          <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>
            Essenzielle Schwerpunkte in dieser Phase:
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
            {activePhase.keyPoints.map((pt, idx) => (
              <li key={idx}>{pt}</li>
            ))}
          </ul>

          <div style={{ marginTop: '20px', padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '0.84rem', color: 'var(--text-main)' }}>
            <strong>💡 IHK-Prüfertipp:</strong> Die Phase 3 (Entwurf &amp; Realisierung) ist mit 6 Minuten der wichtigste Block. Zeige hier konkrete technische Tiefe und vermeide langwierige Grundlagen-Erklärungen.
          </div>
        </div>

        {/* Rubrics Checklist & Grade Calculator */}
        <div 
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListChecks size={18} color="var(--accent-teal)" />
              IHK Bewertungskriterien (Rubriken)
            </h2>
            <span className="badge badge-indigo">
              Note: {evaluationResult.grade} ({evaluationResult.summary})
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            {PRESENTATION_RUBRICS.map(rubric => {
              const val = rubricScores[rubric.id] || 0;
              return (
                <div key={rubric.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                    <span>{rubric.category} ({rubric.weight}%)</span>
                    <span style={{ color: 'var(--accent-primary)' }}>{val}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={val}
                    onChange={(e) => setRubricScores({ ...rubricScores, [rubric.id]: parseInt(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {rubric.description}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Erreichte Gesamtpunktzahl</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: evaluationResult.passed ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                {evaluationResult.percentage}% ({evaluationResult.totalPoints} / 100 Pkt)
              </div>
            </div>

            <button
              className="btn btn-primary"
              disabled={xpClaimed || elapsedSeconds < 300}
              onClick={handleClaimXP}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {xpClaimed ? <CheckCircle2 size={16} /> : <Award size={16} />}
              {xpClaimed ? '45 XP Gutgeschrieben' : elapsedSeconds < 300 ? 'Mind. 5 Min üben' : '45 XP Freischalten'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
