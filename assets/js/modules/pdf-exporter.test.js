// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installPageGlobals, removePageGlobals, resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import { initPdfExporter } from './pdf-exporter.js';

const PAGE = `
    <button id="btn-cv-print-header">Drucken</button>
    <button class="btn-export-pdf">Factsheet</button>`;

const openModal = () => {
    document.querySelector('.btn-export-pdf').click();
    return document.getElementById('pdf-export-modal');
};

describe('pdf exporter', () => {
    beforeEach(() => {
        resetDocument(PAGE);
        installPageGlobals();
        sessionStorage.clear();
        vi.stubGlobal('print', vi.fn());
        window.print = globalThis.print;
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        removePageGlobals();
    });

    it('wires the plain print buttons to window.print', () => {
        initPdfExporter();
        document.getElementById('btn-cv-print-header').click();
        expect(window.print).toHaveBeenCalledTimes(1);
    });

    it('does not open a modal when there is no export button', () => {
        resetDocument('<p>leer</p>');
        expect(() => initPdfExporter()).not.toThrow();
        expect(document.getElementById('pdf-export-modal')).toBeNull();
    });

    it('opens one modal, even after repeated clicks, and prints from it', () => {
        initPdfExporter();
        openModal();
        const modal = openModal();
        expect(document.querySelectorAll('#pdf-export-modal')).toHaveLength(1);
        modal.querySelector('#btn-do-print').click();
        expect(window.print).toHaveBeenCalledTimes(1);
    });

    it('closes through each of its close buttons', () => {
        initPdfExporter();
        const count = openModal().querySelectorAll('.btn-close-modal').length;
        expect(count).toBe(2);
        for (let index = 0; index < count; index++) {
            openModal().querySelectorAll('.btn-close-modal')[index].click();
            expect(document.getElementById('pdf-export-modal')).toBeNull();
        }
    });

    it('names the stored company in the factsheet', () => {
        AppStorage.setItem('recruiter_company', 'Beispiel GmbH');
        initPdfExporter();
        expect(openModal().textContent).toContain('Exklusiv zusammengestellt für Beispiel GmbH');
    });

    it('prefers the session value over the stored one', () => {
        AppStorage.setItem('recruiter_company', 'Alt AG');
        sessionStorage.setItem('recruiter_company', 'Neu AG');
        initPdfExporter();
        expect(openModal().textContent).toContain('Neu AG');
    });

    it('omits the dedication without a company', () => {
        initPdfExporter();
        expect(openModal().textContent).not.toContain('Exklusiv zusammengestellt');
    });

    it('treats a stored company name as text, never as markup', () => {
        AppStorage.setItem('recruiter_company', '<img src=x onerror=alert(1)>');
        initPdfExporter();
        const modal = openModal();
        expect(modal.querySelector('img')).toBeNull();
        expect(modal.textContent).toContain('<img src=x onerror=alert(1)>');
    });
});
