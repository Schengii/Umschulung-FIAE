// @vitest-environment happy-dom
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import { initKeyboardShortcuts } from './keyboard-shortcuts.js';

// The module registers one document listener per init and keeps the help modal in a closure,
// so it is initialised once for the whole file and every test starts from a fresh <body>.
beforeAll(() => initKeyboardShortcuts());

const PAGE = `
    <input id="searchbar">
    <button id="theme-toggle">t</button>
    <button id="lang-toggle">l</button>
    <button id="btn-prev">p</button>
    <button id="btn-next">n</button>
    <div id="flashcard">card</div>
    <input id="typing">`;

const key = (name, options = {}, target = document.body) => {
    const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...options });
    target.dispatchEvent(event);
    return event;
};
const clicks = (id) => {
    const handler = vi.fn();
    document.getElementById(id).addEventListener('click', handler);
    return handler;
};
const helpModal = () => document.getElementById('shortcuts-help-modal');

beforeEach(() => {
    // The module keeps its help modal in a closure: close it and carry it over into the fresh body.
    const modal = helpModal();
    if (modal) modal.style.display = 'none';
    resetDocument(PAGE);
    if (modal) document.body.appendChild(modal);
});

describe('keyboard-shortcuts: global keys', () => {
    it('Ctrl+K focuses the search bar and prevents the browser default', () => {
        const event = key('k', { ctrlKey: true });
        expect(event.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(document.getElementById('searchbar'));
    });

    it('Ctrl+K leaves the shortcut to the command palette when it is present', () => {
        document.body.insertAdjacentHTML('beforeend', '<div id="command-palette-overlay"></div>');
        const event = key('k', { ctrlKey: true });
        expect(event.defaultPrevented).toBe(false);
        expect(document.activeElement).not.toBe(document.getElementById('searchbar'));
    });

    it('T toggles the theme and L toggles the language', () => {
        const theme = clicks('theme-toggle');
        const lang = clicks('lang-toggle');
        key('t');
        key('L');
        expect(theme).toHaveBeenCalledTimes(1);
        expect(lang).toHaveBeenCalledTimes(1);
    });

    it('ignores letter shortcuts combined with a modifier key', () => {
        const theme = clicks('theme-toggle');
        key('t', { altKey: true });
        key('t', { ctrlKey: true });
        expect(theme).not.toHaveBeenCalled();
    });

    it('ignores every shortcut while typing in a field', () => {
        const theme = clicks('theme-toggle');
        key('t', {}, document.getElementById('typing'));
        expect(theme).not.toHaveBeenCalled();
    });
});

describe('keyboard-shortcuts: flashcards', () => {
    it('arrow keys page through the cards', () => {
        const prev = clicks('btn-prev');
        const next = clicks('btn-next');
        key('ArrowLeft');
        key('ArrowRight');
        key('ArrowRight');
        expect(prev).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledTimes(2);
    });

    it('space flips the card without scrolling the page', () => {
        const flip = clicks('flashcard');
        const event = key(' ');
        expect(flip).toHaveBeenCalledTimes(1);
        expect(event.defaultPrevented).toBe(true);
    });

    it('does not claim space on pages without a flashcard', () => {
        document.getElementById('flashcard').remove();
        expect(key(' ').defaultPrevented).toBe(false);
    });
});

describe('keyboard-shortcuts: help and modals', () => {
    it('? opens the shortcut help and a second ? closes it', () => {
        key('?');
        expect(helpModal().style.display).toBe('flex');
        key('?');
        expect(helpModal().style.display).toBe('none');
    });

    it('Escape and the close button hide the help', () => {
        key('?');
        key('Escape');
        expect(helpModal().style.display).toBe('none');

        key('?');
        document.getElementById('shortcuts-help-close').click();
        expect(helpModal().style.display).toBe('none');
    });

    it('Escape closes an open project modal through its close button', () => {
        document.body.insertAdjacentHTML(
            'beforeend',
            '<div id="project-modal" class="show"><button class="modal-close">x</button></div>'
        );
        const close = vi.fn();
        document.querySelector('#project-modal .modal-close').addEventListener('click', close);
        key('Escape');
        expect(close).toHaveBeenCalledTimes(1);
    });
});
