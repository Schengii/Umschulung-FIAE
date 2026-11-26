import { describe, it, expect } from 'vitest';
import { CSP_HEADER, CSP_META, CSP_DIRECTIVES } from '../../../csp';
import vercelRaw from '../../../vercel.json?raw';
import netlifyRaw from '../../../netlify.toml?raw';
import indexHtml from '../../../index.html?raw';

describe('Content-Security-Policy', () => {
  it('vercel.json und netlify.toml verwenden exakt die zentrale Policy', () => {
    const vercel = JSON.parse(vercelRaw);
    const header = vercel.headers[0].headers.find((h: { key: string }) => h.key === 'Content-Security-Policy');
    expect(header.value).toBe(CSP_HEADER);

    expect(netlifyRaw).toContain(`Content-Security-Policy = "${CSP_HEADER}"`);
  });

  it('erlaubt weder Inline-Skripte noch eval', () => {
    const scriptSrc = CSP_DIRECTIVES['script-src'];
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
    expect(CSP_DIRECTIVES['object-src']).toEqual(["'none'"]);
  });

  it('frame-ancestors steht nur im Header, nicht im <meta>', () => {
    expect(CSP_HEADER).toContain("frame-ancestors 'none'");
    expect(CSP_META).not.toContain('frame-ancestors');
  });

  it('index.html enthält keine Inline-Skripte', () => {
    const inline = [...indexHtml.matchAll(/<script(?![^>]*\bsrc=)[^>]*>/g)];
    expect(inline).toHaveLength(0);
  });
});
