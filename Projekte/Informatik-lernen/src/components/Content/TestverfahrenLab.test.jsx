// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import TestverfahrenLab from './TestverfahrenLab';
import { TESTVERFAHREN_DRILL_QUESTIONS } from '../../utils/testverfahrenEngine';

afterEach(() => cleanup());

const openTab = (name) => fireEvent.click(screen.getByRole('button', { name }));
const testwertFeld = () => screen.getByRole('textbox');
const zugeordneteKlasse = () => screen.getByText('Zugeordnete Äquivalenzklasse:').parentElement.textContent;

// Je Frage gibt es 4 Optionen "A) ".."D) " in Dokumentreihenfolge.
const beantworteDrill = (indizes) => {
  const optionen = screen.getAllByRole('button').filter((b) => /^[A-D]\) /.test(b.textContent));
  indizes.forEach((optIdx, frageIdx) => fireEvent.click(optionen[frageIdx * 4 + optIdx]));
};
const RICHTIG = TESTVERFAHREN_DRILL_QUESTIONS.map((q) => q.korrektIndex);
const FALSCH = RICHTIG.map((i) => (i + 1) % 4);

describe('TestverfahrenLab: Black-Box-Live-Tester', () => {
  it.each([
    ['25', /GÄK-1 \(Im gültigen Wertebereich 18\.\.67\)/, true],
    ['18', /GÄK-1/, true],
    ['67', /GÄK-1/, true],
    ['17', /UÄK-1 \(Unterhalb Minimum 18\)/, false],
    ['68', /UÄK-2 \(Oberhalb Maximum 67\)/, false],
    ['abc', /UÄK-3 \(Nicht-numerischer Wert/, false],
    ['   ', /UÄK-3/, false]
  ])('ordnet den Testwert %j der richtigen Äquivalenzklasse zu', (wert, klasse, gueltig) => {
    render(<TestverfahrenLab onRewardXP={() => {}} />);
    fireEvent.change(testwertFeld(), { target: { value: wert } });
    expect(zugeordneteKlasse()).toMatch(klasse);
    expect(screen.getByText(gueltig ? /Gültig \(Akzeptiert\)/ : /Ungültig \(Abgewiesen/)).toBeTruthy();
  });

  it('zeigt Äquivalenzklassen und die 6-Punkte-Grenzwerte für 18..67', () => {
    render(<TestverfahrenLab onRewardXP={() => {}} />);
    ['UÄK-1', 'GÄK-1', 'UÄK-2', 'UÄK-3'].forEach((id) => expect(screen.getByText(id)).toBeTruthy());
    ['17', '18', '19', '66', '67', '68'].forEach((wert) => expect(screen.getByText(wert)).toBeTruthy());
  });

  it('übernimmt beim Szenario-Wechsel Grenzen, Grenzwerte und einen gültigen Mittelwert', () => {
    render(<TestverfahrenLab onRewardXP={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Passwortlänge (8..32)' }));
    expect(testwertFeld().value).toBe('20');
    expect(zugeordneteKlasse()).toMatch(/GÄK-1 \(Im gültigen Wertebereich 8\.\.32\)/);
    ['7', '8', '9', '31', '32', '33'].forEach((wert) => expect(screen.getByText(wert)).toBeTruthy());
    expect(screen.queryByText('68')).toBeNull();
  });
});

describe('TestverfahrenLab: White-Box-Metriken', () => {
  it('berechnet M = E − N + 2P und die Risikoklasse', () => {
    render(<TestverfahrenLab onRewardXP={() => {}} />);
    openTab(/McCabe & Überdeckungsmetriken/);
    // 11 − 8 + 2·1 = 5
    expect(screen.getByText('M = 5')).toBeTruthy();
    expect(screen.getByText('Risiko: NIEDRIG')).toBeTruthy();

    const [kanten] = screen.getAllByRole('slider');
    fireEvent.change(kanten, { target: { value: '25' } });
    // 25 − 8 + 2 = 19
    expect(screen.getByText('M = 19')).toBeTruthy();
    expect(screen.getByText('Risiko: MITTEL')).toBeTruthy();
  });

  it('zeigt C0/C1/C2 und aktualisiert die Zweigüberdeckung', () => {
    render(<TestverfahrenLab onRewardXP={() => {}} />);
    openTab(/McCabe & Überdeckungsmetriken/);
    expect(screen.getByText('100%')).toBeTruthy();
    expect(screen.getByText('75%')).toBeTruthy();
    expect(screen.getByText('25%')).toBeTruthy();

    const zweige = screen.getAllByRole('slider')[3];
    fireEvent.change(zweige, { target: { value: '8' } });
    expect(screen.queryByText('75%')).toBeNull();
    expect(screen.getAllByText('100%')).toHaveLength(2);
  });
});

describe('TestverfahrenLab: Prüfungs-Drill', () => {
  it('vergibt bei bestandenem Drill genau einmal 55 XP', () => {
    const onRewardXP = vi.fn();
    render(<TestverfahrenLab onRewardXP={onRewardXP} />);
    openTab(/Prüfungs-Drill/);
    const pruefen = screen.getByRole('button', { name: /Antworten prüfen/ });
    expect(pruefen.disabled).toBe(true);

    beantworteDrill(RICHTIG);
    fireEvent.click(pruefen);
    expect(onRewardXP).toHaveBeenCalledTimes(1);
    expect(onRewardXP.mock.calls[0][0]).toBe(55);
    expect(screen.getByText(/\+55 XP Erhalten!/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Drill wiederholen/ }));
    beantworteDrill(RICHTIG);
    fireEvent.click(screen.getByRole('button', { name: /Antworten prüfen/ }));
    expect(onRewardXP).toHaveBeenCalledTimes(1);
  });

  it('besteht mit 3 von 4 richtigen Antworten, aber nicht mit 2', () => {
    const onRewardXP = vi.fn();
    render(<TestverfahrenLab onRewardXP={onRewardXP} />);
    openTab(/Prüfungs-Drill/);
    beantworteDrill([FALSCH[0], FALSCH[1], RICHTIG[2], RICHTIG[3]]);
    fireEvent.click(screen.getByRole('button', { name: /Antworten prüfen/ }));
    expect(onRewardXP).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Drill wiederholen/ }));
    beantworteDrill([FALSCH[0], RICHTIG[1], RICHTIG[2], RICHTIG[3]]);
    fireEvent.click(screen.getByRole('button', { name: /Antworten prüfen/ }));
    expect(onRewardXP).toHaveBeenCalledTimes(1);
  });

  it('sperrt die Auswahl nach dem Prüfen', () => {
    render(<TestverfahrenLab onRewardXP={() => {}} />);
    openTab(/Prüfungs-Drill/);
    beantworteDrill(FALSCH);
    fireEvent.click(screen.getByRole('button', { name: /Antworten prüfen/ }));
    beantworteDrill(RICHTIG);
    expect(screen.getAllByText('✗ Lösung & Erklärung:')).toHaveLength(4);
  });
});
