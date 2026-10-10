// @ts-check
/**
 * IHK Software-Testverfahren Engine (nach ISTQB & IHK-Ausbildungsrahmenplan)
 * Behandelt:
 * - Black-Box-Testverfahren: Äquivalenzklassenbildung (GÄK & UÄK)
 * - Grenzwertanalyse (Boundary Value Analysis: min-1, min, min+1, max-1, max, max+1)
 * - White-Box-Metriken: Anweisungsüberdeckung (C0), Zweigüberdeckung (C1), Pfadüberdeckung (C2)
 * - McCabe Zyklomatische Komplexität M = E - N + 2P bzw. M = D + 1
 * @module testverfahrenEngine
 */

/**
 * @typedef {{
 *   id: string;
 *   bezeichnung: string;
 *   typ: 'GÄK' | 'UÄK';
 *   bedingung: string;
 *   repraesentant: number | string;
 *   erwartetesErgebnis: 'GÜLTIG' | 'UNGÜLTIG';
 * }} Aequivalenzklasse
 *
 * @typedef {{
 *   wert: number;
 *   bezeichnung: string;
 *   status: 'GÜLTIG' | 'UNGÜLTIG';
 *   beschreibung: string;
 * }} GrenzwertEintrag
 *
 * @typedef {{
 *   testfallId: string;
 *   eingabewert: number | string;
 *   getesteteKlasse: string;
 *   erwartetesErgebnis: string;
 * }} MinimalerTestfall
 */

/**
 * Ermittelt die standardisierten Äquivalenzklassen für einen numerischen Bereich [min, max].
 * @param {{
 *   feldName: string;
 *   min: number;
 *   max: number;
 *   einheit?: string;
 * }} params
 * @returns {Aequivalenzklasse[]}
 */
export function ermittleAequivalenzklassen({ feldName, min, max, einheit = '' }) {
  const gMitte = Math.round((min + max) / 2);
  const uUnten = min - (max - min > 10 ? 5 : 1);
  const uOben = max + (max - min > 10 ? 5 : 1);

  return [
    {
      id: 'UÄK-1',
      bezeichnung: `Unterhalb des Mindestwerts (${feldName} < ${min}${einheit})`,
      typ: 'UÄK',
      bedingung: `< ${min}`,
      repraesentant: uUnten,
      erwartetesErgebnis: 'UNGÜLTIG'
    },
    {
      id: 'GÄK-1',
      bezeichnung: `Erlaubter Wertebereich (${min} ≤ ${feldName} ≤ ${max}${einheit})`,
      typ: 'GÄK',
      bedingung: `${min} .. ${max}`,
      repraesentant: gMitte,
      erwartetesErgebnis: 'GÜLTIG'
    },
    {
      id: 'UÄK-2',
      bezeichnung: `Oberhalb des Höchstwerts (${feldName} > ${max}${einheit})`,
      typ: 'UÄK',
      bedingung: `> ${max}`,
      repraesentant: uOben,
      erwartetesErgebnis: 'UNGÜLTIG'
    },
    {
      id: 'UÄK-3',
      bezeichnung: `Typinkompatibler Wert (Ungültiges Format / Nicht-numerisch)`,
      typ: 'UÄK',
      bedingung: `NaN / Text / Leer`,
      repraesentant: 'abc',
      erwartetesErgebnis: 'UNGÜLTIG'
    }
  ];
}

/**
 * Führt eine klassische 6-Punkte Grenzwertanalyse nach ISTQB-Standard durch.
 * @param {number} min - Untere Grenze
 * @param {number} max - Obere Grenze
 * @returns {GrenzwertEintrag[]}
 */
