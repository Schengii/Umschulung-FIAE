import { describe, it, expect } from 'vitest';
import { calculatePayroll } from './wisoPayrollEngine';

describe('wisoPayrollEngine', () => {
  it('berechnet Netto und Sozialabgaben für Standardgehalt (3500€)', () => {
    const res = calculatePayroll({
      grossSalary: 3500,
      taxClass: 1,
      hasChildren: false,
      churchTax: false
    });

    expect(res.netSalary).toBeUndefined(); // Netto befindet sich in res.employee.netSalary
    expect(res.employee.netSalary).toBeGreaterThan(2000);
    expect(res.employee.netSalary).toBeLessThan(3500);
    expect(res.employee.totalSocial).toBeGreaterThan(600);
    expect(res.employer.totalCost).toBeGreaterThan(3500);
  });

  it('berücksichtigt Kinderlosenzuschlag in der Pflegeversicherung', () => {
    const withChild = calculatePayroll({ grossSalary: 3000, hasChildren: true });
    const withoutChild = calculatePayroll({ grossSalary: 3000, hasChildren: false });

    expect(withoutChild.employee.care).toBeGreaterThan(withChild.employee.care);
  });

  it('begrenzt Beiträge an den Beitragsbemessungsgrenzen (BBG)', () => {
    const normal = calculatePayroll({ grossSalary: 5000 });
    const highCap = calculatePayroll({ grossSalary: 12000 });

    // KV / PV ist bei 5175€ gedeckelt
    expect(highCap.employee.health).toBeCloseTo(normal.employee.health, -2);
    expect(highCap.employer.totalCost).toBeGreaterThan(12000);
  });
});
