import { describe, it, expect } from 'vitest';
import { calculateZuschlagskalkulation } from './wisoZuschlagskalkulationEngine';

describe('IHK Zuschlagskalkulation Engine', () => {
  it('correctly calculates step-by-step manufacturing and self-costs', () => {
    const res = calculateZuschlagskalkulation({
      fertigungsmaterial: 10000,
      materialgemeinkostensatzProzent: 10,
      fertigungslohn: 5000,
      fertigungsgemeinkostensatzProzent: 100,
      sondereinzelkostenFertigung: 500,
      verwaltungsgemeinkostensatzProzent: 5,
      vertriebsgemeinkostensatzProzent: 5,
      sondereinzelkostenVertrieb: 200,
      gewinnzuschlagProzent: 10,
      kundenskontoProzent: 2,
      kundenrabattProzent: 5,
      umsatzsteuerProzent: 19
    });

    // Materialbereich: 10000 + 10% = 11000
    expect(res.materialgemeinkosten).toBe(1000);
    expect(res.materialkosten).toBe(11000);

    // Fertigungsbereich: 5000 + 100% (5000) + 500 = 10500
    expect(res.fertigungsgemeinkosten).toBe(5000);
    expect(res.fertigungskosten).toBe(10500);

    // Herstellkosten: 11000 + 10500 = 21500
    expect(res.herstellkosten).toBe(21500);

    // Verwaltung & Vertrieb: je 5% von 21500 = 1075
    expect(res.verwaltungsgemeinkosten).toBe(1075);
    expect(res.vertriebsgemeinkosten).toBe(1075);

    // Selbstkosten: 21500 + 1075 + 1075 + 200 = 23850
    expect(res.selbstkosten).toBe(23850);

    // Barverkaufspreis: 23850 + 10% (2385) = 26235
    expect(res.barverkaufspreis).toBe(26235);
  });
});
