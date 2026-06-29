/**
 * PWA Installer Module — Shows custom floating install prompt banner
 */
function initPwaInstaller() {
    let deferredPrompt = null;

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent default browser prompt
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;

        // Show the banner
        const banner = document.getElementById('pwa-install-banner');
        if (banner) {
            const isDismissed = StorageManager.getItem('pwa_dismissed') === 'true';
            if (!isDismissed) {
                banner.classList.remove('hidden');
                // Force reflow
                banner.offsetHeight;
                banner.classList.add('show');
                
                // Translate language tags
                const currentLang = document.documentElement.getAttribute('lang') || 'de';
                document.dispatchEvent(new CustomEvent('langchange', { detail: currentLang }));
            }
        }
    });

    // Create and inject the banner dynamically
    const bannerHtml = `
    <div id="pwa-install-banner" class="pwa-install-banner hidden" role="dialog" aria-label="App installieren">
        <div class="pwa-install-content">
            <i class="fa fa-download" aria-hidden="true"></i>
            <div class="pwa-install-text">
                <strong lang="de">App installieren</strong>
                <strong lang="en">Install App</strong>
                <p lang="de">Füge diese Seite für schnellen Offline-Zugriff zum Startbildschirm hinzu.</p>
                <p lang="en">Add this page to your home screen for quick offline access.</p>
            </div>
        </div>
        <div class="pwa-install-actions">
            <button id="pwa-btn-dismiss" class="btn-github"><span lang="de">Später</span><span lang="en">Later</span></button>
            <button id="pwa-btn-install" class="btn-primary"><span lang="de">Installieren</span><span lang="en">Install</span></button>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', bannerHtml);

    const banner = document.getElementById('pwa-install-banner');
    const btnInstall = document.getElementById('pwa-btn-install');
    const btnDismiss = document.getElementById('pwa-btn-dismiss');

    if (btnInstall) {
        btnInstall.addEventListener('click', () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the PWA install prompt');
                    } else {
                        console.log('User dismissed the PWA install prompt');
                    }
                    deferredPrompt = null;
                });
            }
            if (banner) {
                banner.classList.remove('show');
                setTimeout(() => banner.classList.add('hidden'), 300);
            }
        });
    }

    if (btnDismiss) {
        btnDismiss.addEventListener('click', () => {
            StorageManager.setItem('pwa_dismissed', 'true');
            if (banner) {
                banner.classList.remove('show');
                setTimeout(() => banner.classList.add('hidden'), 300);
            }
        });
    }
}
