// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import { BoundingBoxRenderer } from './bounding-box-renderer.js';

const PAGE = `
    <div id="frame">
        <img id="image" alt="">
        <div id="overlay"></div>
    </div>`;

const rect = (left, top, width, height) => ({ left, top, width, height, right: left + width, bottom: top + height });

describe('BoundingBoxRenderer', () => {
    let image;
    let overlay;
    let frame;
    let observed;

    beforeEach(() => {
        resetDocument(PAGE);
        image = document.getElementById('image');
        overlay = document.getElementById('overlay');
        frame = document.getElementById('frame');
        // The image is letterboxed inside its frame: 20px from the left, 10px from the top.
        frame.getBoundingClientRect = () => rect(100, 50, 400, 300);
        image.getBoundingClientRect = () => rect(120, 60, 360, 280);
        observed = [];
        vi.stubGlobal(
            'ResizeObserver',
            class {
                constructor(callback) {
                    this.callback = callback;
                }
                observe(target) {
                    observed.push([target, this.callback]);
                }
            }
        );
        window.ResizeObserver = globalThis.ResizeObserver;
    });

    afterEach(() => vi.unstubAllGlobals());

    it('places the overlay exactly on the rendered image', () => {
        new BoundingBoxRenderer(image, overlay).syncOverlay();
        expect(overlay.style.left).toBe('20px');
        expect(overlay.style.top).toBe('10px');
        expect(overlay.style.width).toBe('360px');
        expect(overlay.style.height).toBe('280px');
    });

    it('draws one box per entry, positioned in percent of the image', () => {
        const renderer = new BoundingBoxRenderer(image, overlay);
        renderer.render([
            { x: 0.45, y: 0.68, width: 0.18, height: 0.22, label: 'Isolationsfehler', color: '#ef4444' },
            { x: 0.1, y: 0.2, width: 0.3, height: 0.4 },
        ]);
        const boxes = overlay.querySelectorAll('.bounding-box');
        expect(boxes).toHaveLength(2);
        expect(boxes[0].style.left).toBe('45%');
        expect(boxes[0].style.top).toBe('68%');
        expect(boxes[0].style.width).toBe('18%');
        expect(boxes[0].style.height).toBe('22%');
        expect(boxes[0].querySelector('.bounding-box-label').textContent).toBe('Isolationsfehler');
        expect(overlay.style.width).toBe('360px');
    });

    it('uses red as the default colour and adds no label without text', () => {
        new BoundingBoxRenderer(image, overlay).render([{ x: 0, y: 0, width: 1, height: 1 }]);
        const box = overlay.querySelector('.bounding-box');
        expect(box.style.border).toContain('2px solid');
        expect(box.querySelector('.bounding-box-label')).toBeNull();
    });

    it('treats a label as text, never as markup', () => {
        new BoundingBoxRenderer(image, overlay).render([
            { x: 0, y: 0, width: 1, height: 1, label: '<img src=x onerror=1>' },
        ]);
        expect(overlay.querySelector('img')).toBeNull();
        expect(overlay.querySelector('.bounding-box-label').textContent).toBe('<img src=x onerror=1>');
    });

    it('replaces earlier boxes on every render and empties the overlay on clear', () => {
        const renderer = new BoundingBoxRenderer(image, overlay);
        renderer.render([{ x: 0, y: 0, width: 1, height: 1 }]);
        renderer.render([
            { x: 0, y: 0, width: 0.5, height: 0.5 },
            { x: 0.5, y: 0.5, width: 0.5, height: 0.5 },
        ]);
        expect(overlay.querySelectorAll('.bounding-box')).toHaveLength(2);
        renderer.clear();
        expect(overlay.children).toHaveLength(0);
    });

    it('follows the image when it resizes, loads or the window changes', () => {
        new BoundingBoxRenderer(image, overlay);
        expect(observed[0][0]).toBe(image);

        image.getBoundingClientRect = () => rect(130, 70, 300, 200);
        observed[0][1]();
        expect(overlay.style.width).toBe('300px');

        image.getBoundingClientRect = () => rect(110, 55, 100, 100);
        image.dispatchEvent(new Event('load'));
        expect(overlay.style.width).toBe('100px');

        image.getBoundingClientRect = () => rect(100, 50, 50, 40);
        window.dispatchEvent(new Event('resize'));
        expect(overlay.style.width).toBe('50px');
    });

    it('works without ResizeObserver', () => {
        vi.unstubAllGlobals();
        delete window.ResizeObserver;
        expect(() => new BoundingBoxRenderer(image, overlay).render([])).not.toThrow();
    });
});