export function ermittleGrenzwerte(min, max) {
  if (min > max) {
    throw new Error('Min darf nicht größer als Max sein.');
  }

  return [
    {
      wert: min - 1,
      bezeichnung: 'min - 1',
      status: 'UNGÜLTIG',
      beschreibung: 'Knapp unter der Mindestgrenze (Fehlerfall/Validierungsprüfung)'
    },
    {
      wert: min,
      bezeichnung: 'min',
      status: 'GÜLTIG',
      beschreibung: 'Exakt an der unteren Grenze (Grenzwert inkludiert)'
    },
    {
      wert: min + 1,
      bezeichnung: 'min + 1',
      status: 'GÜLTIG',
      beschreibung: 'Knapp über der unteren Grenze (Regulärer Arbeitsbereich)'
    },
    {
      wert: max - 1,
      bezeichnung: 'max - 1',
      status: 'GÜLTIG',
      beschreibung: 'Knapp unter der oberen Grenze (Regulärer Arbeitsbereich)'
    },
    {
      wert: max,
      bezeichnung: 'max',
      status: 'GÜLTIG',
      beschreibung: 'Exakt an der oberen Grenze (Grenzwert inkludiert)'
    },
    {
      wert: max + 1,
      bezeichnung: 'max + 1',
      status: 'UNGÜLTIG',
      beschreibung: 'Knapp über der oberen Grenze (Fehlerfall/Validierungsprüfung)'
    }
  ];
}

/**
 * Berechnet die zyklomatische Komplexität nach Thomas J. McCabe:
 * M = E - N + 2P
 * oder vereinfacht für zusammenhängende Graphen: M = Verzweigungen (Decisions) + 1
 *
 * @param {{
 *   kanten: number;     // Edges E
 *   knoten: number;     // Nodes N
 *   komponenten?: number; // P (Default: 1)
 * }} params
 * @returns {{
 *   mccabeKomplexitaet: number;
 *   risikoKlasse: 'NIEDRIG' | 'MITTEL' | 'HOCH' | 'UNTESTBAR';
 *   empfehlung: string;
 * }}
 */
export function berechneMcCabeKomplexitaet({ kanten, knoten, komponenten = 1 }) {
  const e = Math.max(0, kanten);
  const n = Math.max(0, knoten);
  const p = Math.max(1, komponenten);

  // M = E - N + 2P
  const m = Math.max(1, e - n + 2 * p);

  let risikoKlasse = /** @type {'NIEDRIG' | 'MITTEL' | 'HOCH' | 'UNTESTBAR'} */ ('NIEDRIG');
  let empfehlung = '';

  if (m <= 10) {
    risikoKlasse = 'NIEDRIG';
    empfehlung = 'Geringes Fehlerrisiko. Einfache Struktur, hervorragend testbar und wartbar (Standard für Clean Code).';
  } else if (m <= 20) {
    risikoKlasse = 'MITTEL';
    empfehlung = 'Mäßiges Fehlerrisiko. Erhöhte Anzahl an Verzweigungen. Automatisierte Unit-Tests dringend erforderlich.';
  } else if (m <= 50) {
    risikoKlasse = 'HOCH';
    empfehlung = 'Hohes Fehlerrisiko! Schwer verständlich und fehleranfällig. Refactoring in kleinere Teilmethoden empfohlen.';
  } else {
    risikoKlasse = 'UNTESTBAR';
    empfehlung = 'Kritischer Bereich! Praktisch nicht vollständig testbar. Sofortige Modularisierung zwingend erforderlich.';
  }

  return {
    mccabeKomplexitaet: m,
    risikoKlasse,
    empfehlung
  };
}

/**
 * Berechnet die prozentuale Testüberdeckung für C0, C1 und C2.
 * @param {{
 *   gesamtAnweisungen: number;
 *   abgedeckteAnweisungen: number;
 *   gesamtZweige: number;
 *   abgedeckteZweige: number;
 *   gesamtPfade: number;
 *   abgedecktePfade: number;
 * }} params
 * @returns {{
 *   c0AnweisungsUeberdeckung: number;
 *   c1ZweigUeberdeckung: number;
 *   c2PfadUeberdeckung: number;
 *   istC0Vollstaendig: boolean;
 *   istC1Vollstaendig: boolean;
 * }}
 */
