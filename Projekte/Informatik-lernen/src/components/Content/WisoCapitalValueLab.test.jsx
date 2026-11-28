// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import WisoCapitalValueLab from './WisoCapitalValueLab';
import { calculateNetPresentValue } from '../../utils/wisoCapitalValueEngine';

afterEach(cleanup);

const text = (c) => c.textContent.replace(/\s+/g, ' ');
const npv = (o) => calculateNetPresentValue({
  anschaffungsauszahlung: o.invest, kalkulationszinssatzPercent: o.rate,
  cashflows: o.cf, liquidationserloes: o.salvage
});
const base = { invest: 85000, rate: 7.5, cf: [30000, 35000, 38000, 25000], salvage: 8000 };
const fmt = (n) => n.toLocaleString('de-DE');

describe('WisoCapitalValueLab', () => {
  it('zeigt Kapitalwert und Vorteilhaftigkeit der Standardwerte passend zur Engine', () => {
    const { container } = render(<WisoCapitalValueLab />);
    const r = npv(base);
    const t = text(container);
    expect(t).toContain(`${r.kapitalwert >= 0 ? '+' : ''}${fmt(r.kapitalwert)} €`);
    expect(t).toContain(r.isProfitable ? 'Investition vorteilhaft' : 'Unrentabel');
    expect(t).toContain(`Profitabilitätsindex (PI): ${r.profitabilityIndex}`);
  });

  it('rechnet nach Änderung der Anschaffungsauszahlung (Slider) neu', () => {
    const { container } = render(<WisoCapitalValueLab />);
    const [invest] = screen.getAllByRole('slider');
    fireEvent.change(invest, { target: { value: '150000' } });
    const r = npv({ ...base, invest: 150000 });
    const t = text(container);
    expect(t).toContain(`${r.kapitalwert >= 0 ? '+' : ''}${fmt(r.kapitalwert)} €`);
    expect(t).toContain(r.isProfitable ? 'Investition vorteilhaft' : 'Unrentabel');
  });

  it('lädt das Warn-Szenario mit negativem Kapitalwert', () => {
    const { container } = render(<WisoCapitalValueLab />);
    fireEvent.click(screen.getByRole('button', { name: /Negativer Kapitalwert/ }));
    const r = npv({ invest: 140000, rate: 12, cf: [20000, 25000, 30000, 20000], salvage: 0 });
    expect(r.isProfitable).toBe(false);
    const t = text(container);
    expect(t).toContain('Unrentabel');
    expect(t).toContain(`${fmt(r.kapitalwert)} €`);
  });

  it('wechselt auf die Dokumentations-Vorschau', () => {
    const { container } = render(<WisoCapitalValueLab />);
    const before = text(container);
    fireEvent.click(screen.getByRole('button', { name: /IHK Projektdoku-Vorschau/ }));
    expect(text(container)).not.toBe(before);
  });

  it('vergibt XP über onRewardXP genau einmal', () => {
    const onRewardXP = vi.fn();
    render(<WisoCapitalValueLab onRewardXP={onRewardXP} />);
    fireEvent.click(screen.getByRole('button', { name: /Kosten-Nutzen Validieren/ }));
    fireEvent.click(screen.getByRole('button', { name: /Berechnung Bestätigt/ }));
    expect(onRewardXP).toHaveBeenCalledTimes(1);
    expect(onRewardXP).toHaveBeenCalledWith(60);
  });
});
