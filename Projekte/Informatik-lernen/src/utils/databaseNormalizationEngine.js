// @ts-check
/**
 * @file databaseNormalizationEngine.js
 * Relationale Datenbank-Normalisierung (0. NF -> 1. NF -> 2. NF -> 3. NF)
 * und Anomalien-Simulator (INSERT, UPDATE, DELETE).
 * Nach IHK-Prüfungsstandard für Fachinformatiker (FIAE, FISI, FIDP).
 */

/**
 * @typedef {object} TableColumn
 * @property {string} name
 * @property {string} label
 * @property {boolean} [isPrimaryKey]
 * @property {boolean} [isForeignKey]
 * @property {string} [references]
 * @property {boolean} [isAtomic]
 */

/**
 * @typedef {object} DatabaseTable
 * @property {string} name
 * @property {string} description
 * @property {string[]} primaryKey
 * @property {TableColumn[]} columns
 * @property {Array<Record<string, any>>} sampleData
 */

/**
 * @typedef {object} NormalizationStep
 * @property {string} stage - '0NF' | '1NF' | '2NF' | '3NF'
 * @property {string} title
 * @property {string} coreRule
 * @property {string} problemDescription
 * @property {DatabaseTable[]} tables
 */

/**
 * Unnormalisiertes IHK-Musterszenario: "Auftragsverwaltung & Bestellschein"
 */
export const UNNORMALIZED_ORDER_DATA = [
  {
    BestellNr: 101,
    Bestelldatum: '2026-05-10',
    Kunde: 'Acme GmbH, 10115 Berlin',
    Positionen: 'A-201 (Monitor, 240€, 2x); A-305 (Tastatur, 45€, 1x)'
  },
  {
    BestellNr: 102,
    Bestelldatum: '2026-05-11',
    Kunde: 'Byte AG, 80331 München',
    Positionen: 'A-201 (Monitor, 240€, 1x)'
  },
  {
    BestellNr: 103,
    Bestelldatum: '2026-05-12',
    Kunde: 'Acme GmbH, 10115 Berlin',
    Positionen: 'A-404 (Maus, 25€, 3x)'
  }
];

/**
 * Stufe 1: 1. Normalform (Atomare Werte, flache Zeilen, Primärschlüssel festgelegt)
 */
export const FIRST_NORMAL_FORM_TABLE = {
  name: 'Bestellpositionen_1NF',
  description: 'Wiederholgruppen aufgelöst und zusammengesetzte Attribute atomar zerlegt (Kundenname, PLZ, Ort getrennt). Zusammengesetzter Primärschlüssel aus BestellNr + ArtikelNr.',
  primaryKey: ['BestellNr', 'ArtikelNr'],
  columns: [
    { name: 'BestellNr', label: 'Bestell-Nr', isPrimaryKey: true, isAtomic: true },
    { name: 'Bestelldatum', label: 'Bestelldatum', isAtomic: true },
    { name: 'KundenNr', label: 'Kunden-Nr', isAtomic: true },
    { name: 'Kundenname', label: 'Kundenname', isAtomic: true },
    { name: 'PLZ', label: 'PLZ', isAtomic: true },
    { name: 'Ort', label: 'Ort', isAtomic: true },
    { name: 'ArtikelNr', label: 'Artikel-Nr', isPrimaryKey: true, isAtomic: true },
    { name: 'Artikelname', label: 'Artikelname', isAtomic: true },
    { name: 'Einzelpreis', label: 'Einzelpreis (€)', isAtomic: true },
    { name: 'Menge', label: 'Menge', isAtomic: true }
  ],
  sampleData: [
    { BestellNr: 101, Bestelldatum: '2026-05-10', KundenNr: 'K1', Kundenname: 'Acme GmbH', PLZ: '10115', Ort: 'Berlin', ArtikelNr: 'A-201', Artikelname: 'Monitor', Einzelpreis: 240, Menge: 2 },
    { BestellNr: 101, Bestelldatum: '2026-05-10', KundenNr: 'K1', Kundenname: 'Acme GmbH', PLZ: '10115', Ort: 'Berlin', ArtikelNr: 'A-305', Artikelname: 'Tastatur', Einzelpreis: 45, Menge: 1 },
    { BestellNr: 102, Bestelldatum: '2026-05-11', KundenNr: 'K2', Kundenname: 'Byte AG', PLZ: '80331', Ort: 'München', ArtikelNr: 'A-201', Artikelname: 'Monitor', Einzelpreis: 240, Menge: 1 },
    { BestellNr: 103, Bestelldatum: '2026-05-12', KundenNr: 'K1', Kundenname: 'Acme GmbH', PLZ: '10115', Ort: 'Berlin', ArtikelNr: 'A-404', Artikelname: 'Maus', Einzelpreis: 25, Menge: 3 }
  ]
};

