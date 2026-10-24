// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resetDocument } from '../../../scripts/test-support/dom-helpers.js';

const createQrDataUrl = vi.fn();
vi.mock('./qr-local.js', () => ({ createQrDataUrl: (...args) => createQrDataUrl(...args) }));

const { initQrGenerator } = await import('./qr-generator.js');

const PAGE = `
    <form id="qr-generator-form">
        <input id="qr-company-input">
        <input id="qr-name-input">
        <select id="qr-target-select">
            <option value="pages/portfolio.html">Portfolio</option>
            <option value="pages/lebenslauf.html">CV</option>
        </select>
    </form>
    <div id="qr-code-placeholder"></div>
    <div id="qr-code-image-container" style="display: none"></div>
    <div id="qr-result-details" style="display: none"></div>
    <p id="qr-instruction-text"></p>
    <input id="qr-generated-link">
    <button id="qr-copy-btn">Kopieren</button>
    <button id="qr-download-btn">Download</button>`;

const el = (id) => document.getElementById(id);
const type = (id, value) => {
    el(id).value = value;
    el(id).dispatchEvent(new Event('input'));
};

describe('qr generator', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        resetDocument(PAGE);
        createQrDataUrl.mockReset().mockReturnValue('data:image/svg+xml;charset=utf-8,%3Csvg%3E%3C%2Fsvg%3E');
        initQrGenerator();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('does nothing without its form fields', () => {
        resetDocument('<p>leer</p>');
        expect(() => initQrGenerator()).not.toThrow();
    });

    it('stays hidden while both fields are empty', () => {
        type('qr-company-input', '   ');
        vi.advanceTimersByTime(300);
        expect(createQrDataUrl).not.toHaveBeenCalled();
        expect(el('qr-result-details').style.display).toBe('none');
    });

    it('debounces typing and encodes company and name into the link', () => {
        type('qr-company-input', 'Müller & Söhne');
        type('qr-name-input', 'Erika Muster');
        vi.advanceTimersByTime(100);
        expect(createQrDataUrl).not.toHaveBeenCalled();
        vi.advanceTimersByTime(300);

        expect(createQrDataUrl).toHaveBeenCalledTimes(1);
        const link = el('qr-generated-link').value;
        expect(link).toContain('/pages/portfolio.html?c=M%C3%BCller%20%26%20S%C3%B6hne&n=Erika%20Muster');
        expect(createQrDataUrl).toHaveBeenCalledWith(link);
    });

    it('omits an empty parameter and follows the selected target immediately', () => {
        type('qr-name-input', 'Erika');
        vi.advanceTimersByTime(300);
        expect(el('qr-generated-link').value).toMatch(/portfolio\.html\?n=Erika$/);

        el('qr-target-select').value = 'pages/lebenslauf.html';
        el('qr-target-select').dispatchEvent(new Event('change'));
        expect(el('qr-generated-link').value).toMatch(/lebenslauf\.html\?n=Erika$/);
    });

    it('shows the result once the image has loaded', () => {
        type('qr-company-input', 'ACME');
        vi.advanceTimersByTime(300);
        const img = el('qr-code-image-container').querySelector('img');
        expect(img.alt).toContain('ACME');
        img.onload();
        expect(el('qr-code-image-container').style.display).toBe('block');
        expect(el('qr-result-details').style.display).toBe('block');
        expect(el('qr-code-placeholder').style.display).toBe('none');
    });

    it('explains a link that is too long for a QR code and keeps the link', () => {
        createQrDataUrl.mockImplementation(() => {
            throw new Error('code length overflow');
        });
        type('qr-company-input', 'ACME');
        vi.advanceTimersByTime(300);
        expect(el('qr-code-image-container').querySelector('.qr-error-notice')).not.toBeNull();
        expect(el('qr-generated-link').value).toContain('c=ACME');
    });

    it('copies the link and ignores the click while it is empty', () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        vi.stubGlobal('navigator', { clipboard: { writeText } });
        el('qr-copy-btn').click();
        expect(writeText).not.toHaveBeenCalled();

        type('qr-company-input', 'ACME');
        vi.advanceTimersByTime(300);
        el('qr-copy-btn').click();
        expect(writeText).toHaveBeenCalledWith(el('qr-generated-link').value);
    });

    it('downloads the QR code as an SVG file with a sanitised name', () => {
        const createObjectURL = vi.fn().mockReturnValue('blob:x');
        const revokeObjectURL = vi.fn();
        vi.spyOn(URL, 'createObjectURL').mockImplementation(createObjectURL);
        vi.spyOn(URL, 'revokeObjectURL').mockImplementation(revokeObjectURL);
        const names = [];
        vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
            names.push(this.download);
        });

        type('qr-company-input', 'Müller & Söhne');
        vi.advanceTimersByTime(300);
        el('qr-download-btn').click();

        expect(names).toEqual(['qr_code_m_ller___s_hne.svg']);
        expect(createObjectURL.mock.calls[0][0].type).toBe('image/svg+xml');
        vi.advanceTimersByTime(1000);
        expect(revokeObjectURL).toHaveBeenCalledWith('blob:x');
    });

    it('keeps the form from submitting', () => {
        const event = new Event('submit', { cancelable: true });
        el('qr-generator-form').dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);
    });
});
