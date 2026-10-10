import { describe, it, expect } from 'vitest';
import { validateDependency, auditArchitecture, DEFAULT_COMPONENTS } from './cleanArchEngine';

describe('cleanArchEngine', () => {
  it('erkennt unzulässige Abhängigkeiten von innen nach außen (z.B. Entity importiert DB)', () => {
    // Entity (1) darf nicht Framework (4) importieren
    const check = validateDependency('entities', 'frameworks');
    expect(check.isValid).toBe(false);
    expect(check.reason).toContain('Verletzung der Dependency Rule');
  });

  it('erlaubt zulässige Abhängigkeiten von außen nach innen', () => {
    // Adapter (3) ruft UseCase (2) auf
    const check = validateDependency('adapters', 'use_cases');
    expect(check.isValid).toBe(true);

    // UseCase (2) ruft Entity (1) auf
    const check2 = validateDependency('use_cases', 'entities');
    expect(check2.isValid).toBe(true);
  });

  it('auditiert eine Liste von Abhängigkeiten und berechnet Compliance-Score', () => {
    const connections = [
      { fromId: 'comp-adapter-rest', toId: 'comp-usecase-create-order' }, // valid 3 -> 2
      { fromId: 'comp-usecase-create-order', toId: 'comp-entity-order' }, // valid 2 -> 1
      { fromId: 'comp-entity-order', toId: 'comp-driver-pg' } // VIOLATION 1 -> 4
    ];

    const result = auditArchitecture(connections, DEFAULT_COMPONENTS);
    expect(result.total).toBe(3);
    expect(result.violationsCount).toBe(1);
    expect(result.validCount).toBe(2);
    expect(result.complianceScore).toBe(67);
    expect(result.isClean).toBe(false);
  });
});
