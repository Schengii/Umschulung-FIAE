// @ts-check
/**
 * SQL Transaction Isolation & ACID Anomalies Engine
 * Gemäß ANSI SQL / ISO 9075 & PostgreSQL Dokumentation
 * 
 * Behandelt die 4 ANSI-SQL-Isolationslevel:
 * 1. Read Uncommitted
 * 2. Read Committed (Postgres Default)
 * 3. Repeatable Read
 * 4. Serializable
 * 
 * Behandelt die 4 klassischen Transaktionsanomalien:
 * - Dirty Read (G0 / P1)
 * - Non-Repeatable Read (Fuzzy Read / P2)
 * - Phantom Read (P3)
 * - Serialization Anomaly / Write Skew (A5B)
 */

/**
 * @typedef {'read_uncommitted' | 'read_committed' | 'repeatable_read' | 'serializable'} IsolationLevel
 * @typedef {'dirty_read' | 'non_repeatable_read' | 'phantom_read' | 'write_skew'} AnomalyType
 */

export const ISOLATION_LEVELS = {
  read_uncommitted: {
    id: 'read_uncommitted',
    name: 'Read Uncommitted',
    description: 'Transaktionen können Daten sehen, die von anderen, noch nicht committeten Transaktionen geändert wurden. Erlaubt maximale Concurrency, birgt aber höchste Inkonsistenzrisiken.',
    allowsDirtyRead: true,
    allowsNonRepeatableRead: true,
    allowsPhantomRead: true,
    allowsWriteSkew: true
  },
  read_committed: {
    id: 'read_committed',
    name: 'Read Committed',
    description: 'Transaktionen sehen nur fest committete Daten. Verhindert Dirty Reads. Standard in PostgreSQL, Oracle und SQL Server.',
    allowsDirtyRead: false,
    allowsNonRepeatableRead: true,
    allowsPhantomRead: true,
    allowsWriteSkew: true
  },
  repeatable_read: {
    id: 'repeatable_read',
    name: 'Repeatable Read',
    description: 'Ein Snapshot wird zu Beginn der Transaktion erzeugt. Wiederholte SELECT-Abfragen liefern exakt dieselben Datenzeilen. In modernen MVCC-Engines wie Postgres werden auch Phantoms meist verhindert.',
    allowsDirtyRead: false,
    allowsNonRepeatableRead: false,
    allowsPhantomRead: false, // In PostgreSQL verhindert Repeatable Read auch Phantoms via Snapshot
    allowsWriteSkew: true
  },
  serializable: {
    id: 'serializable',
    name: 'Serializable (SSI)',
    description: 'Strikteste Isolationsstufe. Garantiert, dass die parallele Ausführung dasselbe Ergebnis liefert wie eine rein sequentielle Ausführung (Serializable Snapshot Isolation / SSI). Verhindert Write Skew.',
    allowsDirtyRead: false,
    allowsNonRepeatableRead: false,
    allowsPhantomRead: false,
    allowsWriteSkew: false
  }
};

