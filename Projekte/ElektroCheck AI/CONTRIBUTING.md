# Beitragsrichtlinien (Contributing Guide)

Vielen Dank für dein Interesse an **ElektroCheck AI**! Dieses Dokument beschreibt die Best Practices für die Zusammenarbeit zwischen Entwicklern, KI-Assistenten (wie Claude Code) und Plattformen wie GitHub und Vercel.

---

## 1. Lokale Entwicklungsumgebung einrichten

### Voraussetzungen
- **Node.js**: Version 22.x (LTS)
- **NPM**: Version 10+
- **Git**

### Installation
Das Projekt besteht aus Frontend (Root) und dem lokalen Backend-Adapter (`backend/`):

```bash
# 1. Abhängigkeiten installieren
npm ci
cd backend && npm ci && cd ..

# 2. Umgebungsvariablen vorbereiten
cp .env.example .env
# Öffne .env und trage mindestens deinen GEMINI_API_KEY ein.
```

### Server starten
```bash
# Startet Frontend (Vite auf http://localhost:5173) und Backend (Express auf http://localhost:3000) parallel
npm run dev
```

---

## 2. Architektur & Entwicklungsregeln

### Fachlogik gehört ausschließlich nach `api/`!
- Alle serverseitigen Funktionen, Validierungen (AJV-Schemas), Prompts und Endpunkte werden in `api/` implementiert (Vercel Serverless Functions).
- Die Datei `backend/index.js` dient **ausschließlich** als lokaler Express-Adapter für Entwicklung, Docker und Tests.
- **Wichtig**: Wenn ein neuer Endpunkt erstellt wird:
  1. Lege ihn in `api/` an (z. B. unter `api/gemini/` oder als Teil bestehender Dispatcher).
  2. Binde ihn in `backend/index.js` ein.
  3. Prüfe `vercel.json` auf korrekte Routen-Konfiguration.

### Vercel Serverless Function Limit (Max. 12)
- Im Vercel Hobby-Tarif dürfen maximal **12 Serverless Functions** gleichzeitig deployed werden.
- Jede `.js`-Datei direkt in `api/` (außerhalb von `_lib/`) zählt als separate Function.
- **Regel**: Erstelle keine unnötigen neuen Dateien in `api/`. Nutze stattdessen dynamische Routen (wie `api/auth/[action].js` oder `api/tickets/[id].js`).

### Schutz von Geheimnissen
- Committe **niemals** API-Keys, Passwörter oder Token in Git.
- Alle sensiblen Variablen gehören in die `.env` (lokal) oder in die Vercel Project Settings ("Environment Variables").
- Nutze `.env.example` als Vorlage für neue Konfigurationsvariablen.

---

## 3. Qualitätssicherung & Tests vor jedem Commit

Bevor Code gepusht oder ein Pull Request gestellt wird, müssen alle automatisierten Checks fehlerfrei durchlaufen:

```bash
# 1. Secret- & .env-Scanner (wird im Pre-Commit-Hook automatisch erzwungen)
npm run check:secrets

# 2. Linting (Strikte 0-Warnungen-Regel)
npm run lint

# 3. TypeScript-Typisierung & Build prüfen
npm run build

# 4. Alle Tests ausführen (Frontend Vitest + Backend Supertest)
npm run test

# 5. Browser-Smoke-Test (Playwright)
npm run test:e2e
```

---

## 4. Git & Commit-Konventionen

Wir folgen der [Conventional Commits](https://www.conventionalcommits.org/)-Spezifikation:

- `feat:` Ein neues Feature (z. B. `feat: bluetooth export für multimeter messwerte`)
- `fix:` Eine Fehlerbehebung (z. B. `fix: nullpointer bei fehlendem typenschild ocr`)
- `docs:` Dokumentationsanpassungen (z. B. `docs: update vercel deployment guide`)
- `test:` Hinzufügen oder Anpassen von Tests
- `refactor:` Code-Bereinigungen ohne Verhaltensänderung
- `chore:` Dependency-Updates, Build-Skripte oder CI-Anpassungen

### CHANGELOG pflegen
Bei benutzerrelevanten Änderungen bitte die `CHANGELOG.md` im Abschnitt `[Unreleased]` ergänzen.

---

## 5. Deployment auf Vercel

1. Das Deployment erfolgt automatisch bei jedem Push auf `main` über die GitHub-Vercel-Integration.
2. Für Feature-Branches erstellt Vercel automatisch eine **Preview-URL**.
3. Stelle sicher, dass alle erforderlichen Umgebungsvariablen (`GEMINI_API_KEY`, `APP_URL`, `UPSTASH_REDIS_REST_*` etc.) im Vercel Dashboard unter **Settings > Environment Variables** hinterlegt sind.
