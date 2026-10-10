// @ts-check
/**
 * WISO Brutto-Netto & Lohnabrechnungs-Engine (IHK AP1 & AP2 Wirtschafts- und Sozialkunde)
 * Berechnet Arbeitnehmer-Abzüge (Lohnsteuer, Soli, KV, PV mit Kinderlosenzuschlag, RV, AV),
 * Nettoauszahlung und die tatsächliche Gesamtkostenbelastung des Arbeitgebers (AG-Brutto inkl. Umlagen).
 */

/**
 * Beitragssätze der Sozialversicherung (Standard-Werte nach IHK-Rahmenlehrplan)
 */
export const SOCIAL_RATES = {
  HEALTH: { employee: 0.073, employer: 0.073, additionalAvg: 0.017 }, // 14,6% + 1,7% Zusatzbeitrag (je 50%)
  PENSION: { employee: 0.093, employer: 0.093 }, // 18,6% geteilt durch 2
  UNEMPLOYMENT: { employee: 0.013, employer: 0.013 }, // 2,6% geteilt durch 2
  CARE_BASE: { employee: 0.022, employer: 0.022 }, // Pflegeversicherung Basis 4,0% geteilt durch 2
  CARE_CHILDLESS_SURCHARGE: 0.006 // +0,6% für Kinderlose ab 23 Jahren
};

/**
 * Beitragsbemessungsgrenzen (BBG) Monatsbasis
 */
export const CONTRIBUTION_CEILINGS = {
  HEALTH_CARE_MONTHLY: 5175.0,  // KV / PV BBG
  PENSION_UNEMP_MONTHLY: 7550.0 // RV / AV BBG (West)
};

/**
 * Berechnet Lohnabrechnung für Arbeitnehmer und Arbeitgeber
 * @param {Object} input
 * @param {number} input.grossSalary - Monatliches Bruttogehalt in Euro
 * @param {number} input.taxClass - Steuerklasse (1 bis 6)
 * @param {boolean} input.hasChildren - Hat Kinder (relevant für PV-Zuschlag)
 * @param {boolean} input.churchTax - Kirchensteuerpflichtig (8% bzw. 9%)
 * @param {number} [input.churchTaxRate=0.09] - 0.08 für Bayern/BaWü, sonst 0.09
 * @param {number} [input.benefitsInKind=0] - Geldwerter Vorteil (z. B. Dienstwagen)
 */
export function calculatePayroll(input) {
  const {
    grossSalary = 3500,
    taxClass = 1,
    hasChildren = false,
    churchTax = false,
    churchTaxRate = 0.09,
    benefitsInKind = 0
  } = input;

  const totalGross = Math.max(0, grossSalary + benefitsInKind);

  // Beitragsbemessungsgrenzen anwenden
  const baseHealthCare = Math.min(totalGross, CONTRIBUTION_CEILINGS.HEALTH_CARE_MONTHLY);
  const basePensionUnemp = Math.min(totalGross, CONTRIBUTION_CEILINGS.PENSION_UNEMP_MONTHLY);

  // 1. Sozialversicherung Arbeitnehmer
  const kvRate = SOCIAL_RATES.HEALTH.employee + (SOCIAL_RATES.HEALTH.additionalAvg / 2);
  const employeeHealth = Math.round(baseHealthCare * kvRate * 100) / 100;

  let pvRate = SOCIAL_RATES.CARE_BASE.employee;
  if (!hasChildren) {
    pvRate += SOCIAL_RATES.CARE_CHILDLESS_SURCHARGE;
  }
  const employeeCare = Math.round(baseHealthCare * pvRate * 100) / 100;

  const employeePension = Math.round(basePensionUnemp * SOCIAL_RATES.PENSION.employee * 100) / 100;
  const employeeUnemployment = Math.round(basePensionUnemp * SOCIAL_RATES.UNEMPLOYMENT.employee * 100) / 100;

  const totalEmployeeSocial = Math.round((employeeHealth + employeeCare + employeePension + employeeUnemployment) * 100) / 100;

  // 2. Lohnsteuer-Schätzung nach Steuerklasse
  let taxFactor = 0.15;
  if (taxClass === 1 || taxClass === 4) taxFactor = 0.14;
  else if (taxClass === 2) taxFactor = 0.11; // Entlastungsbetrag für Alleinerziehende
  else if (taxClass === 3) taxFactor = 0.06; // Verheiratet Hauptverdiener
  else if (taxClass === 5) taxFactor = 0.26; // Verheiratet Zweitverdiener
  else if (taxClass === 6) taxFactor = 0.32; // Zweitjob ohne Grundfreibetrag

  // Grundfreibetrag-Abzug grob simuliert
  const taxableBase = Math.max(0, totalGross - 1000);
  const wageTax = Math.round(taxableBase * taxFactor * 100) / 100;

  // Solidaritätszuschlag (ab Freigrenze, ca. erst ab höherem Gehalt)
  const soli = wageTax > 1500 ? Math.round(wageTax * 0.055 * 100) / 100 : 0;

  // Kirchensteuer
  const church = churchTax ? Math.round(wageTax * churchTaxRate * 100) / 100 : 0;

  const totalTaxes = Math.round((wageTax + soli + church) * 100) / 100;

  // Nettogehalt
  const netSalary = Math.round((totalGross - totalEmployeeSocial - totalTaxes - benefitsInKind) * 100) / 100;

  // 3. Arbeitgeber-Belastung (AG-Anteil Sozialversicherung)
  const employerHealth = Math.round(baseHealthCare * kvRate * 100) / 100;
  const employerCare = Math.round(baseHealthCare * SOCIAL_RATES.CARE_BASE.employer * 100) / 100;
  const employerPension = Math.round(basePensionUnemp * SOCIAL_RATES.PENSION.employer * 100) / 100;
  const employerUnemployment = Math.round(basePensionUnemp * SOCIAL_RATES.UNEMPLOYMENT.employer * 100) / 100;

  // Umlagen (U1 Entgeltfortzahlung im Krankheitsfall ~1.5%, U2 Mutterschutz ~0.5%, U3 Insolvenzgeld ~0.06%)
  const levyU1 = Math.round(baseHealthCare * 0.015 * 100) / 100;
  const levyU2 = Math.round(baseHealthCare * 0.005 * 100) / 100;
  const levyU3 = Math.round(basePensionUnemp * 0.0006 * 100) / 100;

  const totalEmployerSocial = Math.round((employerHealth + employerCare + employerPension + employerUnemployment + levyU1 + levyU2 + levyU3) * 100) / 100;
  const totalEmployerCost = Math.round((grossSalary + totalEmployerSocial) * 100) / 100;

  return {
    grossSalary,
    benefitsInKind,
    totalGross,
    employee: {
      health: employeeHealth,
      care: employeeCare,
      pension: employeePension,
      unemployment: employeeUnemployment,
      totalSocial: totalEmployeeSocial,
      wageTax,
      soli,
      churchTax: church,
      totalTaxes,
      netSalary
    },
    employer: {
      health: employerHealth,
      care: employerCare,
      pension: employerPension,
      unemployment: employerUnemployment,
      levies: Math.round((levyU1 + levyU2 + levyU3) * 100) / 100,
      totalSocial: totalEmployerSocial,
      totalCost: totalEmployerCost
    }
  };
}