/**
 * Stufe 2: 2. Normalform (Keine partiellen funktionalen Abhängigkeiten)
 */
export const SECOND_NORMAL_FORM_TABLES = [
  {
    name: 'Bestellungen',
    description: 'Enthält Kopfdaten der Bestellung. Hängt nur von BestellNr ab.',
    primaryKey: ['BestellNr'],
    columns: [
      { name: 'BestellNr', label: 'Bestell-Nr', isPrimaryKey: true },
      { name: 'Bestelldatum', label: 'Bestelldatum' },
      { name: 'KundenNr', label: 'Kunden-Nr' },
      { name: 'Kundenname', label: 'Kundenname' },
      { name: 'PLZ', label: 'PLZ' },
      { name: 'Ort', label: 'Ort' }
    ],
    sampleData: [
      { BestellNr: 101, Bestelldatum: '2026-05-10', KundenNr: 'K1', Kundenname: 'Acme GmbH', PLZ: '10115', Ort: 'Berlin' },
      { BestellNr: 102, Bestelldatum: '2026-05-11', KundenNr: 'K2', Kundenname: 'Byte AG', PLZ: '80331', Ort: 'München' },
      { BestellNr: 103, Bestelldatum: '2026-05-12', KundenNr: 'K1', Kundenname: 'Acme GmbH', PLZ: '10115', Ort: 'Berlin' }
    ]
  },
  {
    name: 'Artikel',
    description: 'Enthält Stammdaten der Artikel. Hängt nur von ArtikelNr ab.',
    primaryKey: ['ArtikelNr'],
    columns: [
      { name: 'ArtikelNr', label: 'Artikel-Nr', isPrimaryKey: true },
      { name: 'Artikelname', label: 'Artikelname' },
      { name: 'Einzelpreis', label: 'Einzelpreis (€)' }
    ],
    sampleData: [
      { ArtikelNr: 'A-201', Artikelname: 'Monitor', Einzelpreis: 240 },
      { ArtikelNr: 'A-305', Artikelname: 'Tastatur', Einzelpreis: 45 },
      { ArtikelNr: 'A-404', Artikelname: 'Maus', Einzelpreis: 25 }
    ]
  },
  {
    name: 'Bestellpositionen',
    description: 'Verknüpft Bestellungen und Artikel. Menge hängt voll von beiden Schlüssel-Teilen ab.',
    primaryKey: ['BestellNr', 'ArtikelNr'],
    columns: [
      { name: 'BestellNr', label: 'Bestell-Nr', isPrimaryKey: true, isForeignKey: true, references: 'Bestellungen.BestellNr' },
      { name: 'ArtikelNr', label: 'Artikel-Nr', isPrimaryKey: true, isForeignKey: true, references: 'Artikel.ArtikelNr' },
      { name: 'Menge', label: 'Menge' }
    ],
    sampleData: [
      { BestellNr: 101, ArtikelNr: 'A-201', Menge: 2 },
      { BestellNr: 101, ArtikelNr: 'A-305', Menge: 1 },
      { BestellNr: 102, ArtikelNr: 'A-201', Menge: 1 },
      { BestellNr: 103, ArtikelNr: 'A-404', Menge: 3 }
    ]
  }
];

