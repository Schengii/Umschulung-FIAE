// @ts-check
/**
 * IHK WISO Betriebsabrechnungsbogen (BAB) Engine
 * Kostenstellenrechnung: Kostenarten → Kostenstellen → Kostenträger
 * @module wisoBabEngine
 */

/**
 * @typedef {{ name: string; primärkostensatz: number }} Kostenstelle
 * @typedef {{ name: string; menge: number; fertigungszeit: number }} Kostentraeger
 * @typedef {{ name: string; gesamt: number; verteilschluessel: Record<string, number> }} Kostenart
 * @typedef {{ kostenstelle: string; mgk: number; fgk: number; vwgk: number; vtrgk: number }} Zuschlagsaetze
 */

/** Standardkostenstellen im BAB */
export const KOSTENSTELLEN = ['Material', 'Fertigung', 'Verwaltung', 'Vertrieb'];

/**
 * Verteilt eine Kostenart anhand eines Verteilungsschlüssels auf Kostenstellen.
 * @param {number} gesamtkosten
 * @param {Record<string, number>} schluessel - { Kostenstelle: Anteil (0–1) }
 * @returns {Record<string, number>} - { Kostenstelle: Betrag }
 */
export function verteileKosten(gesamtkosten, schluessel) {
  const summe = Object.values(schluessel).reduce((s, v) => s + v, 0);
  if (Math.abs(summe - 1) > 0.0001) {
    throw new Error(`Verteilschlüssel muss in Summe 1 ergeben (aktuell: ${summe.toFixed(4)})`);
  }
  return Object.fromEntries(
    Object.entries(schluessel).map(([k, v]) => [k, Math.round(gesamtkosten * v * 100) / 100])
  );
}

/**
 * Berechnet die Sekundärumlage einer Hilfskostenstelle auf Hauptkostenstellen.
 * @param {number} hilfskosten
 * @param {Record<string, number>} umlageschluessel
 * @returns {Record<string, number>}
 */
export function berechneHilfskostenumlage(hilfskosten, umlageschluessel) {
  return verteileKosten(hilfskosten, umlageschluessel);
}

/**
 * Berechnet den BAB und gibt Zuschlagssätze zurück.
 * @param {{
 *   materialeinzelkosten: number;
 *   fertigungseinzelkosten: number;
 *   gemeinkosten: { name: string; gesamt: number; schluessel: Record<string, number> }[];
 *   hilfskostenstelle?: { kosten: number; umlage: Record<string, number> };
 * }} params
 * @returns {{
 *   bab: Record<string, Record<string, number>>;
 *   kostenstellenSummen: Record<string, number>;
 *   zuschlagsaetze: { mgkSatz: number; fgkSatz: number; vwgkSatz: number; vtrgkSatz: number };
 *   herstellkosten: number;
 *   selbstkosten: number;
 * }}
 */
