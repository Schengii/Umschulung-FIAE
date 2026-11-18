import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { hashOf, extractInlineScripts, withScriptHashes, collectSiteHashes } = require('./verify_csp_hashes.js');
const vercelConfig = require('../vercel.json');

describe('verify_csp_hashes: hashOf', () => {
    it('produces identical hashes for CRLF and LF content (Windows checkout invariance)', () => {
        const lf = "document.addEventListener('DOMContentLoaded', () => {\n  console.log('ready');\n});\n";
        const crlf = "document.addEventListener('DOMContentLoaded', () => {\r\n  console.log('ready');\r\n});\r\n";

        const hashLf = hashOf(lf);
        const hashCrlf = hashOf(crlf);

        expect(hashLf).toBe(hashCrlf);
        expect(hashLf.startsWith('sha256-')).toBe(true);
    });

    it('matches manual sha256 base64 digest calculation', () => {
        const script = 'const answer = 42;';
        const expectedDigest = crypto.createHash('sha256').update(script, 'utf8').digest('base64');

        expect(hashOf(script)).toBe(`sha256-${expectedDigest}`);
    });

    it('normalizes mixed line endings correctly', () => {
        const mixed = 'line1\r\nline2\nline3\r\n';
        const pureLf = 'line1\nline2\nline3\n';

        expect(hashOf(mixed)).toBe(hashOf(pureLf));
    });
});

describe('verify_csp_hashes: extractInlineScripts', () => {
    it('extracts inline script bodies and ignores external scripts with src attribute', () => {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <script src="assets/js/components.js"></script>
                <script type="module" src="assets/js/main.js"></script>
                <script>
                    const inlineOne = true;
                </script>
            </head>
            <body>
                <script src="https://example.com/cdn.js"></script>
                <script id="app-config">
                    window.__CONFIG__ = { env: 'production' };
                </script>
            </body>
            </html>
        `;

        const scripts = extractInlineScripts(html);

        expect(scripts.length).toBe(2);
        expect(scripts[0]).toContain('const inlineOne = true;');
        expect(scripts[1]).toContain('window.__CONFIG__');
    });

    it('returns empty array when no inline scripts are present', () => {
        const html = '<script src="app.js"></script><script src="vendor.js"></script>';
        expect(extractInlineScripts(html)).toEqual([]);
    });
});

describe('verify_csp_hashes: header CSP', () => {
    it('withScriptHashes ersetzt script-src durch self plus Hashes und lässt den Rest unberührt', () => {
        const out = withScriptHashes("default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self';", [
            'sha256-a',
            'sha256-b',
        ]);
        expect(out).toBe("default-src 'self'; script-src 'self' 'sha256-a' 'sha256-b'; style-src 'self';");
    });

    it('collectSiteHashes ist sortiert und ohne Dubletten', () => {
        const hashes = collectSiteHashes();
        expect(hashes.length).toBeGreaterThan(0);
        expect(hashes).toEqual([...new Set(hashes)].sort());
    });

    it('die Header-CSP der Seiten erlaubt kein unsafe-inline für Skripte', () => {
        const rule = vercelConfig.headers.find((r) => r.source.startsWith('/((?!pages/playground'));
        const csp = rule.headers.find((h) => h.key === 'Content-Security-Policy').value;
        expect(/script-src[^;]*'unsafe-inline'/.test(csp)).toBe(false);
        expect(rule.source).toContain('Projekte/');
    });
});
