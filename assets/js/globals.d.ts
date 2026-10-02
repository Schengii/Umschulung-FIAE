// Ambient declarations for the globals this site shares between classic
// <script> files and ES modules (via window.*). Only used by `npm run typecheck`;
// never loaded in the browser.

declare var GameAudio: any;
declare var Achievements: any;
declare var Confetti: any;
declare var Prism: any;
declare var newsData: any;
declare function initTranslation(...args: any[]): any;
declare function showToast(...args: any[]): any;
declare function initBlogEnhancements(...args: any[]): any;

interface Window {
    APP: any;
    BoundingBoxRenderer: any;
    closeProjectModal: any;
    addLiveCommit: any;
    showToast: any;
    projectsData: any;
    _cachedProjectsData: any;
    newsData: any;
    PLACEHOLDER_IMAGE: any;
    STORAGE_KEYS: any;
    openProjectModal: any;
    deleteCustomCard: any;
    initPraktikumsbetriebMedia: any;
    confetti: any;
    Prism: any;
    webkitAudioContext: any;
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
}

// This site's selectors target HTML elements almost exclusively, so default the
// untyped querySelector/querySelectorAll results to HTMLElement instead of Element
// (tag-name selectors such as 'input' keep their specific types via lib.dom overloads).
interface ParentNode {
    // Bare tag names first so querySelector('img') stays an HTMLImageElement ...
    querySelector<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null;
    querySelectorAll<K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>;
    // ... and every other selector string defaults to HTMLElement.
    querySelector<E extends HTMLElement = HTMLElement>(selectors: string): E | null;
    querySelectorAll<E extends HTMLElement = HTMLElement>(selectors: string): NodeListOf<E>;
}

// Custom events dispatched via document.dispatchEvent(new CustomEvent(name, { detail })).
interface DocumentEventMap {
    langchange: CustomEvent<any>;
    radarfilter: CustomEvent<any>;
}
interface WindowEventMap {
    langchange: CustomEvent<any>;
    radarfilter: CustomEvent<any>;
}

// Element.closest() with a plain selector string returns an HTMLElement in practice here.
interface Element {
    closest<E extends HTMLElement = HTMLElement>(selectors: string): E | null;
}