export function berechneBab({
  materialeinzelkosten,
  fertigungseinzelkosten,
  gemeinkosten,
  hilfskostenstelle,
}) {
  /** @type {Record<string, Record<string, number>>} */
  const bab = {};

  // Primärkosten verteilen
  for (const art of gemeinkosten) {
    bab[art.name] = verteileKosten(art.gesamt, art.schluessel);
  }

  // Hilfskostenstellen-Umlage
  if (hilfskostenstelle) {
    const umlage = berechneHilfskostenumlage(hilfskostenstelle.kosten, hilfskostenstelle.umlage);
    bab['Hilfskostenstellen-Umlage'] = umlage;
  }

  // Kostenstellensummen
  const kostenstellenSummen = Object.fromEntries(KOSTENSTELLEN.map((ks) => [ks, 0]));
  for (const art of Object.values(bab)) {
    for (const ks of KOSTENSTELLEN) {
      kostenstellenSummen[ks] = (kostenstellenSummen[ks] || 0) + (art[ks] || 0);
    }
  }

  // Zuschlagssätze berechnen
  const mgkSatz = materialeinzelkosten > 0 ? (kostenstellenSummen['Material'] / materialeinzelkosten) * 100 : 0;
  const fgkSatz = fertigungseinzelkosten > 0 ? (kostenstellenSummen['Fertigung'] / fertigungseinzelkosten) * 100 : 0;

  // Herstellkosten = MEK + MGK + FEK + FGK
  const herstellkosten =
    materialeinzelkosten +
    kostenstellenSummen['Material'] +
    fertigungseinzelkosten +
    kostenstellenSummen['Fertigung'];

  const vwgkSatz = herstellkosten > 0 ? (kostenstellenSummen['Verwaltung'] / herstellkosten) * 100 : 0;
  const vtrgkSatz = herstellkosten > 0 ? (kostenstellenSummen['Vertrieb'] / herstellkosten) * 100 : 0;

  // Selbstkosten = HK + VwGK + VtrGK
  const selbstkosten =
    herstellkosten +
    kostenstellenSummen['Verwaltung'] +
    kostenstellenSummen['Vertrieb'];

  return {
    bab,
    kostenstellenSummen,
    zuschlagsaetze: {
      mgkSatz: Math.round(mgkSatz * 100) / 100,
      fgkSatz: Math.round(fgkSatz * 100) / 100,
      vwgkSatz: Math.round(vwgkSatz * 100) / 100,
      vtrgkSatz: Math.round(vtrgkSatz * 100) / 100,
    },
    herstellkosten: Math.round(herstellkosten * 100) / 100,
    selbstkosten: Math.round(selbstkosten * 100) / 100,
  };
}

/**
 * Berechnet den Selbstkostenpreis per Zuschlagskalkulation für ein Produkt.
 * @param {{
 *   mek: number; fek: number;
 *   mgkSatz: number; fgkSatz: number; vwgkSatz: number; vtrgkSatz: number;
 *   gewinnzuschlag?: number;
 * }} params
 * @returns {{
 *   mek: number; mgk: number; fek: number; fgk: number;
 *   herstellkosten: number; vwgk: number; vtrgk: number;
 *   selbstkosten: number; gewinn: number; angebotspreis: number;
 * }}
 */
export function berechneZuschlagskalkulation({ mek, fek, mgkSatz, fgkSatz, vwgkSatz, vtrgkSatz, gewinnzuschlag = 0 }) {
  const mgk = (mek * mgkSatz) / 100;
  const fgk = (fek * fgkSatz) / 100;
  const herstellkosten = mek + mgk + fek + fgk;
  const vwgk = (herstellkosten * vwgkSatz) / 100;
  const vtrgk = (herstellkosten * vtrgkSatz) / 100;
  const selbstkosten = herstellkosten + vwgk + vtrgk;
  const gewinn = (selbstkosten * gewinnzuschlag) / 100;
  const angebotspreis = selbstkosten + gewinn;

  return {
    mek: Math.round(mek * 100) / 100,
    mgk: Math.round(mgk * 100) / 100,
    fek: Math.round(fek * 100) / 100,
    fgk: Math.round(fgk * 100) / 100,
    herstellkosten: Math.round(herstellkosten * 100) / 100,
    vwgk: Math.round(vwgk * 100) / 100,
    vtrgk: Math.round(vtrgk * 100) / 100,
    selbstkosten: Math.round(selbstkosten * 100) / 100,
    gewinn: Math.round(gewinn * 100) / 100,
    angebotspreis: Math.round(angebotspreis * 100) / 100,
  };
}

/** Vorgefertigtes IHK-Beispiel für den BAB */
export const IHK_BAB_BEISPIEL = {
  materialeinzelkosten: 80000,
  fertigungseinzelkosten: 120000,
  gemeinkosten: [
    {
      name: 'Hilfslöhne',
      gesamt: 20000,
      schluessel: { Material: 0.3, Fertigung: 0.5, Verwaltung: 0.1, Vertrieb: 0.1 },
    },
    {
      name: 'Gehälter',
      gesamt: 40000,
      schluessel: { Material: 0.1, Fertigung: 0.2, Verwaltung: 0.5, Vertrieb: 0.2 },
    },
    {
      name: 'Miete',
      gesamt: 12000,
      schluessel: { Material: 0.2, Fertigung: 0.4, Verwaltung: 0.2, Vertrieb: 0.2 },
    },
    {
      name: 'Abschreibungen',
      gesamt: 18000,
      schluessel: { Material: 0.1, Fertigung: 0.6, Verwaltung: 0.2, Vertrieb: 0.1 },
    },
    {
      name: 'Sonstige Kosten',
      gesamt: 10000,
      schluessel: { Material: 0.25, Fertigung: 0.25, Verwaltung: 0.25, Vertrieb: 0.25 },
    },
  ],
};

