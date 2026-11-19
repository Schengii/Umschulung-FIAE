/**
 * @file exam-questions-extra.js
 * @description Additional questions of the IHK exam simulation: the question types beyond single
 * choice (multiple choice with partial credit, ordering, matching, numeric input and cloze) plus
 * further single-choice questions for thin topics. Joined to the pool in exam-questions.js; the
 * rules for scoring each type live in question-types.js.
 *
 * Like the rest of the pool these are practice tasks written for this site, not original exam tasks.
 */

/** @typedef {import('./exam-questions.js').ExamQuestion} ExamQuestion */

/** @param {[string, string]} pair */
const b = ([de, en]) => ({ de, en });

/**
 * @param {string} id
 * @param {ExamQuestion['exam']} exam
 * @param {string} topic
 * @param {[string, string]} question
 * @param {[string, string]} explanation
 * @param {Partial<ExamQuestion>} body
 * @returns {ExamQuestion}
 */
function make(id, exam, topic, question, explanation, body) {
    return {
        id,
        exam,
        topic,
        question: b(question),
        answers: [],
        correct: -1,
        explanation: b(explanation),
        ...body,
    };
}

/**
 * Single choice with exactly four answers.
 * @param {string} id
 * @param {ExamQuestion['exam']} exam
 * @param {string} topic
 * @param {[string, string]} question
 * @param {[string, string][]} answers
 * @param {number} correct
 * @param {[string, string]} explanation
 */
export const single = (id, exam, topic, question, answers, correct, explanation) =>
    make(id, exam, topic, question, explanation, { answers: answers.map(b), correct });

/**
 * Multiple choice: several answers are right, partial credit, wrong ticks subtract.
 * @param {string} id
 * @param {ExamQuestion['exam']} exam
 * @param {string} topic
 * @param {[string, string]} question
 * @param {[string, string][]} answers
 * @param {number[]} correctSet
 * @param {[string, string]} explanation
 */
const multi = (id, exam, topic, question, answers, correctSet, explanation) =>
    make(id, exam, topic, question, explanation, { type: 'multi', answers: answers.map(b), correctSet });

/**
 * Ordering: items are listed in the correct order, the exam shuffles them.
 * @param {string} id
 * @param {ExamQuestion['exam']} exam
 * @param {string} topic
 * @param {[string, string]} question
 * @param {[string, string][]} items
 * @param {[string, string]} explanation
 */
const order = (id, exam, topic, question, items, explanation) =>
    make(id, exam, topic, question, explanation, { type: 'order', items: items.map(b) });

/**
 * Matching: each left item belongs to the right item at the same position.
 * @param {string} id
 * @param {ExamQuestion['exam']} exam
 * @param {string} topic
 * @param {[string, string]} question
 * @param {[[string, string], [string, string]][]} pairs
 * @param {[string, string]} explanation
 */
const match = (id, exam, topic, question, pairs, explanation) =>
    make(id, exam, topic, question, explanation, {
        type: 'match',
        pairs: pairs.map(([left, right]) => ({ left: b(left), right: b(right) })),
    });

/**
 * Numeric input with tolerance.
 * @param {string} id
 * @param {ExamQuestion['exam']} exam
 * @param {string} topic
 * @param {[string, string]} question
 * @param {number} answer
 * @param {number} tolerance
 * @param {string} unit
 * @param {[string, string]} explanation
 */
const numeric = (id, exam, topic, question, answer, tolerance, unit, explanation) =>
    make(id, exam, topic, question, explanation, { type: 'numeric', answer, tolerance, unit });

/**
 * Cloze: `template` has {1}, {2} ... for the blanks, `blanks` lists the accepted spellings of each.
 * @param {string} id
 * @param {ExamQuestion['exam']} exam
 * @param {string} topic
 * @param {[string, string]} question
 * @param {[string, string]} template
 * @param {string[][]} blanks
 * @param {[string, string]} explanation
 */
const cloze = (id, exam, topic, question, template, blanks, explanation) =>
    make(id, exam, topic, question, explanation, { type: 'cloze', template: b(template), blanks });

