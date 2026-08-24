export const SUBNETTING_QUIZ = [
  {
    id: 1,
    question: 'Ein Server besitzt die IP-Adresse 192.168.1.130 mit der Subnetzmaske /26 (255.255.255.192). Wie lautet die Netz-ID?',
    options: ['192.168.1.0', '192.168.1.128', '192.168.1.64', '192.168.1.192'],
    correct: 1,
    explanation: 'Bei /26 beträgt die Blockgröße 64 (256 - 192 = 64). Die Netze liegen bei .0, .64, .128, .192. 130 liegt im Netz 192.168.1.128.'
  },
  {
    id: 2,
    question: 'Welche Broadcast-Adresse gehört zum Subnetz 10.0.4.0/22?',
    options: ['10.0.4.255', '10.0.7.255', '10.0.15.255', '10.0.5.255'],
    correct: 1,
    explanation: 'Bei /22 (255.255.252.0) umfasst der 3. Oktet-Block 4 IP-Adressbereiche (256 - 252 = 4). Das Netz geht von 10.0.4.0 bis 10.0.7.255.'
  },
  {
    id: 3,
    question: 'Wie viele nutzbare Host-IP-Adressen stehen in einem /29 Subnetz zur Verfügung?',
    options: ['8', '6', '14', '30'],
    correct: 1,
    explanation: 'Ein /29 Subnetz hat 32 - 29 = 3 Host-Bits (2^3 = 8 IP-Adressen). Abzüglich Netz-ID und Broadcast bleiben 6 nutzbare Host-IPs.'
  },
  {
    id: 4,
    question: 'Für ein Punkt-zu-Punkt Netzwerk zwischen zwei Routern soll ein möglichst sparsames Subnetz gewählt werden. Welche CIDR-Notation ist optimal?',
    options: ['/28', '/29', '/30', '/24'],
    correct: 2,
    explanation: 'Ein /30 Subnetz bietet genau 2 nutzbare Host-IPs für die beiden Router-Schnittstellen (4 IP-Adressen insgesamt).'
  }
];

export const NETWORK_CHEAT_SHEET = [
  { cidr: '/24', mask: '255.255.255.0', totalIps: 256, usableHosts: 254, useCase: 'Klassisches Standard-LAN Segment' },
  { cidr: '/25', mask: '255.255.255.128', totalIps: 128, usableHosts: 126, useCase: 'Halbiertes C-Klasse Netz' },
  { cidr: '/26', mask: '255.255.255.192', totalIps: 64, usableHosts: 62, useCase: 'Abteilungssubnetz (z.B. IT-Support)' },
  { cidr: '/27', mask: '255.255.255.224', totalIps: 32, usableHosts: 30, useCase: 'Server-DMZ oder kleine Niederlassung' },
  { cidr: '/28', mask: '255.255.255.240', totalIps: 16, usableHosts: 14, useCase: 'Kleine Management-Zone' },
  { cidr: '/29', mask: '255.255.255.248', totalIps: 8, usableHosts: 6, useCase: 'Cluster-Interconnect oder Transfernetz' },
  { cidr: '/30', mask: '255.255.255.252', totalIps: 4, usableHosts: 2, useCase: 'Punkt-zu-Punkt Routerverbindung' }
];
