// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadClassicScript } from '../../../scripts/test-support/classic-script.js';
import {
    installPageGlobals,
    removePageGlobals,
    trackDocumentListeners,
} from '../../../scripts/test-support/dom-helpers.js';

// Seiten-Script architecture.js (klassisch): Komponentendetails, Tabs, API-Explorer und 3D-Ansicht.
const PAGE = `
    <button id="tab-btn-ecochef" class="active"></button><button id="tab-btn-elektrocheck"></button>
    <button id="tab-btn-api"></button><button id="tab-btn-3d"></button>
    <div id="panel-ecochef"><svg>
        <g class="hotspot" data-project="ecochef" data-component="service"></g>
        <g class="hotspot" data-project="ecochef" data-component="controller"></g>
    </svg><div id="details-pane" class="collapsed"><h4 id="details-title"></h4><p id="details-tech"></p><p id="details-desc"></p></div></div>
    <div id="panel-elektrocheck" class="collapsed"><svg><g class="hotspot" data-project="elektrocheck" data-component="client"></g></svg></div>
    <div id="panel-api" class="collapsed"><div id="api-routes-list"></div><div id="api-details-container"></div></div>
    <div id="panel-3d" class="collapsed"><canvas id="arch-3d-canvas"></canvas></div>
`;

let untrack;
let storage;
/** @type {any} */
let explorer;

function boot() {
    storage = installPageGlobals();
    document.body.innerHTML = PAGE;
    const { ArchitectureExplorer, ARCHITECTURE_DATA, API_ROUTES } = loadClassicScript('assets/js/architecture.js', [
        'ArchitectureExplorer',
        'ARCHITECTURE_DATA',
        'API_ROUTES',
    ]);
    explorer = new ArchitectureExplorer();
    return { ArchitectureExplorer, ARCHITECTURE_DATA, API_ROUTES };
}

const text = (id) => document.getElementById(id).textContent;

/**
 * Bekannter Fund (PLAN.md, „Neu gefunden“): renderApiDetails() löst langchange aus, dessen Handler im API-Tab
 * wieder renderApiRoutes() aufruft, also endlos. Die Tests unterdrücken das Ereignis, damit sie den Rest prüfen.
 */
function muteLangchange() {
    const original = document.dispatchEvent.bind(document);
    vi.spyOn(document, 'dispatchEvent').mockImplementation((event) =>
        event.type === 'langchange' ? true : original(event)
    );
}

/** requestAnimationFrame von Hand steuern (die Fake-Timer erfassen es in happy-dom nicht zuverlässig). */
function stubAnimationFrames() {
    /** @type {Function[]} */
    const queue = [];
    vi.stubGlobal('requestAnimationFrame', (/** @type {Function} */ callback) => queue.push(callback));
    vi.stubGlobal('cancelAnimationFrame', () => {});
    return () => queue.splice(0).forEach((callback) => callback());
}

beforeEach(() => {
    untrack = trackDocumentListeners();
    document.documentElement.setAttribute('lang', 'de');
    vi.useFakeTimers();
});

