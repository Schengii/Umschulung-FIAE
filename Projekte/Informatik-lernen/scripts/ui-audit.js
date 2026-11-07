// UI-Audit über alle Lab-Routen: Textkontrast (WCAG < 3:1) und Überlauf bei Handy-Breite.
// Ergänzt die jsdom-Tests, die weder Layout noch `color-contrast` prüfen können.
// Aufruf:
//   npm run audit:ui                                  alle Routen, hell + dunkel, 375 px (startet Preview-Server automatisch)
//   npm run audit:ui -- --theme light --routes subnetting,itsm_simulator
//   npm run audit:ui -- --base https://informatik-lernen.vercel.app
// Ergebnis: Tabelle auf der Konsole, Details in tmp/ui-audit/<theme>.json.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execSync, spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const BASE = opt('base', 'http://localhost:4173').replace(/\/$/, '');
const WIDTH = Number(opt('width', '375'));
const THEMES = opt('theme', 'light,dark').split(',');
const CONCURRENCY = Number(opt('concurrency', '4'));
const MIN_CONTRAST = 3;
const MAX_OVERFLOW = 4;

const { LAB_MODULES } = await import(pathToFileURL(fileURLToPath(new URL('../src/data/labModulesData.js', import.meta.url))).href);
const routes = opt('routes', '') ? opt('routes', '').split(',') : ['', ...LAB_MODULES.map((m) => m.id)];
const outDir = fileURLToPath(new URL('../tmp/ui-audit/', import.meta.url));
mkdirSync(outDir, { recursive: true });

// Server-Lifecycle-Prüfung (M03)
let spawnedProcess = null;
async function ensureServerReady() {
  try {
    await fetch(BASE, { method: 'HEAD', signal: AbortSignal.timeout(1200) });
    return;
  } catch {
    // Server unter BASE antwortet nicht
  }

  const parsed = new URL(BASE);
  const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  if (!isLocal) {
    throw new Error(`Server unter ${BASE} ist nicht erreichbar. Bitte Server starten oder Parameter --base prüfen.`);
  }

  const port = parsed.port || '4173';
  const indexPath = fileURLToPath(new URL('../dist/index.html', import.meta.url));
  if (!existsSync(indexPath)) {
    console.log('dist/index.html nicht gefunden. Baue Projekt (npm run build)...');
    execSync('npm run build', { stdio: 'inherit' });
  }

  console.log(`Starte internen Preview-Server auf Port ${port}...`);
  spawnedProcess = spawn(`npm run preview -- --port ${port}`, { shell: true, stdio: 'pipe' });

  const start = Date.now();
  let online = false;
  while (Date.now() - start < 20000) {
    await new Promise((r) => setTimeout(r, 400));
    try {
      await fetch(BASE, { method: 'HEAD', signal: AbortSignal.timeout(800) });
      online = true;
      break;
    } catch {
      // Weiter warten
    }
  }

  if (!online) {
    cleanupServer();
    throw new Error(`Preview-Server konnte auf Port ${port} nicht innerhalb von 20s gestartet werden.`);
  }
}

function cleanupServer() {
  if (spawnedProcess && spawnedProcess.pid) {
    try {
      if (process.platform === 'win32') {
        execSync(`taskkill /pid ${spawnedProcess.pid} /T /F`, { stdio: 'ignore' });
      } else {
        spawnedProcess.kill('SIGTERM');
      }
    } catch {
      // Ignorieren falls Prozess bereits beendet
    }
    spawnedProcess = null;
  }
}

