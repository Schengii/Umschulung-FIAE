// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import { initContactForm, checkSubmission, MIN_FILL_MS, COOLDOWN_MS, LIMITS } from './contact-form.js';

const PAGE = `
    <form id="contact-form" onsubmit="return false">
        <input id="contact-name">
        <input id="contact-email">
        <textarea id="contact-message"></textarea>
        <input type="text" name="botcheck" value="">
        <button type="submit">Senden</button>
    </form>
    <div id="form-feedback" style="display: none"></div>`;

const field = (id, value) => {
    document.getElementById(id).value = value;
};
// Time is controlled: the form measures how long it has been on the page.
let now = 1_000_000;
const fill = (name = 'Erika', email = 'erika@example.org', message = 'Hallo') => {
    now += MIN_FILL_MS + 1000;
    field('contact-name', name);
    field('contact-email', email);
    field('contact-message', message);
};
const submit = () =>
    document.getElementById('contact-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
const feedback = () => document.getElementById('form-feedback');
const flush = async () => {
    for (let i = 0; i < 6; i++) await Promise.resolve();
};

beforeEach(() => {
    now = 1_000_000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    resetDocument(PAGE);
    delete globalThis.APP;
});
afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    delete globalThis.APP;
});

describe('contact-form: binding', () => {
    it('does nothing on pages without a contact form', () => {
        resetDocument('');
        expect(() => initContactForm()).not.toThrow();
    });

    it('removes the inline onsubmit handler and prevents the native submit', () => {
        initContactForm();
        expect(document.getElementById('contact-form').hasAttribute('onsubmit')).toBe(false);
        expect(submit()).toBe(false);
    });
});

describe('contact-form: validation', () => {
    it('asks for all fields when one is empty', () => {
        initContactForm();
        fill('Erika', 'erika@example.org', '   ');
        submit();
        expect(feedback().className).toBe('form-feedback warning');
        expect(feedback().textContent).toContain('Bitte füllen Sie alle Felder aus.');
    });

    it('rejects an invalid e-mail address', () => {
        initContactForm();
        fill('Erika', 'keine-mail');
        submit();
        expect(feedback().className).toBe('form-feedback warning');
        expect(feedback().textContent).toContain('gültige E-Mail-Adresse');
    });

    it('swallows honeypot submissions with a fake success message', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        globalThis.fetch = vi.fn();
        initContactForm();
        fill();
        document.querySelector('input[name="botcheck"]').value = 'bot';
        submit();

        expect(feedback().className).toBe('form-feedback success');
        expect(globalThis.fetch).not.toHaveBeenCalled();
        expect(document.getElementById('contact-name').value).toBe('');
    });
});

describe('contact-form: without a Web3Forms key', () => {
    it('shows the address with a prefilled mailto link instead of sending anything', () => {
        globalThis.fetch = vi.fn();
        initContactForm();
        fill('Erika Muster', 'erika@example.org', 'Guten Tag');
        submit();

        expect(feedback().className).toBe('form-feedback info');
        const href = feedback().querySelector('a').getAttribute('href');
        expect(href).toContain('mailto:sche-max@web.de');
        expect(href).toContain(encodeURIComponent('Portfolio Kontakt von Erika Muster'));
        expect(href).toContain(encodeURIComponent('Guten Tag'));
        expect(globalThis.fetch).not.toHaveBeenCalled();
    });
});

describe('contact-form: with a Web3Forms key', () => {
    const respond = (payload) => vi.fn(() => Promise.resolve({ json: () => Promise.resolve(payload) }));

    beforeEach(() => {
        globalThis.APP = { WEB3FORMS_KEY: 'test-key' };
    });

    it('posts the message as JSON and reports success', async () => {
        globalThis.fetch = respond({ success: true });
        initContactForm();
        fill('Erika', 'erika@example.org', 'Hallo');
        submit();
        await flush();

        const [url, options] = globalThis.fetch.mock.calls[0];
        expect(url).toBe('https://api.web3forms.com/submit');
        expect(JSON.parse(options.body)).toMatchObject({
            access_key: 'test-key',
            name: 'Erika',
            email: 'erika@example.org',
            message: 'Hallo',
            botcheck: false,
        });
        expect(feedback().className).toBe('form-feedback success');
        expect(document.getElementById('contact-name').value).toBe('');
    });

    it('disables the button while sending and restores it afterwards', async () => {
        globalThis.fetch = respond({ success: true });
        initContactForm();
        fill();
        const button = document.querySelector('button[type="submit"]');
        submit();
        expect(button.disabled).toBe(true);
        expect(button.textContent).toContain('Wird gesendet');

        await flush();
        expect(button.disabled).toBe(false);
        expect(button.textContent).toBe('Senden');
    });

    it('falls back to the mail client when the service reports an error', async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        globalThis.fetch = respond({ success: false, message: 'quota' });
        initContactForm();
        fill('Erika', 'erika@example.org', 'Hallo');
        submit();
        await flush();

        expect(feedback().className).toBe('form-feedback warning');
        expect(feedback().textContent).toContain('Fehler beim Senden');
    });

    it('hides the feedback again after a few seconds', async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        globalThis.fetch = respond({ success: true });
        initContactForm();
        fill();
        submit();
        await flush();

        vi.advanceTimersByTime(6000);
        expect(feedback().style.display).toBe('none');
    });
});

describe('checkSubmission', () => {
    const ok = { name: 'Erika', email: 'e@x.de', message: 'Hallo', elapsedMs: MIN_FILL_MS, sinceLastSendMs: null };

    it('lässt eine normale Eingabe durch', () => {
        expect(checkSubmission(ok)).toBeNull();
    });

    it('bremst zu schnelles Absenden', () => {
        expect(checkSubmission({ ...ok, elapsedMs: MIN_FILL_MS - 1 }).reason).toBe('too-fast');
    });

    it('sperrt nach dem Senden für die Dauer der Wartezeit', () => {
        const blocked = checkSubmission({ ...ok, sinceLastSendMs: 10_000 });
        expect(blocked.reason).toBe('cooldown');
        expect(blocked.de).toContain('50 Sekunden');
        expect(checkSubmission({ ...ok, sinceLastSendMs: COOLDOWN_MS })).toBeNull();
    });

    it('begrenzt die Längen der Felder', () => {
        expect(checkSubmission({ ...ok, message: 'x'.repeat(LIMITS.message + 1) }).reason).toBe('too-long');
        expect(checkSubmission({ ...ok, name: 'x'.repeat(LIMITS.name + 1) }).reason).toBe('too-long');
        expect(checkSubmission({ ...ok, message: 'x'.repeat(LIMITS.message) })).toBeNull();
    });
});

describe('contact-form: Missbrauchsschutz', () => {
    beforeEach(() => {
        globalThis.APP = { WEB3FORMS_KEY: 'test-key' };
    });

    it('sendet nicht, wenn das Formular sofort nach dem Laden abgeschickt wird', () => {
        globalThis.fetch = vi.fn();
        initContactForm();
        field('contact-name', 'Bot');
        field('contact-email', 'bot@example.org');
        field('contact-message', 'Spam');
        submit();
        expect(globalThis.fetch).not.toHaveBeenCalled();
        expect(feedback().textContent).toContain('sehr schnell');
    });

    it('sperrt ein zweites Absenden direkt nach dem Erfolg', async () => {
        globalThis.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ success: true }) }));
        initContactForm();
        fill();
        submit();
        await flush();
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);

        fill();
        submit();
        await flush();
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);
        expect(feedback().textContent).toContain('Bitte warte noch');

        now += COOLDOWN_MS;
        fill();
        submit();
        await flush();
        expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });
});
