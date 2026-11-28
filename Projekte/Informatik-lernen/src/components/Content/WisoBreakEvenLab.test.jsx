// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import WisoBreakEvenLab from './WisoBreakEvenLab';
import { calculateTier2ContributionMargin } from '../../utils/wisoBreakEvenEngine';

afterEach(cleanup);

const text = (c) => c.textContent.replace(/\s+/g, ' ');
const products = [
  { id: 'prod-1', name: 'Dedicated Cloud Server M', price: 180, variableCost: 70, quantity: 450, productFixedCost: 18000, bottleneckTimeMinutes: 20 },
  { id: 'prod-2', name: 'Kubernetes Cluster Managed', price: 320, variableCost: 140, quantity: 250, productFixedCost: 22000, bottleneckTimeMinutes: 45 },
  { id: 'prod-3', name: 'Security Vulnerability Scan Pack', price: 90, variableCost: 20, quantity: 800, productFixedCost: 12000, bottleneckTimeMinutes: 10 }
];

describe('WisoBreakEvenLab', () => {
  it('zeigt Umsatz, DB I, DB II und Betriebsergebnis passend zur Engine', () => {
    const { container } = render(<WisoBreakEvenLab />);
    const r = calculateTier2ContributionMargin(products, 25000);
    const t = text(container);
    [r.totalRevenue, r.totalContributionMargin1, r.totalContributionMargin2, r.operatingResult].forEach((v) => {
      expect(t).toContain(`${v.toLocaleString()} €`);
    });
  });

  it('rechnet das Betriebsergebnis nach Änderung der Unternehmensfixkosten neu', () => {
    const { container } = render(<WisoBreakEvenLab />);
    fireEvent.change(screen.getByLabelText(/Unternehmensfixkosten/), { target: { value: '60000' } });
    const r = calculateTier2ContributionMargin(products, 60000);
    expect(text(container)).toContain(`${r.operatingResult.toLocaleString()} €`);
  });

  it('begrenzt negative Fixkosten auf 0', () => {
    render(<WisoBreakEvenLab />);
    const input = screen.getByLabelText(/Unternehmensfixkosten/);
    fireEvent.change(input, { target: { value: '-500' } });
    expect(Number(input.value)).toBe(0);
  });

  it('vergibt XP über onRewardXP genau einmal', () => {
    const onRewardXP = vi.fn();
    render(<WisoBreakEvenLab onRewardXP={onRewardXP} />);
    fireEvent.click(screen.getByRole('button', { name: /Kalkulation Bestätigen/ }));
    fireEvent.click(screen.getByRole('button', { name: /XP bereits verbucht/ }));
    expect(onRewardXP).toHaveBeenCalledTimes(1);
    expect(onRewardXP).toHaveBeenCalledWith(65);
  });
});
