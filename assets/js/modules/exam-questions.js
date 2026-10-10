/**
 * @file exam-questions.js
 * @description Question pool of the IHK exam simulation (quiz.html), grouped by exam part
 * and topic. Pure data, bilingual. Every question has exactly four answers; `correct` is
 * the index of the right one (the simulator shuffles the order per attempt).
 *
 * The questions are practice material written for this site in the style of the written
 * IHK exams. They are not original exam tasks.
 */

/**
 * @typedef {{de: string, en: string}} Bilingual
 * @typedef {object} ExamQuestion
 * @property {string} id
 * @property {'ap1' | 'ap2' | 'wiso'} exam
 * @property {string} topic key of EXAM_TOPICS
 * @property {Bilingual} question
 * @property {Bilingual[]} answers
 * @property {number} correct
 * @property {Bilingual} explanation
 */

/**
 * Topics with their display names. `category` is the flashcard category that covers the
 * topic; the dashboard uses it to recommend what to study after a weak result.
 * @type {Record<string, Bilingual & {category: string}>}
 */
export const EXAM_TOPICS = {
    hardware: { de: 'Hardware & Arbeitsplatz', en: 'Hardware & workplace', category: 'network' },
    network: { de: 'Netzwerke', en: 'Networking', category: 'network' },
    security: { de: 'IT-Sicherheit & Datenschutz', en: 'IT security & data protection', category: 'network' },
    project: { de: 'Projektmanagement', en: 'Project management', category: 'software' },
    basics: { de: 'Software-Grundlagen', en: 'Software basics', category: 'software' },
    oop: { de: 'OOP & UML', en: 'OOP & UML', category: 'software' },
    sql: { de: 'Datenbanken & SQL', en: 'Databases & SQL', category: 'database' },
    algorithms: { de: 'Algorithmen & Datenstrukturen', en: 'Algorithms & data structures', category: 'software' },
    quality: { de: 'Testen & Qualitätssicherung', en: 'Testing & quality assurance', category: 'software' },
    architecture: { de: 'Architektur & Vorgehensmodelle', en: 'Architecture & process models', category: 'software' },
    labour: { de: 'Arbeits- & Ausbildungsrecht', en: 'Labour & training law', category: 'wiso' },
    social: { de: 'Sozialversicherung', en: 'Social insurance', category: 'wiso' },
    business: { de: 'Betrieb & Wirtschaft', en: 'Business & economics', category: 'wiso' },
    codetermination: {
        de: 'Mitbestimmung & Tarifrecht',
        en: 'Co-determination & collective agreements',
        category: 'wiso',
    },
};

/** Compact constructor: answers are [de, en] pairs. */
function q(id, exam, topic, de, en, answers, correct, explanationDe, explanationEn) {
    return {
        id,
        exam,
        topic,
        question: { de, en },
        answers: answers.map(([answerDe, answerEn]) => ({ de: answerDe, en: answerEn })),
        correct,
        explanation: { de: explanationDe, en: explanationEn },
    };
}

