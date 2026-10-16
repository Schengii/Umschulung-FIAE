# GEMINI.md – Anweisungen & Projektkontext für Google Gemini / Antigravity

Projekt: **Amazon 2.0 – Moderner Premium Online-Shop**

---

## 🎯 Projektziel & Philosophie
Amazon 2.0 ist ein extrem reaktionsschnelles E-Commerce-Erlebnis, aufgebaut ohne schwerfällige Frontend-Frameworks wie React oder Angular. Es demonstriert maximale Performance mit nativem TypeScript, Vite und modularem CSS.

---

## 🛠️ Tech-Stack & Richtlinien
- **Bundler**: Vite 8+
- **Sprache**: TypeScript (~6.0, `erasableSyntaxOnly`, `bundler` resolution)
- **Styling**: Reines Vanilla CSS mit CSS Custom Properties (`--color-*`, `--glass-*`).
- **Tests**: Vitest mit über 120 isolierten Unit-Tests.
- **Hosting / Deployment**: Vercel (konfiguriert via `vercel.json`).
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`).

---

## 🚦 Qualitäts- und Verifikations-Checkliste
Vor dem Committen oder Vorschlagen von Änderungen:
1. `npm run test`: Alle Vitest-Tests müssen grün bleiben.
2. `npm run build`: `tsc && vite build` muss ohne Type- oder Bundling-Fehler durchlaufen.
3. Code-Dokumentation intakt halten: Bestehende Kommentare und Docstrings beibehalten.
4. Deutsche Lokalisierung für Endnutzer-Texte beibehalten.
5. Pre-Commit Hook & Secret-Check: Der aktive Hook (`.githooks/pre-commit` & `scripts/pre-commit-check.mjs`) blockiert ungeschützte `.env`-Dateien und API-Keys (Claude, OpenAI, Google Gemini, AWS, Stripe, etc.). Änderungen vorab mit `npm run check:secrets` überprüfen.

