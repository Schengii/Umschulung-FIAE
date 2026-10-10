import { describe, it, expect } from 'vitest';
import {
  getKonto,
  validateBuchungssatz,
  berechneKontoSaldo,
  buchungssaetzeZuTKontoBuchungen,
  berechneJahresabschluss,
  erklaereBuchungsregel,
  IHK_SZENARIEN,
  KONTENRAHMEN,
} from './wisoBookkeepingEngine';

describe('wisoBookkeepingEngine', () => {
  describe('getKonto', () => {
    it('gibt ein gültiges Konto zurück', () => {
      const k = getKonto('1200');
      expect(k).toBeDefined();
      expect(k.name).toContain('Bank');
      expect(k.typ).toBe('aktiv');
    });

    it('gibt undefined für unbekannte Konto-ID zurück', () => {
      expect(getKonto('9999')).toBeUndefined();
    });
  });

  describe('validateBuchungssatz', () => {
    it('akzeptiert einen gültigen Buchungssatz', () => {
      const result = validateBuchungssatz({ soll: '3400', haben: '1600', betrag: 5000, beschreibung: 'Test' });
      expect(result.valid).toBe(true);
      expect(result.fehler).toBeNull();
    });

    it('lehnt Soll = Haben ab', () => {
      const result = validateBuchungssatz({ soll: '1200', haben: '1200', betrag: 100, beschreibung: '' });
      expect(result.valid).toBe(false);
      expect(result.fehler).toBeTruthy();
    });

    it('lehnt fehlenden Betrag ab', () => {
      const result = validateBuchungssatz({ soll: '1200', haben: '1400', betrag: 0, beschreibung: '' });
      expect(result.valid).toBe(false);
    });

    it('lehnt unbekannte Konten ab', () => {
      const result = validateBuchungssatz({ soll: '9999', haben: '1200', betrag: 100, beschreibung: '' });
      expect(result.valid).toBe(false);
    });
  });

  describe('berechneKontoSaldo', () => {
    it('berechnet Soll-Saldo korrekt', () => {
      const buchungen = [
        { kontoid: '1200', seite: 'soll', betrag: 5000, beschreibung: 'Eingang' },
        { kontoid: '1200', seite: 'haben', betrag: 2000, beschreibung: 'Ausgang' },
      ];
      const { sollSumme, habenSumme, saldo, saldoSeite } = berechneKontoSaldo('1200', buchungen);
      expect(sollSumme).toBe(5000);
      expect(habenSumme).toBe(2000);
      expect(saldo).toBe(3000);
      expect(saldoSeite).toBe('soll');
    });

    it('berechnet ausgeglichen korrekt', () => {
      const buchungen = [
        { kontoid: '1600', seite: 'soll', betrag: 500, beschreibung: '' },
        { kontoid: '1600', seite: 'haben', betrag: 500, beschreibung: '' },
      ];
      const { saldoSeite } = berechneKontoSaldo('1600', buchungen);
      expect(saldoSeite).toBe('ausgeglichen');
    });

    it('gibt Nullwerte für Konto ohne Buchungen', () => {
      const { sollSumme, habenSumme, saldo } = berechneKontoSaldo('0100', []);
      expect(sollSumme).toBe(0);
      expect(habenSumme).toBe(0);
      expect(saldo).toBe(0);
    });
  });

  describe('buchungssaetzeZuTKontoBuchungen', () => {
    it('erzeugt zwei T-Konto-Buchungen pro Satz', () => {
      const saetze = [
        { soll: '3400', haben: '1600', betrag: 5000, beschreibung: 'Wareneinkauf' },
      ];
      const buchungen = buchungssaetzeZuTKontoBuchungen(saetze);
      expect(buchungen).toHaveLength(2);
      expect(buchungen[0].kontoid).toBe('3400');
      expect(buchungen[0].seite).toBe('soll');
      expect(buchungen[1].kontoid).toBe('1600');
      expect(buchungen[1].seite).toBe('haben');
    });

    it('verarbeitet mehrere Buchungssätze', () => {
      const saetze = [
        { soll: '3400', haben: '1600', betrag: 1000, beschreibung: 'A' },
        { soll: '4100', haben: '1200', betrag: 500, beschreibung: 'B' },
      ];
      const buchungen = buchungssaetzeZuTKontoBuchungen(saetze);
      expect(buchungen).toHaveLength(4);
    });
  });

  describe('berechneJahresabschluss', () => {
    it('berechnet Gewinn bei mehr Erträgen als Aufwendungen', () => {
      const saetze = [
        { soll: '1400', haben: '8100', betrag: 10000, beschreibung: 'Umsatz' },
        { soll: '4100', haben: '1200', betrag: 3000, beschreibung: 'Gehalt' },
      ];
      const buchungen = buchungssaetzeZuTKontoBuchungen(saetze);
      const { guv } = berechneJahresabschluss(buchungen);
      expect(guv.ertraege).toBe(10000);
      expect(guv.aufwendungen).toBe(3000);
      expect(guv.ergebnis).toBe(7000);
    });

    it('berechnet Verlust wenn Aufwendungen > Erträge', () => {
      const saetze = [
        { soll: '8100', haben: '1200', betrag: 1000, beschreibung: 'Ertragskorrektur' },
        { soll: '4100', haben: '1200', betrag: 5000, beschreibung: 'Gehalt' },
      ];
      const buchungen = buchungssaetzeZuTKontoBuchungen(saetze);
      const { guv } = berechneJahresabschluss(buchungen);
      expect(guv.ergebnis).toBeLessThan(0);
    });

    it('berücksichtigt Anfangsbestände', () => {
      const buchungen = [];
      const anfangsbestaende = { '8100': 20000 };
      const { guv } = berechneJahresabschluss(buchungen, anfangsbestaende);
      expect(guv.ertraege).toBe(20000);
    });
  });

  describe('erklaereBuchungsregel', () => {
    it('erklärt Aktivkonto Soll korrekt', () => {
      const r = erklaereBuchungsregel('aktiv', 'soll');
      expect(r).toContain('Zugänge');
    });

    it('erklärt Passivkonto Haben korrekt', () => {
      const r = erklaereBuchungsregel('passiv', 'haben');
      expect(r).toContain('Zunahme der Schulden');
    });

    it('erklärt Aufwandskonto Soll korrekt', () => {
      const r = erklaereBuchungsregel('aufwand', 'soll');
      expect(r).toContain('Aufwand entsteht');
    });
  });

  describe('IHK_SZENARIEN', () => {
    it('enthält mindestens 5 Szenarien', () => {
      expect(IHK_SZENARIEN.length).toBeGreaterThanOrEqual(5);
    });

    it('jedes Szenario hat gültige Konten', () => {
      for (const s of IHK_SZENARIEN) {
        expect(getKonto(s.soll)).toBeDefined();
        expect(getKonto(s.haben)).toBeDefined();
        expect(s.betrag).toBeGreaterThan(0);
      }
    });

    it('jedes Szenario besteht Buchungssatz-Validierung', () => {
      for (const s of IHK_SZENARIEN) {
        const result = validateBuchungssatz({
          soll: s.soll,
          haben: s.haben,
          betrag: s.betrag,
          beschreibung: s.beschreibung,
        });
        expect(result.valid).toBe(true);
      }
    });
  });

  describe('KONTENRAHMEN', () => {
    it('enthält Konten aus allen vier Typen', () => {
      const typen = new Set(KONTENRAHMEN.map((k) => k.typ));
      expect(typen.has('aktiv')).toBe(true);
      expect(typen.has('passiv')).toBe(true);
      expect(typen.has('aufwand')).toBe(true);
      expect(typen.has('ertrag')).toBe(true);
    });

    it('alle Konten haben eindeutige IDs', () => {
      const ids = KONTENRAHMEN.map((k) => k.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
