// UI-Audit über alle Lab-Routen: Textkontrast (WCAG < 3:1) und Überlauf bei Handy-Breite.
// Ergänzt die jsdom-Tests, die weder Layout noch `color-contrast` prüfen können.
// Aufruf (vorher `npm run build` und `npm run preview` in einem zweiten Terminal):
//   npm run audit:ui                                  alle Routen, hell + dunkel, 375 px
//   npm run audit:ui -- --theme light --routes subnetting,itsm_simulator
//   npm run audit:ui -- --base https://informatik-lernen.vercel.app
// Ergebnis: Tabelle auf der Konsole, Details in tmp/ui-audit/<theme>.json.
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
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
    const ch = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
  };
  const ratio = (x, y) => { const [a, b] = [lum(x), lum(y)].sort((p, q) => q - p); return (a + 0.05) / (b + 0.05); };
  // Hintergrund als Stapel halbtransparenter Ebenen; Verläufe zählen mit ihrer ersten Farbe.
  const describe = (n) => `${n.tagName.toLowerCase()}${n.className && typeof n.className === 'string' ? '.' + n.className.trim().split(/\s+/).slice(0, 4).join('.') : ''}${n.style?.background || n.style?.backgroundColor ? ` [style: ${(n.style.background || n.style.backgroundColor).slice(0, 40)}]` : ''}`;
  // Hintergrund als Stapel halbtransparenter Ebenen; Verläufe zählen mit ihrer ersten Farbe.
  // `from` beschreibt das Element mit der deckenden Ebene (Fundstelle für die Korrektur).
  const backgroundOf = (el) => {
    const layers = [];
    let from = 'body';
    for (let n = el; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      const grad = s.backgroundImage.includes('gradient') ? parse(s.backgroundImage.match(COLOR)?.[0]) : null;
      for (const c of [grad, parse(s.backgroundColor)]) {
        if (c && c.a > 0) layers.push(c);
      }
      if (layers.some((l) => l.a >= 1)) { from = describe(n); break; }
    }
    let bg = { r: 255, g: 255, b: 255, a: 1 };
    for (const l of layers.reverse()) bg = over(l, bg);
    return { ...bg, from };
  };

  const main = document.querySelector('main') || document.body;
  const lowContrast = [];
  for (const el of main.querySelectorAll('*')) {
    const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
    if (!text) continue;
    const rect = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    if (!rect.width || !rect.height || s.visibility === 'hidden' || Number(s.opacity) < 0.3) continue;
    // Verlaufsschrift (.text-gradient: background-clip: text) hat keine messbare Textfarbe
    if (s.webkitTextFillColor === 'rgba(0, 0, 0, 0)' || s.backgroundClip === 'text') continue;
    const bg = backgroundOf(el);
    const fg = parse(s.color);
    if (!fg) continue;
    const r = ratio(over(fg, bg), bg);
    if (r < minContrast) lowContrast.push({ text: text.slice(0, 50), ratio: Math.round(r * 100) / 100, color: s.color, el: describe(el), bgFrom: bg.from });
  }

  // Überlauf: Elemente, die rechts aus dem Viewport ragen und nicht in einem scrollbaren/abschneidenden Container liegen.
  const W = window.innerWidth;
  let overflow = 0;
  let overflowAt = '';
  let overflowEl = null;
  for (const el of main.querySelectorAll('*')) {
    const rect = el.getBoundingClientRect();
    if (!rect.width || rect.right - W <= overflow) continue;
    let clipped = false;
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (s.position === 'fixed' || (s.overflowX !== 'visible' && a.getBoundingClientRect().right <= W + 1)) { clipped = true; break; }
    }
    if (!clipped) {
      overflow = rect.right - W;
      overflowAt = `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`;
      overflowEl = el;
    }
  }
  // Ursache: das äußerste Element, das aus einem noch passenden Elternelement herausragt.
  let overflowCause = '';
  if (overflowEl && overflow > maxOverflow) {
    let cause = overflowEl;
    for (let a = overflowEl.parentElement; a && a !== main; a = a.parentElement) {
      if (a.getBoundingClientRect().right > W + 1) cause = a; else break;
    }
    const cs = getComputedStyle(cause);
    const parent = cause.parentElement ? getComputedStyle(cause.parentElement) : null;
    const st = cause.getAttribute('style') || '';
    overflowCause = `${describe(cause).replace(/ \[style:.*$/, '')} w=${Math.round(cause.getBoundingClientRect().width)} ${cs.display}${cs.minWidth !== 'auto' && cs.minWidth !== '0px' ? ' min-width:' + cs.minWidth : ''}${cs.whiteSpace === 'nowrap' ? ' nowrap' : ''}${parent ? ' | parent ' + parent.display + (parent.gridTemplateColumns !== 'none' ? ' cols:' + parent.gridTemplateColumns.slice(0, 40) : '') : ''} | style: ${st.slice(0, 120)}`;
  }
  return {
    lowContrast: lowContrast.length,
    samples: lowContrast.slice(0, 40),
    overflow: overflow > maxOverflow ? Math.round(overflow) : 0,
    overflowAt: overflow > maxOverflow ? overflowAt : '',
    overflowCause,
  };
}

const browser = await chromium.launch();
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
await browser.close();
console.log(`\nDetails: ${outDir}`);
