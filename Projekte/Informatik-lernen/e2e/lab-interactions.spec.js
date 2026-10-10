import { test, expect } from '@playwright/test';

// Ergänzt smoke.spec.js (App-Shell, Routing, Persistenz) um echte
// Interaktions-Tests INNERHALB einzelner Labs, je eine repräsentative
// Kategorie: Storage/Netzwerk (RAID), WISO/Geldrechnung (Deckungsbeitrag)
// und Security (JWT-Angriffe). Der jsdom-Smoke-Test (allLabsSmoke.test.jsx)
// prüft nur, dass jedes Lab mountet - hier wird geprüft, dass eine echte
// Nutzerinteraktion das berechnete Ergebnis tatsächlich verändert.

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
});

test('RAID-Rechner: Wechsel von RAID 5 zu RAID 0 erhöht die Nutzdaten-Kapazität', async ({ page }) => {
  await page.goto('/raid_calculator_lab');

  await expect(page.getByRole('heading', { name: /RAID Storage/i })).toBeVisible();

  // Default: RAID 5, 4 Platten x 4 TB -> (4-1)*4 = 12 TB Nutzdaten.
  await expect(page.getByText('12 TB')).toBeVisible();

  await page.getByRole('button', { name: 'RAID 0' }).click();

  // RAID 0 hat keine Parität: 4 Platten x 4 TB = 16 TB Nutzdaten.
  await expect(page.getByText('16 TB')).toBeVisible();
  await expect(page.getByText(/Keine Ausfallsicherheit/i)).toBeVisible();
});

test('WISO Deckungsbeitrag: Break-Even-Point wird aus Preis, variablen Kosten & Fixkosten korrekt berechnet', async ({ page }) => {
  await page.goto('/wiso_contribution_margin');

  await expect(page.getByRole('heading', { name: /Deckungsbeitrags/i })).toBeVisible();

  // Default: Preis 150, var. Kosten 90, Fixkosten 60.000, Menge 1.200
  // db = 150 - 90 = 60 -> BEP = ceil(60.000 / 60) = 1.000 Stück.
  await expect(page.getByText('1.000 Stück')).toBeVisible();
});

test('JWT-Sicherheitslücken: "alg: none" Angriff wird bei aktiver Verteidigung blockiert, bei deaktivierter Verteidigung akzeptiert', async ({ page }) => {
  await page.goto('/jwt_attack_lab');

  await expect(page.getByRole('heading', { name: /JWT Sicherheitslücken/i })).toBeVisible();

  // Standard: Verteidigung aktiv -> Angriff wird blockiert.
  await expect(page.getByText('Angriff blockiert')).toBeVisible();

  // Verteidigung deaktivieren -> unsignierter "alg: none" Token wird akzeptiert.
  await page.getByRole('button', { name: 'AKTIV' }).click();
  await expect(page.getByText('Angriff erfolgreich!')).toBeVisible();
});

// Wissen/Lückentext/Videos/Projekte wurden von statischen App.jsx-Imports auf
// React.lazy() umgestellt (siehe App.jsx), um das Haupt-Bundle unter das
// size-limit-Budget zu bringen. Diese Tests stellen sicher, dass die
// Suspense-Grenzen korrekt greifen und jeder Tab weiterhin fehlerfrei rendert.
for (const { tab, headingPattern } of [
  { tab: 'lueckentext', headingPattern: /Interaktive Lückentexte/i },
  { tab: 'videos', headingPattern: /Video-Tutorial Studio/i },
  { tab: 'projekte', headingPattern: /Praxis-Mikroprojekte/i }
]) {
  test(`Lazy-geladener Tab "${tab}" rendert ohne unbehandelte Fehler`, async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await page.goto(`/${tab}`);

    await expect(page.getByRole('heading', { name: headingPattern })).toBeVisible();
    expect(consoleErrors, `Unerwartete Konsolen-/Laufzeitfehler im Tab "${tab}": ${consoleErrors.join('\n')}`).toEqual([]);
  });
}

// Regression: Diese Dashboard-Einträge verwiesen früher auf Tab-IDs ohne Handler
// (Klick -> leere Seite). `src/data/labModulesData.test.js` prüft das statisch;
// hier wird der echte Klickpfad inkl. Sonderfall SQL Dungeon (Games-Tab) geprüft.
for (const { search, expected } of [
  { search: 'Kubernetes Pods & Ingress', expected: /Kubernetes Cluster/i },
  { search: 'Visual Git Branching', expected: /Git Branching/i },
  { search: 'OAuth2 PKCE', expected: /PKCE/i },
  { search: 'SQL Dungeon', expected: /SQL/i }
]) {
  test(`Lab-Dashboard: "${search}" öffnet ein sichtbares Lab`, async ({ page }) => {
    await page.goto('/labs');
    await page.getByPlaceholder(/Suche nach Tags/i).fill(search);
    await page.getByRole('button', { name: /Laboratorium Starten/i }).first().click();
    await expect(page.locator('main h1, main h2').filter({ hasText: expected }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Dieses Modul ist abgestürzt')).toHaveCount(0);
  });
}
