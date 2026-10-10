// @ts-check
/**
 * IHK WISO Zahlungsverkehr Engine
 * Zahlungsarten, SEPA, Wechsel, Skonto/Rabatt/Bonus — IHK AP2 Standard
 */

/** @typedef {'ueberweisung' | 'lastschrift' | 'wechsel' | 'scheck' | 'nachnahme'} Zahlungsart */

/** @type {Array<{id: string, name: string, beschreibung: string, merkmale: string[], risiko: 'gering'|'mittel'|'hoch', kosten: string}>} */
export const ZAHLUNGSARTEN = [
  {
    id: 'sepa_ueberweisung',
    name: 'SEPA-Überweisung',
    beschreibung: 'Standardisierte, einheitliche Überweisung im SEPA-Raum (EU + CH, GB, NO u. a.) über IBAN/BIC.',
    merkmale: [
      'Schuldner löst selbst die Zahlung aus (Pull: nein, Push: ja)',
      'Ausführungszeit max. 1 Bankarbeitstag (TARGET2)',
      'Keine Vorautorisierung nötig',
      'IBAN + BIC des Empfängers erforderlich',
      'Rückbuchung nur bei Fehlüberweisung (begrenzt)',
    ],
    risiko: 'gering',
    kosten: 'Sehr günstig – Standardgebühr Hausbank',
  },
  {
    id: 'sepa_lastschrift',
    name: 'SEPA-Lastschrift',
    beschreibung: 'Der Gläubiger zieht den Betrag vom Konto des Schuldners ein – nach vorliegender SEPA-Mandatserteilung.',
    merkmale: [
      'Schuldner erteilt einmalig ein SEPA-Mandat (Vorautorisierung)',
      'Gläubiger löst Einzug aus (Pull-Zahlung)',
      'Vorlaufzeit: CORE-Lastschrift 5 KT (Ersteinzug) / 2 KT (Folge)',
      'Widerspruchsrecht: 8 Wochen (autorisiert) / 13 Monate (unautorisiert)',
      'Gläubiger-ID (CID) & Mandatsreferenz nötig',
    ],
    risiko: 'mittel',
    kosten: 'Günstig – Rücklastschrift bei Widerspruch kostet extra',
  },
  {
    id: 'wechsel',
    name: 'Wechsel (gezogener Wechsel / Tratte)',
    beschreibung: 'Wertpapier: Gläubiger (Aussteller/Trassant) befiehlt Schuldner (Bezogener/Trassat), an einem bestimmten Termin zu zahlen.',
    merkmale: [
      'Aussteller (Trassant): stellt Wechsel aus & befiehlt',
      'Bezogener (Trassat): schuldet Zahlung – Akzept durch Unterschrift',
      'Remittent: erster Wechselgläubiger (oft = Trassant)',
      'Endorsement (Indossament): Weitergabe durch Übertragungsvermerk',
      'Diskontierung: Bank kauft Wechsel vor Fälligkeit an → Diskont = Abschlag',
      'Wechselstrenge: formeller Charakter, BGB § 243 ff. WG',
    ],
    risiko: 'gering',
    kosten: 'Diskontgebühr, Wechselsteuer 0,075 ‰ (mind. 1,50 €)',
  },
  {
    id: 'scheck',
    name: 'Scheck',
    beschreibung: 'Anweisung des Ausstellers an seine Bank, dem Inhaber einen bestimmten Betrag zu zahlen.',
    merkmale: [
      'Kein Termindatum – immer sofort fällig (Sichtpapier)',
      'Gedeckter Scheck: ausreichende Kontodeckung vorhanden',
      'Verrechnungsscheck: Bankverrechnung statt Barzahlung',
      'Risiko ungedeckter Schecks (SchaEckG)',
      'Einlösung in Deutschland 8 Tage, EU 20 Tage',
    ],
    risiko: 'mittel',
    kosten: 'Scheckgebühr, Scheckrückgabe bei fehlender Deckung',
  },
  {
    id: 'nachnahme',
    name: 'Nachnahme',
    beschreibung: 'Warenauslieferung nur gegen sofortige Zahlung. Zusteller kassiert den Betrag.',
    merkmale: [
      'Sicherheit für Verkäufer: Lieferung nur gegen Zahlung',
      'Käufer sieht Ware erst nach Bezahlung',
      'Hohe Kosten & aufwendige Abwicklung',
      'Kaum noch genutzt – meist durch PayPal/Kreditkarte ersetzt',
    ],
    risiko: 'gering',
    kosten: 'Nachnahmegebühr zzgl. Portokosten (3–7 €)',
  },
];