/**
 * Stufe 3: 3. Normalform (Keine transitiven Abhängigkeiten)
 */
export const THIRD_NORMAL_FORM_TABLES = [
  {
    name: 'Kunden',
    description: 'Kundenstammdaten ausgelagert: Kundenname und PLZ hängen von KundenNr ab, nicht von BestellNr.',
    primaryKey: ['KundenNr'],
    columns: [
      { name: 'KundenNr', label: 'Kunden-Nr', isPrimaryKey: true },
      { name: 'Kundenname', label: 'Kundenname' },
      { name: 'PLZ', label: 'PLZ', isForeignKey: true, references: 'Orte.PLZ' }
    ],
    sampleData: [
      { KundenNr: 'K1', Kundenname: 'Acme GmbH', PLZ: '10115' },
      { KundenNr: 'K2', Kundenname: 'Byte AG', PLZ: '80331' }
    ]
  },
  {
    name: 'Orte',
    description: 'PLZ-Ort-Relation eliminiert transitive Abhängigkeit KundenNr -> PLZ -> Ort.',
    primaryKey: ['PLZ'],
    columns: [
      { name: 'PLZ', label: 'PLZ', isPrimaryKey: true },
      { name: 'Ort', label: 'Ort' }
    ],
    sampleData: [
      { PLZ: '10115', Ort: 'Berlin' },
      { PLZ: '80331', Ort: 'München' }
    ]
  },
  {
    name: 'Bestellungen',
    description: 'Enthält nur noch BestellNr, Bestelldatum und den Fremdschlüssel KundenNr.',
    primaryKey: ['BestellNr'],
    columns: [
      { name: 'BestellNr', label: 'Bestell-Nr', isPrimaryKey: true },
      { name: 'Bestelldatum', label: 'Bestelldatum' },
      { name: 'KundenNr', label: 'Kunden-Nr', isForeignKey: true, references: 'Kunden.KundenNr' }
    ],
    sampleData: [
      { BestellNr: 101, Bestelldatum: '2026-05-10', KundenNr: 'K1' },
      { BestellNr: 102, Bestelldatum: '2026-05-11', KundenNr: 'K2' },
      { BestellNr: 103, Bestelldatum: '2026-05-12', KundenNr: 'K1' }
    ]
  },
  {
    name: 'Artikel',
    description: 'Unverändert aus 2. NF.',
    primaryKey: ['ArtikelNr'],
    columns: [
      { name: 'ArtikelNr', label: 'Artikel-Nr', isPrimaryKey: true },
      { name: 'Artikelname', label: 'Artikelname' },
      { name: 'Einzelpreis', label: 'Einzelpreis (€)' }
    ],
    sampleData: [
      { ArtikelNr: 'A-201', Artikelname: 'Monitor', Einzelpreis: 240 },
      { ArtikelNr: 'A-305', Artikelname: 'Tastatur', Einzelpreis: 45 },
      { ArtikelNr: 'A-404', Artikelname: 'Maus', Einzelpreis: 25 }
    ]
  },
  {
    name: 'Bestellpositionen',
    description: 'Unverändert aus 2. NF.',
    primaryKey: ['BestellNr', 'ArtikelNr'],
    columns: [
      { name: 'BestellNr', label: 'Bestell-Nr', isPrimaryKey: true, isForeignKey: true, references: 'Bestellungen.BestellNr' },
      { name: 'ArtikelNr', label: 'Artikel-Nr', isPrimaryKey: true, isForeignKey: true, references: 'Artikel.ArtikelNr' },
      { name: 'Menge', label: 'Menge' }
    ],
    sampleData: [
      { BestellNr: 101, ArtikelNr: 'A-201', Menge: 2 },
      { BestellNr: 101, ArtikelNr: 'A-305', Menge: 1 },
      { BestellNr: 102, ArtikelNr: 'A-201', Menge: 1 },
      { BestellNr: 103, ArtikelNr: 'A-404', Menge: 3 }
    ]
  }
];

