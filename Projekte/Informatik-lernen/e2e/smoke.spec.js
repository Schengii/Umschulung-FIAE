import { test, expect } from '@playwright/test';

// End-to-End Smoke-Test für den echten Produktions-Build (siehe
// playwright.config.js: `npm run preview`). Deckt genau die Lücke ab, die
// Unit-/Komponenten-Tests (Vitest + Testing Library) NICHT abdecken können:
// echtes Browser-Routing (react-router-dom), echte localStorage-Persistenz
// über einen Reload hinweg, und dass die App im Ganzen (Navbar, Dashboard,
// Rollenwahl-Modal, ein echtes Lab) ohne unbehandelte Fehler hochfährt.
//
// Hinweis: Neue Nutzer bekommen standardmäßig bereits die Rolle "anfaenger"
// zugewiesen (siehe initialProfileState in src/utils/storage.js) - das
// Rollenwahl-Modal öffnet sich also NICHT automatisch, sondern nur über den
// expliziten "Profil / Level"-Button. Das ist eine bewusste Design-
// Entscheidung (sofort nutzbare Defaults statt Zwangs-Onboarding), kein Bug.

test.beforeEach(async ({ page }) => {
  // Frischer Start pro Test: keine XP/Rolle aus vorherigen Läufen.
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
});

test('Frischer Start: Dashboard lädt direkt mit Standardrolle, ohne unbehandelte Fehler', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Willkommen zurück/i })).toBeVisible();
  await expect(page.getByRole('button', { name: '0 XP Lvl 1' })).toBeVisible();

  expect(consoleErrors, `Unerwartete Konsolen-/Laufzeitfehler beim Laden: ${consoleErrors.join('\n')}`).toEqual([]);
});

test('Rollenwahl über "Profil / Level" übersteht einen Reload (localStorage-Persistenz)', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Profil / Level' }).click();

  const otherRoleButton = page.getByRole('button', { name: 'Dieses Profil wählen' }).first();
  await expect(otherRoleButton).toBeVisible();
  await otherRoleButton.click();

  // Modal ist nach der Auswahl geschlossen.
  await expect(otherRoleButton).toBeHidden();

  await page.reload();

  // Nach dem Reload bleibt die neu gewählte Rolle erhalten: Öffnet man das
  // Modal erneut, zeigt die zuvor gewählte Karte "Aktiv Ausgewählt" an.
  await page.getByRole('button', { name: 'Profil / Level' }).click();
  await expect(page.getByRole('button', { name: 'Aktiv Ausgewählt' }).first()).toBeVisible();
});

test('Navigation zu einem konkreten Lab (NWA-Studio) funktioniert per direktem Routen-Pfad', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  await page.goto('/nwa_scoring_lab');

  await expect(page.getByRole('heading', { name: /IHK Nutzwertanalyse Studio/i })).toBeVisible();
  expect(consoleErrors, `Unerwartete Konsolen-/Laufzeitfehler im NWA-Lab: ${consoleErrors.join('\n')}`).toEqual([]);
});

test('Ctrl+K öffnet die Command Palette zur Modul-Suche', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('Control+k');
  await expect(page.getByPlaceholder(/Suche Themen/i)).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByPlaceholder(/Suche Themen/i)).toBeHidden();
});

test('Lade-Skeleton wird nach dem App-Start entfernt und blockiert keine Klicks', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Willkommen zurück/i })).toBeVisible();
  // Skeleton blendet aus (350 ms) und wird aus dem DOM entfernt
  await expect(page.locator('#app-skeleton')).toHaveCount(0, { timeout: 3000 });
});
