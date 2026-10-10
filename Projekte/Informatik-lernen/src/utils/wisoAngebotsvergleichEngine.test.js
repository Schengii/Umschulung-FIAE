import { describe, it, expect } from 'vitest';
import {
  berechneQuantitativesAngebot,
  vergleicheQuantitativeAngebote,
  berechneLieferantenkreditVergleich,
  berechneQualitativenAngebotsvergleich,
  runden2,
  WISO_ANGEBOTSVERGLEICH_DRILL
} from './wisoAngebotsvergleichEngine';

describe('wisoAngebotsvergleichEngine', () => {
  it('berechnet das quantitative Kalkulationsschema exakt nach IHK-Standard', () => {
    // Beispiel: LEP 10.000 €, Rabatt 10%, Skonto 2%, Bezugskosten 150 €
    const res = berechneQuantitativesAngebot({
      anbieterName: 'TechSupplier GmbH',
      listeneinkaufspreis: 10000,
      rabattProzent: 10,
      skontoProzent: 2,
      bezugskosten: 150
    });

    expect(res.listeneinkaufspreis).toBe(10000);
    expect(res.rabattBetrag).toBe(1000);
    expect(res.zieleinkaufspreis).toBe(9000);
    expect(res.skontoBetrag).toBe(180);
    expect(res.bareinkaufspreis).toBe(8820);
    expect(res.bezugskosten).toBe(150);
    expect(res.bezugspreis).toBe(8970);
  });

  it('vergleicht mehrere Anbieter und ermittelt den günstigsten Bezugspreis', () => {
    const angebote = [
      {
        anbieterName: 'Lieferant A',
        listeneinkaufspreis: 5000,
        rabattProzent: 5,
        skontoProzent: 2,
        bezugskosten: 200
      },
      {
        anbieterName: 'Lieferant B',
        listeneinkaufspreis: 4800,
        rabattProzent: 0,
        skontoProzent: 3,
        bezugskosten: 100
      }
    ];

    const vergleich = vergleicheQuantitativeAngebote(angebote);
    expect(vergleich.ergebnisse).toHaveLength(2);
    // Lieferant A: 5000 - 250 = 4750; 4750 - 95 = 4655; + 200 = 4855 €
    // Lieferant B: 4800 - 0 = 4800; 4800 - 144 = 4656; + 100 = 4756 €
    expect(vergleich.besterAnbieter).toBe('Lieferant B');
    expect(vergleich.einsparungGegenueberSchlechtestem).toBe(runden2(4855 - 4756));
  });

  it('berechnet den effektiven Jahreszins und den Zinsgewinn beim Lieferantenkredit', () => {
    // 10.000 € Rechnung, 3% Skonto innerhalb 10 Tagen, netto 30 Tage, Bankzins 12% p.a.
    const res = berechneLieferantenkreditVergleich({
      rechnungsbetrag: 10000,
      skontoProzent: 3,
      skontoTage: 10,
      zielTage: 30,
      kontokorrentZinsProzent: 12
    });

    expect(res.skontoBetrag).toBe(300);
    expect(res.ueberweisungsbetragMitSkonto).toBe(9700);
    expect(res.kreditdauerTage).toBe(20);
    // p_eff = (3 * 360) / 20 = 1080 / 20 = 54% p.a.
    expect(res.effektiverLieferantenzins).toBe(54);
    // Bankzinsen = 9700 * 0.12 * (20 / 360) = 64.67 €
    expect(res.bankkreditzinsen).toBe(64.67);
    // Zinsgewinn = 300 - 64.67 = 235.33 €
    expect(res.zinsgewinn).toBe(235.33);
    expect(res.lohntSichBankkredit).toBe(true);
    expect(res.begruendung).toContain('54.00% p.a.');
  });

  it('erkennt unrentable Kreditsituationen, wenn Skonto 0% oder Zielzeit gleich Skontotag ist', () => {
    const res = berechneLieferantenkreditVergleich({
      rechnungsbetrag: 5000,
      skontoProzent: 0,
      skontoTage: 14,
      zielTage: 14,
      kontokorrentZinsProzent: 8
    });

    expect(res.effektiverLieferantenzins).toBe(0);
    expect(res.lohntSichBankkredit).toBe(false);
  });

  it('berechnet den qualitativen Angebotsvergleich mit Nutzwerten', () => {
    const kriterien = [
      { name: 'Preis', gewichtungProzent: 50 },
      { name: 'Qualität', gewichtungProzent: 30 },
      { name: 'Liefertreue', gewichtungProzent: 20 }
    ];

    const bewertungen = {
      'Alpha IT': { Preis: 8, Qualität: 9, Liefertreue: 9 }, // 4.0 + 2.7 + 1.8 = 8.5
      'Beta IT': { Preis: 10, Qualität: 6, Liefertreue: 7 }   // 5.0 + 1.8 + 1.4 = 8.2
    };

    const res = berechneQualitativenAngebotsvergleich({ kriterien, bewertungen });
    expect(res.besterAnbieter).toBe('Alpha IT');
    expect(res.rangliste[0].nutzwert).toBe(8.5);
    expect(res.rangliste[1].nutzwert).toBe(8.2);
  });

  it('stellt didaktische Prüfungsfragen mit eindeutigen Lösungen bereit', () => {
    expect(WISO_ANGEBOTSVERGLEICH_DRILL.length).toBeGreaterThanOrEqual(4);
    for (const q of WISO_ANGEBOTSVERGLEICH_DRILL) {
      expect(q.id).toBeDefined();
      expect(q.optionen.length).toBe(4);
      expect(q.korrektIndex).toBeGreaterThanOrEqual(0);
      expect(q.korrektIndex).toBeLessThan(4);
    }
  });
});
