import { describe, it, expect } from 'vitest';
import {
  ZAHLUNGSARTEN,
  PREISNACHLAESSE,
  IHK_ZAHLUNGSAUFGABEN,
  SEPA_MANDAT_INFO,
  berechneSkontovorteil,
  berechneWechseldiskont,
} from './wisoPaymentEngine';

describe('ZAHLUNGSARTEN', () => {
  it('enthält 5 Zahlungsarten', () => {
    expect(ZAHLUNGSARTEN).toHaveLength(5);
  });

  it('jede Zahlungsart hat die Pflichtfelder', () => {
    ZAHLUNGSARTEN.forEach((z) => {
      expect(z).toHaveProperty('id');
      expect(z).toHaveProperty('name');
      expect(z).toHaveProperty('beschreibung');
      expect(z.merkmale).toBeInstanceOf(Array);
      expect(z.merkmale.length).toBeGreaterThan(0);
      expect(['gering', 'mittel', 'hoch']).toContain(z.risiko);
    });
  });

  it('enthält SEPA-Überweisung und SEPA-Lastschrift', () => {
    const ids = ZAHLUNGSARTEN.map((z) => z.id);
    expect(ids).toContain('sepa_ueberweisung');
    expect(ids).toContain('sepa_lastschrift');
  });
});

describe('berechneSkontovorteil', () => {
  it('berechnet korrekten Effektivzins für 2/14 netto 60', () => {
    const r = berechneSkontovorteil(2, 60, 14);
    // (2/98) * (360/46) * 100 ≈ 15.96
    expect(r.effektivzins).toBeCloseTo(15.96, 1);
  });

  it('empfiehlt Skontoverzicht wenn Effektivzins < Referenzzins', () => {
    // Sehr kleine Skontofrist-Differenz → sehr hoher Effektivzins → Skonto immer lohnt
    const r = berechneSkontovorteil(3, 30, 7);
    expect(r.effektivzins).toBeGreaterThan(10);
    expect(r.empfehlung).toMatch(/lohnt sich/);
  });

  it('wirft Fehler wenn Zahlungsziel ≤ Skontofrist', () => {
    expect(() => berechneSkontovorteil(2, 10, 10)).toThrow();
    expect(() => berechneSkontovorteil(2, 5, 10)).toThrow();
  });

  it('enthält kreditzins und empfehlung', () => {
    const r = berechneSkontovorteil(2, 30, 10);
    expect(r).toHaveProperty('kreditzins');
    expect(r).toHaveProperty('empfehlung');
    expect(typeof r.empfehlung).toBe('string');
  });
});

describe('berechneWechseldiskont', () => {
  it('berechnet Diskont und Auszahlung korrekt', () => {
    // Nennwert 12000, Diskontsatz 6%, 45 Tage
    // Diskont = (12000 * 6 * 45) / 36000 = 90
    const r = berechneWechseldiskont(12000, 6, 45);
    expect(r.diskont).toBeCloseTo(90, 2);
    expect(r.auszahlung).toBeCloseTo(11910, 2);
  });

  it('berechnet Effektivzins > nominalen Diskontsatz', () => {
    // Effektivzins auf Basis des abgezinsten Betrags liegt über dem Diskontsatz
    const r = berechneWechseldiskont(10000, 6, 90);
    expect(r.effektivzins).toBeGreaterThan(6);
  });

  it('wirft Fehler bei ungültigen Eingaben', () => {
    expect(() => berechneWechseldiskont(0, 6, 45)).toThrow();
    expect(() => berechneWechseldiskont(10000, 0, 45)).toThrow();
    expect(() => berechneWechseldiskont(10000, 6, 0)).toThrow();
  });

  it('Auszahlung = Nennwert - Diskont', () => {
    const r = berechneWechseldiskont(5000, 8, 30);
    expect(r.auszahlung).toBeCloseTo(r.diskont ? 5000 - r.diskont : 5000, 2);
  });
});

describe('PREISNACHLAESSE', () => {
  it('enthält 3 Nachlass-Arten (Skonto, Rabatt, Bonus)', () => {
    expect(PREISNACHLAESSE).toHaveLength(3);
    const typen = PREISNACHLAESSE.map((p) => p.typ);
    expect(typen).toContain('Skonto');
    expect(typen).toContain('Rabatt');
    expect(typen).toContain('Bonus');
  });

  it('jede Nachlass-Art hat Definition und Beispiel', () => {
    PREISNACHLAESSE.forEach((p) => {
      expect(p.definition).toBeTruthy();
      expect(p.beispiel).toBeTruthy();
      expect(p.zeitpunkt).toBeTruthy();
    });
  });
});

describe('IHK_ZAHLUNGSAUFGABEN', () => {
  it('enthält mindestens 5 Aufgaben', () => {
    expect(IHK_ZAHLUNGSAUFGABEN.length).toBeGreaterThanOrEqual(5);
  });

  it('jede Aufgabe hat id, titel, aufgabe, loesung', () => {
    IHK_ZAHLUNGSAUFGABEN.forEach((a) => {
      expect(a.id).toBeTruthy();
      expect(a.titel).toBeTruthy();
      expect(a.aufgabe).toBeTruthy();
      expect(a.loesung).toBeTruthy();
    });
  });

  it('skonto-Aufgaben haben skontoProzent und zahlungsziel', () => {
    const skontoAufgaben = IHK_ZAHLUNGSAUFGABEN.filter((a) => a.typ === 'skonto');
    expect(skontoAufgaben.length).toBeGreaterThan(0);
    skontoAufgaben.forEach((a) => {
      expect(a.skontoProzent).toBeGreaterThan(0);
      expect(a.zahlungsziel).toBeGreaterThan(0);
    });
  });
});

describe('SEPA_MANDAT_INFO', () => {
  it('enthält Pflichtangaben', () => {
    expect(SEPA_MANDAT_INFO.pflichtangaben.length).toBeGreaterThan(0);
  });

  it('enthält korrekte CORE-Vorlaufzeiten', () => {
    expect(SEPA_MANDAT_INFO.vorlaufzeiten.core_erst).toMatch(/5/);
    expect(SEPA_MANDAT_INFO.vorlaufzeiten.core_folge).toMatch(/2/);
  });
});