/**
 * Berechnet den effektiven Jahreszins für Skontoverzicht.
 * Formel (IHK): Effektivzins = (Skonto% / (100 - Skonto%)) × (360 / (Zahlungsziel - Skontofrist))
 * @param {number} skontoProzent - z. B. 2 für 2 %
 * @param {number} zahlungsziel - Zahlungsziel in Tagen
 * @param {number} skontofrist - Skontofrist in Tagen
 * @returns {{ effektivzins: number, kreditzins: number, empfehlung: string }}
 */
export function berechneSkontovorteil(skontoProzent, zahlungsziel, skontofrist) {
  if (zahlungsziel <= skontofrist) {
    throw new Error('Zahlungsziel muss größer als Skontofrist sein.');
  }
  const kreditlaufzeit = zahlungsziel - skontofrist;
  const effektivzins = (skontoProzent / (100 - skontoProzent)) * (360 / kreditlaufzeit) * 100;
  // IHK-Vergleich: Kontokorrentzins durchschnittlich 8–12 %
  const referenzzins = 10;
  const empfehlung = effektivzins > referenzzins
    ? `Skonto nutzen lohnt sich! ${effektivzins.toFixed(1)} % Effektivzins > ${referenzzins} % Kontokorrent.`
    : `Skonto nicht nutzen — ${effektivzins.toFixed(1)} % Effektivzins < ${referenzzins} % Kontokorrent.`;
  return { effektivzins, kreditzins: referenzzins, empfehlung };
}

/**
 * Berechnet Diskontbetrag und Auszahlungsbetrag bei Wechseldiskontierung.
 * @param {number} nennwert - Wechselbetrag in €
 * @param {number} diskontsatz - Bankdiskontsatz in % p. a.
 * @param {number} laufzeitTage - Restlaufzeit des Wechsels in Tagen
 * @returns {{ diskont: number, auszahlung: number, effektivzins: number }}
 */
export function berechneWechseldiskont(nennwert, diskontsatz, laufzeitTage) {
  if (nennwert <= 0 || diskontsatz <= 0 || laufzeitTage <= 0) {
    throw new Error('Alle Werte müssen positiv sein.');
  }
  const diskont = (nennwert * diskontsatz * laufzeitTage) / (360 * 100);
  const auszahlung = nennwert - diskont;
  const effektivzins = (diskont / auszahlung) * (360 / laufzeitTage) * 100;
  return { diskont, auszahlung, effektivzins };
}

/**
 * IHK-typische Preisnachlass-Arten (Skonto / Rabatt / Bonus)
 * @type {Array<{typ: string, definition: string, zeitpunkt: string, beispiel: string, steuerlich: string}>}
 */
export const PREISNACHLAESSE = [
  {
    typ: 'Skonto',
    definition: 'Nachlass bei schneller Zahlung innerhalb der Skontofrist.',
    zeitpunkt: 'Nach Rechnungsstellung – bei Zahlung innerhalb der Frist',
    beispiel: '2/10 netto 30 → 2 % Skonto wenn binnen 10 Tagen gezahlt',
    steuerlich: 'Mindert die Bemessungsgrundlage der Umsatzsteuer (§ 17 UStG)',
  },
  {
    typ: 'Rabatt',
    definition: 'Preisnachlass, der bereits bei der Rechnungsstellung vom Listenpreis abgezogen wird.',
    zeitpunkt: 'Vor/bei Rechnungsstellung',
    beispiel: 'Mengenrabatt: 5 % ab 100 Stück; Treuerabatt: 3 % für Stammkunden',
    steuerlich: 'Mindert die Bemessungsgrundlage (kein separater Buchungssatz nötig)',
  },
  {
    typ: 'Bonus',
    definition: 'Nachträgliche Vergütung am Ende einer Periode bei Erreichen vereinbarter Umsatz-/Mengenziele.',
    zeitpunkt: 'Nach Periodenende (Quartal / Jahr)',
    beispiel: '3 % Jahresbonus ab 50.000 € Jahresumsatz mit dem Lieferanten',
    steuerlich: 'Umsatzsteuerkorrektur nötig (§ 17 UStG – nachträgliche Entgeltminderung)',
  },
];

