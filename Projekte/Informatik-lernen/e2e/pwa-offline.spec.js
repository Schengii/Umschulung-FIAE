import { test, expect } from '@playwright/test';

// Die App bewirbt sich selbst als PWA ("100% DSGVO-konform, Client-Side Only",
// Offline-fähig via vite-plugin-pwa Service Worker) - dieses zentrale
// Versprechen war bisher komplett ungetestet. Dieser Test registriert den
// Service Worker über einen echten Seitenaufruf, geht dann in einen
// simulierten Offline-Modus und prüft, dass die App weiterhin aus dem Cache
// bedient wird statt eine Browser-Offline-Fehlerseite zu zeigen.
test.describe.serial('PWA Offline & Service Worker Suite', () => {
  test('Service Worker registriert sich und cached die App-Shell', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Willkommen zurück/i })).toBeVisible();

    const swReady = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const registration = await navigator.serviceWorker.ready;
      return !!registration.active;
    });

    expect(swReady).toBe(true);
  });

  test('App bleibt nach einem Reload im Offline-Modus nutzbar (Service-Worker-Cache)', async ({ page, context }) => {
  // Erster Aufruf: Service Worker installieren und die App-Shell precachen lassen.
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Willkommen zurück/i })).toBeVisible();
  await page.evaluate(async () => {
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.ready;
    }
  });

  // Zweiter Aufruf (noch online): stellt sicher, dass der Service Worker die
  // Seite tatsächlich kontrolliert (bei "autoUpdate" übernimmt er erst nach
  // dem ersten erfolgreichen Install-Zyklus die Kontrolle).
  await page.reload();
  await expect(page.getByRole('heading', { name: /Willkommen zurück/i })).toBeVisible();

  await context.setOffline(true);
  try {
    await page.reload();
    await expect(page.getByRole('heading', { name: /Willkommen zurück/i })).toBeVisible({ timeout: 10000 });
  } finally {
    await context.setOffline(false);
  }
});
});
