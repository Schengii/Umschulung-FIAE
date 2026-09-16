/**
 * IHK Wirtschaftlichkeits-, Amortisations- & Make-or-Buy Engine (AP2 Dokumentation)
 * Liefert vorschriftsmäßige kaufmännische Berechnungen für IT-Abschlussprojekte:
 * - Statische & dynamische Amortisationsdauer (Pay-Off-Methode)
 * - Make-or-Buy-Entscheidungsmatrix (Eigenentwicklung vs. Kauf/SaaS)
 * - 3- bis 5-Jahres Kostenvergleichsanalyse (Altsystem vs. Neusystem)
 * - Return on Investment (ROI) & Kapitalwertansatz
 */

/**
 * Berechnet die Amortisationsdauer und den Return on Investment (ROI)
 */
export function calculateAmortisation({
  initialInvestment = 8000,
  yearlyCostSavings = 3600,
  additionalYearlyRunningCosts = 600,
  analysisPeriodYears = 4
}) {
  const netYearlySavings = Math.max(0, yearlyCostSavings - additionalYearlyRunningCosts);
  const amortisationYears = netYearlySavings > 0 
    ? Number((initialInvestment / netYearlySavings).toFixed(2))
    : Infinity;
  const amortisationMonths = Number.isFinite(amortisationYears)
    ? Math.round(amortisationYears * 12)
    : null;

  const totalNetGain = (netYearlySavings * analysisPeriodYears) - initialInvestment;
  const roiPercent = initialInvestment > 0
    ? Number(((totalNetGain / initialInvestment) * 100).toFixed(1))
    : 0;

  const isViable = amortisationMonths !== null && amortisationMonths <= (analysisPeriodYears * 12);

  return {
    initialInvestment,
    yearlyCostSavings,
    additionalYearlyRunningCosts,
    netYearlySavings,
    amortisationYears,
    amortisationMonths,
    analysisPeriodYears,
    totalNetGain,
    roiPercent,
    isViable
  };
}

/**
 * Berechnet den Make-or-Buy-Kostenvergleich
 */
export function calculateMakeOrBuy({
  developmentHours = 80,
  hourlyRateInternal = 65,
  hardwareSoftwareOnce = 1200,
  yearlyMaintenanceInternal = 800,
  saasSetupCost = 1500,
  yearlySaasLicense = 2400,
  periodYears = 3
}) {
  const makeInitial = (developmentHours * hourlyRateInternal) + hardwareSoftwareOnce;
  const makeTotal = makeInitial + (yearlyMaintenanceInternal * periodYears);

  const buyInitial = saasSetupCost;
  const buyTotal = buyInitial + (yearlySaasLicense * periodYears);

  const difference = Math.abs(makeTotal - buyTotal);
  const recommendation = makeTotal < buyTotal ? 'Make' : 'Buy';

  // Break-Even-Zeitpunkt berechnen (wo Make die höheren Initialkosten durch geringere laufende Kosten amortisiert)
  const yearlyDiff = yearlySaasLicense - yearlyMaintenanceInternal;
  const initialDiff = makeInitial - buyInitial;

  let breakEvenYears = null;
  if (yearlyDiff > 0 && initialDiff > 0) {
    breakEvenYears = Number((initialDiff / yearlyDiff).toFixed(2));
  }

  return {
    make: {
      initial: makeInitial,
      yearlyMaintenance: yearlyMaintenanceInternal,
      totalCost: makeTotal
    },
    buy: {
      initial: buyInitial,
      yearlyLicense: yearlySaasLicense,
      totalCost: buyTotal
    },
    periodYears,
    difference,
    recommendation,
    breakEvenYears
  };
}

/**
 * 3- bis 5-Jahres Kostenvergleichsanalyse (Altsystem vs. Neusystem)
 */
