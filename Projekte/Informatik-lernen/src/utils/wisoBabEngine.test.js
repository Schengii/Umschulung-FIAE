import { describe, it, expect } from 'vitest';
import {
  verteileKosten,
  berechneHilfskostenumlage,
  berechneBab,
  berechneZuschlagskalkulation,
  berechneBab2Kostenueberdeckung,
  IHK_BAB_BEISPIEL,
  KOSTENSTELLEN,
} from './wisoBabEngine';

describe('wisoBabEngine', () => {
  describe('verteileKosten', () => {
    it('verteilt Kosten korrekt anhand Schlüssel', () => {
      const result = verteileKosten(10000, { Material: 0.3, Fertigung: 0.5, Verwaltung: 0.1, Vertrieb: 0.1 });
      expect(result.Material).toBeCloseTo(3000);
      expect(result.Fertigung).toBeCloseTo(5000);
      expect(result.Verwaltung).toBeCloseTo(1000);
      expect(result.Vertrieb).toBeCloseTo(1000);
    });

    it('wirft Fehler wenn Schlüssel nicht 1 ergibt', () => {
      expect(() => verteileKosten(1000, { Material: 0.5, Fertigung: 0.3 })).toThrow();
    });
  });

  describe('berechneHilfskostenumlage', () => {
    it('delegiert korrekt an verteileKosten', () => {
      const result = berechneHilfskostenumlage(8000, { Material: 0.25, Fertigung: 0.5, Verwaltung: 0.125, Vertrieb: 0.125 });
      expect(result.Fertigung).toBeCloseTo(4000);
    });
  });

  describe('berechneBab', () => {
    it('berechnet Zuschlagssätze für das IHK-Beispiel', () => {
      const result = berechneBab(IHK_BAB_BEISPIEL);
      expect(result.zuschlagsaetze.mgkSatz).toBeGreaterThan(0);
      expect(result.zuschlagsaetze.fgkSatz).toBeGreaterThan(0);
      expect(result.zuschlagsaetze.vwgkSatz).toBeGreaterThan(0);
      expect(result.zuschlagsaetze.vtrgkSatz).toBeGreaterThan(0);
    });

    it('berechnet Herstellkosten = MEK + MGK + FEK + FGK', () => {
      const result = berechneBab(IHK_BAB_BEISPIEL);
      const erwartet =
        IHK_BAB_BEISPIEL.materialeinzelkosten +
        result.kostenstellenSummen['Material'] +
        IHK_BAB_BEISPIEL.fertigungseinzelkosten +
        result.kostenstellenSummen['Fertigung'];
      expect(result.herstellkosten).toBeCloseTo(erwartet);
    });

    it('Selbstkosten > Herstellkosten', () => {
      const result = berechneBab(IHK_BAB_BEISPIEL);
      expect(result.selbstkosten).toBeGreaterThan(result.herstellkosten);
    });

    it('Kostenstellensummen enthalten alle Kostenstellen', () => {
      const result = berechneBab(IHK_BAB_BEISPIEL);
      for (const ks of KOSTENSTELLEN) {
        expect(result.kostenstellenSummen[ks]).toBeDefined();
      }
    });
  });

  describe('berechneZuschlagskalkulation', () => {
    it('berechnet Angebotspreis korrekt', () => {
      const result = berechneZuschlagskalkulation({
        mek: 200,
        fek: 300,
        mgkSatz: 25,
        fgkSatz: 50,
        vwgkSatz: 10,
        vtrgkSatz: 8,
        gewinnzuschlag: 15,
      });
      // MEK=200, MGK=50, FEK=300, FGK=150 -> HK=700
      expect(result.herstellkosten).toBeCloseTo(700);
      // VwGK=70, VtrGK=56 -> SK=826
      expect(result.selbstkosten).toBeCloseTo(826);
      // Gewinn=826*0.15=123.9, AP=949.9
      expect(result.angebotspreis).toBeCloseTo(949.9);
    });

    it('berechnet ohne Gewinnzuschlag korrekt', () => {
      const result = berechneZuschlagskalkulation({
        mek: 100,
        fek: 100,
        mgkSatz: 0,
        fgkSatz: 0,
        vwgkSatz: 0,
        vtrgkSatz: 0,
      });
      expect(result.angebotspreis).toBeCloseTo(200);
    });

    it('MGK wird auf MEK-Basis berechnet', () => {
      const result = berechneZuschlagskalkulation({ mek: 1000, fek: 0, mgkSatz: 30, fgkSatz: 0, vwgkSatz: 0, vtrgkSatz: 0 });
      expect(result.mgk).toBeCloseTo(300);
    });
  });

  describe('IHK_BAB_BEISPIEL', () => {
    it('enthält alle Pflichtfelder', () => {
      expect(IHK_BAB_BEISPIEL.materialeinzelkosten).toBeGreaterThan(0);
      expect(IHK_BAB_BEISPIEL.fertigungseinzelkosten).toBeGreaterThan(0);
      expect(IHK_BAB_BEISPIEL.gemeinkosten.length).toBeGreaterThan(0);
    });

    it('alle Schlüssel summieren sich zu 1', () => {
      for (const art of IHK_BAB_BEISPIEL.gemeinkosten) {
        const summe = Object.values(art.schluessel).reduce((s, v) => s + v, 0);
        expect(summe).toBeCloseTo(1);
      }
    });
  });

  describe('berechneBab2Kostenueberdeckung', () => {
    it('berechnet Kostenüberdeckung und -unterdeckung pro Kostenstelle korrekt', () => {
      const bab = berechneBab(IHK_BAB_BEISPIEL);
      const res = berechneBab2Kostenueberdeckung({
        istKostenstellenSummen: bab.kostenstellenSummen,
        materialeinzelkosten: IHK_BAB_BEISPIEL.materialeinzelkosten,
        fertigungseinzelkosten: IHK_BAB_BEISPIEL.fertigungseinzelkosten,
        herstellkosten: bab.herstellkosten,
        normalZuschlagssaetze: {
          mgkSatz: 25.0,
          fgkSatz: 10.0,
          vwgkSatz: 15.0,
          vtrgkSatz: 10.0,
        },
      });

      expect(res.auswertung).toHaveLength(4);
      const mat = res.auswertung.find((a) => a.kostenstelle === 'Material');
      expect(mat?.normalGemeinkosten).toBe(IHK_BAB_BEISPIEL.materialeinzelkosten * 0.25);
      expect(mat?.differenz).toBeGreaterThan(0);
      expect(mat?.status).toBe('Überdeckung');

      const fert = res.auswertung.find((a) => a.kostenstelle === 'Fertigung');
      expect(fert?.status).toBe('Unterdeckung');
      expect(typeof res.gesamtDifferenz).toBe('number');
      expect(['Überdeckung', 'Unterdeckung', 'Ausgeglichen']).toContain(res.gesamtStatus);
    });
  });
});

