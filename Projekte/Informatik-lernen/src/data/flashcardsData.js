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
  },
  {
    id: 11,
    category: 'IHK Prüfungswissen',
    difficulty: 'Azubi / IHK',
    front: 'Was ist eine Nutzwertanalyse (NWA / Scoring-Modell) und wozu dient sie?',
    back: 'Ein qualitativ-quantitatives Verfahren zur Entscheidungsfindung unter Berücksichtigung nicht-monetärer Kriterien (z. B. Usability, Sicherheit, Support) mit Gewichtung und K.O.-Kriterien.'
  },
  {
    id: 12,
    category: 'Hardware & Storage',
    difficulty: 'Azubi / IHK',
    front: 'Wie berechnet sich die Nutzdaten-Kapazität bei einem RAID 5 und einem RAID 6?',
    back: 'RAID 5: (N - 1) * Kapazität kleinster Datenträger (1 Platte für verteilte Parität).\nRAID 6: (N - 2) * Kapazität kleinster Datenträger (2 Platten für Dual-Parität P + Q).'
  },
  {
    id: 13,
    category: 'Netzwerke',
    difficulty: 'Azubi / IHK',
    front: 'Was ist der Hauptvorteil von VLSM (Variable Length Subnet Masking)?',
    back: 'VLSM erlaubt es, Subnetze mit unterschiedlichen Präfixen (/25, /27, /30) innerhalb desselben Netzwerks einzurichten, wodurch IP-Adressverschwendung drastisch minimiert wird.'
  },
  {
    id: 14,
    category: 'Datenbanken',
    difficulty: 'Junior / Professional',
    front: 'Was bedeuten die ACID-Eigenschaften von Transaktionen in relationalen Datenbanken?',
    back: 'Atomicity (Ganz oder gar nicht), Consistency (Konsistente Zustände vor & nach), Isolation (Transaktionen beeinflussen sich nicht), Durability (Dauerhafte Persistenz nach Commit im WAL/Storage).'
  },
  {
    id: 15,
    category: 'Security',
    difficulty: 'Senior / Expert',
    front: 'Was ist der Unterschied zwischen symmetrischer und asymmetrischer Verschlüsselung?',
    back: 'Symmetrisch: Ein einziger gemeinsamer geheimer Schlüssel für Verschlüsselung und Entschlüsselung (z. B. AES - sehr schnell).\nAsymmetrisch: Schlüsselpaar aus Public Key (Verschlüsseln) und Private Key (Entschlüsseln, Signieren - z. B. RSA, ECC).'
  },
  {
    id: 16,
    category: 'Programmierung',
    difficulty: 'Junior / Professional',
    front: 'Was versteht man unter dem "Kritischen Pfad" in der Netzplantechnik (CPM)?',
    back: 'Die Kette von Vorgängen von Projektbeginn bis Projektende, bei denen die Pufferzeit gleich 0 ist (Gesamtpuffer GP = 0). Jede Verzögerung auf dem kritischen Pfad verzögert das Gesamtprojekt.'
  },
  {
    id: 17,
    category: 'WISO & Arbeitsrecht',
    difficulty: 'Azubi / IHK',
    front: 'Welche Rangordnung (Normenpyramide) gilt im deutschen Arbeitsrecht?',
    back: '1. EU-Recht & Grundgesetz\n2. Zwingende Bundesgesetze (BGB, ArbZG, KSchG)\n3. Tarifverträge\n4. Betriebsvereinbarungen\n5. Arbeitsvertrag (mit Günstigkeitsprinzip: zugunsten des Arbeitnehmers darf abgewichen werden).'
  },
  {
    id: 18,
    category: 'Netzwerke & Routing',
    difficulty: 'Azubi / IHK',
    front: 'Welche Aufgaben hat das Address Resolution Protocol (ARP)?',
    back: 'ARP ermittelt auf OSI-Schicht 2 die physikalische MAC-Adresse zu einer bekannten logischen Schicht-3 IPv4-Adresse im lokalen Netzsegment.'
  },
  {
    id: 19,
    category: 'Cloud & DevOps',
    difficulty: 'Junior / Professional',
    front: 'Was ist der Unterschied zwischen horizontaler und vertikaler Skalierung?',
    back: 'Vertikal (Scale-Up): Größere Hardware (mehr RAM, schnellere CPU im bestehenden Server).\nHorizontal (Scale-Out): Hinzufügen weiterer Server/Knoten und Lastverteilung via Load Balancer.'
  },
  {
    id: 20,
    category: 'Programmierung & Algorithmen',
    difficulty: 'Senior / Expert',
    front: 'Welche Zeitkomplexität (Big-O) haben binäre Suche (Binary Search) und lineare Suche?',
    back: 'Lineare Suche: O(n) (muss im Worst Case jedes Element prüfen).\nBinäre Suche: O(log n) (halbiert den Suchraum in jedem Schritt, setzt sortiertes Array voraus).'
  }
];