export const ANOMALIES = {
  dirty_read: {
    id: 'dirty_read',
    title: 'Dirty Read (Schmutziges Lesen)',
    summary: 'Transaktion 2 liest Änderungen von Transaktion 1, bevor Tx 1 committet. Rollt Tx 1 anschließend zurück (ROLLBACK), hat Tx 2 mit Daten gearbeitet, die es nie offiziell gab.',
    scenario: [
      { step: 1, tx: 'Tx 1', action: "UPDATE konto SET saldo = saldo - 500 WHERE id = 1; (Noch kein COMMIT)", sql: "UPDATE konto SET saldo = 500 WHERE id = 1;" },
      { step: 2, tx: 'Tx 2', action: "SELECT saldo FROM konto WHERE id = 1; -> Liest 500 €", sql: "SELECT saldo FROM konto WHERE id = 1;" },
      { step: 3, tx: 'Tx 1', action: "ROLLBACK; (Abbruch, Saldo springt zurück auf 1000 €)", sql: "ROLLBACK;" },
      { step: 4, tx: 'Tx 2', action: "Tx 2 hat mit den falschen 500 € weitergerechnet! Inkonsistenz!", sql: "-- Tx 2 arbeitete auf Geisterdaten" }
    ]
  },
  non_repeatable_read: {
    id: 'non_repeatable_read',
    title: 'Non-Repeatable Read (Nicht wiederholbares Lesen)',
    summary: 'Transaktion 1 liest dieselbe Zeile zweimal. Dazwischen ändert Transaktion 2 diese Zeile und committet. Tx 1 erhält bei der zweiten Abfrage veränderte Werte.',
    scenario: [
      { step: 1, tx: 'Tx 1', action: "SELECT preis FROM artikel WHERE id = 42; -> Liefert 100 €", sql: "SELECT preis FROM artikel WHERE id = 42;" },
      { step: 2, tx: 'Tx 2', action: "UPDATE artikel SET preis = 150 WHERE id = 42; COMMIT;", sql: "UPDATE artikel SET preis = 150 WHERE id = 42; COMMIT;" },
      { step: 3, tx: 'Tx 1', action: "SELECT preis FROM artikel WHERE id = 42; -> Liefert plötzlich 150 €!", sql: "SELECT preis FROM artikel WHERE id = 42;" }
    ]
  },
  phantom_read: {
    id: 'phantom_read',
    title: 'Phantom Read (Phantomzeilen)',
    summary: 'Transaktion 1 fragt eine Menge von Zeilen mit einer WHERE-Bedingung ab. Transaktion 2 fügt eine neue passende Zeile ein und committet. Beim erneuten Query sieht Tx 1 neue "Phantom"-Zeilen.',
    scenario: [
      { step: 1, tx: 'Tx 1', action: "SELECT COUNT(*) FROM mitarbeiter WHERE abteilung = 'IT'; -> 5", sql: "SELECT COUNT(*) FROM mitarbeiter WHERE abteilung = 'IT';" },
      { step: 2, tx: 'Tx 2', action: "INSERT INTO mitarbeiter VALUES ('Max', 'IT'); COMMIT;", sql: "INSERT INTO mitarbeiter VALUES ('Max', 'IT'); COMMIT;" },
      { step: 3, tx: 'Tx 1', action: "SELECT COUNT(*) FROM mitarbeiter WHERE abteilung = 'IT'; -> Plötzlich 6!", sql: "SELECT COUNT(*) FROM mitarbeiter WHERE abteilung = 'IT';" }
    ]
  },
  write_skew: {
    id: 'write_skew',
    title: 'Write Skew (Inkonsistentes paralleles Schreiben)',
    summary: 'Zwei Transaktionen lesen denselben Zustand, prüfen eine Integritätsbedingung (z.B. "Mindestens ein Arzt muss im Dienst sein") und aktualisieren überlappende, aber verschiedene Datensätze zeitgleich.',
    scenario: [
      { step: 1, tx: 'Tx 1 & 2', action: "Beide Ärzte Dr. A & Dr. B sind im Dienst (COUNT >= 1 Bedingung erfüllt).", sql: "SELECT COUNT(*) FROM bereitschaft WHERE aktiv = true; -- ergibt 2" },
      { step: 2, tx: 'Tx 1', action: "Dr. A meldet sich ab: UPDATE bereitschaft SET aktiv=false WHERE arzt='A'; COMMIT;", sql: "UPDATE bereitschaft SET aktiv=false WHERE arzt='A'; COMMIT;" },
      { step: 3, tx: 'Tx 2', action: "Zeitgleich meldet sich Dr. B ab: UPDATE bereitschaft SET aktiv=false WHERE arzt='B'; COMMIT;", sql: "UPDATE bereitschaft SET aktiv=false WHERE arzt='B'; COMMIT;" },
      { step: 4, tx: 'Ergebnis', action: "Kein Arzt mehr im Dienst! Beide Tx waren für sich valide, die Kombination verletzt die Regel.", sql: "-- Integrity Constraint verletzt! Nur Serializable (SSI) verhindert dies." }
    ]
  }
};

/**
 * Simuliert das Verhalten einer Transaktion bei gegebenem Isolationslevel und Anomalie
 * @param {IsolationLevel} level
 * @param {AnomalyType} anomaly
 * @returns {{ prevented: boolean, explanation: string, technicalDetail: string }}
 */