/** @type {ExamQuestion[]} */
export const EXTRA_QUESTIONS = [
    // ------------------------------------------------------------ multiple choice
    multi(
        'ap1-sec-multi-passwort',
        'ap1',
        'security',
        [
            'Welche Maßnahmen erhöhen die Sicherheit von Zugangsdaten? (Mehrere Antworten)',
            'Which measures increase the security of credentials? (Several answers)',
        ],
        [
            ['Mindestens zwölf Zeichen lange Passwörter', 'Passwords of at least twelve characters'],
            [
                'Pro Dienst ein eigenes Passwort aus einem Passwort-Manager',
                'A separate password per service from a password manager',
            ],
            [
                'Das Passwort an Kollegen weitergeben, damit Vertretungen klappen',
                'Sharing the password with colleagues',
            ],
            ['Zwei-Faktor-Authentifizierung', 'Two-factor authentication'],
            ['Das Passwort auf einem Zettel am Monitor notieren', 'Writing the password on a note at the monitor'],
        ],
        [0, 1, 3],
        [
            'Lange, einzigartige Passwörter und ein zweiter Faktor schützen gut. Weitergabe und Zettel am Monitor heben den Schutz auf.',
            'Long unique passwords and a second factor protect well. Sharing and notes at the monitor remove the protection.',
        ]
    ),
    multi(
        'ap1-net-multi-private-ip',
        'ap1',
        'network',
        [
            'Welche der Adressen liegen in privaten IPv4-Bereichen (RFC 1918)? (Mehrere Antworten)',
            'Which of the addresses are in private IPv4 ranges (RFC 1918)? (Several answers)',
        ],
        [
            ['10.20.30.40', '10.20.30.40'],
            ['172.16.5.4', '172.16.5.4'],
            ['172.32.0.1', '172.32.0.1'],
            ['192.168.1.1', '192.168.1.1'],
            ['169.254.1.1', '169.254.1.1'],
        ],
        [0, 1, 3],
        [
            'Privat sind 10.0.0.0/8, 172.16.0.0/12 (172.16 bis 172.31) und 192.168.0.0/16. 172.32.x.x ist öffentlich, 169.254.x.x ist Link-Local (APIPA).',
            'Private ranges are 10.0.0.0/8, 172.16.0.0/12 (172.16 to 172.31) and 192.168.0.0/16. 172.32.x.x is public, 169.254.x.x is link-local (APIPA).',
        ]
    ),
    multi(
        'ap2-quality-multi-first',
        'ap2',
        'quality',
        [
            'Welche Eigenschaften zeichnen einen guten Unit-Test aus? (Mehrere Antworten)',
            'Which properties make a good unit test? (Several answers)',
        ],
        [
            ['Läuft schnell', 'Runs fast'],
            ['Hängt vom Ergebnis anderer Tests ab', 'Depends on the result of other tests'],
            ['Liefert bei jedem Lauf dasselbe Ergebnis', 'Gives the same result on every run'],
            ['Benötigt eine echte Produktivdatenbank', 'Needs a real production database'],
            ['Prüft sich selbst (bestanden oder nicht)', 'Checks itself (pass or fail)'],
        ],
        [0, 2, 4],
        [
            'Nach den F.I.R.S.T.-Regeln sind Tests schnell, unabhängig, wiederholbar, selbstprüfend und zeitnah geschrieben.',
            'By the F.I.R.S.T. rules tests are fast, independent, repeatable, self-validating and timely.',
        ]
    ),
    multi(
        'wiso-labour-multi-vertrag',
        'wiso',
        'labour',
        [
            'Was muss ein Ausbildungsvertrag nach dem Berufsbildungsgesetz mindestens enthalten? (Mehrere Antworten)',
            'What must a training contract contain at least under the Vocational Training Act? (Several answers)',
        ],
        [
            ['Beginn und Dauer der Berufsausbildung', 'Start and duration of the training'],
            ['Höhe und Fälligkeit der Vergütung', 'Amount and due date of the remuneration'],
            ['Dauer der regelmäßigen täglichen Ausbildungszeit', 'Length of the regular daily training time'],
            ['Sitz des Betriebsrats', 'Location of the works council'],
            ['Lieblingsfach der Auszubildenden', 'Favourite subject of the trainee'],
        ],
        [0, 1, 2],
        [
            'Der Vertrag nennt unter anderem Art, Gliederung, Beginn und Dauer der Ausbildung, tägliche Ausbildungszeit, Probezeit, Vergütung und Urlaub.',
            'The contract names, among other things, type, structure, start and duration of the training, daily training time, probation, remuneration and leave.',
        ]
    ),

    // ------------------------------------------------------------------- ordering
    order(
        'ap1-project-order-phasen',
        'ap1',
        'project',
        [
            'Bringen Sie die Phasen eines Projekts in die richtige Reihenfolge.',
            'Put the phases of a project in the right order.',
        ],
        [
            ['Projektauftrag klären und Ziele festlegen', 'Clarify the assignment and set goals'],
            ['Projekt planen (Aufgaben, Termine, Ressourcen)', 'Plan the project (tasks, dates, resources)'],
            ['Projekt durchführen und steuern', 'Carry out and control the project'],
            ['Abnahme, Übergabe und Abschluss', 'Acceptance, handover and closing'],
        ],
        [
            'Auf Auftragsklärung und Planung folgen Durchführung mit Steuerung und am Ende Abnahme und Abschluss.',
            'Clarifying the assignment and planning are followed by execution with control and finally acceptance and closing.',
        ]
    ),
    order(
        'ap1-net-order-osi',
        'ap1',
        'network',
        [
            'Ordnen Sie die OSI-Schichten 1 bis 4 von unten (Schicht 1) nach oben.',
            'Order OSI layers 1 to 4 from the bottom (layer 1) upwards.',
        ],
        [
            ['Bitübertragung (Physical)', 'Physical'],
            ['Sicherung (Data Link)', 'Data link'],
            ['Vermittlung (Network)', 'Network'],
            ['Transport (Transport)', 'Transport'],
        ],
        [
            'Die Schichten heißen von unten: 1 Bitübertragung, 2 Sicherung, 3 Vermittlung, 4 Transport.',
            'From the bottom the layers are: 1 physical, 2 data link, 3 network, 4 transport.',
        ]
    ),
    order(
        'ap2-architecture-order-sprint',
        'ap2',
        'architecture',
        [
            'Bringen Sie die Ereignisse eines Scrum-Sprints in die übliche Reihenfolge.',
            'Put the events of a Scrum sprint in their usual order.',
        ],
        [
            ['Sprint Planning', 'Sprint planning'],
            ['Daily Scrum (täglich)', 'Daily Scrum (every day)'],
            ['Sprint Review', 'Sprint review'],
            ['Sprint Retrospective', 'Sprint retrospective'],
        ],
        [
            'Der Sprint beginnt mit der Planung, im Verlauf gibt es das tägliche Daily Scrum, am Ende folgen Review (Produkt) und Retrospektive (Zusammenarbeit).',
            'The sprint starts with planning, the Daily Scrum takes place throughout, at the end come the review (product) and the retrospective (collaboration).',
        ]
    ),

    // ------------------------------------------------------------------- matching
    match(
        'ap1-net-match-ports',
        'ap1',
        'network',
        [
            'Ordnen Sie jedem Standardport das passende Protokoll zu.',
            'Match each standard port with the matching protocol.',
        ],
        [
            [
                ['Port 22', 'Port 22'],
                ['SSH', 'SSH'],
            ],
            [
                ['Port 53', 'Port 53'],
                ['DNS', 'DNS'],
            ],
            [
                ['Port 80', 'Port 80'],
                ['HTTP', 'HTTP'],
            ],
            [
                ['Port 443', 'Port 443'],
                ['HTTPS', 'HTTPS'],
            ],
        ],
        ['SSH nutzt 22, DNS 53, HTTP 80 und HTTPS 443.', 'SSH uses 22, DNS 53, HTTP 80 and HTTPS 443.']
    ),
    match(
        'ap2-sql-match-befehle',
        'ap2',
        'sql',
        ['Ordnen Sie jedem SQL-Befehl seine Aufgabe zu.', 'Match each SQL statement with its purpose.'],
        [
            [
                ['SELECT', 'SELECT'],
                ['Daten abfragen', 'Query data'],
            ],
            [
                ['INSERT', 'INSERT'],
                ['Neue Zeile anlegen', 'Create a new row'],
            ],
            [
                ['UPDATE', 'UPDATE'],
                ['Bestehende Zeilen ändern', 'Change existing rows'],
            ],
            [
                ['DELETE', 'DELETE'],
                ['Zeilen löschen', 'Delete rows'],
            ],
        ],
        [
            'SELECT liest, INSERT fügt ein, UPDATE ändert und DELETE entfernt Datensätze (Data Manipulation Language).',
            'SELECT reads, INSERT adds, UPDATE changes and DELETE removes records (data manipulation language).',
        ]
    ),
    match(
        'wiso-social-match-versicherung',
        'wiso',
        'social',
        [
            'Ordnen Sie jeder Sozialversicherung das abgesicherte Risiko zu.',
            'Match each social insurance with the risk it covers.',
        ],
        [
            [
                ['Krankenversicherung', 'Health insurance'],
                ['Krankheit', 'Illness'],
            ],
            [
                ['Rentenversicherung', 'Pension insurance'],
                ['Alter und Erwerbsminderung', 'Old age and reduced earning capacity'],
            ],
            [
                ['Arbeitslosenversicherung', 'Unemployment insurance'],
                ['Arbeitslosigkeit', 'Unemployment'],
            ],
            [
                ['Unfallversicherung', 'Accident insurance'],
                ['Arbeitsunfälle und Berufskrankheiten', 'Work accidents and occupational diseases'],
            ],
        ],
        [
            'Die fünf Zweige der Sozialversicherung sichern jeweils ein eigenes Risiko ab; die Pflegeversicherung ergänzt sie.',
            'Each branch of social insurance covers its own risk; long-term care insurance completes them.',
        ]
    ),

    // -------------------------------------------------------------------- numeric
    numeric(
        'ap1-net-numeric-hosts',
        'ap1',
        'network',
        [
            'Wie viele Hosts können in einem Subnetz mit der Maske /27 höchstens adressiert werden?',
            'How many hosts can be addressed at most in a subnet with the mask /27?',
        ],
        30,
        0,
        '',
        [
            '/27 lässt 5 Bit für Hosts: 2^5 = 32 Adressen, abzüglich Netz- und Broadcastadresse bleiben 30.',
            '/27 leaves 5 host bits: 2^5 = 32 addresses, minus network and broadcast address leaves 30.',
        ]
    ),
    numeric(
        'ap1-hw-numeric-speicher',
        'ap1',
        'hardware',
        [
            'Ein Video von 10 Minuten wird mit 25 Mbit/s aufgezeichnet. Wie viel Speicher in MB (1 Byte = 8 Bit) wird benötigt?',
            'A video of 10 minutes is recorded at 25 Mbit/s. How much storage in MB (1 byte = 8 bits) is needed?',
        ],
        1875,
        1,
        'MB',
        [
            '10 min = 600 s; 600 s × 25 Mbit/s = 15 000 Mbit; geteilt durch 8 ergibt 1 875 MB.',
            '10 min = 600 s; 600 s × 25 Mbit/s = 15,000 Mbit; divided by 8 gives 1,875 MB.',
        ]
    ),
    numeric(
        'ap1-basics-numeric-dual',
        'ap1',
        'basics',
        [
            'Welche Dezimalzahl entspricht der Dualzahl 10110101?',
            'Which decimal number corresponds to the binary number 10110101?',
        ],
        181,
        0,
        '',
        ['128 + 32 + 16 + 4 + 1 = 181.', '128 + 32 + 16 + 4 + 1 = 181.']
    ),
    numeric(
        'ap1-project-numeric-amortisation',
        'ap1',
        'project',
        [
            'Ein Projekt kostet 6 000 € und spart 500 € pro Monat. Nach wie vielen Monaten hat es sich amortisiert?',
            'A project costs €6,000 and saves €500 per month. After how many months has it paid for itself?',
        ],
        12,
        0,
        '',
        [
            'Amortisationszeit = Investition / monatliche Einsparung = 6 000 € / 500 € = 12 Monate.',
            'Payback period = investment / monthly saving = €6,000 / €500 = 12 months.',
        ]
    ),
    numeric(
        'wiso-business-numeric-breakeven',
        'wiso',
        'business',
        [
            'Fixkosten: 12 000 €, Verkaufspreis: 50 € je Stück, variable Kosten: 30 € je Stück. Wie groß ist die Gewinnschwelle (Break-even) in Stück?',
            'Fixed costs: €12,000, selling price: €50 per unit, variable costs: €30 per unit. What is the break-even quantity in units?',
        ],
        600,
        0,
        '',
        [
            'Deckungsbeitrag = 50 € − 30 € = 20 € je Stück; Fixkosten / Deckungsbeitrag = 12 000 € / 20 € = 600 Stück.',
            'Contribution margin = €50 − €30 = €20 per unit; fixed costs / margin = €12,000 / €20 = 600 units.',
        ]
    ),

    // ---------------------------------------------------------------------- cloze
    cloze(
        'ap2-sql-cloze-where',
        'ap2',
        'sql',
        [
            'Ergänzen Sie die Abfrage: alle Kunden aus Bonn, nach Name sortiert.',
            'Complete the query: all customers from Bonn, sorted by name.',
        ],
        ["SELECT * FROM kunde {1} stadt = 'Bonn' {2} name;", "SELECT * FROM kunde {1} stadt = 'Bonn' {2} name;"],
        [['WHERE'], ['ORDER BY']],
        [
            'WHERE filtert die Zeilen, ORDER BY sortiert das Ergebnis.',
            'WHERE filters the rows, ORDER BY sorts the result.',
        ]
    ),
    cloze(
        'ap2-sql-cloze-join',
        'ap2',
        'sql',
        [
            'Ergänzen Sie den Join, der Kunden mit ihren Bestellungen verbindet.',
            'Complete the join that connects customers with their orders.',
        ],
        [
            'SELECT k.name, b.datum FROM kunde k {1} bestellung b {2} k.id = b.kunde_id;',
            'SELECT k.name, b.datum FROM kunde k {1} bestellung b {2} k.id = b.kunde_id;',
        ],
        [['INNER JOIN', 'JOIN'], ['ON']],
        [
            'INNER JOIN (oder kurz JOIN) verbindet Tabellen, ON nennt die Verknüpfungsbedingung über Primär- und Fremdschlüssel.',
            'INNER JOIN (or just JOIN) connects tables, ON names the join condition over primary and foreign key.',
        ]
    ),
    cloze(
        'ap2-algorithms-cloze-schleife',
        'ap2',
        'algorithms',
        [
            'Ergänzen Sie die Schleife so, dass sie genau fünfmal läuft (i = 0 bis 4).',
            'Complete the loop so that it runs exactly five times (i = 0 to 4).',
        ],
        ['for (let i = 0; i {1} 5; i{2}) { ... }', 'for (let i = 0; i {1} 5; i{2}) { ... }'],
        [['<'], ['++']],
        [
            'Die Bedingung i < 5 bricht bei 5 ab, i++ zählt nach jedem Durchlauf um 1 hoch: Werte 0, 1, 2, 3, 4.',
            'The condition i < 5 stops at 5, i++ counts up by 1 after each pass: values 0, 1, 2, 3, 4.',
        ]
    ),

    // ----------------------------------------------- further single choice questions
    single(
        'ap1-hw-ram',
        'ap1',
        'hardware',
        ['Welche Aufgabe hat der Arbeitsspeicher (RAM)?', 'What is the purpose of the main memory (RAM)?'],
        [
            ['Dauerhafte Speicherung aller Dateien', 'Permanent storage of all files'],
            [
                'Flüchtiger Speicher für laufende Programme und deren Daten',
                'Volatile memory for running programs and their data',
            ],
            ['Berechnung von Grafiken', 'Calculating graphics'],
            ['Verbindung zum Netzwerk', 'Connection to the network'],
        ],
        1,
        [
            'RAM hält Programme und Daten nur, solange der Rechner Strom hat; dauerhaft speichern SSD oder HDD.',
            'RAM holds programs and data only while the computer has power; SSD or HDD store permanently.',
        ]
    ),
    single(
        'ap1-hw-ssd',
        'ap1',
        'hardware',
        ['Was unterscheidet eine SSD von einer HDD?', 'What distinguishes an SSD from an HDD?'],
        [
            [
                'Eine SSD hat Magnetscheiben, eine HDD Flash-Speicher',
                'An SSD has magnetic platters, an HDD has flash memory',
            ],
            [
                'Eine SSD speichert in Flash-Speicher ohne bewegliche Teile und ist beim Zugriff schneller',
                'An SSD stores in flash memory without moving parts and is faster to access',
            ],
            ['Eine SSD verliert beim Ausschalten ihre Daten', 'An SSD loses its data when switched off'],
            ['Eine SSD kann nur im Server eingesetzt werden', 'An SSD can only be used in a server'],
        ],
        1,
        [
            'Die HDD arbeitet mit rotierenden Magnetscheiben und Leseköpfen, die SSD mit Flash-Speicher ohne Mechanik.',
            'The HDD uses rotating magnetic platters and heads, the SSD uses flash memory without mechanics.',
        ]
    ),
    single(
        'ap1-sec-phishing',
        'ap1',
        'security',
        ['Was versteht man unter Phishing?', 'What is meant by phishing?'],
        [
            [
                'Das Abfangen von Daten in einem WLAN mit Absicht des Netzbetreibers',
                'Intercepting data in a Wi-Fi network with the operator’s consent',
            ],
            [
                'Den Versuch, mit gefälschten Nachrichten an Zugangsdaten oder Geld zu kommen',
                'An attempt to obtain credentials or money with forged messages',
            ],
            ['Die Verschlüsselung von Dateien mit Lösegeldforderung', 'Encrypting files with a ransom demand'],
            ['Das Überlasten eines Servers mit Anfragen', 'Overloading a server with requests'],
        ],
        1,
        [
            'Phishing täuscht Absender wie Bank oder Kollegen vor. Die Verschlüsselung mit Lösegeld ist Ransomware, das Überlasten ein DoS-Angriff.',
            'Phishing pretends to be a sender such as a bank or colleague. Encryption with ransom is ransomware, overloading is a DoS attack.',
        ]
    ),
    single(
        'ap1-project-smart',
        'ap1',
        'project',
        [
            'Wofür steht SMART bei der Formulierung von Projektzielen?',
            'What does SMART stand for when formulating project goals?',
        ],
        [
            [
                'Spezifisch, messbar, akzeptiert, realistisch, terminiert',
                'Specific, measurable, accepted, realistic, time-bound',
            ],
            ['Schnell, modern, agil, robust, testbar', 'Fast, modern, agile, robust, testable'],
            ['Sicher, minimal, aktuell, risikoarm, transparent', 'Secure, minimal, current, low-risk, transparent'],
            [
                'Strukturiert, mehrstufig, abgestimmt, rechtssicher, teamfähig',
                'Structured, multi-level, coordinated, legally safe, team-capable',
            ],
        ],
        0,
        [
            'SMART-Ziele sind spezifisch, messbar, akzeptiert (oder attraktiv), realistisch und terminiert.',
            'SMART goals are specific, measurable, accepted (or attractive), realistic and time-bound.',
        ]
    ),
    single(
        'ap1-basics-byte',
        'ap1',
        'basics',
        ['Aus wie vielen Bit besteht ein Byte?', 'How many bits make up one byte?'],
        [
            ['4', '4'],
            ['8', '8'],
            ['16', '16'],
            ['1024', '1024'],
        ],
        1,
        [
            'Ein Byte besteht aus 8 Bit und kann 256 verschiedene Werte darstellen.',
            'A byte consists of 8 bits and can represent 256 different values.',
        ]
    ),
    single(
        'ap1-basics-boolean',
        'ap1',
        'basics',
        [
            'Welcher Datentyp eignet sich für einen Wahrheitswert wie „angemeldet“?',
            'Which data type suits a truth value such as "logged in"?',
        ],
        [
            ['Integer', 'Integer'],
            ['String', 'String'],
            ['Boolean', 'Boolean'],
            ['Float', 'Float'],
        ],
        2,
        ['Ein Boolean kennt genau zwei Werte, wahr und falsch.', 'A boolean has exactly two values, true and false.']
    ),
    single(
        'ap2-quality-integration',
        'ap2',
        'quality',
        ['Was prüft ein Integrationstest vorrangig?', 'What does an integration test mainly check?'],
        [
            ['Die Funktion einer einzelnen Methode in Isolation', 'The function of a single method in isolation'],
            ['Das Zusammenspiel mehrerer Komponenten', 'The interplay of several components'],
            ['Die Bedienbarkeit durch echte Nutzer', 'Usability by real users'],
            ['Die Lesbarkeit des Quelltexts', 'The readability of the source code'],
        ],
        1,
        [
            'Der Unit-Test prüft einzelne Bausteine, der Integrationstest deren Zusammenspiel, der Systemtest das Gesamtsystem.',
            'The unit test checks single parts, the integration test their interplay, the system test the whole system.',
        ]
    ),
    single(
        'ap2-architecture-waterfall',
        'ap2',
        'architecture',
        ['Welche Aussage beschreibt das Wasserfallmodell?', 'Which statement describes the waterfall model?'],
        [
            [
                'Die Phasen werden nacheinander durchlaufen, Rücksprünge sind nicht vorgesehen',
                'The phases are run through one after another, going back is not planned',
            ],
            [
                'Es wird in kurzen Iterationen mit Kundenfeedback gearbeitet',
                'Work is done in short iterations with customer feedback',
            ],
            ['Es gibt keine festen Phasen', 'There are no fixed phases'],
            ['Der Test steht am Anfang jeder Phase', 'Testing is at the start of every phase'],
        ],
        0,
        [
            'Im klassischen Wasserfallmodell folgen Analyse, Entwurf, Implementierung, Test und Betrieb strikt aufeinander. Iterative Modelle wie Scrum arbeiten dagegen in Zyklen.',
            'In the classic waterfall model analysis, design, implementation, test and operation strictly follow each other. Iterative models such as Scrum work in cycles.',
        ]
    ),
    single(
        'wiso-labour-probezeit',
        'wiso',
        'labour',
        [
            'Wie lange darf die Probezeit in einem Berufsausbildungsverhältnis höchstens dauern?',
            'How long may the probation period in a vocational training relationship last at most?',
        ],
        [
            ['Einen Monat', 'One month'],
            ['Zwei Monate', 'Two months'],
            ['Vier Monate', 'Four months'],
            ['Sechs Monate', 'Six months'],
        ],
        2,
        [
            'Nach dem Berufsbildungsgesetz muss die Probezeit mindestens einen und darf höchstens vier Monate betragen.',
            'Under the Vocational Training Act the probation period must be at least one and at most four months.',
        ]
    ),
    single(
        'wiso-business-skonto',
        'wiso',
        'business',
        ['Was versteht man unter Skonto?', 'What is meant by a cash discount (Skonto)?'],
        [
            ['Einen Preisnachlass bei Zahlung innerhalb einer Frist', 'A price reduction for payment within a period'],
            ['Eine Mahngebühr bei verspäteter Zahlung', 'A reminder fee for late payment'],
            ['Einen Rabatt bei großer Abnahmemenge', 'A discount for large quantities'],
            ['Die Umsatzsteuer auf eine Rechnung', 'The sales tax on an invoice'],
        ],
        0,
        [
            'Skonto belohnt schnelles Zahlen. Der Mengenrabatt bezieht sich dagegen auf die Abnahmemenge.',
            'A cash discount rewards fast payment. A volume discount relates to the quantity purchased.',
        ]
    ),
];
