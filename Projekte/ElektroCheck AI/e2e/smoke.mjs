/**
 * Smoke-Test der Hauptabläufe im echten Browser (Chrome, Playwright): Einwilligung, Sicherheits-Check, alle Tabs,
 * Diagnose mit gemockter KI-Antwort, Prüfbestätigung, PDF-Vorschau, Downloads, E-Mail (Simulationsmodus), Ticket.
 * Startet Backend und Vite selbst (Dummy-Key, Ticket-Datei im Temp-Ordner). Kein Zugriff auf externe KI-/Mail-Dienste.
 *
 *   npm run test:e2e                 # nutzt installiertes Google Chrome (oder CHROME_PATH)
 *   E2E_BASE_URL=http://localhost:5173 npm run test:e2e   # gegen bereits laufende Server
 */
import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright-core';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:5173/';
const API = 'http://localhost:3000';
const results = [];
const ok = (name, pass, info = '') => { results.push({ name, pass, info }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${info ? '  -> ' + info : ''}`); };

const children = [];
const startServer = (cmd, args, env = {}) => {
  const child = spawn(cmd, args, { stdio: 'ignore', shell: process.platform === 'win32', env: { ...process.env, ...env } });
  children.push(child);
};
const stopServers = () => {
  for (const c of children) {
    if (process.platform === 'win32') spawn('taskkill', ['/pid', String(c.pid), '/T', '/F'], { stdio: 'ignore' });
    else c.kill('SIGTERM');
  }
};
const waitFor = async (url, ms = 60000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try { if ((await fetch(url)).status < 500) return; } catch { /* Server startet noch */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server nicht erreichbar: ${url}`);
};

if (!process.env.E2E_BASE_URL) {
  startServer('node', ['backend/index.js'], { GEMINI_API_KEY: 'e2e-dummy-key', PORT: '3000', TICKETS_FILE: path.join(os.tmpdir(), 'electrocheck-e2e-tickets.json') });
  startServer('npx', ['vite', '--port', '5173', '--strictPort']);
}
process.on('exit', stopServers);
await waitFor(`${API}/api/auth/me`);
await waitFor(BASE);

let browser;
try {
  browser = await chromium.launch(
    process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH, headless: true }
      : { channel: 'chrome', headless: true },
  );
} catch (err) {
  stopServers();
  console.error('\n[E2E] Google Chrome konnte nicht gestartet werden.');
  console.error('Hinweis: Für diesen Smoke-Test wird ein lokales Google Chrome benötigt.');
  console.error('Bitte installieren Sie Google Chrome oder setzen Sie die Umgebungsvariable CHROME_PATH:');
  console.error('  Windows: $env:CHROME_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"');
  console.error('  Linux/CI: export CHROME_PATH=/usr/bin/google-chrome\n');
  console.error(`Fehlerdetails: ${err.message}\n`);
  process.exit(1);
}
const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 }, permissions: ['geolocation'], geolocation: { latitude: 52.52, longitude: 13.4 } });

const page = await context.newPage();
page.setDefaultTimeout(15000);

const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));

// KI-Antwort (Backend ohne gültigen Key) und Mailversand-Endpunkt: Diagnose gemockt, Mail an das echte Backend (Simulationsmodus)
await page.route('**/api/gemini/diagnosis', (route) => route.fulfill({
  status: 200, contentType: 'application/json',
  body: JSON.stringify({ deviceName: 'E2E Kreissäge', identifiedDefect: 'Defekte Zuleitung', safetyLevel: 'DANGER', estimatedRepairCost: '30 €', repairDifficulty: 2, recommendation: 'Zuleitung ersetzen, Schutzleiter prüfen', additionalTips: ['Netz trennen'], sparePartSearchTerm: 'Zuleitung', customerExperience: 'Gerät wird heiß', actionSteps: [{ id: 1, text: 'Zuleitung ersetzen', completed: false }] }),
}));

await page.addInitScript(() => {
  window.__q = (sel, root = document) => {
    const direct = root.querySelector(sel); if (direct) return direct;
    for (const el of root.querySelectorAll('*')) { if (el.shadowRoot) { const r = window.__q(sel, el.shadowRoot); if (r) return r; } }
    return null;
  };
});
await page.goto(BASE);
await page.getByText('Diagnose Starten').first().click();
ok('Startseite -> DSGVO-Dialog', await page.locator('[role=dialog][aria-label*="DSGVO"]').count() === 1);

await page.locator('input[type=checkbox]').first().check();
await page.getByText('Einwilligen & Fortfahren').click();
await page.waitForSelector('ec-safety-checks');
for (const cb of await page.locator('ec-safety-checks input[type=checkbox]').all()) await cb.check();
await page.getByText('Diagnose starten').click();
ok('Sicherheits-Check bestanden, Diagnose-Tab', await page.locator('ec-camera-capture').count() === 1);