export function simulateTransactionIsolation(level, anomaly) {
  const lvlConfig = ISOLATION_LEVELS[level] || ISOLATION_LEVELS.read_committed;

  switch (anomaly) {
    case 'dirty_read': {
      if (lvlConfig.allowsDirtyRead) {
        return {
          prevented: false,
          explanation: 'Gefahr! Der Dirty Read tritt auf. Tx 2 liest ungeprüfte, uncommittete Änderungen.',
          technicalDetail: 'Unter Read Uncommitted setzt die Engine keine Shared Locks bei SELECT und liest uncommittete Speicherseiten direkt aus dem Shared Buffer Cache.'
        };
      }
      return {
        prevented: true,
        explanation: 'Erfolgreich verhindert. Tx 2 sieht nur Daten mit xmin/xmax, die vor Transaktionsbeginn committet wurden.',
        technicalDetail: 'Unter Read Committed ignoriert die MVCC-Snapshot-Engine alle Tupel mit uncommitteter Transaktions-ID (Current Transaction ID ist noch aktiv).'
      };
    }

    case 'non_repeatable_read': {
      if (lvlConfig.allowsNonRepeatableRead) {
        return {
          prevented: false,
          explanation: 'Non-Repeatable Read tritt auf. Zwei SELECTs innerhalb derselben Transaktion liefern unterschiedliche Werte für denselben Datensatz.',
          technicalDetail: 'Unter Read Committed wird für JEDES einzelne Statement ein neuer MVCC-Snapshot erzeugt. Wurde zwischenzeitlich committet, sieht der zweite SELECT die neuen Werte.'
        };
      }
      return {
        prevented: true,
        explanation: 'Erfolgreich verhindert. Beide SELECT-Abfragen liefern exakt denselben Wert.',
        technicalDetail: 'Unter Repeatable Read & Serializable wird der MVCC-Snapshot beim ALLERERSTEN Query der Transaktion eingefroren und für alle nachfolgenden Queries unverändert beibehalten.'
      };
    }

    case 'phantom_read': {
      if (lvlConfig.allowsPhantomRead) {
        return {
          prevented: false,
          explanation: 'Phantom Read tritt auf. Neu eingefügte Zeilen tauchen bei einer wiederholten Bereichsabfrage auf.',
          technicalDetail: 'Ohne Snapshot-Isolation oder Predicate Locks können andere Transaktionen neue Zeilen in den abgefragten Indexbereich einfügen.'
        };
      }
      return {
        prevented: true,
        explanation: 'Erfolgreich verhindert. Der Transaktions-Snapshot ignoriert nach Transaktionsbeginn eingefügte Phantom-Tupel.',
        technicalDetail: 'Postgres Snapshot Isolation schließt Zeilen mit xmin > Snapshot.xmax oder xmin im Active Transaction Array automatisch aus.'
      };
    }

    case 'write_skew': {
      if (lvlConfig.allowsWriteSkew) {
        return {
          prevented: false,
          explanation: 'Write Skew tritt auf! Trotz Snapshot-Isolation verletzen beide parallelen Schreiboperationen zusammen die Konsistenzbedingung.',
          technicalDetail: 'Weil beide Transaktionen disjunkte Zeilen modifizieren (Dr. A vs. Dr. B), schlägt die row-level write-write Konflikterkennung von Repeatable Read nicht an!'
        };
      }
      return {
        prevented: true,
        explanation: 'Erfolgreich verhindert! Die Engine erkennt den Serialisierungs-Graph-Zyklus (rw-Antidependency) und wirft einen Serialisierungsfehler.',
        technicalDetail: 'Serializable Snapshot Isolation (SSI) trackt SIREAD Locks auf Tupel- und Page-Ebene. Bei zyklischen Abhängigkeiten wird eine Transaktion mit SQLSTATE 40001 (serialization_failure) abgebrochen.'
      };
    }

    default:
      return {
        prevented: false,
        explanation: 'Unbekannte Anomalie.',
        technicalDetail: ''
      };
  }
}
