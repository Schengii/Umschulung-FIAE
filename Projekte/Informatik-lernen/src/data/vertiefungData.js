import { GUIDE_DEEPDIVES_REST } from './vertiefungDataRest';
// Fachliche Vertiefungen zu den bestehenden Inhalten unter „Kurse & Wissen“.
// Schlüssel = ID des vorhandenen Eintrags. Format: { md: Markdown, sources?: [{ label, url }] }.
// Das Markdown wird von Shared/MarkdownView gerendert (Überschriften, Listen, Tabellen, Code).
const md = (...lines) => lines.join('\n');

// ---------------------------------------------------------------- Einsteiger-Kurs
const GUIDE_DEEPDIVES_BASE = {
  eva_prinzip: {
    md: md(
      '### Von-Neumann-Architektur',
      'Fast alle heutigen Rechner folgen der Von-Neumann-Architektur (1945): **Programme und Daten liegen im selben Arbeitsspeicher** (Stored-Program-Prinzip).',
      '- Bausteine: Rechenwerk (ALU), Steuerwerk, Speicher, Ein-/Ausgabewerk.',
      '- Verbindung über ein **Bussystem**: Adressbus (wohin?), Datenbus (was?), Steuerbus (lesen oder schreiben?).',
      '- **Von-Neumann-Flaschenhals**: Befehle und Daten teilen sich denselben Weg zum Speicher und bremsen sich gegenseitig. Gegenmittel sind Caches und die **Harvard-Architektur** mit getrennten Befehls- und Datenspeichern (z. B. bei Mikrocontrollern).',
      '',
      '### Befehlszyklus: Fetch, Decode, Execute',
      '1. **Fetch**: Das Steuerwerk holt den Befehl, auf den der Befehlszähler (Program Counter) zeigt.',
      '2. **Decode**: Der Befehl wird entschlüsselt (Welche Operation? Welche Operanden?).',
      '3. **Execute**: Die ALU oder eine andere Einheit führt ihn aus.',
      '4. **Write-back**: Das Ergebnis wird in ein Register oder in den Speicher geschrieben, der Befehlszähler wird erhöht.',
      '',
      '### Speicherhierarchie (typische Größenordnungen)',
      '| Ebene | Zugriffszeit | Eigenschaft |',
      '|---|---|---|',
      '| Register | unter 1 ns | wenige Bytes, direkt in der CPU |',
      '| L1/L2/L3-Cache | 1 bis 20 ns | klein, sehr schnell, teuer |',
      '| Arbeitsspeicher (RAM) | 50 bis 100 ns | flüchtig |',
      '| SSD | 50 bis 100 µs | dauerhaft |',
      '| Festplatte (HDD) | 5 bis 10 ms | dauerhaft, mechanisch |',
      '',
      '### Prüfungsbezug',
      'Die Aufgaben in AP1 verlangen häufig, Komponenten einem Schritt des EVA-Prinzips zuzuordnen und den Zweck von RAM, Cache und Massenspeicher zu unterscheiden.'
    ),
    sources: [{ label: 'Wikipedia: Von-Neumann-Architektur', url: 'https://de.wikipedia.org/wiki/Von-Neumann-Architektur' }]
  },
  cpu_brain: {
    md: md(
      '### Takt ist nicht gleich Leistung',
      'Die Rechenleistung hängt von mehreren Faktoren ab: `Leistung ≈ Takt × IPC × Kerne` (IPC = Befehle pro Takt). Ein neuerer Prozessor mit niedrigerem Takt kann durch höhere IPC schneller sein.',
      '',
      '**Rechenbeispiel**: 3,5 GHz bedeuten 3,5 Milliarden Takte pro Sekunde, ein Takt dauert also etwa 0,29 ns. Vier Kerne mit je IPC 2 schaffen idealisiert 4 × 3,5 · 10⁹ × 2 = 28 Milliarden Befehle pro Sekunde.',
      '',
      '### Pipeline und Sprungvorhersage',
      '- Die Befehlsbearbeitung ist in Stufen unterteilt, sodass mehrere Befehle **überlappend** bearbeitet werden (Pipelining).',
      '- Bei Verzweigungen (if) rät die **Branch Prediction**, welcher Weg genommen wird. Eine Fehlvorhersage verwirft die Pipeline und kostet mehrere Takte.',
      '',
      '### Kerne, Threads und Parallelität',
      '- Mehrere **Kerne** arbeiten echt parallel. **SMT** (bei Intel Hyper-Threading) lässt zwei Threads je Kern die Rechenwerke gemeinsam nutzen.',
      '- Der Nutzen hängt von der Software ab: Nach dem **Amdahlschen Gesetz** begrenzt der nicht parallelisierbare Anteil den Gewinn.',
      '',
      '### Cache',
      '- **L1** je Kern, klein und am schnellsten (meist getrennt für Befehle und Daten), **L2** je Kern oder Kernpaar, **L3** von allen Kernen geteilt.',
      '- **Cache-Hit**: Daten sind im Cache. **Cache-Miss**: Sie müssen aus langsameren Ebenen geholt werden.',
      '',
      '### Wortbreite und Befehlssätze',
      '- Ein 32-Bit-System kann höchstens 2³² Byte = 4 GiB direkt adressieren, ein 64-Bit-System theoretisch 2⁶⁴ Byte (praktisch weniger).',
      '- **x86-64** (CISC, viele komplexe Befehle) dominiert in PCs und Servern, **ARM** (RISC, einfache Befehle, sparsam) in Smartphones und zunehmend in Servern.',
      '',
      '### Leistungsaufnahme',
      'Die Verlustleistung steigt etwa mit `P ∝ C · U² · f`: Höherer Takt und höhere Spannung erhöhen sie stark. Deshalb gibt es TDP-Angaben, Kühlkonzepte und Taktabsenkung unter Last.'
    ),
    sources: [{ label: 'Wikipedia: Amdahlsches Gesetz', url: 'https://de.wikipedia.org/wiki/Amdahlsches_Gesetz' }]
  },
  binary_system: {
    md: md(
      '### Zahlensysteme umrechnen',
      '- **Dezimal nach binär** durch fortlaufende Division durch 2, die Reste von unten nach oben lesen. Beispiel: 25 = 16 + 8 + 1 = `11001`.',
      '- **Hexadezimal**: Eine Hex-Ziffer (0 bis F) steht für 4 Bit (ein Nibble). `0x41` = `0100 0001` = 65 (Buchstabe "A").',
      '',
      '### Negative Zahlen: Zweierkomplement',
      'Bei 8 Bit reicht der Wertebereich von −128 bis 127. Eine negative Zahl entsteht durch **Invertieren aller Bits und Addieren von 1**.',
      '```',
      '+5 = 0000 0101',
      'invertiert = 1111 1010',
      '+1 = 1111 1011  -> -5 (0xFB)',
      '```',
      '',
      '### Einheiten: SI und IEC',
      '| Schreibweise | Bedeutung | Wert |',
      '|---|---|---|',
      '| 1 kB, MB, GB | dezimal (SI) | 1000, 10⁶, 10⁹ Byte |',
      '| 1 KiB, MiB, GiB | binär (IEC) | 1024, 2²⁰, 2³⁰ Byte |',
      '',
      'Hersteller geben Speicher dezimal an. Eine 1-TB-Festplatte hat 10¹² Byte, das sind etwa 931 GiB. Deshalb zeigt das Betriebssystem scheinbar weniger Platz an.',
      '',
      '### Übertragungsraten',
      'Netzwerke rechnen in **Bit** pro Sekunde, Dateien in **Byte**. 100 Mbit/s entsprechen 12,5 MB/s.',
      '',
      '### Zeichenkodierung',
      '- **ASCII** nutzt 7 Bit (128 Zeichen) und kennt keine Umlaute.',
      '- **Unicode** ordnet jedem Zeichen eine Nummer zu, **UTF-8** speichert sie mit 1 bis 4 Byte und ist zu ASCII abwärtskompatibel. Das "ä" belegt in UTF-8 zwei Byte (`C3 A4`).',
      '',
      '### Gleitkommazahlen',
      'Dezimalbrüche wie 0,1 lassen sich binär nicht exakt darstellen. Deshalb ergibt `0.1 + 0.2` in vielen Sprachen nicht genau `0.3`. **Geldbeträge** speichert man daher als Ganzzahl in Cent oder mit einem Dezimal-Datentyp.',
      '',
      '### Bitoperationen',
      'AND, OR, XOR und Schieben werden z. B. für Subnetzmasken (`IP AND Maske`) und Flags genutzt.'
    ),
    sources: [{ label: 'IEEE 754 (Gleitkomma) auf Wikipedia', url: 'https://de.wikipedia.org/wiki/IEEE_754' }]
  },
  internet_dns: {
    md: md(
      '### Schichtenmodelle',
      'Das **TCP/IP-Modell** hat vier Schichten (Netzzugang, Internet, Transport, Anwendung). Das **OSI-Modell** gliedert feiner in sieben (Bitübertragung bis Anwendung) und dient in der Prüfung als Referenz.',
      '',
      '### Adressierung',
      '- **IPv4**: 32 Bit, rund 4,3 Milliarden Adressen, Schreibweise dezimal (192.0.2.1).',
      '- **IPv6**: 128 Bit, hexadezimal, Nullblöcke lassen sich einmal mit `::` kürzen (2001:db8::1).',
      '',
      '### Wie läuft eine DNS-Auflösung ab?',
      '1. Browser-Cache, dann Cache des Betriebssystems.',
      '2. Anfrage an den **rekursiven Resolver** (Provider oder z. B. 8.8.8.8).',
      '3. Der Resolver fragt einen **Root-Server**, der auf den Server der Top-Level-Domain (.de) verweist.',
      '4. Der **TLD-Server** nennt den zuständigen **autoritativen Nameserver** der Domain.',
      '5. Dieser liefert die IP-Adresse samt **TTL**, die den Zeitraum der Zwischenspeicherung festlegt.',
      '',
      '### Wichtige DNS-Eintragstypen',
      '| Typ | Funktion |',
      '|---|---|',
      '| A / AAAA | Name zu IPv4 / IPv6 |',
      '| CNAME | Alias auf einen anderen Namen |',
      '| MX | Mailserver der Domain |',
      '| NS | zuständige Nameserver |',
      '| TXT | Freitext, z. B. SPF und Domainprüfung |',
      '| PTR | Rückwärtsauflösung IP zu Name |',
      '',
      '### Was passiert beim Aufruf einer Webseite?',
      'DNS-Auflösung, dann **TCP-Handshake**, dann **TLS-Handshake** (Verschlüsselung, Zertifikatsprüfung), danach der **HTTP-Request** und die Antwort.',
      '',
      '### TCP und UDP',
      '- **TCP**: verbindungsorientiert, zuverlässig, Reihenfolge garantiert (Web, Mail).',
      '- **UDP**: verbindungslos, schnell, ohne Garantie (DNS-Anfragen, Telefonie, Streaming).',
      '',
      '### Routing und TTL',
      'Jedes IP-Paket trägt eine Lebensdauer (TTL bzw. Hop Limit), die jeder Router um 1 verringert. Bei 0 wird das Paket verworfen. `traceroute` nutzt das, um den Weg sichtbar zu machen.',
      '',
      '### Sicherheitsaspekte',
      'Klassische DNS-Anfragen sind unverschlüsselt und fälschbar (DNS-Spoofing). **DNSSEC** signiert Antworten, **DoH/DoT** verschlüsseln die Anfrage.'
    ),
    sources: [
      { label: 'RFC 1034: Domain Names – Concepts', url: 'https://www.rfc-editor.org/rfc/rfc1034' },
      { label: 'RFC 8200: IPv6', url: 'https://www.rfc-editor.org/rfc/rfc8200' }
    ]
  }
};

