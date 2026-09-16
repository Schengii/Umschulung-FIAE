import { describe, it, expect } from 'vitest';
import { calculateTcoAndRoi } from './tcoCalculations';

describe('tcoCalculations', () => {
  it('berechnet kumulierte TCO-Kosten über 5 Jahre korrekt', () => {
    const result = calculateTcoAndRoi({
      years: 5,
      onPremHardwareCapex: 20000,
      onPremAnnualPowerCooling: 2000,
      onPremAnnualLicensesMaintenance: 3000,
      onPremAdminHoursPerYear: 100,
      onPremAdminHourlyRate: 80, // 8000 €
      // onPrem Annual Opex = 2000 + 3000 + 8000 = 13000 € / Jahr
      // 5 Jahre onPrem = 20000 + 5 * 13000 = 85000 €

      cloudOneTimeMigrationCost: 5000,
      cloudMonthlyHosting: 500, // 6000 € / Jahr
      cloudAdminHoursPerYear: 30,
      cloudAdminHourlyRate: 80 // 2400 € / Jahr
      // cloud Annual Opex = 6000 + 2400 = 8400 € / Jahr
      // 5 Jahre Cloud = 5000 + 5 * 8400 = 47000 €
    });

    expect(result.finalOnPremTco).toBe(85000);
    expect(result.finalCloudTco).toBe(47000);
    expect(result.totalSavings).toBe(38000);
    expect(result.roiPercentage).toBe(760); // (38000 / 5000) * 100
    expect(result.yearlyData.length).toBe(5);
  });

  it('ermittelt den korrekten Break-Even-Monat (Amortisation)', () => {
    const res = calculateTcoAndRoi({
      years: 3,
      onPremHardwareCapex: 10000,
      onPremAnnualPowerCooling: 1200,
      onPremAnnualLicensesMaintenance: 1200,
      onPremAdminHoursPerYear: 50,
      onPremAdminHourlyRate: 80, // 4000 € -> OnPrem Opex = 6400 €/a = 533.33 €/m

      cloudOneTimeMigrationCost: 2000,
      cloudMonthlyHosting: 200,
      cloudAdminHoursPerYear: 10,
      cloudAdminHourlyRate: 80 // 800 € -> Cloud Opex = 3200 €/a = 266.66 €/m
    });

    expect(res.breakEvenMonth).toBe(1); // Da Cloud-Start (2000) < OnPrem-Start (10000)
  });
});