// Tabs
for (const [label, tag] of [['Wärmebild', 'ec-thermal-analysis'], ['Dashboard', 'ec-dashboard'], ['Rechner', 'ec-vde-calculator'], ['VDE-Regeln', 'ec-vde-rules'], ['Schaltplan', 'ec-schematic-analyzer'], ['GBU', 'ec-gbu-generator'], ['Diagnose', 'ec-camera-capture']]) {
  await page.locator('ec-app-header').getByText(label, { exact: false }).first().click();
  await page.waitForSelector(tag, { timeout: 8000 });
  ok(`Tab ${label}`, true);
}

// Analyse: Bild setzen (Kamera gibt es headless nicht), Beschreibung eingeben, Analyse starten
const px = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
await page.evaluate((img) => { const w = window.__q('ec-diagnosis-wizard'); w._description = 'Kreissäge wird heiß und riecht verbrannt'; w._capturedImage = img; }, px);
const t0 = Date.now();
await page.getByText('Analyse starten').click();
let resultShown = true;
try { await page.getByText('Defekte Zuleitung').first().waitFor({ timeout: 25000 }); } catch { resultShown = false; }
ok('Analyse -> Ergebnis sichtbar', resultShown, `${Math.round((Date.now() - t0) / 1000)} s`);

if (resultShown) {
  const loc = await page.evaluate(() => window.__q('ec-diagnosis-wizard')._result?.location);
  ok('Standort im Ergebnis gesetzt', !!loc, String(loc).slice(0, 40));

  // Prüfbestätigung (KI-Befund muss vom Prüfer bestätigt werden)
  const lockedBefore = await page.evaluate(() => [...window.__q('ec-diagnosis-wizard').shadowRoot.querySelectorAll('.result-actions vaadin-button')].filter((b) => b.hasAttribute('disabled')).length);
  ok('Aktionen vor Prüfbestätigung gesperrt', lockedBefore >= 5, String(lockedBefore));
  await page.locator('.result-actions').locator('xpath=preceding::input[@type="checkbox"][1]').check().catch(async () => {
    await page.getByText('Ich habe Befund und Empfehlung').click();
  });
  await page.waitForTimeout(400);
  const lockedAfter = await page.evaluate(() => [...window.__q('ec-diagnosis-wizard').shadowRoot.querySelectorAll('.result-actions vaadin-button')].filter((b) => b.hasAttribute('disabled')).length);
  ok('Aktionen nach Prüfbestätigung frei', lockedAfter === 0, String(lockedAfter));

  // PDF-Vorschau
  await page.getByText('📄 Vorschau').click();
  let preview = true;
  try { await page.waitForSelector('ec-pdf-preview', { state: 'attached', timeout: 20000 }); } catch { preview = false; }
  ok('PDF-Vorschau öffnet', preview);
  if (preview) {
    const src = await page.evaluate(() => window.__q('ec-pdf-preview').url);
    ok('Vorschau-URL ist blob:', String(src).startsWith('blob:'), String(src).slice(0, 30));
    await page.locator('ec-pdf-preview').getByText(/Schließen|Zurück|✖|✕/).first().click();
    await page.waitForTimeout(500);
    ok('Vorschau schließt', await page.locator('ec-pdf-preview').count() === 0);
  }

  const download = async (label, text) => {
    const dl = page.waitForEvent('download', { timeout: 20000 }).catch(() => null);
    await page.getByText(text).first().click();
    const d = await dl;
    ok(label, !!d, d ? d.suggestedFilename() : 'kein Download');
  };
  await download('PDF-Download', '💾 PDF');
  await download('ZVEH-CSV-Export', '📊 ZVEH (CSV)');
  await download('E-CHECK-XML-Export', '📄 E-CHECK (XML)');
  await download('Stromkreisverzeichnis-PDF', '🏷️ Legende (PDF)');

  // E-Mail: prompt stubben, echtes Backend im Simulationsmodus (nichts wird versendet)
  await page.evaluate(() => { window.prompt = () => 'test@example.invalid'; });
  const mailResp = page.waitForResponse((r) => r.url().includes('/api/reports/send-email'), { timeout: 25000 }).catch(() => null);
  await page.getByText('✉️ E-Mail-Versand').click();
  const mr = await mailResp;
  let body = ''; if (mr) body = (await mr.text()).slice(0, 80);
  ok('E-Mail-Versand (Simulation)', !!mr && mr.status() === 200, mr ? `${mr.status()} ${body}` : 'keine Antwort');

  // Ticket (lokales Backend)
  const tResp = page.waitForResponse((r) => r.url().includes('/api/tickets') && r.request().method() === 'POST', { timeout: 20000 }).catch(() => null);
  await page.getByText('🎫 Ticket').click();
  const tr = await tResp;
  ok('Ticket anlegen', !!tr && tr.status() === 201, tr ? String(tr.status()) : 'keine Antwort');
  if (tr && tr.status() === 201) { const { id } = await tr.json(); await page.request.delete(`${API}/api/tickets/${id}`); }
}

ok('Keine Konsolenfehler', consoleErrors.length === 0, consoleErrors.slice(0, 5).join(' | '));
await browser.close();
stopServers();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} bestanden`);
process.exit(failed.length ? 1 : 0);
