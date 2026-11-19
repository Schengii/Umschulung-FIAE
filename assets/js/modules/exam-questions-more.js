/**
 * @file exam-questions-more.js
 * @description Further single-choice questions for the IHK exam simulation, three per topic, to
 * make a run repeat less often (Plan 4.1). Joined to the pool in exam-questions.js. Practice tasks
 * written for this site, not original exam tasks.
 */

import { single } from './exam-questions-extra.js';

/** @typedef {import('./exam-questions.js').ExamQuestion} ExamQuestion */

/** @type {ExamQuestion[]} */
export const MORE_QUESTIONS = [
    // ------------------------------------------------------------------ AP1: hardware
    single(
        'ap1-hw-hdmi',
        'ap1',
        'hardware',
        [
            'Welche Schnittstelle überträgt Bild und Ton digital über ein einziges Kabel?',
            'Which interface carries picture and sound digitally over a single cable?',
        ],
        [
            ['VGA', 'VGA'],
            ['HDMI', 'HDMI'],
            ['PS/2', 'PS/2'],
            ['Parallele Schnittstelle', 'Parallel port'],
        ],
        1,
        [
            'HDMI überträgt digitales Video und Audio. VGA ist analog und ohne Ton, PS/2 und die parallele Schnittstelle sind Anschlüsse für Eingabegeräte und Drucker.',
            'HDMI carries digital video and audio. VGA is analogue and without sound, PS/2 and the parallel port are for input devices and printers.',
        ]
    ),
    single(
        'ap1-hw-cpu',
        'ap1',
        'hardware',
        ['Welche Aufgabe hat die CPU eines Computers?', 'What is the task of the CPU of a computer?'],
        [
            ['Programmbefehle ausführen und Daten verarbeiten', 'Execute program instructions and process data'],
            ['Daten dauerhaft speichern', 'Store data permanently'],
            ['Das Bild auf dem Monitor ausgeben', 'Output the picture on the monitor'],
            ['Das Netzteil überwachen', 'Monitor the power supply'],
        ],
        0,
        [
            'Die CPU (Prozessor) führt Befehle aus und rechnet. Dauerhaft speichern SSD und HDD, die Bildausgabe übernimmt die Grafikeinheit.',
            'The CPU (processor) executes instructions and calculates. SSD and HDD store permanently, the graphics unit handles the picture output.',
        ]
    ),
    single(
        'ap1-hw-raid0',
        'ap1',
        'hardware',
        ['Was kennzeichnet ein RAID 0?', 'What characterises a RAID 0?'],
        [
            ['Spiegelung der Daten auf zwei Platten', 'Mirroring of the data on two disks'],
            ['Paritätsdaten verteilt auf alle Platten', 'Parity data spread over all disks'],
            [
                'Daten werden auf mehrere Platten verteilt: schneller, aber ohne Ausfallsicherheit',
                'Data is striped over several disks: faster, but without redundancy',
            ],
            ['Eine Platte steht als Reserve bereit', 'One disk stands by as a spare'],
        ],
        2,
        [
            'RAID 0 (Striping) erhöht Geschwindigkeit und Kapazität, fällt aber eine Platte aus, sind die Daten verloren.',
            'RAID 0 (striping) increases speed and capacity, but if one disk fails the data is lost.',
        ]
    ),

    // ------------------------------------------------------------------ AP1: network
    single(
        'ap1-net-dns',
        'ap1',
        'network',
        ['Was löst das Domain Name System (DNS) auf?', 'What does the Domain Name System (DNS) resolve?'],
        [
            ['MAC-Adressen in IP-Adressen', 'MAC addresses to IP addresses'],
            ['Domainnamen in IP-Adressen', 'Domain names to IP addresses'],
            ['Portnummern in Protokolle', 'Port numbers to protocols'],
            ['IP-Adressen in Postadressen', 'IP addresses to postal addresses'],
        ],
        1,
        [
            'DNS ordnet Namen wie max-schenk.tech IP-Adressen zu. MAC-Adressen in IP-Adressen übersetzt ARP, und zwar umgekehrt.',
            'DNS maps names such as max-schenk.tech to IP addresses. ARP translates between IP and MAC addresses.',
        ]
    ),

    // ------------------------------------------------------------------ AP1: security
    single(
        'ap1-sec-firewall',
        'ap1',
        'security',
        ['Was macht eine Firewall?', 'What does a firewall do?'],
        [
            ['Sie entfernt Viren von Datenträgern', 'It removes viruses from data carriers'],
            [
                'Sie filtert den Datenverkehr zwischen Netzen nach festgelegten Regeln',
                'It filters traffic between networks by defined rules',
            ],
            ['Sie sichert Daten täglich auf Band', 'It backs up data to tape every day'],
            ['Sie verschlüsselt Festplatten', 'It encrypts hard disks'],
        ],
        1,
        [
            'Eine Firewall erlaubt oder blockiert Verbindungen anhand von Regeln (Adressen, Ports, Protokolle). Virenscanner, Backup und Festplattenverschlüsselung sind andere Maßnahmen.',
            'A firewall allows or blocks connections by rules (addresses, ports, protocols). Virus scanners, backup and disk encryption are other measures.',
        ]
    ),
    single(
        'ap1-sec-leastprivilege',
        'ap1',
        'security',
        [
            'Was besagt das Prinzip der minimalen Rechte (Least Privilege)?',
            'What does the principle of least privilege state?',
        ],
        [
            [
                'Alle Nutzer erhalten Administratorrechte, damit nichts blockiert',
                'All users get administrator rights so nothing is blocked',
            ],
            [
                'Nutzer erhalten nur die Rechte, die sie für ihre Aufgabe brauchen',
                'Users get only the rights they need for their task',
            ],
            ['Rechte werden jährlich neu vergeben', 'Rights are reassigned every year'],
            ['Passwörter müssen möglichst kurz sein', 'Passwords must be as short as possible'],
        ],
        1,
        [
            'Je weniger Rechte ein Konto hat, desto geringer ist der Schaden bei Fehlern oder Missbrauch.',
            'The fewer rights an account has, the smaller the damage from mistakes or misuse.',
        ]
    ),
    single(
        'ap1-sec-salt',
        'ap1',
        'security',
        [
            'Wozu dient ein Salt beim Speichern von Passwort-Hashes?',
            'What is a salt used for when storing password hashes?',
        ],
        [
            ['Es macht den Hash umkehrbar', 'It makes the hash reversible'],
            ['Es verkürzt die Rechenzeit', 'It shortens the computing time'],
            [
                'Gleiche Passwörter ergeben verschiedene Hashes, vorberechnete Tabellen helfen Angreifern nicht',
                'Equal passwords give different hashes, precomputed tables do not help attackers',
            ],
            ['Es ersetzt die Zwei-Faktor-Authentifizierung', 'It replaces two-factor authentication'],
        ],
        2,
        [
            'Ein zufälliger Zusatzwert je Konto verhindert, dass gleiche Passwörter gleiche Hashes erzeugen und macht Rainbow-Tables wertlos.',
            'A random value per account prevents equal passwords from producing equal hashes and makes rainbow tables useless.',
        ]
    ),

    // ------------------------------------------------------------------ AP1: project
    single(
        'ap1-project-pflichtenheft',
        'ap1',
        'project',
        [
            'Was beschreibt ein Pflichtenheft?',
            'What does a software requirements specification (Pflichtenheft) describe?',
        ],
        [
            ['Die Wünsche des Auftraggebers in Stichpunkten', 'The wishes of the client in bullet points'],
            [
                'Wie und womit der Auftragnehmer die Anforderungen des Lastenhefts umsetzen will',
                'How and with what the contractor intends to meet the requirements of the Lastenheft',
            ],
            ['Die Pflichten des Betriebsrats', 'The duties of the works council'],
            ['Das Protokoll der Abnahme', 'The minutes of the acceptance'],
        ],
        1,
        [
            'Das Lastenheft nennt, was der Auftraggeber verlangt. Das Pflichtenheft antwortet darauf mit der geplanten Umsetzung.',
            'The Lastenheft says what the client demands. The Pflichtenheft answers with the planned implementation.',
        ]
    ),
    single(
        'ap1-project-kritischer-pfad',
        'ap1',
        'project',
        ['Was ist der kritische Pfad im Netzplan?', 'What is the critical path in a network diagram?'],
        [
            ['Der Weg mit den meisten Mitarbeitern', 'The path with the most staff'],
            [
                'Die Vorgangsfolge ohne Puffer, die die Mindestdauer des Projekts bestimmt',
                'The sequence of activities without slack that determines the minimum project duration',
            ],
            ['Der teuerste Vorgang', 'The most expensive activity'],
            ['Der Weg mit den meisten Risiken', 'The path with the most risks'],
        ],
        1,
        [
            'Verzögert sich ein Vorgang auf dem kritischen Pfad, verschiebt sich das Projektende, weil es keinen Puffer gibt.',
            'If an activity on the critical path is delayed, the project end moves because there is no slack.',
        ]
    ),
    single(
        'ap1-project-meilenstein',
        'ap1',
        'project',
        ['Was ist ein Meilenstein im Projektplan?', 'What is a milestone in a project plan?'],
        [
            ['Ein Vorgang mit besonders langer Dauer', 'An activity of particularly long duration'],
            [
                'Ein Ereignis mit festem Termin ohne eigene Dauer, das ein Zwischenergebnis markiert',
                'An event with a fixed date and no duration of its own that marks an interim result',
            ],
            ['Die Summe aller Kosten', 'The sum of all costs'],
            ['Ein Projektmitarbeiter mit Leitungsfunktion', 'A project member in a leading role'],
        ],
        1,
        [
            'Meilensteine, etwa „Pflichtenheft abgenommen“, machen den Fortschritt prüfbar. Sie verbrauchen selbst keine Zeit.',
            'Milestones such as "specification accepted" make progress verifiable. They take no time themselves.',
        ]
    ),

    // ------------------------------------------------------------------ AP1: basics
    single(
        'ap1-basics-hex',
        'ap1',
        'basics',
        ['Welche Basis hat das Hexadezimalsystem?', 'What is the base of the hexadecimal system?'],
        [
            ['2', '2'],
            ['8', '8'],
            ['10', '10'],
            ['16', '16'],
        ],
        3,
        [
            'Hexadezimal nutzt 16 Ziffern (0 bis 9 und A bis F). Basis 2 ist dual, 8 oktal, 10 dezimal.',
            'Hexadecimal uses 16 digits (0 to 9 and A to F). Base 2 is binary, 8 octal, 10 decimal.',
        ]
    ),
    single(
        'ap1-basics-modulo',
        'ap1',
        'basics',
        ['Was liefert der Ausdruck 17 % 5 (Modulo)?', 'What does the expression 17 % 5 (modulo) return?'],
        [
            ['3', '3'],
            ['2', '2'],
            ['3,4', '3.4'],
            ['12', '12'],
        ],
        1,
        [
            '17 geteilt durch 5 ergibt 3 Rest 2. Der Modulo-Operator liefert den Rest, also 2.',
            '17 divided by 5 is 3 remainder 2. The modulo operator returns the remainder, so 2.',
        ]
    ),

    // -------------------------------------------------------------------- AP2: oop
    single(
        'ap2-oop-klasse',
        'ap2',
        'oop',
        [
            'Was ist eine Klasse in der objektorientierten Programmierung?',
            'What is a class in object-oriented programming?',
        ],
        [
            ['Eine einzelne Variable', 'A single variable'],
            [
                'Ein Bauplan für Objekte mit Attributen und Methoden',
                'A blueprint for objects with attributes and methods',
            ],
            ['Ein Programm, das gerade läuft', 'A program that is currently running'],
            ['Eine Datenbanktabelle', 'A database table'],
        ],
        1,
        [
            'Die Klasse beschreibt Attribute und Methoden; ein Objekt ist eine konkrete Ausprägung davon.',
            'The class describes attributes and methods; an object is a concrete instance of it.',
        ]
    ),
    single(
        'ap2-oop-overloading',
        'ap2',
        'oop',
        ['Was bedeutet Überladen (Overloading) von Methoden?', 'What does method overloading mean?'],
        [
            ['Eine Methode in der Unterklasse neu definieren', 'Redefine a method in the subclass'],
            [
                'Gleicher Methodenname mit unterschiedlicher Parameterliste',
                'Same method name with a different parameter list',
            ],
            ['Eine Methode mit zu vielen Zeilen', 'A method with too many lines'],
            ['Eine Methode, die sich selbst aufruft', 'A method that calls itself'],
        ],
        1,
        [
            'Beim Überladen unterscheiden sich die Methoden in Zahl oder Typ der Parameter. Das Neudefinieren in der Unterklasse heißt Überschreiben (Overriding), der Selbstaufruf Rekursion.',
            'With overloading the methods differ in number or type of parameters. Redefining in the subclass is overriding, a self-call is recursion.',
        ]
    ),

    // --------------------------------------------------------------------- AP2: sql
    single(
        'ap2-sql-primarykey',
        'ap2',
        'sql',
        [
            'Was verlangt ein Primärschlüssel (PRIMARY KEY) von seinen Werten?',
            'What does a primary key require of its values?',
        ],
        [
            ['Sie müssen eindeutig sein und dürfen nicht NULL sein', 'They must be unique and must not be NULL'],
            ['Sie müssen Zahlen sein', 'They must be numbers'],
            ['Sie dürfen sich wiederholen', 'They may repeat'],
            ['Sie müssen alphabetisch sortiert sein', 'They must be sorted alphabetically'],
        ],
        0,
        [
            'Der Primärschlüssel identifiziert jede Zeile eindeutig. Er kann auch aus Text bestehen oder zusammengesetzt sein.',
            'The primary key identifies every row uniquely. It may also be text or composite.',
        ]
    ),
    single(
        'ap2-sql-count',
        'ap2',
        'sql',
        [
            'Welche SQL-Funktion liefert die Anzahl der Zeilen eines Ergebnisses?',
            'Which SQL function returns the number of rows of a result?',
        ],
        [
            ['SUM(*)', 'SUM(*)'],
            ['COUNT(*)', 'COUNT(*)'],
            ['AVG(*)', 'AVG(*)'],
            ['MAX(*)', 'MAX(*)'],
        ],
        1,
        [
            'COUNT(*) zählt Zeilen. SUM addiert Werte, AVG bildet den Durchschnitt, MAX liefert den größten Wert.',
            'COUNT(*) counts rows. SUM adds values, AVG forms the average, MAX returns the largest value.',
        ]
    ),

    // ----------------------------------------------------------- AP2: algorithms
    single(
        'ap2-algo-binarysearch',
        'ap2',
        'algorithms',
        [
            'Wie viele Vergleiche braucht die binäre Suche in einem sortierten Feld mit 1 000 Elementen höchstens?',
            'How many comparisons does binary search need at most in a sorted array of 1,000 elements?',
        ],
        [
            ['Etwa 10', 'About 10'],
            ['Etwa 100', 'About 100'],
            ['Genau 500', 'Exactly 500'],
            ['1 000', '1,000'],
        ],
        0,
        [
            'Jeder Schritt halbiert den Suchraum: log2(1 000) ist knapp 10, also höchstens 10 Vergleiche.',
            'Each step halves the search space: log2(1,000) is just under 10, so at most 10 comparisons.',
        ]
    ),

    // ------------------------------------------------------------- AP2: quality
    single(
        'ap2-quality-blackbox',
        'ap2',
        'quality',
        ['Was kennzeichnet einen Black-Box-Test?', 'What characterises a black-box test?'],
        [
            ['Der Quelltext wird Zeile für Zeile geprüft', 'The source code is checked line by line'],
            [
                'Das Verhalten wird anhand der Spezifikation geprüft, ohne den Code zu kennen',
                'Behaviour is checked against the specification without knowing the code',
            ],
            ['Der Test läuft ohne Bildschirm', 'The test runs without a screen'],
            ['Nur Sicherheitslücken werden gesucht', 'Only security holes are searched for'],
        ],
        1,
        [
            'Black-Box-Tests betrachten nur Ein- und Ausgaben. Beim White-Box-Test ist der Code bekannt.',
            'Black-box tests look only at inputs and outputs. In white-box testing the code is known.',
        ]
    ),
    single(
        'ap2-quality-coverage',
        'ap2',
        'quality',
        ['Was gibt die Testabdeckung (Code Coverage) an?', 'What does test coverage (code coverage) state?'],
        [
            ['Wie viele Fehler gefunden wurden', 'How many errors were found'],
            [
                'Welcher Anteil des Codes bei den Tests ausgeführt wird',
                'What share of the code is executed by the tests',
            ],
            ['Wie schnell die Tests laufen', 'How fast the tests run'],
            ['Wie viele Entwickler testen', 'How many developers test'],
        ],
        1,
        [
            'Die Abdeckung misst nur, welcher Code läuft, nicht ob die Prüfungen sinnvoll sind. Hohe Abdeckung ersetzt kein gutes Testdesign.',
            'Coverage measures only which code runs, not whether the checks make sense. High coverage does not replace good test design.',
        ]
    ),

    // ------------------------------------------------------- AP2: architecture
    single(
        'ap2-arch-microservices',
        'ap2',
        'architecture',
        ['Was kennzeichnet eine Microservice-Architektur?', 'What characterises a microservice architecture?'],
        [
            [
                'Eine einzige große Anwendung mit gemeinsamer Datenbank',
                'A single large application with a shared database',
            ],
            [
                'Viele kleine, unabhängig bereitstellbare Dienste, die über Schnittstellen zusammenarbeiten',
                'Many small, independently deployable services that cooperate through interfaces',
            ],
            ['Eine Anwendung ohne Netzwerkzugriff', 'An application without network access'],
            [
                'Die Pflicht, nur eine Programmiersprache zu nutzen',
                'The obligation to use a single programming language only',
            ],
        ],
        1,
        [
            'Microservices lassen sich einzeln entwickeln und ausrollen, kosten aber mehr Aufwand für Betrieb und Kommunikation.',
            'Microservices can be developed and rolled out individually but cost more effort for operation and communication.',
        ]
    ),
    single(
        'ap2-arch-clientserver',
        'ap2',
        'architecture',
        ['Was beschreibt das Client-Server-Modell?', 'What does the client-server model describe?'],
        [
            ['Gleichberechtigte Rechner tauschen Daten direkt aus', 'Equal computers exchange data directly'],
            [
                'Clients fordern Dienste an, ein Server stellt sie bereit',
                'Clients request services, a server provides them',
            ],
            ['Jeder Rechner speichert eine Kopie aller Daten', 'Every computer stores a copy of all data'],
            ['Programme laufen nur ohne Netzwerk', 'Programs run only without a network'],
        ],
        1,
        [
            'Der Server bietet Dienste an, Clients nutzen sie. Gleichberechtigte Rechner beschreibt Peer-to-Peer.',
            'The server offers services, clients use them. Equal computers describes peer-to-peer.',
        ]
    ),
    single(
        'ap2-arch-kanban',
        'ap2',
        'architecture',
        ['Was ist ein Kernprinzip von Kanban?', 'What is a core principle of Kanban?'],
        [
            ['Feste Sprints von vier Wochen', 'Fixed sprints of four weeks'],
            [
                'Arbeit sichtbar machen und die gleichzeitig laufenden Aufgaben begrenzen (WIP-Limit)',
                'Make work visible and limit the tasks in progress at the same time (WIP limit)',
            ],
            ['Der Plan wird einmal am Anfang festgelegt', 'The plan is fixed once at the beginning'],
            ['Es gibt keine Rollen und kein Board', 'There are no roles and no board'],
        ],
        1,
        [
            'Kanban nutzt ein Board und begrenzt die Arbeit in Bearbeitung, damit Engpässe sichtbar werden. Feste Sprints gehören zu Scrum.',
            'Kanban uses a board and limits work in progress so bottlenecks become visible. Fixed sprints belong to Scrum.',
        ]
    ),

    // -------------------------------------------------------------- WiSo: labour
    single(
        'wiso-labour-kuendigung',
        'wiso',
        'labour',
        [
            'Wie lang ist die gesetzliche Grundkündigungsfrist für Arbeitnehmer nach dem BGB?',
            'How long is the statutory basic notice period for employees under the German Civil Code?',
        ],
        [
            ['Eine Woche', 'One week'],
            ['Zwei Wochen zum Monatsende', 'Two weeks to the end of the month'],
            [
                'Vier Wochen zum 15. oder zum Ende eines Kalendermonats',
                'Four weeks to the 15th or the end of a calendar month',
            ],
            ['Drei Monate zum Quartalsende', 'Three months to the end of a quarter'],
        ],
        2,
        [
            'Nach § 622 BGB beträgt die Grundkündigungsfrist vier Wochen zum 15. oder zum Monatsende. Arbeits- oder Tarifverträge können Abweichendes regeln.',
            'Under § 622 of the Civil Code the basic notice period is four weeks to the 15th or the end of the month. Employment or collective agreements can regulate otherwise.',
        ]
    ),
    single(
        'wiso-labour-jarbschg',
        'wiso',
        'labour',
        ['Wen schützt das Jugendarbeitsschutzgesetz?', 'Whom does the Youth Employment Protection Act protect?'],
        [
            ['Alle Auszubildenden, egal wie alt', 'All trainees, whatever their age'],
            ['Beschäftigte unter 18 Jahren', 'Employees under 18'],
            ['Nur Schüler in Ferienjobs', 'Only pupils in holiday jobs'],
            ['Beschäftigte über 60 Jahren', 'Employees over 60'],
        ],
        1,
        [
            'Das Gesetz begrenzt unter anderem Arbeitszeit und Nachtarbeit für Jugendliche unter 18. Volljährige Auszubildende fallen nicht darunter.',
            'The act limits, among other things, working hours and night work for young people under 18. Trainees of full age are not covered.',
        ]
    ),
    single(
        'wiso-labour-urlaub',
        'wiso',
        'labour',
        [
            'Wie viele Urlaubstage stehen Arbeitnehmern bei einer Fünf-Tage-Woche nach dem Bundesurlaubsgesetz mindestens zu?',
            'How many days of leave are employees entitled to at least under the Federal Leave Act on a five-day week?',
        ],
        [
            ['15 Tage', '15 days'],
            ['20 Tage', '20 days'],
            ['24 Tage', '24 days'],
            ['30 Tage', '30 days'],
        ],
        1,
        [
            'Der gesetzliche Mindesturlaub beträgt 24 Werktage bei einer Sechs-Tage-Woche, umgerechnet 20 Arbeitstage bei fünf Tagen. Verträge dürfen mehr gewähren.',
            'The statutory minimum leave is 24 working days on a six-day week, converted 20 days on five. Contracts may grant more.',
        ]
    ),

    // --------------------------------------------------------------- WiSo: social
    single(
        'wiso-social-pflege',
        'wiso',
        'social',
        [
            'Welche Sozialversicherung wurde 1995 als fünfte Säule eingeführt?',
            'Which social insurance was introduced in 1995 as the fifth pillar?',
        ],
        [
            ['Die Krankenversicherung', 'Health insurance'],
            ['Die Pflegeversicherung', 'Long-term care insurance'],
            ['Die Unfallversicherung', 'Accident insurance'],
            ['Die Rentenversicherung', 'Pension insurance'],
        ],
        1,
        [
            'Die soziale Pflegeversicherung kam 1995 als jüngster Zweig dazu. Die anderen vier bestehen seit dem 19. Jahrhundert bzw. den 1920er Jahren.',
            'Long-term care insurance joined in 1995 as the youngest branch. The other four date back to the 19th century or the 1920s.',
        ]
    ),
    single(
        'wiso-social-umlage',
        'wiso',
        'social',
        [
            'Was bedeutet Umlageverfahren in der gesetzlichen Rentenversicherung?',
            'What does pay-as-you-go financing mean in statutory pension insurance?',
        ],
        [
            ['Jeder spart für die eigene Rente auf einem Konto', 'Everyone saves for their own pension in an account'],
            [
                'Die Beiträge der heute Beschäftigten finanzieren die laufenden Renten',
                'The contributions of today’s employees finance the current pensions',
            ],
            ['Der Staat zahlt die Renten allein aus Steuern', 'The state pays the pensions from taxes alone'],
            ['Die Renten werden an der Börse erwirtschaftet', 'The pensions are earned on the stock exchange'],
        ],
        1,
        [
            'Die Rentenversicherung finanziert sich überwiegend aus laufenden Beiträgen (Generationenvertrag), ergänzt durch einen Bundeszuschuss.',
            'Pension insurance is financed mainly from current contributions (generation contract), supplemented by a federal subsidy.',
        ]
    ),
    single(
        'wiso-social-beitraege',
        'wiso',
        'social',
        [
            'Wie werden die Beiträge zur gesetzlichen Renten- und Arbeitslosenversicherung für Beschäftigte grundsätzlich aufgebracht?',
            'How are the contributions to statutory pension and unemployment insurance basically raised for employees?',
        ],
        [
            ['Allein vom Arbeitnehmer', 'By the employee alone'],
            ['Allein vom Arbeitgeber', 'By the employer alone'],
            ['Je zur Hälfte von Arbeitnehmer und Arbeitgeber', 'Half each by employee and employer'],
            ['Vom Finanzamt', 'By the tax office'],
        ],
        2,
        [
            'Renten- und Arbeitslosenversicherung teilen sich Arbeitgeber und Arbeitnehmer hälftig; die Unfallversicherung zahlt allein der Arbeitgeber.',
            'Employer and employee share pension and unemployment insurance half and half; the employer pays accident insurance alone.',
        ]
    ),

    // ------------------------------------------------------------- WiSo: business
    single(
        'wiso-business-ust',
        'wiso',
        'business',
        [
            'Wie hoch ist der Regelsatz der Umsatzsteuer in Deutschland?',
            'What is the standard rate of value added tax in Germany?',
        ],
        [
            ['7 %', '7 %'],
            ['16 %', '16 %'],
            ['19 %', '19 %'],
            ['25 %', '25 %'],
        ],
        2,
        [
            'Der Regelsatz beträgt 19 %, der ermäßigte Satz 7 % (zum Beispiel für Lebensmittel und Bücher).',
            'The standard rate is 19 %, the reduced rate 7 % (for example for food and books).',
        ]
    ),
    single(
        'wiso-business-fixkosten',
        'wiso',
        'business',
        ['Welche Kosten gehören zu den Fixkosten eines Betriebs?', 'Which costs are fixed costs of a company?'],
        [
            ['Rohstoffe je gefertigtem Stück', 'Raw materials per piece produced'],
            ['Die Miete für das Betriebsgebäude', 'The rent for the company building'],
            ['Provisionen je Verkauf', 'Commissions per sale'],
            ['Verpackung je Auftrag', 'Packaging per order'],
        ],
        1,
        [
            'Fixkosten fallen unabhängig von der Menge an (Miete, Versicherung). Material und Provisionen wachsen mit der Menge und sind variable Kosten.',
            'Fixed costs arise regardless of quantity (rent, insurance). Material and commissions grow with quantity and are variable costs.',
        ]
    ),
    single(
        'wiso-business-liquiditaet',
        'wiso',
        'business',
        ['Was versteht man unter Liquidität eines Unternehmens?', 'What is meant by the liquidity of a company?'],
        [
            ['Den Gewinn eines Geschäftsjahres', 'The profit of a financial year'],
            [
                'Die Fähigkeit, Zahlungsverpflichtungen fristgerecht zu erfüllen',
                'The ability to meet payment obligations on time',
            ],
            ['Den Wert aller Maschinen', 'The value of all machines'],
            ['Die Zahl der Beschäftigten', 'The number of employees'],
        ],
        1,
        [
            'Ein Unternehmen kann Gewinn machen und trotzdem zahlungsunfähig werden, wenn das Geld nicht rechtzeitig verfügbar ist.',
            'A company can make a profit and still become insolvent if the money is not available in time.',
        ]
    ),

    // ----------------------------------------------------- WiSo: codetermination
    single(
        'wiso-mb-amtszeit',
        'wiso',
        'codetermination',
        [
            'Wie lange beträgt die regelmäßige Amtszeit eines Betriebsrats?',
            'How long is the regular term of office of a works council?',
        ],
        [
            ['Ein Jahr', 'One year'],
            ['Zwei Jahre', 'Two years'],
            ['Vier Jahre', 'Four years'],
            ['Sechs Jahre', 'Six years'],
        ],
        2,
        [
            'Der Betriebsrat wird für vier Jahre gewählt; die regelmäßigen Wahlen finden alle vier Jahre in einem festen Zeitraum statt.',
            'The works council is elected for four years; the regular elections take place every four years in a fixed period.',
        ]
    ),
    single(
        'wiso-mb-tarifvertrag',
        'wiso',
        'codetermination',
        ['Was ist ein Tarifvertrag?', 'What is a collective agreement?'],
        [
            ['Ein Vertrag zwischen Arbeitnehmer und Kunde', 'A contract between employee and customer'],
            [
                'Eine Vereinbarung zwischen Gewerkschaft und Arbeitgeber oder Arbeitgeberverband über Arbeitsbedingungen',
                'An agreement between a trade union and an employer or employers’ association about working conditions',
            ],
            ['Ein Vertrag zwischen Betriebsrat und Finanzamt', 'A contract between works council and tax office'],
            ['Der Arbeitsvertrag eines einzelnen Beschäftigten', 'The employment contract of a single employee'],
        ],
        1,
        [
            'Tarifverträge regeln unter anderem Löhne, Arbeitszeit und Urlaub für ganze Branchen oder Betriebe. Betriebsvereinbarungen schließen dagegen Betriebsrat und Arbeitgeber.',
            'Collective agreements regulate, among other things, pay, working time and leave for whole sectors or companies. Works agreements, in contrast, are concluded by works council and employer.',
        ]
    ),
];