// Läuft im Browser: misst eine geladene Seite.
function measurePage({ minContrast, maxOverflow }) {
  // Über ein Canvas in sRGB umrechnen: Tailwind v4 liefert oklch(), Labs rgb()/Hex.
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const cache = new Map();
  const parse = (c) => {
    if (!c || c === 'transparent') return null;
    if (!cache.has(c)) {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#000';
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      cache.set(c, a ? { r, g, b, a: a / 255 } : null);
    }
    return cache.get(c);
  };
  const COLOR = /(?:rgba?|oklch|oklab|hsla?|color)\([^)]*\)|#[0-9a-f]{3,8}\b/i;
  const over = (top, bottom) => ({
    r: top.r * top.a + bottom.r * (1 - top.a),
    g: top.g * top.a + bottom.g * (1 - top.a),
    b: top.b * top.a + bottom.b * (1 - top.a),
    a: 1,
  });
  const lum = ({ r, g, b }) => {
    const s = [r, g, b].map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
  };
  const cr = (fg, bg) => {
    const l1 = lum(fg);
    const l2 = lum(bg);
    return ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05));
  };
  const bgOf = (el) => {
    let cur = el;
    let stack = null;
    while (cur && cur !== document.documentElement) {
      const cs = window.getComputedStyle(cur);
      const bg = parse(cs.backgroundColor);
      if (bg && bg.a > 0.02) {
        stack = stack ? over(stack, bg) : bg;
        if (stack.a >= 0.98) return stack;
      }
      cur = cur.parentElement;
    }
    const htmlBg = parse(window.getComputedStyle(document.documentElement).backgroundColor) || { r: 15, g: 23, b: 42, a: 1 };
    return stack ? over(stack, htmlBg) : htmlBg;
  };

  const lowContrast = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const text = node.textContent.trim();
    if (!text || text.length < 2) continue;
    const parent = node.parentElement;
    if (!parent) continue;
    const tag = parent.tagName.toLowerCase();
    if (tag === 'script' || tag === 'style' || tag === 'svg' || tag === 'noscript') continue;
    const rect = parent.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    const cs = window.getComputedStyle(parent);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.1) continue;
    const fg = parse(cs.color);
    if (!fg || fg.a < 0.1) continue;
    const bg = bgOf(parent);
    const eff = fg.a < 1 ? over(fg, bg) : fg;
    const ratio = cr(eff, bg);
    if (ratio < minContrast) {
      lowContrast.push({
        text: text.slice(0, 40),
        tag,
        ratio: Math.round(ratio * 100) / 100,
        fg: `rgb(${Math.round(eff.r)},${Math.round(eff.g)},${Math.round(eff.b)})`,
        bg: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`,
      });
    }
  }

  const vp = window.innerWidth;
  let overflow = 0;
  let overflowAt = '';
  let overflowCause = '';
  const isScrollable = (el) => {
    const cs = window.getComputedStyle(el);
    return /(auto|scroll)/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 2;
  };
  for (const el of document.querySelectorAll('body *')) {
    const rect = el.getBoundingClientRect();
    if (rect.right > vp + maxOverflow) {
      let cur = el;
      let inScroller = false;
      while (cur && cur !== document.body) {
        if (isScrollable(cur)) { inScroller = true; break; }
        cur = cur.parentElement;
      }
      if (!inScroller && rect.right - vp > overflow) {
        overflow = rect.right - vp;
        const cls = el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
        overflowAt = `<${el.tagName.toLowerCase()}${cls}> w=${Math.round(rect.width)}px right=${Math.round(rect.right)}px`;
        const cs = window.getComputedStyle(el);
        overflowCause = `${cs.display}, w=${cs.width}, min-w=${cs.minWidth}, max-w=${cs.maxWidth}`;
      }
    }
  }
  return {
    lowContrast: lowContrast.length,
    samples: lowContrast.slice(0, 40),
    overflow: overflow > maxOverflow ? Math.round(overflow) : 0,
    overflowAt: overflow > maxOverflow ? overflowAt : '',
    overflowCause,
  };
}

try {
  await ensureServerReady();

  const browser = await chromium.launch();
  try {
    for (const theme of THEMES) {
      const context = await browser.newContext({ viewport: { width: WIDTH, height: 800 }, serviceWorkers: 'block' });
      await context.addInitScript((t) => {
        localStorage.setItem('informatik_game_ui_prefs_v1', JSON.stringify({ theme: t }));
      }, theme);
      const queue = [...routes];
      const results = [];
      await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
        while (queue.length) {
          const route = queue.shift();
          const page = await context.newPage();
          try {
            await page.goto(`${BASE}/${route}`, { waitUntil: 'load', timeout: 30000 });
            await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
            await page.waitForTimeout(600);
            results.push({ route: `/${route}`, ...(await page.evaluate(measurePage, { minContrast: MIN_CONTRAST, maxOverflow: MAX_OVERFLOW })) });
          } catch (err) {
            results.push({ route: `/${route}`, error: err.message.split('\n')[0] });
          }
          await page.close();
        }
      }));
      await context.close();

      results.sort((a, b) => (b.lowContrast || 0) - (a.lowContrast || 0) || (b.overflow || 0) - (a.overflow || 0));
      writeFileSync(`${outDir}${theme}.json`, JSON.stringify(results, null, 2));
      const contrast = results.filter((r) => r.lowContrast);
      const overflow = results.filter((r) => r.overflow);
      const errors = results.filter((r) => r.error);
      console.log(`\n== ${theme}, ${WIDTH} px, ${results.length} Routen ==`);
      console.log(`Routen mit Text < ${MIN_CONTRAST}:1: ${contrast.length}  |  mit Überlauf > ${MAX_OVERFLOW} px: ${overflow.length}  |  Fehler: ${errors.length}`);
      for (const r of contrast.slice(0, 15)) console.log(`  Kontrast  ${r.route.padEnd(34)} ${String(r.lowContrast).padStart(4)}×  z. B. "${r.samples[0].text}" (${r.samples[0].ratio}:1)`);
      for (const r of overflow.slice(0, 15)) console.log(`  Überlauf  ${r.route.padEnd(34)} +${r.overflow} px  ${r.overflowAt}`);
      for (const r of errors) console.log(`  Fehler    ${r.route}: ${r.error}`);
    }
  } finally {
    await browser.close();
  }
} finally {
  cleanupServer();
}

console.log(`\nDetails: ${outDir}`);
