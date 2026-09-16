import { describe, it, expect } from 'vitest';
import { 
  evaluateOralAnswer, 
  calculateOralDefenseResult, 
  ORAL_DEFENSE_QUESTIONS,
  EXAMINER_PERSONAS 
} from './ihkOralDefenseEngine';

describe('ihkOralDefenseEngine (IHK Mündliches Fachgespräch & Audio-Prüfung)', () => {
  it('bewertet ausführliche Antworten mit Keywords mit hoher Punktzahl', () => {
    const question = ORAL_DEFENSE_QUESTIONS[0]; // REST vs GraphQL, Versionierung
    const goodAnswer = 'Wir haben uns für REST entschieden, da der Aufwand geringer war. Für die Abwärtskompatibilität nutzen wir URI-Versionierung wie /api/v1/ und standardisierte HTTP-Statuscodes, um Overfetching im Client zu vermeiden.';

    const evalResult = evaluateOralAnswer(question, goodAnswer);
    expect(evalResult.score).toBeGreaterThanOrEqual(7);
    expect(evalResult.matchedKeywords.length).toBeGreaterThanOrEqual(3);
    expect(evalResult.percentage).toBeGreaterThanOrEqual(70);
    expect(evalResult.feedback).toContain('Hervorragend');
  });

  it('straft zu knappe Antworten ohne Fachbegriffe ab', () => {
    const question = ORAL_DEFENSE_QUESTIONS[0];
    const poorAnswer = 'REST war einfach besser.';

    const evalResult = evaluateOralAnswer(question, poorAnswer);
    expect(evalResult.score).toBeLessThanOrEqual(3);
    expect(evalResult.feedback).toContain('Ausbaufähig');
  });

  it('berechnet IHK-Gesamtnote und Bestehensstatus korrekt', () => {
    const passedAnswers = [
      { score: 9, maxScore: 10 },
      { score: 8, maxScore: 10 },
      { score: 10, maxScore: 10 },
      { score: 9, maxScore: 10 },
      { score: 8, maxScore: 10 }
    ];

    const result = calculateOralDefenseResult(passedAnswers);
    expect(result.passed).toBe(true);
    expect(result.grade).toBe(2);
    expect(result.ihkPoints).toBe(88); // 44 / 50 = 88%
    expect(result.summary).toContain('Gut');
  });

  it('behandelt leere Antworten fehlerfrei', () => {
    const evalResult = evaluateOralAnswer(null, '');
    expect(evalResult.score).toBe(0);

    const calcResult = calculateOralDefenseResult([]);
    expect(calcResult.passed).toBe(false);
    expect(calcResult.grade).toBe(6);
  });

  it('definiert valide IHK Prüfer-Personas', () => {
    expect(EXAMINER_PERSONAS.length).toBeGreaterThanOrEqual(3);
    EXAMINER_PERSONAS.forEach(p => {
      expect(p.id).toBeDefined();
      expect(p.role).toBeDefined();
      expect(p.focus).toBeDefined();
    });
  });
});
