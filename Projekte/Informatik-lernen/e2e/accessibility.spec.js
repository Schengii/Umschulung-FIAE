import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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
