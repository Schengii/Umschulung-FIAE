// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadClassicScript } from '../../../scripts/test-support/classic-script.js';
import { trackDocumentListeners } from '../../../scripts/test-support/dom-helpers.js';

const NAMES = [
    'AppStorage',
    'renderHeader',
    'renderNav',
    'renderFooter',
    'renderBackToTop',
    'renderCookieBanner',
    'renderBreadcrumb',
    'initBreadcrumbs',
    'currentPageName',
    'injectHeader',
    'loadStylesheet',
];

const OriginalObserver = globalThis.MutationObserver;
/** @type {MutationObserver[]} */
let observers;
let untrack;
let systemLight;

/** components.js neu laden; Beobachter und Listener werden in afterEach wieder entfernt. */
function load() {
    return loadClassicScript('assets/js/components.js', NAMES);
}

function goTo(pathname) {
    window.history.pushState({}, '', pathname);
}

function resetPage() {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    for (const name of [...document.documentElement.attributes].map((a) => a.name)) {
        document.documentElement.removeAttribute(name);
    }
    localStorage.clear();
}

beforeEach(() => {
    observers = [];
    globalThis.MutationObserver = class extends OriginalObserver {
        constructor(callback) {
            super(callback);
            observers.push(this);
        }
    };
    untrack = trackDocumentListeners();
    systemLight = false;
    window.matchMedia = () => ({ matches: systemLight });
    resetPage();
    goTo('/pages/home.html');
});

afterEach(() => {
    observers.forEach((o) => o.disconnect());
    globalThis.MutationObserver = OriginalObserver;
    untrack();
    delete window.loadStylesheet;
});

