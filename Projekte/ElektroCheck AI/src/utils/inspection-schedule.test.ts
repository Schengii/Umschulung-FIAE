import { describe, it, expect } from 'vitest';
import { classifyDue, parseMonthYear, sortByDue, upsertInspection, type InspectionRecord } from './inspection-schedule';

const rec = (deviceName: string, nextInspection: string, inventoryNumber?: string): InspectionRecord => ({
  id: `${deviceName}-${nextInspection}`,
  deviceName,
  inventoryNumber,
  inspectedAt: '2026-01-01T00:00:00.000Z',
  nextInspection,
  status: 'BESTANDEN',
});

const NOW = new Date(2026, 9, 15); // 15.10.2026

describe('parseMonthYear', () => {
  it('liefert den letzten Tag des Monats', () => {
    const d = parseMonthYear('02/2028')!;
    expect(d.getFullYear()).toBe(2028);
    expect(d.getMonth()).toBe(1);
    expect(d.getDate()).toBe(29); // Schaltjahr
  });

  it('lehnt ungültige Formate ab', () => {
    expect(parseMonthYear('13/2026')).toBeNull();
    expect(parseMonthYear('2026-10')).toBeNull();
    expect(parseMonthYear('')).toBeNull();
  });
});

describe('classifyDue', () => {
  it('erkennt überfällige Prüfungen (Vormonat)', () => {
    expect(classifyDue(rec('A', '09/2026'), NOW)).toBe('overdue');
  });

  it('gilt den ganzen Fälligkeitsmonat als "bald fällig", nicht als überfällig', () => {
    expect(classifyDue(rec('A', '10/2026'), NOW)).toBe('due-soon');
  });

  it('berücksichtigt den Vorlauf von 30 Tagen bis zum Monatsende', () => {
    expect(classifyDue(rec('A', '11/2026'), new Date(2026, 10, 2))).toBe('due-soon'); // 02.11., Frist 30.11.
    expect(classifyDue(rec('A', '12/2026'), new Date(2026, 10, 2))).toBe('ok'); // Frist 31.12. liegt >30 Tage entfernt
  });

  it('stuft spätere Prüfungen und ungültige Daten als ok ein', () => {
    expect(classifyDue(rec('A', '03/2027'), NOW)).toBe('ok');
    expect(classifyDue(rec('A', 'kaputt'), NOW)).toBe('ok');
  });
});

describe('upsertInspection / sortByDue', () => {
  it('ersetzt eine frühere Prüfung desselben Geräts', () => {
    const list = upsertInspection([rec('Bohrhammer', '01/2027', 'I1'), rec('Lampe', '05/2027')], rec('bohrhammer', '01/2028', 'i1'));
    expect(list.map((r) => r.nextInspection)).toEqual(['01/2028', '05/2027']);
  });

  it('unterscheidet Geräte mit gleichem Namen über die Inventarnummer', () => {
    expect(upsertInspection([rec('Lampe', '01/2027', 'A')], rec('Lampe', '01/2027', 'B'))).toHaveLength(2);
  });

  it('sortiert überfällig vor bald fällig vor ok', () => {
    const sorted = sortByDue([rec('ok', '06/2027'), rec('soon', '10/2026'), rec('late', '01/2026')], NOW);
    expect(sorted.map((r) => r.deviceName)).toEqual(['late', 'soon', 'ok']);
  });
});
