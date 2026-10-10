// @ts-check
/**
 * IHK WISO Angebotsvergleich & Lieferantenkredit-Engine
 * Behandelt:
 * - Quantitativer Angebotsvergleich (LEP -> Rabatt -> ZEP -> Skonto -> BEP -> Bezugskosten -> Bezugspreis)
 * - Lieferantenkredit vs. Kontokorrentkredit (Effektiver Jahreszins, Zinsvergleich, Vorteil in €)
 * - Qualitativer Angebotsvergleich (Scoring-Matrix mit Nutzwertanalyse)
 * @module wisoAngebotsvergleichEngine
 */

/**
 * @typedef {{
 *   anbieterName: string;
 *   listeneinkaufspreis: number;
 *   rabattProzent: number;
 *   skontoProzent: number;
 *   bezugskosten: number;
 * }} AngebotEingabe
 *
 * @typedef {{
 *   anbieterName: string;
 *   listeneinkaufspreis: number;
 *   rabattBetrag: number;
 *   zieleinkaufspreis: number;
 *   skontoBetrag: number;
 *   bareinkaufspreis: number;
 *   bezugskosten: number;
 *   bezugspreis: number;
 * }} QuantitativesAngebotErgebnis
 */

/**
 * Rundet kaufmännisch auf 2 Nachkommastellen
 * @param {number} val
 * @returns {number}
 */
