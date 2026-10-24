// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import { initPortfolioExporter } from './portfolio_exporter.js';

const setPath = (path) => window.happyDOM.setURL(`https://example.org${path}`);

describe('portfolio exporter', () => {
    beforeEach(() => {
        resetDocument('<div class="portfolio-filters"></div>');
        setPath('/pages/portfolio.html');
        window.print = vi.fn();
    });

    afterEach(() => vi.unstubAllGlobals());

    it('adds the print button once to the filter bar', () => {
        initPortfolioExporter();
        initPortfolioExporter();
        expect(document.querySelectorAll('#btn-print-portfolio')).toHaveLength(1);
        expect(document.querySelector('.portfolio-filters #btn-print-portfolio')).not.toBeNull();
    });

    it('offers a bilingual label and tooltip', () => {
        initPortfolioExporter();
        const button = document.getElementById('btn-print-portfolio');
        expect(button.querySelector('[lang="de"]')).not.toBeNull();
        expect(button.querySelector('[lang="en"]')).not.toBeNull();
        expect(button.getAttribute('data-en-title')).toBeTruthy();
    });

    it('prints and announces it with a bilingual toast when available', () => {
        const showToast = vi.fn();
        vi.stubGlobal('showToast', showToast);
        initPortfolioExporter();
        document.getElementById('btn-print-portfolio').click();
        expect(showToast).toHaveBeenCalledWith(
            expect.objectContaining({ de: expect.any(String), en: expect.any(String) }),
            'info'
        );
        expect(window.print).toHaveBeenCalledTimes(1);
    });

    it('prints without a toast function', () => {
        initPortfolioExporter();
        expect(() => document.getElementById('btn-print-portfolio').click()).not.toThrow();
        expect(window.print).toHaveBeenCalledTimes(1);
    });

    it('stays off other pages', () => {
        setPath('/pages/home.html');
        initPortfolioExporter();
        expect(document.getElementById('btn-print-portfolio')).toBeNull();
    });
});
