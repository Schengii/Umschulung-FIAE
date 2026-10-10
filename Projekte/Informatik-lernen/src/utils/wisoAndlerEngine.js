// @ts-check
/**
 * IHK WISO Andler'sche Formel (Optimale Bestellmenge) Engine
 * Calculates economic order quantity (EOQ / x_opt), order frequency (n_opt),
 * order interval (t_opt), and cost breakdown (ordering costs vs. holding costs).
 */

/**
 * @typedef {object} AndlerOrderInput
 * @property {number} [jahresbedarf]
 * @property {number} [bestellfixeKosten]
 * @property {number} [einstandspreis]
 * @property {number} [lagerkostensatzPercent]
 *
 * @typedef {object} AndlerOrderResult
 * @property {number} jahresbedarf
 * @property {number} bestellfixeKosten
 * @property {number} einstandspreis
 * @property {number} lagerkostensatzPercent
 * @property {number} xOpt
 * @property {number} nOpt
 * @property {number} tOptDays
 * @property {number} bestellkosten
 * @property {number} lagerkosten
 * @property {number} gesamtkosten
 */

/**
 * @param {AndlerOrderInput} input
 * @returns {AndlerOrderResult}
 */
export function calculateAndlerOptimalOrder({
  jahresbedarf = 10000,
  bestellfixeKosten = 50.0,
  einstandspreis = 20.0,
  lagerkostensatzPercent = 15.0
}) {
  const j = Math.max(1, jahresbedarf);
  const kf = Math.max(1, bestellfixeKosten);
  const p = Math.max(0.1, einstandspreis);
  const ls = Math.max(0.1, lagerkostensatzPercent);

  // Andler formula: x_opt = sqrt( (200 * J * k_f) / (p * l_s) )
  const xOpt = Math.round(Math.sqrt((200 * j * kf) / (p * ls)));
  const nOpt = parseFloat((j / xOpt).toFixed(2));
  const tOptDays = parseFloat((360 / nOpt).toFixed(1));

  const bestellkosten = parseFloat((nOpt * kf).toFixed(2));
  const lagerkosten = parseFloat(((xOpt / 2) * p * (ls / 100)).toFixed(2));
  const gesamtkosten = parseFloat((bestellkosten + lagerkosten).toFixed(2));

  return {
    jahresbedarf: j,
    bestellfixeKosten: kf,
    einstandspreis: p,
    lagerkostensatzPercent: ls,
    xOpt,
    nOpt,
    tOptDays,
    bestellkosten,
    lagerkosten,
    gesamtkosten
  };
}

/**
 * IHK-Prüfungsdrill für das Andler-Lab (Format wie `IhkDrillPanel`).
 * Rechenbeispiele sind in wisoDrills.test.js gegen `calculateAndlerOptimalOrder` abgesichert.
 */
export const ANDLER_DRILL_QUESTIONS = [
  {
    id: 'andler_1',
    frage: 'Jahresbedarf 1.000 Stück, bestellfixe Kosten 50 € je Bestellung, Einstandspreis 50 €, Lagerhaltungskostensatz 20 %. Wie groß ist die optimale Bestellmenge?',
    optionen: ['50 Stück', '100 Stück', '200 Stück', '500 Stück'],
    korrektIndex: 1,
    erklaerung: 'x_opt = √(200 · J · k_f / (p · l_s)) = √(200 · 1.000 · 50 / (50 · 20)) = √10.000 = 100 Stück.'
  },
  {
    id: 'andler_2',
    frage: 'Wie oft wird im Beispiel (Jahresbedarf 1.000, x_opt = 100) pro Jahr bestellt und in welchem Abstand (360-Tage-Jahr)?',
    optionen: ['10 Bestellungen, alle 36 Tage', '10 Bestellungen, alle 30 Tage', '100 Bestellungen, alle 3,6 Tage', '5 Bestellungen, alle 72 Tage'],
    korrektIndex: 0,
    erklaerung: 'n_opt = J / x_opt = 1.000 / 100 = 10 Bestellungen. Bestellabstand t_opt = 360 Tage / 10 = 36 Tage.'
  },
  {
    id: 'andler_3',
    frage: 'Was gilt bei der optimalen Bestellmenge für Bestellkosten und Lagerkosten?',
    optionen: [
      'Die Bestellkosten sind doppelt so hoch wie die Lagerkosten',
      'Die Lagerkosten sind null',
      'Bestellkosten und Lagerkosten sind gleich hoch (Kostenminimum)',
      'Die Bestellkosten sind null'
    ],
    korrektIndex: 2,
    erklaerung: 'Im Kostenminimum schneiden sich die steigenden Lagerkosten und die fallenden Bestellkosten. Beispiel: 10 · 50 € = 500 € Bestellkosten und 100 / 2 · 50 € · 20 % = 500 € Lagerkosten.'
  },
  {
    id: 'andler_4',
    frage: 'Die bestellfixen Kosten steigen. Wie verändert sich die optimale Bestellmenge?',
    optionen: ['Sie sinkt', 'Sie steigt (weniger, dafür größere Bestellungen)', 'Sie bleibt gleich', 'Sie wird null'],
    korrektIndex: 1,
    erklaerung: 'Die bestellfixen Kosten stehen im Zähler der Wurzel. Höhere Kosten je Bestellung lohnen größere, seltenere Bestellungen.'
  },
  {
    id: 'andler_5',
    frage: 'Welche Annahme liegt der Andler\'schen Formel zugrunde?',
    optionen: [
      'Der Preis hängt stark von der Bestellmenge ab (Mengenrabatte)',
      'Gleichmäßiger Verbrauch und ein von der Bestellmenge unabhängiger Preis',
      'Der Lagerbestand wird nie aufgebraucht',
      'Es gibt keine Lagerkosten'
    ],
    korrektIndex: 1,
    erklaerung: 'Die Formel setzt gleichmäßigen Verbrauch, konstante Preise ohne Mengenrabatte und konstante Kostensätze voraus. Bei Mengenrabatten muss man die Gesamtkosten je Staffel vergleichen.'
  }
];
