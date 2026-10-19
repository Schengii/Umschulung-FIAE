// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { installPageGlobals, removePageGlobals, resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import { initAccentColor } from './accent-color.js';

const PAGE = `
    <button id="accent-toggle" type="button">Accent</button>
    <div id="accent-dropdown" style="display: none">
        <button class="accent-dot-btn" data-accent-val="blue" aria-checked="false"></button>
        <button class="accent-dot-btn" data-accent-val="green" aria-checked="false"></button>
    </div>`;
let storage;

beforeEach(() => {
    storage = installPageGlobals();
    resetDocument(PAGE);
});
afterEach(removePageGlobals);

const dropdown = () => document.getElementById('accent-dropdown');
const dot = (value) => document.querySelector(`[data-accent-val="${value}"]`);

describe('accent-color', () => {
    it('does nothing without toggle and dropdown', () => {
        resetDocument('');
        expect(() => initAccentColor()).not.toThrow();
    });

    it('marks the current accent (default blue) as the active dot', () => {
        initAccentColor();
        expect(dot('blue').classList.contains('active')).toBe(true);
        expect(dot('blue').getAttribute('aria-checked')).toBe('true');
        expect(dot('green').getAttribute('aria-checked')).toBe('false');
    });

    it('opens and closes the dropdown with the toggle button', () => {
        initAccentColor();
        document.getElementById('accent-toggle').click();
        expect(dropdown().style.display).toBe('flex');
        document.getElementById('accent-toggle').click();
        expect(dropdown().style.display).toBe('none');
    });

    it('closes the dropdown on a click elsewhere but not inside it', () => {
        initAccentColor();
        document.getElementById('accent-toggle').click();
        dropdown().click();
        expect(dropdown().style.display).toBe('flex');
        document.body.click();
        expect(dropdown().style.display).toBe('none');
    });

    it('applies and persists the chosen accent', () => {
        initAccentColor();
        document.getElementById('accent-toggle').click();
        dot('green').click();

        expect(document.documentElement.getAttribute('data-accent')).toBe('green');
        expect(storage.getItem('portfolio_accent')).toBe('green');
        expect(dot('green').classList.contains('active')).toBe(true);
        expect(dot('blue').classList.contains('active')).toBe(false);
        expect(dropdown().style.display).toBe('none');
    });
});
