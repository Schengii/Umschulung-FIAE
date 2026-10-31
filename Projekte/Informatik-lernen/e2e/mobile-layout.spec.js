import { test, expect } from '@playwright/test';

// P16: Bei 375 px darf kein Inhalt rechts aus dem Bild ragen. `body { overflow-x: hidden }`
// würde ihn sonst unsichtbar und auf dem Handy unerreichbar machen. Geprüft werden die Labs,
// die beim UI-Audit vom 2026-10-29 am weitesten überliefen, plus je ein Vertreter der
// Fehlerarten (festes Raster, Tab-Leiste, lange Überschrift, eingerückter Baum).
// Für alle Routen: `npm run audit:ui` (scripts/ui-audit.js).
const ROUTES = [
  'webrtc_peer_studio',
  'backup_strategy_lab',
  'personal_notebook',
  'itsm_simulator',
  'rack_configurator',
  'sm2_spaced_repetition',
  'postgres_explain_lab',
  'stp_protocol_lab',
  'bpmn_process_lab',
  'ihk_grade_calculator',
  'kafka',
  'wasm_rust_studio'
];

test.use({ viewport: { width: 375, height: 800 } });

for (const route of ROUTES) {
  test(`/${route}: kein Element ragt bei 375 px aus dem Viewport`, async ({ page }) => {
    await page.goto(`/${route}`);
    await expect(page.locator('main')).toBeVisible();
    await page.waitForTimeout(500);
    const overflow = await page.evaluate(() => {
      const W = window.innerWidth;
      const main = document.querySelector('main');
      let worst = { px: 0, el: '' };
      for (const el of main.querySelectorAll('*')) {
        const rect = el.getBoundingClientRect();
        if (!rect.width || rect.right - W <= worst.px) continue;
        let clipped = false;
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
          const s = getComputedStyle(a);
          if (s.position === 'fixed' || (s.overflowX !== 'visible' && a.getBoundingClientRect().right <= W + 1)) { clipped = true; break; }
        }
        if (!clipped) worst = { px: Math.round(rect.right - W), el: `${el.tagName.toLowerCase()} „${(el.textContent || '').trim().slice(0, 40)}“` };
      }
      return worst;
    });
    expect(overflow.px, `Überlauf durch ${overflow.el}`).toBeLessThanOrEqual(4);
  });
}
