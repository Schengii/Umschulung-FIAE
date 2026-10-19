// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import { initNavigation } from './navigation.js';

const PAGE = `
    <button id="menu-toggle" aria-expanded="false"><i class="fa fa-bars"></i></button>
    <nav id="nav-menu">
        <div class="nav-item" id="item-a">
            <a class="nav-link" href="#">Lernen</a>
            <div class="dropdown-menu">
                <div class="dropdown-item" id="sub-1">
                    <a class="dropdown-link" href="#">IHK</a>
                    <div class="sub-dropdown-menu"><a href="pages/ap1.html" id="dest">AP1</a></div>
                </div>
                <div class="dropdown-item" id="sub-2">
                    <a class="dropdown-link" href="#">Tools</a>
                    <div class="sub-dropdown-menu"></div>
                </div>
            </div>
        </div>
        <div class="nav-item" id="item-b">
            <a class="nav-link" href="#">Projekte</a>
            <div class="dropdown-menu"></div>
        </div>
        <div class="nav-item" id="item-c"><a class="nav-link" href="pages/home.html" id="plain">Home</a></div>
    </nav>
    <main id="outside">content</main>`;

const $ = (selector) => document.querySelector(selector);
const link = (id) => $(`#${id} > .nav-link`);

beforeEach(() => {
    resetDocument(PAGE);
    initNavigation();
});

describe('navigation: mobile menu', () => {
    it('toggles the drawer, aria-expanded and the icon', () => {
        $('#menu-toggle').click();
        expect($('#nav-menu').classList.contains('open')).toBe(true);
        expect($('#menu-toggle').getAttribute('aria-expanded')).toBe('true');
        expect($('#menu-toggle i').className).toBe('fa fa-times');

        $('#menu-toggle').click();
        expect($('#nav-menu').classList.contains('open')).toBe(false);
        expect($('#menu-toggle i').className).toBe('fa fa-bars');
    });

    it('closes the drawer when a destination link is chosen', () => {
        $('#menu-toggle').click();
        $('#plain').click();
        expect($('#nav-menu').classList.contains('open')).toBe(false);
        expect($('#menu-toggle').getAttribute('aria-expanded')).toBe('false');
    });

    it('closes the drawer with Escape and returns focus to the toggle', () => {
        $('#menu-toggle').click();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect($('#nav-menu').classList.contains('open')).toBe(false);
        expect(document.activeElement).toBe($('#menu-toggle'));
    });
});

describe('navigation: dropdowns', () => {
    it('marks dropdown triggers as popups', () => {
        expect(link('item-a').getAttribute('aria-haspopup')).toBe('true');
        expect(link('item-a').getAttribute('aria-expanded')).toBe('false');
        expect(link('item-c').hasAttribute('aria-haspopup')).toBe(false);
    });

    it('opens a dropdown on click and closes the others', () => {
        link('item-a').click();
        expect($('#item-a').classList.contains('open')).toBe(true);
        expect(link('item-a').getAttribute('aria-expanded')).toBe('true');

        link('item-b').click();
        expect($('#item-a').classList.contains('open')).toBe(false);
        expect(link('item-a').getAttribute('aria-expanded')).toBe('false');
        expect($('#item-b').classList.contains('open')).toBe(true);
    });

    it('toggles a dropdown closed with a second click', () => {
        link('item-a').click();
        link('item-a').click();
        expect($('#item-a').classList.contains('open')).toBe(false);
    });

    it('opens one sub dropdown at a time', () => {
        link('item-a').click();
        $('#sub-1 > .dropdown-link').click();
        expect($('#sub-1').classList.contains('open')).toBe(true);

        $('#sub-2 > .dropdown-link').click();
        expect($('#sub-1').classList.contains('open')).toBe(false);
        expect($('#sub-2').classList.contains('open')).toBe(true);
        expect($('#sub-2 > .dropdown-link').getAttribute('aria-expanded')).toBe('true');
    });

    it('closes open dropdowns on a click outside the navigation', () => {
        link('item-a').click();
        $('#outside').click();
        expect($('#item-a').classList.contains('open')).toBe(false);
        expect(link('item-a').getAttribute('aria-expanded')).toBe('false');
    });

    it('closes open dropdowns with Escape', () => {
        link('item-a').click();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect($('#item-a').classList.contains('open')).toBe(false);
    });

    it('ignores other keys', () => {
        link('item-a').click();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect($('#item-a').classList.contains('open')).toBe(true);
    });
});
