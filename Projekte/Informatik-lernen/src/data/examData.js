export const IHK_EXAM_MODES = [
  {
    id: 'ap1',
    title: 'IHK AP1: Einrichten eines IT-gestützten Arbeitsplatzes',
    description: 'Offizielle Abschlussprüfung Teil 1 für alle IT-Berufe (FIAE, FISI, FIDP, FIDV). Behandelt Hardware, Netzwerke, Beschaffung, Sicherheit & Datenschutz.',
    durationMinutes: 90,
    totalPoints: 100,
    passingScore: 50
  },
  {
    id: 'ap2_fiae',
    title: 'IHK AP2: Fachinformatiker Anwendungsentwicklung (FIAE)',
    description: 'Abschlussprüfung Teil 2: Softwarearchitektur, OOP, Datenbank-Normalisierung, SQL, Algorithmen & Clean Code.',
    durationMinutes: 90,
    totalPoints: 100,
    passingScore: 50
  },
  {
    id: 'ap2_fisi',
    title: 'IHK AP2: Fachinformatiker Systemintegration (FISI)',
    description: 'Abschlussprüfung Teil 2: Routing, Subnetting, Firewalls, Serverdienste (DNS/DHCP), Virtualisierung & Cloud.',
    durationMinutes: 90,
    totalPoints: 100,
    passingScore: 50
  },
  {
    id: 'ap2_fidp',
    title: 'IHK AP2: Fachinformatiker Daten- & Prozessanalyse (FIDP)',
    description: 'Abschlussprüfung Teil 2: ETL-Strecken, Data Warehousing, Data Lineage, Machine Learning, DSGVO & Prozessoptimierung.',
    durationMinutes: 90,
    totalPoints: 100,
    passingScore: 50
  },
  {
    id: 'ap2_fidv',
    title: 'IHK AP2: Fachinformatiker Digitale Vernetzung (FIDV)',
    description: 'Abschlussprüfung Teil 2: Cyber-Physische Systeme, IIoT, MQTT/OPC UA, Edge Computing & industrielle Netzwerksicherheit.',
    durationMinutes: 90,
    totalPoints: 100,
    passingScore: 50
  },
  {
    id: 'ap2_itse',
    title: 'IHK AP2: IT-System-Elektroniker/in (ITSE)',
    description: 'Abschlussprüfung Teil 2: DGUV V3 Prüfungen, RCD/FI-Schutz, USV-Dimensionierung, elektrische Netzsicherheit & Sensorik.',
    durationMinutes: 90,
    totalPoints: 100,
    passingScore: 50
  },
  {
    id: 'quick_mixed',
    title: '⚡ Quick-Check: Gemischte IT-Prüfungsfragen',
    description: 'Kompakte Trainings-Session über alle Themenbereiche zur schnellen Wissensabfrage.',
    durationMinutes: 15,
    totalPoints: 50,
    passingScore: 50
  }
];

