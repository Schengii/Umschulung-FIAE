/**
 * IHK WISO Skonto-Effektivzins, Verzugszinsen & Mahnwesen Engine
 * Calculates effective annual interest rates for cash discounts,
 * BGB § 288 default interest & statutory compensation, and categorizes dunning stages.
 */

export function calculateSkontoEffektivzins({
  skontoPercent = 3.0,
  zahlungszielTage = 30,
  skontofristTage = 10
}) {
  const skonto = Math.max(0.1, skontoPercent);
  const kreditTage = Math.max(1, zahlungszielTage - skontofristTage);
  const effektivzins = (skonto * 360) / kreditTage;

  return {
    skontoPercent: skonto,
    zahlungszielTage,
    skontofristTage,
    kreditTage,
    effektivzinsPercent: parseFloat(effektivzins.toFixed(2)),
    recommendation: effektivzins > 10
      ? `Skontonutzung dringend empfohlen! Der effektive Jahreszins von ${effektivzins.toFixed(1)}% übersteigt jeden Kontokorrentkredit bei weitem.`
      : 'Skontonutzung wirtschaftlich neutral.'
  };
}

export function calculateVerzugszinsen({
  rechnungsbetrag = 10000,
  verzugstage = 45,
  isB2B = true,
  basiszinssatzPercent = 3.62
}) {
  const betrag = Math.max(10, rechnungsbetrag);
  const tage = Math.max(1, verzugstage);
  const aufschlag = isB2B ? 9.0 : 5.0;
  const verzugszinsSatz = basiszinssatzPercent + aufschlag;

  // German statutory interest formula (act/360 or 30/360)
  const zinsen = (betrag * verzugszinsSatz * tage) / (360 * 100);
  const mahnpauschale = isB2B ? 40.0 : 0.0; // § 288 Abs. 5 BGB
  const gesamtForderung = betrag + zinsen + mahnpauschale;

  return {
    rechnungsbetrag: betrag,
    verzugstage: tage,
    isB2B,
    basiszinssatzPercent,
    aufschlagPercent: aufschlag,
    verzugszinsSatzPercent: parseFloat(verzugszinsSatz.toFixed(2)),
    zinsenBetrag: parseFloat(zinsen.toFixed(2)),
    mahnpauschaleBetrag: mahnpauschale,
    gesamtForderung: parseFloat(gesamtForderung.toFixed(2))
  };
}

export const IHK_DUNNING_STAGES = [
  {
    stage: '1. Zahlungserinnerung / 1. Mahnung',
    type: 'Kaufmännisch (Außergerichtlich)',
    cost: '0 - 2.50 €',
    description: 'Höfliche Erinnerung an die fällige Rechnung, setzt den Schuldner formal in Verzug (sofern nicht vorher terminlich bestimmt).'
  },
  {
    stage: '2. Mahnung mit Fristsetzung & Verzugszins',
    type: 'Kaufmännisch (Außergerichtlich)',
    cost: '2.50 - 5.00 €',
    description: 'Bestimmte Nachfrist (z. B. 7 Tage) mit Ankündigung von Verzugszinsen und Rechtsmitteln.'
  },
  {
    stage: 'Gerichtlicher Mahnbescheid',
    type: 'Gerichtlich (§ 688 ZPO)',
    cost: 'Gerichtsgebühren nach GKG',
    description: 'Antrag beim zentralen Mahngericht. Schuldner hat 2 Wochen Widerspruchsfrist.'
  },
  {
    stage: 'Vollstreckungsbescheid & Zwangsvollstreckung',
    type: 'Gerichtlich / Vollstreckungstitel',
    cost: 'Gerichtsvollzieher-Kosten',
    description: 'Vollstreckbarer Titel (30 Jahre gültig) zur Pfändung von Konten oder Sachwerten durch den Gerichtsvollzieher.'
  }
];