/**
 * IHK Anomalien-Katalog
 */
export const DATABASE_ANOMALIES = [
  {
    id: 'insert_anomaly',
    title: 'Einfüge-Anomalie (INSERT Anomaly)',
    definition: 'Ein neuer Datensatz kann nicht angelegt werden, ohne dass ein anderer Sachverhalt künstlich miterfunden oder NULL gesetzt werden muss.',
    scenario1NF: 'Ein neuer Artikel A-500 (Webcam) soll aufgenommen werden, wurde aber noch nie bestellt. In 1NF unmöglich, da BestellNr Teil des Primärschlüssels ist und NOT NULL sein muss!',
    solution3NF: 'In der getrennten Tabelle "Artikel" kann der Datensatz jederzeit unabhängig von Bestellungen angelegt werden.'
  },
  {
    id: 'update_anomaly',
    title: 'Änderungs-Anomalie (UPDATE Anomaly / Inkonsistenz)',
    definition: 'Die Änderung eines Attributwerts muss an vielen redundanten Stellen gleichzeitig erfolgen. Wird eine Stelle vergessen, entsteht ein inkonsistenter Datenbestand.',
    scenario1NF: 'Acme GmbH zieht um. Bei 100 früheren Bestellungen muss die Adresse 100-mal geändert werden. Wird ein Eintrag übersehen, existieren zwei verschiedene Adressen für denselben Kunden.',
    solution3NF: 'In der Kundentabelle wird die Adresse genau EINMAL aktualisiert. Alle Bestellungen referenzieren dieselbe KundenNr.'
  },
  {
    id: 'delete_anomaly',
    title: 'Lösch-Anomalie (DELETE Anomaly / Datenverlust)',
    definition: 'Das Löschen eines Datensatzes führt unbeabsichtigt zum unwiederbringlichen Verlust anderer, eigentlich erhaltenswerter Informationen.',
    scenario1NF: 'Die einzige Bestellung des Kunden "Byte AG" (BestellNr 102) wird storniert und gelöscht. Damit sind auch die Stammdaten des Kunden (Name, Ort) gelöscht!',
    solution3NF: 'Das Löschen einer Zeile in "Bestellungen" lässt den Eintrag in "Kunden" völlig unberührt.'
  }
];

/**
 * Bewertet eine Zuordnung von Normalformen
 * @param {string} nfKey - '1NF' | '2NF' | '3NF'
 * @returns {{ valid: boolean, rule: string, criteria: string[] }}
 */
export function evaluateNormalForm(nfKey) {
  switch (nfKey) {
    case '1NF':
      return {
        valid: true,
        rule: 'Alle Attribute müssen atomar (nicht weiter zerlegbar) sein und die Tabelle muss einen Primärschlüssel besitzen.',
        criteria: [
          'Keine Wiederholgruppen (z.B. Telefon1, Telefon2 in einer Zeile)',
          'Keine zusammengesetzten Werte (z.B. "Vorname Nachname" in einer Spalte)',
          'Eindeutiger Primärschlüssel vorhanden'
        ]
      };
    case '2NF':
      return {
        valid: true,
        rule: 'Tabelle ist in 1. NF und jedes Nichtschlüsselattribut ist voll funktional abhängig vom GESAMTEN Primärschlüssel.',
        criteria: [
          'Voraussetzung: 1. Normalform erfüllt',
          'Tritt nur bei zusammengesetzten Primärschlüsseln auf',
          'Kein Nichtschlüsselattribut darf nur von einem Teil des Schlüssels abhängen'
        ]
      };
    case '3NF':
      return {
        valid: true,
        rule: 'Tabelle ist in 2. NF und kein Nichtschlüsselattribut hängt transitiv von einem anderen Nichtschlüsselattribut ab.',
        criteria: [
          'Voraussetzung: 2. Normalform erfüllt',
          'Keine Kette A -> B -> C zwischen Nichtschlüsseln',
          'Typisches Beispiel: PLZ -> Ort auslagern'
        ]
      };
    default:
      return {
        valid: false,
        rule: 'Unbekannte Normalform',
        criteria: []
      };
  }
}

