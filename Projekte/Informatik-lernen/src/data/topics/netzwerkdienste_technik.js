/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Ablauf und Aufgaben von DHCP und DNS beschreiben und typische Einträge lesen',
    'VLANs, Trunks und Inter-VLAN-Routing erklären und ein Netz in Subnetze aufteilen',
    'Routing, NAT, WLAN, VPN und Firewall-Regeln fachlich einordnen',
    'Strukturierte Verkabelung planen und Netzwerkfehler schichtweise eingrenzen'
  ],
  content: `
## Überblick

Dieser Artikel baut auf dem OSI-Modell und der IP-Adressierung auf. Er behandelt die Dienste und die Technik, die ein Firmennetz im Alltag tragen: **DHCP**, **DNS**, **Switching und VLANs**, **Routing**, **NAT**, **WLAN**, **VPN**, **Firewall** und die **Verkabelung**.

## DHCP: Adressen automatisch vergeben

Der **Dynamic Host Configuration Protocol**-Dienst verteilt IP-Konfigurationen (Adresse, Maske, Gateway, DNS-Server). Der Ablauf heißt **DORA**:

1. **D**iscover: Der Client sucht per Broadcast einen Server.
2. **O**ffer: Der Server bietet eine Adresse an.
3. **R**equest: Der Client fordert die angebotene Adresse an.
4. **A**cknowledge: Der Server bestätigt, die Adresse ist für die **Lease-Zeit** reserviert.

DHCP nutzt UDP, Port 67 (Server) und 68 (Client). Ein **Adresspool** (Scope) legt den Bereich fest, **Reservierungen** binden eine Adresse an eine MAC-Adresse (für Drucker und Server). Weil Broadcasts Router nicht überqueren, leitet ein **DHCP-Relay** die Anfragen in andere Subnetze weiter.

## DNS: Namen auflösen

Das **Domain Name System** übersetzt Namen in IP-Adressen.

| Begriff | Bedeutung |
| :--- | :--- |
| Resolver (rekursiv) | fragt stellvertretend für den Client die Hierarchie ab und speichert Antworten |
| Autoritativer Server | liefert die verbindliche Antwort für eine Zone |
| Zone | Verwaltungsbereich mit Einträgen (Records) |
| TTL | Dauer, die eine Antwort zwischengespeichert werden darf |

Wichtige Records: **A** (IPv4), **AAAA** (IPv6), **CNAME** (Alias), **MX** (Mailserver), **NS** (Nameserver), **TXT** (Text, z. B. SPF), **PTR** (Rückwärtsauflösung). Zum Testen dienen \`nslookup\` oder \`dig\`. In Firmennetzen löst ein interner DNS-Server zusätzlich interne Namen auf (**Split-DNS**).

## Switching und VLANs

Ein **Switch** lernt MAC-Adressen und leitet Frames gezielt an den richtigen Port (Schicht 2). Alle Geräte am selben Switch bilden zunächst **eine** Broadcast-Domäne. **VLANs** (Virtual LANs) teilen sie in getrennte logische Netze, auch wenn sie am selben Switch hängen.

- **Access-Port**: gehört zu **einem** VLAN, Endgeräte sehen keine Tags.
- **Trunk-Port**: transportiert **mehrere** VLANs, jeder Frame erhält einen **802.1Q-Tag** (4 Byte, darin die 12-Bit-VLAN-ID, nutzbar 1 bis 4094).
- **Native VLAN**: Frames dieses VLANs laufen ungetaggt über den Trunk. Es sollte bewusst konfiguriert und nicht das Standard-VLAN 1 sein.

Gründe für VLANs: **Sicherheit** (Trennung von Verwaltung, Gästen, Servern), **kleinere Broadcast-Domänen**, **Ordnung** nach Abteilungen oder Funktionen.

**Spanning Tree (STP, RSTP)** verhindert Schleifen in redundanten Switch-Verbindungen, indem überzählige Pfade blockiert werden. Ohne STP würden Broadcasts endlos kreisen (Broadcast-Sturm).

## Routing

Ein **Router** verbindet Netze (Schicht 3) und entscheidet anhand der **Routing-Tabelle**. Mehrere passende Einträge entscheidet der **Longest-Prefix-Match**: Die Route mit der längsten Maske gewinnt. Die **Default-Route** (0.0.0.0/0) ist der Weg für alles Übrige.

| Art | Beschreibung |
| :--- | :--- |
| Statisch | manuell eingetragen, einfach, aber ohne Anpassung bei Ausfall |
| Dynamisch | Protokolle tauschen Routen aus. **OSPF** (innerhalb eines Unternehmens, Link-State), **BGP** (zwischen Netzbetreibern) |

### Inter-VLAN-Routing

Verschiedene VLANs sind getrennte IP-Netze und brauchen einen Router, damit sie miteinander kommunizieren. Zwei Varianten:

![Inter-VLAN-Routing mit Trunk zwischen Switch und Router](vlan-routing.svg "Router-on-a-Stick: Subinterfaces des Routers sind das Standardgateway je VLAN")

- **Router-on-a-Stick**: Ein Trunk führt alle VLANs zum Router. Pro VLAN gibt es ein **Subinterface**, das als Standardgateway dient.
- **Layer-3-Switch**: Der Switch routet selbst über virtuelle Schnittstellen (SVI). Das ist schneller und im Firmennetz Standard.

## Subnetze für VLANs planen

Aus einem Adressblock werden passende Subnetze gebildet (VLSM): Der größte Bedarf kommt zuerst, jedes Netz bekommt die kleinste passende Maske. Für 50 Hosts passt /26 (62 nutzbar), für 25 Hosts /27 (30 nutzbar), für 10 Hosts /28 (14 nutzbar). Das **Standardgateway** ist üblicherweise die erste oder letzte nutzbare Adresse.

## NAT und Portweiterleitung

**NAT** ersetzt private Absenderadressen durch eine öffentliche. Bei **PAT** (Port Address Translation, im Alltag „NAT“) teilen sich viele Geräte eine öffentliche Adresse, der Router unterscheidet sie über Ports. Von außen sind interne Geräte dadurch nicht direkt erreichbar. Eine **Portweiterleitung** öffnet bewusst einen Dienst nach innen und sollte nur mit Schutzmaßnahmen eingesetzt werden.

## WLAN

- **Standards**: Wi-Fi 4 (802.11n), Wi-Fi 5 (802.11ac), Wi-Fi 6 (802.11ax). Höhere Standards bringen mehr Datenrate und bessere Effizienz bei vielen Geräten.
- **Bänder**: 2,4 GHz hat größere Reichweite, aber nur wenige überlappungsfreie Kanäle (üblich 1, 6, 11) und mehr Störungen. 5 GHz ist schneller und bietet mehr Kanäle, hat aber geringere Reichweite.
- **Sicherheit**: **WPA3** (mindestens WPA2) mit starkem Schlüssel. Im Unternehmen **WPA2/WPA3-Enterprise** mit Anmeldung über einen RADIUS-Server (802.1X), damit jedes Konto eigene Zugangsdaten hat.
- **Planung**: Eine **Funkausleuchtung** (Site-Survey) prüft Abdeckung und Kanalplanung. Wände und Metall dämpfen das Signal. **Gast-WLAN** gehört in ein eigenes VLAN.

## VPN

Ein **VPN** baut einen verschlüsselten Tunnel durch ein unsicheres Netz.

| Art | Zweck |
| :--- | :--- |
| Site-to-Site | verbindet zwei Standortnetze dauerhaft |
| Remote-Access | verbindet einzelne Nutzer (Homeoffice) mit dem Firmennetz |

Verbreitete Verfahren: **IPsec**, **OpenVPN**, **WireGuard**. Beim **Split-Tunneling** läuft nur der Firmenverkehr durch den Tunnel, das senkt die Last, verringert aber die Kontrolle.

## Firewall

Eine **Firewall** erlaubt oder verbietet Verkehr anhand von Regeln.

- **Paketfilter** (zustandslos) prüft Adressen und Ports pro Paket.
- **Stateful Inspection** merkt sich Verbindungen und erlaubt Antworten auf erlaubte Anfragen automatisch.
- **Application-Layer-Firewall (Next-Generation)** erkennt Anwendungen und Inhalte.

Regeln werden **von oben nach unten** geprüft, die erste passende gewinnt. Am Ende steht ein **implizites Deny** (alles Nicht-Erlaubte wird verworfen). Eine **DMZ** (demilitarisierte Zone) ist ein eigenes Netz für öffentlich erreichbare Server: Zugriff aus dem Internet auf die DMZ ist erlaubt, von der DMZ ins interne Netz nur in minimalem Umfang.

## Strukturierte Verkabelung

Die Gebäudeverkabelung ist in drei Bereiche gegliedert: **Primär** (zwischen Gebäuden), **Sekundär** (Steigleitungen zwischen Etagenverteilern), **Tertiär** (vom Etagenverteiler zur Anschlussdose).

- **Kupfer** (Twisted Pair): Kategorie 6A erlaubt 10 Gbit/s auf 100 m, Kategorie 5e 1 Gbit/s. Die feste Verlegestrecke (Permanent Link) ist höchstens 90 m, mit Patchkabeln insgesamt 100 m.
- **Lichtwellenleiter**: **Multimode** (OM3/OM4) für kurze Strecken im Gebäude, **Singlemode** (OS2) für weite Strecken und zwischen Gebäuden. LWL ist unempfindlich gegen elektromagnetische Störungen und potenzialfrei.
- **PoE** versorgt Geräte über das Netzwerkkabel: 802.3af bis 15,4 W, 802.3at bis 30 W, 802.3bt bis 60 W bzw. 90 W am Port.

## Überwachung und Fehlersuche

- **Monitoring**: SNMP (UDP 161/162) fragt Geräte ab, Syslog sammelt Meldungen, NetFlow zeigt Verkehrsströme.
- **Fehlersuche schichtweise** (von unten nach oben):

| Schicht | Prüfung |
| :--- | :--- |
| 1 | Kabel, Stecker, Link-LED, Portstatus |
| 2 | Richtiges VLAN, MAC-Tabelle, Duplex, Schleifen |
| 3 | IP-Konfiguration, \`ping\`, \`traceroute\`, Routing-Tabelle |
| 4 | Port erreichbar? (\`nc\`, \`Test-NetConnection\`), Firewall-Regel |
| 7 | Dienst läuft? (\`curl\`, Logfiles, DNS-Auflösung) |

## Switching vertieft: Schleifen, Bündelung, Port-Sicherheit

**Spanning Tree (STP, IEEE 802.1D / schneller RSTP 802.1w):** Verbindet man Switches redundant über mehrere Wege, entsteht eine Schleife. Ethernet-Rahmen haben keine Lebensdauer (kein TTL), deshalb kreisen Broadcasts endlos und erzeugen einen *Broadcast-Sturm*, der das Netz lahmlegt. STP wählt eine **Root Bridge**, berechnet für jeden Switch den günstigsten Weg dorthin und **sperrt redundante Ports logisch** (Zustand *blocking/discarding*). Fällt eine aktive Leitung aus, schaltet STP einen gesperrten Port frei. RSTP tut das in Sekunden statt in 30 bis 50 Sekunden.

**Link Aggregation (LACP, IEEE 802.1AX, früher 802.3ad):** Mehrere physische Leitungen werden zu einem logischen Link gebündelt. Das erhöht die Bandbreite (zwei 1-Gbit-Links ergeben keine einzelne 2-Gbit-Verbindung pro Datenstrom, sondern verteilen die Datenströme) und fällt bei Ausfall eines Kabels nicht aus. Die Gegenstellen müssen die gleiche Konfiguration verwenden.

**Port Security und Schutz am Zugangsport:** Begrenzung der MAC-Adressen pro Port, Abschalten ungenutzter Ports, **802.1X** für portbasierte Anmeldung (Radius), **DHCP-Snooping** gegen untergeschobene DHCP-Server und **BPDU-Guard** gegen fremde Switches an Endgeräteports.

**Power over Ethernet (PoE):** Der Switch speist Telefone, Access Points und Kameras über das Datenkabel. 802.3af liefert bis 15,4 W am Switch (12,95 W am Gerät), 802.3at (PoE+) bis 30 W, 802.3bt (PoE++) bis 60 W oder 90 W. Bei der Planung zählt das **PoE-Budget** des gesamten Switches, nicht nur der Einzelport.

## IPv6 im Netzwerkbetrieb

IPv6-Adressen haben 128 Bit und werden hexadezimal geschrieben, z. B. \`2001:db8:10:1::25\`. Die Doppel-Doppelpunkt-Schreibweise \`::\` darf pro Adresse einmal Nullblöcke zusammenfassen. Das übliche Subnetzpräfix ist **/64**, die unteren 64 Bit bilden die Schnittstellenkennung.

- **SLAAC:** Ein Gerät bildet seine Adresse selbst aus dem Präfix, das der Router per *Router Advertisement* ankündigt.
- **DHCPv6:** liefert zusätzliche Informationen (z. B. DNS) oder Adressen zentral.
- **NDP (Neighbor Discovery):** ersetzt ARP und nutzt ICMPv6, das man deshalb nicht pauschal sperren darf.
- Es gibt **kein NAT** als Standardmittel und keine Broadcasts, dafür Multicast. Der Schutz erfolgt durch Firewall-Regeln, nicht durch Adressübersetzung.
- Link-lokale Adressen beginnen mit \`fe80::/10\`, globale Unicast-Adressen derzeit mit \`2000::/3\`, private Unique-Local-Adressen mit \`fc00::/7\`.

## Weitere DNS-Einträge und E-Mail-Dienste

| Eintragstyp | Bedeutung | Beispiel |
| :--- | :--- | :--- |
| A / AAAA | Name auf IPv4- / IPv6-Adresse | \`www  A  203.0.113.10\` |
| CNAME | Alias auf einen anderen Namen | \`shop CNAME www.example.org.\` |
| MX | zuständiger Mailserver mit Priorität | \`MX 10 mail.example.org.\` |
| NS | zuständiger Nameserver der Zone | \`NS ns1.example.org.\` |
| PTR | Rückwärtsauflösung IP → Name | \`10.113.0.203.in-addr.arpa\` |
| TXT | freier Text, z. B. SPF, DKIM, DMARC | \`v=spf1 mx -all\` |
| SOA | Zonenverwaltung: Seriennummer, Zeitwerte | |

**Mail-Protokolle:** SMTP überträgt Mails (Port 25 zwischen Servern, 587 für das Einreichen durch Clients, 465 mit implizitem TLS). IMAP (143, mit TLS 993) belässt Mails auf dem Server und synchronisiert, POP3 (110, mit TLS 995) lädt sie herunter. Gegen gefälschte Absender helfen **SPF** (welche Server dürfen für die Domain senden), **DKIM** (digitale Signatur der Mail) und **DMARC** (Richtlinie, was bei Fehlschlag passiert, und Berichte). Alle drei werden als DNS-Einträge veröffentlicht.

## Wichtige Dienste und Ports im Überblick

| Dienst | Port / Protokoll | Zweck |
| :--- | :--- | :--- |
| SSH | 22 TCP | verschlüsselte Fernwartung, Dateitransfer (SFTP) |
| DNS | 53 UDP und TCP | Namensauflösung, Zonentransfer über TCP |
| DHCP | 67/68 UDP | Adressvergabe |
| NTP | 123 UDP | Zeitsynchronisation (wichtig für Logs, Kerberos, Zertifikate) |
| LDAP / LDAPS | 389 / 636 TCP | Verzeichnisdienst |
| Kerberos | 88 TCP/UDP | Anmeldung in Active Directory |
| SMB | 445 TCP | Windows-Datei- und Druckfreigaben |
| NFS | 2049 TCP/UDP | Linux-/Unix-Dateifreigaben |
| RDP | 3389 TCP | Windows-Fernzugriff |
| SNMP | 161/162 UDP | Überwachung und Traps |
| Syslog | 514 UDP | zentrale Protokollierung |

**Zeit ist ein Dienst:** Weichen die Uhren um mehr als wenige Minuten ab, scheitern Kerberos-Anmeldungen, TLS-Zertifikate wirken abgelaufen und Logs lassen sich nicht korrelieren. Darum gehören NTP-Quellen zur Grundausstattung.

## Proxy, Reverse Proxy und Lastverteilung

Ein **Forward-Proxy** vermittelt Anfragen interner Clients ins Internet (Filter, Cache, Protokollierung). Ein **Reverse-Proxy** steht vor Servern, nimmt Anfragen aus dem Internet an und leitet sie weiter (TLS-Terminierung, Schutz, Verteilung). Ein **Load Balancer** verteilt Anfragen auf mehrere Server nach Verfahren wie Round Robin, geringste Verbindungen oder Gewichtung und prüft per *Health Check* ihre Erreichbarkeit. Zusammen mit einer **Web Application Firewall (WAF)** schützt diese Schicht Webanwendungen vor typischen Angriffen auf Anwendungsebene.

## Dienstgüte (QoS) und Sprachverkehr

Echtzeitverkehr wie Telefonie reagiert empfindlich auf Verzögerung (*Delay*), Schwankung der Laufzeit (*Jitter*) und Paketverlust. Als Richtwert gilt für Sprache eine Laufzeit von höchstens etwa 150 ms in eine Richtung (ITU-T G.114). **QoS** priorisiert solchen Verkehr: Pakete werden mit einem Wert im IP-Header markiert (**DSCP**, Sprache üblicherweise *EF* = 46), und die Netzwerkgeräte bedienen markierte Klassen bevorzugt. Wichtig ist, dass die Markierung durchgängig vom Endgerät bis zum WAN-Übergang vertrauenswürdig behandelt wird, sonst verpufft sie. VLANs trennen Sprache und Daten zusätzlich logisch (eigenes Voice-VLAN).

## Systematische Netzwerkdiagnose

Gehe **von unten nach oben** durch die Schichten und teste jeweils den nächsten Schritt:

1. **Link:** Kabel gesteckt, Link-LED, Port aktiv? (\`ip link\`, Switch-Port-Status)
2. **Eigene IP:** Adresse, Maske und Gateway plausibel, keine 169.254.x.x (APIPA/Link-Local bedeutet: DHCP nicht erreicht)? (\`ipconfig /all\`, \`ip a\`)
3. **Gateway:** \`ping\` auf das Standardgateway. Danach \`ping\` auf eine IP im Internet, z. B. 1.1.1.1.
4. **DNS:** \`ping\` auf einen Namen. Klappt die IP, aber nicht der Name, ist DNS das Problem (\`nslookup\`, \`dig\`).
5. **Weg verfolgen:** \`traceroute\` (Linux) oder \`tracert\` (Windows) zeigt, wo Pakete hängen bleiben.
6. **Dienst und Port:** Ist der Port erreichbar? (\`Test-NetConnection -Port 443\`, \`ss -tulpn\` auf dem Server, Firewall-Regel prüfen)
7. **Mitschneiden:** Mit Wireshark oder \`tcpdump\` sieht man, was wirklich auf dem Draht passiert (z. B. DHCP-Discover ohne Antwort).

Ein erfolgreicher \`ping\` beweist nur, dass ICMP durchkommt. Er sagt nichts über TCP-Ports. Umgekehrt blockieren manche Firewalls ICMP, obwohl der Dienst läuft.

> [!exam] Prüfungshinweis
> Typische Aufgaben: VLSM-Subnetze berechnen, DORA-Ablauf, VLAN-Konzept mit Trunk und Gateway, Firewall-Regeln mit DMZ, Auswahl von Kabeltyp und Länge, Fehlersuche nach Schichtenmodell.
`,
  exercises: [
    {
      id: 'vlsm-vlans',
      title: 'Subnetze für drei VLANs planen',
      prompt: 'Aus dem Netz 192.168.10.0/24 sollen drei Subnetze entstehen: Verwaltung mit 50 Geräten, Entwicklung mit 25 Geräten und Gäste mit 10 Geräten. Wähle jeweils die kleinste passende Maske und gib Netzadresse, nutzbaren Bereich, Broadcast und ein Standardgateway an.',
      hints: ['Größtes Subnetz zuerst', '/26 = 62, /27 = 30, /28 = 14 nutzbare Hosts'],
      solution: 'Verwaltung /26: Netz 192.168.10.0, nutzbar .1 bis .62, Broadcast .63, Gateway .1. Entwicklung /27: Netz 192.168.10.64, nutzbar .65 bis .94, Broadcast .95, Gateway .65. Gäste /28: Netz 192.168.10.96, nutzbar .97 bis .110, Broadcast .111, Gateway .97. Das restliche Adressgebiet ab .112 bleibt für spätere Netze frei.'
    },
    {
      id: 'dora-reihenfolge',
      title: 'DHCP-Ablauf und Fehlerbild',
      prompt: 'Nenne die vier Schritte des DHCP-Ablaufs mit Fachbegriff und Art der Nachricht (Broadcast oder Unicast). Ein Client in einem Subnetz ohne DHCP-Server erhält keine Adresse und zeigt 169.254.x.x. Was bedeutet das, und wie behebst du es?',
      hints: ['Der Client sendet zuerst an alle', '169.254.0.0/16 ist der APIPA-Bereich'],
      solution: 'Discover (Broadcast vom Client), Offer (Server bietet Adresse an), Request (Client fordert die Adresse an, meist Broadcast), Acknowledge (Server bestätigt). Die Adresse 169.254.x.x ist eine automatisch vergebene Adresse (APIPA/Link-Local): Der Client hat keinen DHCP-Server erreicht. Ursachen sind ein fehlender Server, falsches VLAN oder ein fehlendes DHCP-Relay. Lösung: VLAN-Zuordnung prüfen und auf dem Router bzw. Layer-3-Switch ein DHCP-Relay auf den zuständigen Server einrichten.'
    },
    {
      id: 'firewall-dmz',
      title: 'Firewall-Regeln für eine DMZ',
      prompt: 'Ein Webserver (10.0.50.10) steht in der DMZ und soll aus dem Internet per HTTPS erreichbar sein. Er darf auf eine Datenbank im internen Netz (10.0.10.20) nur über Port 5432 zugreifen. Das interne Netz darf ins Internet per HTTP und HTTPS. Formuliere die Regeln in sinnvoller Reihenfolge, einschließlich der Standardregel am Ende.',
      hints: ['Von oben nach unten, erste Übereinstimmung zählt', 'Am Ende steht Deny all'],
      solution: '1. Internet → 10.0.50.10, TCP 443: erlauben. 2. 10.0.50.10 → 10.0.10.20, TCP 5432: erlauben. 3. Internes Netz → Internet, TCP 80 und 443: erlauben. 4. DMZ → internes Netz (alles übrige): verbieten. 5. Internet → internes Netz: verbieten. 6. Alles andere: verbieten (implizites Deny). Antworten auf erlaubte Verbindungen werden durch die Stateful Inspection automatisch zugelassen.'
    },
    {
      id: 'kabel-auswahl',
      title: 'Verkabelung auswählen',
      prompt: 'Zwischen zwei Gebäuden liegen 600 m. Zwischen Etagenverteiler und Büro-Anschlussdose liegen 70 m. Beide Strecken sollen mindestens 10 Gbit/s ermöglichen. Welche Kabeltypen wählst du, und welche Rolle spielen Primär-, Sekundär- und Tertiärbereich?',
      hints: ['Kupfer erreicht 100 m', 'Zwischen Gebäuden Potenzialtrennung beachten'],
      solution: 'Zwischen den Gebäuden (Primärbereich) wird Singlemode-LWL (OS2) verlegt, weil 600 m mit Kupfer nicht möglich sind und LWL Potenzialunterschiede zwischen Gebäuden vermeidet. Vom Etagenverteiler zur Dose (Tertiärbereich) reicht Kupfer Kategorie 6A mit 70 m Verlegelänge (unter 90 m Permanent Link). Die Steigleitungen zwischen den Etagen (Sekundärbereich) werden ebenfalls meist mit LWL ausgeführt.'
    }
  ],
  quiz: [
    {
      question: 'Wie lautet die richtige Reihenfolge des DHCP-Ablaufs?',
      options: ['Offer, Discover, Acknowledge, Request', 'Discover, Offer, Request, Acknowledge', 'Request, Offer, Discover, Acknowledge', 'Discover, Request, Offer, Acknowledge'],
      correct: 1,
      explanation: 'DORA: Discover, Offer, Request, Acknowledge.'
    },
    {
      question: 'Was transportiert ein Trunk-Port?',
      options: ['Nur ein VLAN ohne Tag', 'Mehrere VLANs mit 802.1Q-Tags', 'Nur Broadcasts', 'Nur Frames mit WLAN-Daten'],
      correct: 1,
      explanation: 'Ein Trunk führt mehrere VLANs, jeder Frame trägt eine VLAN-ID im 802.1Q-Tag.'
    },
    {
      question: 'Welche Routing-Regel gilt bei mehreren passenden Einträgen in der Routing-Tabelle?',
      options: ['Die kürzeste Maske gewinnt', 'Die längste Maske gewinnt (Longest-Prefix-Match)', 'Der erste Eintrag gewinnt immer', 'Der älteste Eintrag gewinnt'],
      correct: 1,
      explanation: 'Der spezifischste Eintrag mit dem längsten Präfix wird verwendet.'
    },
    {
      question: 'Wie viele nutzbare Hosts hat ein /27-Netz?',
      options: ['14', '30', '32', '62'],
      correct: 1,
      explanation: '2^(32−27) = 32 Adressen, minus Netz- und Broadcastadresse = 30 nutzbare Hosts.'
    },
    {
      question: 'Wie lang darf die feste Verlegestrecke (Permanent Link) bei Twisted-Pair-Kabeln höchstens sein?',
      options: ['50 m', '90 m', '100 m', '300 m'],
      correct: 1,
      explanation: 'Der Permanent Link ist auf 90 m begrenzt, mit Patchkabeln ergibt sich ein Channel von 100 m.'
    },
    {
      question: 'Wofür dient eine DMZ?',
      options: [
        'Für öffentlich erreichbare Server in einem eigenen, abgetrennten Netz',
        'Für die Verwaltung der Gruppenrichtlinien',
        'Als WLAN für Gäste ohne Verschlüsselung',
        'Als Backup-Ziel der Datenbank'
      ],
      correct: 0,
      explanation: 'In der DMZ stehen Server mit Zugriff aus dem Internet. Der Zugriff von dort ins interne Netz wird stark beschränkt.'
    },
    {
      question: 'Welche Aufgabe hat ein DHCP-Relay?',
      options: [
        'Es verschlüsselt DHCP-Nachrichten',
        'Es leitet Broadcast-Anfragen in ein anderes Subnetz zum DHCP-Server weiter',
        'Es vergibt Namen für Geräte',
        'Es blockiert Zugriffe auf den DHCP-Server'
      ],
      correct: 1,
      explanation: 'Broadcasts überqueren Router nicht. Das Relay nimmt sie an und sendet sie gezielt an den DHCP-Server.'
    }
  ],
  relatedLabs: [
    { id: 'dhcp_dora_lab', label: 'DHCP DORA Simulator' },
    { id: 'vlan_trunking_lab', label: 'VLAN & Trunking' },
    { id: 'nat_pat_lab', label: 'NAT und PAT' },
    { id: 'stp_protocol_lab', label: 'Spanning Tree' },
    { id: 'dns_http_lab', label: 'DNS und HTTP' }
  ],
  sources: [
    { title: 'RFC 2131: Dynamic Host Configuration Protocol', url: 'https://www.rfc-editor.org/rfc/rfc2131' },
    { title: 'RFC 1034: Domain Names – Concepts and Facilities', url: 'https://www.rfc-editor.org/rfc/rfc1034' },
    { title: 'BSI IT-Grundschutz: NET.1.1 Netzarchitektur und -design', url: 'https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/IT-Grundschutz/IT-Grundschutz-Kompendium/it-grundschutz-kompendium_node.html' },
    { title: 'Wikipedia: Virtual Local Area Network', url: 'https://de.wikipedia.org/wiki/Virtual_Local_Area_Network', note: 'VLAN und 802.1Q' },
    { title: 'Wikipedia: Strukturierte Verkabelung', url: 'https://de.wikipedia.org/wiki/Strukturierte_Verkabelung' }
  ],
  sourcesCheckedOn: '25.11.2026'
};
