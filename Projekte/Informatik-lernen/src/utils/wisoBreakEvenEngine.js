// @ts-check
/**
 * IHK WISO Deckungsbeitrag Stufe 2 & Break-Even-Point Solver Engine
 * Calculates:
 * 1. Unit Contribution Margin: db = p - kv
 * 2. Total Contribution Margin: DB = x * db
 * 3. Two-Tier Contribution Margin (Stufe 2):
 *    - DB I = Erlöse - variable Kosten
 *    - Erzeugnisfixkosten (kfix1) abgezogen -> DB II (Bereichs-/Produkt-Deckungsbeitrag)
 *    - Unternehmensfixkosten (kfix2) abgezogen -> Betriebsergebnis
 * 4. Relative Contribution Margin for bottleneck resource constraints:
 *    - db_rel = db / t (Engpassbeanspruchung in Minuten oder Maschinenstunden)
 * 5. Break-Even-Point (Gewinnschwelle):
 *    - x_bep = K_fix / db
 *    - Umsatz_bep = x_bep * p
 */

/**
 * @typedef {Object} ProductItem
 * @property {string} id Product ID
 * @property {string} name Product name
 * @property {number} price Unit sales price in EUR (p)
 * @property {number} variableCost Unit variable cost in EUR (kv)
 * @property {number} quantity Produced/sold units (x)
 * @property {number} productFixedCost Direct product fixed cost in EUR (Kf1)
 * @property {number} bottleneckTimeMinutes Time spent on bottleneck resource per unit (t)
 */

/**
 * @typedef {Object} ProductCalculationResult
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {number} variableCost
 * @property {number} quantity
 * @property {number} unitContributionMargin db = p - kv
 * @property {number} revenue Total sales revenue (p * x)
 * @property {number} totalVariableCost kv * x
 * @property {number} contributionMargin1 DB I = revenue - totalVariableCost
 * @property {number} productFixedCost Kf1
 * @property {number} contributionMargin2 DB II = DB I - Kf1
 * @property {number} bottleneckTimeMinutes
 * @property {number} relativeContributionMargin db_rel = db / bottleneckTimeMinutes
 * @property {number} breakEvenUnits x_bep for this product alone (Kf1 / db)
 * @property {number} breakEvenRevenue Break-even revenue in EUR
 */

/**
 * @typedef {Object} BreakEvenPointResult
 * @property {ProductCalculationResult[]} products
 * @property {number} totalRevenue Total company revenue
 * @property {number} totalVariableCosts Total company variable costs
 * @property {number} totalContributionMargin1 Total DB I
 * @property {number} totalProductFixedCosts Total Kf1
 * @property {number} totalContributionMargin2 Total DB II
 * @property {number} companyFixedCosts Kf2 (Unternehmensfixkosten)
 * @property {number} operatingResult Betriebsergebnis (Gewinn/Verlust) = DB II - Kf2
 * @property {Array<{ rank: number, productId: string, name: string, dbRel: number }>} bottleneckRanking
 */

/**
 * Calculates Tier-2 Contribution Margin, Bottleneck Priorities and Break-Even Points
 * @param {ProductItem[]} products
 * @param {number} companyFixedCosts Kf2 general administrative overhead
 * @returns {BreakEvenPointResult}
 */
export function calculateTier2ContributionMargin(products, companyFixedCosts = 25000) {
  let totalRevenue = 0;
  let totalVariableCosts = 0;
  let totalContributionMargin1 = 0;
  let totalProductFixedCosts = 0;
  let totalContributionMargin2 = 0;

  /** @type {ProductCalculationResult[]} */
  const productResults = products.map(p => {
    const db = Number((p.price - p.variableCost).toFixed(2));
    const revenue = Number((p.price * p.quantity).toFixed(2));
    const totalVar = Number((p.variableCost * p.quantity).toFixed(2));
    const db1 = Number((revenue - totalVar).toFixed(2));
    const db2 = Number((db1 - p.productFixedCost).toFixed(2));

    const dbRel = p.bottleneckTimeMinutes > 0
      ? Number((db / p.bottleneckTimeMinutes).toFixed(3))
      : 0;

    const bepUnits = db > 0
      ? Math.ceil(p.productFixedCost / db)
      : 0;

    const bepRevenue = Number((bepUnits * p.price).toFixed(2));

    totalRevenue += revenue;
    totalVariableCosts += totalVar;
    totalContributionMargin1 += db1;
    totalProductFixedCosts += p.productFixedCost;
    totalContributionMargin2 += db2;

    return {
      id: p.id,
      name: p.name,
      price: p.price,
      variableCost: p.variableCost,
      quantity: p.quantity,
      unitContributionMargin: db,
      revenue,
      totalVariableCost: totalVar,
      contributionMargin1: db1,
      productFixedCost: p.productFixedCost,
      contributionMargin2: db2,
      bottleneckTimeMinutes: p.bottleneckTimeMinutes,
      relativeContributionMargin: dbRel,
      breakEvenUnits: bepUnits,
      breakEvenRevenue: bepRevenue
    };
  });

  const operatingResult = Number((totalContributionMargin2 - companyFixedCosts).toFixed(2));

  // Sort by relative contribution margin descending to solve bottleneck program
  const sortedRanking = [...productResults]
    .sort((a, b) => b.relativeContributionMargin - a.relativeContributionMargin)
    .map((item, index) => ({
      rank: index + 1,
      productId: item.id,
      name: item.name,
      dbRel: item.relativeContributionMargin
    }));

  return {
    products: productResults,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalVariableCosts: Number(totalVariableCosts.toFixed(2)),
    totalContributionMargin1: Number(totalContributionMargin1.toFixed(2)),
    totalProductFixedCosts: Number(totalProductFixedCosts.toFixed(2)),
    totalContributionMargin2: Number(totalContributionMargin2.toFixed(2)),
    companyFixedCosts,
    operatingResult,
    bottleneckRanking: sortedRanking
  };
}
