// @ts-check
/**
 * IHK WISO Deckungsbeitrags- & Break-Even-Point Engine
 * Calculates Unit Contribution Margin (db), Break-Even-Point (BEP),
 * Multi-Stage Fixed Cost Allocation (Erzeugnis-, Gruppen-, Bereichs- & Unternehmensfixkosten),
 * and Relative Contribution Margin for bottleneck optimization.
 */

/**
 * @typedef {object} ContributionMarginInput
 * @property {number} [preis]
 * @property {number} [variableStueckkosten]
 * @property {number} [fixkosten]
 * @property {number} [menge]
 *
 * @typedef {object} ContributionMarginResult
 * @property {number} preis
 * @property {number} variableStueckkosten
 * @property {number} fixkosten
 * @property {number} menge
 * @property {number} stueckDb
 * @property {number} dbQuotePercent
 * @property {number} bepMenge
 * @property {number} bepUmsatz
 * @property {number} gesamtUmsatz
 * @property {number} gesamtDb
 * @property {number} betriebsergebnis
 * @property {boolean} isProfit
 *
 * @typedef {object} MultiStageContributionInput
 * @property {number} [erloese]
 * @property {number} [varKosten]
 * @property {number} [erzeugnisFixkosten]
 * @property {number} [gruppenFixkosten]
 * @property {number} [bereichsFixkosten]
 * @property {number} [unternehmensFixkosten]
 *
 * @typedef {object} MultiStageContributionResult
 * @property {number} erloese
 * @property {number} varKosten
 * @property {number} db1
 * @property {number} db2
 * @property {number} db3
 * @property {number} db4
 * @property {number} betriebsergebnis
 * @property {boolean} isProfit
 */

/**
 * @param {ContributionMarginInput} input
 * @returns {ContributionMarginResult}
 */
export function calculateContributionMargin({
  preis = 120.0,
  variableStueckkosten = 70.0,
  fixkosten = 50000.0,
  menge = 1200
}) {
  const p = Math.max(1, preis);
  const kv = Math.max(0, variableStueckkosten);
  const kf = Math.max(0, fixkosten);
  const m = Math.max(1, menge);

  const db = p - kv;
  const dbQuote = p > 0 ? (db / p) * 100 : 0;
  const bepMenge = db > 0 ? Math.ceil(kf / db) : Infinity;
  const bepUmsatz = bepMenge !== Infinity ? bepMenge * p : Infinity;

  const gesamtUmsatz = m * p;
  const gesamtDb = m * db;
  const betriebsergebnis = gesamtDb - kf;

  return {
    preis: p,
    variableStueckkosten: kv,
    fixkosten: kf,
    menge: m,
    stueckDb: parseFloat(db.toFixed(2)),
    dbQuotePercent: parseFloat(dbQuote.toFixed(2)),
    bepMenge,
    bepUmsatz: parseFloat(bepUmsatz.toFixed(2)),
    gesamtUmsatz: parseFloat(gesamtUmsatz.toFixed(2)),
    gesamtDb: parseFloat(gesamtDb.toFixed(2)),
    betriebsergebnis: parseFloat(betriebsergebnis.toFixed(2)),
    isProfit: betriebsergebnis > 0
  };
}

/**
 * @param {MultiStageContributionInput} input
 * @returns {MultiStageContributionResult}
 */
export function calculateMultiStageContribution({
  erloese = 250000,
  varKosten = 140000,
  erzeugnisFixkosten = 25000,
  gruppenFixkosten = 15000,
  bereichsFixkosten = 20000,
  unternehmensFixkosten = 30000
}) {
  const db1 = erloese - varKosten;
  const db2 = db1 - erzeugnisFixkosten;
  const db3 = db2 - gruppenFixkosten;
  const db4 = db3 - bereichsFixkosten;
  const betriebsergebnis = db4 - unternehmensFixkosten;

  return {
    erloese,
    varKosten,
    db1,
    db2,
    db3,
    db4,
    betriebsergebnis,
    isProfit: betriebsergebnis > 0
  };
}

/**
 * IHK-Prüfungsdrill für das Deckungsbeitrags-Lab (Format wie `IhkDrillPanel`).
 * Rechenbeispiele sind in wisoDrills.test.js gegen die Engine abgesichert.
 */
export const CONTRIBUTION_MARGIN_DRILL_QUESTIONS = [
  {
    id: 'db_1',
    frage: 'Verkaufspreis 120 €, variable Stückkosten 70 €. Wie hoch ist der Stückdeckungsbeitrag?',
    optionen: ['40 €', '50 €', '70 €', '120 €'],
    korrektIndex: 1,
    erklaerung: 'Stückdeckungsbeitrag = Verkaufspreis − variable Stückkosten = 120 € − 70 € = 50 €.'
  },
  {
    id: 'db_2',
    frage: 'Fixkosten 50.000 €, Stückdeckungsbeitrag 50 €. Ab welcher Menge wird die Gewinnschwelle (Break-Even-Point) erreicht?',
    optionen: ['500 Stück', '1.000 Stück', '1.200 Stück', '2.400 Stück'],
    korrektIndex: 1,
    erklaerung: 'BEP-Menge = Fixkosten / Stückdeckungsbeitrag = 50.000 € / 50 € = 1.000 Stück.'
  },
  {
    id: 'db_3',
    frage: 'Wie hoch ist das Betriebsergebnis bei 1.200 verkauften Stück (Stückdeckungsbeitrag 50 €, Fixkosten 50.000 €)?',
    optionen: ['10.000 € Gewinn', '10.000 € Verlust', '60.000 € Gewinn', '50.000 € Gewinn'],
    korrektIndex: 0,
    erklaerung: 'Gesamtdeckungsbeitrag 1.200 · 50 € = 60.000 €; abzüglich Fixkosten 50.000 € ergibt 10.000 € Gewinn.'
  },
  {
    id: 'db_4',
    frage: 'Wie hoch ist die Deckungsbeitragsquote bei Preis 120 € und Stückdeckungsbeitrag 50 €?',
    optionen: ['ca. 41,7 %', 'ca. 58,3 %', '50 %', '70 %'],
    korrektIndex: 0,
    erklaerung: 'DB-Quote = Stückdeckungsbeitrag / Preis = 50 / 120 ≈ 0,4167 = 41,7 %.'
  },
  {
    id: 'db_5',
    frage: 'Welche Kosten werden in der mehrstufigen Deckungsbeitragsrechnung zuletzt abgezogen?',
    optionen: ['Variable Kosten', 'Erzeugnisfixkosten', 'Bereichsfixkosten', 'Unternehmensfixkosten'],
    korrektIndex: 3,
    erklaerung: 'Erlöse − variable Kosten = DB I; − Erzeugnisfixkosten = DB II; − Gruppenfixkosten = DB III; − Bereichsfixkosten = DB IV; − Unternehmensfixkosten = Betriebsergebnis.'
  }
];