/** @type {ExamQuestion[]} */
export const EXAM_QUESTIONS = [
    // ------------------------------------------------------------------ AP1
    q(
        'ap1-hw-raid1',
        'ap1',
        'hardware',
        'Zwei Festplatten mit je 4 TB werden als RAID 1 betrieben. Wie groß ist die nutzbare Kapazität?',
        'Two 4 TB disks run as RAID 1. What is the usable capacity?',
        [
            ['2 TB', '2 TB'],
            ['4 TB', '4 TB'],
            ['6 TB', '6 TB'],
            ['8 TB', '8 TB'],
        ],
        1,
        'RAID 1 spiegelt die Daten. Nutzbar ist nur die Kapazität einer Platte: 4 TB.',
        'RAID 1 mirrors the data. Only the capacity of one disk is usable: 4 TB.'
    ),
    q(
        'ap1-hw-raid5',
        'ap1',
        'hardware',
        'Ein RAID 5 besteht aus vier Festplatten mit je 2 TB. Wie groß ist die nutzbare Kapazität?',
        'A RAID 5 consists of four 2 TB disks. What is the usable capacity?',
        [
            ['2 TB', '2 TB'],
            ['4 TB', '4 TB'],
            ['6 TB', '6 TB'],
            ['8 TB', '8 TB'],
        ],
        2,
        'RAID 5 verwendet die Kapazität einer Platte für Paritätsdaten: (4 − 1) × 2 TB = 6 TB.',
        'RAID 5 uses the capacity of one disk for parity: (4 − 1) × 2 TB = 6 TB.'
    ),
    q(
        'ap1-hw-usv',
        'ap1',
        'hardware',
        'Welche Aufgabe hat eine unterbrechungsfreie Stromversorgung (USV)?',
        'What is the purpose of an uninterruptible power supply (UPS)?',
        [
            [
                'Sie senkt dauerhaft den Stromverbrauch der Server.',
                'It permanently lowers the power consumption of the servers.',
            ],
            [
                'Sie überbrückt Stromausfälle und ermöglicht ein geordnetes Herunterfahren.',
                'It bridges power failures and allows a controlled shutdown.',
            ],
            ['Sie ersetzt die Datensicherung.', 'It replaces the data backup.'],
            ['Sie schützt das Netzwerk vor Schadsoftware.', 'It protects the network against malware.'],
        ],
        1,
        'Eine USV liefert bei Netzausfall für begrenzte Zeit Strom aus Akkus und filtert Spannungsschwankungen.',
        'A UPS supplies power from batteries for a limited time during an outage and filters voltage fluctuations.'
    ),
    q(
        'ap1-hw-stromkosten',
        'ap1',
        'hardware',
        'Ein PC nimmt 150 W auf und läuft an 220 Arbeitstagen je 8 Stunden. Der Strompreis beträgt 0,30 €/kWh. Wie hoch sind die Stromkosten pro Jahr?',
        'A PC draws 150 W and runs 8 hours on 220 working days. Electricity costs €0.30/kWh. What are the electricity costs per year?',
        [
            ['52,80 €', '€52.80'],
            ['79,20 €', '€79.20'],
            ['264,00 €', '€264.00'],
            ['792,00 €', '€792.00'],
        ],
        1,
        '0,15 kW × 8 h × 220 Tage = 264 kWh; 264 kWh × 0,30 €/kWh = 79,20 €.',
        '0.15 kW × 8 h × 220 days = 264 kWh; 264 kWh × €0.30/kWh = €79.20.'
    ),
    q(
        'ap1-net-subnet',
        'ap1',
        'network',
        'Wie viele Hosts lassen sich in einem IPv4-Subnetz mit der Präfixlänge /26 adressieren?',
        'How many hosts can be addressed in an IPv4 subnet with prefix length /26?',
        [
            ['30', '30'],
            ['62', '62'],
            ['64', '64'],
            ['126', '126'],
        ],
        1,
        '/26 lässt 6 Host-Bits: 2⁶ = 64 Adressen, abzüglich Netz- und Broadcast-Adresse bleiben 62 Hosts.',
        '/26 leaves 6 host bits: 2⁶ = 64 addresses, minus network and broadcast address leaves 62 hosts.'
    ),
    q(
        'ap1-net-dhcp',
        'ap1',
        'network',
        'Welches Protokoll weist Clients automatisch eine IP-Konfiguration zu?',
        'Which protocol assigns an IP configuration to clients automatically?',
        [
            ['DNS', 'DNS'],
            ['ARP', 'ARP'],
            ['DHCP', 'DHCP'],
            ['NAT', 'NAT'],
        ],
        2,
        'DHCP verteilt IP-Adresse, Subnetzmaske, Gateway und DNS-Server. DNS löst Namen auf, ARP ermittelt MAC-Adressen.',
        'DHCP hands out IP address, subnet mask, gateway and DNS server. DNS resolves names, ARP finds MAC addresses.'
    ),
    q(
        'ap1-net-router',
        'ap1',
        'network',
        'Auf welcher Schicht des OSI-Modells arbeitet ein Router?',
        'On which layer of the OSI model does a router operate?',
        [
            ['Schicht 1 (Bitübertragung)', 'Layer 1 (physical)'],
            ['Schicht 2 (Sicherung)', 'Layer 2 (data link)'],
            ['Schicht 3 (Vermittlung)', 'Layer 3 (network)'],
            ['Schicht 4 (Transport)', 'Layer 4 (transport)'],
        ],
        2,
        'Router leiten Pakete anhand von IP-Adressen weiter, also auf Schicht 3. Switches arbeiten auf Schicht 2.',
        'Routers forward packets based on IP addresses, i.e. on layer 3. Switches work on layer 2.'
    ),
    q(
        'ap1-net-ipv6',
        'ap1',
        'network',
        'Wie lang ist eine IPv6-Adresse?',
        'How long is an IPv6 address?',
        [
            ['32 Bit', '32 bits'],
            ['64 Bit', '64 bits'],
            ['128 Bit', '128 bits'],
            ['256 Bit', '256 bits'],
        ],
        2,
        'IPv6-Adressen haben 128 Bit und werden in acht Blöcken zu je vier Hexadezimalziffern geschrieben.',
        'IPv6 addresses have 128 bits and are written as eight groups of four hexadecimal digits.'
    ),
    q(
        'ap1-net-https',
        'ap1',
        'network',
        'Welchen Standard-Port verwendet HTTPS?',
        'Which default port does HTTPS use?',
        [
            ['22', '22'],
            ['80', '80'],
            ['443', '443'],
            ['3389', '3389'],
        ],
        2,
        'HTTPS nutzt TCP-Port 443. Port 80 ist HTTP, 22 SSH und 3389 RDP.',
        'HTTPS uses TCP port 443. Port 80 is HTTP, 22 SSH and 3389 RDP.'
    ),
    q(
        'ap1-sec-schutzziele',
        'ap1',
        'security',
        'Welcher Begriff gehört NICHT zu den drei klassischen Schutzzielen der Informationssicherheit?',
        'Which term is NOT one of the three classic protection goals of information security?',
        [
            ['Vertraulichkeit', 'Confidentiality'],
            ['Integrität', 'Integrity'],
            ['Verfügbarkeit', 'Availability'],
            ['Skalierbarkeit', 'Scalability'],
        ],
        3,
        'Die drei Schutzziele sind Vertraulichkeit, Integrität und Verfügbarkeit (CIA). Skalierbarkeit ist ein Qualitätsmerkmal.',
        'The three goals are confidentiality, integrity and availability (CIA). Scalability is a quality attribute.'
    ),
    q(
        'ap1-sec-asymmetrisch',
        'ap1',
        'security',
        'Alice möchte Bob eine vertrauliche Nachricht mit asymmetrischer Verschlüsselung senden. Welchen Schlüssel verwendet sie zum Verschlüsseln?',
        'Alice wants to send Bob a confidential message using asymmetric encryption. Which key does she use to encrypt?',
        [
            ['Ihren eigenen privaten Schlüssel', 'Her own private key'],
            ['Ihren eigenen öffentlichen Schlüssel', 'Her own public key'],
            ['Bobs öffentlichen Schlüssel', "Bob's public key"],
            ['Bobs privaten Schlüssel', "Bob's private key"],
        ],
        2,
        'Verschlüsselt wird mit dem öffentlichen Schlüssel des Empfängers; nur dessen privater Schlüssel kann entschlüsseln.',
        "Encryption uses the recipient's public key; only the recipient's private key can decrypt."
    ),
    q(
        'ap1-sec-backup321',
        'ap1',
        'security',
        'Was besagt die 3-2-1-Regel der Datensicherung?',
        'What does the 3-2-1 backup rule say?',
        [
            [
                'Drei Kopien, auf zwei verschiedenen Medientypen, eine davon außer Haus',
                'Three copies, on two different media types, one of them off-site',
            ],
            [
                'Drei Vollsicherungen pro Woche, zwei pro Monat, eine pro Jahr',
                'Three full backups a week, two a month, one a year',
            ],
            ['Drei Server, zwei Netzteile, eine USV', 'Three servers, two power supplies, one UPS'],
            ['Drei Passwörter, zwei Faktoren, ein Administrator', 'Three passwords, two factors, one administrator'],
        ],
        0,
        'Mindestens drei Kopien der Daten, auf zwei unterschiedlichen Speichermedien, davon eine an einem anderen Standort.',
        'At least three copies of the data, on two different storage media, one of them at another location.'
    ),
    q(
        'ap1-sec-dsgvo',
        'ap1',
        'security',
        'Welche der folgenden Angaben ist ein personenbezogenes Datum im Sinne der DSGVO?',
        'Which of the following is personal data within the meaning of the GDPR?',
        [
            ['Eine anonymisierte Umsatzstatistik', 'An anonymised sales statistic'],
            ['Die E-Mail-Adresse einer Kundin', 'The email address of a customer'],
            ['Die Seriennummer eines Lagerregals', 'The serial number of a storage rack'],
            ['Die Außentemperatur am Firmenstandort', 'The outside temperature at the company site'],
        ],
        1,
        'Personenbezogen sind alle Informationen, die sich auf eine identifizierte oder identifizierbare Person beziehen.',
        'Personal data is any information relating to an identified or identifiable person.'
    ),
    q(
        'ap1-sec-differenziell',
        'ap1',
        'security',
        'Welche Sicherungsart speichert alle Daten, die sich seit der letzten Vollsicherung geändert haben?',
        'Which backup type stores all data that has changed since the last full backup?',
        [
            ['Inkrementelle Sicherung', 'Incremental backup'],
            ['Differenzielle Sicherung', 'Differential backup'],
            ['Vollsicherung', 'Full backup'],
            ['Spiegelung (RAID 1)', 'Mirroring (RAID 1)'],
        ],
        1,
        'Die differenzielle Sicherung bezieht sich immer auf die letzte Vollsicherung, die inkrementelle auf die jeweils letzte Sicherung.',
        'A differential backup always refers to the last full backup, an incremental one to the most recent backup of any kind.'
    ),
    q(
        'ap1-pm-smart',
        'ap1',
        'project',
        'Wofür steht das „T“ in der SMART-Formel für Ziele?',
        'What does the "T" in the SMART formula for goals stand for?',
        [
            ['Technisch', 'Technical'],
            ['Terminiert', 'Time-bound'],
            ['Transparent', 'Transparent'],
            ['Teamorientiert', 'Team-oriented'],
        ],
        1,
        'SMART: spezifisch, messbar, attraktiv/akzeptiert, realistisch, terminiert.',
        'SMART: specific, measurable, achievable, realistic, time-bound.'
    ),
    q(
        'ap1-pm-nutzwert',
        'ap1',
        'project',
        'Wozu dient eine Nutzwertanalyse?',
        'What is a utility analysis (weighted scoring model) used for?',
        [
            [
                'Zum Vergleich von Alternativen anhand gewichteter Kriterien',
                'To compare alternatives using weighted criteria',
            ],
            ['Zur Berechnung der Abschreibung eines Servers', 'To calculate the depreciation of a server'],
            ['Zur Ermittlung des kritischen Pfads', 'To determine the critical path'],
            ['Zur Messung der Netzwerkauslastung', 'To measure network utilisation'],
        ],
        0,
        'Kriterien werden gewichtet, jede Alternative wird je Kriterium bewertet; die Summe der gewichteten Punkte ist der Nutzwert.',
        'Criteria are weighted and each alternative is scored per criterion; the sum of weighted points is its utility value.'
    ),
    q(
        'ap1-pm-lastenheft',
        'ap1',
        'project',
        'Wer erstellt das Lastenheft?',
        'Who writes the requirements specification (Lastenheft)?',
        [
            ['Der Auftraggeber', 'The client'],
            ['Der Auftragnehmer', 'The contractor'],
            ['Die IHK', 'The chamber of commerce'],
            ['Der Datenschutzbeauftragte', 'The data protection officer'],
        ],
        0,
        'Das Lastenheft beschreibt die Anforderungen aus Sicht des Auftraggebers. Der Auftragnehmer antwortet mit dem Pflichtenheft.',
        "It describes the requirements from the client's point of view. The contractor answers with the functional specification (Pflichtenheft)."
    ),
    q(
        'ap1-pm-kritischer-pfad',
        'ap1',
        'project',
        'Was kennzeichnet den kritischen Pfad in einem Netzplan?',
        'What characterises the critical path in a network plan?',
        [
            ['Er enthält die teuersten Vorgänge.', 'It contains the most expensive activities.'],
            [
                'Er ist der längste Weg durch den Netzplan; seine Vorgänge haben keinen Puffer.',
                'It is the longest path through the plan; its activities have no float.',
            ],
            ['Er ist der kürzeste Weg vom Start zum Ziel.', 'It is the shortest path from start to finish.'],
            ['Er enthält nur Vorgänge ohne Vorgänger.', 'It contains only activities without predecessors.'],
        ],
        1,
        'Der kritische Pfad bestimmt die Projektdauer. Verzögert sich ein Vorgang darauf, verzögert sich das Projektende.',
        'The critical path determines the project duration. A delay of any activity on it delays the end of the project.'
    ),
    q(
        'ap1-sw-hex',
        'ap1',
        'basics',
        'Welcher Hexadezimalwert entspricht der Dualzahl 1011 0110?',
        'Which hexadecimal value corresponds to the binary number 1011 0110?',
        [
            ['A6', 'A6'],
            ['B5', 'B5'],
            ['B6', 'B6'],
            ['C6', 'C6'],
        ],
        2,
        '1011 = 11 = B und 0110 = 6, also B6.',
        '1011 = 11 = B and 0110 = 6, hence B6.'
    ),
    q(
        'ap1-sw-compiler',
        'ap1',
        'basics',
        'Was unterscheidet einen Compiler von einem Interpreter?',
        'What distinguishes a compiler from an interpreter?',
        [
            [
                'Der Compiler übersetzt den gesamten Quelltext vor der Ausführung.',
                'The compiler translates the whole source code before execution.',
            ],
            [
                'Der Compiler führt den Quelltext Zeile für Zeile aus.',
                'The compiler executes the source code line by line.',
            ],
            [
                'Ein Interpreter erzeugt immer eine ausführbare Datei.',
                'An interpreter always produces an executable file.',
            ],
            ['Ein Compiler funktioniert nur für Skriptsprachen.', 'A compiler only works for scripting languages.'],
        ],
        0,
        'Ein Compiler übersetzt das Programm vorab in Maschinen- oder Bytecode; ein Interpreter übersetzt und führt zur Laufzeit Anweisung für Anweisung aus.',
        'A compiler translates the program into machine or byte code in advance; an interpreter translates and executes statement by statement at run time.'
    ),
    q(
        'ap1-sw-schleife',
        'ap1',
        'basics',
        'Welchen Wert gibt der Pseudocode aus?  summe := 0;  für i von 1 bis 4: summe := summe + i;  ausgabe(summe)',
        'Which value does the pseudocode print?  sum := 0;  for i from 1 to 4: sum := sum + i;  print(sum)',
        [
            ['4', '4'],
            ['6', '6'],
            ['10', '10'],
            ['24', '24'],
        ],
        2,
        '1 + 2 + 3 + 4 = 10.',
        '1 + 2 + 3 + 4 = 10.'
    ),

    // ------------------------------------------------------------------ AP2
    q(
        'ap2-oop-kapselung',
        'ap2',
        'oop',
        'Was bedeutet Kapselung in der objektorientierten Programmierung?',
        'What does encapsulation mean in object-oriented programming?',
        [
            [
                'Der innere Zustand eines Objekts ist verborgen und nur über Methoden zugänglich.',
                'The internal state of an object is hidden and only accessible through methods.',
            ],
            [
                'Eine Klasse erbt Attribute von mehreren Oberklassen.',
                'A class inherits attributes from several superclasses.',
            ],
            ['Alle Attribute einer Klasse sind öffentlich.', 'All attributes of a class are public.'],
            ['Objekte werden in einer Datenbank gespeichert.', 'Objects are stored in a database.'],
        ],
        0,
        'Kapselung (Information Hiding) schützt die Daten eines Objekts vor unkontrolliertem Zugriff, z. B. durch private Attribute und Getter/Setter.',
        "Encapsulation (information hiding) protects an object's data from uncontrolled access, e.g. with private attributes and getters/setters."
    ),
    q(
        'ap2-oop-polymorphie',
        'ap2',
        'oop',
        'Was beschreibt Polymorphie?',
        'What does polymorphism describe?',
        [
            [
                'Eine Klasse besitzt mehrere Konstruktoren mit gleichem Rumpf.',
                'A class has several constructors with the same body.',
            ],
            [
                'Derselbe Methodenaufruf führt je nach Objekttyp unterschiedliches Verhalten aus.',
                'The same method call results in different behaviour depending on the object type.',
            ],
            ['Ein Objekt kann nur einmal erzeugt werden.', 'An object can only be created once.'],
            ['Attribute werden automatisch initialisiert.', 'Attributes are initialised automatically.'],
        ],
        1,
        'Unterklassen überschreiben Methoden der Oberklasse; zur Laufzeit wird die Methode des tatsächlichen Objekttyps aufgerufen.',
        'Subclasses override methods of the superclass; at run time the method of the actual object type is called.'
    ),
    q(
        'ap2-oop-komposition',
        'ap2',
        'oop',
        'Welche Beziehung stellt im UML-Klassendiagramm eine ausgefüllte Raute dar?',
        'Which relationship does a filled diamond represent in a UML class diagram?',
        [
            ['Vererbung', 'Inheritance'],
            ['Aggregation', 'Aggregation'],
            ['Komposition', 'Composition'],
            ['Abhängigkeit', 'Dependency'],
        ],
        2,
        'Die Komposition ist eine Teil-Ganzes-Beziehung, bei der das Teil ohne das Ganze nicht existieren kann. Die leere Raute steht für Aggregation.',
        'Composition is a whole-part relationship in which the part cannot exist without the whole. The hollow diamond stands for aggregation.'
    ),
    q(
        'ap2-oop-abstrakt',
        'ap2',
        'oop',
        'Welche Aussage über abstrakte Klassen trifft zu?',
        'Which statement about abstract classes is correct?',
        [
            ['Sie dürfen keine Attribute besitzen.', 'They must not have attributes.'],
            ['Von ihnen kann kein Objekt direkt erzeugt werden.', 'No object can be created from them directly.'],
            ['Sie können nicht vererbt werden.', 'They cannot be inherited from.'],
            ['Sie dürfen nur statische Methoden enthalten.', 'They may only contain static methods.'],
        ],
        1,
        'Abstrakte Klassen dienen als Basisklassen. Sie können Attribute und implementierte Methoden enthalten, aber nicht instanziiert werden.',
        'Abstract classes serve as base classes. They may contain attributes and implemented methods but cannot be instantiated.'
    ),
    q(
        'ap2-oop-sequenz',
        'ap2',
        'oop',
        'Was zeigt ein UML-Sequenzdiagramm?',
        'What does a UML sequence diagram show?',
        [
            ['Die Tabellenstruktur einer Datenbank', 'The table structure of a database'],
            [
                'Den zeitlichen Ablauf der Nachrichten zwischen Objekten',
                'The chronological exchange of messages between objects',
            ],
            ['Die Verteilung der Software auf Hardware-Knoten', 'The deployment of software on hardware nodes'],
            ['Die Vererbungshierarchie aller Klassen', 'The inheritance hierarchy of all classes'],
        ],
        1,
        'Lebenslinien stehen für die beteiligten Objekte, Pfeile für Nachrichten in zeitlicher Reihenfolge von oben nach unten.',
        'Lifelines stand for the participating objects, arrows for messages in chronological order from top to bottom.'
    ),
    q(
        'ap2-sql-groupby',
        'ap2',
        'sql',
        'Welche Abfrage liefert die Anzahl der Kunden je Ort aus der Tabelle kunde?',
        'Which query returns the number of customers per city from the table kunde?',
        [
            ['SELECT ort, COUNT(*) FROM kunde GROUP BY ort;', 'SELECT ort, COUNT(*) FROM kunde GROUP BY ort;'],
            ['SELECT ort, COUNT(*) FROM kunde ORDER BY ort;', 'SELECT ort, COUNT(*) FROM kunde ORDER BY ort;'],
            ['SELECT COUNT(ort) FROM kunde WHERE ort;', 'SELECT COUNT(ort) FROM kunde WHERE ort;'],
            ['SELECT ort, SUM(ort) FROM kunde;', 'SELECT ort, SUM(ort) FROM kunde;'],
        ],
        0,
        'GROUP BY bildet je Ort eine Gruppe, COUNT(*) zählt deren Zeilen. ORDER BY sortiert nur.',
        'GROUP BY forms one group per city and COUNT(*) counts its rows. ORDER BY only sorts.'
    ),
    q(
        'ap2-sql-having',
        'ap2',
        'sql',
        'Mit welcher Klausel werden Gruppen nach einem Aggregatwert gefiltert?',
        'Which clause filters groups by an aggregate value?',
        [
            ['WHERE', 'WHERE'],
            ['HAVING', 'HAVING'],
            ['ORDER BY', 'ORDER BY'],
            ['DISTINCT', 'DISTINCT'],
        ],
        1,
        'WHERE filtert Zeilen vor der Gruppierung, HAVING filtert Gruppen danach, z. B. HAVING COUNT(*) > 5.',
        'WHERE filters rows before grouping, HAVING filters groups afterwards, e.g. HAVING COUNT(*) > 5.'
    ),
    q(
        'ap2-sql-leftjoin',
        'ap2',
        'sql',
        'Was liefert ein LEFT JOIN?',
        'What does a LEFT JOIN return?',
        [
            ['Nur Zeilen, die in beiden Tabellen einen Partner haben', 'Only rows that have a match in both tables'],
            [
                'Alle Zeilen der linken Tabelle, ergänzt um passende Zeilen der rechten (sonst NULL)',
                'All rows of the left table, with matching rows of the right one (otherwise NULL)',
            ],
            [
                'Alle Zeilen der rechten Tabelle, aber keine der linken',
                'All rows of the right table but none of the left',
            ],
            ['Das kartesische Produkt beider Tabellen', 'The Cartesian product of both tables'],
        ],
        1,
        'Zeilen der linken Tabelle ohne Partner bleiben erhalten; die Spalten der rechten Tabelle sind dann NULL.',
        'Rows of the left table without a match are kept; the columns of the right table are NULL for them.'
    ),
    q(
        'ap2-sql-3nf',
        'ap2',
        'sql',
        'Wann verletzt eine Tabelle in der 2. Normalform die 3. Normalform?',
        'When does a table in second normal form violate third normal form?',
        [
            ['Wenn ein Attribut mehrere Werte enthält', 'When an attribute contains several values'],
            ['Wenn sie keinen Primärschlüssel besitzt', 'When it has no primary key'],
            [
                'Wenn ein Nichtschlüsselattribut von einem anderen Nichtschlüsselattribut abhängt',
                'When a non-key attribute depends on another non-key attribute',
            ],
            ['Wenn sie mehr als zehn Spalten hat', 'When it has more than ten columns'],
        ],
        2,
        'Die 3. Normalform verbietet transitive Abhängigkeiten: Nichtschlüsselattribute dürfen nur vom Schlüssel abhängen.',
        'Third normal form forbids transitive dependencies: non-key attributes may depend on the key only.'
    ),
    q(
        'ap2-sql-primaerschluessel',
        'ap2',
        'sql',
        'Welche Eigenschaften muss ein Primärschlüssel haben?',
        'Which properties must a primary key have?',
        [
            ['Eindeutig und nicht NULL', 'Unique and not NULL'],
            ['Numerisch und fortlaufend', 'Numeric and sequential'],
            ['Verschlüsselt und indiziert', 'Encrypted and indexed'],
            ['Eindeutig, darf aber NULL sein', 'Unique, but may be NULL'],
        ],
        0,
        'Ein Primärschlüssel identifiziert jede Zeile eindeutig und darf keine NULL-Werte enthalten. Er muss nicht numerisch sein.',
        'A primary key identifies each row uniquely and must not contain NULL values. It does not have to be numeric.'
    ),
    q(
        'ap2-algo-binaersuche',
        'ap2',
        'algorithms',
        'Welche Zeitkomplexität hat die binäre Suche in einem sortierten Feld?',
        'What is the time complexity of binary search in a sorted array?',
        [
            ['O(1)', 'O(1)'],
            ['O(log n)', 'O(log n)'],
            ['O(n)', 'O(n)'],
            ['O(n²)', 'O(n²)'],
        ],
        1,
        'Jeder Vergleich halbiert den Suchbereich, daher sind höchstens log₂(n) Schritte nötig.',
        'Each comparison halves the search range, so at most log₂(n) steps are needed.'
    ),
    q(
        'ap2-algo-stack',
        'ap2',
        'algorithms',
        'Nach welchem Prinzip arbeitet ein Stack (Stapel)?',
        'According to which principle does a stack work?',
        [
            ['FIFO – First In, First Out', 'FIFO – first in, first out'],
            ['LIFO – Last In, First Out', 'LIFO – last in, first out'],
            ['Zufälliger Zugriff über einen Schlüssel', 'Random access via a key'],
            ['Sortiert nach Priorität', 'Sorted by priority'],
        ],
        1,
        'Das zuletzt abgelegte Element wird zuerst entnommen. FIFO ist das Prinzip der Queue (Warteschlange).',
        'The element pushed last is removed first. FIFO is the principle of a queue.'
    ),
    q(
        'ap2-algo-bubblesort',
        'ap2',
        'algorithms',
        'Welche Zeitkomplexität hat Bubblesort im ungünstigsten Fall?',
        'What is the worst-case time complexity of bubble sort?',
        [
            ['O(log n)', 'O(log n)'],
            ['O(n)', 'O(n)'],
            ['O(n log n)', 'O(n log n)'],
            ['O(n²)', 'O(n²)'],
        ],
        3,
        'Zwei verschachtelte Schleifen vergleichen benachbarte Elemente: rund n²/2 Vergleiche.',
        'Two nested loops compare neighbouring elements: about n²/2 comparisons.'
    ),
    q(
        'ap2-algo-rekursion',
        'ap2',
        'algorithms',
        'Was benötigt jede rekursive Funktion, damit sie terminiert?',
        'What does every recursive function need in order to terminate?',
        [
            ['Eine globale Variable', 'A global variable'],
            ['Eine Abbruchbedingung', 'A termination condition (base case)'],
            ['Mindestens zwei Parameter', 'At least two parameters'],
            ['Eine Schleife im Rumpf', 'A loop in its body'],
        ],
        1,
        'Ohne Abbruchbedingung ruft sich die Funktion endlos selbst auf, bis der Aufrufstapel überläuft (Stack Overflow).',
        'Without a base case the function keeps calling itself until the call stack overflows.'
    ),
    q(
        'ap2-algo-schleife',
        'ap2',
        'algorithms',
        'Welchen Wert hat x nach dem Ablauf?  x := 5;  y := 2;  solange x > y: x := x − y',
        'What is the value of x afterwards?  x := 5;  y := 2;  while x > y: x := x − y',
        [
            ['0', '0'],
            ['1', '1'],
            ['2', '2'],
            ['3', '3'],
        ],
        1,
        '5 > 2 → x = 3; 3 > 2 → x = 1; 1 > 2 ist falsch, die Schleife endet mit x = 1.',
        '5 > 2 → x = 3; 3 > 2 → x = 1; 1 > 2 is false, the loop ends with x = 1.'
    ),
    q(
        'ap2-qs-unittest',
        'ap2',
        'quality',
        'Was prüft ein Unit-Test (Komponententest)?',
        'What does a unit test check?',
        [
            ['Das Zusammenspiel aller Systeme beim Kunden', 'The interaction of all systems at the customer site'],
            [
                'Eine einzelne Einheit (Funktion, Klasse) isoliert von ihrer Umgebung',
                'A single unit (function, class) in isolation from its environment',
            ],
            ['Die Bedienbarkeit der Oberfläche durch Endanwender', 'The usability of the interface for end users'],
            ['Die Auslastung der Server unter Last', 'The server load under stress'],
        ],
        1,
        'Unit-Tests prüfen kleinste Einheiten isoliert; Abhängigkeiten werden häufig durch Mocks ersetzt.',
        'Unit tests check the smallest units in isolation; dependencies are often replaced by mocks.'
    ),
    q(
        'ap2-qs-blackbox',
        'ap2',
        'quality',
        'Woraus werden die Testfälle bei einem Black-Box-Test abgeleitet?',
        'What are the test cases of a black-box test derived from?',
        [
            ['Aus dem Quelltext der Software', 'From the source code of the software'],
            [
                'Aus der Spezifikation, ohne Kenntnis des Quelltexts',
                'From the specification, without knowledge of the source code',
            ],
            ['Aus den Log-Dateien des Servers', 'From the server log files'],
            ['Aus dem Datenbankschema', 'From the database schema'],
        ],
        1,
        'Beim Black-Box-Test zählt nur das von außen sichtbare Verhalten. Der White-Box-Test nutzt die innere Struktur.',
        'A black-box test only considers externally visible behaviour. A white-box test uses the internal structure.'
    ),
    q(
        'ap2-qs-grenzwerte',
        'ap2',
        'quality',
        'Ein Eingabefeld akzeptiert ganze Zahlen von 1 bis 100. Welche Werte prüft eine Grenzwertanalyse?',
        'An input field accepts integers from 1 to 100. Which values does a boundary value analysis test?',
        [
            ['25, 50, 75', '25, 50, 75'],
            ['0, 1, 100, 101', '0, 1, 100, 101'],
            ['1, 2, 3, 4', '1, 2, 3, 4'],
            ['−100, 0, 1000', '−100, 0, 1000'],
        ],
        1,
        'Fehler treten häufig an den Rändern auf. Geprüft werden die Grenzen und ihre direkten Nachbarn außerhalb des Bereichs.',
        'Defects often occur at the edges. The boundaries and their direct neighbours outside the range are tested.'
    ),
    q(
        'ap2-qs-regression',
        'ap2',
        'quality',
        'Wozu dient ein Regressionstest?',
        'What is a regression test for?',
        [
            [
                'Er stellt nach Änderungen sicher, dass bestehende Funktionen weiterhin fehlerfrei arbeiten.',
                'After changes it makes sure that existing functionality still works correctly.',
            ],
            ['Er misst die Antwortzeiten unter hoher Last.', 'It measures response times under heavy load.'],
            ['Er prüft, ob die Software installiert werden kann.', 'It checks whether the software can be installed.'],
            ['Er ersetzt die Abnahme durch den Kunden.', 'It replaces acceptance by the customer.'],
        ],
        0,
        'Bereits bestandene Tests werden nach einer Änderung erneut ausgeführt, meist automatisiert.',
        'Tests that already passed are run again after a change, usually automated.'
    ),
    q(
        'ap2-arch-mvc',
        'ap2',
        'architecture',
        'Welche Aufgabe hat der Controller im MVC-Muster?',
        'What is the task of the controller in the MVC pattern?',
        [
            ['Er speichert die Daten dauerhaft.', 'It stores the data permanently.'],
            ['Er stellt die Daten für den Benutzer dar.', 'It presents the data to the user.'],
            [
                'Er nimmt Eingaben entgegen und vermittelt zwischen Model und View.',
                'It receives input and mediates between model and view.',
            ],
            ['Er übersetzt den Quelltext in Bytecode.', 'It translates the source code into byte code.'],
        ],
        2,
        'Model: Daten und Geschäftslogik. View: Darstellung. Controller: Steuerung.',
        'Model: data and business logic. View: presentation. Controller: control flow.'
    ),
    q(
        'ap2-arch-scrum',
        'ap2',
        'architecture',
        'Wer priorisiert in Scrum das Product Backlog?',
        'Who prioritises the product backlog in Scrum?',
        [
            ['Der Scrum Master', 'The Scrum Master'],
            ['Der Product Owner', 'The Product Owner'],
            ['Das Entwicklungsteam per Mehrheitsentscheid', 'The developers by majority vote'],
            ['Die Geschäftsführung', 'The executive board'],
        ],
        1,
        'Der Product Owner verantwortet den Produktwert und ordnet die Backlog-Einträge. Der Scrum Master sorgt für den Prozess.',
        'The Product Owner is accountable for product value and orders the backlog items. The Scrum Master looks after the process.'
    ),
    q(
        'ap2-arch-rest-put',
        'ap2',
        'architecture',
        'Welche HTTP-Methode ersetzt in einer REST-API eine Ressource vollständig und ist idempotent?',
        'Which HTTP method fully replaces a resource in a REST API and is idempotent?',
        [
            ['POST', 'POST'],
            ['PUT', 'PUT'],
            ['PATCH', 'PATCH'],
            ['CONNECT', 'CONNECT'],
        ],
        1,
        'PUT ersetzt die Ressource vollständig; mehrfaches Ausführen führt zum selben Ergebnis. POST legt neue Ressourcen an.',
        'PUT replaces the resource completely; repeating it leads to the same result. POST creates new resources.'
    ),
    q(
        'ap2-arch-singleton',
        'ap2',
        'architecture',
        'Welches Entwurfsmuster stellt sicher, dass von einer Klasse nur ein einziges Objekt existiert?',
        'Which design pattern makes sure that only a single object of a class exists?',
        [
            ['Observer', 'Observer'],
            ['Factory Method', 'Factory Method'],
            ['Singleton', 'Singleton'],
            ['Decorator', 'Decorator'],
        ],
        2,
        'Das Singleton verbirgt den Konstruktor und liefert über eine statische Methode immer dieselbe Instanz.',
        'The singleton hides its constructor and returns the same instance through a static method.'
    ),
    q(
        'ap2-arch-wasserfall',
        'ap2',
        'architecture',
        'Was ist typisch für das Wasserfallmodell?',
        'What is typical of the waterfall model?',
        [
            ['Kurze Iterationen mit täglichen Abstimmungen', 'Short iterations with daily meetings'],
            [
                'Die Phasen werden nacheinander durchlaufen und jeweils abgeschlossen.',
                'The phases are passed through one after another and each is completed.',
            ],
            ['Die Anforderungen ändern sich in jedem Sprint.', 'Requirements change in every sprint.'],
            ['Es gibt keine Dokumentation.', 'There is no documentation.'],
        ],
        1,
        'Analyse, Entwurf, Implementierung, Test und Betrieb folgen streng nacheinander; späte Änderungen sind teuer.',
        'Analysis, design, implementation, test and operation strictly follow each other; late changes are expensive.'
    ),

    // ------------------------------------------------------------------ WISO
    q(
        'wiso-ar-probezeit',
        'wiso',
        'labour',
        'Wie lange dauert die Probezeit in einem Berufsausbildungsverhältnis nach dem BBiG?',
        'How long is the probationary period of a vocational training relationship under the BBiG?',
        [
            ['Genau 6 Monate', 'Exactly 6 months'],
            ['Mindestens 1 Monat, höchstens 4 Monate', 'At least 1 month, at most 4 months'],
            ['Mindestens 2 Wochen, höchstens 3 Monate', 'At least 2 weeks, at most 3 months'],
            ['Sie ist frei vereinbar.', 'It can be agreed freely.'],
        ],
        1,
        '§ 20 BBiG: Die Probezeit muss mindestens einen Monat und darf höchstens vier Monate betragen.',
        'Section 20 BBiG: the probationary period must be at least one month and at most four months.'
    ),
    q(
        'wiso-ar-kuendigung-probezeit',
        'wiso',
        'labour',
        'Wie kann ein Ausbildungsverhältnis während der Probezeit gekündigt werden?',
        'How can a training relationship be terminated during the probationary period?',
        [
            ['Nur mit einer Frist von vier Wochen', "Only with four weeks' notice"],
            ['Jederzeit ohne Einhalten einer Kündigungsfrist', 'At any time without a notice period'],
            ['Gar nicht', 'Not at all'],
            ['Nur durch den Ausbildenden', 'Only by the training company'],
        ],
        1,
        '§ 22 Abs. 1 BBiG: Während der Probezeit kann das Ausbildungsverhältnis jederzeit ohne Kündigungsfrist gekündigt werden.',
        'Section 22 (1) BBiG: during the probationary period either party may terminate at any time without notice.'
    ),
    q(
        'wiso-ar-urlaub',
        'wiso',
        'labour',
        'Wie hoch ist der gesetzliche Mindesturlaub bei einer 5-Tage-Woche?',
        'What is the statutory minimum leave with a 5-day week?',
        [
            ['15 Arbeitstage', '15 working days'],
            ['20 Arbeitstage', '20 working days'],
            ['24 Arbeitstage', '24 working days'],
            ['30 Arbeitstage', '30 working days'],
        ],
        1,
        'Das BUrlG nennt 24 Werktage bei einer 6-Tage-Woche. Das entspricht 20 Arbeitstagen bei einer 5-Tage-Woche.',
        'The BUrlG states 24 days based on a 6-day week, which equals 20 working days with a 5-day week.'
    ),
    q(
        'wiso-ar-arbeitszeit',
        'wiso',
        'labour',
        'Welche tägliche Höchstarbeitszeit gilt nach dem Arbeitszeitgesetz für Erwachsene?',
        'Which maximum daily working time applies to adults under the Working Hours Act?',
        [
            ['8 Stunden, ausnahmslos', '8 hours, without exception'],
            [
                '8 Stunden, verlängerbar auf 10 Stunden bei Ausgleich innerhalb von 6 Monaten',
                '8 hours, extendable to 10 hours if compensated within 6 months',
            ],
            ['10 Stunden ohne weiteren Ausgleich', '10 hours without any compensation'],
            ['12 Stunden', '12 hours'],
        ],
        1,
        '§ 3 ArbZG: 8 Stunden werktäglich; bis zu 10 Stunden, wenn im Schnitt von 6 Monaten bzw. 24 Wochen 8 Stunden nicht überschritten werden.',
        'Section 3 ArbZG: 8 hours per working day; up to 10 hours if the average over 6 months or 24 weeks does not exceed 8 hours.'
    ),
    q(
        'wiso-ar-kuendigungsfrist',
        'wiso',
        'labour',
        'Welche gesetzliche Grundkündigungsfrist gilt für Arbeitnehmer nach der Probezeit?',
        'Which basic statutory notice period applies to employees after the probationary period?',
        [
            ['Zwei Wochen', 'Two weeks'],
            [
                'Vier Wochen zum 15. oder zum Ende eines Kalendermonats',
                'Four weeks to the 15th or to the end of a calendar month',
            ],
            ['Drei Monate zum Quartalsende', 'Three months to the end of a quarter'],
            ['Sechs Wochen zum Monatsende', 'Six weeks to the end of a month'],
        ],
        1,
        '§ 622 Abs. 1 BGB: vier Wochen zum Fünfzehnten oder zum Ende eines Kalendermonats.',
        'Section 622 (1) BGB: four weeks to the fifteenth or to the end of a calendar month.'
    ),
    q(
        'wiso-ar-jarbschg',
        'wiso',
        'labour',
        'Wie lange dürfen Jugendliche nach dem Jugendarbeitsschutzgesetz höchstens arbeiten?',
        'What is the maximum working time for young people under the Youth Employment Protection Act?',
        [
            ['8 Stunden täglich und 40 Stunden wöchentlich', '8 hours a day and 40 hours a week'],
            ['9 Stunden täglich und 45 Stunden wöchentlich', '9 hours a day and 45 hours a week'],
            ['10 Stunden täglich und 48 Stunden wöchentlich', '10 hours a day and 48 hours a week'],
            ['6 Stunden täglich und 30 Stunden wöchentlich', '6 hours a day and 30 hours a week'],
        ],
        0,
        '§ 8 JArbSchG: nicht mehr als 8 Stunden täglich und 40 Stunden wöchentlich.',
        'Section 8 JArbSchG: no more than 8 hours a day and 40 hours a week.'
    ),
    q(
        'wiso-sv-zweige',
        'wiso',
        'social',
        'Welche Versicherung gehört NICHT zu den fünf Zweigen der gesetzlichen Sozialversicherung?',
        'Which insurance is NOT one of the five branches of statutory social insurance?',
        [
            ['Rentenversicherung', 'Pension insurance'],
            ['Pflegeversicherung', 'Long-term care insurance'],
            ['Unfallversicherung', 'Accident insurance'],
            ['Haftpflichtversicherung', 'Liability insurance'],
        ],
        3,
        'Die fünf Zweige sind Kranken-, Pflege-, Renten-, Arbeitslosen- und Unfallversicherung. Die Haftpflicht ist eine private Versicherung.',
        'The five branches are health, long-term care, pension, unemployment and accident insurance. Liability insurance is private.'
    ),
    q(
        'wiso-sv-unfall-beitrag',
        'wiso',
        'social',
        'Wer trägt die Beiträge zur gesetzlichen Unfallversicherung?',
        'Who pays the contributions to statutory accident insurance?',
        [
            ['Arbeitgeber und Arbeitnehmer je zur Hälfte', 'Employer and employee, half each'],
            ['Der Arbeitnehmer allein', 'The employee alone'],
            ['Der Arbeitgeber allein', 'The employer alone'],
            ['Der Staat aus Steuermitteln', 'The state from tax revenue'],
        ],
        2,
        'Die Beiträge zur gesetzlichen Unfallversicherung zahlt allein der Arbeitgeber.',
        'Contributions to statutory accident insurance are paid by the employer alone.'
    ),
    q(
        'wiso-sv-unfall-traeger',
        'wiso',
        'social',
        'Wer ist Träger der gesetzlichen Unfallversicherung für gewerbliche Betriebe?',
        'Which institution provides statutory accident insurance for commercial businesses?',
        [
            ['Die Krankenkassen', 'The health insurance funds'],
            ['Die Berufsgenossenschaften', "The employers' liability insurance associations (Berufsgenossenschaften)"],
            ['Die Bundesagentur für Arbeit', 'The Federal Employment Agency'],
            ['Die Deutsche Rentenversicherung', 'The German Pension Insurance'],
        ],
        1,
        'Träger sind die Berufsgenossenschaften (für den öffentlichen Dienst die Unfallkassen).',
        'The Berufsgenossenschaften are responsible (for the public sector, the accident insurance funds).'
    ),
    q(
        'wiso-sv-alv-traeger',
        'wiso',
        'social',
        'Wer ist Träger der Arbeitslosenversicherung?',
        'Which institution is responsible for unemployment insurance?',
        [
            ['Die Bundesagentur für Arbeit', 'The Federal Employment Agency'],
            ['Die Industrie- und Handelskammer', 'The Chamber of Industry and Commerce'],
            ['Die Berufsgenossenschaft', 'The Berufsgenossenschaft'],
            ['Das Finanzamt', 'The tax office'],
        ],
        0,
        'Die Bundesagentur für Arbeit ist Trägerin der Arbeitslosenversicherung.',
        'The Federal Employment Agency administers unemployment insurance.'
    ),
    q(
        'wiso-bw-gmbh-kapital',
        'wiso',
        'business',
        'Wie hoch ist das Mindeststammkapital einer GmbH?',
        'What is the minimum share capital of a GmbH?',
        [
            ['1 €', '€1'],
            ['12.500 €', '€12,500'],
            ['25.000 €', '€25,000'],
            ['50.000 €', '€50,000'],
        ],
        2,
        '§ 5 GmbHG: Das Stammkapital muss mindestens 25.000 € betragen. 50.000 € ist das Grundkapital einer AG.',
        'Section 5 GmbHG: the share capital must be at least €25,000. €50,000 is the minimum capital of an AG.'
    ),
    q(
        'wiso-bw-gmbh-haftung',
        'wiso',
        'business',
        'Womit haftet eine GmbH für ihre Verbindlichkeiten?',
        'With what is a GmbH liable for its debts?',
        [
            ['Mit dem Privatvermögen aller Gesellschafter', 'With the private assets of all shareholders'],
            ['Nur mit dem Gesellschaftsvermögen', "Only with the company's assets"],
            ['Mit dem Privatvermögen der Geschäftsführung', 'With the private assets of the managing directors'],
            ['Gar nicht', 'Not at all'],
        ],
        1,
        'Die Haftung ist auf das Gesellschaftsvermögen beschränkt; die Gesellschafter haften grundsätzlich nicht persönlich.',
        "Liability is limited to the company's assets; the shareholders are generally not personally liable."
    ),
    q(
        'wiso-bw-netto',
        'wiso',
        'business',
        'Wie ergibt sich das Nettoentgelt aus dem Bruttoentgelt?',
        'How is net pay derived from gross pay?',
        [
            ['Brutto abzüglich der Umsatzsteuer', 'Gross minus value added tax'],
            [
                'Brutto abzüglich Lohnsteuer (ggf. Kirchensteuer, Solidaritätszuschlag) und Arbeitnehmeranteil der Sozialversicherung',
                "Gross minus wage tax (church tax, solidarity surcharge where applicable) and the employee's share of social insurance",
            ],
            [
                'Brutto abzüglich der Arbeitgeberanteile zur Sozialversicherung',
                "Gross minus the employer's social insurance contributions",
            ],
            ['Brutto zuzüglich vermögenswirksamer Leistungen', 'Gross plus capital-forming benefits'],
        ],
        1,
        'Vom Brutto werden Steuern und die Arbeitnehmeranteile zur Sozialversicherung abgezogen. Umsatzsteuer betrifft Löhne nicht.',
        "Taxes and the employee's social insurance contributions are deducted from gross pay. VAT does not apply to wages."
    ),
    q(
        'wiso-bw-minimalprinzip',
        'wiso',
        'business',
        'Was besagt das Minimalprinzip?',
        'What does the minimum principle state?',
        [
            [
                'Ein vorgegebenes Ziel soll mit möglichst geringem Mitteleinsatz erreicht werden.',
                'A given goal is to be achieved with the least possible input.',
            ],
            [
                'Mit vorgegebenen Mitteln soll ein möglichst großer Erfolg erzielt werden.',
                'The greatest possible result is to be achieved with given means.',
            ],
            [
                'Mit minimalem Einsatz soll maximaler Erfolg erzielt werden.',
                'Maximum success is to be achieved with minimum effort.',
            ],
            ['Kosten dürfen nie gesenkt werden.', 'Costs must never be reduced.'],
        ],
        0,
        'Minimalprinzip: festes Ziel, minimaler Einsatz. Maximalprinzip: fester Einsatz, maximales Ergebnis. Beides zugleich ist nicht möglich.',
        'Minimum principle: fixed goal, minimum input. Maximum principle: fixed input, maximum output. Both at once is not possible.'
    ),
    q(
        'wiso-mb-betriebsrat',
        'wiso',
        'codetermination',
        'Ab wie vielen ständigen wahlberechtigten Arbeitnehmern kann ein Betriebsrat gewählt werden?',
        'From how many permanent employees entitled to vote can a works council be elected?',
        [
            ['Ab 3', 'From 3'],
            ['Ab 5', 'From 5'],
            ['Ab 10', 'From 10'],
            ['Ab 20', 'From 20'],
        ],
        1,
        '§ 1 BetrVG: in Betrieben mit in der Regel mindestens fünf ständigen wahlberechtigten Arbeitnehmern, von denen drei wählbar sind.',
        'Section 1 BetrVG: in establishments with normally at least five permanent employees entitled to vote, three of whom are eligible.'
    ),
    q(
        'wiso-mb-jav',
        'wiso',
        'codetermination',
        'Wessen Interessen vertritt die Jugend- und Auszubildendenvertretung (JAV)?',
        'Whose interests does the youth and trainee representation (JAV) represent?',
        [
            ['Die der Geschäftsführung', 'Those of the management'],
            ['Die der jugendlichen Arbeitnehmer und der Auszubildenden', 'Those of young employees and trainees'],
            ['Die der Kunden', 'Those of the customers'],
            ['Die der leitenden Angestellten', 'Those of the executive staff'],
        ],
        1,
        'Die JAV nimmt die besonderen Belange der Jugendlichen und Auszubildenden wahr und arbeitet dabei mit dem Betriebsrat zusammen.',
        'The JAV looks after the particular concerns of young employees and trainees and works together with the works council.'
    ),
    q(
        'wiso-mb-tarifautonomie',
        'wiso',
        'codetermination',
        'Was bedeutet Tarifautonomie?',
        'What does autonomy in collective bargaining (Tarifautonomie) mean?',
        [
            ['Der Staat legt alle Löhne per Gesetz fest.', 'The state fixes all wages by law.'],
            [
                'Gewerkschaften und Arbeitgeber(verbände) handeln Tarifverträge ohne staatliche Einmischung aus.',
                'Trade unions and employers (or their associations) negotiate collective agreements without state interference.',
            ],
            ['Jeder Arbeitnehmer verhandelt seinen Lohn allein.', 'Every employee negotiates their wage alone.'],
            ['Der Betriebsrat legt die Löhne fest.', 'The works council sets the wages.'],
        ],
        1,
        'Die Tarifautonomie folgt aus der Koalitionsfreiheit (Art. 9 Abs. 3 GG).',
        'It follows from the freedom of association (Article 9 (3) of the Basic Law).'
    ),
    q(
        'wiso-mb-friedenspflicht',
        'wiso',
        'codetermination',
        'Was bedeutet die Friedenspflicht während der Laufzeit eines Tarifvertrags?',
        'What does the peace obligation during the term of a collective agreement mean?',
        [
            ['Der Arbeitgeber darf nicht kündigen.', 'The employer must not dismiss anyone.'],
            [
                'Über die im Tarifvertrag geregelten Inhalte dürfen keine Arbeitskämpfe geführt werden.',
                'No industrial action may be taken over the matters regulated in the agreement.',
            ],
            ['Der Betriebsrat darf nicht tagen.', 'The works council must not meet.'],
            ['Überstunden sind verboten.', 'Overtime is prohibited.'],
        ],
        1,
        'Solange der Tarifvertrag läuft, sind Streik und Aussperrung zu den darin geregelten Punkten unzulässig.',
        'While the agreement is in force, strikes and lock-outs over the matters it regulates are not permitted.'
    ),
];