export function calculateCostComparison({
  oldSystem = { personnelYearly: 12000, licenseYearly: 2400, hostingYearly: 1200 },
  newSystem = { investmentOnce: 8500, personnelYearly: 4000, licenseYearly: 800, hostingYearly: 600 },
  years = 4
}) {
  const oldYearlySum = (oldSystem.personnelYearly || 0) + (oldSystem.licenseYearly || 0) + (oldSystem.hostingYearly || 0);
  const newYearlySum = (newSystem.personnelYearly || 0) + (newSystem.licenseYearly || 0) + (newSystem.hostingYearly || 0);

  const yearlyBreakdown = [];
  let cumulativeOld = 0;
  let cumulativeNew = newSystem.investmentOnce || 0;
  let breakEvenYear = null;

  for (let year = 1; year <= years; year++) {
    cumulativeOld += oldYearlySum;
    cumulativeNew += newYearlySum;

    if (breakEvenYear === null && cumulativeNew < cumulativeOld) {
      breakEvenYear = year;
    }

    yearlyBreakdown.push({
      year,
      oldCostYear: oldYearlySum,
      cumulativeOld,
      newCostYear: newYearlySum,
      cumulativeNew,
      cumulativeDifference: cumulativeOld - cumulativeNew
    });
  }

  const totalSavings = cumulativeOld - cumulativeNew;

  return {
    years,
    oldYearlySum,
    newYearlySum,
    yearlySavings: oldYearlySum - newYearlySum,
    yearlyBreakdown,
    breakEvenYear,
    totalSavings,
    isCostEffective: totalSavings > 0
  };
}

/**
 * Erzeugt einen Markdown-Abschnitt für die IHK Projektdokumentation
 */
export function exportWirtschaftlichkeitMarkdown(amortisationData, makeOrBuyData, costComparisonData, projectName = 'IHK-Projekt') {
  let md = `## Wirtschaftlichkeitsanalyse für ${projectName}\n\n`;

  md += `### 1. Make-or-Buy-Analyse (Eigenentwicklung vs. Fremdbeschaffung)\n\n`;
  md += `| Kriterium | Option A: Eigenentwicklung (Make) | Option B: Fremdbezug (Buy / SaaS) |\n`;
  md += `| :--- | :---: | :---: |\n`;
  md += `| **Einmalige Einführungskosten** | ${makeOrBuyData.make.initial.toLocaleString('de-DE')} € | ${makeOrBuyData.buy.initial.toLocaleString('de-DE')} € |\n`;
  md += `| **Laufende Kosten (jährlich)** | ${makeOrBuyData.make.yearlyMaintenance.toLocaleString('de-DE')} € | ${makeOrBuyData.buy.yearlyLicense.toLocaleString('de-DE')} € |\n`;
  md += `| **Gesamtkosten über ${makeOrBuyData.periodYears} Jahre** | **${makeOrBuyData.make.totalCost.toLocaleString('de-DE')} €** | **${makeOrBuyData.buy.totalCost.toLocaleString('de-DE')} €** |\n\n`;
  md += `**Entscheidung:** Aus wirtschaftlicher Sicht wird **Option ${makeOrBuyData.recommendation}** empfohlen (Ersparnis: ${makeOrBuyData.difference.toLocaleString('de-DE')} €).\n\n`;

  md += `### 2. Kostenvergleichsanalyse (Altsystem vs. Neusystem)\n\n`;
  md += `| Jahr | Altsystem (kumuliert) | Neusystem (inkl. Investition) | Netto-Vorteil Neusystem |\n`;
  md += `| :---: | :---: | :---: | :---: |\n`;

  costComparisonData.yearlyBreakdown.forEach(row => {
    md += `| Jahr ${row.year} | ${row.cumulativeOld.toLocaleString('de-DE')} € | ${row.cumulativeNew.toLocaleString('de-DE')} € | ${row.cumulativeDifference.toLocaleString('de-DE')} € |\n`;
  });

  md += `\n**Gesamteinsparung über ${costComparisonData.years} Jahre:** ${costComparisonData.totalSavings.toLocaleString('de-DE')} €\n\n`;

  md += `### 3. Amortisationsdauer (Pay-Off-Rechnung)\n\n`;
  md += `- **Investitionsvolumen:** ${amortisationData.initialInvestment.toLocaleString('de-DE')} €\n`;
  md += `- **Netto-Kosteneinsparung pro Jahr:** ${amortisationData.netYearlySavings.toLocaleString('de-DE')} €\n`;
  md += `- **Amortisationszeitpunkt:** **ca. ${amortisationData.amortisationMonths} Monate** (${amortisationData.amortisationYears} Jahre)\n`;
  md += `- **Return on Investment (ROI):** **${amortisationData.roiPercent}%**\n\n`;

  return md;
}