export function runden2(val) {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Berechnet das vollständige kaufmännische Kalkulationsschema des quantitativen Angebotsvergleichs.
 * @param {AngebotEingabe} eingabe
 * @returns {QuantitativesAngebotErgebnis}
 */
export function berechneQuantitativesAngebot(eingabe) {
  const lep = Math.max(0, eingabe.listeneinkaufspreis || 0);
  const rabattP = Math.max(0, eingabe.rabattProzent || 0);
  const skontoP = Math.max(0, eingabe.skontoProzent || 0);
  const bezugsk = Math.max(0, eingabe.bezugskosten || 0);

  const rabattBetrag = runden2(lep * (rabattP / 100));
  const zieleinkaufspreis = runden2(lep - rabattBetrag);

  const skontoBetrag = runden2(zieleinkaufspreis * (skontoP / 100));
  const bareinkaufspreis = runden2(zieleinkaufspreis - skontoBetrag);

  const bezugspreis = runden2(bareinkaufspreis + bezugsk);

  return {
    anbieterName: eingabe.anbieterName || 'Anbieter',
    listeneinkaufspreis: lep,
    rabattBetrag,
    zieleinkaufspreis,
    skontoBetrag,
    bareinkaufspreis,
    bezugskosten: bezugsk,
    bezugspreis
  };
}

/**
 * Berechnet den Vergleich mehrerer Anbieter im quantitativen Angebotsvergleich.
 * @param {AngebotEingabe[]} angebote
 * @returns {{ ergebnisse: QuantitativesAngebotErgebnis[]; besterAnbieter: string; einsparungGegenueberSchlechtestem: number }}
 */
export function vergleicheQuantitativeAngebote(angebote) {
  if (!Array.isArray(angebote) || angebote.length === 0) {
    return { ergebnisse: [], besterAnbieter: '', einsparungGegenueberSchlechtestem: 0 };
  }

  const ergebnisse = angebote.map(berechneQuantitativesAngebot);
  const sortiert = [...ergebnisse].sort((a, b) => a.bezugspreis - b.bezugspreis);

  const bester = sortiert[0];
  const schlechtester = sortiert[sortiert.length - 1];
  const einsparung = runden2(schlechtester.bezugspreis - bester.bezugspreis);

  return {
    ergebnisse,
    besterAnbieter: bester.anbieterName,
    einsparungGegenueberSchlechtestem: einsparung
  };
}

/**
 * Berechnet den effektiven Jahreszins des Lieferantenkredits und den Zinsgewinn bei Inanspruchnahme eines Bankkredits.
 * IHK-Standard-Formel:
 * p_eff = (Skontosatz * 360) / (Zahlungsziel - Skontofrist)
 *
 * @param {{
 *   rechnungsbetrag: number; // Zieleinkaufspreis
 *   skontoProzent: number;   // z.B. 2 oder 3 %
 *   skontoTage: number;      // z.B. 10 oder 14 Tage
 *   zielTage: number;        // z.B. 30 Tage
 *   kontokorrentZinsProzent: number; // z.B. 10.5 %
 * }} params
 * @returns {{
 *   skontoBetrag: number;
 *   ueberweisungsbetragMitSkonto: number;
 *   kreditdauerTage: number;
 *   effektiverLieferantenzins: number;
 *   bankkreditzinsen: number;
 *   zinsgewinn: number;
 *   lohntSichBankkredit: boolean;
 *   begruendung: string;
 * }}
 */
export function berechneLieferantenkreditVergleich(params) {
  const betrag = Math.max(0, params.rechnungsbetrag || 0);
  const skontoP = Math.max(0, params.skontoProzent || 0);
  const skontoTage = Math.max(0, params.skontoTage || 0);
  const zielTage = Math.max(skontoTage, params.zielTage || skontoTage);
  const bankzinsP = Math.max(0, params.kontokorrentZinsProzent || 0);

  const skontoBetrag = runden2(betrag * (skontoP / 100));
  const ueberweisungsbetragMitSkonto = runden2(betrag - skontoBetrag);
  const kreditdauerTage = Math.max(0, zielTage - skontoTage);

  let effektiverLieferantenzins = 0;
  if (kreditdauerTage > 0 && skontoP > 0) {
    effektiverLieferantenzins = runden2((skontoP * 360) / kreditdauerTage);
  }

  let bankkreditzinsen = 0;
  if (kreditdauerTage > 0 && bankzinsP > 0) {
    // Bankzinsen = K * (p / 100) * (t / 360)
    bankkreditzinsen = runden2(ueberweisungsbetragMitSkonto * (bankzinsP / 100) * (kreditdauerTage / 360));
  }

  const zinsgewinn = runden2(skontoBetrag - bankkreditzinsen);
  const lohntSichBankkredit = zinsgewinn > 0 && effektiverLieferantenzins > bankzinsP;

  let begruendung = '';
  if (kreditdauerTage === 0 || skontoP === 0) {
    begruendung = 'Kein Skontoabzug oder keine Kreditperiode vorhanden.';
  } else if (lohntSichBankkredit) {
    begruendung = `Die Skontoausnutzung mittels Kontokorrentkredit lohnt sich: Der effektive Lieferantenzins beträgt ${effektiverLieferantenzins.toFixed(2)}% p.a. und liegt damit deutlich über dem Bankzinssatz von ${bankzinsP.toFixed(2)}% p.a. Der finanzielle Vorteil beträgt ${zinsgewinn.toFixed(2)} €.`;
  } else {
    begruendung = `Die Aufnahme des Bankkredits lohnt sich nicht: Der Bankkreditzins übersteigt den Skontovorteil um ${Math.abs(zinsgewinn).toFixed(2)} €.`;
  }

  return {
    skontoBetrag,
    ueberweisungsbetragMitSkonto,
    kreditdauerTage,
    effektiverLieferantenzins,
    bankkreditzinsen,
    zinsgewinn,
    lohntSichBankkredit,
    begruendung
  };
}

/**
 * Berechnet den qualitativen Angebotsvergleich (Scoring-Modell / Nutzwertanalyse).
 * @param {{
 *   kriterien: { name: string; gewichtungProzent: number }[];
 *   bewertungen: Record<string, Record<string, number>>; // anbieterName -> Kriteriumsname -> Punkte (1-10)
 * }} params
 * @returns {{
 *   rangliste: { anbieterName: string; nutzwert: number; rang: number }[];
 *   besterAnbieter: string;
 * }}
 */
export function berechneQualitativenAngebotsvergleich({ kriterien, bewertungen }) {
  const anbieterNamen = Object.keys(bewertungen);
  if (anbieterNamen.length === 0 || kriterien.length === 0) {
    return { rangliste: [], besterAnbieter: '' };
  }

  const rangliste = anbieterNamen.map((name) => {
    const scores = bewertungen[name] || {};
    let summe = 0;
    for (const krit of kriterien) {
      const p = scores[krit.name] ?? 0;
      summe += p * (krit.gewichtungProzent / 100);
    }
    return { anbieterName: name, nutzwert: runden2(summe), rang: 0 };
  });

  rangliste.sort((a, b) => b.nutzwert - a.nutzwert);
  rangliste.forEach((entry, idx) => {
    entry.rang = idx + 1;
  });

  return {
    rangliste,
    besterAnbieter: rangliste[0]?.anbieterName || ''
  };
}

/**
 * IHK-Prüfungsfragen für den Drill-Modus
 */
export const WISO_ANGEBOTSVERGLEICH_DRILL = [
  {
    id: 'ang_1',
    frage: 'Ein Lieferant gewährt 2% Skonto bei Zahlung innerhalb von 10 Tagen oder Zahlung netto Kasse innerhalb von 30 Tagen. Wie hoch ist der effektive Jahreszinssatz des Lieferantenkredits nach IHK-Standard?',
    optionen: [
      '24,00% p.a.',
      '36,00% p.a.',
      '18,00% p.a.',
      '7,20% p.a.'
    ],
    korrektIndex: 1,
    erklaerung: 'Formel: p_eff = (Skontosatz * 360) / (Zahlungsziel - Skontofrist) = (2 * 360) / (30 - 10) = 720 / 20 = 36,00% p.a.'
  },
  {
    id: 'ang_2',
    frage: 'In welcher Reihenfolge erfolgt der quantitative Angebotsvergleich korrekt zur Ermittlung des Bezugspreises?',
    optionen: [
      'Listeneinkaufspreis - Skonto = Zieleinkaufspreis - Rabatt = Bareinkaufspreis + Bezugskosten',
      'Listeneinkaufspreis - Rabatt = Zieleinkaufspreis - Skonto = Bareinkaufspreis + Bezugskosten',
      'Listeneinkaufspreis + Bezugskosten - Rabatt = Zieleinkaufspreis - Skonto',
      'Listeneinkaufspreis - Rabatt = Bareinkaufspreis - Skonto = Zieleinkaufspreis + Bezugskosten'
    ],
    korrektIndex: 1,
    erklaerung: 'Kalkulationsschema: Listeneinkaufspreis - Lieferantenrabatt = Zieleinkaufspreis; Zieleinkaufspreis - Lieferantenskonto = Bareinkaufspreis; Bareinkaufspreis + Bezugskosten = Bezugspreis (Einstandspreis).'
  },
  {
    id: 'ang_3',
    frage: 'Wann ist die Inanspruchnahme eines Kontokorrentkredits zur Ausnutzung von Skonto wirtschaftlich sinnvoll?',
    optionen: [
      'Wenn der Kontokorrentzinssatz höher ist als der effektive Skontozinssatz.',
      'Wenn der effektive Jahreszins des Lieferantenkredits höher ist als der Kontokorrentzinssatz.',
      'Nur wenn der Lieferant zusätzlich einen Mengenrabatt gewährt.',
      'Niemals, da Kreditzinsen grundsätzlich den Gewinn mindern.'
    ],
    korrektIndex: 1,
    erklaerung: 'Ein Bankkredit zur Skontoausnutzung lohnt sich immer dann, wenn der effektive Jahreszins des Lieferantenkredits über dem Sollzinssatz der Bank liegt.'
  },
  {
    id: 'ang_4',
    frage: 'Welche Kosten zählen im quantitativen Angebotsvergleich zu den Bezugskosten?',
    optionen: [
      'Lieferantenrabatt und Skontoabzüge',
      'Fracht, Verpackung, Transportversicherung und Rollgeld',
      'Personalkosten im Einkauf und Lagerhaltungskosten',
      'Mahngebühren und Verzugszinsen'
    ],
    korrektIndex: 1,
    erklaerung: 'Bezugskosten sind direkte Nebenkosten der Warenbeschaffung wie Fracht, Rollgeld, Porto, Verpackungsmaterial und Transportversicherung.'
  }
];
