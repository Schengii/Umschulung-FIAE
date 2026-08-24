/**
 * Tiny standalone script for pages/offline.html only.
 * Deliberately NOT part of main.js: this page must keep working with zero
 * dependency on the rest of the app bundle when the network/cache is down.
 */
document.getElementById('btn-offline-retry')?.addEventListener('click', () => {
    window.location.reload();
});
