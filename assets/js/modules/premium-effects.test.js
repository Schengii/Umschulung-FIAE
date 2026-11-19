// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resetDocument, trackDocumentListeners } from '../../../scripts/test-support/dom-helpers.js';
import { initPremiumEffects } from './premium-effects.js';

let untrack;
let frames;
let media;
/** Observers created by the module; the test reports added nodes by hand. */
let mutationObservers;

class FakeMutationObserver {
    constructor(callback) {
        this.callback = callback;
        mutationObservers.push(this);
    }
    observe() {}
    disconnect() {}
}

/** @param {{pointer?: boolean, reduce?: boolean, narrow?: boolean}} options */
function setMedia({ pointer = true, reduce = false, narrow = false } = {}) {
    media = { pointer, reduce, narrow };
}

beforeEach(() => {
    setMedia();
    frames = [];
    mutationObservers = [];
    vi.stubGlobal('MutationObserver', FakeMutationObserver);
    window.MutationObserver = FakeMutationObserver;
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (callback) => frames.push(callback));
    window.requestAnimationFrame = globalThis.requestAnimationFrame;
    vi.spyOn(window, 'matchMedia').mockImplementation(
        (query) =>
            /** @type {any} */ ({
                matches: query.includes('hover: hover')
                    ? media.pointer
                    : query.includes('reduce')
                      ? media.reduce
                      : query.includes('max-width')
                        ? media.narrow
                        : false,
                media: query,
            })
    );
    resetDocument('<div class="card" id="card1"></div>');
    untrack = trackDocumentListeners();
});

afterEach(() => {
    untrack();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

const flush = () => {
    const pending = frames.splice(0);
    pending.forEach((callback) => callback(0));
};
const mouse = (target, type, x, y) =>
    target.dispatchEvent(new window.MouseEvent(type, { bubbles: true, clientX: x, clientY: y }));
const card = () => document.getElementById('card1');

describe('premium effects: cards', () => {
    it('enhances cards once and watches for cards that appear later', () => {
        initPremiumEffects();
        initPremiumEffects();
        expect(card().classList.contains('card-glass')).toBe(true);
        expect(card().dataset.premiumEnhanced).toBe('true');

        const late = document.createElement('div');
        late.className = 'card';
        const wrapper = document.createElement('section');
        wrapper.innerHTML = '<div class="card" id="nested"></div>';
        const text = document.createTextNode('x');
        const addedNodes = [late, wrapper, text];
        for (const observer of mutationObservers) observer.callback([{ addedNodes }]);
        expect(late.classList.contains('card-glow-border')).toBe(true);
        expect(wrapper.querySelector('#nested').classList.contains('card-glass')).toBe(true);
    });

    it('tilts a hovered card and settles it again on leave', () => {
        initPremiumEffects();
        card().getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100 });
        mouse(card(), 'mouseenter', 0, 0);
        expect(card().style.transition).toContain('0.1s');
        mouse(card(), 'mousemove', 200, 0);
        expect(card().style.transform).toContain('rotateY(3deg)');
        expect(card().style.transform).toContain('rotateX(3deg)');
        mouse(card(), 'mouseleave', 0, 0);
        expect(card().style.transform).toContain('rotateX(0deg) rotateY(0deg)');
        expect(card().classList.contains('card-tilt-3d')).toBe(true);
    });

    it('feeds the pointer position to the hovered card, one write per frame', () => {
        initPremiumEffects();
        card().getBoundingClientRect = () => ({ left: 10, top: 20, width: 200, height: 100 });
        mouse(card(), 'mousemove', 60, 70);
        mouse(card(), 'mousemove', 70, 80);
        flush();
        expect(card().style.getPropertyValue('--mouse-x')).toBe('60px');
        expect(card().style.getPropertyValue('--mouse-y')).toBe('60px');
        mouse(document.body, 'mousemove', 5, 5);
        flush();
        expect(card().style.getPropertyValue('--mouse-x')).toBe('60px');
    });

    it('skips tilt on narrow screens', () => {
        setMedia({ narrow: true });
        initPremiumEffects();
        expect(card().classList.contains('card-tilt-3d')).toBe(false);
        expect(card().classList.contains('card-glass')).toBe(true);
    });

    it('skips all pointer effects on touch screens', () => {
        setMedia({ pointer: false });
        initPremiumEffects();
        expect(document.querySelector('.cursor-glow')).toBeNull();
        expect(card().classList.contains('card-tilt-3d')).toBe(false);
        expect(card().classList.contains('card-glass')).toBe(true);
    });

    it('skips pointer effects and entrance animations with reduced motion', () => {
        setMedia({ reduce: true });
        card().getBoundingClientRect = () => ({ top: 10, bottom: 50 });
        initPremiumEffects();
        expect(document.querySelector('.cursor-glow')).toBeNull();
        expect(card().classList.contains('stagger-entrance')).toBe(false);
    });
});

describe('premium effects: cursor glow', () => {
    it('creates one glow that follows the pointer until it has caught up', () => {
        initPremiumEffects();
        initPremiumEffects();
        expect(document.querySelectorAll('.cursor-glow')).toHaveLength(1);
        const glow = document.querySelector('.cursor-glow');

        mouse(document, 'mousemove', 900, 700);
        expect(document.body.classList.contains('cursor-active')).toBe(true);
        for (let i = 0; i < 200 && frames.length; i++) flush();
        expect(Number(/translate3d\(([\d.]+)px/.exec(glow.style.transform)[1])).toBeCloseTo(900, 0);
        expect(frames).toHaveLength(0);

        document.dispatchEvent(new window.Event('mouseleave'));
        expect(document.body.classList.contains('cursor-active')).toBe(false);
    });
});

describe('premium effects: staggered entrance', () => {
    it('animates only cards on screen, with a growing but capped delay', () => {
        const markup = Array.from({ length: 14 }, (_, i) => `<div class="card" id="c${i}"></div>`).join('');
        resetDocument(markup + '<div class="card" id="offscreen"></div>');
        for (let i = 0; i < 14; i++) {
            document.getElementById(`c${i}`).getBoundingClientRect = () => ({ top: 10, bottom: 50 });
        }
        document.getElementById('offscreen').getBoundingClientRect = () => ({ top: 5000, bottom: 5100 });

        initPremiumEffects();
        expect(document.getElementById('c0').style.animationDelay).toBe('0ms');
        expect(document.getElementById('c3').style.animationDelay).toBe('135ms');
        expect(document.getElementById('c13').style.animationDelay).toBe('450ms');
        expect(document.getElementById('offscreen').classList.contains('stagger-entrance')).toBe(false);
    });
});

describe('premium effects: button ripple', () => {
    it('adds one ripple per click and removes it after the animation', () => {
        resetDocument('<button id="b">Los</button><button id="n" class="no-ripple">Nein</button><p id="t">x</p>');
        initPremiumEffects();
        const button = document.getElementById('b');
        button.getBoundingClientRect = () => ({ left: 10, top: 10, width: 100, height: 40 });

        mouse(button, 'click', 60, 30);
        mouse(button, 'click', 70, 30);
        expect(button.querySelectorAll('.ripple-circle')).toHaveLength(1);
        expect(button.querySelector('.ripple-circle').style.width).toBe('100px');
        vi.advanceTimersByTime(700);
        expect(button.querySelector('.ripple-circle')).toBeNull();

        mouse(document.getElementById('n'), 'click', 1, 1);
        mouse(document.getElementById('t'), 'click', 1, 1);
        expect(document.querySelector('.ripple-circle')).toBeNull();
    });
});
