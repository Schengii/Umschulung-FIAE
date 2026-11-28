// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import WisoLiquiditaetLab from './WisoLiquiditaetLab';
import { useStore } from '../../store/useStore';
import { calculateLiquiditaetAndWorkingCapital } from '../../utils/wisoLiquiditaetEngine';

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
const calc = (p) => calculateLiquiditaetAndWorkingCapital({
  ...p, umlaufvermoegen: p.fluessigeMittel + p.kurzfristigeForderungen + p.vorraete
});
const base = { fluessigeMittel: 50000, kurzfristigeForderungen: 120000, vorraete: 180000, kurzfristigeVerbindlichkeiten: 150000 };

describe('WisoLiquiditaetLab', () => {
  it('zeigt Liquiditätsgrade und Working Capital passend zur Engine', () => {
    const { container } = render(<WisoLiquiditaetLab />);
    const r = calc(base);
    const t = text(container);
    expect(t).toContain(`${r.liquiditaet1}%`);
    expect(t).toContain(`${r.liquiditaet2}%`);
    expect(t).toContain(`${r.liquiditaet3}%`);
    expect(t).toContain(`${r.netWorkingCapital.toLocaleString('de-DE')} €`);
  });

  it('rechnet nach Änderung der Verbindlichkeiten neu', () => {
    const { container } = render(<WisoLiquiditaetLab />);
    const debts = screen.getAllByRole('spinbutton')[3];
    fireEvent.change(debts, { target: { value: '300000' } });
    const r = calc({ ...base, kurzfristigeVerbindlichkeiten: 300000 });
    const t = text(container);
    expect(t).toContain(`${r.liquiditaet1}%`);
    expect(t).toContain(`${r.liquiditaet3}%`);
  });

  it('vergibt XP genau einmal', () => {
    render(<WisoLiquiditaetLab />);
    fireEvent.click(screen.getByRole('button', { name: /60 XP sichern/ }));
    expect(screen.queryByRole('button', { name: /60 XP sichern/ })).toBeNull();
    expect(awardXP).toHaveBeenCalledTimes(1);
    expect(awardXP.mock.calls[0][0]).toBe(60);
  });
});
