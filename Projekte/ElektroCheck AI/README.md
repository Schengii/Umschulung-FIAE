# elektroCheck-ai

Kurzanleitung zum lokalen Entwickeln und zum Backend-Proxy

Wichtige Hinweise:
- API-Keys dürfen niemals im Frontend liegen. Setze GEMINI_API_KEY und PERPLEXITY_API_KEY nur im Backend (.env) und in CI secrets.
- Für optionales persistentes Rate-Limiting kannst du REDIS_URL setzen (z.B. redis://user:pass@host:6379).

Erste Schritte:
1. Root-Dependencies installieren: `npm ci`
2. Backend-Dependencies installieren: `cd backend && npm ci`
3. Kopiere `backend/.env.template` zu `backend/.env` und fülle GEMINI_API_KEY etc. aus.
4. Backend starten (dev): `npm run start-backend` oder `cd backend && npm start`

CI/Hooks:
- Nach dem ersten `npm ci` lokal: `npm run prepare` um husky-Hooks zu installieren.

Tests:
- Backend-Tests (Vitest + Supertest) laufen mit `cd backend && npm test`.

Sicherheit:
- In Produktion: setze REDIS_URL für Rate-Limiter, sichere CORS-Einstellungen und überwache Logs.
