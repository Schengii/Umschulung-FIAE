/**
 * Premium Effects Phase 2 Module — Page transitions.
 */

export function initPremiumEffectsP2() {
    // 1. Initialize Page Transition Overlay
    initPageTransitions();
}

/**
 * True for a click that should navigate to another page of this site in the same tab.
 * Everything else (downloads, new tabs, other schemes, already handled clicks) must be
 * left alone: the overlay only disappears when a new page loads.
 * @param {MouseEvent} e
 * @param {HTMLAnchorElement} link
 */
function isPageNavigation(e, link) {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return false;
    if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return false;
    if (link.hasAttribute('download') || (link.target && link.target !== '_self')) return false;
    if (link.protocol !== 'http:' && link.protocol !== 'https:' && link.protocol !== 'file:') return false;
    // Same document, only the fragment differs: the browser scrolls, nothing loads.
    if (link.pathname === window.location.pathname && link.search === window.location.search && link.hash) {
        return false;
    }
    // Only documents get a transition; a PDF/PPTX/ZIP link opens or downloads in place.
    const lastSegment = link.pathname.split('/').pop() || '';
    return !lastSegment.includes('.') || /\.html?$/i.test(lastSegment);
}

/**
 * Creates a global transition overlay and intercepts link clicks to animate transitions
 */
function initPageTransitions() {
    // Check if overlay already exists
    let overlay = document.querySelector('.page-transition-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay active'; // start active to fade in

        const spinner = document.createElement('div');
        spinner.className = 'transition-spinner';
        overlay.appendChild(spinner);

        document.body.appendChild(overlay);
    }

    // Fade out overlay on load (entry transition)
    setTimeout(() => {
        overlay.classList.remove('active');
    }, 100);

    // A page restored from the back/forward cache comes back exactly as it was left,
    // i.e. with the overlay still covering it.
    window.addEventListener('pageshow', (e) => {
        if (e.persisted) overlay.classList.remove('active');
    });

    // Intercept internal clicks
    document.addEventListener('click', (e) => {
        const link = /** @type {HTMLAnchorElement} */ (/** @type {HTMLElement} */ (e.target).closest('a'));
        if (!link || !isPageNavigation(e, link)) return;

        e.preventDefault();
        const href = link.href;

        // Fade in transition overlay
        overlay.classList.add('active');

        // Navigate after fade duration
        setTimeout(() => {
            window.location.href = href;
        }, 350);
    });
}