describe('components.js: Start vor dem ersten Paint', () => {
    it('setzt Theme und Akzent aus dem Speicher', () => {
        localStorage.setItem('theme', 'light');
        localStorage.setItem('portfolio_accent', 'green');
        load();
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
        expect(document.documentElement.getAttribute('data-accent')).toBe('green');
    });

    it('folgt bei einem ersten Besuch dem hellen Farbschema des Systems', () => {
        systemLight = true;
        load();
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('nimmt ohne gespeicherte Wahl das dunkle Theme und den blauen Akzent', () => {
        load();
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
        expect(document.documentElement.getAttribute('data-accent')).toBe('blue');
    });

    it('übernimmt ?lang= und merkt es sich; Barrierefreiheits-Attribute kommen aus dem Speicher', () => {
        goTo('/pages/home.html?lang=en');
        localStorage.setItem('portfolio_dyslexia', 'true');
        localStorage.setItem('portfolio_colorblind', 'deuteranopia');
        localStorage.setItem('portfolio_font_scale', 'large');
        localStorage.setItem('portfolio_contrast', 'high');
        load();
        const root = document.documentElement;
        expect(root.getAttribute('lang')).toBe('en');
        expect(localStorage.getItem('lang')).toBe('en');
        expect(root.getAttribute('data-dyslexia')).toBe('true');
        expect(root.getAttribute('data-colorblind')).toBe('deuteranopia');
        expect(root.getAttribute('data-font-scale')).toBe('large');
        expect(root.getAttribute('data-contrast')).toBe('high');
    });

    it('ignoriert eine ungültige ?lang=-Angabe', () => {
        goTo('/pages/home.html?lang=fr');
        load();
        expect(document.documentElement.hasAttribute('lang')).toBe(false);
    });

    it('setzt für ein fehlschlagendes Bild den Platzhalter', () => {
        load();
        window.PLACEHOLDER_IMAGE = 'placeholder.svg';
        document.body.innerHTML =
            '<img id="a" data-img-fallback="fallback" src="x.png"><img id="b" data-img-fallback="contain" src="y.png"><img id="c" src="z.png">';
        for (const id of ['a', 'b', 'c']) {
            document.getElementById(id).dispatchEvent(new Event('error'));
        }
        // Das error-Ereignis bubbelt nicht; der Handler hängt in der Capture-Phase am document.
        expect(document.getElementById('a').classList.contains('img-fallback')).toBe(true);
        expect(document.getElementById('a').getAttribute('src')).toBe('placeholder.svg');
        expect(document.getElementById('b').style.objectFit).toBe('contain');
        expect(document.getElementById('c').getAttribute('src')).toBe('z.png');
        delete window.PLACEHOLDER_IMAGE;
    });
});

describe('components.js: AppStorage', () => {
    it('liest, schreibt und löscht Werte mit Standardwert', () => {
        const { AppStorage } = load();
        expect(AppStorage.isAvailable()).toBe(true);
        expect(AppStorage.getItem('k', 'fallback')).toBe('fallback');
        expect(AppStorage.setItem('k', 'v')).toBe(true);
        expect(AppStorage.getItem('k')).toBe('v');
        expect(AppStorage.removeItem('k')).toBe(true);
        expect(AppStorage.getItem('k')).toBeNull();
    });

    it('verhält sich ohne localStorage still (Standardwert, false)', () => {
        const { AppStorage } = load();
        const original = Object.getOwnPropertyDescriptor(window, 'localStorage');
        Object.defineProperty(window, 'localStorage', {
            configurable: true,
            get() {
                throw new Error('blocked');
            },
        });
        try {
            expect(AppStorage.isAvailable()).toBe(false);
            expect(AppStorage.getItem('k', 'x')).toBe('x');
            expect(AppStorage.setItem('k', 'v')).toBe(false);
            expect(AppStorage.removeItem('k')).toBe(false);
        } finally {
            Object.defineProperty(window, 'localStorage', original);
        }
    });
});

describe('components.js: Vorlagen', () => {
    it('markiert die Gruppe der aktuellen Seite in der Navigation', () => {
        const { renderNav } = load();
        document.body.innerHTML = renderNav('portfolio.html');
        const active = [...document.querySelectorAll('li.nav-item.active')];
        expect(active).toHaveLength(1);
        expect(active[0].querySelector('a').getAttribute('href')).toBe('portfolio.html');
        document.body.innerHTML = renderNav('home.html');
        expect(document.querySelector('li.nav-item.active a[href="#"]')).not.toBeNull();
        document.body.innerHTML = renderNav('unbekannt.html');
        expect(document.querySelector('li.nav-item.active')).toBeNull();
    });

    it('baut Links in pages/ ohne Präfix und im Root mit pages/', () => {
        const { renderNav } = load();
        goTo('/pages/home.html');
        expect(renderNav('home.html')).toContain('href="portfolio.html"');
        goTo('/index.html');
        const rootNav = renderNav('index.html');
        expect(rootNav).toContain('href="pages/portfolio.html"');
        expect(rootNav).toContain('href="index.html"');
    });

    it('rendert Kopfzeile, Fußzeile, Nach-oben-Knopf und Cookie-Hinweis', () => {
        const { renderHeader, renderFooter, renderBackToTop, renderCookieBanner } = load();
        expect(renderHeader('home.html')).toContain('class="app-header"');
        expect(renderHeader('home.html')).toContain('Hauptnavigation');
        expect(renderFooter()).toContain(String(new Date().getFullYear()));
        expect(renderBackToTop()).toContain('id="back-to-top"');
        expect(renderCookieBanner()).toContain('href="datenschutz.html"');
        goTo('/index.html');
        expect(renderCookieBanner()).toContain('href="pages/datenschutz.html"');
    });

    it('rendert Breadcrumbs mit letzter Seite ohne Link und escaped Beschriftungen', () => {
        const { renderBreadcrumb } = load();
        const html = renderBreadcrumb([
            { label_de: 'Start', label_en: 'Home', href: '../index.html' },
            { label_de: '<b>Böse</b>', label_en: 'Evil "quote"', href: 'javascript:alert(1)' },
            { label_de: 'Jetzt', label_en: 'Now' },
        ]);
        document.body.innerHTML = html;
        const links = [...document.querySelectorAll('a')].map((a) => a.getAttribute('href'));
        expect(links).toEqual(['../index.html', '#']);
        expect(document.querySelector('li[aria-current="page"]').textContent).toContain('Jetzt');
        expect(document.querySelector('b')).toBeNull();
        expect(html).toContain('&lt;b&gt;B');
    });

    it('lässt http(s)-Links in Breadcrumbs unverändert', () => {
        const { renderBreadcrumb } = load();
        const html = renderBreadcrumb([
            { label_de: 'Extern', label_en: 'External', href: 'https://example.com/a' },
            { label_de: 'Hier', label_en: 'Here' },
        ]);
        expect(html).toContain('href="https://example.com/a"');
    });
});

describe('components.js: Einfügen von Kopfzeile und Breadcrumbs', () => {
    it('ermittelt den Seitennamen aus dem Pfad, mit index.html als Rückfall', () => {
        const { currentPageName } = load();
        goTo('/pages/portfolio.html');
        expect(currentPageName()).toBe('portfolio.html');
        goTo('/');
        expect(currentPageName()).toBe('index.html');
    });

    it('ersetzt den Platzhalter durch die Kopfzeile und blendet die Suche auf anderen Seiten aus', () => {
        const { injectHeader } = load();
        goTo('/pages/portfolio.html');
        document.body.innerHTML =
            '<div id="site-header"></div><div id="site-nav"></div><div class="search-container"></div>';
        injectHeader();
        expect(document.querySelector('header.app-header')).not.toBeNull();
        expect(document.getElementById('site-nav')).toBeNull();
        expect(document.querySelector('.search-container').style.display).toBe('none');
    });

    it('lässt die Suche auf news.html sichtbar', () => {
        const { injectHeader } = load();
        goTo('/pages/news.html');
        document.body.innerHTML = '<div id="site-header"></div><div class="search-container"></div>';
        injectHeader();
        expect(document.querySelector('.search-container').style.display).toBe('');
    });

    it('füllt einen einzelnen Navigations-Platzhalter und tut ohne Platzhalter nichts', () => {
        const { injectHeader } = load();
        injectHeader();
        document.body.innerHTML = '<div id="site-nav"></div>';
        injectHeader();
        expect(document.querySelector('nav.topnav')).not.toBeNull();
    });

    it('füllt Breadcrumbs einmalig und meldet kaputte Daten nur als Warnung', () => {
        const { initBreadcrumbs } = load();
        document.body.innerHTML =
            '<div id="breadcrumb-container" data-items=\'[{"label_de":"A","label_en":"A","href":"x.html"},{"label_de":"B","label_en":"B"}]\'></div>';
        initBreadcrumbs();
        const container = document.getElementById('breadcrumb-container');
        expect(container.dataset.rendered).toBe('true');
        const first = container.innerHTML;
        initBreadcrumbs();
        expect(container.innerHTML).toBe(first);

        document.body.innerHTML = '<div id="breadcrumb-container" data-items="{kaputt"></div>';
        initBreadcrumbs();
        expect(document.getElementById('breadcrumb-container').dataset.rendered).toBeUndefined();
        document.body.innerHTML = '';
        expect(() => initBreadcrumbs()).not.toThrow();
    });

    it('lädt ein Stylesheet vor style.css nach, nur einmal, und löst auch bei Fehlern auf', async () => {
        load();
        document.head.innerHTML = '<link rel="stylesheet" href="../assets/css/style.css">';
        const first = window.loadStylesheet('assets/css/modules/foo.css');
        const link = document.querySelector('link[href$="foo.css"]');
        expect(link.getAttribute('href')).toBe('../assets/css/modules/foo.css');
        expect(link.nextElementSibling.getAttribute('href')).toContain('style.css');
        link.onerror();
        await first;
        await window.loadStylesheet('assets/css/modules/foo.css');
        expect(document.querySelectorAll('link[href$="foo.css"]')).toHaveLength(1);
    });

    it('hängt das Stylesheet ohne style.css an den head und lässt im Root den Präfix weg', () => {
        load();
        goTo('/index.html');
        window.loadStylesheet('assets/css/modules/bar.css');
        expect(document.head.lastElementChild.getAttribute('href')).toBe('assets/css/modules/bar.css');
    });
});

describe('components.js: DOMContentLoaded', () => {
    function boot(extraBody = '') {
        load();
        document.body.innerHTML = `<div id="site-header"></div><div id="site-footer"></div>${extraBody}`;
        let ready = false;
        document.addEventListener('fiae:layout-ready', () => (ready = true));
        document.dispatchEvent(new Event('DOMContentLoaded'));
        return () => ready;
    }

    it('fügt Kopfzeile, Fußzeile, Nach-oben-Knopf und Cookie-Hinweis ein und meldet layout-ready', () => {
        const isReady = boot();
        expect(document.querySelector('header.app-header')).not.toBeNull();
        expect(document.querySelector('footer')).not.toBeNull();
        expect(document.getElementById('back-to-top')).not.toBeNull();
        expect(document.getElementById('cookie-banner')).not.toBeNull();
        expect(document.querySelector('link[rel="manifest"]').getAttribute('href')).toBe('../manifest.json');
        expect(document.querySelector('script[src*="command_palette.js"]')).not.toBeNull();
        expect(isReady()).toBe(true);
    });

    it('zeigt den Cookie-Hinweis nicht, wenn bereits zugestimmt wurde', () => {
        localStorage.setItem('cookieConsent', 'true');
        boot();
        expect(document.getElementById('cookie-banner')).toBeNull();
    });

    it('verkleinert die Kopfzeile beim Scrollen', () => {
        boot();
        const header = document.querySelector('.app-header');
        Object.defineProperty(window, 'scrollY', { configurable: true, value: 100 });
        window.dispatchEvent(new Event('scroll'));
        expect(header.classList.contains('scrolled')).toBe(true);
        Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
        window.dispatchEvent(new Event('scroll'));
        expect(header.classList.contains('scrolled')).toBe(false);
    });
});

describe('components.js: Barrierefreiheits-Schalter', () => {
    function boot() {
        load();
        document.body.innerHTML = '<div id="site-header"></div>';
        document.dispatchEvent(new Event('DOMContentLoaded'));
        return {
            events: (() => {
                /** @type {CustomEvent[]} */
                const list = [];
                window.addEventListener('fiae:a11y-change', (e) => list.push(e));
                return list;
            })(),
        };
    }

    it('öffnet das Menü per Klick, schließt es per Außenklick und Escape', () => {
        boot();
        const toggle = document.getElementById('a11y-toggle');
        const dropdown = document.getElementById('a11y-dropdown');
        dropdown.style.display = 'none';
        toggle.click();
        expect(dropdown.style.display).toBe('block');
        document.body.click();
        expect(dropdown.style.display).toBe('none');
        toggle.click();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(dropdown.style.display).toBe('none');
    });

    it('schaltet Legasthenie-Modus um und speichert ihn', () => {
        const { events } = boot();
        const button = document.getElementById('btn-toggle-dyslexia');
        button.click();
        expect(document.documentElement.getAttribute('data-dyslexia')).toBe('true');
        expect(localStorage.getItem('portfolio_dyslexia')).toBe('true');
        expect(button.classList.contains('active')).toBe(true);
        button.click();
        expect(document.documentElement.hasAttribute('data-dyslexia')).toBe(false);
        expect(localStorage.getItem('portfolio_dyslexia')).toBe('false');
        expect(events.map((e) => e.detail)).toEqual([
            { feature: 'dyslexia', value: true },
            { feature: 'dyslexia', value: false },
        ]);
    });

    it('schaltet Farbfehlsichtigkeit um', () => {
        const { events } = boot();
        const button = document.getElementById('btn-toggle-colorblind');
        button.click();
        expect(document.documentElement.getAttribute('data-colorblind')).toBe('deuteranopia');
        button.click();
        expect(document.documentElement.hasAttribute('data-colorblind')).toBe(false);
        expect(events.map((e) => e.detail.value)).toEqual(['deuteranopia', '']);
    });

    it('schaltet die Schriftgröße durch normal, groß, sehr groß', () => {
        const { events } = boot();
        const button = document.getElementById('btn-toggle-font-scale');
        button.click();
        expect(document.documentElement.getAttribute('data-font-scale')).toBe('large');
        button.click();
        expect(document.documentElement.getAttribute('data-font-scale')).toBe('xlarge');
        button.click();
        expect(document.documentElement.hasAttribute('data-font-scale')).toBe(false);
        expect(events.map((e) => e.detail.value)).toEqual(['large', 'xlarge', 'normal']);
    });

    it('schaltet den hohen Kontrast um', () => {
        const { events } = boot();
        const button = document.getElementById('btn-toggle-high-contrast');
        button.click();
        expect(document.documentElement.getAttribute('data-contrast')).toBe('high');
        expect(localStorage.getItem('portfolio_contrast')).toBe('high');
        button.click();
        expect(document.documentElement.hasAttribute('data-contrast')).toBe(false);
        expect(events.map((e) => e.detail.value)).toEqual([true, false]);
    });

    it('markiert Schalter beim Start als aktiv, wenn die Einstellung schon gesetzt ist', () => {
        document.documentElement.setAttribute('data-dyslexia', 'true');
        document.documentElement.setAttribute('data-colorblind', 'deuteranopia');
        document.documentElement.setAttribute('data-font-scale', 'large');
        document.documentElement.setAttribute('data-contrast', 'high');
        load();
        document.body.innerHTML = '<div id="site-header"></div>';
        document.dispatchEvent(new Event('DOMContentLoaded'));
        for (const id of ['dyslexia', 'colorblind', 'font-scale', 'high-contrast']) {
            expect(document.getElementById(`btn-toggle-${id}`).classList.contains('active')).toBe(true);
        }
    });
});
