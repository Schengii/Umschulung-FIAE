# GEMINI.md – Google Gemini & Antigravity Leitfaden

Leitfaden für Google Gemini, Gemini Code Assist und Antigravity bei der Entwicklung von **Wohnungssuche KI**.

---

## 🎯 Fokus & System-Architektur

- **Projekt:** Wohnungssuche KI – Intelligente Aggregation, Bewertung und Bewerbung für Mietwohnungen.
- **Rolle von Gemini:**
  - Multimodale Extraktion von Informationen aus Wohnungsfotos (Zustand, Ausstattung, Lichtverhältnisse, Renovierungsbedarf).
  - Grundriss-Analyse (Zimmeraufteilung, Quadratmeter-Plausibilität).
  - Semantische Suche und Embeddings zur Erkennung von passenden Lagebeschreibungen.
- **Deployment:** Vercel Serverless & Edge API Routen.
- **Mobile Support:** Capacitor Android Wrapper (`frontend/android`).

---

## 🚀 Entwicklungs- & Verifikationsbefehle

Bei Codeänderungen sind immer die folgenden Befehle zur Verifikation auszuführen:

```bash
# Typecheck & Linter
npm run lint

# Build-Test (Validiert Vercel- und Next.js/Vite-Kompatibilität)
npm run build

# Unit- & Integrationstests
npm test

# Prüfung auf versehentlich gestagte Secrets
npm run check-secrets

# Vollständige Prüfung aller getrackten Dateien
npm run check-secrets:all
```

---

## 💡 Best Practices für Gemini & Antigravity

1. **Design & Frontend-Ästhetik:**
   - Hochwertiges, modernes Web-Interface (dunkles/helles Farbschema, saubere Typografie, Dashboard mit Score-Badges).
   - Aussagekräftige Anzeigen-Karten mit Trefferquote (Matching-Score 0-100%), Fotos, Lagekarte und Direkt-Aktions-Buttons (z. B. "Anschreiben kopieren", "Auf Portal öffnen").
2. **Serverless-Architektur:**
   - Stateless Functions auf Vercel nutzen.
   - Zeitaufwändige Hintergrundaufgaben via Vercel Cron-Jobs (`/api/cron/scrape`) abbilden.
   - Rate-Limits bei Immobilienportalen durch strukturierte Delays und User-Agent-Rotation respektieren.
3. **Sicherheit:**
   - Weder Gemini noch andere Agenten dürfen Umgebungsvariablen mit echten Werten in Commits oder Dokumentationen einfügen.
   - Nutze stets Platzhalter (`your_gemini_api_key_here`) in Code-Beispielen.

---

## 📁 Projektstruktur

```text
Wohnungssuche KI/
├── .github/                  # GitHub Actions Workflows & Templates
├── .githooks/                # Git Pre-Commit Hook für Secret-Schutz
├── scripts/                  # Sicherheits- und Hilfsskripte
├── frontend/                 # Frontend- und Mobile-Applikation
│   ├── android/              # Capacitor Android Native Projekt
│   └── node_modules/         # Lokale Abhängigkeiten (von Git ignoriert)
├── CLAUDE.md                 # Richtlinien für Anthropic Claude
├── GEMINI.md                 # Richtlinien für Google Gemini & Antigravity
├── AGENTS.md                 # Übergreifende KI-Agenten Richtlinien
├── CHANGELOG.md              # Revisions- und Änderungshistorie
├── .env                      # Lokale Konfiguration (niemals committen!)
├── .env.example              # Dokumentierte Vorlage für Konfiguration
├── .claudeignore             # Token-Schutz für Claude
├── .geminiignore             # Index-Schutz für Gemini
├── .editorconfig             # Editor-Formatierungsregeln
├── .gitattributes            # LF-Normalisierung
├── vercel.json               # Vercel Deployment- und Sicherheits-Header
└── package.json              # Root NPM Manifest & Skripte
```
