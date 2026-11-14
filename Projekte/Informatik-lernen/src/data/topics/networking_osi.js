/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Die sieben OSI-Schichten mit Aufgabe, Dateneinheit, Protokollen und Geräten benennen',
    'OSI- und TCP/IP-Modell zuordnen und die Kapselung beschreiben',
    'Switch, Router und Access Point sowie MAC- und IP-Adresse voneinander abgrenzen',
    'TCP und UDP vergleichen, wichtige Ports nennen und den Ablauf von ARP, DHCP und DNS erklären'
  ],
  content: `
## Warum ein Schichtenmodell?

Netzwerkkommunikation ist kompliziert: Kabel, Funk, Adressierung, Wegfindung, Fehlerkorrektur, Verschlüsselung und die eigentliche Anwendung. Ein **Schichtenmodell** zerlegt das in Teilaufgaben. Jede Schicht nutzt nur die Dienste der Schicht darunter und bietet der Schicht darüber eine Schnittstelle an. So kann man z. B. WLAN gegen Ethernet tauschen, ohne den Browser zu ändern.

![OSI- und TCP/IP-Modell im Vergleich](osi-modell.svg "Die 7 OSI-Schichten, ihre Zuordnung zum TCP/IP-Modell und typische Protokolle und Geräte")

## Die sieben OSI-Schichten

| Nr. | Schicht | Aufgabe | Adressen / Beispiele |
| :---: | :--- | :--- | :--- |
| 7 | Anwendung (*Application*) | Schnittstelle zu Programmen | HTTP, DNS, SMTP, FTP, SSH |
| 6 | Darstellung (*Presentation*) | Datenformat, Kodierung, Verschlüsselung, Kompression | TLS, UTF-8, JPEG |
| 5 | Sitzung (*Session*) | Aufbau, Steuerung und Abbau von Sitzungen | RPC, Checkpoints |
| 4 | Transport | Ende-zu-Ende zwischen Prozessen, Segmentierung, ggf. Zuverlässigkeit | **Ports**, TCP, UDP |
| 3 | Vermittlung (*Network*) | logische Adressierung und Wegewahl (Routing) zwischen Netzen | **IP-Adressen**, ICMP |
| 2 | Sicherung (*Data Link*) | Übertragung im lokalen Segment, Fehlererkennung (CRC) | **MAC-Adressen**, Ethernet, WLAN |
| 1 | Bitübertragung (*Physical*) | Bits als Signale übertragen | Kabel, Stecker, Funkfrequenzen |

> [!tip] Merksätze
> Von unten (1 → 7): „**B**itte **S**ag **V**ati **T**schüss, **S**onst **D**roht **Ä**rger.“
> Englisch von oben: „**A**ll **P**eople **S**eem **T**o **N**eed **D**ata **P**rocessing.“

### OSI und TCP/IP

Im Internet wird nicht das OSI-Modell, sondern das **TCP/IP-Modell** (DoD-Modell) umgesetzt. Es fasst Schichten zusammen: **Anwendung** (OSI 5–7), **Transport** (4), **Internet** (3) und **Netzzugang** (1–2). OSI ist das Referenzmodell zum Erklären und Einordnen, TCP/IP die Praxis.

## Kapselung (Encapsulation)

Beim Senden fügt jede Schicht ihre Steuerinformationen als **Header** hinzu, beim Empfangen entfernt die entsprechende Schicht sie wieder:

1. Die Anwendung erzeugt **Daten** (z. B. eine HTTP-Anfrage).
2. Die Transportschicht setzt einen TCP-Header davor (Quell- und Zielport, Sequenznummer) → **Segment**.
3. Die Vermittlungsschicht ergänzt den IP-Header (Quell- und Ziel-IP, TTL) → **Paket**.
4. Die Sicherungsschicht rahmt alles mit Ethernet-Header (Quell- und Ziel-MAC) und Prüfsumme (FCS) ein → **Frame**.
5. Die Bitübertragungsschicht sendet die **Bits** als Spannung, Licht oder Funkwelle.

Wichtig: **Router tauschen den Ethernet-Rahmen** an jedem Hop aus (neue MAC-Adressen), die **IP-Adressen bleiben** von Quelle bis Ziel gleich – außer bei NAT.

## Netzwerkgeräte

| Gerät | Schicht | Arbeitsweise |
| :--- | :---: | :--- |
| Hub / Repeater | 1 | verstärkt Signale und sendet alles an alle Ports, eine Kollisionsdomäne |
| Switch | 2 | lernt MAC-Adressen (MAC-Tabelle/CAM) und leitet Frames gezielt weiter, jeder Port eine eigene Kollisionsdomäne |
| Access Point | 2 | verbindet WLAN-Clients mit dem kabelgebundenen LAN |
| Router | 3 | verbindet **verschiedene Netze**, entscheidet anhand der Routing-Tabelle, trennt Broadcast-Domänen |
| Layer-3-Switch | 2 + 3 | Switch mit Routing-Funktion, z. B. zwischen VLANs |
| Firewall | 3–7 | filtert nach Regeln (Paketfilter, Stateful Inspection, Application Layer) |

> [!exam] Prüfungsklassiker: MAC vs. IP
> Die **MAC-Adresse** (48 Bit, z. B. \`00:1A:2B:3C:4D:5E\`) ist an die Netzwerkkarte gebunden und gilt nur im **lokalen Segment**. Die **IP-Adresse** ist logisch, vom Netz abhängig und wird **über Router hinweg** genutzt. Broadcasts (\`FF:FF:FF:FF:FF:FF\`) überschreiten keinen Router.

## TCP oder UDP?

| Merkmal | TCP | UDP |
| :--- | :--- | :--- |
| Verbindung | verbindungsorientiert (3-Way-Handshake) | verbindungslos |
| Zuverlässigkeit | Bestätigung (ACK), Neuübertragung, Reihenfolge | keine Garantie |
| Flusskontrolle | ja (Sliding Window) | nein |
| Header | mindestens 20 Byte | 8 Byte |
| Einsatz | Web, E-Mail, Dateitransfer, SSH | DNS-Anfragen, VoIP, Streaming, Online-Spiele, DHCP |

Der **3-Way-Handshake**: Client → \`SYN\`, Server → \`SYN-ACK\`, Client → \`ACK\`. Abgebaut wird mit \`FIN\`/\`ACK\` in beide Richtungen.

### Wichtige Ports

| Port | Dienst | Port | Dienst |
| ---: | :--- | ---: | :--- |
| 20/21 | FTP | 110 / 995 | POP3 / POP3S |
| 22 | SSH, SFTP | 143 / 993 | IMAP / IMAPS |
| 23 | Telnet (unverschlüsselt) | 389 / 636 | LDAP / LDAPS |
| 25 / 587 | SMTP / Submission | 443 | HTTPS |
| 53 | DNS (UDP und TCP) | 3306 | MySQL |
| 67/68 | DHCP (UDP) | 3389 | RDP |
| 80 | HTTP | 5432 | PostgreSQL |

Ports 0–1023 heißen *Well-Known Ports*, 1024–49151 *Registered*, darüber liegen die dynamischen Ports, die ein Client als Quellport nutzt.

## ARP, DHCP und DNS im Zusammenspiel

Was passiert, wenn ein frisch eingeschalteter Laptop \`https://example.com\` aufruft?

1. **DHCP (DORA)**: Der Client sendet einen **D**iscover-Broadcast, der Server antwortet mit einem **O**ffer, der Client schickt einen **R**equest, der Server bestätigt mit einem **A**ck. Danach kennt der Client IP-Adresse, Maske, Standardgateway und DNS-Server.
2. **DNS**: Der Client fragt seinen DNS-Resolver nach dem **A**- bzw. **AAAA**-Record von example.com. Der Resolver fragt notfalls rekursiv Root-, TLD- und autoritativen Server und speichert die Antwort für die Dauer der **TTL** im Cache.
3. **ARP**: Die Ziel-IP liegt in einem fremden Netz, also muss das Paket zum Gateway. Per ARP-Broadcast fragt der Client: „Wer hat 192.168.1.1?“ Das Gateway antwortet mit seiner MAC-Adresse.
4. **TCP-Handshake** zu Port 443, dann **TLS-Handshake**, dann die **HTTP-Anfrage**.

Wichtige DNS-Record-Typen: **A** (IPv4), **AAAA** (IPv6), **CNAME** (Alias), **MX** (Mailserver), **NS** (zuständige Nameserver), **TXT** (z. B. SPF), **PTR** (Reverse Lookup).

## Fehlersuche mit Bordmitteln

| Befehl (Windows / Linux) | Zweck |
| :--- | :--- |
| \`ipconfig /all\` / \`ip a\` | eigene IP, Maske, Gateway, DNS anzeigen |
| \`ping 8.8.8.8\` | Erreichbarkeit per ICMP prüfen |
| \`tracert\` / \`traceroute\` | Weg über die Router verfolgen (nutzt TTL) |
| \`nslookup example.com\` / \`dig\` | DNS-Auflösung prüfen |
| \`arp -a\` / \`ip neigh\` | ARP-Cache anzeigen |
| \`netstat -an\` / \`ss -tulpn\` | offene Verbindungen und lauschende Ports |

> [!tip] Vorgehen von unten nach oben
> Kabel/Link-LED → eigene IP (APIPA?) → Gateway anpingen → externe IP anpingen → Namen anpingen. Klappt \`ping 8.8.8.8\`, aber nicht \`ping example.com\`, liegt das Problem beim **DNS**.
`,
  codeSnippet: `# Netzwerkdiagnose unter Linux
ip a                       # Adressen der Interfaces
ip route                   # Routing-Tabelle, Default-Gateway
ping -c 4 192.168.1.1      # Gateway erreichbar?
dig +short example.com A   # DNS-Antwort (IPv4)
traceroute example.com     # Hops bis zum Ziel
ss -tulpn                  # lauschende TCP/UDP-Ports mit Prozess`,
  codeLanguage: 'Bash',
  exercises: [
    {
      id: 'schichten-zuordnen',
      title: 'Begriffe den Schichten zuordnen',
      prompt: 'Ordne jeden Begriff der passenden OSI-Schicht zu: **Switch, TLS, Port 443, Router, Glasfaserkabel, MAC-Adresse, ICMP, HTTP, Frame, Segment**.',
      solution: '- Schicht 1: Glasfaserkabel\n- Schicht 2: Switch, MAC-Adresse, Frame\n- Schicht 3: Router, ICMP\n- Schicht 4: Port 443, Segment\n- Schicht 6: TLS (wird oft auch zwischen 4 und 7 eingeordnet, im OSI-Modell meist Darstellung)\n- Schicht 7: HTTP'
    },
    {
      id: 'kapselung-adressen',
      title: 'Adressen auf dem Weg ins Internet',
      prompt: 'PC A (192.168.1.10, MAC AA) schickt ein Paket an einen Webserver (93.184.215.14). Das Standardgateway hat 192.168.1.1 und die MAC GG. Welche Quell- und Ziel-**MAC** sowie Quell- und Ziel-**IP** stehen im Frame, der den PC verlässt? Was ändert sich hinter dem Router?',
      hints: ['Das Ziel liegt nicht im eigenen Netz. An wen muss der Frame also im lokalen Segment gehen?'],
      solution: 'Frame vom PC: **Quell-MAC AA, Ziel-MAC GG** (das Gateway, per ARP ermittelt), **Quell-IP 192.168.1.10, Ziel-IP 93.184.215.14**.\n\nHinter dem Router: neue MAC-Adressen für das nächste Segment. Die Ziel-IP bleibt gleich. Die Quell-IP wird bei NAT durch die öffentliche IP des Routers ersetzt.'
    },
    {
      id: 'tcp-udp-wahl',
      title: 'TCP oder UDP?',
      prompt: 'Begründe für jede Anwendung, ob TCP oder UDP besser passt: (1) Videokonferenz, (2) Download eines Software-Updates, (3) DNS-Anfrage, (4) Online-Banking.',
      solution: '1. **UDP** – ein verspätetes Bild ist wertlos, Neuübertragung würde nur Verzögerung bringen.\n2. **TCP** – jedes Byte muss vollständig und in richtiger Reihenfolge ankommen.\n3. **UDP** – kleine Anfrage/Antwort, kein Verbindungsaufbau nötig (bei großen Antworten und Zonentransfers TCP).\n4. **TCP** (mit TLS) – Zuverlässigkeit und Integrität sind zwingend.'
    },
    {
      id: 'fehlersuche',
      title: 'Fehlersuche beim Kunden',
      prompt: 'Ein Mitarbeiter meldet „kein Internet“. `ipconfig` zeigt 192.168.20.57/24, Gateway 192.168.20.1, DNS 192.168.20.5. `ping 192.168.20.1` und `ping 8.8.8.8` funktionieren, `ping intranet.firma.local` meldet „Host nicht gefunden“. Wo liegt der Fehler, und was prüfst du als Nächstes?',
      solution: 'IP-Konfiguration, Gateway und Internetzugang funktionieren (Schichten 1–3 in Ordnung). Die Namensauflösung schlägt fehl → **DNS-Problem**. Nächste Schritte: `nslookup intranet.firma.local 192.168.20.5` (antwortet der DNS-Server?), den DNS-Dienst auf 192.168.20.5 prüfen, testweise einen anderen Resolver nutzen, DNS-Cache leeren (`ipconfig /flushdns`).'
    }
  ],
  quiz: [
    {
      question: 'Auf welcher OSI-Schicht arbeitet ein klassischer Switch?',
      options: ['Schicht 1', 'Schicht 2', 'Schicht 3', 'Schicht 4'],
      correct: 1,
      explanation: 'Ein Switch leitet Frames anhand von MAC-Adressen weiter – das ist Schicht 2 (Sicherung).'
    },
    {
      question: 'Wie heißt die Dateneinheit (PDU) der Transportschicht bei TCP?',
      options: ['Frame', 'Paket', 'Segment', 'Bit'],
      correct: 2,
      explanation: 'Schicht 4: Segment (bei UDP auch Datagramm), Schicht 3: Paket, Schicht 2: Frame, Schicht 1: Bits.'
    },
    {
      question: 'Welche Aussage zu Routern ist richtig?',
      options: [
        'Router leiten Broadcasts in alle angeschlossenen Netze weiter',
        'Router verbinden unterschiedliche IP-Netze und trennen Broadcast-Domänen',
        'Router arbeiten ausschließlich mit MAC-Adressen',
        'Router werden nur im WLAN eingesetzt'
      ],
      correct: 1,
      explanation: 'Router entscheiden auf Schicht 3 anhand von IP-Adressen und leiten keine Broadcasts weiter.'
    },
    {
      question: 'Welches Protokoll ermittelt in IPv4-Netzen die MAC-Adresse zu einer IP-Adresse?',
      options: ['DNS', 'DHCP', 'ARP', 'ICMP'],
      correct: 2,
      explanation: 'ARP (Address Resolution Protocol) fragt per Broadcast nach der MAC zu einer IP. In IPv6 übernimmt das NDP.'
    },
    {
      question: 'In welcher Reihenfolge laufen die DHCP-Nachrichten ab?',
      options: ['Request, Offer, Discover, Ack', 'Discover, Offer, Request, Ack', 'Offer, Discover, Ack, Request', 'Discover, Request, Offer, Ack'],
      correct: 1,
      explanation: 'DORA: Discover, Offer, Request, Acknowledge.'
    },
    {
      question: 'Welcher Port gehört standardmäßig zu SSH?',
      options: ['21', '22', '23', '443'],
      correct: 1,
      explanation: 'SSH nutzt Port 22. 21 ist FTP, 23 Telnet, 443 HTTPS.'
    },
    {
      question: 'Welcher DNS-Record verweist auf den Mailserver einer Domain?',
      options: ['A', 'CNAME', 'MX', 'PTR'],
      correct: 2,
      explanation: 'MX (Mail Exchanger) nennt den zuständigen Mailserver samt Priorität.'
    },
    {
      question: 'Ping auf 8.8.8.8 klappt, ping auf einen Namen nicht. Wo liegt das Problem am wahrscheinlichsten?',
      options: ['Netzwerkkabel', 'Standardgateway', 'Namensauflösung (DNS)', 'Switch-Port'],
      correct: 2,
      explanation: 'Die IP-Verbindung ins Internet funktioniert, also sind Kabel, Gateway und Routing in Ordnung. Es fehlt die Namensauflösung.'
    }
  ],
  relatedLabs: [
    { id: 'packet_tracer', label: 'Packet Tracer' },
    { id: 'tcp_state_machine_lab', label: 'TCP-Zustandsautomat' },
    { id: 'dhcp_dora_lab', label: 'DHCP DORA' },
    { id: 'dns_http_lab', label: 'DNS & HTTP Lifecycle' },
    { id: 'vlan_trunking_lab', label: 'VLAN & Trunking' }
  ],
  sources: [
    { title: 'ITU-T X.200: Open Systems Interconnection – Basic Reference Model', url: 'https://www.itu.int/rec/T-REC-X.200-199407-I/en' },
    { title: 'RFC 1122: Requirements for Internet Hosts – Communication Layers', url: 'https://www.rfc-editor.org/rfc/rfc1122', note: 'TCP/IP-Schichten' },
    { title: 'RFC 9293: Transmission Control Protocol (TCP)', url: 'https://www.rfc-editor.org/rfc/rfc9293' },
    { title: 'RFC 2131: Dynamic Host Configuration Protocol', url: 'https://www.rfc-editor.org/rfc/rfc2131' },
    { title: 'RFC 826: An Ethernet Address Resolution Protocol', url: 'https://www.rfc-editor.org/rfc/rfc826' },
    { title: 'IANA Service Name and Transport Protocol Port Number Registry', url: 'https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml' },
    { title: 'Eigene Lernkarten zur FIAE-Umschulung: Netzwerktopologien, Domain-Grundlagen, Firewall', note: 'nicht öffentlich' }
  ],
  sourcesCheckedOn: '29.10.2026'
};
