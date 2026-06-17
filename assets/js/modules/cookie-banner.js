/**
 * Cookie Consent Banner Module
 */
function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept');
    if (!banner || !acceptBtn) return;

    acceptBtn.addEventListener('click', () => {
        StorageManager.setItem(STORAGE_KEYS.COOKIE_CONSENT, 'true');
        banner.style.animation = 'slideUp 0.3s ease reverse forwards';
        setTimeout(() => banner.remove(), 300);
    });
}
