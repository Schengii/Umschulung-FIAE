import { describe, it, expect } from 'vitest';
import {
  calculateVorwaertskalkulation,
  calculateDeckungsbeitrag,
  calculateNetzplan
} from './wisoCalculations';

describe('wisoCalculations', () => {
  it('berechnet die Vorwärtskalkulation korrekt', () => {
    const res = calculateVorwaertskalkulation({
      listeneinkaufspreis: 1000,
      lieferantenrabattProzent: 10,
      lieferskontoProzent: 2,
      bezugskosten: 20,
      handlungskostenzuschlagProzent: 20,
      gewinnzuschlagProzent: 10,
      kundenskontoProzent: 2,
      kundenrabattProzent: 5,
      umsatzsteuerProzent: 19
    });

    expect(res.rabattBetrag).toBe(100);
    expect(res.zieleinkaufspreis).toBe(900);
    expect(res.skontoBetrag).toBe(18);
    expect(res.bareinkaufspreis).toBe(882);
    expect(res.bezugspreis).toBe(902);
    expect(res.handlungskosten).toBe(180.4);
    expect(res.selbstkosten).toBe(1082.4);
    expect(res.gewinn).toBe(108.24);
    expect(res.barverkaufspreis).toBe(1190.64);
    expect(res.bruttoverkaufspreis).toBeGreaterThan(res.nettoverkaufspreis);
  });

  it('berechnet Deckungsbeitrag und Break-Even-Point korrekt', () => {
    const res = calculateDeckungsbeitrag({
      verkaufspreisStueck: 100,
      variableKostenStueck: 40,
      fixkostenGesamt: 60000,
      absetzbareMenge: 1200
    });

    expect(res.deckungsbeitragStueck).toBe(60);
    expect(res.deckungsbeitragGesamt).toBe(72000);
    expect(res.breakEvenPoint).toBe(1000); // 60000 / 60 = 1000
    expect(res.gewinnOderVerlust).toBe(12000);
    expect(res.deckungsbeitragsquoteProzent).toBe(60);
  });

  it('berechnet Netzplantechnik mit Kritischem Pfad und Puffern', () => {
    // Einfacher linearer Netzplan A -> B -> C
    const nodes = [
      { id: 'A', name: 'Start', dauer: 2, vorgaenger: [] },
      { id: 'B', name: 'Mitte', dauer: 3, vorgaenger: ['A'] },
      { id: 'C', name: 'Ende', dauer: 4, vorgaenger: ['B'] }
    ];

    const res = calculateNetzplan(nodes);
    expect(res.projektdauer).toBe(9);
    
    const nodeA = res.nodes.find(n => n.id === 'A');
    const nodeB = res.nodes.find(n => n.id === 'B');
    const nodeC = res.nodes.find(n => n.id === 'C');

    expect(nodeA.faz).toBe(0);
    expect(nodeA.fez).toBe(2);
    expect(nodeA.isKritisch).toBe(true);

    expect(nodeB.faz).toBe(2);
    expect(nodeB.fez).toBe(5);
    expect(nodeB.isKritisch).toBe(true);

    expect(nodeC.faz).toBe(5);
    expect(nodeC.fez).toBe(9);
    expect(nodeC.isKritisch).toBe(true);
  });
});