export function berechneTestabdeckung({
  gesamtAnweisungen,
  abgedeckteAnweisungen,
  gesamtZweige,
  abgedeckteZweige,
  gesamtPfade,
  abgedecktePfade
}) {
  const c0 = gesamtAnweisungen > 0 ? Math.round((abgedeckteAnweisungen / gesamtAnweisungen) * 1000) / 10 : 0;
  const c1 = gesamtZweige > 0 ? Math.round((abgedeckteZweige / gesamtZweige) * 1000) / 10 : 0;
  const c2 = gesamtPfade > 0 ? Math.round((abgedecktePfade / gesamtPfade) * 1000) / 10 : 0;

  return {
    c0AnweisungsUeberdeckung: Math.min(100, Math.max(0, c0)),
    c1ZweigUeberdeckung: Math.min(100, Math.max(0, c1)),
    c2PfadUeberdeckung: Math.min(100, Math.max(0, c2)),
    istC0Vollstaendig: c0 >= 100,
    istC1Vollstaendig: c1 >= 100
  };
}

/**
 * IHK-Prüfungsfragen für Software-Testverfahren
 */
export const TESTVERFAHREN_DRILL_QUESTIONS = [
  {
    id: 'test_1',
    frage: 'In einem Online-Shop dürfen Kunden ein Alter zwischen 18 und 65 Jahren angeben. Welche Testwerte repräsentieren die 6-Punkte-Grenzwertanalyse korrekt?',
    optionen: [
      '17, 18, 19 und 64, 65, 66',
      '18, 40, 65',
      '0, 18, 65, 100',
      '16, 17, 18 und 65, 66, 67'
    ],
    korrektIndex: 0,
    erklaerung: 'Die 6-Punkte-Grenzwertanalyse prüft min-1, min, min+1 (17, 18, 19) und max-1, max, max+1 (64, 65, 66).'
  },
  {
    id: 'test_2',
    frage: 'Ein Kontrollflussgraph besitzt N = 7 Knoten und E = 9 Kanten bei einer einzigen zusammenhängenden Komponente (P = 1). Wie hoch ist die zyklomatische Komplexität nach McCabe?',
    optionen: [
      'M = 2',
      'M = 4',
      'M = 5',
      'M = 3'
    ],
    korrektIndex: 1,
    erklaerung: 'Nach der McCabe-Formel gilt: M = E - N + 2P = 9 - 7 + 2(1) = 2 + 2 = 4.'
  },
  {
    id: 'test_3',
    frage: 'Welche Aussage zur Beziehung zwischen Anweisungsüberdeckung (C0) und Zweigüberdeckung (C1) ist zutreffend?',
    optionen: [
      '100% C0-Überdeckung garantiert automatisch 100% C1-Überdeckung.',
      '100% C1-Überdeckung garantiert automatisch 100% C0-Überdeckung.',
      'C0 und C1 sind identisch, da Zweige aus Anweisungen bestehen.',
      'C1-Überdeckung testet ausschließlich Schleifen, während C0 nur Verzweigungen prüft.'
    ],
    korrektIndex: 1,
    erklaerung: 'Wenn alle Zweige (true- und false-Kanten) durchlaufen werden (100% C1), werden zwangsläufig auch alle darin liegenden Anweisungen mindestens einmal ausgeführt (100% C0). Die Umkehrung gilt nicht!'
  },
  {
    id: 'test_4',
    frage: 'Wozu dient die Äquivalenzklassenbildung (ÄKB) als Black-Box-Testverfahren primär?',
    optionen: [
      'Zur Messung der Ausführungsgeschwindigkeit auf CPU-Ebene.',
      'Zur Reduzierung der Anzahl der erforderlichen Testfälle bei gleichzeitig hoher Fehleraufdeckungsrate.',
      'Zur statischen Analyse des Quellcodes ohne Programmausführung.',
      'Zur automatischen Generierung von UML-Klassendiagrammen.'
    ],
    korrektIndex: 1,
    erklaerung: 'Die Äquivalenzklassenbildung teilt die Menge aller möglichen Eingabewerte in Klassen auf, sodass ein Repräsentant pro Klasse genügt. Dies minimiert den Testaufwand drastisch.'
  }
];
