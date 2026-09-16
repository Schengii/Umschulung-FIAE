import { describe, it, expect } from 'vitest';
import {
  calculateRoundScore,
  generateRoomCode,
  createBotResponse,
  P2P_QUIZ_QUESTIONS
} from './p2pQuizEngine';

describe('p2pQuizEngine', () => {
  it('berechnet Punkte mit Geschwindigkeitsbonus korrekt', () => {
    // Falsche Antwort -> 0 Punkte
    expect(calculateRoundScore(false, 10, 15)).toBe(0);

    // Richtig und sofort (15s übrig) -> 100 + 50 = 150 Punkte
    expect(calculateRoundScore(true, 15, 15)).toBe(150);

    // Richtig in letzter Sekunde (0s übrig) -> 100 + 0 = 100 Punkte
    expect(calculateRoundScore(true, 0, 15)).toBe(100);

    // Richtig bei halber Zeit (7.5s) -> 100 + 25 = 125 Punkte
    expect(calculateRoundScore(true, 7.5, 15)).toBe(125);
  });

  it('generiert valide 6-stellige Raum-Codes', () => {
    const code = generateRoomCode();
    expect(code).toBeDefined();
    expect(code.length).toBe(6);
    expect(/^[A-Z0-9]+$/.test(code)).toBe(true);
  });

  it('erzeugt realistische Bot-Antworten', () => {
    const botRes = createBotResponse(0, 'medium');
    expect(botRes).toBeDefined();
    expect(botRes.chosenOption).toBeGreaterThanOrEqual(0);
    expect(botRes.chosenOption).toBeLessThanOrEqual(3);
    expect(botRes.answerTime).toBeGreaterThanOrEqual(0);
  });

  it('enthält einen validen Fragenkatalog mit mindestens 8 Fragen', () => {
    expect(P2P_QUIZ_QUESTIONS.length).toBeGreaterThanOrEqual(8);
    P2P_QUIZ_QUESTIONS.forEach(q => {
      expect(q.id).toBeDefined();
      expect(q.question).toBeDefined();
      expect(q.options.length).toBe(4);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThanOrEqual(3);
    });
  });
});
