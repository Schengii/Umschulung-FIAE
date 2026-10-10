import { describe, it, expect } from 'vitest';
import {
  ermittleAequivalenzklassen,
  ermittleGrenzwerte,
  berechneMcCabeKomplexitaet,
  berechneTestabdeckung,
  TESTVERFAHREN_DRILL_QUESTIONS
} from './testverfahrenEngine';

describe('testverfahrenEngine', () => {
  it('ermittelt standardisierte Äquivalenzklassen mit GÄK und UÄKs', () => {
    const aek = ermittleAequivalenzklassen({
      feldName: 'Alter',
      min: 18,
      max: 67,
      einheit: ' Jahre'
    });

    expect(aek).toHaveLength(4);
    const gaek = aek.find((k) => k.typ === 'GÄK');
    expect(gaek).toBeDefined();
    expect(gaek.erwartetesErgebnis).toBe('GÜLTIG');
    expect(gaek.repraesentant).toBeGreaterThanOrEqual(18);
    expect(gaek.repraesentant).toBeLessThanOrEqual(67);

    const uaek1 = aek.find((k) => k.id === 'UÄK-1');
    expect(uaek1.erwartetesErgebnis).toBe('UNGÜLTIG');
    expect(Number(uaek1.repraesentant)).toBeLessThan(18);

    const uaek2 = aek.find((k) => k.id === 'UÄK-2');
    expect(uaek2.erwartetesErgebnis).toBe('UNGÜLTIG');
    expect(Number(uaek2.repraesentant)).toBeGreaterThan(67);
  });

  it('führt eine exakte 6-Punkte Grenzwertanalyse durch', () => {
    const grenzwerte = ermittleGrenzwerte(18, 65);
    expect(grenzwerte).toHaveLength(6);

    expect(grenzwerte[0].wert).toBe(17);
    expect(grenzwerte[0].status).toBe('UNGÜLTIG');

    expect(grenzwerte[1].wert).toBe(18);
    expect(grenzwerte[1].status).toBe('GÜLTIG');

    expect(grenzwerte[2].wert).toBe(19);
    expect(grenzwerte[2].status).toBe('GÜLTIG');

    expect(grenzwerte[3].wert).toBe(64);
    expect(grenzwerte[3].status).toBe('GÜLTIG');

    expect(grenzwerte[4].wert).toBe(65);
    expect(grenzwerte[4].status).toBe('GÜLTIG');

    expect(grenzwerte[5].wert).toBe(66);
    expect(grenzwerte[5].status).toBe('UNGÜLTIG');
  });

  it('wirft einen Fehler, wenn min > max bei Grenzwerten', () => {
    expect(() => ermittleGrenzwerte(50, 10)).toThrow();
  });

  it('berechnet die zyklomatische Komplexität nach McCabe korrekt', () => {
    // E = 9, N = 7, P = 1 => M = 9 - 7 + 2 = 4
    const res = berechneMcCabeKomplexitaet({ kanten: 9, knoten: 7, komponenten: 1 });
    expect(res.mccabeKomplexitaet).toBe(4);
    expect(res.risikoKlasse).toBe('NIEDRIG');

    // E = 25, N = 10, P = 1 => M = 25 - 10 + 2 = 17
    const resMittel = berechneMcCabeKomplexitaet({ kanten: 25, knoten: 10, komponenten: 1 });
    expect(resMittel.mccabeKomplexitaet).toBe(17);
    expect(resMittel.risikoKlasse).toBe('MITTEL');

    // E = 60, N = 20, P = 1 => M = 42
    const resHoch = berechneMcCabeKomplexitaet({ kanten: 60, knoten: 20, komponenten: 1 });
    expect(resHoch.mccabeKomplexitaet).toBe(42);
    expect(resHoch.risikoKlasse).toBe('HOCH');
  });

  it('berechnet die Testüberdeckung für C0, C1 und C2', () => {
    const cov = berechneTestabdeckung({
      gesamtAnweisungen: 20,
      abgedeckteAnweisungen: 20,
      gesamtZweige: 10,
      abgedeckteZweige: 8,
      gesamtPfade: 16,
      abgedecktePfade: 4
    });

    expect(cov.c0AnweisungsUeberdeckung).toBe(100);
    expect(cov.istC0Vollstaendig).toBe(true);

    expect(cov.c1ZweigUeberdeckung).toBe(80);
    expect(cov.istC1Vollstaendig).toBe(false);

    expect(cov.c2PfadUeberdeckung).toBe(25);
  });

  it('stellt didaktische Prüfungsfragen mit eindeutigen Lösungen bereit', () => {
    expect(TESTVERFAHREN_DRILL_QUESTIONS.length).toBeGreaterThanOrEqual(4);
    for (const q of TESTVERFAHREN_DRILL_QUESTIONS) {
      expect(q.id).toBeDefined();
      expect(q.optionen).toHaveLength(4);
      expect(q.korrektIndex).toBeGreaterThanOrEqual(0);
      expect(q.korrektIndex).toBeLessThan(4);
    }
  });
});
