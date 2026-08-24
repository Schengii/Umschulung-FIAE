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
