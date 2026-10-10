// @ts-check
/**
 * IHK Maschinenstundensatzrechnung Engine
 * Berechnet kalkulatorische Abschreibung, Zinsen, Raumkosten, Energiekosten,
 * Instandhaltung und Werkzeugkosten zur Ermittlung des exakten Maschinenstundensatzes (MSS).
 */

/**
 * @typedef {Object} MaschinenstundensatzInput
 * @property {number} wiederbeschaffungswert (€)
 * @property {number} restwert (€, Standard 0)
 * @property {number} nutzungsdauerJahre (Jahre)
 * @property {number} kalkZinssatzProzent (% p.a. auf halben Anschaffungswert)
 * @property {number} jaehrlicheLaufstunden (h/Jahr)
 * @property {number} raumflaecheQm (m²)
 * @property {number} raumkostensatzProQm (€/m²/Jahr)
 * @property {number} leistungKw (kW Leistungsaufnahme)
 * @property {number} strompreisKwh (€/kWh)
 * @property {number} instandhaltungProJahr (€/Jahr)
 * @property {number} werkzeugkostenProJahr (€/Jahr)
 */

/**
 * Berechnet den IHK Maschinenstundensatz
 * @param {MaschinenstundensatzInput} params
 */
export function calculateMaschinenstundensatz(params) {
  const {
    wiederbeschaffungswert = 120000,
    restwert = 0,
    nutzungsdauerJahre = 6,
    kalkZinssatzProzent = 8,
    jaehrlicheLaufstunden = 1600,
    raumflaecheQm = 25,
    raumkostensatzProQm = 120,
    leistungKw = 15,
    strompreisKwh = 0.35,
    instandhaltungProJahr = 3500,
    werkzeugkostenProJahr = 2000
  } = params;

  const laufstunden = Math.max(1, jaehrlicheLaufstunden);

  // 1. Kalkulatorische Abschreibung pro Jahr & Stunde
  const abschreibungProJahr = (wiederbeschaffungswert - restwert) / Math.max(1, nutzungsdauerJahre);
  const abschreibungProStunde = abschreibungProJahr / laufstunden;

  // 2. Kalkulatorische Zinsen (nach IHK Durchschnittsmethode: (WBW + RW) / 2 * Zinssatz)
  const gebundenesKapital = (wiederbeschaffungswert + restwert) / 2;
  const zinsenProJahr = (gebundenesKapital * kalkZinssatzProzent) / 100;
  const zinsenProStunde = zinsenProJahr / laufstunden;

  // 3. Raumkosten
  const raumkostenProJahr = raumflaecheQm * raumkostensatzProQm;
  const raumkostenProStunde = raumkostenProJahr / laufstunden;

  // 4. Energiekosten (pro Stunde direkt berechenbar)
  const energiekostenProStunde = leistungKw * strompreisKwh;
  const energiekostenProJahr = energiekostenProStunde * laufstunden;

  // 5. Instandhaltung & Werkzeuge
  const instandhaltungProStunde = instandhaltungProJahr / laufstunden;
  const werkzeugkostenProStunde = werkzeugkostenProJahr / laufstunden;

  // Gesamter Maschinenstundensatz
  const maschinenstundensatzGesamt = (
    abschreibungProStunde +
    zinsenProStunde +
    raumkostenProStunde +
    energiekostenProStunde +
    instandhaltungProStunde +
    werkzeugkostenProStunde
  );

  const maschinenkostenGesamtProJahr = maschinenstundensatzGesamt * laufstunden;

  const round2 = (/** @type {number} */ n) => Number(n.toFixed(2));

  return {
    abschreibungProJahr: round2(abschreibungProJahr),
    abschreibungProStunde: round2(abschreibungProStunde),
    zinsenProJahr: round2(zinsenProJahr),
    zinsenProStunde: round2(zinsenProStunde),
    raumkostenProJahr: round2(raumkostenProJahr),
    raumkostenProStunde: round2(raumkostenProStunde),
    energiekostenProJahr: round2(energiekostenProJahr),
    energiekostenProStunde: round2(energiekostenProStunde),
    instandhaltungProStunde: round2(instandhaltungProStunde),
    werkzeugkostenProStunde: round2(werkzeugkostenProStunde),
    maschinenstundensatzGesamt: round2(maschinenstundensatzGesamt),
    maschinenkostenGesamtProJahr: round2(maschinenkostenGesamtProJahr),
    jaehrlicheLaufstunden: laufstunden
  };
}
