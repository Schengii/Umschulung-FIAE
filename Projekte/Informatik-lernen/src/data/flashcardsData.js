export const FLASHCARDS_DATA = [
  {
    id: 1,
    category: 'Grundlagen',
    difficulty: 'Einsteiger',
    front: 'Was ist ein Bit und wie unterscheidet es sich von einem Byte?',
    back: 'Ein Bit ist die kleinste Informationseinheit (0 oder 1). 1 Byte besteht aus 8 Bits und kann 256 verschiedene Zustände (0-255) darstellen.'
  },
  {
    id: 2,
    category: 'Datenbanken',
    difficulty: 'Azubi / IHK',
    front: 'Was ist der Unterschied zwischen einem Primärschlüssel (Primary Key) und einem Fremdschlüssel (Foreign Key)?',
    back: 'Ein Primärschlüssel identifiziert jeden Datensatz in einer Tabelle eindeutig. Ein Fremdschlüssel verweist auf den Primärschlüssel einer anderen Tabelle, um eine Beziehung herzustellen.'
  },
  {
    id: 3,
    category: 'Security',
    difficulty: 'Senior / Expert',
    front: 'Was versteht man unter Cross-Site Scripting (XSS)?',
    back: 'XSS ist eine Sicherheitslücke, bei der Angreifer bösartigen Skriptcode (meist JavaScript) in eine vertrauenswürdige Webseite einschleusen, der dann im Browser anderer Nutzer ausgeführt wird.'
  },
  {
    id: 4,
    category: 'Netzwerke',
    difficulty: 'Azubi / IHK',
    front: 'Was ist der Unterschied zwischen TCP und UDP?',
    back: 'TCP (Transmission Control Protocol) ist verbindungsorientiert und garantiert die korrekte, vollständige Paketübertragung. UDP ist verbindungslos, schneller, garantiert jedoch keine Auslieferung (ideal für Streaming/Gaming).'
  },
  {
    id: 5,
    category: 'Programmierung',
    difficulty: 'Junior / Professional',
    front: 'Was ist der Unterschied zwischen `==` und `===` in JavaScript?',
    back: '`==` vergleicht nur die Werte und führt eine implizite Typkonvertierung durch. `===` vergleicht sowohl Wert als auch Datentyp (strikt).'
  },
  {
    id: 6,
    category: 'Rechnerarchitektur',
    difficulty: 'Azubi / IHK',
    front: 'Welche vier Phasen durchläuft der Von-Neumann-Befehlszyklus (Taktzyklus)?',
    back: '1. FETCH (Befehl aus dem RAM ins IR laden)\n2. DECODE (Steuerwerk decodiert den Opcode)\n3. EXECUTE (ALU führt die Rechenoperation aus)\n4. WRITEBACK (Ergebnis im Akkumulator oder RAM speichern).'
  },
  {
    id: 7,
    category: 'Datenbanken',
    difficulty: 'Senior / Expert',
    front: 'Wann wählt der SQL Query Optimizer einen Index Scan statt eines Full Table Scans?',
    back: 'Wenn die Abfrage hochselektiv ist (nur ein kleiner Prozentsatz der Zeilen wird abgerufen, z. B. < 5-10%) und ein passender B-Tree Index auf den gefilterten Spalten (WHERE / JOIN) existiert.'
  },
  {
    id: 8,
    category: 'Security & Auth',
    difficulty: 'Junior / Professional',
    front: 'Was ist der Unterschied zwischen Authentifizierung und Autorisierung?',
    back: 'Authentifizierung = "Wer bist du?" (Identitätsprüfung via Passwort, MFA, JWT).\nAutorisierung = "Was darfst du tun?" (Rechteprüfung via Rollen/Permissions/RBAC).'
  },
  {
    id: 9,
    category: 'DevOps & Cloud',
    difficulty: 'Senior / Expert',
    front: 'Was ist der Unterschied zwischen einem Docker Image und einem Docker Container?',
    back: 'Ein Image ist die unveränderliche, schreibgeschützte Vorlage (Blueprint). Ein Container ist die laufende, isolierte Instanz dieses Images mit einer beschreibbaren obersten Ebene.'
  },
  {
    id: 10,
    category: 'IHK Prüfungswissen',
    difficulty: 'Azubi / IHK',
    front: 'Was bedeuten die Kennzahlen RTO (Recovery Time Objective) und RPO (Recovery Point Objective)?',
    back: 'RTO = Maximale Ausfallzeit (Wie schnell muss das System nach einem Crash wieder laufen?).\nRPO = Maximal tolerierbarer Datenverlust gemessen in Zeit (Wie alt darf das letzte Backup sein?).'
  }
];
