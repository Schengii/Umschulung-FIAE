export interface VdeRule {
  id: string;
  title: string;
  standard: string;
  category: string;
  summary: string;
  limitValues: string[];
  tips: string[];
}

export const VDE_RULES_DB: VdeRule[] = [
  {
    id: "vde-0100-520",
    title: "Spannungsfall in Verbrauchsanlagen",
    standard: "DIN VDE 0100-520",
    category: "Leitungsdimensionierung",
    summary: "Regelt den maximal zulässigen Spannungsfall zwischen dem Zähler und den Verbrauchern, um Fehlfunktionen und Überlastungen zu vermeiden.",
    limitValues: [
      "Maximal 3,0 % Spannungsfall für Beleuchtungs- und Steckdosenstromkreise in Wohngebäuden.",
      "Maximal 4,0 % für andere Anlagen."
    ],
    tips: [
      "Wählen Sie bei langen Leitungswegen (>17 Meter bei 1.5mm² und 16A) einen größeren Querschnitt (z.B. 2.5mm²).",
      "Berücksichtigen Sie den Leistungsfaktor cos φ des Verbrauchers bei induktiven Lasten."
    ]
  },
  {
    id: "vde-0701-0702-pe",
    title: "Schutzleiterwiderstand (R_PE) bei ortsveränderlichen Geräten",
    standard: "DIN VDE 0701-0702 / EN 50678 & EN 50699",
    category: "Geräteprüfung",
    summary: "Beschreibt den maximal zulässigen Widerstand des Schutzleiters für elektrische Geräte der Schutzklasse I.",
    limitValues: [
      "R_PE ≤ 0,3 Ω für Leitungen bis 5 m Länge.",
      "Zuzüglich 0,1 Ω für jede weiteren 7,5 m Leitungslänge.",
      "Maximal zulässiger Gesamtwert: 1,0 Ω."
    ],
    tips: [
      "Messen Sie während der Prüfung an verschiedenen Stellen des Gehäuses unter leichter mechanischer Belastung (Bewegen der Anschlussleitung).",
      "Achten Sie auf Oxidschichten oder Lackierungen am Gehäuse, die den Messwert verfälschen können."
    ]
  },
  {
    id: "vde-0701-0702-iso",
    title: "Isolationswiderstand (R_ISO) bei Geräten",
    standard: "DIN VDE 0701-0702",
    category: "Geräteprüfung",
    summary: "Bestimmt den Mindestwert des Isolationswiderstands zwischen aktiven Leitern und berührbaren leitfähigen Teilen.",
    limitValues: [
      "R_ISO ≥ 1,0 MΩ für Geräte der Schutzklasse I (mit Schutzleiter).",
      "R_ISO ≥ 2,0 MΩ für Geräte der Schutzklasse II (schutzisoliert).",
      "R_ISO ≥ 0,25 MΩ für Geräte der Schutzklasse III (Sicherheitskleinspannung)."
    ],
    tips: [
      "Führen Sie die Messung mit einer Prüfspannung von 500 V DC durch.",
      "Schalten Sie alle Schalter des Prüflings während der Messung ein, damit alle internen Bauteile erfasst werden."
    ]
  },
  {
    id: "vde-0701-0702-leak",
    title: "Schutzleiterstrom / Ableitstrom (I_leak)",
    standard: "DIN VDE 0701-0702",
    category: "Geräteprüfung",
    summary: "Definiert die Obergrenze für den Strom, der über den Schutzleiter oder das Gehäuse zur Erde abfließt.",
    limitValues: [
      "Schutzleiterstrom ≤ 3,5 mA für Geräte der Schutzklasse I.",
      "Berührungsstrom ≤ 0,5 mA für Geräte der Schutzklasse II."
    ],
    tips: [
      "Nutzen Sie vorzugsweise das Differenzstrommessverfahren, da es auch Ströme über parallele Erdungen erfasst.",
      "Bei Heizelementen mit hoher Leistung (>3,5 kW) gelten abweichende Grenzwerte (bis zu 1 mA pro kW)."
    ]
  },
  {
    id: "vde-0105-100-rules",
    title: "Die 5 Sicherheitsregeln",
    standard: "DIN VDE 0105-100",
    category: "Arbeitsschutz",
    summary: "Die grundlegenden Sicherheitsregeln zur Vermeidung von Stromunfällen vor Beginn von Arbeiten an elektrischen Anlagen.",
    limitValues: [
      "1. Freischalten (Spannungsquelle allpolig trennen).",
      "2. Gegen Wiedereinschalten sichern (Schalter blockieren, Warnschild anbringen).",
      "3. Spannungsfreiheit feststellen (mit zweipoligem Spannungsprüfer verifizieren).",
      "4. Erden und Kurzschließen (zwingend bei Spannungen über 1000 V).",
      "5. Benachbarte, unter Spannung stehende Teile abdecken oder abschranken."
    ],
    tips: [
      "Die Regeln müssen genau in dieser Reihenfolge angewendet werden.",
      "Das Feststellen der Spannungsfreiheit darf nur mit zugelassenen, zweipoligen Messgeräten (z.B. Duspol) erfolgen, niemals mit einfachen Phasenprüfern ('Lügenstiften')."
    ]
  },
  {
    id: "vde-ip-classes",
    title: "IP-Schutzarten (Ingress Protection)",
    standard: "DIN EN 60529 (VDE 0470-1)",
    category: "Gehäuseschutz",
    summary: "Klassifizierung des Schutzes von Gehäusen gegen das Eindringen von Festkörpern (1. Ziffer) und Wasser (2. Ziffer).",
    limitValues: [
      "IP 20: Schutz gegen feste Fremdkörper (Ø ≥ 12,5 mm), kein Schutz gegen Wasser (Standard im Innenbereich).",
      "IP 44: Schutz gegen feste Fremdkörper (Ø ≥ 1,0 mm) und Spritzwasser (Standard im feuchten Innen- und Außenbereich).",
      "IP 65: Staubdicht und Schutz gegen Strahlwasser aus beliebigem Winkel.",
      "IP 67: Staubdicht und Schutz gegen zeitweiliges Untertauchen."
    ],
    tips: [
      "Achten Sie bei Außeninstallationen stets auf eine korrekte Einführung der Kabel von unten, um Kondenswasserbildung zu vermeiden.",
      "Beschädigte Dichtungen an IP44-Gehäusen führen zum Erlöschen des Berührungsschutzes."
    ]
  }
];
