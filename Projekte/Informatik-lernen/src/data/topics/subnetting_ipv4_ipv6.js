/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Zu einer IPv4-Adresse mit Präfix Netzadresse, Broadcast, Hostbereich und Hostanzahl bestimmen',
    'Ein Netz in gleich große Subnetze und per VLSM bedarfsgerecht aufteilen',
    'Private, öffentliche und besondere Adressbereiche erkennen',
    'IPv6-Adressen korrekt kürzen, Adresstypen zuordnen und Präfixgrößen berechnen'
  ],
  content: `
## Aufbau einer IPv4-Adresse

Eine IPv4-Adresse hat **32 Bit**, geschrieben als vier Oktette in Dezimalpunktnotation, z. B. \`192.168.10.37\`. Die **Subnetzmaske** legt fest, welcher Teil das **Netz** und welcher den **Host** bezeichnet: Wo die Maske eine 1 hat, gehört das Bit zum Netzanteil.

Statt \`255.255.255.0\` schreibt man kürzer das **Präfix** in CIDR-Notation: \`/24\` = 24 Einsen. Die alten Netzklassen A, B und C spielen in der Praxis keine Rolle mehr (seit 1993 gilt CIDR), werden aber manchmal noch abgefragt: Klasse A beginnt mit 0–127 (/8), B mit 128–191 (/16), C mit 192–223 (/24).

| Präfix | Maske (letztes nicht volles Oktett) | Adressen | nutzbare Hosts |
| :---: | :--- | ---: | ---: |
| /24 | 255.255.255.0 | 256 | 254 |
| /25 | 255.255.255.128 | 128 | 126 |
| /26 | 255.255.255.192 | 64 | 62 |
| /27 | 255.255.255.224 | 32 | 30 |
| /28 | 255.255.255.240 | 16 | 14 |
| /29 | 255.255.255.248 | 8 | 6 |
| /30 | 255.255.255.252 | 4 | 2 |
| /20 | 255.255.240.0 | 4.096 | 4.094 |
| /16 | 255.255.0.0 | 65.536 | 65.534 |

**Hosts = 2^(32 − Präfix) − 2.** Zwei Adressen fallen weg: die **Netzadresse** (alle Hostbits 0) und die **Broadcastadresse** (alle Hostbits 1). Ausnahme: Für Punkt-zu-Punkt-Verbindungen erlaubt RFC 3021 ein /31 mit zwei nutzbaren Adressen.

## Netzadresse und Broadcast berechnen

Die **Netzadresse** entsteht durch ein bitweises **UND** von Adresse und Maske. Im Kopf geht es schneller mit der **Blockgröße**: 256 − (Maskenwert im „interessanten“ Oktett).

> [!example] Beispiel: 172.16.45.130/20
> 1. /20 → Maske 255.255.**240**.0. Das interessante Oktett ist das dritte.
> 2. Blockgröße: 256 − 240 = **16**. Netze beginnen im 3. Oktett bei 0, 16, 32, 48 …
> 3. 45 liegt zwischen 32 und 47 → **Netzadresse 172.16.32.0**
> 4. Nächstes Netz beginnt bei 48 → **Broadcast 172.16.47.255**
> 5. Hostbereich: **172.16.32.1 – 172.16.47.254**, das sind 2¹² − 2 = **4.094 Hosts**.

Zur Kontrolle bitweise (nur das dritte Oktett): 45 = \`0010 1101\`, 240 = \`1111 0000\` → UND = \`0010 0000\` = 32. ✓

## Subnetze gleicher Größe bilden

Um ein Netz in *n* gleich große Teile zu zerlegen, **leiht** man sich Bits aus dem Hostteil: *s* geliehene Bits ergeben 2^s Subnetze.

![Aufteilung eines /24 in vier /26](subnetting.svg "Zwei geliehene Bits teilen ein /24 in vier Subnetze mit je 62 Hosts")

> [!exam] Prüfungstipp: Wie viele Bits leihen?
> Für 6 Abteilungen reichen 2 Bit (4 Netze) nicht, 3 Bit (8 Netze) schon. Aus einem /24 wird ein **/27** mit je 30 Hosts. Zwei Netze bleiben als Reserve – das solltest du in der Antwort erwähnen.

## VLSM: Subnetze nach Bedarf

Mit **VLSM** (*Variable Length Subnet Mask*) bekommt jedes Teilnetz nur so viele Adressen, wie es braucht. Vorgehen:

1. Bedarf **absteigend sortieren** (größtes Netz zuerst, sonst entstehen Lücken).
2. Für jedes Netz das kleinste Präfix wählen, bei dem 2^Hostbits − 2 ≥ Bedarf ist.
3. Netze lückenlos hintereinander vergeben.

Beispiel mit 10.0.0.0/24 und dem Bedarf 100, 50, 20 und 2 Hosts:

| Netz | Bedarf | Präfix | Netzadresse | Hostbereich | Broadcast |
| :--- | ---: | :---: | :--- | :--- | :--- |
| Verwaltung | 100 | /25 (126) | 10.0.0.0 | .1 – .126 | 10.0.0.127 |
| Produktion | 50 | /26 (62) | 10.0.0.128 | .129 – .190 | 10.0.0.191 |
| Gäste-WLAN | 20 | /27 (30) | 10.0.0.192 | .193 – .222 | 10.0.0.223 |
| Router-Link | 2 | /30 (2) | 10.0.0.224 | .225 – .226 | 10.0.0.227 |

Frei bleibt der Bereich 10.0.0.228 bis 10.0.0.255 für spätere Erweiterungen.

## Besondere Adressbereiche

| Bereich | Bedeutung |
| :--- | :--- |
| 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 | **privat** (RFC 1918), im Internet nicht geroutet → NAT nötig |
| 127.0.0.0/8 | Loopback (\`127.0.0.1\` = der eigene Rechner) |
| 169.254.0.0/16 | APIPA/Link-Local: Der Client hat keinen DHCP-Server erreicht |
| 100.64.0.0/10 | Carrier-Grade-NAT beim Provider (RFC 6598) |
| 0.0.0.0/0 | Default-Route („alle Ziele“) |
| 224.0.0.0/4 | Multicast |

> [!warning] Häufiger Fehler
> 172.32.0.1 ist **nicht** privat. Der private Bereich 172.16.0.0/12 reicht nur von 172.16.0.0 bis 172.31.255.255.

## IPv6

IPv4 bietet rund 4,3 Milliarden Adressen, das reicht längst nicht mehr. **IPv6** nutzt **128 Bit**, geschrieben als acht Blöcke zu je 16 Bit in Hexadezimal:

\`2001:0db8:0000:0000:0000:ff00:0042:8329\`

### Kürzungsregeln (RFC 5952)

1. **Führende Nullen** jedes Blocks weglassen: \`0db8\` → \`db8\`, \`0042\` → \`42\`, \`0000\` → \`0\`.
2. **Eine** zusammenhängende Folge von Null-Blöcken durch \`::\` ersetzen – nur einmal pro Adresse, und zwar die längste.
3. Buchstaben klein schreiben.

Ergebnis: \`2001:db8::ff00:42:8329\`. Ein zweites \`::\` wäre mehrdeutig, weil man nicht wüsste, wie viele Nullen wo fehlen.

### Präfixe und Adresstypen

Eine typische IPv6-Unicast-Adresse besteht aus **64 Bit Präfix** (Netz) und **64 Bit Interface-ID**. Provider vergeben an Unternehmen oft ein **/48**, an Privatkunden ein **/56**. Ein Subnetz (LAN) ist praktisch immer ein **/64**. Aus einem /48 lassen sich also 2^(64−48) = **65.536** Subnetze bilden.

| Präfix | Typ | Entspricht in IPv4 |
| :--- | :--- | :--- |
| 2000::/3 | Global Unicast (öffentlich) | öffentliche Adresse |
| fe80::/10 | Link-Local (jedes Interface hat eine, nicht geroutet) | APIPA |
| fc00::/7 (in der Praxis fd00::/8) | Unique Local Address (ULA) | privat (RFC 1918) |
| ff00::/8 | Multicast | Multicast/Broadcast |
| ::1/128 | Loopback | 127.0.0.1 |
| 2001:db8::/32 | Dokumentation und Beispiele | 192.0.2.0/24 |

IPv6 hat **keinen Broadcast** mehr. Aufgaben wie die Adressauflösung (ARP bei IPv4) erledigt das **Neighbor Discovery Protocol** über Multicast. Clients können sich per **SLAAC** selbst eine Adresse bilden: Präfix aus dem Router Advertisement plus eigene Interface-ID (zufällig für den Datenschutz oder nach **EUI-64** aus der MAC-Adresse).

> [!example] EUI-64 aus der MAC-Adresse 00:1A:2B:3C:4D:5E
> 1. In der Mitte \`FF:FE\` einfügen: 00:1A:2B:**FF:FE**:3C:4D:5E
> 2. Das 7. Bit von links (U/L-Bit) umdrehen: \`00\` = 0000 00**0**0 → 0000 00**1**0 = \`02\`
> 3. Interface-ID: \`021a:2bff:fe3c:4d5e\`
`,
  codeSnippet: `# Python: Netze berechnen mit dem Standardmodul ipaddress
import ipaddress

netz = ipaddress.ip_interface("172.16.45.130/20").network
print(netz.network_address)    # 172.16.32.0
print(netz.broadcast_address)  # 172.16.47.255
print(netz.num_addresses - 2)  # 4094

for sub in ipaddress.ip_network("192.168.10.0/24").subnets(new_prefix=26):
    print(sub)                 # 192.168.10.0/26, .64/26, .128/26, .192/26

print(ipaddress.ip_address("2001:0db8:0000:0000:0000:ff00:0042:8329"))
# 2001:db8::ff00:42:8329`,
  codeLanguage: 'Python',
  exercises: [
    {
      id: 'netz-broadcast',
      title: 'Netzadresse, Broadcast und Hostbereich',
      prompt: 'Bestimme für den Host **10.20.77.200/21** die Subnetzmaske, die Netzadresse, die Broadcastadresse, den ersten und letzten nutzbaren Host sowie die Anzahl der Hosts.',
      hints: ['/21 → 255.255.248.0, das interessante Oktett ist das dritte.', 'Blockgröße 256 − 248 = 8. In welchem Achterblock liegt 77?'],
      solution: 'Maske **255.255.248.0**, Blockgröße 8. 77 liegt im Block 72–79.\n\n- Netzadresse: **10.20.72.0**\n- Broadcast: **10.20.79.255**\n- Hosts: **10.20.72.1 – 10.20.79.254**\n- Anzahl: 2¹¹ − 2 = **2.046**'
    },
    {
      id: 'gleiche-subnetze',
      title: 'Abteilungsnetze planen',
      prompt: 'Ein Unternehmen hat das Netz **192.168.50.0/24** und braucht 6 Abteilungsnetze gleicher Größe. Gib Präfix, Hosts je Netz und die ersten drei Subnetze (Netzadresse und Broadcast) an.',
      hints: ['Wie viele Bits brauchst du für mindestens 6 Netze?'],
      solution: '3 Bits leihen → 2³ = 8 Netze (2 Reserve), Präfix **/27**, je **30 Hosts**, Blockgröße 32.\n\n1. 192.168.50.0 – Broadcast 192.168.50.31\n2. 192.168.50.32 – Broadcast 192.168.50.63\n3. 192.168.50.64 – Broadcast 192.168.50.95'
    },
    {
      id: 'vlsm',
      title: 'VLSM-Planung',
      prompt: 'Teile **172.20.8.0/22** per VLSM auf: Lager 300 Hosts, Büro 120 Hosts, Server 25 Hosts, zwei Router-Links mit je 2 Hosts. Gib für jedes Netz Netzadresse/Präfix und Broadcast an.',
      hints: ['/22 umfasst 172.20.8.0 bis 172.20.11.255 (1.024 Adressen).', '300 Hosts brauchen 9 Hostbits (510).'],
      solution: '| Netz | Präfix | Netzadresse | Broadcast |\n| :--- | :---: | :--- | :--- |\n| Lager (300) | /23 | 172.20.8.0 | 172.20.9.255 |\n| Büro (120) | /25 | 172.20.10.0 | 172.20.10.127 |\n| Server (25) | /27 | 172.20.10.128 | 172.20.10.159 |\n| Link 1 | /30 | 172.20.10.160 | 172.20.10.163 |\n| Link 2 | /30 | 172.20.10.164 | 172.20.10.167 |\n\nFrei: 172.20.10.168 bis 172.20.11.255.'
    },
    {
      id: 'ipv6-kuerzen',
      title: 'IPv6 kürzen und Präfixe rechnen',
      prompt: '1. Kürze `fd00:0000:0000:0001:0000:0000:0000:00a1` regelkonform.\n2. Wie viele /64-Subnetze passen in ein /56?\n3. Um welchen Adresstyp handelt es sich bei Teil 1?',
      hints: ['Es gibt zwei Null-Folgen. Nur die längere wird zu ::.'],
      solution: '1. **fd00:0:0:1::a1** – die Folge aus drei Null-Blöcken wird zu ::, die zwei Nullen davor bleiben als 0:0.\n2. 2^(64 − 56) = **256** Subnetze.\n3. **Unique Local Address** (fd00::/8), vergleichbar mit privaten IPv4-Adressen.'
    }
  ],
  quiz: [
    {
      question: 'Wie viele nutzbare Hostadressen hat ein /28-Netz?',
      options: ['16', '14', '30', '12'],
      correct: 1,
      explanation: '2^(32−28) = 16 Adressen, minus Netz- und Broadcastadresse = 14.'
    },
    {
      question: 'Welche Netzadresse gehört zu 192.168.5.100/26?',
      options: ['192.168.5.0', '192.168.5.64', '192.168.5.96', '192.168.5.128'],
      correct: 1,
      explanation: 'Blockgröße 64: Netze bei .0, .64, .128, .192. 100 liegt im Block .64 bis .127.'
    },
    {
      question: 'Welche Adresse ist eine private IPv4-Adresse nach RFC 1918?',
      options: ['172.32.10.5', '192.169.1.1', '172.20.0.1', '11.0.0.1'],
      correct: 2,
      explanation: '172.16.0.0/12 reicht von 172.16.0.0 bis 172.31.255.255. 172.20.0.1 liegt darin, 172.32.10.5 nicht.'
    },
    {
      question: 'Ein Client hat die Adresse 169.254.12.7. Was ist wahrscheinlich passiert?',
      options: [
        'Er hat eine öffentliche Adresse vom Provider bekommen',
        'Er hat keinen DHCP-Server erreicht und sich eine Link-Local-Adresse gegeben',
        'Er ist per VPN verbunden',
        'Er nutzt IPv6'
      ],
      correct: 1,
      explanation: '169.254.0.0/16 ist der APIPA-Bereich – ein typisches Zeichen für ein DHCP-Problem.'
    },
    {
      question: 'Welche Schreibweise von 2001:0db8:0000:0000:0000:0000:0000:0001 ist korrekt gekürzt?',
      options: ['2001:db8::1', '2001:db8:0::0:1', '2001::db8::1', '21:db8::1'],
      correct: 0,
      explanation: 'Führende Nullen entfallen, die Null-Folge wird einmal zu ::. Zwei :: sind verboten, und 2001 darf nicht gekürzt werden (nur führende Nullen).'
    },
    {
      question: 'Welches Präfix hat eine IPv6-Link-Local-Adresse?',
      options: ['fe80::/10', 'ff00::/8', '2000::/3', 'fd00::/8'],
      correct: 0,
      explanation: 'Link-Local-Adressen beginnen mit fe80. ff00::/8 ist Multicast, 2000::/3 Global Unicast, fd00::/8 ULA.'
    },
    {
      question: 'Ein /24 soll in Netze mit mindestens 50 Hosts geteilt werden. Wie viele Netze entstehen maximal?',
      options: ['2', '4', '6', '8'],
      correct: 1,
      explanation: '50 Hosts brauchen 6 Hostbits (62 Hosts) → /26. Aus einem /24 werden 2² = 4 Netze.'
    }
  ],
  relatedLabs: [
    { id: 'subnetting', label: 'Subnetting-Trainer' },
    { id: 'vlsm_subnet_lab', label: 'VLSM-Planer' },
    { id: 'ipv6_ndp_lab', label: 'IPv6 Neighbor Discovery & SLAAC' },
    { id: 'nat_pat_lab', label: 'NAT/PAT-Simulator' }
  ],
  sources: [
    { title: 'RFC 1918: Address Allocation for Private Internets', url: 'https://www.rfc-editor.org/rfc/rfc1918' },
    { title: 'RFC 4632: Classless Inter-domain Routing (CIDR)', url: 'https://www.rfc-editor.org/rfc/rfc4632' },
    { title: 'RFC 3021: Using 31-Bit Prefixes on IPv4 Point-to-Point Links', url: 'https://www.rfc-editor.org/rfc/rfc3021' },
    { title: 'RFC 4291: IP Version 6 Addressing Architecture', url: 'https://www.rfc-editor.org/rfc/rfc4291', note: 'Adresstypen, EUI-64' },
    { title: 'RFC 5952: A Recommendation for IPv6 Address Text Representation', url: 'https://www.rfc-editor.org/rfc/rfc5952', note: 'Kürzungsregeln' },
    { title: 'IANA IPv4 Special-Purpose Address Registry', url: 'https://www.iana.org/assignments/iana-ipv4-special-registry/iana-ipv4-special-registry.xhtml' },
    { title: 'Python-Dokumentation: ipaddress', url: 'https://docs.python.org/3/library/ipaddress.html' },
    { title: 'Eigene Lernkarten zur FIAE-Umschulung: IP-Adressierung, Subnetting, IPv6', note: 'nicht öffentlich' }
  ],
  sourcesCheckedOn: '29.10.2026'
};
