// @vitest-environment jsdom
//
// Routing-Integrationstest für App.jsx: rendert die komplette App (Navbar,
// ModalContainer, PomodoroTimer, ...) einmal pro bekanntem `activeTab`-Wert
// und prüft, dass jeder Pfad ohne unbehandelten Laufzeitfehler durchläuft.
//
// Ergänzt `allLabsSmoke.test.jsx` (rendert jede Content-Komponente ISOLIERT
// mit generischen No-Op-Props) um die eine Sache, die dieser Test NICHT
// abdeckt: dass App.jsx das Lab-Routing (`activeLabElement` + Lab-Registry)
// korrekt verdrahtet - richtige Komponente pro Tab-ID, keine verwaisten
// Tab-IDs. Die Verdrahtung wurde zweimal mechanisch umgebaut (Einzelblöcke ->
// Switch-Tabelle -> `src/data/labRegistry.js`); dieser Test ist das
// Sicherheitsnetz dafür UND für jede zukünftige Änderung.
//
// Die Tab-ID-Liste wird aus dem App.jsx-Quelltext und der Registry abgeleitet
// (statt hier hartkodiert zu werden), damit der Test automatisch mitwächst.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';
import { LAB_REGISTRY } from './data/labRegistry';

afterEach(() => {
  cleanup();
});

// Pfad relativ zum Projekt-Root (vitest führt Tests von dort aus) statt über
// import.meta.url aufzulösen - letzteres liefert unter Vites Transform keine
// verlässliche file://-URL für fileURLToPath().
// Reine Kommentarzeilen werden entfernt: dort steht `activeTab === 'x'` nur
// als Platzhalter-Beispiel und ist kein echter Tab.
const appSource = readFileSync(join(process.cwd(), 'src', 'App.jsx'), 'utf8')
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('//'))
  .join('\n');
const allTabIds = [...new Set([
  ...[...appSource.matchAll(/activeTab === '([\w]+)'/g)].map((m) => m[1]),
  // Die meisten Labs werden über die zentrale Registry geroutet
  ...LAB_REGISTRY.flatMap((entry) => entry.tabs)
])];

describe('App.jsx Routing: jeder bekannte Tab lädt ohne unbehandelten Fehler', () => {
  it('hat Tab-IDs aus dem Quelltext extrahiert (Regex-Extraktion funktioniert)', () => {
    expect(allTabIds.length).toBeGreaterThan(150);
  });

  const failures = [];

  for (const tabId of allTabIds) {
    it(`rendert /${tabId} ohne unbehandelten Laufzeitfehler`, async () => {
      const consoleErrors = [];
      const spy = vi.spyOn(console, 'error').mockImplementation((...args) => {
        consoleErrors.push(args.map(String).join(' '));
      });

      try {
        const { unmount } = render(
          <MemoryRouter initialEntries={[`/${tabId}`]}>
            <App />
          </MemoryRouter>
        );

        // Auf das Auflösen aller React.lazy()-Suspense-Grenzen warten, statt
        // eine feste Zeit zu schlafen.
        await vi.waitFor(() => {
          expect(screen.queryByText(/Modul wird geladen/i)).toBeNull();
        }, { timeout: 15000 });

        // Die ErrorBoundary-Fallback-UI darf für keinen bekannten Tab greifen.
        expect(screen.queryByText(/Dieses Modul ist abgestürzt/i)).toBeNull();

        // Ebenso wenig die 404-Ansicht: sie würde bedeuten, dass ein im
        // Quelltext referenzierter Tab weder in der Lab-Tabelle noch in
        // STANDALONE_TABS verdrahtet ist.
        expect(screen.queryByText(/Seite nicht gefunden/i)).toBeNull();

        unmount();
      } catch (error) {
        failures.push({ tabId, error });
        throw error;
      } finally {
        spy.mockRestore();
      }
    }, 25000);
  }

  it.each(['/gibt_es_nicht', '/labs/unterseite'])('zeigt für die unbekannte URL %s die 404-Ansicht', (path) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    );

    const heading = screen.getByRole('heading', { name: /Seite nicht gefunden/i });
    expect(screen.getByText(path)).toBeTruthy();
    // Auf die 404-Ansicht eingrenzen: auch das Logo in der Navbar heißt
    // "Zum Dashboard".
    const notFoundView = within(heading.closest('.glass-panel'));
    expect(notFoundView.getByRole('button', { name: /Zum Dashboard/i })).toBeTruthy();
  });

  it('Zusammenfassung: keine Route ist abgestürzt', () => {
    if (failures.length > 0) {
      const summary = failures.map((f) => `- /${f.tabId}: ${f.error.message}`).join('\n');
      throw new Error(`${failures.length} Route(n) sind abgestürzt:\n${summary}`);
    }
    expect(failures.length).toBe(0);
  });
});