export const EXAM_QUESTIONS = [
  // AP1 & Grundlagen
  {
    id: 1,
    examType: 'ap1',
    category: 'Netzwerke & Subnetting',
    difficulty: 'Azubi / IHK',
    question: 'Ein Unternehmen nutzt das IPv4-Subnetz 192.168.10.0/26. Wie viele nutzbare Host-IP-Adressen stehen in diesem Subnetz zur Verfügung?',
    options: [
      '30 Nutzbare Adressen',
      '62 Nutzbare Adressen',
      '126 Nutzbare Adressen',
      '254 Nutzbare Adressen'
    ],
    correct: 1,
    points: 10,
    explanation: 'Ein /26 Subnetz hat 32 - 26 = 6 Host-Bits. 2^6 = 64 Adressen. Abzüglich Netz-ID (192.168.10.0) und Broadcast-Adresse (192.168.10.63) verbleiben 62 nutzbare IP-Adressen.'
  },
  {
    id: 2,
    examType: 'ap2_fiae',
    category: 'Datenbanken & SQL',
    difficulty: 'Azubi / IHK',
    question: 'Welche Aussage beschreibt das Prinzip der 1. Normalform (1NF) einer relationalen Datenbanktabelle korrekt?',
    options: [
      'Jede Tabelle muss einen zusammengesetzten Fremdschlüssel enthalten.',
      'Alle Attributwerte müssen atomar (nicht weiter zerlegbar) sein.',
      'Jedes Nichtschlüsselattribut muss voll funktional vom Primärschlüssel abhängen.',
      'Es dürfen keine transitiven Abhängigkeiten zwischen Nichtschlüsseln existieren.'
    ],
    correct: 1,
    points: 10,
    explanation: 'Die 1. Normalform fordert, dass alle Attribute atomar sind (z. B. Vorname und Nachname in getrennten Spalten statt in einer gemeinsamen).'
  },
  {
    id: 3,
    examType: 'ap1',
    category: 'IT-Security & DSGVO',
    difficulty: 'Azubi / IHK',
    question: 'Ein Angreifer schleust bösartigen JavaScript-Code in ein Forenkommentar-Feld ein. Wann immer ein Nutzer die Seite öffnet, wird das Skript im Browser des Opfers ausgeführt. Welcher Angriffstyp liegt vor?',
    options: [
      'Reflected Cross-Site Scripting (XSS)',
      'Stored (Persistent) Cross-Site Scripting (XSS)',
      'SQL Injection (SQLi)',
      'Cross-Site Request Forgery (CSRF)'
    ],
    correct: 1,
    points: 10,
    explanation: 'Da der Angriffscode dauerhaft in der Datenbank gespeichert wird und bei jedem Aufruf für andere Nutzer ausgeführt wird, handelt es sich um Stored/Persistent XSS.'
  },
  {
    id: 4,
    examType: 'ap1',
    category: 'Computer-Grundlagen',
    difficulty: 'Einsteiger',
    question: 'Wie lautet der Dezimalwert der binären Zahl 1101_2 im Zweiersystem?',
    options: ['11', '13', '15', '9'],
    correct: 1,
    points: 5,
    explanation: '1*8 + 1*4 + 0*2 + 1*1 = 8 + 4 + 0 + 1 = 13.'
  },
  {
    id: 5,
    examType: 'ap2_fiae',
    category: 'Programmierung & Algorithmen',
    difficulty: 'Azubi / IHK',
    question: 'Was versteht man unter dem Begriff "Rekursion" in der Softwareentwicklung?',
    options: [
      'Das sequentielle Abarbeiten von Threads im Betriebssystem.',
      'Eine Funktion, die sich selbst aufruft, bis eine Basisfall-Abbruchbedingung erfüllt ist.',
      'Das Kompilieren von TypeScript zu reinem JavaScript.',
      'Das asynchrone Laden von REST-API-Endpunkten.'
    ],
    correct: 1,
    points: 10,
    explanation: 'Rekursion liegt vor, wenn eine Funktion sich im eigenen Funktionskörper selbst aufruft. Eine Basisfall-Abbruchbedingung verhindert Endlosschleifen und Stack Overflows.'
  },
  {
    id: 6,
    examType: 'ap2_fisi',
    category: 'Netzwerke & Routing',
    difficulty: 'Azubi / IHK',
    question: 'Welches Protokoll arbeitet auf OSI-Schicht 4 (Transport Layer) und garantiert im Gegensatz zu UDP eine verbindungs- und reihenfolgeorientierte Datenübertragung mit 3-Way-Handshake?',
    options: ['ICMP', 'TCP', 'IP', 'ARP'],
    correct: 1,
    points: 10,
    explanation: 'TCP (Transmission Control Protocol) stellt über den 3-Way-Handshake (SYN, SYN-ACK, ACK) eine zuverlässige, flusskontrollierte Verbindung auf Schicht 4 her.'
  },
  {
    id: 7,
    examType: 'ap2_fisi',
    category: 'Serverdienste & IT-Betrieb',
    difficulty: 'Azubi / IHK',
    question: 'Welcher DNS-Record-Typ wird verwendet, um den zuständigen Mailserver für eine Domain im Internet zu definieren?',
    options: ['A-Record', 'CNAME-Record', 'MX-Record', 'TXT-Record'],
    correct: 2,
    points: 10,
    explanation: 'Ein MX-Record (Mail Exchanger) gibt an, unter welchen Hostnamen und mit welcher Priorität E-Mails für eine Domain empfangen werden.'
  },
  {
    id: 8,
    examType: 'ap2_fiae',
    category: 'Software-Design & Clean Code',
    difficulty: 'Azubi / IHK',
    question: 'Wofür steht das "S" im Akronym der SOLID-Entwurfsprinzipien objektorientierter Softwarearchitektur?',
    options: [
      'Simple Interface Principle',
      'Single Responsibility Principle (Einzige Verantwortlichkeit)',
      'Subclass Overriding Principle',
      'System Security Principle'
    ],
    correct: 1,
    points: 10,
    explanation: 'Single Responsibility Principle: Eine Klasse sollte genau eine einzige wohldefinierte Aufgabe bzw. Verantwortung und somit nur einen Grund zur Änderung besitzen.'
  },
  {
    id: 9,
    examType: 'ap1',
    category: 'Hardware & Ergonomie',
    difficulty: 'Azubi / IHK',
    question: 'Welche RAID-Konfiguration bietet eine Striping-Verteilung der Daten über mindestens 3 Datenträger mit verteilter Paritätsinformation und toleriert den Ausfall von genau einer Festplatte?',
    options: ['RAID 0', 'RAID 1', 'RAID 5', 'RAID 10'],
    correct: 2,
    points: 10,
    explanation: 'RAID 5 verteilt Nutzdaten und Block-Paritäten über mindestens 3 Laufwerke. Fällt eine Platte aus, können die Daten anhand der Paritäten rekonstruiert werden.'
  },
  {
    id: 10,
    examType: 'ap2_fiae',
    category: 'Datenbanken & SQL',
    difficulty: 'Azubi / IHK',
    question: 'Welcher SQL-Befehl verknüpft zwei Tabellen so, dass ALLE Datensätze der linken Tabelle enthalten sind und passende Treffer der rechten Tabelle ergänzt werden (bzw. NULL falls kein Treffer)?',
    options: ['INNER JOIN', 'LEFT OUTER JOIN', 'CROSS JOIN', 'RIGHT FULL JOIN'],
    correct: 1,
    points: 10,
    explanation: 'Ein LEFT (OUTER) JOIN liefert stets alle Zeilen der linken Tabelle, unabhängig davon, ob in der verknüpften rechten Tabelle übereinstimmende Zeilen existieren.'
  },
  {
    id: 11,
    examType: 'ap1',
    category: 'Datenschutz & Sicherheit',
    difficulty: 'Azubi / IHK',
    question: 'Welche der folgenden Maßnahmen zählt nach Art. 32 DSGVO primär zur "Zugriffskontrolle"?',
    options: [
      'Ein elektronisches Chipkartenschloss an der Eingangstür des Rechenzentrums',
      'Rollen- und rechtebasierte Dateiberechtigungen (RBAC / ACL) im Betriebssystem',
      'Ein Passwort zum Entsperren des Benutzer-Bildschirms',
      'Einbruchmeldeanlage mit Videoüberwachung des Serverraums'
    ],
    correct: 1,
    points: 10,
    explanation: 'Zutrittskontrolle = Betreten des Gebäudes; Zugangskontrolle = Anmeldung am Rechner/Netzwerk; Zugriffskontrolle = Berechtigung zum Lesen/Schreiben bestimmter Daten.'
  },
  {
    id: 12,
    examType: 'ap1',
    category: 'Hardware & USV',
    difficulty: 'Azubi / IHK',
    question: 'Welcher USV-Typ (Unterbrechungsfreie Stromversorgung) bietet eine Umschaltzeit von 0 ms (unterbrechungsfrei) und schützt optimal vor Netzstörungen und Frequenzschwankungen?',
    options: [
      'Offline-USV (VFD - Voltage and Frequency Dependent)',
      'Line-Interactive-USV (VI - Voltage Independent)',
      'Online-USV / Dauerwandler (VFI - Voltage and Frequency Independent)',
      'Passiver Überspannungs-Filter'
    ],
    correct: 2,
    points: 10,
    explanation: 'Online-USVs (VFI / Doppelwandler) wandeln Netz-Wechselspannung permanent in Gleichspannung und zurück in Sinus-Wechselspannung. Es gibt keine Umschaltzeit (0 ms).'
  },
  {
    id: 13,
    examType: 'ap1',
    category: 'Software & Lizenzen',
    difficulty: 'Azubi / IHK',
    question: 'Was besagt der "Copyleft"-Effekt bei Open-Source-Softwarelizenzen wie der GNU General Public License (GPL)?',
    options: [
      'Der Quellcode darf niemals gewerblich oder kommerziell genutzt werden.',
      'Veränderte oder abgeleitete Werke müssen unter denselben Lizenzbedingungen offengelegt werden.',
      'Der Lizenznehmer muss jährlich Lizenzgebühren an die Free Software Foundation zahlen.',
      'Der Programmcode darf nur auf Linux-basierten Betriebssystemen installiert werden.'
    ],
    correct: 1,
    points: 10,
    explanation: 'Copyleft zwingt Entwickler abgeleiteter Werke (Derivatives), den modifizierten Sourcecode ebenfalls unter der gleichen Open-Source-Lizenz (z. B. GPL) zur Verfügung zu stellen.'
  },
  {
    id: 14,
    examType: 'ap1',
    category: 'Netzwerkinfrastruktur',
    difficulty: 'Azubi / IHK',
    question: 'Welche maximale Übertragungslänge (Permament Link) ist im strukturierten Verkabelungsstandard (z. B. ISO/IEC 11801) für Kupfer-Twisted-Pair-Kabel (z. B. Cat.6a/Cat.7) pro Kanal spezifiziert?',
    options: ['50 Meter', '90 Meter fest + 10 Meter Patchkabel (100 m gesamt)', '250 Meter', '500 Meter'],
    correct: 1,
    points: 10,
    explanation: 'Der Channel-Link beträgt max. 100 m: 90 m Verlegekabel (Permanent Link) plus maximal 10 m flexible Patchkabel (z. B. 2x 5 m).'
  },
  {
    id: 15,
    examType: 'ap2_fiae',
    category: 'Softwarearchitektur & SOLID',
    difficulty: 'Azubi / IHK',
    question: 'Welches SOLID-Prinzip wird verletzt, wenn eine Subklasse eine Methode der Basisklasse so überschreibt, dass das erwartete Verhalten für den Aufrufer gebrochen wird?',
    options: [
      'Single Responsibility Principle (SRP)',
      'Open-Closed Principle (OCP)',
      'Liskov Substitution Principle (LSP)',
      'Interface Segregation Principle (ISP)'
    ],
    correct: 2,
    points: 10,
    explanation: 'Das Liskovsche Substitutionsprinzip (LSP) fordert, dass Objekte einer Basisklasse jederzeit durch Objekte abgeleiteter Subklassen ersetzt werden können, ohne dass das Programm fehlerhaft reagiert.'
  },
  {
    id: 16,
    examType: 'ap2_fiae',
    category: 'Web-APIs & REST',
    difficulty: 'Azubi / IHK',
    question: 'Welcher HTTP-Statuscode sollte von einer REST-API zurückgegeben werden, wenn ein Nutzer authentifiziert ist, aber keine Berechtigung für die angeforderte Ressource besitzt?',
    options: [
      '400 Bad Request',
      '401 Unauthorized',
      '403 Forbidden',
      '404 Not Found'
    ],
    correct: 2,
    points: 10,
    explanation: '401 Unauthorized bedeutet "Nicht authentifiziert" (wer bist du?). 403 Forbidden bedeutet "Zugriff verweigert" (Rechte fehlen / Rollenbeschränkung trotz gültiger Identität).'
  },
  {
    id: 17,
    examType: 'ap2_fiae',
    category: 'Datenbanken & Normalisierung',
    difficulty: 'Azubi / IHK',
    question: 'Wann befindet sich eine relationale Datenbank-Tabelle in der 3. Normalform (3NF)?',
    options: [
      'Wenn alle Spalten atomar sind und keine NULL-Werte vorkommen.',
      'Wenn sie in der 2NF ist und kein Nicht-Schlüsselattribut transitiv vom Primärschlüssel abhängt.',
      'Wenn jede Tabelle mindestens zwei Fremdschlüssel besitzt.',
      'Wenn alle Strings durch numerische IDs ersetzt wurden.'
    ],
    correct: 1,
    points: 10,
    explanation: '3NF erfordert 2NF plus die Eliminierung von transitiven Abhängigkeiten (kein Nicht-Schlüsselattribut darf von einem anderen Nicht-Schlüsselattribut abhängen).'
  },
  {
    id: 18,
    examType: 'ap2_fiae',
    category: 'Design Patterns',
    difficulty: 'Azubi / IHK',
    question: 'Welches Entwurfsmuster (Design Pattern) eignet sich am besten, wenn eine Zustandsänderung eines Objekts automatisch an eine beliebige Anzahl abhängiger Beobachter gemeldet werden soll?',
    options: [
      'Singleton Pattern',
      'Observer Pattern (Beobachter-Muster)',
      'Factory Method Pattern',
      'Adapter Pattern'
    ],
    correct: 1,
    points: 10,
    explanation: 'Das Observer Pattern definiert eine 1-zu-N Abhängigkeit zwischen Objekten, sodass alle Observer automatisch benachrichtigt werden, wenn das Subject seinen Zustand ändert.'
  },
  {
    id: 19,
    examType: 'ap2_fiae',
    category: 'SQL & Abfragen',
    difficulty: 'Azubi / IHK',
    question: 'Welcher Unterschied besteht zwischen der WHERE-Klausel und der HAVING-Klausel in einer SQL-Abfrage mit GROUP BY?',
    options: [
      'WHERE und HAVING sind syntaktische Synonyme ohne Unterschied.',
      'WHERE filtert Zeilen VOR der Gruppierung; HAVING filtert Gruppen NACH der Aggregation (z. B. COUNT, SUM).',
      'HAVING kann nur mit Primärschlüsseln verwendet werden.',
      'WHERE darf nur einmal pro Transaktion aufgerufen werden.'
    ],
    correct: 1,
    points: 10,
    explanation: 'WHERE filtert einzelne Zeilen vor dem Aggregieren. HAVING filtert nach Bildung der Gruppen anhand aggregierter Werte (z. B. HAVING COUNT(*) > 5).'
  },
  {
    id: 20,
    examType: 'ap2_fisi',
    category: 'Netzwerkdienste & DHCP',
    difficulty: 'Azubi / IHK',
    question: 'In welcher Reihenfolge laufen die vier Nachrichtenpakete des klassischen DHCP-Lease-Vorgangs (DORA) zwischen Client und Server ab?',
    options: [
      'Discover -> Offer -> Request -> Acknowledge (DORA)',
      'Demand -> Open -> Receive -> Accept',
      'Discover -> Request -> Offer -> Authorize',
      'Dial -> Connect -> Authenticate -> Bind'
    ],
    correct: 0,
    points: 10,
    explanation: '1. DHCPDISCOVER (Broadcast vom Client)\n2. DHCPOFFER (Angebot vom Server)\n3. DHCPREQUEST (Client fordert die angebotene IP an)\n4. DHCPACK (Server bestätigt die Lease).'
  },
  {
    id: 21,
    examType: 'ap2_fisi',
    category: 'DNS & Nameserver',
    difficulty: 'Azubi / IHK',
    question: 'Welcher DNS-Resource-Record (RR) wird verwendet, um eine Reverse-DNS-Auflösung (Zuordnung einer IP-Adresse zum FQDN-Hostnamen) durchzuführen?',
    options: ['A-Record', 'AAAA-Record', 'MX-Record', 'PTR-Record (Pointer)'],
    correct: 3,
    points: 10,
    explanation: 'PTR (Pointer) Records werden in den Reverse-Lookup-Zonen (in-addr.arpa für IPv4 bzw. ip6.arpa für IPv6) gepflegt, um aus IP-Adressen Hostnamen aufzulösen.'
  },
  {
    id: 22,
    examType: 'ap2_fisi',
    category: 'Virtualisierung & Cloud',
    difficulty: 'Azubi / IHK',
    question: 'Was charakterisiert einen Typ-1-Hypervisor (Bare-Metal) im Vergleich zu einem Typ-2-Hypervisor (Hosted)?',
    options: [
      'Ein Typ-1-Hypervisor läuft als gewöhnliche Anwendungssoftware innerhalb eines Host-Betriebssystems.',
      'Ein Typ-1-Hypervisor wird direkt auf der physischen Server-Hardware ohne zwischengeschaltetes Betriebssystem ausgeführt.',
      'Typ-1-Hypervisoren unterstützen ausschließlich Container, keine virtuellen Maschinen.',
      'Typ-1-Hypervisoren können maximal zwei CPUs ansprechen.'
    ],
    correct: 1,
    points: 10,
    explanation: 'Typ-1-Hypervisoren (z. B. VMware ESXi, Proxmox VE, Microsoft Hyper-V) setzen direkt auf der Hardware auf und bieten maximale Performance und Stabilität für RZ-Umgebungen.'
  },
  {
    id: 23,
    examType: 'ap2_fisi',
    category: 'VLAN & Switching',
    difficulty: 'Azubi / IHK',
    question: 'Wie viele Bits stehen im IEEE 802.1Q-VLAN-Tag für die VLAN-Identifikation (VID) zur Verfügung und wie viele VLANs können dadurch maximal adressiert werden?',
    options: [
      '8 Bits (max. 256 VLANs)',
      '12 Bits (max. 4.096 VLANs; IDs 0-4095)',
      '16 Bits (max. 65.536 VLANs)',
      '24 Bits (max. 16 Mio. VLANs)'
    ],
    correct: 1,
    points: 10,
    explanation: 'Der 802.1Q Tag reserviert 12 Bits für die VLAN-ID (2^12 = 4.096). VLAN 0 und 4095 sind reserviert, nutzbar sind VLANs 1 bis 4094.'
  },
  {
    id: 24,
    examType: 'quick_mixed',
    category: 'WiSo & Arbeitsrecht',
    difficulty: 'Azubi / IHK',
    question: 'Ab welcher Mitarbeiteranzahl (ohne Auszubildende) und nach welcher Mindest-Beschäftigungsdauer greift der gesetzliche Kündigungsschutz nach dem Kündigungsschutzgesetz (KSchG)?',
    options: [
      'Ab mehr als 5 Mitarbeitern nach 3 Monaten',
      'Ab mehr als 10 Mitarbeitern nach 6 Monaten Wartezeit (§ 1 KSchG)',
      'In jedem Betrieb sofort ab dem 1. Arbeitstag',
      'Ab 50 Mitarbeitern nach Vollendung des 25. Lebensjahres'
    ],
    correct: 1,
    points: 10,
    explanation: 'Das KSchG gilt in Betrieben mit in der Regel mehr als 10 Vollzeit-Arbeitnehmern, sobald das Arbeitsverhältnis länger als 6 Monate ohne Unterbrechung bestanden hat.'
  },
  {
    id: 25,
    examType: 'quick_mixed',
    category: 'WiSo & KLR',
    difficulty: 'Azubi / IHK',
    question: 'Ein IT-Systemhaus erhält eine Rechnung über 10.000 € mit der Zahlungsbedingung: "Zahlbar innerhalb 10 Tagen mit 2 % Skonto oder 30 Tage netto Kasse". Wie hoch ist der rechnerische Jahreszinssatz bei Ausnutzung des Skontos?',
    options: ['ca. 2 % p.a.', 'ca. 12 % p.a.', 'ca. 36 % p.a.', 'ca. 72 % p.a.'],
    correct: 2,
    points: 10,
    explanation: 'Kreditzeitraum: 30 - 10 = 20 Tage. Skontosatz: 2 %. Formel für Jahreszinssatz: (2% / 20 Tage) * 360 Tage = 36% p.a. Skontoausnutzung ist extrem lukrativ!'
  },
  {
    id: 26,
    examType: 'ap2_fidp',
    category: 'Datenanalyse & Pipelines',
    difficulty: 'Azubi / IHK',
    question: 'Was versteht man im Kontext moderner Data-Warehouse-Architekturen unter dem ELT-Verfahren im Vergleich zu klassischem ETL?',
    options: [
      'Transformation der Rohdaten erfolgt erst nach dem Laden direkt in der skalierbaren Ziel-Datenbank / Cloud DWH.',
      'Daten werden vor dem Laden komplett im Quellsystem verschlüsselt und anonymisiert.',
      'ELT ist veraltet und darf nach EU-DSGVO nicht mehr verwendet werden.',
      'Beim ELT-Verfahren entfällt der Ladeschritt vollständig zugunsten von Streaming-Queues.'
    ],
    correct: 0,
    points: 10,
    explanation: 'Beim Extract-Load-Transform (ELT) werden Rohdaten zuerst unberührt ins Data Warehouse bzw. den Data Lake geladen. Die rechenintensive Transformation erfolgt flexibel direkt im Zielsystem per SQL oder DB-Engines.'
  },
  {
    id: 27,
    examType: 'ap2_fidp',
    category: 'Data Lineage & Governance',
    difficulty: 'Azubi / IHK',
    question: 'Welches Kernziel verfolgt die Erfassung von "Data Lineage" in einem datengetriebenen Unternehmen?',
    options: [
      'Die kontinuierliche Komprimierung von Backup-Festplatten im SAN.',
      'Die lückenlose Nachvollziehbarkeit des Ursprungs, der Transformationsschritte und des Lebenszyklus von Daten.',
      'Die automatische Zuweisung von IP-Adressen an Analyse-Server per DHCP.',
      'Die physische Absicherung der Serverracks gegen Überschwemmung.'
    ],
    correct: 1,
    points: 10,
    explanation: 'Data Lineage visualisiert und dokumentiert den Ursprung von Datensätzen und alle angewandten Transformationen – unverzichtbar für Audits, Compliance (DSGVO, BCBS 239) und Fehleranalysen.'
  },
  {
    id: 28,
    examType: 'ap2_fidv',
    category: 'Industrielle Vernetzung & IIoT',
    difficulty: 'Azubi / IHK',
    question: 'Welches Protokoll zeichnet sich durch extrem geringen Overhead, Publish-Subscribe-Muster und QoS-Level (0, 1, 2) für ressourcenarme IoT-Sensoren aus?',
    options: ['BGP-4', 'MQTT', 'LDAP', 'SNMPv3'],
    correct: 1,
    points: 10,
    explanation: 'MQTT (Message Queuing Telemetry Transport) ist der weltweite Standard für IIoT und Telemetrie, basierend auf Pub/Sub mit 2-Byte-Header-Overhead und drei Servicequalitätsstufen (QoS 0/1/2).'
  },
  {
    id: 29,
    examType: 'ap2_fidv',
    category: 'Cyber-Physische Systeme',
    difficulty: 'Azubi / IHK',
    question: 'Was ist der Hauptvorteil von OPC UA (Open Platform Communications Unified Architecture) in vernetzten Industrie-4.0-Fertigungsanlagen?',
    options: [
      'Es ersetzt das TCP/IP-Protokoll vollständig durch rein analoge Stromschleifen (4–20 mA).',
      'Plattformunabhängige, semantische Informationsmodellierung mit integrierter Ende-zu-Ende-Sicherheit und Zertifikaten.',
      'Es funktioniert ausschließlich auf Microsoft Windows NT Servern.',
      'Es begrenzt die maximale Übertragungsrate auf 10 Mbit/s zur Vermeidung von Paketstaus.'
    ],
    correct: 1,
    points: 10,
    explanation: 'OPC UA bietet ein herstellerneutrales, semantisches Datenmodell und strikte Sicherheitsarchitektur (X.509-Zertifikate, Verschlüsselung) für die Konvergenz von OT (Operational Technology) und IT.'
  },
  {
    id: 30,
    examType: 'ap2_itse',
    category: 'DGUV V3 & Schutzmaßnahmen',
    difficulty: 'Azubi / IHK',
    question: 'Welcher Grenzwert gilt gemäß DIN VDE 0701-0702 / DGUV Vorschrift 3 typischerweise für den Schutzleiterwiderstand (R_PE) von ortsveränderlichen elektrischen Geräten mit bis zu 5 m Zuleitung?',
    options: [
      'Maximal 0,3 Ω (bzw. 0,2 Ω nach neuerer Normfassung + 0,1 Ω je weitere 7,5 m)',
      'Mindestens 2,0 MΩ',
      'Exakt 10,0 Ω',
      'Es gibt keinen Grenzwert, solange das Gerät startet'
    ],
    correct: 0,
    points: 10,
    explanation: 'Bei Schutzklasse I (Geräte mit Schutzleiter) muss der Schutzleiterwiderstand R_PE niederohmig sein: maximal 0,3 Ω (bzw. 0,2 Ω) für Leitungen bis 5 m, um im Fehlerfall den RCD/LS zuverlässig auszulösen.'
  },
  {
    id: 31,
    examType: 'ap2_itse',
    category: 'Elektrische Sicherheit & RCD',
    difficulty: 'Azubi / IHK',
    question: 'Wie hoch ist der vorgeschriebene Bemessungsfehlerstrom (I_Δn) eines Fehlerstrom-Schutzschalters (RCD/FI) für den Personenschutz in Standard-Steckdosenstromkreisen bis 32 A?',
    options: ['100 mA', '300 mA', '30 mA', '500 mA'],
    correct: 2,
    points: 10,
    explanation: 'Nach DIN VDE 0100-410 ist für Steckdosenstromkreise zum Personenschutz ein RCD mit einem Bemessungsfehlerstrom von höchstens 30 mA (0,03 A) zwingend vorgeschrieben (Herzkammerflimmer-Schwelle).'
  },
  {
    id: 32,
    examType: 'ap1',
    category: 'Algorithmen & Struktogramme',
    difficulty: 'Azubi / IHK',
    question: 'Welches Merkmal kennzeichnet eine kopfgesteuerte Schleife (WHILE) im Nassi-Shneiderman Struktogramm nach DIN 66261?',
    options: [
      'Der Schleifenrumpf wird immer mindestens einmal durchlaufen.',
      'Die Bedingung wird vor dem ersten Durchlauf geprüft; ist sie falsch, wird der Rumpf 0-mal ausgeführt.',
      'Sie darf nur ganzzahlige Zählvariablen enthalten.',
      'Sie kann nicht mit IF-Verzweigungen kombiniert werden.'
    ],
    correct: 1,
    points: 10,
    explanation: 'Bei kopfgesteuerten Schleifen (WHILE) wird die Abbruch-/Fortsetzungsbedingung vor dem Schleifenrumpf geprüft. Ist sie initial false, wird der Rumpf nie (0-mal) ausgeführt.'
  },
  {
    id: 33,
    examType: 'ap1',
    category: 'Projektmanagement & Netzplan',
    difficulty: 'Azubi / IHK',
    question: 'Wie berechnet sich der Gesamtpuffer (GP) eines Vorgangs in der Netzplantechnik (CPM)?',
    options: [
      'GP = Spätester Endzeitpunkt (SEZ) - Frühester Endzeitpunkt (FEZ)',
      'GP = Frühester Anfangszeitpunkt (FAZ) + Dauer',
      'GP = Frühester Endzeitpunkt (FEZ) - Spätester Anfangszeitpunkt (SAZ)',
      'GP = Dauer / 2'
    ],
    correct: 0,
    points: 10,
    explanation: 'Gesamtpuffer GP = SEZ - FEZ bzw. SAZ - FAZ. Gibt an, um wie viele Zeiteinheiten sich ein Vorgang verzögern darf, ohne den Projektendtermin zu verschieben.'
  },
  {
    id: 34,
    examType: 'ap1',
    category: 'WISO & Handelskalkulation',
    difficulty: 'Azubi / IHK',
    question: 'In welcher Reihenfolge erfolgt die Vorwärtskalkulation des Einstandspreises (Bezugspreises)?',
    options: [
      'Listeneinkaufspreis - Skonto = Zieleinkaufspreis - Rabatt = Bareinkaufspreis + Bezugskosten',
      'Listeneinkaufspreis - Lieferantenrabatt = Zieleinkaufspreis - Lieferskonto = Bareinkaufspreis + Bezugskosten = Bezugspreis',
      'Listeneinkaufspreis + Handlungskosten = Selbstkostenpreis + Gewinn',
      'Listeneinkaufspreis + Bezugskosten - Rabatt - Skonto = Einstandspreis'
    ],
    correct: 1,
    points: 10,
    explanation: 'Kalkulationsschema: Listeneinkaufspreis (LEP) minus Rabatt = Zieleinkaufspreis (ZEP) minus Skonto = Bareinkaufspreis (BEP) plus Bezugskosten (Fracht, Verpackung, Versicherung) = Bezugspreis / Einstandspreis.'
  },
  {
    id: 35,
    examType: 'ap2_fiae',
    category: 'Software-Architektur & Clean Code',
    difficulty: 'Azubi / IHK',
    question: 'Was besagt das Single-Responsibility-Prinzip (SRP) aus den SOLID-Entwurfsprinzipien?',
    options: [
      'Eine Klasse darf maximal eine einzige Methode besitzen.',
      'Eine Klasse sollte nur genau einen Grund für eine Änderung haben (nur eine fachliche Verantwortung).',
      'Jede Datenbanktabelle darf nur einen einzigen Fremdschlüssel referenzieren.',
      'Alle Variablen müssen privat deklariert sein.'
    ],
    correct: 1,
    points: 10,
    explanation: 'Das SRP fordert: "A class should have one, and only one, reason to change." Eine Klasse ist für genau einen Aspekt/eine Funktionalität verantwortlich (z. B. Trennung von Geschäftslogik und Daten-Export).'
  },
  {
    id: 36,
    examType: 'ap2_fiae',
    category: 'Datenbanken & Normalisierung',
    difficulty: 'Azubi / IHK',
    question: 'Eine Tabelle besitzt den zusammengesetzten Primärschlüssel (BestellNr, ArtikelNr). Die Spalte ArtikelBezeichnung hängt nur von ArtikelNr ab. Welche Normalform ist hier verletzt?',
    options: [
      '1. Normalform',
      '2. Normalform',
      '3. Normalform',
      'Keine, das ist zulässig'
    ],
    correct: 1,
    points: 10,
    explanation: 'Die 2. Normalform verlangt, dass jedes Nichtschlüsselattribut voll funktional vom GESAMTEN Primärschlüssel abhängt. Da ArtikelBezeichnung nur vom Teilschlüssel ArtikelNr abhängt (partielle Abhängigkeit), liegt eine 2NF-Verletzung vor.'
  },
  {
    id: 37,
    examType: 'ap2_fiae',
    category: 'Design Patterns & OOP',
    difficulty: 'Azubi / IHK',
    question: 'Welches GoF-Entwurfsmuster (Design Pattern) eignet sich ideal, um mehrere Komponenten automatisch über Zustandsänderungen eines Subjekts zu benachrichtigen (1:n Abhängigkeit)?',
    options: [
      'Singleton Pattern',
      'Observer Pattern (Beobachter-Muster)',
      'Adapter Pattern',
      'Strategy Pattern'
    ],
    correct: 1,
    points: 10,
    explanation: 'Das Observer Pattern definiert eine 1-zu-n-Abhängigkeit zwischen Objekten, sodass bei der Änderung eines Objekts alle abhängigen Beobachter automatisch benachrichtigt und aktualisiert werden (z. B. Event-Handling in GUI-Frameworks).'
  },
  {
    id: 38,
    examType: 'ap2_fiae',
    category: 'Software-Testing',
    difficulty: 'Azubi / IHK',
    question: 'Ein System verarbeitet Eingaben von 10 bis 100. Welche Testfall-Werte bilden die vollständige 6-Punkte-Grenzwertanalyse?',
    options: [
      '0, 10, 50, 100, 150',
      '9, 10, 11, 99, 100, 101',
      '10, 50, 100',
      '8, 9, 10, 100, 101, 102'
    ],
    correct: 1,
    points: 10,
    explanation: '6-Punkte-Grenzwertanalyse: min-1 (9), min (10), min+1 (11) sowie max-1 (99), max (100) und max+1 (101).'
  },
  {
    id: 39,
    examType: 'ap2_fisi',
    category: 'Netzwerke & VLAN',
    difficulty: 'Azubi / IHK',
    question: 'Wie viele Bytes umfasst der IEEE 802.1Q Header und welches Protokoll-Identifikationsfeld (TPID) kennzeichnet einen getaggten Ethernet-Frame?',
    options: [
      '2 Bytes mit TPID 0x0800',
      '4 Bytes mit TPID 0x8100',
      '8 Bytes mit TPID 0x88CC',
      '6 Bytes mit TPID 0x0806'
    ],
    correct: 1,
    points: 10,
    explanation: 'Der 802.1Q Tag ist 4 Bytes groß. Die ersten 2 Bytes bilden den TPID mit dem festen Hexadezimalwert 0x8100, gefolgt von 3 Bit PCP (QoS), 1 Bit DEI und 12 Bit VID (VLAN ID).'
  },
  {
    id: 40,
    examType: 'ap2_fisi',
    category: 'Netzwerkdienste & DHCP',
    difficulty: 'Azubi / IHK',
    question: 'In welcher Reihenfolge verläuft der 4-Way DHCP Handshake (DORA) und welche UDP-Ports werden standardmäßig genutzt?',
    options: [
      'Discover, Offer, Request, Acknowledge (Server UDP 67, Client UDP 68)',
      'Request, Discover, Offer, Ack (Server TCP 80, Client TCP 443)',
      'Offer, Discover, Request, Ack (Server UDP 53, Client UDP 53)',
      'Data, Order, Response, Accept (Server UDP 123, Client UDP 123)'
    ],
    correct: 0,
    points: 10,
    explanation: 'DHCP DORA: DHCPDiscover (Client Broadcast) -> DHCPOffer (Server Unicast/Broadcast) -> DHCPRequest (Client) -> DHCPAck (Server). Server hört auf UDP 67, Client auf UDP 68.'
  },
  {
    id: 41,
    examType: 'ap2_fisi',
    category: 'Netzwerke & NAT/PAT',
    difficulty: 'Azubi / IHK',
    question: 'Was versteht man unter PAT (Port Address Translation / NAT Overload)?',
    options: [
      'Die feste 1:1 Zuordnung einer privaten IP zu einer öffentlichen IP ohne Portänderung.',
      'Die Übersetzung vieler interner privater IPs auf eine einzige öffentliche IP mittels dynamischer TCP/UDP Quellport-Zuordnung.',
      'Die Verschlüsselung von IP-Paketen auf Schicht 3 via IPsec.',
      'Die automatische Zuweisung von IPv6 Interface Identifiern via EUI-64.'
    ],
    correct: 1,
    points: 10,
    explanation: 'PAT (Port Address Translation / Overload) ermöglicht hunderten Rechnern im LAN das gleichzeitige Surfen über eine einzige öffentliche IP-Adresse, indem der Router für jeden Socket einen eindeutigen Port vergibt.'
  },
  {
    id: 42,
    examType: 'ap2_fisi',
    category: 'Routing & Hochverfügbarkeit',
    difficulty: 'Azubi / IHK',
    question: 'Welcher CLI-Befehl auf einem Cisco-Router-Subinterface (z.B. g0/0.10) aktiviert die 802.1Q Kapselung für das VLAN 10 ("Router-on-a-Stick")?',
    options: [
      'switchport mode trunk vlan 10',
      'encapsulation dot1Q 10',
      'vlan tagging 10 enable',
      'ip route vlan 10 255.255.255.0'
    ],
    correct: 1,
    points: 10,
    explanation: 'Der Befehl "encapsulation dot1Q <vlan-id>" weist dem logischen Subinterface das entsprechende 802.1Q VLAN-Tag zu, damit der Router getaggte Frames verarbeiten kann.'
  },
  {
    id: 43,
    examType: 'ap2_itse',
    category: 'USV & Stromversorgung',
    difficulty: 'Azubi / IHK',
    question: 'Welche USV-Topologie nach DIN EN 62040-3 arbeitet nach dem Dauerwandler-Prinzip und garantiert 0 ms Umschaltzeit bei Netzausfall?',
    options: [
      'VFD (Offline / Standby USV)',
      'VI (Line-Interactive USV)',
      'VFI (Online / Doppelwandler-USV)',
      'Schukostecker-Bypass'
    ],
    correct: 2,
    points: 10,
    explanation: 'VFI (Voltage and Frequency Independent) USVs wandeln Netzspannung permanent in Gleichspannung und über den Wechselrichter wieder in Wechselspannung um. Dadurch existiert keinerlei Umschaltverzögerung (0 ms).'
  },
  {
    id: 44,
    examType: 'ap2_itse',
    category: 'Elektrotechnik & Leistung',
    difficulty: 'Azubi / IHK',
    question: 'Ein Servernetzteil nimmt eine Wirkleistung von P = 600 Watt bei einem Leistungsfaktor cos φ = 0,75 auf. Wie hoch ist die aufgenommene Scheinleistung S?',
    options: ['450 VA', '600 VA', '800 VA', '1.000 VA'],
    correct: 2,
    points: 10,
    explanation: 'Formel: S = P / cos φ = 600 W / 0,75 = 800 VA.'
  },
  {
    id: 45,
    examType: 'ap2_fidp',
    category: 'Data Engineering & ETL',
    difficulty: 'Azubi / IHK',
    question: 'Was ist der Hauptunterschied zwischen traditionellem ETL (Extract-Transform-Load) und modernem ELT in Cloud Data Warehouses (z. B. Snowflake, BigQuery)?',
    options: [
      'Bei ELT werden Rohdaten direkt in das Warehouse geladen und erst dort mit der Rechenleistung der Cloud-Datenbank transformiert.',
      'ETL kann keine relationalen Datenbanken verarbeiten.',
      'ELT löscht Rohdaten vor der Transformation, um Speicherplatz zu sparen.',
      'Bei ELT werden Daten ausschließlich per E-Mail übertragen.'
    ],
    correct: 0,
    points: 10,
    explanation: 'Bei ELT (Extract-Load-Transform) werden unstrukturierte/strukturierte Rohdaten direkt in den Data Lake/Warehouse geladen und on-demand mithilfe der massiven Skalierbarkeit der Cloud-Datenbank transformiert.'
  },
  {
    id: 46,
    examType: 'ap2_fidp',
    category: 'Datenqualität & DSGVO',
    difficulty: 'Azubi / IHK',
    question: 'Welcher Grundsatz der DSGVO (Art. 5) verlangt, dass personenbezogene Daten "auf das für die Zwecke der Verarbeitung notwendige Maß beschränkt sein müssen"?',
    options: [
      'Zweckbindung',
      'Datenminimierung (Datenvermeidung und Sparsamkeit)',
      'Richtigkeit',
      'Integrität und Vertraulichkeit'
    ],
    correct: 1,
    points: 10,
    explanation: 'Der Grundsatz der Datenminimierung (Art. 5 Abs. 1 lit. c DSGVO) besagt, dass Daten dem Zweck angemessen und erheblich sowie auf das für die Zwecke der Verarbeitung notwendige Maß beschränkt sein müssen.'
  },
  {
    id: 47,
    examType: 'ap2_fidv',
    category: 'IIoT & CPS',
    difficulty: 'Azubi / IHK',
    question: 'Welches MQTT QoS (Quality of Service) Level stellt sicher, dass eine Sensornachricht garantiert genau einmal ("exactly once") beim Broker/Empfänger ankommt?',
    options: [
      'QoS 0 (At most once / Best Effort)',
      'QoS 1 (At least once / Mindestens einmal)',
      'QoS 2 (Exactly once / Genau einmal)',
      'QoS 3 (Infinite loop)'
    ],
    correct: 2,
    points: 10,
    explanation: 'QoS 2 ist das höchste MQTT-Zustellungslevel mit einem 4-Way-Handshake (PUBLISH -> PUBREC -> PUBREL -> PUBCOMP), das Duplikate und Nachrichtenverluste zuverlässig ausschließt.'
  },
  {
    id: 48,
    examType: 'ap2_fidv',
    category: 'Industrienetze & Edge',
    difficulty: 'Azubi / IHK',
    question: 'Welcher entscheidende Vorteil zeichnet das industrielle Kommunikationsprotokoll OPC UA gegenüber klassischem Modbus aus?',
    options: [
      'OPC UA ist herstellerunabhängig, plattformneutral, unterstützt semantische Informationsmodelle und integrierte Ende-zu-Ende Verschlüsselung.',
      'OPC UA benötigt keine IP-Adressen und funktioniert nur über serielle RS-232 Kabel.',
      'Modbus bietet mehr Verschlüsselungsmechanismen als OPC UA.',
      'OPC UA kann nur maximal 8 Sensoren gleichzeitig ansteuern.'
    ],
    correct: 0,
    points: 10,
    explanation: 'OPC UA (Open Platform Communications Unified Architecture) ist der weltweite Standard für Industrie 4.0: plattformunabhängig, semantisch typisiert und von Haus aus mit robuster Zertifikats- und Verschlüsselungssicherheit (X.509) ausgestattet.'
  },
  {
    id: 49,
    examType: 'ap1',
    category: 'IT-Sicherheit & Kryptographie',
    difficulty: 'Azubi / IHK',
    question: 'Alice möchte Bob eine vertrauliche Nachricht senden. Mit welchem kryptographischen Schlüssel muss Alice die Nachricht in einem asymmetrischen Kryptosystem verschlüsseln?',
    options: [
      'Mit ihrem eigenen privaten Schlüssel (Alice Private Key)',
      'Mit Bobs öffentlichem Schlüssel (Bob Public Key)',
      'Mit ihrem eigenen öffentlichen Schlüssel (Alice Public Key)',
      'Mit einem gemeinsamen Pre-Shared Key (PSK)'
    ],
    correct: 1,
    points: 10,
    explanation: 'Zur vertraulichen Verschlüsselung wird stets der öffentliche Schlüssel des Empfängers (Bob Public Key) genutzt. Nur der Empfänger kann die Nachricht mit seinem dazugehörigen geheimen privaten Schlüssel (Bob Private Key) entschlüsseln.'
  },
  {
    id: 50,
    examType: 'ap1',
    category: 'Speichersysteme & RAID',
    difficulty: 'Azubi / IHK',
    question: 'Ein Server wird mit einem RAID 5 Verbund aus vier Festplatten mit jeweils 2 Terabyte Kapazität ausgestattet. Wie viel nutzbare Speicherkapazität steht zur Verfügung?',
    options: ['2 Terabyte', '4 Terabyte', '6 Terabyte', '8 Terabyte'],
    correct: 2,
    points: 10,
    explanation: 'Bei RAID 5 wird die Kapazität einer Festplatte für Paritätsdaten reserviert: Nutzbare Kapazität = (n - 1) * Kapazität = (4 - 1) * 2 TB = 3 * 2 TB = 6 TB.'
  },
  {
    id: 51,
    examType: 'ap1',
    category: 'Datenschutz & TOMs',
    difficulty: 'Azubi / IHK',
    question: 'Welche der folgenden Maßnahmen zählt zu den "Zutrittskontrollen" im Sinne der technisch-organisatorischen Maßnahmen (TOMs)?',
    options: [
      'Passwortkomplexitätsregeln für Benutzerkonten',
      'Elektronische Chipkarten-Schließanlage und Wachpersonal am Eingang des Rechenzentrums',
      'Rollen- und Rechtevergabe im ERP-System',
      'Verschlüsselung der Festplatten mit BitLocker'
    ],
    correct: 1,
    points: 10,
    explanation: 'Zutrittskontrolle verhindert den physischen Zutritt unbefugter Personen zu Verarbeitungsanlagen (z. B. Schließanlagen, Zäune, Pförtner). Zugangskontrolle regelt den Login am System, Zugriffskontrolle die Datenberechtigungen.'
  }
];

export const getIhkGrade = (percent) => {
  if (percent >= 92) return { grade: 1, text: 'Sehr Gut', color: '#10b981', note: 'Hervorragende IHK-Prüfungsleistung!' };
  if (percent >= 81) return { grade: 2, text: 'Gut', color: '#3b82f6', note: 'Überdurchschnittliches Ergebnis, voll prüfungsbereit.' };
  if (percent >= 67) return { grade: 3, text: 'Befriedigend', color: '#eab308', note: 'Solide Leistung mit leichten Wissenslücken.' };
  if (percent >= 50) return { grade: 4, text: 'Ausreichend', color: '#f97316', note: 'Prüfung knapp bestanden, Vertiefung empfohlen.' };
  if (percent >= 30) return { grade: 5, text: 'Mangelhaft', color: '#ef4444', note: 'Nicht bestanden. Wiederholung der Themen nötig.' };
  return { grade: 6, text: 'Ungenügend', color: '#991b1b', note: 'Kritisch. Intensives Grundlagenstudium erforderlich.' };
};
