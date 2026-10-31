import { test, expect } from '@playwright/test';

// `vite preview` liefert die Header aus vercel.json aus (siehe vite.config.js,
// `preview.headers`). Diese Tests stellen sicher, dass die Features, die
// Skripte, Frames oder Worker nachladen, mit der Produktions-CSP funktionieren.
// Ein CSP-Verstoß erscheint als `securitypolicyviolation`-Event.

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (event) => {
      window.__cspViolations.push(`${event.violatedDirective} -> ${event.blockedURI}`);
    });
  });
});

const violations = (page) => page.evaluate(() => window.__cspViolations);

test('Antwort enthält die CSP aus vercel.json', async ({ page }) => {
  const response = await page.goto('/');
  expect(response.headers()['content-security-policy']).toContain("default-src 'self'");
});

test('Code-Sandbox läuft unter der Produktions-CSP ohne Verstoß', async ({ page }) => {
  await page.goto('/coding_challenges');
  await page.getByRole('button', { name: 'Code Testen' }).click();
  await expect(page.getByText('ALLE TESTFÄLLE BESTANDEN')).toBeVisible();
  expect(await violations(page)).toEqual([]);
});

test('Video-Player (YouTube-Embed) wird von der CSP nicht blockiert', async ({ page }) => {
  await page.goto('/videos');
  // Ohne Klick darf keine Verbindung zu YouTube entstehen (Einwilligung)
  await expect(page.locator('iframe[src*="youtube-nocookie.com"]')).toHaveCount(0);
  await page.getByRole('button', { name: /Video von YouTube laden/i }).click();
  await expect(page.locator('iframe[src*="youtube-nocookie.com"]')).toBeVisible();
  expect(await violations(page)).toEqual([]);
});

test('Monaco-Editor lädt unter der Produktions-CSP ohne Verstoß', async ({ page }) => {
  await page.goto('/monaco_studio');
  // Der Editor rendert erst nach erfolgreichem Laden der Monaco-Skripte.
  await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 20000 });
  expect(await violations(page)).toEqual([]);
});

test('Startseite lädt ohne Inline-Skript-Verstoß und blendet das Skeleton aus', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#app-skeleton')).toHaveCount(0, { timeout: 10000 });
  const scriptViolations = (await violations(page)).filter((entry) => entry.startsWith('script-src'));
  expect(scriptViolations).toEqual([]);
});

// alasql übersetzt Abfragen per `new Function`; das ist nur im eigenen
// SQL-Worker erlaubt (eigene CSP in vercel.json), nie auf der Hauptseite.
// Der erste Auftrag startet den Worker (alasql, ca. 500 KB) - unter Last dauert das.
const WORKER_START = { timeout: 15000 };

test.describe('SQL-Labs (alasql im Worker) unter der Produktions-CSP', () => {
  test('/sql_joins führt einen JOIN aus; nur der SQL-Worker darf eval', async ({ page }) => {
    const response = await page.goto('/sql_joins');
    expect(response.headers()['content-security-policy']).not.toContain("'unsafe-eval'");
    const workerRequest = page.waitForRequest(/\/assets\/sql\.worker-[^/]+\.js$/);
    await page.getByRole('button', { name: /INNER JOIN \(Schnittmenge\)/ }).click();
    // Die Überschrift "Ergebnistabelle (0 Zeilen)" steht schon vor der Abfrage da
    await expect(page.getByRole('cell', { name: 'Alice (Admin)' }).first()).toBeVisible(WORKER_START);
    await expect(page.getByText(/Ergebnistabelle \([1-9]\d* Zeilen\)/)).toBeVisible();
    expect(await violations(page)).toEqual([]);

    const workerCsp = (await page.request.get((await workerRequest).url())).headers()['content-security-policy'];
    expect(workerCsp).toContain("'unsafe-eval'");
    expect(workerCsp).toContain("connect-src 'none'");
  });

  test('/sqlite_studio zeigt das Ergebnis der Startabfrage', async ({ page }) => {
    await page.goto('/sqlite_studio');
    await expect(page.getByRole('cell', { name: 'Felix Becker' })).toBeVisible(WORKER_START);
    await page.getByRole('button', { name: /Ausführen \(F5\)/ }).click();
    await expect(page.getByRole('cell', { name: 'Felix Becker' })).toBeVisible();
    expect(await violations(page)).toEqual([]);
  });

  test('/sqlite_worker_lab führt eine Abfrage im Worker aus', async ({ page }) => {
    await page.goto('/sqlite_worker_lab');
    await page.getByRole('button', { name: /Query im Worker ausführen/ }).click();
    await expect(page.getByText(/Ergebnis \(\d+ Zeilen/)).toBeVisible(WORKER_START);
    expect(await violations(page)).toEqual([]);
  });

  test('SQL-Dungeon (Spiele) führt die Nutzerabfrage aus', async ({ page }) => {
    await page.goto('/games');
    await page.locator('textarea').first().fill('SELECT * FROM mitarbeiter');
    await page.getByRole('button', { name: /Query Ausführen/ }).click();
    await expect(page.getByText('Anna Schmidt').first()).toBeVisible(WORKER_START);
    await expect(page.getByText(/SQL Syntax\/Execution Error/)).toHaveCount(0);
    expect(await violations(page)).toEqual([]);
  });
});

// X-XSS-Protection ist entfernt (Browser ignorieren ihn, die CSP schützt);
// die übrigen Sicherheits-Header müssen für Seite und Worker bestehen bleiben.
test('Seite und Sandbox-Worker liefern die Sicherheits-Header, ohne X-XSS-Protection', async ({ page }) => {
  const workerRequest = page.waitForRequest(/\/assets\/sandbox\.worker-[^/]+\.js$/);
  const response = await page.goto('/coding_challenges');
  await page.getByRole('button', { name: 'Code Testen' }).click();
  const workerHeaders = (await page.request.get((await workerRequest).url())).headers();
  for (const headers of [response.headers(), workerHeaders]) {
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['strict-transport-security']).toContain('max-age=63072000');
    expect(headers['permissions-policy']).toContain('camera=()');
    expect(headers['x-xss-protection']).toBeUndefined();
  }
});
