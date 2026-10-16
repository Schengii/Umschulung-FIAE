import { describe, it, expect } from 'vitest';
import { buildHistoryExport } from './history-export';
import type { DiagnosisResult } from '../services/ai-types';

const entry: DiagnosisResult = {
  deviceName: 'Bohr"hammer',
  identifiedDefect: 'Kabelbruch',
  recommendation: 'Kabel ersetzen',
  estimatedRepairCost: '35 €',
  repairDifficulty: 2,
  safetyLevel: 'WARNING',
  additionalTips: [],
  sparePartSearchTerm: '',
  customerExperience: '',
};

describe('buildHistoryExport', () => {
  it('erzeugt CSV mit Kopfzeile und maskierten Anführungszeichen', () => {
    const file = buildHistoryExport([entry], 'csv');
    expect(file.content.startsWith('\uFEFF')).toBe(true);
    const [header, row] = file.content.slice(1).split('\n');
    expect(header).toBe('Gerät;Defekt;Empfehlung;Schwierigkeit;Sicherheitsstufe;Kosten');
    expect(row).toBe('"Bohr""hammer";"Kabelbruch";"Kabel ersetzen";2;WARNING;"35 €"');
    expect(file.fileName).toBe('electrocheck_diagnosen_export.csv');
    expect(file.mimeType).toBe('text/csv;charset=utf-8');
  });

  it('erzeugt JSON mit gültigem MIME-Type (früher doppeltes "data:"-Präfix)', () => {
    const file = buildHistoryExport([entry], 'json');
    expect(JSON.parse(file.content)).toEqual([entry]);
    expect(file.mimeType).toBe('application/json;charset=utf-8');
    expect(file.mimeType.startsWith('data:')).toBe(false);
  });
});