/** Erläuterungen zu den Zuschlagssätzen */
export const ZUSCHLAGSAETZE_ERLAEUTERUNG = {
  mgkSatz: 'Materialgemeinkosten-Zuschlag (MGK%) = Materialgemeinkosten / Materialeinzelkosten × 100',
  fgkSatz: 'Fertigungsgemeinkosten-Zuschlag (FGK%) = Fertigungsgemeinkosten / Fertigungseinzelkosten × 100',
  vwgkSatz: 'Verwaltungsgemeinkosten-Zuschlag (VwGK%) = Verwaltungsgemeinkosten / Herstellkosten × 100',
  vtrgkSatz: 'Vertriebsgemeinkosten-Zuschlag (VtrGK%) = Vertriebsgemeinkosten / Herstellkosten × 100',
};

/**
 * @typedef {{
 *   kostenstelle: string;
 *   istGemeinkosten: number;
 *   normalZuschlagssatz: number;
 *   bezugsbasis: number;
 *   normalGemeinkosten: number;
 *   differenz: number;
 *   status: 'Überdeckung' | 'Unterdeckung' | 'Ausgeglichen';
 * }} Bab2KostenstellenAuswertung
 */

/**
 * Berechnet BAB II Kostenüberdeckung / -unterdeckung (Normalkosten vs. Istkosten).
 * Formel: Normal-Gemeinkosten = Bezugsbasis * (Normal-Zuschlagssatz / 100)
 * Kostenüberdeckung (positiv) = Normal-GK > Ist-GK
 * Kostenunterdeckung (negativ) = Normal-GK < Ist-GK
 *
 * @param {{
 *   istKostenstellenSummen: Record<string, number>;
 *   materialeinzelkosten: number;
 *   fertigungseinzelkosten: number;
 *   herstellkosten: number;
 *   normalZuschlagssaetze: { mgkSatz: number; fgkSatz: number; vwgkSatz: number; vtrgkSatz: number };
 * }} params
 * @returns {{
 *   auswertung: Bab2KostenstellenAuswertung[];
 *   gesamtDifferenz: number;
 *   gesamtStatus: 'Überdeckung' | 'Unterdeckung' | 'Ausgeglichen';
 * }}
 */
export function berechneBab2Kostenueberdeckung({
  istKostenstellenSummen,
  materialeinzelkosten,
  fertigungseinzelkosten,
  herstellkosten,
  normalZuschlagssaetze,
}) {
  /** @type {Array<{ ks: string; basis: number; normalSatz: number }>} */
  const konfiguration = [
    { ks: 'Material', basis: materialeinzelkosten, normalSatz: normalZuschlagssaetze.mgkSatz },
    { ks: 'Fertigung', basis: fertigungseinzelkosten, normalSatz: normalZuschlagssaetze.fgkSatz },
    { ks: 'Verwaltung', basis: herstellkosten, normalSatz: normalZuschlagssaetze.vwgkSatz },
    { ks: 'Vertrieb', basis: herstellkosten, normalSatz: normalZuschlagssaetze.vtrgkSatz },
  ];

  /** @type {Bab2KostenstellenAuswertung[]} */
  const auswertung = konfiguration.map(({ ks, basis, normalSatz }) => {
    const istGemeinkosten = istKostenstellenSummen[ks] || 0;
    const normalGemeinkosten = Math.round(((basis * normalSatz) / 100) * 100) / 100;
    const differenz = Math.round((normalGemeinkosten - istGemeinkosten) * 100) / 100;
    
    /** @type {'Überdeckung' | 'Unterdeckung' | 'Ausgeglichen'} */
    let status = 'Ausgeglichen';
    if (differenz > 0) status = 'Überdeckung';
    else if (differenz < 0) status = 'Unterdeckung';

    return {
      kostenstelle: ks,
      istGemeinkosten,
      normalZuschlagssatz: normalSatz,
      bezugsbasis: basis,
      normalGemeinkosten,
      differenz,
      status,
    };
  });

  const gesamtDifferenz = Math.round(auswertung.reduce((sum, item) => sum + item.differenz, 0) * 100) / 100;
  /** @type {'Überdeckung' | 'Unterdeckung' | 'Ausgeglichen'} */
  let gesamtStatus = 'Ausgeglichen';
  if (gesamtDifferenz > 0) gesamtStatus = 'Überdeckung';
  else if (gesamtDifferenz < 0) gesamtStatus = 'Unterdeckung';

  return {
    auswertung,
    gesamtDifferenz,
    gesamtStatus,
  };
}

