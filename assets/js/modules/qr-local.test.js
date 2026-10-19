import { describe, it, expect } from 'vitest';
import { createQrDataUrl } from './qr-local.js';

describe('createQrDataUrl', () => {
    it('returns an SVG data URL with a white background and dark modules', () => {
        const url = createQrDataUrl('https://www.max-schenk.tech/pages/dashboard.html');
        expect(url.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true);
        const svg = decodeURIComponent(url.slice(url.indexOf(',') + 1));
        expect(svg).toContain('<svg');
        expect(svg).toContain('fill="#fff"');
        expect(svg).toContain('fill="#000"');
    });

    it('is deterministic for the same input', () => {
        expect(createQrDataUrl('abc')).toBe(createQrDataUrl('abc'));
    });

    it('never mentions a remote host in its output', () => {
        expect(createQrDataUrl('abc')).not.toContain('qrserver');
    });

    it('throws when the text does not fit into one QR code', () => {
        expect(() => createQrDataUrl('x'.repeat(4000))).toThrow();
    });
});
