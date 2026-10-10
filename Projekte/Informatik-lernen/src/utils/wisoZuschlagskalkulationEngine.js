// @ts-check
/**
 * IHK Fertigungs- & Zuschlagskalkulation Engine
 * Berechnet Material- und Fertigungsgemeinkostenzuschläge, Herstellkosten,
 * Verwaltungs- & Vertriebszuschläge, Selbstkosten und den Barverkaufspreis.
 */

/**
 * @typedef {Object} ZuschlagskalkulationInput
 * @property {number} fertigungsmaterial (FM)
 * @property {number} materialgemeinkostensatzProzent (MGKZ %)
 * @property {number} fertigungslohn (FL)
 * @property {number} fertigungsgemeinkostensatzProzent (FGKZ %)
 * @property {number} sondereinzelkostenFertigung (SEKF)
 * @property {number} verwaltungsgemeinkostensatzProzent (VwGKZ %)
 * @property {number} vertriebsgemeinkostensatzProzent (VtGKZ %)
 * @property {number} sondereinzelkostenVertrieb (SEKV)
 * @property {number} gewinnzuschlagProzent (Gewinn %)
 * @property {number} kundenskontoProzent (Skonto %)
 * @property {number} kundenrabattProzent (Rabatt %)
 * @property {number} umsatzsteuerProzent (USt %)
 */

/**
 * Vollständige Zuschlagskalkulation nach IHK Standard
 * @param {ZuschlagskalkulationInput} params
 */
export function calculateZuschlagskalkulation(params) {
  const {
    fertigungsmaterial = 5000,
    materialgemeinkostensatzProzent = 10,
    fertigungslohn = 3000,
    fertigungsgemeinkostensatzProzent = 120,
    sondereinzelkostenFertigung = 200,
    verwaltungsgemeinkostensatzProzent = 8,
    vertriebsgemeinkostensatzProzent = 6,
    sondereinzelkostenVertrieb = 150,
    gewinnzuschlagProzent = 15,
    kundenskontoProzent = 2,
    kundenrabattProzent = 5,
    umsatzsteuerProzent = 19
  } = params;

  // 1. Materialbereich
  const materialgemeinkosten = (fertigungsmaterial * materialgemeinkostensatzProzent) / 100;
  const materialkosten = fertigungsmaterial + materialgemeinkosten;

  // 2. Fertigungsbereich
  const fertigungsgemeinkosten = (fertigungslohn * fertigungsgemeinkostensatzProzent) / 100;
  const fertigungskosten = fertigungslohn + fertigungsgemeinkosten + sondereinzelkostenFertigung;

  // 3. Herstellkosten des Umsatzes (HK)
  const herstellkosten = materialkosten + fertigungskosten;

  // 4. Verwaltung & Vertrieb (bezogen auf Herstellkosten)
  const verwaltungsgemeinkosten = (herstellkosten * verwaltungsgemeinkostensatzProzent) / 100;
  const vertriebsgemeinkosten = (herstellkosten * vertriebsgemeinkostensatzProzent) / 100;

  // 5. Selbstkosten (SK)
  const selbstkosten = herstellkosten + verwaltungsgemeinkosten + vertriebsgemeinkosten + sondereinzelkostenVertrieb;

  // 6. Gewinn & Barverkaufspreis
  const gewinn = (selbstkosten * gewinnzuschlagProzent) / 100;
  const barverkaufspreis = selbstkosten + gewinn;

  // 7. Zielverkaufspreis (im Hundert: Skonto ist im Zielverkaufspreis enthalten)
  const zielverkaufspreis = kundenskontoProzent >= 100 
    ? barverkaufspreis 
    : barverkaufspreis / (1 - kundenskontoProzent / 100);
  const skontoBetrag = zielverkaufspreis - barverkaufspreis;

  // 8. Nettoverkaufspreis (im Hundert: Rabatt ist im Nettoverkaufspreis enthalten)
  const nettoverkaufspreis = kundenrabattProzent >= 100
    ? zielverkaufspreis
    : zielverkaufspreis / (1 - kundenrabattProzent / 100);
  const rabattBetrag = nettoverkaufspreis - zielverkaufspreis;

  // 9. Bruttoverkaufspreis
  const umsatzsteuer = (nettoverkaufspreis * umsatzsteuerProzent) / 100;
  const bruttoverkaufspreis = nettoverkaufspreis + umsatzsteuer;

  const round2 = (/** @type {number} */ n) => Number(n.toFixed(2));

  return {
    fertigungsmaterial: round2(fertigungsmaterial),
    materialgemeinkosten: round2(materialgemeinkosten),
    materialkosten: round2(materialkosten),
    fertigungslohn: round2(fertigungslohn),
    fertigungsgemeinkosten: round2(fertigungsgemeinkosten),
    sondereinzelkostenFertigung: round2(sondereinzelkostenFertigung),
    fertigungskosten: round2(fertigungskosten),
    herstellkosten: round2(herstellkosten),
    verwaltungsgemeinkosten: round2(verwaltungsgemeinkosten),
    vertriebsgemeinkosten: round2(vertriebsgemeinkosten),
    sondereinzelkostenVertrieb: round2(sondereinzelkostenVertrieb),
    selbstkosten: round2(selbstkosten),
    gewinn: round2(gewinn),
    barverkaufspreis: round2(barverkaufspreis),
    skontoBetrag: round2(skontoBetrag),
    zielverkaufspreis: round2(zielverkaufspreis),
    rabattBetrag: round2(rabattBetrag),
    nettoverkaufspreis: round2(nettoverkaufspreis),
    umsatzsteuer: round2(umsatzsteuer),
    bruttoverkaufspreis: round2(bruttoverkaufspreis)
  };
}
