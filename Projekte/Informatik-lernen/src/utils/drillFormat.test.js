import { describe, it, expect } from 'vitest';
import { normalizeDrillQuestions } from './drillFormat';
import { DOCKER_DRILL_QUESTIONS } from './dockerEngine';
import { K8S_DRILL_QUESTIONS } from './kubernetesEngine';
import { OAUTH_OIDC_DRILL_QUESTIONS } from './oauthOidcEngine';
import { CLOUD_DEVOPS_DRILL_QUESTIONS } from './cloudDevOpsEngine';
import { WEBSOCKETS_DRILL_QUESTIONS } from './webSocketsEngine';
import { IHK_CLASS_DRILL_QUESTIONS } from './umlEngine';
import { IHK_BAB_DRILL_QUESTIONS } from './wisoBabEngine';

describe('normalizeDrillQuestions', () => {
  it('lässt das deutsche Format unverändert', () => {
    const q = { id: 'a', frage: 'F?', optionen: ['x', 'y'], korrektIndex: 1, erklaerung: 'E' };
    expect(normalizeDrillQuestions([q])).toEqual([q]);
  });

  it('wandelt das englische Format um', () => {
    expect(normalizeDrillQuestions([{ id: 7, question: 'Q?', options: ['a', 'b'], correct: 0, explanation: 'Ex' }]))
      .toEqual([{ id: '7', frage: 'Q?', optionen: ['a', 'b'], korrektIndex: 0, erklaerung: 'Ex' }]);
  });

  it('liest richtigIndex (BAB) und isCorrect-Optionen (UML)', () => {
    expect(normalizeDrillQuestions([{ id: 'b', frage: 'F', optionen: ['a', 'b'], richtigIndex: 1, erklaerung: 'E' }])[0].korrektIndex).toBe(1);
    const uml = normalizeDrillQuestions([{ id: 'u', question: 'Q', options: [{ text: 'A', isCorrect: false }, { text: 'B', isCorrect: true }], explanation: 'E' }])[0];
    expect(uml.optionen).toEqual(['A', 'B']);
    expect(uml.korrektIndex).toBe(1);
  });

  it('liefert für alle sieben Lab-Quellen vollständige, gültige Fragen', () => {
    const sources = {
      docker: DOCKER_DRILL_QUESTIONS, k8s: K8S_DRILL_QUESTIONS, oauth: OAUTH_OIDC_DRILL_QUESTIONS,
      cloud: CLOUD_DEVOPS_DRILL_QUESTIONS, ws: WEBSOCKETS_DRILL_QUESTIONS, uml: IHK_CLASS_DRILL_QUESTIONS, bab: IHK_BAB_DRILL_QUESTIONS
    };
    for (const [name, raw] of Object.entries(sources)) {
      const list = normalizeDrillQuestions(raw);
      expect(list.length, name).toBe(raw.length);
      for (const q of list) {
        expect(q.frage.length, `${name}/${q.id}: frage`).toBeGreaterThan(0);
        expect(q.optionen.length, `${name}/${q.id}: optionen`).toBeGreaterThanOrEqual(2);
        expect(Number.isInteger(q.korrektIndex) && q.korrektIndex >= 0 && q.korrektIndex < q.optionen.length, `${name}/${q.id}: korrektIndex`).toBe(true);
        expect(q.erklaerung.length, `${name}/${q.id}: erklaerung`).toBeGreaterThan(0);
      }
    }
  });
});
