// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initAboutMeEnhancements } from './about-me-enhancements.js';
import { initSlideshow } from './project-slideshow.js';
import { initTimelineScroll } from './timeline-scroll.js';

const $ = (id) => document.getElementById(id);

beforeEach(() => {
    document.body.innerHTML = '';
    document.documentElement.lang = 'de';
});

describe('about-me-enhancements', () => {
    const bridgeHtml = `
        <div class="bridge-buttons">
            <button data-bridge="trouble" class="active"></button>
            <button data-bridge="security"></button>
        </div>
        <div id="bridge-display"></div>`;

    it('tut ohne passendes Markup nichts', () => {
        expect(() => initAboutMeEnhancements()).not.toThrow();
    });

    it('zeigt die Skill-Brücke, wechselt per Klick und folgt dem Sprachwechsel', () => {
        document.body.innerHTML = bridgeHtml;
        initAboutMeEnhancements();
        expect($('bridge-display').textContent).toContain('Systematisches Troubleshooting');

        const [, security] = document.querySelectorAll('.bridge-buttons button');
        security.click();
        expect(security.classList.contains('active')).toBe(true);
        expect($('bridge-display').textContent).toContain('Sicherheitsbewusstsein');

        document.documentElement.lang = 'en';
        document.dispatchEvent(new window.Event('langchange'));
        expect($('bridge-display').textContent).toContain('Security Awareness');
    });

    it('blättert das Zertifikats-Karussell in beide Richtungen mit Umlauf', () => {
        document.body.innerHTML = `
            <button id="cert-prev"></button><button id="cert-next"></button>
            <div class="carousel-slide"></div><div class="carousel-slide"></div><div class="carousel-slide"></div>`;
        initAboutMeEnhancements();
        const slides = () =>
            [...document.querySelectorAll('.carousel-slide')].map((s) => s.classList.contains('active'));

        $('cert-next').click();
        expect(slides()).toEqual([false, true, false]);
        $('cert-prev').click();
        $('cert-prev').click();
        expect(slides()).toEqual([false, false, true]);
        expect(document.querySelectorAll('.carousel-slide')[0].style.display).toBe('none');
    });
});

describe('project-slideshow', () => {
    function mount() {
        document.body.innerHTML = `
            <div id="slide-viewer"><div class="slide active"></div><div class="slide"></div><div class="slide"></div></div>
            <button id="slide-prev"></button><button id="slide-next"></button><span id="slide-indicator"></span>`;
        initSlideshow();
    }

    it('tut ohne Viewer oder Bedienelemente nichts', () => {
        expect(() => initSlideshow()).not.toThrow();
        document.body.innerHTML = '<div id="slide-viewer"><div class="slide"></div></div>';
        expect(() => initSlideshow()).not.toThrow();
    });

    it('zeigt Zähler und sperrt die Knöpfe an den Rändern', () => {
        mount();
        expect($('slide-indicator').textContent).toBe('1 / 3');
        expect($('slide-prev').disabled).toBe(true);
        $('slide-next').click();
        $('slide-next').click();
        expect($('slide-indicator').textContent).toBe('3 / 3');
        expect($('slide-next').disabled).toBe(true);
        $('slide-next').click();
        expect($('slide-indicator').textContent).toBe('3 / 3');
        $('slide-prev').click();
        expect($('slide-indicator').textContent).toBe('2 / 3');
    });

    it('bedient die Pfeiltasten nur, solange die Maus über der Slideshow ist', () => {
        mount();
        const key = (k) => document.dispatchEvent(new window.KeyboardEvent('keydown', { key: k, cancelable: true }));
        key('ArrowRight');
        expect($('slide-indicator').textContent).toBe('1 / 3');

        $('slide-viewer').dispatchEvent(new window.Event('mouseenter'));
        key('ArrowRight');
        expect($('slide-indicator').textContent).toBe('2 / 3');
        key('ArrowLeft');
        expect($('slide-indicator').textContent).toBe('1 / 3');
        key('ArrowLeft');
        expect($('slide-indicator').textContent).toBe('1 / 3');

        $('slide-viewer').dispatchEvent(new window.Event('mouseleave'));
        key('ArrowRight');
        expect($('slide-indicator').textContent).toBe('1 / 3');
    });
});

describe('timeline-scroll', () => {
    it('tut ohne Timeline nichts', () => {
        expect(() => initTimelineScroll()).not.toThrow();
    });

    it('zeichnet die Fortschrittslinie und aktiviert Marker oberhalb des Auslösepunkts', () => {
        vi.useFakeTimers();
        document.body.innerHTML = `
            <div class="timeline-v2">
                <div class="timeline-v2-item"><span class="timeline-v2-marker" id="m1"></span></div>
                <div class="timeline-v2-item"><span class="timeline-v2-marker" id="m2"></span></div>
                <div class="timeline-v2-item"></div>
            </div>`;
        const timeline = document.querySelector('.timeline-v2');
        timeline.getBoundingClientRect = () => ({ top: 100, height: 1000 });
        $('m1').getBoundingClientRect = () => ({ top: 150 });
        $('m2').getBoundingClientRect = () => ({ top: 5000 });
        Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });

        initTimelineScroll();
        expect(timeline.querySelector('.timeline-svg-container')).not.toBeNull();
        vi.advanceTimersByTime(150);

        // Auslösepunkt 700, Timeline-Beginn 100: 600 px Fortschritt.
        expect(timeline.querySelector('.timeline-active-line').getAttribute('y2')).toBe('600');
        expect($('m1').classList.contains('active')).toBe(true);
        expect($('m2').classList.contains('active')).toBe(false);

        // Nach dem Weiterscrollen wird der Fortschritt auf die Höhe begrenzt.
        timeline.getBoundingClientRect = () => ({ top: -2000, height: 1000 });
        window.dispatchEvent(new window.Event('scroll'));
        expect(timeline.querySelector('.timeline-active-line').getAttribute('y2')).toBe('1000');
        vi.useRealTimers();
    });
});
