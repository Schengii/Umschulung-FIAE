// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initC4Architecture, C4_DESCRIPTIONS } from './c4-architecture.js';

// Die Listener auf document/window sammeln sich an; ein Aufruf in einem Test hält das überschaubar,
// der zweite Aufruf prüft zugleich die Idempotenz.
const toast = vi.fn();

beforeEach(() => {
    document.body.innerHTML = `
        <div><div class="arch-tabs-bar"></div></div>
        <div id="details-pane"></div>
        <button class="hotspot active-hotspot" data-project="ecochef" data-component="client"></button>
        <button class="hotspot" data-project="ecochef" data-component="database"></button>`;
});

describe('initC4Architecture', () => {
    it('tut nichts ohne Tab-Leiste', () => {
        document.body.innerHTML = '<div id="details-pane"></div>';
        initC4Architecture();
        expect(document.getElementById('c4-level-switcher')).toBeNull();
        expect(document.getElementById('c4-drilldown-panel')).toBeNull();
    });

    it('baut Ebenen-Umschalter und Drilldown, zeigt die aktive Komponente und reagiert auf Klicks, Zoom und Events', () => {
        window.showToast = toast;
        initC4Architecture();
        initC4Architecture();

        expect(document.querySelectorAll('#c4-level-switcher')).toHaveLength(1);
        expect(document.querySelectorAll('#c4-drilldown-panel')).toHaveLength(1);
        const panel = document.getElementById('c4-drilldown-panel');
        expect(panel.innerHTML).toContain('c4-drilldown-box');

        // Klick auf einen anderen Hotspot rendert dessen Detail neu.
        const before = panel.innerHTML;
        document.querySelectorAll('.hotspot')[1].click();
        expect(panel.innerHTML).not.toBe(before);

        // Ebene 3 setzt Beschreibung, Hotspot-Stil und meldet per Toast.
        document.querySelector('.btn-c4-level[data-level="3"]').click();
        expect(document.getElementById('c4-level-info').textContent).toBe(C4_DESCRIPTIONS['3']);
        expect(document.querySelector('.btn-c4-level[data-level="3"]').classList.contains('active')).toBe(true);
        expect(document.querySelector('.btn-c4-level[data-level="1"]').classList.contains('active')).toBe(false);
        expect(document.querySelector('.hotspot').style.transition).toContain('transform');
        expect(toast).toHaveBeenCalledWith(
            { de: expect.stringContaining('3'), en: expect.stringContaining('3') },
            'info'
        );

        // Eigenes Ereignis und Sprachwechsel rendern ebenfalls neu.
        window.dispatchEvent(
            new window.CustomEvent('c4componentchange', { detail: { project: 'ecochef', component: 'client' } })
        );
        expect(panel.innerHTML).toBe(before);
        document.dispatchEvent(new window.Event('langchange'));
        expect(panel.innerHTML).toContain('c4-drilldown-box');
    });
});
