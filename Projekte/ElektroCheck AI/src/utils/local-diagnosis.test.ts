import { describe, it, expect } from 'vitest';
import { findLocalDiagnosis } from './local-diagnosis';

describe('findLocalDiagnosis', () => {
  it('findet einen Eintrag über den Modellnamen (Groß-/Kleinschreibung egal)', () => {
    const res = findLocalDiagnosis('mein dell e2222h zeigt nichts an');
    expect(res?.deviceName).toBe('Dell E2222H');
    expect(res?.safetyLevel).toBe('WARNING');
    expect(res?.additionalTips).toHaveLength(1);
  });

  it('findet einen Eintrag über den Fehlercode', () => {
    expect(findLocalDiagnosis('Display: grinder obstructed')?.deviceName).toBe('Saeco Royal');
  });

  it('liefert null ohne Treffer', () => {
    expect(findLocalDiagnosis('völlig unbekanntes Gerät')).toBeNull();
  });
});
