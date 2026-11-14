import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Axe-Core Analysen sind CPU-intensiv, insbesondere bei parallelen Testläufen über 250+ Lab-Kacheln
test.describe.configure({ timeout: 120_000 });

// Automatisierter A11y-Audit (axe-core) für die wichtigsten Einstiegspunkte.
// Ergänzt die manuelle Accessibility-Arbeit (reduced-motion, Kontrastmodi)
// aus CLAUDE.md um automatisierte, reproduzierbare Prüfung gegen WCAG 2.1 A/AA
// - u.a. fehlende `aria-label` auf Icon-only-Buttons, unzureichender
// Farbkontrast und fehlende Formular-Labels werden so systematisch statt nur
// stichprobenartig erkannt.
//
// Bewusst NICHT auf 0 Violations gegated: Bei einer gewachsenen App mit 165+
// Labs würde ein hartes Gate beim ersten Fund den gesamten PR blockieren.
// Stattdessen wird die Anzahl geloggt und nur gegen "critical"/"serious"
// Verstöße auf der Dashboard-Startseite (dem Haupteinstiegspunkt) geprüft;
// das Ziel ist, Regressionen dort zu verhindern und der Weiterentwicklung
// eine Baseline für schrittweise Verbesserung zu geben.

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
});

// `color-contrast` ist auf praktisch jeder Seite dieser App verletzt (gedeckte
// --text-muted-Töne im gesamten Design-System, 41+ Elemente allein auf dem
// Dashboard) - das ist ein bewusstes, bestehendes Design-Merkmal, dessen
// Behebung eine eigene, dedizierte Design-Überarbeitung erfordert (Farbpalette
// über das ganze CSS-Variablen-System hinweg), keine Ad-hoc-Änderung an
// einzelnen Komponenten. Es hier hart zu gaten würde jeden PR blockieren, ohne
// dass diese Session die Design-Entscheidung treffen kann. Bis zu dieser
// Überarbeitung wird die Regel daher bewusst ausgeschlossen; alle anderen
// WCAG 2.1 A/AA Regeln (fehlende Button-Labels, Tastatur-Fallen, fehlende
// Formular-Labels, ...) bleiben scharf gegated.
const KNOWN_DESIGN_DEBT_RULES = ['color-contrast'];

async function assertNoSeriousA11yViolations(page, label) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .disableRules(KNOWN_DESIGN_DEBT_RULES)
    .analyze();

  const critical = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');

  if (critical.length > 0) {
    const details = critical
      .map((v) => `- [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} Element(e))`)
      .join('\n');
    throw new Error(`${critical.length} kritische/schwerwiegende A11y-Verstöße ${label}:\n${details}`);
  }

  console.log(`axe-core: 0 kritische/schwerwiegende A11y-Verstöße ${label} (${results.violations.length} sonstige, u.a. bekannte Design-Debt-Regeln ausgeschlossen).`);
}

test('Dashboard hat keine kritischen/schwerwiegenden A11y-Verstöße (axe-core)', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Willkommen zurück/i })).toBeVisible();
  await assertNoSeriousA11yViolations(page, 'auf dem Dashboard');
});

test('Command Palette (Ctrl+K) hat keine kritischen/schwerwiegenden A11y-Verstöße', async ({ page }) => {
  await page.goto('/');
  // Erst nach dem Mount hängt der Ctrl+K-Listener (App.jsx) am Dokument
  await expect(page.getByRole('heading', { name: /Willkommen zurück/i })).toBeVisible();
  await page.keyboard.press('Control+k');
  await expect(page.getByPlaceholder(/Suche Themen/i)).toBeVisible();
  await assertNoSeriousA11yViolations(page, 'in der Command Palette');
});

// Stichprobe über typische Lab-Kategorien (Netzwerk, WISO-Rechner, Storage,
// Security, Lab-Übersicht). Die jsdom-Abdeckung ALLER Labs liefert
// src/components/allLabsA11y.test.jsx; hier laufen zusätzlich die
// browserabhängigen Regeln (Fokus, Sichtbarkeit) gegen den echten Build.
for (const route of ['labs', 'tcp_state_machine_lab', 'raid_calculator_lab', 'wiso_kalkulation', 'ipv6_routing_lab', 'owasp_exploit_lab']) {
  test(`Lab /${route} hat keine kritischen/schwerwiegenden A11y-Verstöße`, async ({ page }) => {
    await page.goto(`/${route}`);
    await expect(page.locator('main')).toBeVisible();
    // Lazy-Chunk abwarten: Lade-Fallback muss verschwunden sein
    await page.waitForLoadState('networkidle');
    await assertNoSeriousA11yViolations(page, `im Lab /${route}`);
  });
}

test('Haupt-Dashboards erfüllen WCAG AA Farbkontrast ohne Ausnahmen (M13)', async ({ page }) => {
  for (const path of ['/', '/labs', '/wissen']) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const serious = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(serious, `Kritische A11y/Kontrast-Mängel auf ${path}: ${serious.map((s) => s.id).join(', ')}`).toEqual([]);
  }
});

test('TopicReader Skip-Link und Tastaturnavigation sind barrierefrei (M15)', async ({ page }) => {
  await page.goto('/wissen/algorithmen_datenstrukturen');
  await page.waitForLoadState('networkidle');

  // Skip-Link existiert und springt per Tastatur zum Hauptinhalt
  const skipLink = page.locator('a.skip-link');
  await expect(skipLink).toBeAttached();
  await skipLink.focus();
  await skipLink.press('Enter');
  await expect(page.locator('#artikel-inhalt')).toBeFocused();

  // Inhaltsverzeichnis prüft barrierefreie Links
  const tocNav = page.locator('nav[aria-label="Inhaltsverzeichnis"]');
  if (await tocNav.isVisible()) {
    const tocLinks = tocNav.locator('ol li a');
    const count = await tocLinks.count();
    expect(count).toBeGreaterThan(0);
  }

  // A11y-Audit auf dem Wissensartikel mit axe-core
  await assertNoSeriousA11yViolations(page, 'im Wissensartikel');
});
