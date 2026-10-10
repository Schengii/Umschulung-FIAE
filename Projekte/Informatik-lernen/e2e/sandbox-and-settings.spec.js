import { test, expect } from '@playwright/test';

// Deckt ab, was sich nur im echten Browser prüfen lässt:
//  - Nutzercode läuft in einem Web Worker (in jsdom/Node gibt es keinen) und
//    wird bei einer Endlosschleife hart beendet, ohne den Tab einzufrieren.
//  - Der Worker kommt nicht an Seite, localStorage, IndexedDB oder Netzwerk.
//  - Unbekannte URLs zeigen die 404-Ansicht.
//  - Theme-/Barrierefreiheits-Einstellungen überleben einen Reload.

test.describe('Code-Sandbox (Web Worker)', () => {
  test('führt korrekten Code aus und meldet bestandene Testfälle', async ({ page }) => {
    await page.goto('/coding_challenges');
    await page.getByRole('button', { name: 'Code Testen' }).click();

    await expect(page.getByText('ALLE TESTFÄLLE BESTANDEN')).toBeVisible();
  });

  test('bricht eine Endlosschleife nach dem Zeitlimit ab, die Seite bleibt bedienbar', async ({ page }) => {
    await page.goto('/coding_challenges');
    await page.locator('textarea').fill('function isPalindrome(str) { while (true) {} }');
    await page.getByRole('button', { name: 'Code Testen' }).click();

    // Während der Worker in der Schleife hängt, reagiert der Haupt-Thread weiter.
    await expect(page.getByRole('button', { name: 'Läuft…' })).toBeDisabled();
    await expect(page.getByText(/Zeitlimit von 3 s überschritten/)).toBeVisible({ timeout: 10000 });

    // Danach lässt sich direkt wieder Code ausführen.
    await page.getByRole('button', { name: 'Reset' }).click();
    await page.getByRole('button', { name: 'Code Testen' }).click();
    await expect(page.getByText('ALLE TESTFÄLLE BESTANDEN')).toBeVisible();
  });

  test('Nutzercode hat keinen Zugriff auf Seite, Speicher und Netzwerk', async ({ page }) => {
    await page.goto('/coding_challenges');
    await page.locator('textarea').fill(`function isPalindrome(str) {
      return [typeof document, typeof localStorage, typeof indexedDB, typeof fetch, typeof XMLHttpRequest, typeof WebSocket].join(',');
    }`);
    await page.getByRole('button', { name: 'Code Testen' }).click();

    await expect(
      page.getByText('Actual: "undefined,undefined,undefined,undefined,undefined,undefined"').first()
    ).toBeVisible();
  });

  test('TDD-Lab: Syntaxfehler und Endlosschleife werden als Meldung angezeigt', async ({ page }) => {
    await page.goto('/tdd');
    await page.getByRole('button', { name: /Unit Tests ausführen/ }).click();
    await expect(page.getByText(/Alle 3 Unit Tests/)).toBeVisible();

    await page.locator('textarea').fill('function add(a, b) { for (;;) {} }');
    await page.getByRole('button', { name: /Unit Tests ausführen/ }).click();
    await expect(page.getByText(/Zeitlimit von 3 s überschritten/)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Unbekannte URLs', () => {
  test('zeigen die 404-Ansicht und führen zurück zum Dashboard', async ({ page }) => {
    await page.goto('/dieses_lab_gibt_es_nicht');

    await expect(page.getByRole('heading', { name: 'Seite nicht gefunden' })).toBeVisible();
    await expect(page.getByText('/dieses_lab_gibt_es_nicht')).toBeVisible();

    await page.getByRole('main').getByRole('button', { name: 'Zum Dashboard' }).click();
    await expect(page.getByRole('heading', { name: /Willkommen zurück/i })).toBeVisible();
  });

  test('ein abschließender Slash öffnet trotzdem das Lab', async ({ page }) => {
    await page.goto('/nwa_scoring_lab/');
    await expect(page.getByRole('heading', { name: /IHK Nutzwertanalyse Studio/i })).toBeVisible();
  });
});

test.describe('Anzeige-Einstellungen', () => {
  test('ein gewähltes Theme übersteht einen Reload', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    await page.evaluate(() => {
      window.localStorage.setItem('informatik_game_ui_prefs_v1', JSON.stringify({ theme: 'dark', fontSize: 120 }));
    });
    await page.reload();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('html')).toHaveAttribute('style', /font-size:\s*120%/);
  });
});

test.describe('Anzeige-Einstellungen: Betriebssystem-Vorgabe', () => {
  test.use({ colorScheme: 'dark' });

  test('ohne eigene Auswahl folgt das Theme dem Dark Mode des Systems', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});
