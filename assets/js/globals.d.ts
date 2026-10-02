// Ambient declarations for the globals this site shares between classic
// <script> files and ES modules (via window.*). Only used by `npm run typecheck`;
// never loaded in the browser.

declare var GameAudio: any;
declare var Achievements: any;
declare var Confetti: any;
declare var Prism: any;
declare function showToast(...args: any[]): any;
declare function initBlogEnhancements(...args: any[]): any;

interface Window {
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
    querySelector<E extends HTMLElement = HTMLElement>(selectors: string): E | null;
    querySelectorAll<E extends HTMLElement = HTMLElement>(selectors: string): NodeListOf<E>;
}
