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
