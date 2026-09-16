import { describe, it, expect } from 'vitest';
import {
  generateConflictMarkers,
  hasConflictMarkers,
  resolveConflictAction,
  GIT_CONFLICT_SCENARIOS
} from './gitConflictEngine';

describe('gitConflictEngine', () => {
  it('generiert standardkonforme Git-Konfliktmarker', () => {
    const markers = generateConflictMarkers('const a = 1;', 'const a = 2;', 'main', 'feature');
    expect(markers).toContain('<<<<<<< main');
    expect(markers).toContain('const a = 1;');
    expect(markers).toContain('=======');
    expect(markers).toContain('const a = 2;');
    expect(markers).toContain('>>>>>>> feature');
  });

  it('erkennt unaufgelöste Konfliktmarker im Code', () => {
    expect(hasConflictMarkers('<<<<<<< HEAD\nfoo\n=======\nbar\n>>>>>>>')).toBe(true);
    expect(hasConflictMarkers('const a = 10;')).toBe(false);
  });

  it('löst Konflikte mit Schnell-Aktionen (accept_current, accept_incoming, accept_both) auf', () => {
    const cur = 'port: 3000';
    const inc = 'port: 8443';

    expect(resolveConflictAction('accept_current', cur, inc)).toBe('port: 3000');
    expect(resolveConflictAction('accept_incoming', cur, inc)).toBe('port: 8443');
    expect(resolveConflictAction('accept_both', cur, inc)).toContain('port: 3000');
    expect(resolveConflictAction('accept_both', cur, inc)).toContain('port: 8443');
  });

  it('enthält realistische Git-Konflikt-Szenarien', () => {
    expect(GIT_CONFLICT_SCENARIOS.length).toBeGreaterThanOrEqual(2);
    GIT_CONFLICT_SCENARIOS.forEach(sc => {
      expect(sc.id).toBeDefined();
      expect(sc.fileName).toBeDefined();
      expect(sc.currentCode).toBeDefined();
      expect(sc.incomingCode).toBeDefined();
    });
  });
});