/**
 * IHK Prüfungsdrill Fragen für Normalisierung
 */
export const NORMALIZATION_DRILL_QUESTIONS = [
  {
    id: 'norm_1',
    frage: 'Wann befindet sich eine Relation in der 2. Normalform (2NF)?',
    optionen: [
      'Wenn sie in der 1. NF ist und jedes Nichtschlüsselattribut voll funktional vom gesamten Primärschlüssel abhängt.',
      'Wenn alle Fremdschlüssel durch Indizes abgesichert sind.',
      'Sobald keine Wiederholgruppen mehr vorhanden sind.',
      'Wenn keine transitiven Abhängigkeiten mehr existieren.'
    ],
    korrektIndex: 0,
    erklaerung: 'Die 2. Normalform verlangt die 1. NF plus den Ausschluss partieller Abhängigkeiten: Jedes Nichtschlüsselattribut muss vom gesamten Primärschlüssel abhängen (relevant bei zusammengesetzten Primärschlüsseln).'
  },
  {
    id: 'norm_2',
    frage: 'Welche der folgenden Tabellenspalten verletzt das Prinzip der 1. Normalform (Atomarität)?',
    optionen: [
      'Spalte "KundenName" mit dem Wert "Müller"',
      'Spalte "Hobbys" mit dem Wert "Fußball, Schach, Schwimmen"',
      'Spalte "Geburtsdatum" mit dem Wert "1998-04-12"',
      'Spalte "PreisCent" mit dem Wert "1999"'
    ],
    korrektIndex: 1,
    erklaerung: 'Eine Aufzählung wie "Fußball, Schach, Schwimmen" ist eine Wiederholgruppe / nicht-atomarer Wert. In 1NF muss dies in separate Zeilen oder eine eigene Verknüpfungstabelle ausgelagert werden.'
  },
  {
    id: 'norm_3',
    frage: 'In einer Tabelle mit dem Primärschlüssel (PersonalNr) gilt: PersonalNr -> AbteilungsNr und AbteilungsNr -> Abteilungsleiter. Welche Normalform wird hier verletzt?',
    optionen: [
      '1. Normalform',
      '2. Normalform',
      '3. Normalform',
      'Boyce-Codd-Normalform (BCNF)'
    ],
    korrektIndex: 2,
    erklaerung: 'Da Abteilungsleiter über AbteilungsNr transitiv von PersonalNr abhängt (PersonalNr -> AbteilungsNr -> Abteilungsleiter), wird die 3. Normalform verletzt. Die Abteilungsdaten müssen in eine eigene Tabelle "Abteilungen" ausgelagert werden.'
  },
  {
    id: 'norm_4',
    frage: 'Was versteht man unter einer "Änderungsanomalie" (Update Anomaly)?',
    optionen: [
      'Ein Datensatz kann nicht gelöscht werden, ohne die Datenbank neu zu starten.',
      'Redundante Daten führen bei unvollständiger Aktualisierung zu einem widersprüchlichen/inkonsistenten Datenbestand.',
      'Beim Einfügen eines Datensatzes stürzt die Datenbank ab.',
      'Zwei Benutzer versuchen gleichzeitig denselben Datensatz zu sperren.'
    ],
    korrektIndex: 1,
    erklaerung: 'Wenn identische Informationen mehrfach gespeichert sind und bei einer Änderung nicht alle Kopien erfasst werden, entstehen Widersprüche (Inkonsistenz).'
  }
];