afterEach(() => {
    untrack();
    removePageGlobals();
    delete window.addLiveCommit;
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('architecture.js: Komponenten', () => {
    it('zeigt beim Start die Details des EcoChef-Clients', () => {
        const { ARCHITECTURE_DATA } = boot();
        expect(text('details-title')).toBe(ARCHITECTURE_DATA.ecochef.client.titleDe);
        expect(document.getElementById('details-pane').classList.contains('collapsed')).toBe(false);
    });

    it('zeigt die Details eines angeklickten Hotspots, markiert ihn und zählt einen Übungs-Commit', () => {
        const { ARCHITECTURE_DATA } = boot();
        const hotspot = document.querySelector('[data-component="service"]');
        hotspot.dispatchEvent(new Event('click'));
        expect(text('details-title')).toBe(ARCHITECTURE_DATA.ecochef.service.titleDe);
        expect(text('details-tech')).toBe(ARCHITECTURE_DATA.ecochef.service.techDe);
        expect(hotspot.classList.contains('active-hotspot')).toBe(true);
        expect(document.querySelectorAll('.active-hotspot')).toHaveLength(1);
        expect(storage.getItem('github_live_commits_today')).toBe('1');
    });

    it('nutzt addLiveCommit, wenn die Seite es bereitstellt', () => {
        window.addLiveCommit = vi.fn();
        boot();
        document.querySelector('.hotspot').dispatchEvent(new Event('click'));
        expect(window.addLiveCommit).toHaveBeenCalledTimes(1);
        expect(storage.getItem('github_live_commits_today')).toBeNull();
    });

    it('meldet den Wechsel der Komponente und ignoriert unbekannte Namen', () => {
        boot();
        const seen = vi.fn();
        window.addEventListener('c4componentchange', (e) => seen(e.detail));
        explorer.showComponentDetails('ecochef', 'repo');
        expect(seen).toHaveBeenCalledWith({ project: 'ecochef', component: 'repo' });
        explorer.showComponentDetails('gibtsnicht', 'x');
        explorer.showComponentDetails('ecochef', 'gibtsnicht');
        expect(seen).toHaveBeenCalledTimes(1);
    });

    it('übersetzt die angezeigte Komponente bei Sprachwechsel', () => {
        const { ARCHITECTURE_DATA } = boot();
        document.querySelector('[data-component="controller"]').dispatchEvent(new Event('click'));
        document.dispatchEvent(new CustomEvent('langchange', { detail: 'en' }));
        expect(text('details-title')).toBe(ARCHITECTURE_DATA.ecochef.controller.titleEn);
    });
});

describe('architecture.js: Tabs', () => {
    it('wechselt Tabs und Panels und nimmt die Detailleiste mit', () => {
        boot();
        document.getElementById('tab-btn-elektrocheck').click();
        expect(document.getElementById('tab-btn-elektrocheck').classList.contains('active')).toBe(true);
        expect(document.getElementById('tab-btn-ecochef').classList.contains('active')).toBe(false);
        expect(document.getElementById('panel-elektrocheck').classList.contains('collapsed')).toBe(false);
        expect(document.getElementById('panel-ecochef').classList.contains('collapsed')).toBe(true);
        expect(document.getElementById('panel-elektrocheck').contains(document.getElementById('details-pane'))).toBe(
            true
        );
        document.getElementById('tab-btn-ecochef').click();
        expect(document.getElementById('panel-ecochef').contains(document.getElementById('details-pane'))).toBe(true);
    });

    it('zeigt im API-Tab die Routen und deren Details', () => {
        const { API_ROUTES } = boot();
        muteLangchange();
        document.getElementById('tab-btn-api').click();
        const items = document.querySelectorAll('.api-route-item');
        expect(items).toHaveLength(API_ROUTES.length);
        expect(items[0].classList.contains('active')).toBe(true);
        expect(document.querySelector('#api-details-container h4 span:last-child').textContent).toBe(
            API_ROUTES[0].path
        );
        if (items.length > 1) {
            items[1].click();
            expect(items[1].classList.contains('active')).toBe(true);
            expect(document.querySelector('#api-details-container h4 span:last-child').textContent).toBe(
                API_ROUTES[1].path
            );
        }
    });

    it('führt eine API-Anfrage simuliert aus und zeigt die Mock-Antwort', () => {
        const { API_ROUTES } = boot();
        muteLangchange();
        window.addLiveCommit = vi.fn();
        document.getElementById('tab-btn-api').click();
        const button = document.getElementById('api-execute-btn');
        button.click();
        expect(button.disabled).toBe(true);
        expect(document.getElementById('api-response-section').classList.contains('collapsed')).toBe(true);
        vi.advanceTimersByTime(900);
        expect(button.disabled).toBe(false);
        expect(document.getElementById('api-response-section').classList.contains('collapsed')).toBe(false);
        expect(text('api-resp-body')).toBe(JSON.stringify(API_ROUTES[0].responseMock, null, 4));
        expect(text('response-time')).toMatch(/^Time: \d+ms$/);
        expect(window.addLiveCommit).toHaveBeenCalled();
    });

    it('zeigt für Routen ohne Body den Hinweis statt eines Textfelds', () => {
        const { API_ROUTES } = boot();
        muteLangchange();
        const index = API_ROUTES.findIndex((r) => !r.requestBody);
        const withBody = API_ROUTES.findIndex((r) => r.requestBody);
        explorer.activeRouteIndex = index;
        explorer.renderApiDetails();
        expect(document.getElementById('api-req-body')).toBeNull();
        explorer.activeRouteIndex = withBody;
        explorer.renderApiDetails();
        expect(document.getElementById('api-req-body').value).toContain('{');
    });
});

describe('architecture.js: 3D-Ansicht', () => {
    function stubCanvas() {
        const target = {};
        const ctx = new Proxy(target, {
            get: (store, prop) => (store[prop] ??= vi.fn()),
            set: () => true,
        });
        document.getElementById('arch-3d-canvas').getContext = () => ctx;
        return ctx;
    }

    it('zeichnet nur im 3D-Tab und hält die Animation an, wenn der Tab verlassen wird', () => {
        boot();
        const runFrames = stubAnimationFrames();
        const ctx = stubCanvas();
        document.getElementById('tab-btn-3d').click();
        runFrames();
        expect(ctx.arc).toHaveBeenCalled();
        expect(ctx.fillText).toHaveBeenCalled();
        document.getElementById('tab-btn-ecochef').click();
        const calls = ctx.arc.mock.calls.length;
        runFrames();
        runFrames();
        expect(ctx.arc.mock.calls.length).toBe(calls);
    });

    it('dreht die Ansicht beim Ziehen mit der Maus', () => {
        boot();
        stubCanvas();
        const canvas = document.getElementById('arch-3d-canvas');
        canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 10, clientY: 10 }));
        expect(explorer.isDragging3d).toBe(true);
        const before = explorer.rotY;
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 60, clientY: 30 }));
        expect(explorer.rotY).toBeGreaterThan(before);
        window.dispatchEvent(new MouseEvent('mouseup'));
        expect(explorer.isDragging3d).toBe(false);
        expect(canvas.style.cursor).toBe('grab');
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 90, clientY: 90 }));
    });

    it('tut ohne Canvas-Kontext nichts', () => {
        boot();
        document.getElementById('arch-3d-canvas').getContext = () => null;
        expect(() => explorer.start3dEngine()).not.toThrow();
    });
});
