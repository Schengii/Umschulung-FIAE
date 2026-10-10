// @ts-check
/**
 * @file wisoPersonalPlanungEngine.js
 * IHK WISO Personalbedarfsermittlung & HR-Kennzahlen-Studio
 * (Brutto-/Netto-Personalbedarf, Fluktuationsrate ZVEI & BDA, Krankenquote)
 */

/**
 * Berechnet den Brutto- und Netto-Personalbedarf nach IHK-Standard
 * @param {{
 *   einsatzbedarf: number, // z.B. 20 Vollzeitkräfte
 *   reservebedarfProzent: number, // z.B. 15% für Urlaub/Krankheit
 *   aktuellerBestand: number, // z.B. 22 Mitarbeiter
 *   feststehendeAbgaenge: number, // Rente, Kündigungen, Ausbildungsende (z.B. 3)
 *   feststehendeZugaenge: number // Übernahmen, bereits eingestellte Personen (z.B. 1)
 * }} data
 * @returns {{
 *   reservebedarf: number,
 *   bruttoPersonalbedarf: number,
 *   zukuenftigerPersonalbestand: number,
 *   nettoPersonalbedarf: number,
 *   actionType: 'Einstellung' | 'Freisetzung' | 'Ausgeglichen'
 * }}
 */
export function calculatePersonalbedarf(data) {
  const {
    einsatzbedarf,
    reservebedarfProzent,
    aktuellerBestand,
    feststehendeAbgaenge,
    feststehendeZugaenge
  } = data;

  // Reservebedarf = Einsatzbedarf * (Reserve % / 100)
  const reservebedarf = Math.round(einsatzbedarf * (reservebedarfProzent / 100));

  // Brutto-Personalbedarf = Einsatzbedarf + Reservebedarf
  const bruttoPersonalbedarf = einsatzbedarf + reservebedarf;

  // Zukünftiger Personalbestand = Aktueller Bestand - Abgänge + Zugänge
  const zukuenftigerPersonalbestand = aktuellerBestand - feststehendeAbgaenge + feststehendeZugaenge;

  // Netto-Personalbedarf = Brutto-Personalbedarf - Zukünftiger Bestand
  const nettoPersonalbedarf = bruttoPersonalbedarf - zukuenftigerPersonalbestand;

  /** @type {'Einstellung' | 'Freisetzung' | 'Ausgeglichen'} */
  let actionType = 'Ausgeglichen';
  if (nettoPersonalbedarf > 0) {
    actionType = 'Einstellung'; // Personalunterdeckung
  } else if (nettoPersonalbedarf < 0) {
    actionType = 'Freisetzung'; // Personalüberdeckung
  }

  return {
    reservebedarf,
    bruttoPersonalbedarf,
    zukuenftigerPersonalbestand,
    nettoPersonalbedarf,
    actionType
  };
}

/**
 * Berechnet Fluktuationsrate nach ZVEI- und BDA-Formel sowie Krankenquote
 * @param {{
 *   abgaenge: number,
 *   anfangsbestand: number,
 *   endbestand: number,
 *   zugaenge: number,
 *   krankheitstageGesamt: number,
 *   sollArbeitstageGesamt: number
 * }} data
 * @returns {{
 *   durchschnittsbestand: number,
 *   fluktuationZveiPercent: number,
 *   fluktuationBdaPercent: number,
 *   krankenquotePercent: number
 * }}
 */
export function calculateHrMetrics(data) {
  const {
    abgaenge,
    anfangsbestand,
    endbestand,
    zugaenge,
    krankheitstageGesamt,
    sollArbeitstageGesamt
  } = data;

  // Durchschnittlicher Personalbestand = (Anfangsbestand + Endbestand) / 2
  const durchschnittsbestand = (anfangsbestand + endbestand) / 2 || 1;

  // ZVEI-Formel: (Abgänge / Durchschnittsbestand) * 100
  const fluktuationZveiPercent = Number(((abgaenge / durchschnittsbestand) * 100).toFixed(2));

  // BDA-Formel: (Abgänge / (Anfangsbestand + Zugänge)) * 100
  const bdaBasis = (anfangsbestand + zugaenge) || 1;
  const fluktuationBdaPercent = Number(((abgaenge / bdaBasis) * 100).toFixed(2));

  // Krankenquote: (Krankheitstage / Soll-Arbeitstage) * 100
  const krankenquotePercent = sollArbeitstageGesamt > 0
    ? Number(((krankheitstageGesamt / sollArbeitstageGesamt) * 100).toFixed(2))
    : 0;

  return {
    durchschnittsbestand,
    fluktuationZveiPercent,
    fluktuationBdaPercent,
    krankenquotePercent
  };
}
