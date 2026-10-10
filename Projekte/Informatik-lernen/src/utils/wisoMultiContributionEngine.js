// @ts-check
/**
 * Mehrstufige Deckungsbeitragsrechnung & Break-Even-Analyse Engine
 * (IHK WISO & AP2 Dokumentation)
 * Berechnet DB I, DB II (Erzeugnisfix), DB III (Erzeugnisgruppenfix),
 * DB IV (Bereichsfix) und das finale Betriebsergebnis sowie den Break-Even-Point
 * und den Sicherheitskoeffizienten.
 */

/**
 * @typedef {Object} ProductLine
 * @property {string} id
 * @property {string} name
 * @property {number} pricePerUnit
 * @property {number} variableCostPerUnit
 * @property {number} unitsSold
 * @property {number} productFixCosts - Erzeugnisfixkosten (Zurechenbar auf Einzelprodukt)
 */

/**
 * Standard-Produkte für die IHK-Kalkulation
 * @type {ProductLine[]}
 */
export const DEFAULT_PRODUCT_LINES = [
  { id: 'prod-saas', name: 'Cloud SaaS Lizenzen', pricePerUnit: 50, variableCostPerUnit: 15, unitsSold: 1200, productFixCosts: 12000 },
  { id: 'prod-support', name: 'Premium 24/7 SLA Support', pricePerUnit: 120, variableCostPerUnit: 40, unitsSold: 400, productFixCosts: 8000 }
];

/**
 * Berechnet mehrstufige Deckungsbeiträge
 * @param {Object} input
 * @param {ProductLine[]} input.products
 * @param {number} input.groupFixCosts - Erzeugnisgruppenfixkosten
 * @param {number} input.divisionFixCosts - Bereichsfixkosten
 * @param {number} input.companyFixCosts - Unternehmensfixkosten
 */
export function calculateMultiContributionMargin(input) {
  const {
    products = DEFAULT_PRODUCT_LINES,
    groupFixCosts = 5000,
    divisionFixCosts = 7000,
    companyFixCosts = 6000
  } = input;

  let totalRevenue = 0;
  let totalVariableCosts = 0;
  let totalDb1 = 0;
  let totalProductFixCosts = 0;
  let totalDb2 = 0;

  const productBreakdown = products.map(p => {
    const revenue = p.pricePerUnit * p.unitsSold;
    const variableTotal = p.variableCostPerUnit * p.unitsSold;
    const unitDb = p.pricePerUnit - p.variableCostPerUnit;
    const db1 = unitDb * p.unitsSold;
    const db2 = db1 - p.productFixCosts;

    // Break-Even Menge für dieses Produkt
    const bepUnits = unitDb > 0 ? Math.ceil(p.productFixCosts / unitDb) : Infinity;

    totalRevenue += revenue;
    totalVariableCosts += variableTotal;
    totalDb1 += db1;
    totalProductFixCosts += p.productFixCosts;
    totalDb2 += db2;

    return {
      ...p,
      revenue,
      variableTotal,
      unitDb,
      db1,
      db2,
      bepUnits
    };
  });

  const db3 = totalDb2 - groupFixCosts;
  const db4 = db3 - divisionFixCosts;
  const operatingProfit = db4 - companyFixCosts;

  const totalFixCosts = totalProductFixCosts + groupFixCosts + divisionFixCosts + companyFixCosts;

  // Deckungsbeitragsquote (DB-Umsatz-Verhältnis)
  const dbQuote = totalRevenue > 0 ? (totalDb1 / totalRevenue) : 0;
  const breakEvenRevenue = dbQuote > 0 ? Math.round(totalFixCosts / dbQuote) : 0;

  // Sicherheitskoeffizient = (Ist-Umsatz - BEP-Umsatz) / Ist-Umsatz
  const safetyMarginPercent = totalRevenue > 0
    ? Number((((totalRevenue - breakEvenRevenue) / totalRevenue) * 100).toFixed(1))
    : 0;

  return {
    productBreakdown,
    totalRevenue,
    totalVariableCosts,
    totalDb1,
    totalProductFixCosts,
    totalDb2,
    groupFixCosts,
    db3,
    divisionFixCosts,
    db4,
    companyFixCosts,
    operatingProfit,
    totalFixCosts,
    breakEvenRevenue,
    safetyMarginPercent,
    isProfitable: operatingProfit > 0
  };
}
