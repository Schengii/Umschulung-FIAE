// @ts-check
/**
 * IHK WISO Liquiditätsgrade (1., 2. und 3. Grades) & Working Capital Engine
 * Berechnet Barliquidität, einzugsbedingte Liquidität, umsatzbedingte Liquidität (Current Ratio)
 * und das Net Working Capital nach offiziellem IHK-Rahmenlehrplan (AP2 WISO).
 */

/**
 * @typedef {Object} LiquiditaetInput
 * @property {number} fluessigeMittel (€ Kasse, Bankguthaben)
 * @property {number} kurzfristigeForderungen (€ Forderungen aus LuL, Wertpapiere)
 * @property {number} vorraete (€ Rohstoffe, fertige Erzeugnisse, Waren)
 * @property {number} kurzfristigeVerbindlichkeiten (€ Verbindlichkeiten aus LuL, Kontokorrent)
 * @property {number} umlaufvermoegen (€ Summe flüssige Mittel + Forderungen + Vorräte)
 */

/**
 * Berechnet Liquiditätsgrade und Working Capital
 * @param {LiquiditaetInput} params
 */
export function calculateLiquiditaetAndWorkingCapital(params) {
  const {
    fluessigeMittel = 50000,
    kurzfristigeForderungen = 120000,
    vorraete = 180000,
    kurzfristigeVerbindlichkeiten = 150000
  } = params;

  const kVerb = Math.max(1, kurzfristigeVerbindlichkeiten);
  const flM = Math.max(0, fluessigeMittel);
  const ford = Math.max(0, kurzfristigeForderungen);
  const vorr = Math.max(0, vorraete);

  const berechnetesUmlaufvermoegen = flM + ford + vorr;

  // 1. Liquidität 1. Grades (Barliquidität / Cash Ratio)
  // Formel: Flüssige Mittel / Kurzfristige Verbindlichkeiten * 100
  // Richtwert: ca. 20% - 30%
  const liquiditaet1 = (flM / kVerb) * 100;

  // 2. Liquidität 2. Grades (Einzugsbedingte Liquidität / Quick Ratio)
  // Formel: (Flüssige Mittel + kurzfristige Forderungen) / Kurzfristige Verbindlichkeiten * 100
  // Richtwert: ca. 100% - 120%
  const liquiditaet2 = ((flM + ford) / kVerb) * 100;

  // 3. Liquidität 3. Grades (Umsatzbedingte Liquidität / Current Ratio)
  // Formel: Umlaufvermögen / Kurzfristige Verbindlichkeiten * 100
  // Richtwert: ca. 150% - 200%
  const liquiditaet3 = (berechnetesUmlaufvermoegen / kVerb) * 100;

  // 4. Net Working Capital (NWC)
  // Formel: Umlaufvermögen - Kurzfristige Verbindlichkeiten
  const netWorkingCapital = berechnetesUmlaufvermoegen - kVerb;

  const round2 = (/** @type {number} */ n) => Number(n.toFixed(2));

  return {
    berechnetesUmlaufvermoegen: round2(berechnetesUmlaufvermoegen),
    liquiditaet1: round2(liquiditaet1),
    liquiditaet2: round2(liquiditaet2),
    liquiditaet3: round2(liquiditaet3),
    netWorkingCapital: round2(netWorkingCapital),
    statusL1: liquiditaet1 >= 20 ? 'OPTIMAL' : 'KRITISCH',
    statusL2: liquiditaet2 >= 100 ? 'OPTIMAL' : 'UNTERDECKUNG',
    statusL3: liquiditaet3 >= 150 ? 'OPTIMAL' : 'MÄSSIG'
  };
}

/**
 * IHK-Prüfungsdrill für das Liquiditäts-Lab (Format wie `IhkDrillPanel`).
 * Rechenbeispiele sind in wisoLiquiditaetDrill.test.js gegen die Engine abgesichert.
 */
export const LIQUIDITAET_DRILL_QUESTIONS = [
  {
    id: 'liq_1',
    frage: 'Welche Positionen stehen im Zähler der Liquidität 2. Grades (einzugsbedingte Liquidität)?',
    optionen: [
      'Nur die flüssigen Mittel',
      'Flüssige Mittel und kurzfristige Forderungen',
      'Das gesamte Umlaufvermögen einschließlich Vorräten',
      'Das Anlagevermögen'
    ],
    korrektIndex: 1,
    erklaerung: 'Liquidität 2. Grades = (flüssige Mittel + kurzfristige Forderungen) / kurzfristige Verbindlichkeiten. Vorräte kommen erst bei der Liquidität 3. Grades hinzu.'
  },
  {
    id: 'liq_2',
    frage: 'Flüssige Mittel: 40.000 €; kurzfristige Verbindlichkeiten: 160.000 €. Wie hoch ist die Liquidität 1. Grades?',
    optionen: ['4 %', '25 %', '40 %', '400 %'],
    korrektIndex: 1,
    erklaerung: '40.000 € / 160.000 € = 0,25 = 25 %. Der Richtwert von mindestens 20 % ist erfüllt.'
  },
  {
    id: 'liq_3',
    frage: 'Flüssige Mittel 50.000 €, kurzfristige Forderungen 100.000 €, Vorräte 150.000 €, kurzfristige Verbindlichkeiten 200.000 €. Wie hoch ist die Liquidität 3. Grades?',
    optionen: ['75 %', '100 %', '150 %', '200 %'],
    korrektIndex: 2,
    erklaerung: 'Umlaufvermögen = 50.000 + 100.000 + 150.000 = 300.000 €. 300.000 € / 200.000 € = 1,5 = 150 % – der Richtwert (mindestens 150 %) ist genau erreicht.'
  },
  {
    id: 'liq_4',
    frage: 'Die Liquidität 2. Grades eines Unternehmens beträgt 80 %. Wie ist das zu bewerten?',
    optionen: [
      'Unkritisch, weil der Wert über 20 % liegt',
      'Der Richtwert von 100 % ist unterschritten: Die kurzfristigen Verbindlichkeiten sind nicht durch flüssige Mittel und Forderungen gedeckt',
      'Gut, weil unter 100 % das Eigenkapital geschont wird',
      'Nicht bewertbar ohne Kenntnis des Anlagevermögens'
    ],
    korrektIndex: 1,
    erklaerung: 'Unter 100 % reichen Zahlungsmittel und Forderungen nicht, um die kurzfristigen Schulden zu begleichen. Es droht Zahlungsunfähigkeit (§ 17 InsO); Gegenmaßnahmen sind z. B. Forderungsmanagement oder Kreditlinien.'
  }
];
