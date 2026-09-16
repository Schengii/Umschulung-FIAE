import { describe, it, expect } from 'vitest';
import { 
  generateMermaidSequence, 
  validateSequenceDiagram, 
  generateMermaidActivity,
  DEFAULT_SEQUENCE_PARTICIPANTS,
  DEFAULT_SEQUENCE_MESSAGES,
  DEFAULT_ACTIVITY_STEPS 
} from './umlEngine';

describe('umlEngine (OMG UML 2.5 & IHK Standard)', () => {
  it('generiert valides Mermaid.js Sequenzdiagramm', () => {
    const mermaidCode = generateMermaidSequence({
      participants: DEFAULT_SEQUENCE_PARTICIPANTS,
      messages: DEFAULT_SEQUENCE_MESSAGES
    });

    expect(mermaidCode).toContain('sequenceDiagram');
    expect(mermaidCode).toContain('actor user as Benutzer / Client');
    expect(mermaidCode).toContain('database database as PostgreSQL DB');
    expect(mermaidCode).toContain('user->>auth_service: POST /auth/login (credentials)');
    expect(mermaidCode).toContain('auth_service-->>user: 200 OK + JWT Bearer Token');
  });

  it('validiert Sequenzdiagramme auf nicht-existente Teilnehmer und IHK-Konformität', () => {
    const validResult = validateSequenceDiagram({
      participants: DEFAULT_SEQUENCE_PARTICIPANTS,
      messages: DEFAULT_SEQUENCE_MESSAGES
    });
    expect(validResult.isValid).toBe(true);

    const invalidResult = validateSequenceDiagram({
      participants: [{ id: 'client', name: 'Client', type: 'actor' }],
      messages: [{ id: '1', from: 'client', to: 'unknown_service', label: 'Call', type: 'sync' }]
    });
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.issues.some(i => i.message.includes('unknown_service'))).toBe(true);
  });

  it('generiert Mermaid.js Aktivitätsdiagramme mit Entscheidungs-Guards', () => {
    const activityCode = generateMermaidActivity({
      steps: DEFAULT_ACTIVITY_STEPS
    });

    expect(activityCode).toContain('flowchart TD');
    expect(activityCode).toContain('-->|Ja|');
    expect(activityCode).toContain('-->|Nein|');
    expect(activityCode).toContain('start([((●))');
  });
});
