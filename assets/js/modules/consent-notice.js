/**
 * Cookie Consent Banner Module
 */
export function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept');
    if (!banner || !acceptBtn) return;

    // Schwebende Bedienelemente (Assistent-Button) schieben sich über das Banner, statt den
    // Button "Verstanden" zu verdecken; die Höhe folgt dem Umbruch je Sprache und Breite.
    const root = document.documentElement;
    const publishHeight = () => root.style.setProperty('--cookie-banner-h', `${banner.offsetHeight}px`);
    publishHeight();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(publishHeight) : null;
    observer?.observe(banner);

    acceptBtn.addEventListener('click', () => {
        observer?.disconnect();
        root.style.removeProperty('--cookie-banner-h');
        AppStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT, 'true');
        banner.style.animation = 'slideUp 0.3s ease reverse forwards';
        setTimeout(() => banner.remove(), 300);
    });
}
