// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import WisoPayrollLab from './WisoPayrollLab';
import { useStore } from '../../store/useStore';
import { calculatePayroll } from '../../utils/wisoPayrollEngine';

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

const norm = (t) => t.replace(/\s+/g, ' ');
const eur = (n) => norm(n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }));

describe('WisoPayrollLab', () => {
  it('zeigt Netto und Arbeitgeber-Gesamtaufwand passend zur Engine (Standardwerte)', () => {
    const { container } = render(<WisoPayrollLab />);
    const p = calculatePayroll({ grossSalary: 3800, taxClass: 1, hasChildren: false, churchTax: false, benefitsInKind: 0 });
    expect(norm(container.textContent)).toContain(eur(p.employee.netSalary));
    expect(norm(container.textContent)).toContain(eur(p.employer.totalCost));
  });

  it('rechnet nach Änderung des Bruttogehalts neu', () => {
    const { container } = render(<WisoPayrollLab />);
    const [gross] = screen.getAllByRole('spinbutton');
    fireEvent.change(gross, { target: { value: '5000' } });
    const p = calculatePayroll({ grossSalary: 5000, taxClass: 1, hasChildren: false, churchTax: false, benefitsInKind: 0 });
    expect(norm(container.textContent)).toContain(eur(p.employee.netSalary));
  });

  it('blendet die Kirchensteuer nur bei gesetzter Option ein', () => {
    render(<WisoPayrollLab />);
    expect(screen.queryByText('Kirchensteuer:')).toBeNull();
    fireEvent.click(screen.getByLabelText(/Kirchensteuerpflichtig/));
    expect(screen.getByText('Kirchensteuer:')).toBeTruthy();
  });

  it('vergibt XP genau einmal', () => {
    render(<WisoPayrollLab />);
    const btn = screen.getByRole('button', { name: /60 XP beanspruchen/ });
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(awardXP).toHaveBeenCalledTimes(1);
    expect(awardXP.mock.calls[0][0]).toBe(60);
  });

  it('weist auf die vereinfachte Lohnsteuer hin', () => {
    render(<WisoPayrollLab />);
    expect(screen.getByText(/vereinfachte Näherung/)).toBeTruthy();
  });

  it('beschriftet Beitragssätze und Beitragsbemessungsgrenzen mit den Werten 2026', () => {
    const { container } = render(<WisoPayrollLab />);
    const t = norm(container.textContent);
    expect(t).toContain('Zusatz 1,45%');
    expect(t).toContain('AG-Anteil Pflegeversicherung (1,8%)');
    expect(t).toContain('KV/PV: 5.812,50');
    expect(t).toContain('RV/AV: 8.450');
    expect(t).not.toContain('7.550');
    expect(t).not.toContain('2,2%');
  });
});
