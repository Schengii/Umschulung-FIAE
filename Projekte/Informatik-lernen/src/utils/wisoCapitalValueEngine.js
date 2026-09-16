/**
 * IHK WISO Kapitalwertmethode (Net Present Value - NPV) Engine
 * Implements dynamic investment appraisal: discounts future cash flows (R_t)
 * and salvage value (L_n) using calculation interest rate (i) to determine project profitability.
 */

export function calculateNetPresentValue({
  anschaffungsauszahlung = 100000,
  kalkulationszinssatzPercent = 8.0,
  cashflows = [30000, 35000, 40000, 30000],
  liquidationserloes = 10000
}) {
  const i0 = Math.max(0, anschaffungsauszahlung);
  const rate = Math.max(0, kalkulationszinssatzPercent) / 100;
  const ln = Math.max(0, liquidationserloes);

  let sumBarwerte = 0;
  const cashflowDetails = cashflows.map((cf, idx) => {
    const t = idx + 1;
    const abzinsungsfaktor = 1 / Math.pow(1 + rate, t);
    const barwert = cf * abzinsungsfaktor;
    sumBarwerte += barwert;

    return {
      jahr: t,
      cashflow: cf,
      abzinsungsfaktor: parseFloat(abzinsungsfaktor.toFixed(4)),
      barwert: parseFloat(barwert.toFixed(2))
    };
  });

  const n = cashflows.length;
  const abzinsungsfaktorLn = 1 / Math.pow(1 + rate, n);
  const barwertLn = ln * abzinsungsfaktorLn;
  sumBarwerte += barwertLn;

  const kapitalwert = sumBarwerte - i0;
  const isProfitable = kapitalwert >= 0;

  return {
    anschaffungsauszahlung: i0,
    kalkulationszinssatzPercent,
    sumBarwerte: parseFloat(sumBarwerte.toFixed(2)),
    liquidationserloes: ln,
    barwertLn: parseFloat(barwertLn.toFixed(2)),
    kapitalwert: parseFloat(kapitalwert.toFixed(2)),
    isProfitable,
    cashflowDetails,
    recommendation: isProfitable
      ? 'Die Investition ist vorteilhaft (Kapitalwert >= 0 €). Das investierte Kapital verzinst sich höher als der Kalkulationszinssatz.'
      : 'Die Investition ist unvorteilhaft (Kapitalwert < 0 €). Die Mindestverzinsung wird nicht erreicht.'
  };
}
