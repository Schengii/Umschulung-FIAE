// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import WisoZuschlagskalkulationLab from './WisoZuschlagskalkulationLab';
import { useStore } from '../../store/useStore';
import { calculateZuschlagskalkulation } from '../../utils/wisoZuschlagskalkulationEngine';

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

const text = (c) => c.textContent.replace(/\s+/g, ' ');
const defaults = {
  fertigungsmaterial: 6000, materialgemeinkostensatzProzent: 10, fertigungslohn: 4000,
  fertigungsgemeinkostensatzProzent: 125, sondereinzelkostenFertigung: 300,
  verwaltungsgemeinkostensatzProzent: 8, vertriebsgemeinkostensatzProzent: 6,
  sondereinzelkostenVertrieb: 200, gewinnzuschlagProzent: 15, kundenskontoProzent: 2,
  kundenrabattProzent: 5, umsatzsteuerProzent: 19
};

describe('WisoZuschlagskalkulationLab', () => {
  it('zeigt Herstellkosten, Selbstkosten und Barverkaufspreis passend zur Engine', () => {
    const { container } = render(<WisoZuschlagskalkulationLab />);
    const c = calculateZuschlagskalkulation(defaults);
    const t = text(container);
    [c.herstellkosten, c.selbstkosten, c.barverkaufspreis].forEach((v) => {
      expect(t).toContain(`${v.toFixed(2)} €`);
    });
  });

  it('rechnet nach Änderung des Fertigungsmaterials neu', () => {
    const { container } = render(<WisoZuschlagskalkulationLab />);
    const [material] = screen.getAllByRole('spinbutton');
    fireEvent.change(material, { target: { value: '8000' } });
    const c = calculateZuschlagskalkulation({ ...defaults, fertigungsmaterial: 8000 });
    expect(text(container)).toContain(`${c.selbstkosten.toFixed(2)} €`);
  });

  it('vergibt XP bei der ersten Eingabe und danach nicht erneut', () => {
    render(<WisoZuschlagskalkulationLab />);
    const [material] = screen.getAllByRole('spinbutton');
    fireEvent.change(material, { target: { value: '7000' } });
    fireEvent.change(material, { target: { value: '7500' } });
    expect(awardXP).toHaveBeenCalledTimes(1);
    expect(awardXP.mock.calls[0][0]).toBe(60);
  });
});
