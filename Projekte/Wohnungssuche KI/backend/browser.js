import axios from 'axios';

let puppeteer;
let StealthPlugin;

// Dynamically import puppeteer-extra to allow graceful fallback if packages are not fully ready/installed
async function initPuppeteer() {
  if (puppeteer) return true;
  try {
    const puppeteerExtraModule = await import('puppeteer-extra');
    const stealthPluginModule = await import('puppeteer-extra-plugin-stealth');
    puppeteer = puppeteerExtraModule.default;
    StealthPlugin = stealthPluginModule.default;
    puppeteer.use(StealthPlugin());
    return true;
  } catch (e) {
    console.warn('Puppeteer-extra oder StealthPlugin konnte nicht geladen werden. Verwende Axios Fallback.', e.message);
    return false;
  }
}

/**
 * Holt den vollständigen HTML-Inhalt einer URL über einen Headless-Browser (Puppeteer Stealth)
 * oder per Axios-Fallback, falls Puppeteer fehlschlägt oder nicht installiert ist.
 */
export async function fetchPageContent(url) {
  const hasPuppeteer = await initPuppeteer();

  if (hasPuppeteer) {
    console.log(`Lade URL mit Puppeteer (Stealth): ${url}`);
    let browser = null;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--window-size=1280,800'
        ]
      });
      const page = await browser.newPage();
      
      // Setze ein realistisches Viewport- und User-Agent-Profil
      await page.setViewport({ width: 1280, height: 800 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
      
      // Definiere Timeouts
      page.setDefaultNavigationTimeout(30000);
      page.setDefaultTimeout(30000);

      // Deutsche Sprache und zusätzliche Standard-Header setzen
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7'
      });

      // Seite aufrufen und warten, bis das Netzwerk zur Ruhe kommt
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Hole den gesamten geladenen HTML-Inhalt
      const html = await page.content();
      
      if (!html || html.trim().length === 0) {
        throw new Error('Empfangenes HTML ist leer.');
      }

      // Prüfe auf Bot-Erkennung/CAPTCHA Seiten
      const pageTitle = (await page.title()) || '';
      const isBlocked = 
        pageTitle.includes('Ich bin kein Roboter') || 
        pageTitle.includes('Roboter-Identifikation') ||
        pageTitle.includes('Security Check') ||
        pageTitle.includes('Access Denied') ||
        pageTitle.includes('captcha') ||
        pageTitle.includes('Cloudflare') ||
        html.includes('cf-challenge') ||
        html.includes('distil') ||
        html.includes('dd-captcha') || 
        html.includes('captcha-delivery');

      if (isBlocked) {
        throw new Error('Die Seite hat uns als Bot identifiziert (CAPTCHA / Akamai / Cloudflare).');
      }

      return html;
    } catch (err) {
      console.error(`Puppeteer Fehler beim Laden der URL (${url}):`, err.message);
      if (err.message.includes('Bot identifiziert') || err.message.includes('CAPTCHA')) {
        // Direkte Weiterleitung des Bot-Fehlers, kein Axios-Fallback sinnvoll
        throw err;
      }
      console.log('Wechsle zu Axios Fallback...');
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (closeErr) {
          console.error('Fehler beim Schließen des Browsers:', closeErr.message);
        }
      }
    }
  }

  // Axios Fallback
  console.log(`Lade URL mit Axios Fallback: ${url}`);
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    },
    timeout: 15000,
    responseType: 'text'
  });

  const responseHtml = response.data;
  const responseString = typeof responseHtml === 'string' ? responseHtml : JSON.stringify(responseHtml);
  const isAxiosBlocked = 
    responseString.includes('Ich bin kein Roboter') || 
    responseString.includes('Roboter-Identifikation') ||
    responseString.includes('Security Check') ||
    responseString.includes('Access Denied') ||
    responseString.includes('captcha') ||
    responseString.includes('cf-challenge');

  if (isAxiosBlocked) {
    throw new Error('Die Seite hat uns als Bot identifiziert (Axios).');
  }

  return responseString;
}

/**
 * Erstellt einen Screenshot einer URL als Base64-String (für visuelles Fallback-Parsing via Gemini).
 * @param {string} url - Die zu screenshottende URL
 * @returns {{ base64: string, mimeType: string }|null}
 */
export async function takeScreenshot(url) {
  const hasPuppeteer = await initPuppeteer();
  if (!hasPuppeteer) {
    console.warn('[Screenshot] Puppeteer nicht verfügbar, Screenshot-Fallback nicht möglich.');
    return null;
  }

  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'de-DE,de;q=0.9' });
    page.setDefaultNavigationTimeout(25000);

    await page.goto(url, { waitUntil: 'domcontentloaded' });
    // Kurz warten für dynamische Inhalte
    await new Promise(r => setTimeout(r, 2000));

    const screenshotBuffer = await page.screenshot({ type: 'webp', fullPage: false });
    const base64 = screenshotBuffer.toString('base64');
    console.log(`[Screenshot] Screenshot erstellt für: ${url} (${Math.round(base64.length / 1024)} KB)`);
    return { base64, mimeType: 'image/webp' };
  } catch (err) {
    console.error(`[Screenshot] Fehler beim Screenshot von ${url}:`, err.message);
    return null;
  } finally {
    if (browser) {
      try { await browser.close(); } catch {}
    }
  }
}

