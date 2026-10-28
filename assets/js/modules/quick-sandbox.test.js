// @vitest-environment happy-dom
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';

// The module initialises itself on import (portfolio.html loads it as a page module).
let sandbox;
beforeAll(async () => {
    window.history.replaceState(null, '', '/pages/portfolio.html');
    document.body.innerHTML = '<button id="trigger" data-sandbox-project="EcoChef">Direkt testen</button>';
    sandbox = await import('./quick-sandbox.js');
});

const modal = () => document.getElementById('quick-sandbox-modal');
const iframe = () => /** @type {HTMLIFrameElement} */ (document.getElementById('sandbox-iframe'));

beforeEach(() => sandbox.closeSandbox());

describe('quick-sandbox', () => {
    it('injects one labelled, bilingual dialog with a titled iframe', () => {
        expect(document.querySelectorAll('#quick-sandbox-modal')).toHaveLength(1);
        expect(modal().getAttribute('role')).toBe('dialog');
        expect(modal().getAttribute('aria-modal')).toBe('true');
        expect(modal().getAttribute('aria-labelledby')).toBe('sandbox-title');
        expect(iframe().getAttribute('title')).toBe('Projekt-Vorschau');
        expect(document.getElementById('btn-sandbox-close').getAttribute('aria-label')).toBe('Schließen');
        expect(modal().querySelectorAll('[lang="de"]').length).toBe(modal().querySelectorAll('[lang="en"]').length);
    });

    it('opens a project from its trigger, moves the focus in and returns it on Escape', () => {
        const trigger = document.getElementById('trigger');
        trigger.focus();
        trigger.click();
        expect(modal().style.display).toBe('flex');
        expect(document.getElementById('sandbox-title').textContent).toContain('EcoChef');
        expect(iframe().getAttribute('src')).toBe('../Projekte/EcoChef/www/index.html');
        expect(document.activeElement?.id).toBe('btn-sandbox-close');
        expect(document.body.style.overflow).toBe('hidden');

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(modal().style.display).toBe('none');
        expect(iframe().getAttribute('src')).toBe('');
        expect(document.activeElement).toBe(trigger);
    });

    it('finds projects by name variants and falls back for unknown ones', () => {
        sandbox.openSandbox('Wohnungssuche KI');
        expect(iframe().getAttribute('src')).toContain('Wohnungssuche KI/frontend/dist/index.html');
        sandbox.openSandbox('Unbekannt');
        expect(iframe().getAttribute('src')).toBe('../Projekte/Unbekannt/index.html');
        expect(document.getElementById('sandbox-badge').textContent).toBe('Web Application');
    });

    it('closes on the close button and on a click on the backdrop', () => {
        sandbox.openSandbox('EcoChef');
        document.getElementById('btn-sandbox-close').click();
        expect(modal().style.display).toBe('none');

        sandbox.openSandbox('EcoChef');
        modal().dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(modal().style.display).toBe('none');
    });

    it('resolves project paths for root and pages/ locations', () => {
        expect(sandbox.resolveSandboxUrl('https://x.example/app')).toBe('https://x.example/app');
        expect(sandbox.resolveSandboxUrl('../Projekte/A/index.html')).toBe('../Projekte/A/index.html');
        expect(sandbox.resolveSandboxUrl('Projekte/A/index.html')).toBe('../Projekte/A/index.html');
        window.history.replaceState(null, '', '/index.html');
        expect(sandbox.resolveSandboxUrl('../Projekte/A/index.html')).toBe('Projekte/A/index.html');
        expect(sandbox.resolveSandboxUrl('')).toBe('');
        window.history.replaceState(null, '', '/pages/portfolio.html');
    });
});
