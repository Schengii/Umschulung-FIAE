// @ts-check
/**
 * WISO Rentabilitäts- & Leverage-Effekt Engine
 * Berechnet Eigenkapitalrentabilität, Gesamtkapitalrentabilität,
 * Umsatzrentabilität und simuliert den finanziellen Leverage-Effekt.
 */

/**
 * @typedef {Object} RentabilitaetInput
 * @property {number} eigenkapital (€)
 * @property {number} fremdkapital (€)
 * @property {number} fremdkapitalZinssatz (% p.a.)
 * @property {number} jahresueberschuss (€ Gewinn nach Steuern & Zinsen)
 * @property {number} umsatzerloese (€)
 */

/**
 * Berechnet alle relevanten Rentabilitätskennzahlen und den Leverage-Effekt
 * @param {RentabilitaetInput} params
 */
export function calculateRentabilitaetAndLeverage(params) {
  const {
    eigenkapital = 200000,
    fremdkapital = 300000,
    fremdkapitalZinssatz = 5,
    jahresueberschuss = 40000,
    umsatzerloese = 1000000
  } = params;

  const gesamtKapital = Math.max(1, eigenkapital + fremdkapital);
  const ek = Math.max(1, eigenkapital);
  const fk = Math.max(0, fremdkapital);
  const umsatz = Math.max(1, umsatzerloese);

  // 1. Fremdkapitalzinsen pro Jahr
  const fremdkapitalzinsen = (fk * fremdkapitalZinssatz) / 100;

  // 2. Eigenkapitalrentabilität (r_EK = Jahresüberschuss / Eigenkapital * 100)
  const eigenkapitalrentabilitaet = (jahresueberschuss / ek) * 100;

  // 3. Gesamtkapitalrentabilität (r_GK = (Jahresüberschuss + Fremdkapitalzinsen) / Gesamtkapital * 100)
  const gesamtkapitalrentabilitaet = ((jahresueberschuss + fremdkapitalzinsen) / gesamtKapital) * 100;

  // 4. Umsatzrentabilität (r_U = Jahresüberschuss / Umsatzerlöse * 100)
  const umsatzrentabilitaet = (jahresueberschuss / umsatz) * 100;

  // 5. Verschuldungsgrad (Leverage = Fremdkapital / Eigenkapital)
  const verschuldungsgrad = fk / ek;

  // 6. Leverage-Effekt Analyse
  // r_EK = r_GK + (r_GK - i) * (FK / EK)
  const spread = gesamtkapitalrentabilitaet - fremdkapitalZinssatz;
  const isPositiveLeverage = spread > 0;
  const isNegativeLeverage = spread < 0;

  const round2 = (/** @type {number} */ n) => Number(n.toFixed(2));

  return {
    gesamtKapital: round2(gesamtKapital),
    fremdkapitalzinsen: round2(fremdkapitalzinsen),
    eigenkapitalrentabilitaet: round2(eigenkapitalrentabilitaet),
    gesamtkapitalrentabilitaet: round2(gesamtkapitalrentabilitaet),
    umsatzrentabilitaet: round2(umsatzrentabilitaet),
    verschuldungsgrad: round2(verschuldungsgrad),
    spread: round2(spread),
    isPositiveLeverage,
    isNegativeLeverage
  };
}
