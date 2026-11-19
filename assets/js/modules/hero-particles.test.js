// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resetDocument, trackDocumentListeners } from '../../../scripts/test-support/dom-helpers.js';
import { initHeroSection } from './hero-section.js';

// The typing animation is covered by hero-section.test.js; this file drives the particle canvas.

let untrack;
let frames;
let context;
let cancelled;

beforeEach(() => {
    frames = [];
    cancelled = [];
    vi.stubGlobal('requestAnimationFrame', (callback) => frames.push(callback) + 100);
    vi.stubGlobal('cancelAnimationFrame', (id) => cancelled.push(id));
    window.requestAnimationFrame = globalThis.requestAnimationFrame;
    window.cancelAnimationFrame = globalThis.cancelAnimationFrame;
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => /** @type {any} */ ({ matches: false, media: query }));

    resetDocument('<section id="hero-section"></section>');
    untrack = trackDocumentListeners();
    const hero = document.getElementById('hero-section');
    Object.defineProperty(hero, 'offsetWidth', { value: 900, configurable: true });
    Object.defineProperty(hero, 'offsetHeight', { value: 600, configurable: true });
    hero.getBoundingClientRect = () => ({ left: 100, top: 50, width: 900, height: 600 });

    context = {
        save: vi.fn(),
        restore: vi.fn(),
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
    };
    vi.spyOn(window.HTMLCanvasElement.prototype, 'getContext').mockReturnValue(/** @type {any} */ (context));
});

afterEach(() => {
    untrack();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

const hero = () => document.getElementById('hero-section');

describe('hero particles', () => {
    it('replaces an old canvas and draws the first frame with 45 to 85 particles', () => {
        hero().innerHTML = '<canvas class="hero-particles-canvas"></canvas>';
        initHeroSection();
        expect(hero().querySelectorAll('canvas')).toHaveLength(1);
        expect(hero().querySelector('canvas').className).toBe('hero-particles');
        expect(hero().style.position).toBe('relative');

        expect(context.clearRect).toHaveBeenCalledWith(0, 0, 900, 600);
        const particles = context.arc.mock.calls.length;
        expect(particles).toBeGreaterThanOrEqual(45);
        expect(particles).toBeLessThanOrEqual(85);
        expect(frames).toHaveLength(1);
    });

    it('keeps animating frame after frame and connects close particles', () => {
        initHeroSection();
        for (let i = 0; i < 5; i++) frames.shift()(0);
        expect(context.clearRect).toHaveBeenCalledTimes(6);
        expect(context.stroke).toHaveBeenCalled();
        expect(context.moveTo).toHaveBeenCalled();
    });

    it('lets particles drift away from the pointer and forgets it on leave', () => {
        initHeroSection();
        hero().dispatchEvent(new window.MouseEvent('mousemove', { clientX: 400, clientY: 300 }));
        for (let i = 0; i < 3; i++) frames.shift()(0);
        hero().dispatchEvent(new window.MouseEvent('mouseleave'));
        frames.shift()(0);
        expect(context.fill).toHaveBeenCalled();
        expect(context.save).toHaveBeenCalled();
        expect(context.restore).toHaveBeenCalled();
    });

    it('follows the size of the hero and stops the loop before the page unloads', () => {
        initHeroSection();
        Object.defineProperty(hero(), 'offsetWidth', { value: 500, configurable: true });
        Object.defineProperty(hero(), 'offsetHeight', { value: 300, configurable: true });
        window.dispatchEvent(new window.Event('resize'));
        expect(hero().querySelector('canvas').width).toBe(500);
        expect(hero().querySelector('canvas').height).toBe(300);

        frames.shift()(0);
        window.dispatchEvent(new window.Event('beforeunload'));
        expect(cancelled).toContain(101);
    });
});
