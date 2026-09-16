/**
 * TCO (Total Cost of Ownership) & ROI Calculator
 * Computes multi-year cost comparison between On-Premises and Cloud Infrastructure.
 */

export function calculateTcoAndRoi({
  years = 5,
  // On-Premises
  onPremHardwareCapex = 25000,
  onPremAnnualPowerCooling = 2400,
  onPremAnnualLicensesMaintenance = 3500,
  onPremAdminHoursPerYear = 120,
  onPremAdminHourlyRate = 80,
  // Cloud
  cloudOneTimeMigrationCost = 6000,
  cloudMonthlyHosting = 550,
  cloudAdminHoursPerYear = 40,
  cloudAdminHourlyRate = 80
}) {
  const onPremAnnualAdminCost = onPremAdminHoursPerYear * onPremAdminHourlyRate;
  const onPremAnnualOpex = onPremAnnualPowerCooling + onPremAnnualLicensesMaintenance + onPremAnnualAdminCost;

  const cloudAnnualHosting = cloudMonthlyHosting * 12;
  const cloudAnnualAdminCost = cloudAdminHoursPerYear * cloudAdminHourlyRate;
  const cloudAnnualOpex = cloudAnnualHosting + cloudAnnualAdminCost;

  const yearlyData = [];
  let onPremCumulative = onPremHardwareCapex;
  let cloudCumulative = cloudOneTimeMigrationCost;

  for (let y = 1; y <= years; y++) {
    onPremCumulative += onPremAnnualOpex;
    cloudCumulative += cloudAnnualOpex;

    const diff = Number((onPremCumulative - cloudCumulative).toFixed(2));
    yearlyData.push({
      year: `Jahr ${y}`,
      yearNumber: y,
      onPremCost: Number(onPremCumulative.toFixed(2)),
      cloudCost: Number(cloudCumulative.toFixed(2)),
      costDelta: diff,
      isCloudCheaper: cloudCumulative < onPremCumulative
    });
  }

  const finalOnPremTco = onPremCumulative;
  const finalCloudTco = cloudCumulative;
  const totalSavings = Number((finalOnPremTco - finalCloudTco).toFixed(2));

  // ROI Berechnung
  let roiPercentage = 0;
  if (cloudOneTimeMigrationCost > 0) {
    roiPercentage = Number(((totalSavings / cloudOneTimeMigrationCost) * 100).toFixed(1));
  }

  // Break-Even / Amortisations-Monat ermitteln
  let breakEvenMonth = null;
  const totalMonths = years * 12;
  const onPremMonthlyOpex = onPremAnnualOpex / 12;
  const cloudMonthlyTotalOpex = cloudAnnualOpex / 12;

  let currentOnPrem = onPremHardwareCapex;
  let currentCloud = cloudOneTimeMigrationCost;

  for (let m = 1; m <= totalMonths; m++) {
    currentOnPrem += onPremMonthlyOpex;
    currentCloud += cloudMonthlyTotalOpex;

    if (currentCloud < currentOnPrem && breakEvenMonth === null) {
      breakEvenMonth = m;
      break;
    }
  }

  return {
    yearlyData,
    finalOnPremTco: Number(finalOnPremTco.toFixed(2)),
    finalCloudTco: Number(finalCloudTco.toFixed(2)),
    totalSavings,
    roiPercentage,
    breakEvenMonth,
    onPremAnnualOpex: Number(onPremAnnualOpex.toFixed(2)),
    cloudAnnualOpex: Number(cloudAnnualOpex.toFixed(2))
  };
}
