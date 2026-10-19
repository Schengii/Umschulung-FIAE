// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import { initFaqAccordion } from './faq-accordion.js';

const item = (n) => `
    <div class="faq-item">
        <button class="faq-trigger" aria-expanded="false">Frage ${n}</button>
        <div class="faq-panel"><div class="faq-content">Antwort ${n}</div></div>
    </div>`;
const PAGE = `<div id="faq-accordion-container">${item(1)}${item(2)}</div>`;

beforeEach(() => resetDocument(PAGE));
afterEach(() => {
    delete window.addLiveCommit;
    document.head.innerHTML = '';
});

const items = () => [...document.querySelectorAll('.faq-item')];
const trigger = (n) => items()[n].querySelector('.faq-trigger');

describe('faq-accordion', () => {
    it('does nothing without its container', () => {
        resetDocument('');
        initFaqAccordion();
        expect(document.head.querySelector('style')).toBeNull();
    });

    it('injects its stylesheet once per init', () => {
        initFaqAccordion();
        expect(document.head.querySelectorAll('style')).toHaveLength(1);
    });

    it('opens a panel and sets aria-expanded', () => {
        initFaqAccordion();
        trigger(0).click();
        expect(items()[0].classList.contains('open')).toBe(true);
        expect(trigger(0).getAttribute('aria-expanded')).toBe('true');
    });

    it('closes the open panel when it is clicked again', () => {
        initFaqAccordion();
        trigger(0).click();
        trigger(0).click();
        expect(items()[0].classList.contains('open')).toBe(false);
        expect(trigger(0).getAttribute('aria-expanded')).toBe('false');
        expect(items()[0].querySelector('.faq-panel').style.maxHeight).toBe('0px');
    });

    it('keeps only one panel open at a time', () => {
        initFaqAccordion();
        trigger(0).click();
        trigger(1).click();
        expect(items()[0].classList.contains('open')).toBe(false);
        expect(trigger(0).getAttribute('aria-expanded')).toBe('false');
        expect(items()[1].classList.contains('open')).toBe(true);
    });

    it('reports each click to the live-commit counter when it exists', () => {
        window.addLiveCommit = vi.fn();
        initFaqAccordion();
        trigger(0).click();
        trigger(1).click();
        expect(window.addLiveCommit).toHaveBeenCalledTimes(2);
    });
});
