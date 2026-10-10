// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import WisoKalkulationLab from './WisoKalkulationLab';
import { useStore } from '../../store/useStore';

// Das Lab vergibt XP direkt über den Store statt über eine Prop.
let awardXP;
const originalAwardXP = useStore.getState().awardXP;
beforeEach(() => {
  awardXP = vi.fn();
  useStore.setState({ awardXP });
});
afterEach(() => {
  cleanup();
  useStore.setState({ awardXP: originalAwardXP });
});

const openTab = (name) => fireEvent.click(screen.getByRole('button', { name }));
const spinbuttons = () => screen.getAllByRole('spinbutton');

describe('WisoKalkulationLab: Vorwärtskalkulation', () => {
  it('rechnet das IHK-Schema vom Listeneinkaufspreis bis zum Bruttoverkaufspreis', () => {
    render(<WisoKalkulationLab />);
    expect(screen.getByText('882.00 €')).toBeTruthy(); // Bareinkaufspreis
    expect(screen.getByText('902.00 €')).toBeTruthy(); // Bezugspreis
    expect(screen.getByText('1127.50 €')).toBeTruthy(); // Selbstkosten
    expect(screen.getByText('1296.63 €')).toBeTruthy(); // Barverkaufspreis
    expect(screen.getByText('1657.34 €')).toBeTruthy(); // Bruttoverkaufspreis
  });

  it('rechnet nach Änderung des Listeneinkaufspreises neu', () => {
    render(<WisoKalkulationLab />);
    fireEvent.change(spinbuttons()[0], { target: { value: '2000' } });
    // 2000 − 10 % − 2 % + 20 = 1784 Bezugspreis
    expect(screen.getByText('1784.00 €')).toBeTruthy();
    expect(screen.queryByText('902.00 €')).toBeNull();
  });
});

describe('WisoKalkulationLab: Rückwärts- & Differenzkalkulation', () => {
  it('ermittelt den maximalen Listeneinkaufspreis und den Gewinnsatz', () => {
    render(<WisoKalkulationLab />);
    openTab(/Rückwärts- & Differenzkalkulation/);
    expect(screen.getByText('893.93 €')).toBeTruthy();
    // 1350 × 0,95 × 0,98 = 1256,85 BVP − 1127,50 SK = 129,35 € (11,47 %)
    expect(screen.getByText('129.35 € (11.5%)')).toBeTruthy();
    expect(screen.getByText(/Rentabel \(Gewinn realisierbar\)/)).toBeTruthy();
  });

  it('meldet ein Verlustgeschäft, wenn der Marktpreis unter den Selbstkosten liegt', () => {
    render(<WisoKalkulationLab />);
    openTab(/Rückwärts- & Differenzkalkulation/);
    // Reihenfolge: 4 Felder Rückwärts, dann LEP und Markt-NVP der Differenzkalkulation
    fireEvent.change(spinbuttons()[5], { target: { value: '1000' } });
    expect(screen.getByText('-196.50 € (-17.4%)')).toBeTruthy();
    expect(screen.getByText(/Unrentabel \(Verlustgeschäft!\)/)).toBeTruthy();
  });
});

describe('WisoKalkulationLab: Deckungsbeitrag & Break-Even', () => {
  it('berechnet Stück-DB, Break-Even-Menge und Betriebsergebnis', () => {
    render(<WisoKalkulationLab />);
    openTab(/Deckungsbeitrag & Break-Even/);
    expect(screen.getByText('30.00 €')).toBeTruthy();
    expect(screen.getByText('500 Stück')).toBeTruthy();
    expect(screen.getByText('9000.00 €')).toBeTruthy();
    expect(screen.getByText(/Gewinnschwelle ist überschritten/)).toBeTruthy();
  });

  it('zeigt unterhalb der Gewinnschwelle die fehlende Menge und den Verlust', () => {
    render(<WisoKalkulationLab />);
    openTab(/Deckungsbeitrag & Break-Even/);
    fireEvent.change(spinbuttons()[3], { target: { value: '300' } });
    expect(screen.getByText('-6000.00 €')).toBeTruthy();
    expect(screen.getByText(/Es fehlen noch 200 Stück/)).toBeTruthy();
  });
});

describe('WisoKalkulationLab: Netzplantechnik', () => {
  it('ermittelt Projektdauer und kritischen Pfad A-B-C-E-G', () => {
    render(<WisoKalkulationLab />);
    openTab(/Netzplantechnik/);
    expect(screen.getByText('21 Tage')).toBeTruthy();
    const kritisch = screen.getAllByText('JA (Kritisch)').map((el) => el.closest('tr').firstChild.textContent);
    expect(kritisch).toEqual(['A', 'B', 'C', 'E', 'G']);
  });

  it('weist Vorgang D Gesamtpuffer 2 und freien Puffer 1 zu', () => {
    render(<WisoKalkulationLab />);
    openTab(/Netzplantechnik/);
    const zeileD = screen.getByText('UI/UX Prototyping').closest('tr');
    const zellen = [...zeileD.children].map((td) => td.textContent);
    // Vorgang, Name, Dauer, Vorgänger, FAZ, FEZ, SAZ, SEZ, GP, FP
    expect(zellen.slice(4, 10)).toEqual(['8', '11', '10', '13', '2', '1']);
  });
});

describe('WisoKalkulationLab: XP', () => {
  it('vergibt die Header-XP nur einmal', () => {
    render(<WisoKalkulationLab />);
    const button = screen.getByRole('button', { name: 'WISO XP sichern' });
    fireEvent.click(button);
    fireEvent.click(screen.getByRole('button', { name: 'XP gesichert!' }));
    expect(awardXP).toHaveBeenCalledTimes(1);
    expect(awardXP).toHaveBeenCalledWith(30, 'wiso_master');
  });

  it('vergibt XP nur für richtige Quiz-Antworten und sperrt beantwortete Fragen', () => {
    render(<WisoKalkulationLab />);
    openTab(/WISO-Arbeitsrecht/);
    // Richtig: JAV vertritt die Auszubildenden
    fireEvent.click(screen.getByRole('button', { name: /Jugend- und Auszubildendenvertretung/ }));
    expect(awardXP).toHaveBeenCalledWith(25, 'wiso_master');
    // Falsch: höchstes Budgetrisiko ist nicht der kritische Pfad
    const falsch = screen.getByRole('button', { name: /höchsten finanziellen Budgetrisiko/ });
    fireEvent.click(falsch);
    expect(awardXP).toHaveBeenCalledTimes(1);
    expect(falsch.disabled).toBe(true);
    expect(screen.getAllByText('Erklärung:')).toHaveLength(2);
  });
});
