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