/** Vordefinierte IHK Normal-Zuschlagssätze für Übungsaufgaben */
export const IHK_NORMAL_ZUSCHLAGSSAETZE = {
  mgkSatz: 18.0, // Normal 18%
  fgkSatz: 35.0, // Normal 35%
  vwgkSatz: 12.0, // Normal 12%
  vtrgkSatz: 8.0,  // Normal 8%
};

/** IHK WISO BAB-Prüfungs-Drill Multiple-Choice-Fragen */
export const IHK_BAB_DRILL_QUESTIONS = [
  {
    id: 'bab_q1',
    frage: 'Welche Bezugsgröße dient im BAB standardmäßig zur Berechnung des Materialgemeinkostenzuschlagssatzes (MGK%)?',
    optionen: [
      'Fertigungseinzelkosten (FEK)',
      'Materialeinzelkosten (MEK)',
      'Herstellkosten (HK)',
      'Selbstkosten (SK)'
    ],
    richtigIndex: 1,
    erklaerung: 'Der MGK-Zuschlagssatz bezieht sich immer prozentual auf die Materialeinzelkosten (MEK): MGK% = (Materialgemeinkosten / MEK) * 100.'
  },
  {
    id: 'bab_q2',
    frage: 'Was bedeutet eine Kostenüberdeckung im BAB II (Normalkostenrechnung)?',
    optionen: [
      'Die tatsächlichen Ist-Kosten waren höher als die vorkalkulierten Normal-Kosten (Verlust).',
      'Die verrechneten Normal-Gemeinkosten übersteigen die tatsächlich angefallenen Ist-Gemeinkosten (Kostenersparnis/Gewinn).',
      'Der Vertriebsgemeinkostenzuschlag wurde doppelt berechnet.',
      'Die Herstellkosten sind geringer als die Materialeinzelkosten.'
    ],
    richtigIndex: 1,
    erklaerung: 'Eine Kostenüberdeckung liegt vor, wenn die auf Normalbasis verrechneten Gemeinkosten größer sind als die tatsächlichen Istkosten (Normal-GK > Ist-GK). Es wurde vorsichtiger bzw. höher kalkuliert als verbraucht.'
  },
  {
    id: 'bab_q3',
    frage: 'Auf welche gemeinsame Bezugsbasis beziehen sich Verwaltungsgemeinkosten (VwGK) und Vertriebsgemeinkosten (VtrGK)?',
    optionen: [
      'Materialeinzelkosten + Fertigungseinzelkosten',
      'Herstellkosten der Erzeugung (MEK + MGK + FEK + FGK)',
      'Selbstkosten des Umsatzes',
      'Nettoverkaufserlöse'
    ],
    richtigIndex: 1,
    erklaerung: 'Verwaltung und Vertrieb beziehen sich im BAB stets auf die Herstellkosten: VwGK% = (VwGK / HK) * 100 und VtrGK% = (VtrGK / HK) * 100.'
  }
];

