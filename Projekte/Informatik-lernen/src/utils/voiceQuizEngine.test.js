import { describe, it, expect } from 'vitest';
import { evaluateSpokenAnswer } from './voiceQuizEngine';

describe('voiceQuizEngine', () => {
  it('bewertet richtige Sprach-Antworten anhand von Schlüsselbegriffen als bestanden', () => {
    const userSpeech = 'Datenschutz betrifft personenbezogene Daten nach DSGVO, während Datensicherheit technische Integrität und Vertraulichkeit umfasst.';
    const res = evaluateSpokenAnswer(userSpeech, 0);

    expect(res.passed).toBe(true);
    expect(res.matchedKeywords.length).toBeGreaterThanOrEqual(2);
    expect(res.matchedKeywords).toContain('personenbezogen');
  });

  it('erkennt unvollständige Antworten mit zu wenigen Schlüsselbegriffen', () => {
    const poorSpeech = 'Das ist einfach das gleiche.';
    const res = evaluateSpokenAnswer(poorSpeech, 0);

    expect(res.passed).toBe(false);
    expect(res.matchedKeywords.length).toBe(0);
  });
});
