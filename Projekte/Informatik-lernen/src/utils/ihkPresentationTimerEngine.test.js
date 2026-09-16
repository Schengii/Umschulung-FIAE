import { describe, it, expect } from 'vitest';
import {
  TOTAL_PRESENTATION_SECONDS,
  DEFAULT_PRESENTATION_PHASES,
  getCurrentPhaseInfo,
  getTimingStatus,
  calculatePresentationGrade,
  formatTimeMMSS
} from './ihkPresentationTimerEngine';

describe('ihkPresentationTimerEngine (IHK Projektpräsentation 15-Minuten Stoppuhr)', () => {
  it('initialisiert die 4 offiziellen IHK Präsentationsphasen mit 900 Sekunden Gesamtlaufzeit', () => {
    expect(TOTAL_PRESENTATION_SECONDS).toBe(900);
    expect(DEFAULT_PRESENTATION_PHASES.length).toBe(4);
    const sumDuration = DEFAULT_PRESENTATION_PHASES.reduce((acc, p) => acc + p.targetDurationSec, 0);
    expect(sumDuration).toBe(900);
  });

  it('berechnet die korrekte Phase und Fortschritts-Prozentwerte', () => {
    // 60 Sekunden -> Phase 0 (Einleitung, 120s Ziel)
    const phase0 = getCurrentPhaseInfo(60);
    expect(phase0.phaseIndex).toBe(0);
    expect(phase0.phaseProgressPct).toBe(50);
    expect(phase0.phaseRemaining).toBe(60);
    expect(phase0.isOvertime).toBe(false);

    // 200 Sekunden -> Phase 1 (Analyse, 120 + 240 = 360s Grenze)
    const phase1 = getCurrentPhaseInfo(200);
    expect(phase1.phaseIndex).toBe(1);
    expect(phase1.phaseElapsed).toBe(80); // 200 - 120 = 80s
    expect(phase1.isOvertime).toBe(false);

    // 950 Sekunden -> Überzeit
    const overtime = getCurrentPhaseInfo(950);
    expect(overtime.isOvertime).toBe(true);
  });

  it('gibt korrekte Status-Meldungen bei Zeitnäherung und Überzeit zurück', () => {
    expect(getTimingStatus(500).status).toBe('ok');
    expect(getTimingStatus(850).status).toBe('warning'); // >= 840s (14min)
    expect(getTimingStatus(970).status).toBe('danger'); // > 960s (16min)
  });

  it('berechnet die IHK-Noten anhand der Rubriken-Bewertung', () => {
    const perfectScore = {
      rubric_structure: 100,
      rubric_technical: 100,
      rubric_media: 100,
      rubric_presentation: 100,
      rubric_timing: 100
    };
    const res1 = calculatePresentationGrade(perfectScore);
    expect(res1.passed).toBe(true);
    expect(res1.grade).toBe(1);
    expect(res1.percentage).toBe(100);

    const goodScore = {
      rubric_structure: 85,
      rubric_technical: 85,
      rubric_media: 80,
      rubric_presentation: 80,
      rubric_timing: 90
    };
    const res2 = calculatePresentationGrade(goodScore);
    expect(res2.passed).toBe(true);
    expect(res2.grade).toBe(2);

    const failingScore = {
      rubric_structure: 30,
      rubric_technical: 40,
      rubric_media: 30,
      rubric_presentation: 40,
      rubric_timing: 20
    };
    const resFailing = calculatePresentationGrade(failingScore);
    expect(resFailing.passed).toBe(false);
    expect(resFailing.grade).toBe(5);
  });

  it('formatiert Sekunden zuverlässig in MM:SS', () => {
    expect(formatTimeMMSS(0)).toBe('00:00');
    expect(formatTimeMMSS(75)).toBe('01:15');
    expect(formatTimeMMSS(900)).toBe('15:00');
    expect(formatTimeMMSS(-10)).toBe('-00:10');
  });
});
