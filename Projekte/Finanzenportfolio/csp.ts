/**
 * Content-Security-Policy der App – einzige Quelle für Vite-Build (<meta>, z. B. GitHub Pages)
 * sowie die Header in vercel.json und netlify.toml (Konsistenz wird in einem Test geprüft).
 *
 * Begründungen:
 * - script-src 'self': kein Inline-Script, kein eval -> stoppt eingeschleustes JavaScript.
 *   'wasm-unsafe-eval' wird für tesseract.js (OCR, WebAssembly) benötigt, cdn.jsdelivr.net für dessen
 *   Worker/Core und den pdf.js-Worker-Fallback.
 * - connect-src https:: WebDAV-/Webhook-Ziele sind nutzerdefiniert und können nicht vorab gelistet werden.
 * - style-src 'unsafe-inline': React-Inline-Styles; Google Fonts (CSS + Schrift).
 */
export const CSP_DIRECTIVES: Record<string, string[]> = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'wasm-unsafe-eval'", 'https://cdn.jsdelivr.net'],
  'worker-src': ["'self'", 'blob:', 'https://cdn.jsdelivr.net'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'blob:'],
  'connect-src': ["'self'", 'https:'],
  'manifest-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};

/** Nur per HTTP-Header wirksam (in <meta> ignoriert). */
export const HEADER_ONLY_DIRECTIVES: Record<string, string[]> = {
  'frame-ancestors': ["'none'"]
};

function serialize(directives: Record<string, string[]>): string {
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(' ')}`)
    .join('; ');
}

/** Wert für <meta http-equiv="Content-Security-Policy">. */
export const CSP_META = serialize(CSP_DIRECTIVES);

/** Wert für den HTTP-Header (inkl. frame-ancestors). */
export const CSP_HEADER = serialize({ ...CSP_DIRECTIVES, ...HEADER_ONLY_DIRECTIVES });
