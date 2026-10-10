// @ts-check
/**
 * IHK WISO Doppelte Buchführung Engine
 * T-Konten, Buchungssätze und Jahresabschluss nach SKR03 (vereinfacht)
 * @module wisoBookkeepingEngine
 */

/**
 * @typedef {'aktiv' | 'passiv' | 'aufwand' | 'ertrag'} KontoTyp
 * @typedef {{id: string, name: string, typ: KontoTyp, anfangsbestand?: number}} Konto
 * @typedef {{soll: string, haben: string, betrag: number, beschreibung: string}} Buchungssatz
 * @typedef {{kontoid: string, seite: 'soll' | 'haben', betrag: number, beschreibung: string}} TKontoBuchung
 */

/** @type {Konto[]} Vereinfachter SKR03-Kontenrahmen (IHK-relevant) */
export const KONTENRAHMEN = [
  // Aktivkonten (Bilanz linke Seite)
  { id: '0100', name: 'Betriebs- und Geschäftsausstattung (BGA)', typ: 'aktiv' },
  { id: '1200', name: 'Bank', typ: 'aktiv' },
  { id: '1400', name: 'Forderungen aus Lieferungen und Leistungen (FLL)', typ: 'aktiv' },
  { id: '1600', name: 'Verbindlichkeiten aus Lieferungen und Leistungen (VLL)', typ: 'passiv' },
  { id: '1800', name: 'Kasse', typ: 'aktiv' },
  { id: '3000', name: 'Waren / Warenbestand', typ: 'aktiv' },
  // Passivkonten (Bilanz rechte Seite)
  { id: '0800', name: 'Eigenkapital', typ: 'passiv' },
  { id: '1550', name: 'Darlehensverbindlichkeiten', typ: 'passiv' },
  // Aufwandskonten (Erfolgskonten, GuV)
  { id: '3400', name: 'Wareneingang / Aufwendungen für Waren', typ: 'aufwand' },
  { id: '4100', name: 'Löhne und Gehälter', typ: 'aufwand' },
  { id: '4200', name: 'Miete', typ: 'aufwand' },
  { id: '4830', name: 'Abschreibungen auf Sachanlagen (AfA)', typ: 'aufwand' },
  { id: '4900', name: 'Sonstige betriebliche Aufwendungen', typ: 'aufwand' },
  // Ertragskonten (Erfolgskonten, GuV)
  { id: '8100', name: 'Umsatzerlöse', typ: 'ertrag' },
  { id: '8200', name: 'Sonstige betriebliche Erträge', typ: 'ertrag' },
  // Abschlusskonten
  { id: '9000', name: 'Schlussbilanzkonto (SBK)', typ: 'passiv' },
  { id: '9100', name: 'Gewinn- und Verlustkonto (GuV)', typ: 'passiv' },
];

/**
 * Gibt ein Konto aus dem Kontenrahmen zurück.
 * @param {string} id
 * @returns {Konto | undefined}
 */
export function getKonto(id) {
  return KONTENRAHMEN.find((k) => k.id === id);
}

/**
 * Prüft ob ein Buchungssatz korrekt ist (Soll = Haben).
 * @param {Buchungssatz} satz
 * @returns {{ valid: boolean; fehler: string | null }}
 */
export function validateBuchungssatz(satz) {
  if (!satz.soll || !satz.haben) {
    return { valid: false, fehler: 'Soll- und Haben-Konto müssen angegeben sein.' };
  }
  if (satz.soll === satz.haben) {
    return { valid: false, fehler: 'Soll- und Haben-Konto dürfen nicht identisch sein.' };
  }
  if (!satz.betrag || satz.betrag <= 0) {
    return { valid: false, fehler: 'Betrag muss größer als 0 sein.' };
  }
  const sollKonto = getKonto(satz.soll);
  const habenKonto = getKonto(satz.haben);
  if (!sollKonto) return { valid: false, fehler: `Soll-Konto ${satz.soll} nicht im Kontenrahmen.` };
  if (!habenKonto) return { valid: false, fehler: `Haben-Konto ${satz.haben} nicht im Kontenrahmen.` };
  return { valid: true, fehler: null };
}

