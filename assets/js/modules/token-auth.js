/**
 * Token Authentication Module
 * Handles client-side unlocking of sensitive applicant details (salary, certificates)
 * using a passcode (e.g., "fiae2026") entered manually or passed via URL query parameter.
 */

const VALID_TOKEN = 'fiae2026';
const TOKEN_SESSION_KEY = 'recruiter_access_token';

export function initTokenAuth() {
    // Parse URL parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token') || urlParams.get('t');

    if (urlToken) {
        const cleanedToken = urlToken.trim().toLowerCase();
        if (cleanedToken === VALID_TOKEN) {
            sessionStorage.setItem(TOKEN_SESSION_KEY, cleanedToken);
            // Clean up the URL to prevent sharing the token easily in copy-paste
            const newUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, newUrl);
        }
    }

    updateSecuredContentVisibility();

    // Event listener for input form if present on the page
    const tokenInput = document.getElementById('token-input');
    const tokenSubmit = document.getElementById('token-submit');
    const tokenError = document.getElementById('token-error');

    if (tokenSubmit && tokenInput) {
        // Pre-fill input if already authorized
        const activeToken = sessionStorage.getItem(TOKEN_SESSION_KEY);
        if (activeToken === VALID_TOKEN) {
            tokenInput.value = activeToken;
        }

        tokenSubmit.addEventListener('click', () => {
            const entered = tokenInput.value.trim().toLowerCase();
            if (entered === VALID_TOKEN) {
                sessionStorage.setItem(TOKEN_SESSION_KEY, entered);
                if (tokenError) tokenError.style.display = 'none';

                // Trigger success visual feedback
                tokenSubmit.style.backgroundColor = '#10b981';
                tokenSubmit.innerHTML = '<i class="fa fa-unlock"></i> OK';

                setTimeout(() => {
                    tokenSubmit.style.backgroundColor = '';
                    tokenSubmit.innerHTML = `
                        <span lang="de">Freischalten</span>
                        <span lang="en">Unlock</span>
                    `;
                    const lang = document.documentElement.getAttribute('lang') || 'de';
                    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
                    updateSecuredContentVisibility();
                }, 600);
            } else {
                if (tokenError) {
                    tokenError.style.display = 'block';
                    tokenInput.classList.add('shake');
                    setTimeout(() => tokenInput.classList.remove('shake'), 500);
                }
            }
        });

        tokenInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') tokenSubmit.click();
        });
    }
}

function updateSecuredContentVisibility() {
    const activeToken = sessionStorage.getItem(TOKEN_SESSION_KEY);
    const isAuthorized = activeToken === VALID_TOKEN;

    const securedElements = document.querySelectorAll('.token-secured');
    const lockedPlaceholders = document.querySelectorAll('.token-locked-placeholder');

    securedElements.forEach(el => {
        if (isAuthorized) {
            el.classList.remove('hidden-secured');
            el.style.display = '';
        } else {
            el.classList.add('hidden-secured');
            el.style.display = 'none';
        }
    });

    lockedPlaceholders.forEach(el => {
        if (isAuthorized) {
            el.style.display = 'none';
        } else {
            el.style.display = 'block';
        }
    });
}

// Export initialization globally
window.initTokenAuth = initTokenAuth;
