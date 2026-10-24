// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resetDocument, trackDocumentListeners } from '../../../scripts/test-support/dom-helpers.js';

const PAGE = `
    <ul>
        <li><strong>Vortrag <b>1</b></strong> <a id="pptx" href="../assets/powerpoint/vortrag.pptx">Folien</a></li>
    </ul>
    <a id="docx" href="../Bewerbungsunterlagen/lebenslauf.docx">Lebenslauf</a>
    <a id="cert" href="../Bewerbungsunterlagen/extracted_images/zeugnis.png">Zeugnis</a>
    <a id="plain" href="home.html">Zur Startseite</a>`;

const el = (id) => document.getElementById(id);
const modal = () => el('doc-preview-modal');
const body = () => modal().querySelector('.doc-preview-body');

async function start() {
    vi.resetModules();
    resetDocument(PAGE);
    const { initDocumentPreview } = await import('./document-preview.js');
    initDocumentPreview();
}

describe('document preview', () => {
    let removeListeners;

    beforeEach(() => {
        removeListeners = trackDocumentListeners();
        vi.useFakeTimers();
        window.loadStylesheet = vi.fn();
    });

    afterEach(() => {
        removeListeners();
        vi.useRealTimers();
        delete window.loadStylesheet;
    });

    it('injects one hidden modal dialog and loads its stylesheet', async () => {
        await start();
        expect(document.querySelectorAll('#doc-preview-modal')).toHaveLength(1);
        expect(modal().classList.contains('hidden')).toBe(true);
        expect(modal().getAttribute('role')).toBe('dialog');
        expect(modal().getAttribute('aria-modal')).toBe('true');
        expect(window.loadStylesheet).toHaveBeenCalledWith('assets/css/modules/document_preview.css');
    });

    it('leaves ordinary links alone', async () => {
        await start();
        const click = new Event('click', { bubbles: true, cancelable: true });
        el('plain').dispatchEvent(click);
        expect(click.defaultPrevented).toBe(false);
        expect(modal().classList.contains('show')).toBe(false);
    });

    it('previews a certificate image with full-screen and download links', async () => {
        await start();
        const click = new Event('click', { bubbles: true, cancelable: true });
        el('cert').dispatchEvent(click);
        expect(click.defaultPrevented).toBe(true);
        expect(modal().classList.contains('show')).toBe(true);
        expect(modal().getAttribute('aria-hidden')).toBe('false');
        expect(body().querySelector('img').getAttribute('src')).toContain('zeugnis.png');
        const links = [...body().querySelectorAll('a')].map((a) => a.getAttribute('href'));
        expect(links).toEqual([expect.stringContaining('zeugnis.png'), expect.stringContaining('zeugnis.png')]);
        expect(body().querySelector('a[target="_blank"]').getAttribute('rel')).toBe('noopener');
        expect(document.body.style.overflow).toBe('hidden');
    });

    it('shows a download card for a docx file in the page language', async () => {
        await start();
        document.documentElement.setAttribute('lang', 'en');
        el('docx').click();
        expect(body().textContent).toContain('Application Portfolio / CV');
        expect(body().textContent).toContain('Download File');
        expect(body().querySelector('a[download]').getAttribute('href')).toContain('lebenslauf.docx');
    });

    it('takes the title of a presentation from its list item, as text', async () => {
        await start();
        el('pptx').click();
        expect(body().querySelector('.doc-preview-file-title').textContent).toBe('Vortrag 1');
        expect(body().textContent).toContain('PowerPoint Präsentation (PPTX)');
    });

    it('never turns a title from the page into markup', async () => {
        await start();
        el('pptx').closest('li').querySelector('strong').textContent = '<img src=x onerror=1>';
        el('pptx').click();
        expect(body().querySelector('img')).toBeNull();
        expect(body().querySelector('.doc-preview-file-title').textContent).toBe('<img src=x onerror=1>');
    });

    it('announces the unlock of the CV achievement for application documents only', async () => {
        await start();
        const unlocked = vi.fn();
        document.addEventListener('achievement:unlock', (event) => unlocked(event.detail));
        el('docx').click();
        el('pptx').click();
        expect(unlocked).toHaveBeenCalledTimes(1);
        expect(unlocked).toHaveBeenCalledWith('cv_downloaded');
    });

    it('moves the focus to the close button and hands it back on close', async () => {
        await start();
        el('docx').focus();
        el('docx').click();
        expect(document.activeElement).toBe(modal().querySelector('.doc-preview-close'));

        modal().querySelector('.doc-preview-close').click();
        expect(document.activeElement).toBe(el('docx'));
        expect(modal().getAttribute('aria-hidden')).toBe('true');
        expect(document.body.style.overflow).toBe('');
        vi.advanceTimersByTime(400);
        expect(modal().classList.contains('hidden')).toBe(true);
    });

    it('closes on Escape and on the backdrop, and not on Escape while closed', async () => {
        await start();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(modal().classList.contains('show')).toBe(false);

        el('docx').click();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(modal().classList.contains('show')).toBe(false);

        el('docx').click();
        modal().querySelector('.doc-preview-backdrop').click();
        expect(modal().classList.contains('show')).toBe(false);
    });
});