/**
 * Berechnet den Saldo eines T-Kontos aus einer Liste von Buchungen.
 * @param {string} kontoid
 * @param {TKontoBuchung[]} buchungen
 * @returns {{ sollSumme: number; habenSumme: number; saldo: number; saldoSeite: 'soll' | 'haben' | 'ausgeglichen' }}
 */
export function berechneKontoSaldo(kontoid, buchungen) {
  const kontoEintraege = buchungen.filter((b) => b.kontoid === kontoid);
  const sollSumme = kontoEintraege.filter((b) => b.seite === 'soll').reduce((s, b) => s + b.betrag, 0);
  const habenSumme = kontoEintraege.filter((b) => b.seite === 'haben').reduce((s, b) => s + b.betrag, 0);
  const saldo = Math.abs(sollSumme - habenSumme);
  const saldoSeite = sollSumme > habenSumme ? 'soll' : sollSumme < habenSumme ? 'haben' : 'ausgeglichen';
  return { sollSumme, habenSumme, saldo, saldoSeite };
}

/**
 * Wandelt eine Liste von Buchungssätzen in T-Konto-Buchungen um.
 * @param {Buchungssatz[]} saetze
 * @returns {TKontoBuchung[]}
 */
export function buchungssaetzeZuTKontoBuchungen(saetze) {
  /** @type {TKontoBuchung[]} */
  const result = [];
  for (const s of saetze) {
    result.push({ kontoid: s.soll, seite: 'soll', betrag: s.betrag, beschreibung: s.beschreibung });
    result.push({ kontoid: s.haben, seite: 'haben', betrag: s.betrag, beschreibung: s.beschreibung });
  }
  return result;
}

/**
 * Berechnet den Jahresabschluss (GuV und Bilanz) aus gegebenen Buchungen und Anfangsbeständen.
 * @param {TKontoBuchung[]} buchungen
 * @param {Record<string, number>} anfangsbestaende - { kontoid: betrag }
 * @returns {{ guv: { aufwendungen: number; ertraege: number; ergebnis: number }; aktiva: number; passiva: number }}
 */
export function berechneJahresabschluss(buchungen, anfangsbestaende = {}) {
  let aufwendungen = 0;
  let ertraege = 0;

  for (const konto of KONTENRAHMEN) {
    const anfang = anfangsbestaende[konto.id] ?? 0;
    const { sollSumme, habenSumme } = berechneKontoSaldo(konto.id, buchungen);

    if (konto.typ === 'aufwand') {
      // Aufwandskonten: Saldo auf Soll-Seite = Aufwand
      aufwendungen += anfang + sollSumme - habenSumme;
    } else if (konto.typ === 'ertrag') {
      // Ertragskonten: Saldo auf Haben-Seite = Ertrag
      ertraege += anfang + habenSumme - sollSumme;
    }
  }

  const ergebnis = ertraege - aufwendungen; // positiv = Gewinn, negativ = Verlust

  // Vereinfachte Bilanz: Aktiva = Passiva (Eigenkapital passt sich an)
  let aktiva = 0;
  let passiva = 0;
  for (const konto of KONTENRAHMEN) {
    if (konto.typ === 'aktiv') {
      const anfang = anfangsbestaende[konto.id] ?? 0;
      const { sollSumme, habenSumme } = berechneKontoSaldo(konto.id, buchungen);
      aktiva += anfang + sollSumme - habenSumme;
    } else if (konto.typ === 'passiv' && konto.id !== '9000' && konto.id !== '9100') {
      const anfang = anfangsbestaende[konto.id] ?? 0;
      const { sollSumme, habenSumme } = berechneKontoSaldo(konto.id, buchungen);
      passiva += anfang + habenSumme - sollSumme;
    }
  }
  passiva += ergebnis; // Gewinn erhöht Eigenkapital (Passiva)

  return { guv: { aufwendungen, ertraege, ergebnis }, aktiva, passiva };
}

