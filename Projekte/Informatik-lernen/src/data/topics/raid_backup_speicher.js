/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'HDD, SSD und NVMe sowie DAS, NAS und SAN unterscheiden',
    'Nutzkapazität und Ausfallsicherheit von RAID 0, 1, 5, 6 und 10 berechnen',
    'Voll-, inkrementelle und differenzielle Sicherung vergleichen und eine Wiederherstellung planen',
    'Generationenprinzip, 3-2-1-Regel, RPO/RTO und USV-Typen erklären und eine USV dimensionieren'
  ],
  content: `
## Massenspeicher

| Merkmal | HDD | SATA-SSD | NVMe-SSD |
| :--- | :--- | :--- | :--- |
| Technik | rotierende Magnetscheiben, Schreib-/Lesekopf | Flash-Speicher (NAND) | Flash-Speicher, direkt über PCIe |
| Schnittstelle | SATA, SAS | SATA III (6 Gbit/s ≈ 550 MB/s) | PCIe 4.0 x4 ≈ 7 GB/s, PCIe 5.0 mehr |
| Zugriffszeit | mehrere Millisekunden | unter 0,1 ms | unter 0,1 ms |
| Stärken | günstig pro TB, große Kapazitäten | schnell, robust, leise | sehr schnell, viele parallele Zugriffe |
| Schwächen | mechanisch empfindlich, langsam | begrenzte Schreibzyklen (TBW) | Wärme, Preis |

Die Lebensdauer einer SSD geben Hersteller als **TBW** (*Terabytes Written*) oder **DWPD** (*Drive Writes Per Day*) an. Für Archive und Backups bleiben HDDs und Magnetbänder (LTO) wegen des Preises pro TB wichtig.

### Speicher im Netzwerk

- **DAS** (*Direct Attached Storage*): direkt am Server, z. B. interne Platten oder ein externes Gehäuse.
- **NAS** (*Network Attached Storage*): Dateiserver im LAN, Zugriff **dateibasiert** über SMB oder NFS.
- **SAN** (*Storage Area Network*): eigenes Speichernetz, Zugriff **blockbasiert** über Fibre Channel oder iSCSI. Der Server sieht die Speicherbereiche (LUNs) wie lokale Platten.

## RAID

**RAID** (*Redundant Array of Independent Disks*) fasst mehrere Platten zu einem logischen Laufwerk zusammen – für mehr Geschwindigkeit, mehr Ausfallsicherheit oder beides.

![Datenverteilung bei RAID 0, 1, 5 und 10](raid-level.svg "Striping, Spiegelung und Parität: So verteilen die RAID-Level die Datenblöcke")

| Level | Prinzip | min. Platten | Nutzkapazität (n Platten à C) | verträgt Ausfälle |
| :--- | :--- | :---: | :--- | :--- |
| RAID 0 | Striping | 2 | n × C | 0 |
| RAID 1 | Spiegelung | 2 | C (bei 2 Platten) | 1 |
| RAID 5 | Striping + verteilte Parität | 3 | (n − 1) × C | 1 |
| RAID 6 | Striping + doppelte Parität | 4 | (n − 2) × C | 2 (beliebige) |
| RAID 10 | Stripe über Spiegelpaare | 4 | n ÷ 2 × C | mind. 1, max. 1 je Paar |

Haben die Platten unterschiedliche Größen, zählt bei fast allen Leveln die **kleinste** Platte.

### Wie funktioniert die Parität?

RAID 5 speichert pro Stripe einen Paritätsblock, berechnet mit **XOR**. Fällt eine Platte aus, lässt sich jeder fehlende Block aus den übrigen per XOR zurückrechnen:

| Block | Wert |
| :--- | :--- |
| A1 | \`1011\` |
| A2 | \`0110\` |
| Parität Ap = A1 XOR A2 | \`1101\` |
| Wiederherstellung A1 = A2 XOR Ap | \`1011\` ✓ |

### Hot Spare und Rebuild

Eine **Hot-Spare**-Platte steht leer bereit und springt bei einem Ausfall automatisch ein. Während des **Rebuilds** werden alle übrigen Platten stark belastet. Bei großen Platten kann das viele Stunden dauern. Fällt in dieser Zeit bei RAID 5 eine zweite Platte aus, sind die Daten verloren – deshalb nimmt man für große Arrays RAID 6 oder RAID 10.

> [!warning] RAID ist kein Backup
> RAID schützt nur vor dem **Ausfall einer Platte**. Gegen versehentliches Löschen, Ransomware, Softwarefehler, Diebstahl oder Brand hilft es nicht: Eine gelöschte Datei ist auf allen Platten gleichzeitig weg.

## Datensicherung

### Sicherungsarten

| Art | Was wird gesichert? | Sicherung | Wiederherstellung |
| :--- | :--- | :--- | :--- |
| Vollsicherung | alle Daten | langsam, viel Platz | schnell: nur die letzte Vollsicherung |
| Differenziell | alle Änderungen **seit der letzten Vollsicherung** | wird von Tag zu Tag größer | Vollsicherung + **letzte** differenzielle |
| Inkrementell | alle Änderungen **seit der letzten Sicherung** (egal welcher Art) | schnell, wenig Platz | Vollsicherung + **alle** inkrementellen in Reihenfolge |

Unter Windows markiert das **Archivbit**, ob eine Datei seit der letzten Sicherung geändert wurde. Voll- und inkrementelle Sicherung setzen es zurück, die differenzielle nicht.

> [!example] Wiederherstellung nach einem Ausfall am Donnerstag
> Sonntag Vollsicherung, Montag bis Mittwoch je eine Teilsicherung, Ausfall Donnerstagmorgen.
> - **Differenziell:** Vollsicherung (So) + differenzielle Sicherung (Mi) = **2 Sicherungen**
> - **Inkrementell:** Vollsicherung (So) + Mo + Di + Mi = **4 Sicherungen**, alle müssen lesbar sein

### Generationenprinzip (Großvater-Vater-Sohn)

Datenträger werden rotierend wiederverwendet:

- **Söhne**: tägliche Sicherungen (z. B. Montag bis Donnerstag, 4 Medien)
- **Väter**: wöchentliche Sicherungen (z. B. jeden Freitag, 4–5 Medien)
- **Großväter**: monatliche Sicherungen (z. B. 12 Medien, eines je Monat)

So hat man mit rund 20 Medien Stände vom Vortag bis ein Jahr zurück.

### Die 3-2-1-Regel

- **3** Kopien der Daten (Original + 2 Sicherungen)
- auf **2** verschiedenen Medientypen
- **1** Kopie außer Haus (Offsite, z. B. Rechenzentrum oder Cloud)

Wegen Ransomware erweitert man das oft zu **3-2-1-1-0**: zusätzlich **1** Kopie offline oder unveränderbar (*immutable*), und **0** Fehler bei regelmäßigen Wiederherstellungstests. Ein Backup, dessen Rücksicherung nie getestet wurde, ist nur eine Hoffnung.

### RPO und RTO

- **RPO** (*Recovery Point Objective*): Wie viel **Datenverlust** (in Zeit) ist tolerierbar? Ein RPO von 4 Stunden verlangt mindestens alle 4 Stunden eine Sicherung.
- **RTO** (*Recovery Time Objective*): Wie lange darf die **Wiederherstellung** dauern, bis das System wieder läuft?

## Unterbrechungsfreie Stromversorgung (USV)

Eine **USV** überbrückt Stromausfälle und schützt vor Spannungsschwankungen, bis Generatoren anlaufen oder Server sauber heruntergefahren sind. Die Norm IEC 62040-3 unterscheidet drei Klassen:

| Typ | Klasse | Arbeitsweise | Umschaltzeit | Einsatz |
| :--- | :--- | :--- | :--- | :--- |
| Offline / Standby | VFD | Last hängt direkt am Netz, bei Ausfall Umschaltung auf Batterie | einige ms | Arbeitsplatz-PCs |
| Line-Interactive | VI | wie Offline, regelt zusätzlich Spannungsschwankungen aus | wenige ms | kleine Server, Netzwerktechnik |
| Online / Doppelwandler | VFI | Strom läuft ständig über Gleichrichter und Wechselrichter | keine | Rechenzentrum, kritische Server |

### USV dimensionieren

Leistungsangaben: **Wirkleistung P in Watt** und **Scheinleistung S in VA**. Es gilt **P = S × cos φ** (Leistungsfaktor). Eine USV mit 1.500 VA und cos φ = 0,9 liefert höchstens 1.350 W.

> [!example] Beispiel
> Server 450 W, Switch 60 W, Storage 290 W → zusammen 800 W. Mit cos φ = 0,8: S = 800 W ÷ 0,8 = **1.000 VA**. Mit 25 % Reserve: **1.250 VA** → man wählt das nächstgrößere Modell, z. B. 1.500 VA.

Die **Überbrückungszeit** hängt von Batteriekapazität und Last ab. Grob: Energie der Batterie (Wh) × Wirkungsgrad ÷ Last (W).
`,
  codeSnippet: `// RAID-Nutzkapazität (gleich große Platten)
function raidCapacity(level, disks, sizeTB) {
  switch (level) {
    case 0:  return disks * sizeTB;
    case 1:  return sizeTB;                 // klassischer 2er-Spiegel
    case 5:  return (disks - 1) * sizeTB;   // ab 3 Platten
    case 6:  return (disks - 2) * sizeTB;   // ab 4 Platten
    case 10: return (disks / 2) * sizeTB;   // gerade Anzahl, ab 4
    default: throw new Error('Unbekanntes Level');
  }
}
console.log(raidCapacity(5, 6, 4)); // 20 (TB)
console.log(raidCapacity(6, 6, 4)); // 16 (TB)`,
  codeLanguage: 'JavaScript',
  exercises: [
    {
      id: 'raid-vergleich',
      title: 'RAID-Level für einen Dateiserver',
      prompt: 'Ein Dateiserver bekommt **6 Festplatten à 4 TB**. Berechne für RAID 5, RAID 6 und RAID 10 die Nutzkapazität und den Anteil der Nutzkapazität an der Bruttokapazität. Welches Level empfiehlst du, wenn während eines Rebuilds eine weitere Platte ausfallen darf?',
      hints: ['Brutto: 6 × 4 TB = 24 TB.'],
      solution: '| Level | Nutzkapazität | Anteil |\n| :--- | :--- | :--- |\n| RAID 5 | 5 × 4 = **20 TB** | 83,3 % |\n| RAID 6 | 4 × 4 = **16 TB** | 66,7 % |\n| RAID 10 | 3 × 4 = **12 TB** | 50 % |\n\nEmpfehlung: **RAID 6** – es verträgt zwei **beliebige** Plattenausfälle. RAID 10 verträgt zwar bis zu drei, aber nur wenn sie in verschiedenen Spiegelpaaren liegen; fällt der Spiegelpartner aus, sind die Daten weg.'
    },
    {
      id: 'backup-planung',
      title: 'Sicherungsstrategie bewerten',
      prompt: 'Ein Betrieb sichert sonntags voll (400 GB). Täglich ändern sich etwa 20 GB (immer andere Dateien). Wie groß sind die Sicherungen von Montag bis Freitag bei **differenzieller** und bei **inkrementeller** Sicherung, und wie viel Speicher braucht die Woche insgesamt jeweils?',
      solution: '**Differenziell** (seit der Vollsicherung): Mo 20, Di 40, Mi 60, Do 80, Fr 100 GB → zusammen 300 GB + 400 GB = **700 GB**.\n\n**Inkrementell** (seit der letzten Sicherung): je 20 GB → 100 GB + 400 GB = **500 GB**.\n\nInkrementell spart Platz und Zeit beim Sichern, die Wiederherstellung am Samstag braucht aber 6 Sicherungen statt 2.'
    },
    {
      id: 'usv-dimensionieren',
      title: 'USV für den Serverschrank',
      prompt: 'Im Serverschrank laufen zwei Server mit je 380 W, eine Firewall mit 45 W und ein Switch mit 75 W. Der Leistungsfaktor beträgt 0,9. Plane 20 % Reserve ein. Welche Scheinleistung muss die USV mindestens haben, und welcher USV-Typ passt?',
      solution: 'Wirkleistung: 2 × 380 + 45 + 75 = **880 W**.\nScheinleistung: 880 ÷ 0,9 ≈ **977,8 VA**.\nMit 20 % Reserve: 977,8 × 1,2 ≈ **1.173 VA** → z. B. eine 1.500-VA-USV.\nTyp: für Server eine **Online-USV (VFI)**, weil sie ohne Umschaltzeit arbeitet und die Last ständig von Netzstörungen trennt.'
    },
    {
      id: 'rpo-rto',
      title: 'RPO und RTO einordnen',
      prompt: 'Ein Onlineshop verlangt: „Wir dürfen höchstens 15 Minuten Bestellungen verlieren und müssen nach spätestens 2 Stunden wieder online sein.“ Ordne RPO und RTO zu und nenne je eine technische Maßnahme.',
      solution: '**RPO = 15 Minuten** (maximaler Datenverlust) → z. B. Datenbank-Replikation oder Transaktionslog-Sicherung alle 15 Minuten.\n**RTO = 2 Stunden** (maximale Ausfallzeit) → z. B. vorbereitetes Standby-System, Snapshots, dokumentierter und geübter Wiederherstellungsplan.'
    }
  ],
  quiz: [
    {
      question: 'Wie viel Nutzkapazität bietet ein RAID 5 aus 4 Platten à 2 TB?',
      options: ['8 TB', '6 TB', '4 TB', '2 TB'],
      correct: 1,
      explanation: '(n − 1) × C = 3 × 2 TB = 6 TB. Die Kapazität einer Platte geht für die Parität drauf.'
    },
    {
      question: 'Welches RAID-Level bietet keine Redundanz?',
      options: ['RAID 0', 'RAID 1', 'RAID 5', 'RAID 6'],
      correct: 0,
      explanation: 'RAID 0 verteilt die Daten nur (Striping). Fällt eine Platte aus, sind alle Daten verloren.'
    },
    {
      question: 'Welche Sicherungen braucht man bei differenzieller Sicherung zur Wiederherstellung?',
      options: [
        'Nur die letzte differenzielle Sicherung',
        'Die letzte Vollsicherung und alle differenziellen Sicherungen',
        'Die letzte Vollsicherung und die letzte differenzielle Sicherung',
        'Alle Sicherungen der letzten 30 Tage'
      ],
      correct: 2,
      explanation: 'Jede differenzielle Sicherung enthält alle Änderungen seit der Vollsicherung – die letzte reicht also aus.'
    },
    {
      question: 'Wofür steht die „1“ in der 3-2-1-Regel?',
      options: ['Eine Vollsicherung pro Woche', 'Eine Kopie außer Haus', 'Ein RAID-1-Verbund', 'Ein Administrator pro Server'],
      correct: 1,
      explanation: '3 Kopien, 2 Medientypen, 1 Kopie an einem anderen Standort (Offsite).'
    },
    {
      question: 'Welcher USV-Typ arbeitet ohne Umschaltzeit?',
      options: ['Offline (VFD)', 'Line-Interactive (VI)', 'Online-Doppelwandler (VFI)', 'Alle drei'],
      correct: 2,
      explanation: 'Bei der Online-USV läuft der Strom ständig über den Wechselrichter, es muss nichts umgeschaltet werden.'
    },
    {
      question: 'Ein Mitarbeiter löscht versehentlich einen Ordner auf einem RAID-1-Server. Was gilt?',
      options: [
        'Die zweite Platte enthält den Ordner noch',
        'Der Ordner ist auf beiden Platten gelöscht – nur ein Backup hilft',
        'RAID 1 stellt den Ordner automatisch wieder her',
        'Ein Rebuild bringt den Ordner zurück'
      ],
      correct: 1,
      explanation: 'Die Spiegelung überträgt auch das Löschen sofort. RAID ersetzt kein Backup.'
    },
    {
      question: 'Was beschreibt der RPO?',
      options: [
        'Die maximal tolerierbare Ausfallzeit',
        'Den maximal tolerierbaren Datenverlust, gemessen in Zeit',
        'Die Anzahl der Sicherungsmedien',
        'Die Dauer eines RAID-Rebuilds'
      ],
      correct: 1,
      explanation: 'RPO = Recovery Point Objective, also wie weit der letzte nutzbare Datenstand zurückliegen darf. Die Ausfallzeit beschreibt der RTO.'
    }
  ],
  relatedLabs: [
    { id: 'raid_calculator_lab', label: 'RAID-Rechner' },
    { id: 'raid6_galois_lab', label: 'RAID 6: doppelte Parität' },
    { id: 'backup_strategy_lab', label: 'Backup-Strategie (GFS)' },
    { id: 'usv_calculator_lab', label: 'USV-Rechner' }
  ],
  sources: [
    { title: 'BSI IT-Grundschutz-Kompendium, Baustein CON.3 Datensicherungskonzept', url: 'https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/IT-Grundschutz/IT-Grundschutz-Kompendium/it-grundschutz-kompendium_node.html' },
    { title: 'Patterson, Gibson, Katz (1988): A Case for Redundant Arrays of Inexpensive Disks (RAID)', url: 'https://www2.eecs.berkeley.edu/Pubs/TechRpts/1987/CSD-87-391.pdf' },
    { title: 'Wikipedia: RAID', url: 'https://de.wikipedia.org/wiki/RAID' },
    { title: 'Wikipedia: Unterbrechungsfreie Stromversorgung (Klassen nach IEC 62040-3)', url: 'https://de.wikipedia.org/wiki/Unterbrechungsfreie_Stromversorgung' },
    { title: 'Eigene Lernkarten zur FIAE-Umschulung: RAID-Systeme, Speichermedien, Datensicherung', note: 'nicht öffentlich' }
  ],
  sourcesCheckedOn: '29.10.2026'
};
