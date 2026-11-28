// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import WisoFinancingLab from './WisoFinancingLab';
import { calculateFinancingComparison } from '../../utils/wisoFinancingEngine';

afterEach(cleanup);

const text = (c) => c.textContent.replace(/\s+/g, ' ');
const base = {
  investmentAmount: 15000, usefulLifeYears: 3, skontoPercent: 2, creditInterestRatePercent: 5.5,
  monthlyLeasingRate: 480, corporateTaxRatePercent: 30
};

describe('WisoFinancingLab', () => {
  it('zeigt alle drei Finanzierungsoptionen und die Empfehlung passend zur Engine', () => {
    const { container } = render(<WisoFinancingLab />);
    const r = calculateFinancingComparison(base);
    const t = text(container);
    expect(r.options).toHaveLength(3);
    r.options.forEach((o) => {
      expect(t).toContain(o.title);
      expect(t).toContain(`${o.totalCashOutflow.toLocaleString('de-DE')} €`);
    });
    expect(t).toContain(r.recommendation.replace(/\s+/g, ' '));
  });

  it('rechnet nach Änderung der Investitionssumme neu', () => {
    const { container } = render(<WisoFinancingLab />);
    fireEvent.change(screen.getByLabelText(/Netto-Investition/), { target: { value: '30000' } });
    const r = calculateFinancingComparison({ ...base, investmentAmount: 30000 });
    const t = text(container);
    expect(t).toContain(r.recommendation.replace(/\s+/g, ' '));
    r.options.forEach((o) => expect(t).toContain(`${o.totalCashOutflow.toLocaleString('de-DE')} €`));
  });

  it('rechnet nach Änderung der Leasingrate neu', () => {
    const { container } = render(<WisoFinancingLab />);
    fireEvent.change(screen.getByLabelText(/Leasingrate/), { target: { value: '900' } });
    const r = calculateFinancingComparison({ ...base, monthlyLeasingRate: 900 });
    expect(text(container)).toContain(r.recommendation.replace(/\s+/g, ' '));
  });

  it('vergibt XP über onAwardXP genau einmal', () => {
    const onAwardXP = vi.fn();
    render(<WisoFinancingLab onAwardXP={onAwardXP} />);
    const btn = screen.getByRole('button', { name: /Finanzierungs-XP einlösen/ });
    fireEvent.click(btn);
    expect(onAwardXP).toHaveBeenCalledTimes(1);
    expect(onAwardXP.mock.calls[0][0]).toBe(60);
    expect(screen.getByRole('button', { name: /Finanzanalyse gemeistert/ }).disabled).toBe(true);
  });
});