/** Vordefinierte IHK-Übungsszenarien */
export const IHK_SZENARIEN = [
  {
    id: 'wareneinkauf_ziel',
    titel: 'Wareneinkauf auf Ziel',
    beschreibung: 'Das Unternehmen kauft Waren für 5.000 € auf Ziel (Rechnung, noch nicht bezahlt).',
    soll: '3400',
    haben: '1600',
    betrag: 5000,
    erlaeuterung: 'Wareneingang (Aufwand, Soll) ↔ Verbindlichkeit an Lieferant (Passiv, Haben). Schulden steigen, Aufwand entsteht.',
  },
  {
    id: 'zahlung_verbindlichkeit',
    titel: 'Begleichen der Verbindlichkeit (Zahlung per Bank)',
    beschreibung: 'Die offene Lieferantenrechnung über 5.000 € wird per Banküberweisung bezahlt.',
    soll: '1600',
    haben: '1200',
    betrag: 5000,
    erlaeuterung: 'Verbindlichkeit sinkt (Soll, da Passivkonto), Bank sinkt (Haben, da Aktivkonto). Bilanzverkürzung.',
  },
  {
    id: 'warenverkauf',
    titel: 'Warenverkauf auf Ziel',
    beschreibung: 'Das Unternehmen verkauft Waren auf Rechnung für 8.000 €.',
    soll: '1400',
    haben: '8100',
    betrag: 8000,
    erlaeuterung: 'Forderung entsteht (Aktivkonto, Soll) ↔ Umsatzerlös (Ertragskonto, Haben). Bilanzverlängerung.',
  },
  {
    id: 'kundenzahlung',
    titel: 'Kundenzahlung auf Bankkonto',
    beschreibung: 'Der Kunde überweist die offene Forderung über 8.000 € auf das Bankkonto.',
    soll: '1200',
    haben: '1400',
    betrag: 8000,
    erlaeuterung: 'Bank steigt (Aktivkonto, Soll) ↔ Forderung sinkt (Aktivkonto, Haben). Aktivtausch.',
  },
  {
    id: 'lohnzahlung',
    titel: 'Lohn- und Gehaltszahlung per Bank',
    beschreibung: 'Löhne und Gehälter in Höhe von 3.500 € werden per Bank ausgezahlt.',
    soll: '4100',
    haben: '1200',
    betrag: 3500,
    erlaeuterung: 'Personalaufwand (Aufwandskonto, Soll) ↔ Bank sinkt (Aktivkonto, Haben). Aufwand mindert Gewinn.',
  },
  {
    id: 'abschreibung_bga',
    titel: 'Abschreibung auf Betriebs- und Geschäftsausstattung',
    beschreibung: 'Die BGA wird im Wert von 1.200 € linear abgeschrieben (AfA).',
    soll: '4830',
    haben: '0100',
    betrag: 1200,
    erlaeuterung: 'AfA-Aufwand (Aufwandskonto, Soll) ↔ BGA sinkt (Aktivkonto, Haben). Wertminderung des Anlagevermögens.',
  },
  {
    id: 'mietaufwand',
    titel: 'Mietzahlung per Bank',
    beschreibung: 'Die monatliche Büromiete von 900 € wird per Banküberweisung bezahlt.',
    soll: '4200',
    haben: '1200',
    betrag: 900,
    erlaeuterung: 'Mietaufwand (Aufwandskonto, Soll) ↔ Bank sinkt (Aktivkonto, Haben).',
  },
];

/**
 * Erklärt das Buchungsprinzip für einen Kontotyp.
 * @param {KontoTyp} typ
 * @param {'soll' | 'haben'} seite
 * @returns {string}
 */
export function erklaereBuchungsregel(typ, seite) {
  const regeln = {
    aktiv: { soll: 'Zugänge (Zunahme des Vermögens)', haben: 'Abgänge (Abnahme des Vermögens)' },
    passiv: { soll: 'Abgänge (Abnahme der Schulden)', haben: 'Zugänge (Zunahme der Schulden)' },
    aufwand: { soll: 'Aufwand entsteht / steigt', haben: 'Aufwand sinkt (Korrekturbuchung)' },
    ertrag: { soll: 'Ertrag sinkt (Korrekturbuchung)', haben: 'Ertrag entsteht / steigt' },
  };
  return regeln[typ]?.[seite] ?? '';
}