/**
 * IHK-typische Übungsaufgaben zum Zahlungsverkehr
 * @type {Array<{id: string, titel: string, aufgabe: string, hinweis: string, loesung: string, typ: string, skontoProzent?: number, zahlungsziel?: number, skontofrist?: number, nennwert?: number, diskontsatz?: number, laufzeitTage?: number}>}
 */
export const IHK_ZAHLUNGSAUFGABEN = [
  {
    id: 'z1',
    typ: 'skonto',
    titel: 'Skonto-Effektivzins berechnen',
    aufgabe: 'Lieferant bietet: 2 % Skonto bei Zahlung binnen 14 Tagen, netto 60 Tage. Wie hoch ist der Effektivzins für den Skontoverzicht? Lohnt sich die Skontonutzung bei einem Kontokorrentzins von 8 %?',
    hinweis: 'Effektivzins = (S% / (100−S%)) × (360 / (Zahlungsziel − Skontofrist)) × 100',
    loesung: 'Effektivzins = (2/98) × (360/46) × 100 ≈ 15,96 % > 8 % → Skonto nutzen lohnt sich.',
    skontoProzent: 2,
    zahlungsziel: 60,
    skontofrist: 14,
  },
  {
    id: 'z2',
    typ: 'skonto',
    titel: 'Skonto oder Kredit?',
    aufgabe: 'Rechnungsbetrag: 10.000 €. Konditionen: 3/7 netto 30. Kontokorrentzins: 12 %. Lohnt es sich, das Konto zu überziehen um den Skonto zu nutzen?',
    hinweis: 'Effektivzins = (3/97) × (360/23) × 100',
    loesung: 'Effektivzins ≈ 48,3 % >> 12 % → Skonto nutzen, auch wenn Überziehung nötig.',
    skontoProzent: 3,
    zahlungsziel: 30,
    skontofrist: 7,
  },
  {
    id: 'z3',
    typ: 'wechsel',
    titel: 'Wechseldiskont berechnen',
    aufgabe: 'Wechselwert: 12.000 €. Restlaufzeit: 45 Tage. Bankdiskontsatz: 6 % p. a. Wie viel zahlt die Bank aus?',
    hinweis: 'Diskont = (Nennwert × Diskontsatz × Laufzeit) / (360 × 100)',
    loesung: 'Diskont = (12000 × 6 × 45) / 36000 = 90 €. Auszahlung = 11.910 €.',
    nennwert: 12000,
    diskontsatz: 6,
    laufzeitTage: 45,
  },
  {
    id: 'z4',
    typ: 'theorie',
    titel: 'SEPA-Lastschrift Widerspruchsrecht',
    aufgabe: 'Frau Müller hat eine SEPA-Basislastschrift erteilt. Die Buchung erfolgte am 15. März. Bis wann kann sie ohne Angabe von Gründen widersprechen?',
    hinweis: 'SEPA CORE: 8 Wochen bei autorisierten Lastschriften',
    loesung: '8 Wochen ab 15. März = bis 10. Mai (oder ähnlich je nach Monatszählung). Bei unautorisierten Lastschriften: 13 Monate.',
  },
  {
    id: 'z5',
    typ: 'theorie',
    titel: 'Rabatt vs. Skonto vs. Bonus',
    aufgabe: 'Ordne die Begriffe den Definitionen zu: (A) Nachlass bei Schnellzahlung, (B) Nachlass auf den Listenpreis vor Rechnungsstellung, (C) Rückvergütung am Periodenende bei Umsatzziel.',
    hinweis: 'Timing entscheidet: vor / bei / nach der Rechnungsstellung?',
    loesung: 'A = Skonto, B = Rabatt, C = Bonus.',
  },
];

/** Erläuterungen zum SEPA-Mandat */
export const SEPA_MANDAT_INFO = {
  definition: 'Ein SEPA-Lastschriftmandat ist die schriftliche Einverständniserklärung des Schuldners, dass der Gläubiger einen Betrag von seinem Konto einziehen darf.',
  pflichtangaben: ['Name und Adresse des Gläubigers', 'Gläubiger-ID (CID)', 'Mandatsreferenz', 'Name und IBAN des Schuldners', 'Art der Zahlung (Einmalig / Wiederkehrend)', 'Datum und Unterschrift'],
  vorlaufzeiten: {
    core_erst: '5 Bankarbeitstage (Ersteinzug)',
    core_folge: '2 Bankarbeitstage (Folgeeinzug)',
    b2b_erst: '1 Bankarbeitstag (Geschäftskunden, kein Widerspruchsrecht)',
    b2b_folge: '1 Bankarbeitstag',
  },
};
