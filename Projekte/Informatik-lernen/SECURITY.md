# 🛡️ Sicherheitspolitik (Security Policy)

Die Sicherheit von **Informatik-lernen (IT-DevGame)** und der Schutz unserer Nutzerinnen und Nutzer haben höchste Priorität.

---

## 🔒 Unterstützte Versionen

| Version | Unterstützt |
| :--- | :--- |
| `3.75.x` | ✅ Ja |
| `< 3.75` | ❌ Nein |

---

## 🚨 Schwachstellen melden

Wenn du eine Sicherheitslücke in dieser Anwendung entdeckst (z. B. Sandbox-Bypasses, XSS, unsichere Abhängigkeiten oder Datenlecks), bitten wir dich, diese verantwortungsvoll offenzulegen (*Responsible Disclosure*).

### Meldekanal:
- Bitte erstelle **kein** öffentliches GitHub-Issue für sensible Sicherheitslücken.
- Nutze stattdessen das GitHub Security Advisory Feature:
  **[Private Vulnerability Reporting](https://github.com/Schengii/Informatik-lernen/security/advisories/new)**
- Alternativ kontaktiere den Maintainer per E-Mail oder GitHub Direct Message.

### Bitte füge deiner Meldung folgende Details bei:
1. Eine genaue Beschreibung der Schwachstelle und deren Auswirkung.
2. Schritte zur Reproduktion (Proof-of-Concept / PoC).
3. Betroffene Module oder Komponenten.
4. Mögliche Lösungsvorschläge, falls vorhanden.

Wir bemühen uns, innerhalb von 48 Stunden auf Sicherheitsberichte zu reagieren und zeitnah einen Fix bereitzustellen.

---

## 🛡️ Sicherheitsarchitektur

1. **Client-Side Sandbox**:
   - Vom Nutzer ausgeführter JavaScript-Code läuft in einem isolierten Web Worker ohne Zugriff auf DOM, LocalStorage, IndexedDB oder externe Netzwerk-Schnittstellen.
   - Ein striktes Ausführungslimit (3 Sekunden) verhindert Endlosschleifen und DoS-Zustände.

2. **Datenschutz & Datenspeicherung**:
   - Sämtliche Spiel- und Lernstände verbleiben lokal auf dem Gerät des Benutzers (LocalStorage & IndexedDB).
   - Es werden keine personenbezogenen Daten an externe Server übertragen.

3. **Abhängigkeiten & Lieferkette**:
   - Automatisierte Sicherheits-Scans über Dependabot.
   - Regelmäßige `npm audit`-Prüfungen und Oxlint-Sicherheitsregeln.
