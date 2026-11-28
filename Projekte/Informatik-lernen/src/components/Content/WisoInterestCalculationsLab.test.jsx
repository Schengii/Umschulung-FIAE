// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import WisoInterestCalculationsLab from './WisoInterestCalculationsLab';
import { calculateSimpleInterest, calculateCompoundInterest } from '../../utils/wisoInterestCalculationsEngine';

afterEach(cleanup);

const text = (c) => c.textContent.replace(/\s+/g, ' ');
const fmt = (n) => n.toLocaleString('de-DE');

describe('WisoInterestCalculationsLab', () => {
  it('zeigt Zinsen und Endkapital der Tageszinsrechnung passend zur Engine', () => {
    const { container } = render(<WisoInterestCalculationsLab />);
    const r = calculateSimpleInterest({ kapital: 50000, zinssatzPercent: 5, tage: 90 });
    const t = text(container);
    expect(t).toContain(`+${fmt(r.zinsen)} €`);
    expect(t).toContain(`${fmt(r.endkapital)} €`);
  });

  it('rechnet nach Änderung der Laufzeit in Tagen neu', () => {
    const { container } = render(<WisoInterestCalculationsLab />);
    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[2], { target: { value: '180' } });
    const r = calculateSimpleInterest({ kapital: 50000, zinssatzPercent: 5, tage: 180 });
    expect(text(container)).toContain(`+${fmt(r.zinsen)} €`);
  });

  it('zeigt im Zinseszins-Modus Aufzinsungsfaktor und Gesamtzinsen', () => {
    const { container } = render(<WisoInterestCalculationsLab />);
    fireEvent.click(screen.getByRole('button', { name: /Zinseszins/ }));
    const r = calculateCompoundInterest({ anfangskapital: 50000, zinssatzPercent: 5, jahre: 5 });
    const t = text(container);
    expect(t).toContain(String(r.aufzinsungsfaktor));
    expect(t).toContain(`${fmt(r.gesamtzinsen)} €`);
  });

  it('vergibt XP über onRewardXP genau einmal', () => {
    const onRewardXP = vi.fn();
    render(<WisoInterestCalculationsLab onRewardXP={onRewardXP} />);
    const btn = screen.getByRole('button', { name: /Zinsberechnung Bestätigen/ });
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(onRewardXP).toHaveBeenCalledTimes(1);
    expect(onRewardXP).toHaveBeenCalledWith(45);
  });
});
