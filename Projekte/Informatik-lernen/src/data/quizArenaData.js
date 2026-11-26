import { QUIZ_ARENA_THEORIE } from './quizArenaDataTheorie';

export const QUIZ_ARENA_CATEGORIES = [
  {
    id: 'ai_trends',
    title: '🤖 KI & LLM Trends 2026',
    difficulty: 'Senior / Expert',
    questions: [
      {
        q: 'Was bewirkt RAG (Retrieval-Augmented Generation) bei KI-Sprachmodellen?',
        options: [
          'Es beschleunigt die Grafikkarte beim Training.',
          'Es durchsucht externe Datenbanken nach Fakten, um Halluzinationen zu verhindern.',
          'Es löscht den Speicher des Sprachmodells.',
          'Es übersetzt Python-Code automatisch in C++.'
        ],
        correct: 1,
        explanation: 'RAG holt relevante Dokumente aus Vektordatenbanken und übergibt sie als Kontext an das LLM.'
      },
      {
        q: 'Was zeichnet ein "AI Agent" System aus?',
        options: [
          'Es kann selbstständig Ziele planen, Werkzeuge (Tools/APIs) nutzen und Aufgaben ausführen.',
          'Es antwortet nur mit Ja oder Nein.',
          'Es benötigt keine Grafikkarte.',
          'Es speichert Daten nur im Arbeitsspeicher.'
        ],
        correct: 0,
        explanation: 'AI Agenten nutzen LLMs als Gehirn, um autonom Schleifen zu planen und externe APIs aufzurufen.'
      },
      {
        q: 'Was ist Prompt Injection?',
        options: [
          'Das Einspeisen von Code in einen Compiler',
          'Ein Angriff, bei dem Eingaben oder Inhalte das Verhalten eines Sprachmodells entgegen der Vorgaben steuern',
          'Eine Methode, Prompts zu komprimieren',
          'Ein Verfahren zum Training von Modellen'
        ],
        correct: 1,
        explanation: 'Prompt Injection steht in der OWASP-Liste der Risiken für LLM-Anwendungen. Gegenmaßnahmen sind Rechtebegrenzung, Filter und das Trennen von Anweisung und Daten.'
      },
      {
        q: 'Was versteht man bei Sprachmodellen unter Halluzination?',
        options: [
          'Die Fähigkeit, Bilder zu erzeugen',
          'Überzeugend klingende, aber erfundene oder falsche Aussagen',
          'Das Verlangsamen der Antwort',
          'Die Kompression des Modells'
        ],
        correct: 1,
        explanation: 'Modelle erzeugen wahrscheinlich klingenden Text, nicht geprüfte Fakten. Quellenprüfung und RAG verringern das Risiko.'
      },
      {
        q: 'Warum sollten personenbezogene Daten nicht ungeprüft in öffentliche KI-Dienste eingegeben werden?',
        options: [
          'Weil KI-Dienste keine Texte verarbeiten',
          'Weil dies Datenschutzpflichten (DSGVO) verletzen kann, etwa ohne Rechtsgrundlage und Auftragsverarbeitung',
          'Weil die Dienste dann langsamer werden',
          'Es gibt dagegen keine Bedenken'
        ],
        correct: 1,
        explanation: 'Eingaben verlassen die Organisation. Man braucht Rechtsgrundlage, Vertrag zur Auftragsverarbeitung und klare Regeln für den KI-Einsatz.'
      },
      {
        q: 'Wofür werden Vektordatenbanken bei RAG genutzt?',
        options: [
          'Zum Speichern von Passwörtern',
          'Zum Finden semantisch ähnlicher Textabschnitte über Embeddings',
          'Zur Verschlüsselung von Prompts',
          'Zum Komprimieren von Bildern'
        ],
        correct: 1,
        explanation: 'Texte werden als Vektoren (Embeddings) gespeichert. Eine Suche nach ähnlichen Vektoren liefert passende Kontexte für das Modell.'
      }
    ]
  },
  {
    id: 'cloud_devops',
    title: '☁️ Cloud, Kubernetes & DevOps',
    difficulty: 'Azubi & Senior',
    questions: [
      {
        q: 'Welche Aufgabe erfüllt Kubernetes (K8s)?',
        options: [
          'Es ist eine Datenbank für SQL.',
          'Es ist ein Bildbearbeitungsprogramm.',
          'Es ist ein System zur automatisierten Orchestrierung und Skalierung von Docker-Containern.',
          'Es ist eine Programmiersprache.'
        ],
        correct: 2,
        explanation: 'Kubernetes steuert die Bereitstellung, Skalierung und Verwaltung von Container-Anwendungen.'
      },
      {
        q: 'Was ist ein Container-Image?',
        options: [
          'Eine laufende virtuelle Maschine',
          'Eine unveränderliche Vorlage aus Schichten, aus der Container gestartet werden',
          'Ein Backup der Festplatte',
          'Ein Foto der Oberfläche'
        ],
        correct: 1,
        explanation: 'Aus einem Image startet man beliebig viele Container. Images werden in einer Registry abgelegt.'
      },
      {
        q: 'Wie unterscheiden sich Container von virtuellen Maschinen?',
        options: [
          'Container bringen ein eigenes Betriebssystem mit Kernel mit',
          'Container teilen sich den Kernel des Hosts und sind dadurch leichter und schneller gestartet',
          'Container sind immer sicherer',
          'Es gibt keinen Unterschied'
        ],
        correct: 1,
        explanation: 'Dafür ist die Isolation schwächer: Eine Kernel-Schwachstelle betrifft alle Container auf dem Host.'
      },
      {
        q: 'Was ist ein Pod in Kubernetes?',
        options: [
          'Ein physischer Server',
          'Die kleinste Einheit mit einem oder mehreren Containern und gemeinsamer IP',
          'Ein Datenbanktyp',
          'Ein Netzwerkkabel'
        ],
        correct: 1,
        explanation: 'Deployments halten die gewünschte Zahl gleicher Pods, Services geben ihnen eine stabile Adresse.'
      },
      {
        q: 'Was bedeutet Infrastructure as Code?',
        options: [
          'Infrastruktur wird in Dateien beschrieben und versioniert, statt per Klick eingerichtet',
          'Code wird auf Papier archiviert',
          'Server werden nur in der Cloud betrieben',
          'Programmierer verwalten keine Server'
        ],
        correct: 0,
        explanation: 'Das macht Infrastruktur wiederholbar, prüfbar und dokumentiert, etwa mit Terraform oder Ansible.'
      }
    ]
  },
  {
    id: 'ihk_basics',
    title: '🌱 Informatik Grundwissen & IHK Basics',
    difficulty: 'Einsteiger & Azubis',
    questions: [
      {
        q: 'Was ist der Unterschied zwischen RAM und SSD?',
        options: [
          'RAM speichert Daten dauerhaft, SSD ist flüchtig.',
          'RAM ist der flüchtige schnelle Arbeitsspeicher, SSD speichert Daten dauerhaft.',
          'Beide Speicher sind identisch.',
          'SSD ist langsamer als ein USB-Stick.'
        ],
        correct: 1,
        explanation: 'RAM verliert beim Ausschalten alle Daten, während eine SSD Daten dauerhaft sichert.'
      },
      {
        q: 'Wie viele Bit hat ein Byte?',
        options: [
          '4',
          '8',
          '16',
          '10'
        ],
        correct: 1,
        explanation: 'Ein Byte besteht aus 8 Bit. Deshalb teilt man Datenraten in Bit pro Sekunde durch 8, um MB/s zu erhalten.'
      },
      {
        q: 'Was macht ein DHCP-Server?',
        options: [
          'Er übersetzt Namen in IP-Adressen',
          'Er vergibt IP-Adressen und weitere Netzwerkeinstellungen automatisch',
          'Er filtert Viren',
          'Er speichert Webseiten'
        ],
        correct: 1,
        explanation: 'DNS übersetzt Namen. DHCP verteilt Adresse, Maske, Gateway und DNS-Server per Lease.'
      },
      {
        q: 'Welches Schutzziel verletzt ein Ransomware-Angriff hauptsächlich?',
        options: [
          'Nur die Vertraulichkeit',
          'Die Verfügbarkeit (und Integrität) der Daten',
          'Keines',
          'Nur die Authentizität'
        ],
        correct: 1,
        explanation: 'Verschlüsselte Daten sind nicht mehr nutzbar. Offline-Backups sind die wichtigste Gegenmaßnahme.'
      },
      {
        q: 'Welches RAID-Level spiegelt Daten auf zwei Platten?',
        options: [
          'RAID 0',
          'RAID 1',
          'RAID 5',
          'RAID 6'
        ],
        correct: 1,
        explanation: 'RAID 0 stript ohne Redundanz. RAID 1 spiegelt, nutzbar sind 50 %. RAID ersetzt kein Backup.'
      }
    ]
  },
  ...QUIZ_ARENA_THEORIE
];
