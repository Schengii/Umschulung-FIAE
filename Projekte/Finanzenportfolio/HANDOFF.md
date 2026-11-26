# Handoff (Stand 2026-11-24)

## Ziel
FinanzPortfolio CoPilot härten: Sicherheit, Steuerlogik, Qualität. Roadmap steht in der Vault-Notiz `01 Projects/Finanzenportfolio/Finanzenportfolio - Übersicht.md`.

## Erledigt
- PR #32 (`feat/security-tax-lint`, Base main): Tresor PBKDF2 600k mit Migration, kein Klartext-Backup, `secureStore.ts`; eigener Kurs-Proxy `api/yahoo.ts` statt corsproxy.io; Fix Verlustverrechnung und Kirchensteuer; Biome-Lint.
- PR #33 (`feat/tax-logic`, Base #32): Verlusttöpfe aus FIFO, DACH-Teilfreistellung, Brutto-Dividenden, Krypto § 23 mit Freigrenze, Vorabpauschale monatsanteilig.
- PR #34 (`feat/security-hardening`, Base #33): Passkey über WebAuthn-PRF, Recovery-Key (`recoveryKey.ts`), CSP (`csp.ts`), Webhook nur verschlüsselt, `npm audit` in der CI.
- Stand: Lint, Build und 188 Tests grün. Nichts gemerged.

## Entscheidungen
- Biome statt ESLint, weil typescript-eslint TypeScript 7 nicht unterstützt. `npm run lint` bricht nur bei Fehlern ab; `npm run lint:warnings` zeigt ca. 670 Warnungen als Baseline.
- PRs sind gestapelt (#34 auf #33 auf #32). Nach jedem Merge den Base-Branch des nächsten auf main umstellen.
- CSP mit `connect-src https:`, weil WebDAV- und Webhook-Ziele nutzerdefiniert sind.
- Alte Passkey-Registrierungen werden verworfen, Passkey muss neu eingerichtet werden.
- Python fehlt auf dem Rechner; Skripte als Node-Datei in den Scratchpad schreiben (lange Heredocs in Bash brechen).

## Offene Punkte
- Manuell prüfen: CSP auf Vercel-Preview (OCR, PDF, Kurse, WebDAV, Webhook), Passkey auf echter Hardware, Tresor-Migration mit bestehendem Tresor.
- GitHub Pages hat keine Functions: `VITE_MARKET_PROXY_URL` auf eigenen Proxy setzen.
- Google Fonts selbst hosten (IP-Leak), `xlsx` weiter beobachten.
- Biome-Warnungen abbauen, zuerst 19 Hook-Dependency-Warnungen, dann `any`.
- Code-Splitting (tesseract, pdfjs, xlsx), große Dateien aufteilen, Dubletten-Erkennung, Corporate Actions, EZB-Tageskurse, Accessibility, i18n.

## Nächster Schritt
PRs #32 bis #34 mergen. Danach `src/context/PortfolioContext.tsx` aufteilen (State, Tresor, Marktdaten) und Hook-Warnungen mit `npm run lint:warnings` beheben.
