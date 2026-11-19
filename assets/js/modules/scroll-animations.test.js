// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initScrollAnimations } from './scroll-animations.js';

/** Collects the observers the module creates so a test can report an intersection. */
let observers;
let frames;
let reducedMotion;

class FakeObserver {
    constructor(callback, options) {
        this.callback = callback;
        this.options = options;
        this.targets = [];
        this.unobserved = [];
        observers.push(this);
    }
    observe(target) {
        this.targets.push(target);
    }
    unobserve(target) {
        this.unobserved.push(target);
    }
    show(target) {
        this.callback([{ isIntersecting: true, target }]);
    }
}

beforeEach(() => {
    observers = [];
    frames = [];
    reducedMotion = false;
    document.body.innerHTML = '';
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    window.IntersectionObserver = FakeObserver;
    window.matchMedia = () => ({ matches: reducedMotion });
    vi.stubGlobal('requestAnimationFrame', (callback) => frames.push(callback));
    window.requestAnimationFrame = globalThis.requestAnimationFrame;
});

afterEach(() => {
    vi.unstubAllGlobals();
});

const runFrames = (time) => {
    const pending = frames.splice(0);
    pending.forEach((callback) => callback(time));
};

describe('scroll progress bar', () => {
    it('adds one bar and fills it with the scroll position', () => {
        initScrollAnimations();
        initScrollAnimations();
        const bars = document.querySelectorAll('#scroll-progress-bar');
        expect(bars).toHaveLength(1);

        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
        Object.defineProperty(window, 'scrollY', { value: 250, configurable: true });
        window.dispatchEvent(new window.Event('scroll'));
        window.dispatchEvent(new window.Event('scroll'));
        expect(frames).toHaveLength(1);
        runFrames(0);
        expect(bars[0].style.width).toBe('25%');
    });
});

describe('scroll reveal', () => {
    it('reveals elements once they intersect and stops watching them', () => {
        document.body.innerHTML = '<div class="card" id="c1"></div><div class="scroll-reveal" id="c2"></div>';
        initScrollAnimations();
        const observer = observers.find((o) => o.options?.threshold === 0.06);
        expect(observer.targets).toHaveLength(2);
        expect(document.getElementById('c1').classList.contains('scroll-reveal')).toBe(true);

        observer.show(document.getElementById('c1'));
        expect(document.getElementById('c1').classList.contains('reveal-visible')).toBe(true);
        expect(observer.unobserved).toContain(document.getElementById('c1'));
        expect(document.getElementById('c2').classList.contains('reveal-visible')).toBe(false);
    });

    it('shows everything at once with reduced motion', () => {
        reducedMotion = true;
        document.body.innerHTML = '<div class="card" id="c1"></div>';
        initScrollAnimations();
        expect(document.getElementById('c1').classList.contains('reveal-visible')).toBe(true);
        expect(observers.find((o) => o.options?.threshold === 0.06)).toBeUndefined();
    });
});

describe('number counters', () => {
    it('counts up to the target with prefix and suffix and ends exactly on it', () => {
        document.body.innerHTML =
            '<span class="stat-number-animated" data-counter="40" data-prefix="~" data-suffix="%"></span>';
        vi.spyOn(performance, 'now').mockReturnValue(0);
        initScrollAnimations();
        const observer = observers.find((o) => o.options?.threshold === 0.2);
        const el = document.querySelector('.stat-number-animated');
        observer.show(el);
        expect(observer.unobserved).toContain(el);

        runFrames(700);
        const middle = Number(el.innerText.replace(/[^0-9]/g, ''));
        expect(middle).toBeGreaterThan(0);
        expect(middle).toBeLessThan(40);
        expect(el.innerText.startsWith('~')).toBe(true);

        runFrames(1500);
        expect(el.innerText).toBe('~40%');
    });

    it('reads the number from the text when there is no data-counter and skips non-numbers', () => {
        document.body.innerHTML =
            '<span class="stat-number-animated" id="a">12 Projekte</span><span class="stat-number-animated" id="b">viele</span>';
        reducedMotion = true;
        initScrollAnimations();
        const observer = observers.find((o) => o.options?.threshold === 0.2);
        observer.show(document.getElementById('a'));
        observer.show(document.getElementById('b'));
        expect(document.getElementById('a').innerText).toBe('12');
        expect(document.getElementById('b').innerText).toBe('viele');
    });
});

describe('tech particles', () => {
    function mountHero() {
        document.body.innerHTML = '<section id="hero-section"></section>';
        const hero = document.getElementById('hero-section');
        Object.defineProperty(hero, 'offsetWidth', { value: 900, configurable: true });
        Object.defineProperty(hero, 'offsetHeight', { value: 500, configurable: true });
        const context = {
            clearRect: vi.fn(),
            beginPath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn(),
        };
        window.HTMLCanvasElement.prototype.getContext = () => context;
        return { hero, context };
    }

    it('draws particles on a single canvas in the hero and keeps animating', () => {
        const { hero, context } = mountHero();
        initScrollAnimations();
        initScrollAnimations();
        expect(hero.querySelectorAll('.hero-particles-canvas')).toHaveLength(1);
        expect(context.clearRect).toHaveBeenCalled();
        expect(context.arc).toHaveBeenCalled();
        const drawn = context.clearRect.mock.calls.length;
        runFrames(0);
        expect(context.clearRect.mock.calls.length).toBeGreaterThan(drawn);
    });

    it('resizes the canvas with the hero', () => {
        const { hero } = mountHero();
        initScrollAnimations();
        Object.defineProperty(hero, 'offsetWidth', { value: 600, configurable: true });
        window.dispatchEvent(new window.Event('resize'));
        expect(hero.querySelector('canvas').width).toBe(600);
    });

    it('does nothing with reduced motion or without a hero', () => {
        reducedMotion = true;
        mountHero();
        initScrollAnimations();
        expect(document.querySelector('.hero-particles-canvas')).toBeNull();
        reducedMotion = false;
        document.body.innerHTML = '';
        expect(() => initScrollAnimations()).not.toThrow();
    });
});
