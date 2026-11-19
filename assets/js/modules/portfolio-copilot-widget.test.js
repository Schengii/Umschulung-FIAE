// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initPortfolioCopilot } from './portfolio-copilot.js';

const $ = (id) => document.getElementById(id);
const botMessages = () => [...document.querySelectorAll('#copilot-messages .copilot-msg.bot')];

async function setup(lang = 'de') {
    document.documentElement.lang = lang;
    document.body.innerHTML = '';
    window.history.replaceState(null, '', '/pages/portfolio.html');
    await initPortfolioCopilot();
}

function ask(text) {
    $('copilot-input').value = text;
    $('copilot-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
}

describe('Portfolio-Assistent (Widget)', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('legt das Widget nur einmal an und beschriftet es zweisprachig', async () => {
        await setup();
        await initPortfolioCopilot();
        expect(document.querySelectorAll('#portfolio-copilot-container')).toHaveLength(1);
        expect($('copilot-toggle-btn').getAttribute('data-en-aria-label')).toBeTruthy();
        expect($('copilot-chat-box').getAttribute('role')).toBe('dialog');
    });

    it('öffnet und schließt per Knopf, Schließen-Knopf und Escape und pflegt aria-expanded', async () => {
        await setup();
        const toggle = $('copilot-toggle-btn');
        toggle.click();
        expect($('copilot-chat-box').style.display).toBe('flex');
        expect(toggle.getAttribute('aria-expanded')).toBe('true');
        toggle.click();
        expect($('copilot-chat-box').style.display).toBe('none');

        toggle.click();
        $('copilot-close-btn').click();
        expect($('copilot-chat-box').style.display).toBe('none');

        toggle.click();
        document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
        expect($('copilot-chat-box').style.display).toBe('none');
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
    });

    it('beantwortet eine Frage mit der besten Antwort und Link, nach kurzer Tipp-Anzeige', async () => {
        await setup();
        ask('Erzähle mir vom IHK Abschlussprojekt EcoChef');
        expect(document.querySelector('.copilot-msg.user').textContent).toContain('EcoChef');
        expect($('copilot-typing-indicator')).not.toBeNull();
        expect($('copilot-input').value).toBe('');

        vi.advanceTimersByTime(300);
        expect($('copilot-typing-indicator')).toBeNull();
        const reply = botMessages().at(-1);
        expect(reply.querySelector('a.copilot-link-btn').getAttribute('href')).toContain('ihk-cockpit.html');
    });

    it('antwortet auf Englisch, wenn die Seite Englisch ist', async () => {
        await setup('en');
        ask('Tell me about the IHK graduation project EcoChef');
        vi.advanceTimersByTime(300);
        expect(botMessages().at(-1).textContent).not.toContain('Danke für deine Frage');
    });

    it('nutzt bei unbekannten Fragen die Rückfall-Antwort mit Portfolio-Link', async () => {
        await setup();
        ask('qqqq zzzz');
        vi.advanceTimersByTime(300);
        const reply = botMessages().at(-1);
        expect(reply.textContent).toContain('Danke für deine Frage');
        expect(reply.querySelector('a').getAttribute('href')).toContain('portfolio.html');
    });

    it('ignoriert leere Eingaben', async () => {
        await setup();
        ask('   ');
        expect(document.querySelector('.copilot-msg.user')).toBeNull();
    });

    it('stellt Fragen über die Vorschlags-Chips und setzt den Chat zurück', async () => {
        await setup();
        document.querySelector('.copilot-chip').click();
        expect(document.querySelector('.copilot-msg.user')).not.toBeNull();
        vi.advanceTimersByTime(300);

        $('copilot-clear-btn').click();
        expect(document.querySelector('.copilot-msg.user')).toBeNull();
        expect(botMessages()).toHaveLength(1);
        expect(document.querySelectorAll('.copilot-chip').length).toBeGreaterThan(0);
    });

    it('setzt Nutzereingaben nur als Text ein (kein HTML-Einschleusen)', async () => {
        await setup();
        ask('<img src=x onerror=alert(1)>');
        expect(document.querySelector('.copilot-msg.user img')).toBeNull();
    });
});
