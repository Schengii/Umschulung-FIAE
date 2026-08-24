export const ORAL_EXAM_DATA = {
  ae: {
    title: 'Fachinformatiker für Anwendungsentwicklung (FIAE)',
    projects: [
      {
        id: 'p_web_api',
        title: 'Entwicklung einer REST-API mit JWT-Authentifizierung & React Frontend',
        context: 'Betriebliches Projekt über 80 Stunden zur Modernisierung des internen Kundenportals.'
      },
      {
        id: 'p_microservice',
        title: 'Konzeption & Implementierung eines Microservice für automatische Rechnungsstellung',
        context: 'Event-driven Architektur mit RabbitMQ/Kafka, PostgreSQL und Docker.'
      }
    ],
    questions: [
      {
        id: 'q1',
        examiner: 'Dr. Architekt (Technischer Fokus)',
        avatar: '👨‍💼',
        question: 'Warum haben Sie sich in Ihrem Projekt für eine relationale Datenbank (z.B. PostgreSQL) anstelle einer NoSQL-Dokumentendatenbank entschieden?',
        options: [
          {
            text: 'Wegen ACID-Transaktionssicherheit, strikter Schemavalidierung und klarer relationaler Verknüpfungen (1:n, n:m) zwischen Kunden und Aufträgen.',
            isCorrect: true,
            feedback: 'Exzellente Antwort! Die IHK-Prüfer legen großen Wert auf die fachliche Begründung von Entwurfsentscheidungen (ACID, Konsistenz).'
          },
          {
            text: 'Weil PostgreSQL moderner ist als alle NoSQL-Datenbanken und immer schneller arbeitet.',
            isCorrect: false,
            feedback: 'Falsch. PostgreSQL ist nicht per se "schneller" oder "moderner". Es kommt auf das Datenmodell und den Use Case an.'
          },
          {
            text: 'Weil mein Ausbilder mir das so vorgegeben hat und keine Alternativen erlaubt waren.',
            isCorrect: false,
            feedback: 'Kritisch im Fachgespräch! Als Fachinformatiker musst du eigene Entscheidungen anhand von Bewertungsmatrizen (Nutzwertanalyse) begründen.'
          }
        ]
      },
      {
        id: 'q2',
        examiner: 'Frau Wirtschaft (Kaufmännischer Fokus)',
        avatar: '👩‍💼',
        question: 'Wie haben Sie die Wirtschaftlichkeit Ihres Projekts nachgewiesen und welche Kennzahlen haben Sie genutzt?',
        options: [
          {
            text: 'Über eine Gegenüberstellung der Projektkosten (Entwicklerstunden, Lizenzen) und des erwarteten Nutzens mit Berechnung der Amortisationsdauer (ROI).',
            isCorrect: true,
            feedback: 'Perfekt! Amortisationsrechnung und ROI sind essenzielle IHK-Standardthemen für die Projektarbeit.'
          },
          {
            text: 'Wirtschaftlichkeit war nicht relevant, da es sich um ein reines internes Software-Upgrade handelte.',
            isCorrect: false,
            feedback: 'Falsch. Jedes IHK-Abschlussprojekt benötigt zwingend eine kaufmännische Betrachtung.'
          },
          {
            text: 'Ich habe geschätzt, dass die neue Software viel Geld einsparen wird.',
            isCorrect: false,
            feedback: 'Zu unpräzise. Die Prüfer fordern konkrete Stundensätze und Amortisationszeiträume.'
          }
        ]
      },
      {
        id: 'q3',
        examiner: 'Herr Security (Datenschutz & Sicherheit)',
        avatar: '🛡️',
        question: 'Wie schützen Sie die REST-Schnittstellen gegen Man-in-the-Middle-Angriffe und unautorisierten Zugriff?',
        options: [
          {
            text: 'Durchgängiges HTTPS (TLS 1.3), JSON Web Tokens (JWT) mit kurzer Lebensdauer im HttpOnly/Secure-Cookie und Rate Limiting.',
            isCorrect: true,
            feedback: 'Sehr gut! Das demonstriert fundiertes Wissen über moderne Sicherheitsarchitektur.'
          },
          {
            text: 'Ich speichere das Passwort des Nutzers unverschlüsselt im LocalStorage der React-App.',
            isCorrect: false,
            feedback: 'Sicherheits-Albtraum! XSS-Angriffe könnten Passwörter sofort kompromittieren.'
          },
          {
            text: 'Passwörter werden mit Base64 verschlüsselt übertragen.',
            isCorrect: false,
            feedback: 'Falsch. Base64 ist kein Verschlüsselungsalgorithmus, sondern lediglich ein Encoding!'
          }
        ]
      },
      {
        id: 'q4',
        examiner: 'Dr. Architekt (Test & QA)',
        avatar: '👨‍💼',
        question: 'Wie haben Sie die Qualität Ihrer Software während der Entwicklung sichergestellt?',
        options: [
          {
            text: 'Durch eine Testpyramide aus Unit Tests (hohe Abdeckung der Business-Logik), Integrations-Tests für API-Endpunkte und automatisierte CI-Pipelines.',
            isCorrect: true,
            feedback: 'Hervorragend! Die Testpyramide und CI/CD sind absolute Lieblingsthemen der IHK-Prüfer.'
          },
          {
            text: 'Ich habe am letzten Tag die Anwendung einmal im Browser manuell durchgeklickt.',
            isCorrect: false,
            feedback: 'Mangelhaft. Manuelles Ad-hoc-Testen reicht für eine professionelle Abschlussprüfung nicht aus.'
          }
        ]
      },
      {
        id: 'q4_fiae_sec',
        examiner: 'Prof. Cyber (IT-Sicherheitsprüfer)',
        avatar: '🛡️',
        question: 'Wie schützen Sie Ihre REST-API vor Cross-Site Request Forgery (CSRF) und Cross-Origin Resource Sharing (CORS) Fehlkonfigurationen?',
        options: [
          {
            text: 'Durch SameSite=Strict / Lax Cookies oder Zustandslosigkeit mit JWT im Authorization-Header (Bearer) sowie eine restriktive CORS-Whitelist für erlaubte Origins.',
            isCorrect: true,
            feedback: 'Brillant! Das Verstehen von CORS (Browser-Sicherheitsmechanismus) und JWT-Token-Headern zeigt fundierte Praxiskompetenz.'
          },
          {
            text: 'Indem wir Access-Control-Allow-Origin: * für alle Endpunkte setzen, damit jede Web-App zugreifen darf.',
            isCorrect: false,
            feedback: 'Gefährliche Sicherheitslücke! Ein Wildcard-Origin (*) hebelt den CORS-Schutz für vertrauliche Endpunkte aus.'
          }
        ]
      }
    ]
  },
  fisi: {
    title: 'Fachinformatiker für Systemintegration (FISI)',
    projects: [
      {
        id: 'p_k8s_infra',
        title: 'Aufbau einer hochverfügbaren Kubernetes-Cluster-Infrastruktur mit Backup-Strategie',
        context: 'Betriebliches Projekt über 40 Stunden zur Migration von Bare-Metal auf Cloud-Native.'
      },
      {
        id: 'p_firewall_vpn',
        title: 'Implementierung einer Next-Gen Firewall & Site-to-Site VPN Anbindung',
        context: 'Standortvernetzung mit redundanten Leitungen und Zero Trust Zugriffskonzept.'
      }
    ],
    questions: [
      {
        id: 'q_fisi_1',
        examiner: 'Herr Netzwerk (Infrastruktur-Fokus)',
        avatar: '🌐',
        question: 'Wie haben Sie die Hochverfügbarkeit in Ihrem Netzwerk- oder Serversystem sichergestellt und wie lautet Ihr RTO / RPO?',
        options: [
          {
            text: 'Durch redundante Hardware (N+1), automatisches Failover (VRRP/Keepalived) und definierte RTO (z.B. < 15 Min) sowie RPO (< 1 Std) im Desaster-Recovery-Plan.',
            isCorrect: true,
            feedback: 'Erstklassig! RTO (Recovery Time Objective) und RPO (Recovery Point Objective) sind IHK-Standardbegriffe.'
          },
          {
            text: 'RTO und RPO sind nur für Anwendungsentwickler relevant, nicht für Systemintegratoren.',
            isCorrect: false,
            feedback: 'Falsch. Disaster Recovery und Verfügbarkeit sind Kernaufgaben des FISI.'
          }
        ]
      },
      {
        id: 'q_fisi_2',
        examiner: 'Frau Datenschutz (DSGVO & Compliance)',
        avatar: '📋',
        question: 'Welche technischen und organisatorischen Maßnahmen (TOMs) nach Art. 32 DSGVO haben Sie umgesetzt?',
        options: [
          {
            text: 'Zutritts-, Zugangs- und Zugriffskontrolle (Rollen/Rechte-Matrix), Festplattenverschlüsselung (LUKS/BitLocker), 2-Faktor-Authentifizierung und Protokollierung.',
            isCorrect: true,
            feedback: 'Exzellente Antwort. TOMs gehören zur Pflicht in jedem Prüfungsgespräch.'
          },
          {
            text: 'Wir haben einen Virenscanner installiert, das reicht für die DSGVO völlig aus.',
            isCorrect: false,
            feedback: 'Ungenügend. Die DSGVO verlangt ein ganzheitliches Sicherheitskonzept.'
          }
        ]
      },
      {
        id: 'q_fisi_3_vpn',
        examiner: 'Herr SysAdmin (Protokolle & Routing)',
        avatar: '⚙️',
        question: 'Warum haben Sie sich für WireGuard oder IPsec zur Standortvernetzung entschieden und wo liegen die Vor- und Nachteile?',
        options: [
          {
            text: 'IPsec bietet standardisierte Kompatibilität mit Enterprise-Routern, während WireGuard durch moderne Kryptographie (ChaCha20), schlanken Code (ca. 4.000 Zeilen) und höheren Durchsatz überzeugt.',
            isCorrect: true,
            feedback: 'Hervorragende Differenzierung! Code-Komplexität und Kryptographie-Effizienz sind starke Argumente im Fachgespräch.'
          },
          {
            text: 'WireGuard ist unsicher, weil es keine Passwörter unterstützt.',
            isCorrect: false,
            feedback: 'Falsch. WireGuard nutzt moderne Public-Key-Kryptographie (Noise Protocol Framework).'
          }
        ]
      }
    ]
  }
};
