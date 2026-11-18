import { describe, it, expect } from 'vitest';
import cv from './generate_cv_pdf.js';

const html = `<time class="cv-stand-date" data-format="de" datetime="2020-01-01">01.01.2020</time>
<time class="cv-stand-date" data-format="en" datetime="2020-01-01">01/01/2020</time>`;

describe('setStandDate', () => {
    it('setzt ISO-Datum und beide Anzeigeformate', () => {
        const out = cv.setStandDate(html, new Date('2026-11-18T10:00:00Z'));
        expect(out).toContain('datetime="2026-11-18">18.11.2026</time>');
        expect(out).toContain('datetime="2026-11-18">11/18/2026</time>');
        expect(out).not.toContain('2020');
    });
});