// ---------------------------------------------------------------- KI-Masterclass
export const AI_DEEPDIVES = {
  prompt_templates: {
    md: md(
      '### Wie ein Sprachmodell Eingaben verarbeitet',
      '- Text wird in **Tokens** zerlegt (Wortteile). Deutsche Wörter benötigen oft mehr Tokens als englische.',
      '- Das **Kontextfenster** begrenzt die Summe aus Eingabe und Antwort. Lange Dokumente müssen gekürzt oder zerlegt werden.',
      '- Die **Temperatur** steuert die Zufälligkeit: niedrig für faktische und reproduzierbare Antworten, höher für kreative.',
      '',
      '### Bausteine eines guten Prompts',
      '| Baustein | Zweck | Beispiel |',
      '|---|---|---|',
      '| Rolle | Perspektive und Fachniveau | "Du bist IT-Sicherheitsberater" |',
      '| Kontext | Hintergrund, Zielgruppe | "Für ein Unternehmen mit 50 Mitarbeitenden" |',
      '| Aufgabe | Was genau zu tun ist | "Erstelle eine Checkliste" |',
      '| Format | Struktur der Antwort | "Tabelle mit 3 Spalten" |',
      '| Grenzen | Länge, Ton, Tabus | "Maximal 150 Wörter, keine Fachbegriffe" |',
      '',
      '### Typische Fehler',
      '- Mehrdeutige Aufgaben ("Verbessere den Text" ohne Kriterium).',
      '- Zu viel Unwichtiges im Kontext, wichtige Anforderungen stehen mitten im Text.',
      '- Vertrauliche oder personenbezogene Daten im Prompt (Datenschutz beachten).',
      '',
      '### Vorgehen im Alltag',
      'Prompt schreiben, Ergebnis gegen Kriterien prüfen, gezielt nachschärfen (eine Änderung pro Durchlauf), gute Prompts als Vorlage speichern.'
    ),
    sources: [{ label: 'Anthropic: Prompt-Engineering-Übersicht', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview' }]
  },
  chain_of_thought: {
    md: md(
      '### Wann hilft Chain-of-Thought?',
      'Bei Aufgaben mit **mehreren Zwischenschritten** (Rechnen, Logik, Abwägen) verbessert schrittweises Vorgehen oft die Qualität. Bei einfachen Faktenfragen bringt es kaum etwas und kostet nur Tokens.',
      '',
      '### Varianten',
      '- **Zero-shot CoT**: Der Zusatz "Denke Schritt für Schritt" genügt.',
      '- **Few-shot CoT**: Beispiele enthalten den Lösungsweg, nicht nur das Ergebnis.',
      '- **Self-Consistency**: Dieselbe Frage wird mehrfach mit Zufall gelöst, das häufigste Endergebnis gewinnt.',
      '',
      '### Grenzen',
      '- Eine Begründung kann **plausibel klingen und trotzdem falsch** sein. Zwischenschritte ersetzen keine Prüfung.',
      '- Längere Antworten kosten Zeit und Geld.',
      '- Spezialisierte Reasoning-Modelle denken intern in mehreren Schritten, dort ist ein ausdrücklicher Schritt-für-Schritt-Hinweis oft unnötig.',
      '',
      '### Praxis',
      'Verlange eine **Kurzantwort getrennt von der Begründung** ("Ergebnis: …"), damit die Ausgabe maschinell weiterverarbeitet werden kann, und prüfe Zahlen unabhängig nach.'
    ),
    sources: [
      { label: 'Wei et al. 2022: Chain-of-Thought Prompting', url: 'https://arxiv.org/abs/2201.11903' },
      { label: 'Wang et al. 2022: Self-Consistency', url: 'https://arxiv.org/abs/2203.11171' }
    ]
  },
  few_shot: {
    md: md(
      '### Worauf es bei den Beispielen ankommt',
      '- **Qualität vor Menge**: 2 bis 5 passende Beispiele genügen meist.',
      '- **Vielfalt**: Decke typische Fälle und mindestens einen Randfall ab (leere Eingabe, Sonderzeichen).',
      '- **Einheitliches Format**: Jedes Beispiel nutzt exakt dasselbe Schema, damit das Modell es übernimmt.',
      '- **Ausgewogene Labels**: Bei Klassifikation alle Klassen ähnlich oft zeigen, sonst entsteht eine Schlagseite.',
      '- **Reihenfolge**: Das zuletzt gezeigte Beispiel hat oft mehr Einfluss (Recency-Effekt), mische sie daher.',
      '',
      '### Entscheidungshilfe: Few-Shot, RAG oder Fine-Tuning?',
      '| Ziel | Geeignet |',
      '|---|---|',
      '| Ausgabeformat und Ton festlegen | Few-Shot im Prompt |',
      '| Aktuelles oder firmeneigenes Wissen nutzen | RAG (Dokumente einbinden) |',
      '| Dauerhaft spezielles Verhalten bei sehr vielen Beispielen | Fine-Tuning |',
      '',
      '### Absicherung',
      'Teste die Vorlage mit Eingaben, die **nicht** in den Beispielen vorkommen, und validiere strukturierte Ausgaben (z. B. gültiges JSON) im Code.'
    ),
    sources: [{ label: 'Brown et al. 2020: Language Models are Few-Shot Learners', url: 'https://arxiv.org/abs/2005.14165' }]
  },
  deep_learning: {
    md: md(
      '### Bausteine eines neuronalen Netzes',
      '- Ein **Neuron** bildet die gewichtete Summe seiner Eingaben plus Bias und schickt sie durch eine **Aktivierungsfunktion**: `a = f(Σ wᵢ·xᵢ + b)`.',
      '- **ReLU** (`max(0, x)`) ist Standard in versteckten Schichten, **Sigmoid** liefert Werte zwischen 0 und 1 (binäre Wahrscheinlichkeit), **Softmax** macht aus mehreren Werten eine Wahrscheinlichkeitsverteilung.',
      '',
      '### Wie das Netz lernt',
      '1. **Forward Pass**: Eingabe durch das Netz, Vorhersage berechnen.',
      '2. **Loss**: Abweichung messen, z. B. mittlerer quadratischer Fehler (Regression) oder Kreuzentropie (Klassifikation).',
      '3. **Backpropagation**: Mit der Kettenregel wird der Gradient des Loss für jedes Gewicht berechnet.',
      '4. **Gradientenabstieg**: Gewichte anpassen mit `w ← w − η · ∂L/∂w` (η = Lernrate).',
      '',
      '### Wichtige Stellschrauben',
      '| Begriff | Bedeutung |',
      '|---|---|',
      '| Lernrate | zu groß: Training springt, zu klein: sehr langsam |',
      '| Batch | Anzahl Beispiele pro Gewichtsupdate |',
      '| Epoche | ein vollständiger Durchlauf durch die Trainingsdaten |',
      '| Optimierer | z. B. SGD oder Adam (passt die Schrittweite je Gewicht an) |',
      '',
      '### Overfitting bekämpfen',
      'Mehr Daten, Datenaugmentation, **Dropout** (zufälliges Abschalten von Neuronen), **Regularisierung**, **Early Stopping** anhand der Validierungsdaten.',
      '',
      '### Transformer in einem Satz',
      'Transformer berechnen über **Attention**, welche Teile der Eingabe füreinander wichtig sind. Das ermöglicht paralleles Training und ist die Grundlage heutiger Sprachmodelle.'
    ),
    sources: [
      { label: 'Goodfellow, Bengio, Courville: Deep Learning (Buch online)', url: 'https://www.deeplearningbook.org/' },
      { label: 'Vaswani et al. 2017: Attention Is All You Need', url: 'https://arxiv.org/abs/1706.03762' }
    ]
  }
};

// ---------------------------------------------------------------- Web Components
export const WC_DEEPDIVES = {
  lit: {
    md: md(
      '### Reaktivität in Lit',
      '- Als **reaktive Property** deklarierte Felder lösen bei Änderung ein Neurendern aus. Mehrere Änderungen werden gebündelt (Microtask), es wird nur einmal aktualisiert.',
      '- Der `html`-Tagged-Template-Literal aktualisiert nur die **dynamischen Teile** des Templates, es gibt kein virtuelles DOM.',
      '- Styles aus `css` sind per Shadow DOM auf die Komponente begrenzt.',
      '',
      '### Lebenszyklus (Auswahl)',
      '| Callback | Zeitpunkt |',
      '|---|---|',
      '| `connectedCallback` | Element wurde ins DOM eingefügt |',
      '| `willUpdate` | vor dem Rendern, abgeleitete Werte berechnen |',
      '| `render` | Template zurückgeben |',
      '| `firstUpdated` / `updated` | nach dem Rendern, DOM-Zugriff möglich |',
      '| `disconnectedCallback` | Element wurde entfernt, aufräumen |',
      '',
      '### Kommunikation',
      '- **Daten rein** über Properties und Attribute, **Ereignisse raus** über Custom Events.',
      '- Ereignisse, die das Shadow DOM verlassen sollen, brauchen `bubbles: true` und `composed: true`.',
      '```js',
      'this.dispatchEvent(new CustomEvent("auswahl", { detail: id, bubbles: true, composed: true }));',
      '```',
      '',
      '### Einordnung',
      'Lit ist klein und erzeugt echte Custom Elements, die in jedem Framework und ohne Framework laufen. Es bietet kein eigenes Routing oder State-Management, das ergänzt man bei Bedarf.'
    ),
    sources: [{ label: 'Lit Dokumentation', url: 'https://lit.dev/docs/' }]
  },
  vaadin: {
    md: md(
      '### Zwei Architekturen',
      '| Variante | Idee | Typisch für |',
      '|---|---|---|',
      '| **Vaadin Flow** | UI wird in Java gebaut, der Zustand liegt auf dem **Server**, der Browser zeigt ihn an | Fachanwendungen im Intranet, Java-Teams |',
      '| **Hilla** | Frontend in React oder Lit, Backend in Java mit typisierten Endpunkten | Teams mit Frontend-Know-how |',
      '',
      '### Abwägungen bei Flow',
      '- **Vorteil**: Ein Technologie-Stack, Geschäftslogik und UI in Java, direkter Zugriff auf Backend-Dienste.',
      '- **Nachteil**: Serverseitiger Sitzungszustand kostet Speicher, jede Interaktion braucht eine Verbindung zum Server (Latenz, Skalierung über Sticky Sessions oder Session-Replikation).',
      '',
      '### Sicherheit und Betrieb',
      '- Authentifizierung und Autorisierung lassen sich über **Spring Security** integrieren.',
      '- Die Komponenten basieren auf Web Components und sind barrierefrei ausgelegt, die Bedienung per Tastatur ist vorgesehen.',
      '',
      '### Wann passt es?',
      'Wenn ein Java-Team datenlastige Verwaltungsoberflächen bauen will und wenig eigenes Frontend-Wissen hat. Für öffentliche, stark skalierende Seiten mit viel Interaktivität im Browser ist ein clientseitiger Ansatz oft besser.'
    ),
    sources: [{ label: 'Vaadin Dokumentation', url: 'https://vaadin.com/docs' }]
  },
  native_wc: {
    md: md(
      '### Die vier Standards',
      '| Standard | Zweck |',
      '|---|---|',
      '| **Custom Elements** | eigene HTML-Tags mit Verhalten (`customElements.define`) |',
      '| **Shadow DOM** | gekapseltes DOM und Styling |',
      '| **HTML Templates** | `<template>` und `<slot>` für wiederverwendbare Strukturen |',
      '| **ES-Module** | Auslieferung und Wiederverwendung des Codes |',
      '',
      '### Regeln und Lebenszyklus',
      '- Der Tag-Name muss einen **Bindestrich** enthalten (`mein-button`), damit er nicht mit HTML kollidiert.',
      '- `constructor`: nur Grundzustand setzen, noch nicht auf Attribute oder Kinder zugreifen.',
      '- `connectedCallback` / `disconnectedCallback`: eingefügt bzw. entfernt, hier Listener an- und abmelden.',
      '- `attributeChangedCallback`: reagiert auf Änderungen der in `static get observedAttributes()` aufgelisteten Attribute.',
      '',
      '### Shadow DOM',
      '- `mode: "open"` erlaubt Zugriff von außen über `element.shadowRoot`, `closed` verbirgt ihn (bietet aber keinen echten Sicherheitsschutz).',
      '- Styles von außen wirken nicht hinein. Gezielte Anpassung geht über **CSS Custom Properties**, `::part()` und **Slots**.',
      '- Ereignisse gelangen nur nach außen, wenn sie `composed: true` sind.',
      '',
      '### Formulare und Barrierefreiheit',
      '- Mit `static formAssociated = true` und **ElementInternals** nimmt ein Custom Element an Formularen teil (Wert, Validierung).',
      '- Rollen, Labels und Tastaturbedienung müssen selbst umgesetzt werden (ARIA, `tabindex`, `delegatesFocus`).',
      '',
      '### Serverseitiges Rendering',
      'Mit dem **Declarative Shadow DOM** (`<template shadowrootmode="open">`) lässt sich Shadow DOM schon im ausgelieferten HTML beschreiben.'
    ),
    sources: [{ label: 'MDN: Web Components', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_components' }]
  }
};

export const GUIDE_DEEPDIVES = { ...GUIDE_DEEPDIVES_BASE, ...GUIDE_DEEPDIVES_REST };
