// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import WisoAngebotsvergleichLab from './WisoAngebotsvergleichLab';

afterEach(() => cleanup());

const openTab = (name) => fireEvent.click(screen.getByRole('button', { name }));

// Drill-Optionen sind mit "A) ", "B) " ... beschriftet; je Frage eine Option wählen.
const answerAllDrillQuestions = (letter) => {
  const options = screen.getAllByRole('button').filter((b) => b.textContent.startsWith(`${letter}) `));
  options.forEach((btn) => fireEvent.click(btn));
};

describe('WisoAngebotsvergleichLab: Skonto vs. Kontokorrentkredit', () => {
  it('zeigt für die Standardwerte den IHK-Effektivzins und den Netto-Vorteil', () => {
    render(<WisoAngebotsvergleichLab onRewardXP={() => {}} />);
    // p_eff = 3 % × 360 / (30 − 10) = 54 %
    expect(screen.getByText(/^54\.00%/)).toBeTruthy();
    expect(screen.getByText('20 Tage')).toBeTruthy();
    expect(screen.getByText('300.00 €')).toBeTruthy();
    // 9.700 € × 11,5 % × 20 / 360 = 61,97 €
    expect(screen.getByText('61.97 €')).toBeTruthy();
    expect(screen.getByText('+238.03 €')).toBeTruthy();
    expect(screen.getByText(/lohnt sich: Der effektive Lieferantenzins/)).toBeTruthy();
  });

  it('kippt die Empfehlung, wenn der Bankzins den Skontozins übersteigt', () => {
    render(<WisoAngebotsvergleichLab onRewardXP={() => {}} />);
    const [, skonto, bankzins, , ziel] = screen.getAllByRole('slider');
    fireEvent.change(skonto, { target: { value: '1' } });
    fireEvent.change(bankzins, { target: { value: '18' } });
    fireEvent.change(ziel, { target: { value: '90' } });
    // p_eff = 1 % × 360 / 80 = 4,5 % < 18 %
    expect(screen.getByText(/^4\.50%/)).toBeTruthy();
    expect(screen.getByText('-296.00 €')).toBeTruthy();
    expect(screen.getByText(/lohnt sich nicht/)).toBeTruthy();
  });
});

describe('WisoAngebotsvergleichLab: Quantitativer Vergleich', () => {
  it('rechnet das Kalkulationsschema bis zum Bezugspreis und kürt den günstigeren Anbieter', () => {
    render(<WisoAngebotsvergleichLab onRewardXP={() => {}} />);
    openTab(/Quantitativer Vergleich/);
    // A: 12.000 − 10 % = 10.800 − 2 % = 10.584 + 250 = 10.834
    expect(screen.getByText('10834.00 €')).toBeTruthy();
    // B: 11.500 − 5 % = 10.925 − 3 % = 10.597,25 + 120 = 10.717,25
    expect(screen.getByText('10717.25 €')).toBeTruthy();
    expect(screen.getByText('116.75 €')).toBeTruthy();
    expect(screen.getAllByText('ByteDirect AG').length).toBeGreaterThan(1);
  });

  it('aktualisiert den Sieger, wenn sich ein Listenpreis ändert', () => {
    render(<WisoAngebotsvergleichLab onRewardXP={() => {}} />);
    openTab(/Quantitativer Vergleich/);
    // Reihenfolge je Anbieter: Listenpreis, Rabatt, Skonto, Bezugskosten
    const listenpreisB = screen.getAllByRole('spinbutton')[4];
    fireEvent.change(listenpreisB, { target: { value: '13000' } });
    // B: 13.000 × 0,95 × 0,97 + 120 = 12.099,50 → A ist jetzt günstiger
    expect(screen.getByText('12099.50 €')).toBeTruthy();
    expect(screen.getByText('1265.50 €')).toBeTruthy();
    expect(screen.getByText('Quantitativer Gesamtsieger:').parentElement.textContent).toContain('TechSource GmbH');
  });
});

describe('WisoAngebotsvergleichLab: Qualitativer Vergleich', () => {
  it('berechnet die gewichteten Nutzwerte und die Rangfolge', () => {
    render(<WisoAngebotsvergleichLab onRewardXP={() => {}} />);
    openTab(/Qualitativer Vergleich/);
    // TechSource: 9·0,35 + 8·0,30 + 7·0,20 + 8·0,15 = 8,15
    expect(screen.getByText('8.15')).toBeTruthy();
    expect(screen.getByText('7.85')).toBeTruthy();
    expect(screen.getByText('Rang 1').parentElement.textContent).toContain('TechSource GmbH');
  });

  it('begrenzt Punktwerte auf 1 bis 10', () => {
    render(<WisoAngebotsvergleichLab onRewardXP={() => {}} />);
    openTab(/Qualitativer Vergleich/);
    const ersterWert = screen.getAllByRole('spinbutton')[0];
    fireEvent.change(ersterWert, { target: { value: '42' } });
    expect(ersterWert.value).toBe('10');
    fireEvent.change(ersterWert, { target: { value: '-3' } });
    expect(ersterWert.value).toBe('1');
  });
});

describe('WisoAngebotsvergleichLab: Prüfungs-Drill', () => {
  it('erlaubt das Prüfen erst, wenn alle Fragen beantwortet sind', () => {
    render(<WisoAngebotsvergleichLab onRewardXP={() => {}} />);
    openTab(/Prüfungs-Drill/);
    const pruefen = screen.getByRole('button', { name: /Antworten prüfen/ });
    expect(pruefen.disabled).toBe(true);
    answerAllDrillQuestions('B');
    expect(pruefen.disabled).toBe(false);
  });

  it('vergibt bei richtigen Antworten genau einmal 55 XP', () => {
    const onRewardXP = vi.fn();
    render(<WisoAngebotsvergleichLab onRewardXP={onRewardXP} />);
    openTab(/Prüfungs-Drill/);
    answerAllDrillQuestions('B');
    fireEvent.click(screen.getByRole('button', { name: /Antworten prüfen/ }));
    expect(onRewardXP).toHaveBeenCalledTimes(1);
    expect(onRewardXP.mock.calls[0][0]).toBe(55);
    expect(screen.getAllByText('✓ Richtig!')).toHaveLength(4);

    // Wiederholen und erneut bestehen darf keine XP doppelt vergeben
    fireEvent.click(screen.getByRole('button', { name: /Drill wiederholen/ }));
    answerAllDrillQuestions('B');
    fireEvent.click(screen.getByRole('button', { name: /Antworten prüfen/ }));
    expect(onRewardXP).toHaveBeenCalledTimes(1);
  });

  it('vergibt bei falschen Antworten keine XP und zeigt die Lösungen', () => {
    const onRewardXP = vi.fn();
    render(<WisoAngebotsvergleichLab onRewardXP={onRewardXP} />);
    openTab(/Prüfungs-Drill/);
    answerAllDrillQuestions('A');
    fireEvent.click(screen.getByRole('button', { name: /Antworten prüfen/ }));
    expect(onRewardXP).not.toHaveBeenCalled();
    expect(screen.getAllByText('✗ Lösung & Erklärung:')).toHaveLength(4);
  });
});
