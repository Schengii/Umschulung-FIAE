// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installPageGlobals, removePageGlobals, resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import { initUsernameGreeting } from './username-greeting.js';

const WELCOME_PAGE = `
    <h1 id="myH1"></h1>
    <input id="myText">
    <button id="mySubmit"><span lang="de">Eintreten</span><span lang="en">Enter</span></button>`;

const DASHBOARD_PAGE = `
    <p id="welcome-text"></p>
    <div id="recruiter-greeting-banner" style="display: none">
        <h2 class="recruiter-title"></h2>
        <p class="recruiter-desc"></p>
    </div>
    <div id="recruiter-tracker-card" style="display: none">
        <span class="tracker-company-name"></span>
        <div class="tracker-footer-note" style="display: none"><span class="tracker-contact-name"></span></div>
    </div>`;

let storage;

const setUrl = (search = '') => window.happyDOM.setURL(`http://localhost/pages/home.html${search}`);
const $ = (selector) => document.querySelector(selector);

beforeEach(() => {
    storage = installPageGlobals();
    globalThis.STORAGE_KEYS.USERNAME = 'username';
    window.sessionStorage.clear();
    setUrl();
    resetDocument();
});
afterEach(() => {
    removePageGlobals();
    vi.useRealTimers();
    document.documentElement.removeAttribute('lang');
});

describe('username greeting: recruiter links', () => {
    it('greets a company and a name from the query string, escaping both', () => {
        setUrl('?c=Acme%20%3Cb%3EGmbH%3C%2Fb%3E&n=Erika%20%22Muster%22');
        resetDocument(DASHBOARD_PAGE);
        initUsernameGreeting();

        const title = $('.recruiter-title');
        expect($('#recruiter-greeting-banner').style.display).toBe('block');
        expect(title.textContent).toContain('Herzlich willkommen, Erika "Muster" vom Team Acme <b>GmbH</b>!');
        expect(title.querySelector('b')).toBeNull();
        expect(title.querySelectorAll('strong')).toHaveLength(2);
    });

    it('accepts the long parameter names and trims the values', () => {
        setUrl('?company=%20Initech%20&name=%20Bob%20');
        resetDocument(DASHBOARD_PAGE);
        initUsernameGreeting();
        expect(window.sessionStorage.getItem('recruiter_company')).toBe('Initech');
        expect(window.sessionStorage.getItem('recruiter_name')).toBe('Bob');
    });

    it('greets a company alone and shows the application tracker', () => {
        setUrl('?c=Acme');
        resetDocument(DASHBOARD_PAGE);
        initUsernameGreeting();

        expect($('.recruiter-title').textContent).toContain('Team von Acme');
        expect($('#recruiter-tracker-card').style.display).toBe('block');
        expect($('.tracker-company-name').textContent).toBe('Acme');
        expect($('.tracker-footer-note').style.display).toBe('none');
    });

    it('greets a name alone and keeps the tracker hidden', () => {
        setUrl('?n=Erika');
        resetDocument(DASHBOARD_PAGE);
        initUsernameGreeting();

        expect($('.recruiter-title').textContent).toContain('Herzlich willkommen, Erika!');
        expect($('#recruiter-tracker-card').style.display).toBe('none');
    });

    it('names the contact person in the tracker when both are known', () => {
        setUrl('?c=Acme&n=Erika');
        resetDocument(DASHBOARD_PAGE);
        initUsernameGreeting();
        expect($('.tracker-footer-note').style.display).toBe('flex');
        expect($('.tracker-contact-name').textContent).toBe('Erika');
    });

    it('does not mix an old session greeting with a new one', () => {
        window.sessionStorage.setItem('recruiter_company', 'Alt GmbH');
        setUrl('?n=Neu');
        resetDocument(DASHBOARD_PAGE);
        initUsernameGreeting();
        expect(window.sessionStorage.getItem('recruiter_company')).toBeNull();
        expect(window.sessionStorage.getItem('recruiter_name')).toBe('Neu');
    });

    it('keeps the greeting for the rest of the session and speaks English on demand', () => {
        window.sessionStorage.setItem('recruiter_name', 'Erika');
        resetDocument(DASHBOARD_PAGE);
        document.documentElement.setAttribute('lang', 'en');
        initUsernameGreeting();
        expect($('.recruiter-title').textContent).toContain('Warm welcome, Erika!');
        expect($('#welcome-text').textContent).toContain('Great to have you here!');
    });
});

describe('username greeting: dashboard without a recruiter link', () => {
    it('greets with the stored name', () => {
        storage.setItem('username', 'Erika');
        resetDocument(DASHBOARD_PAGE);
        initUsernameGreeting();
        expect($('#welcome-text').textContent).toBe('Hallo, Erika! Willkommen auf meinem Umschulungs-Portfolio.');
        expect($('#recruiter-greeting-banner').style.display).toBe('none');
    });

    it('greets anonymously without a name and re-renders on a language change', () => {
        resetDocument(DASHBOARD_PAGE);
        initUsernameGreeting();
        expect($('#welcome-text').textContent).toBe('Hallo! Willkommen auf meinem Umschulungs-Portfolio.');

        document.documentElement.setAttribute('lang', 'en');
        document.dispatchEvent(new CustomEvent('langchange'));
        expect($('#welcome-text').textContent).toBe('Hello! Welcome to my retraining portfolio.');
    });

    it('never renders the stored name as markup', () => {
        storage.setItem('username', '<img src=x onerror=alert(1)>');
        resetDocument(DASHBOARD_PAGE);
        initUsernameGreeting();
        expect($('#welcome-text').querySelector('img')).toBeNull();
    });
});

describe('username greeting: welcome page', () => {
    it('prefills the stored name and shows the personal heading', () => {
        storage.setItem('username', 'Erika');
        resetDocument(WELCOME_PAGE);
        initUsernameGreeting();
        expect($('#myText').value).toBe('Erika');
        expect($('#myH1').textContent).toBe('Willkommen zurück, Erika!');
    });

    it('shows the plain heading for a new visitor and in English', () => {
        resetDocument(WELCOME_PAGE);
        document.documentElement.setAttribute('lang', 'en');
        initUsernameGreeting();
        document.dispatchEvent(new CustomEvent('langchange'));
        expect($('#myH1').textContent).toBe('Welcome');
    });

    it('stores the name, confirms it and moves on to the home page', () => {
        vi.useFakeTimers();
        resetDocument(WELCOME_PAGE);
        initUsernameGreeting();
        $('#myText').value = '  Erika  ';
        $('#mySubmit').click();

        expect(storage.getItem('username')).toBe('Erika');
        expect($('#myH1').textContent).toBe('Willkommen zurück, Erika!');
        expect($('#mySubmit').textContent).toContain('Gespeichert!');
        expect($('#mySubmit').style.backgroundColor).not.toBe('');

        vi.advanceTimersByTime(800);
        expect($('#mySubmit').textContent).toContain('Eintreten');
        expect($('#mySubmit').style.backgroundColor).toBe('');
    });

    it('keeps focus in the field instead of saving an empty name', () => {
        resetDocument(WELCOME_PAGE);
        initUsernameGreeting();
        $('#myText').value = '   ';
        $('#mySubmit').click();
        expect(storage.getItem('username')).toBeNull();
        expect(document.activeElement).toBe($('#myText'));
    });

    it('submits with the Enter key', () => {
        vi.useFakeTimers();
        resetDocument(WELCOME_PAGE);
        initUsernameGreeting();
        $('#myText').value = 'Erika';
        $('#myText').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(storage.getItem('username')).toBe('Erika');
    });
});
