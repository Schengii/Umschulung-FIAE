/**
 * Username & Recruiter Greeting Module — optional personalisation on the dashboard and the
 * recruiter greeting on home.html.
 * Supports session-based recruiter greetings via URL query parameters (?c=Company or ?n=Name).
 */
import { escapeHtml } from './html-utils.js';

export function initUsernameGreeting() {
    // Parse URL parameters and store in sessionStorage for persistence during the session
    const urlParams = new URLSearchParams(window.location.search);
    const companyParam = urlParams.get('c') || urlParams.get('company');
    const nameParam = urlParams.get('n') || urlParams.get('name');

    if (companyParam || nameParam) {
        // Clear previous session greeting to prevent mixing old company with new name
        sessionStorage.removeItem('recruiter_company');
        sessionStorage.removeItem('recruiter_name');

        if (companyParam) {
            sessionStorage.setItem('recruiter_company', companyParam.trim());
        }
        if (nameParam) {
            sessionStorage.setItem('recruiter_name', nameParam.trim());
        }
    }

    initUsernameForm();
    updateDashboardGreeting();
    document.addEventListener('langchange', updateDashboardGreeting);
}

/**
 * Optional name field on the dashboard. Saving an empty field forgets the stored name.
 * The visitor stays on the page; the greeting above the form updates in place.
 */
function initUsernameForm() {
    const form = /** @type {HTMLFormElement | null} */ (document.getElementById('username-form'));
    const input = /** @type {HTMLInputElement | null} */ (document.getElementById('username-input'));
    const status = document.getElementById('username-status');
    if (!form || !input) return;

    input.value = AppStorage.getItem(STORAGE_KEYS.USERNAME, '') || '';

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = input.value.trim();
        input.value = username;
        if (username) {
            AppStorage.setItem(STORAGE_KEYS.USERNAME, username);
        } else {
            AppStorage.removeItem(STORAGE_KEYS.USERNAME);
        }
        if (status) {
            status.innerHTML = username
                ? '<span lang="de">Gespeichert.</span><span lang="en">Saved.</span>'
                : '<span lang="de">Name entfernt.</span><span lang="en">Name removed.</span>';
        }
        updateDashboardGreeting();
    });
}

function updateDashboardGreeting() {
    const welcomeText = document.getElementById('welcome-text');
    const recruiterBanner = document.getElementById('recruiter-greeting-banner');
    const trackerCard = document.getElementById('recruiter-tracker-card');
    const lang = document.documentElement.getAttribute('lang') || APP.DEFAULT_LANG;

    const company = sessionStorage.getItem('recruiter_company');
    const name = sessionStorage.getItem('recruiter_name');

    // 1. Check for recruiter session greetings first
    if (company || name) {
        if (recruiterBanner) {
            recruiterBanner.style.display = 'block';
            const welcomeTitle = recruiterBanner.querySelector('.recruiter-title');
            const welcomeDesc = recruiterBanner.querySelector('.recruiter-desc');

            if (company && name) {
                if (welcomeTitle) {
                    welcomeTitle.innerHTML =
                        lang === 'de'
                            ? `<i class="fa fa-handshake" aria-hidden="true"></i> Herzlich willkommen, <strong>${escapeHtml(name)}</strong> vom Team <strong>${escapeHtml(company)}</strong>!`
                            : `<i class="fa fa-handshake" aria-hidden="true"></i> Warm welcome, <strong>${escapeHtml(name)}</strong> from the team at <strong>${escapeHtml(company)}</strong>!`;
                }
                if (welcomeDesc) {
                    welcomeDesc.innerHTML =
                        lang === 'de'
                            ? `Schön, dass Sie da sind! Auf dieser Website finden Sie interaktive Einblicke in meine Umschulung, Projekte (wie „EcoChef“) und meinen Werdegang.`
                            : `Great to have you here! On this website, you will find interactive details regarding my retraining journey, projects (such as "EcoChef"), and career path.`;
                }
            } else if (company) {
                if (welcomeTitle) {
                    welcomeTitle.innerHTML =
                        lang === 'de'
                            ? `<i class="fa fa-handshake" aria-hidden="true"></i> Herzlich willkommen, Team von <strong>${escapeHtml(company)}</strong>!`
                            : `<i class="fa fa-handshake" aria-hidden="true"></i> Warm welcome to the team at <strong>${escapeHtml(company)}</strong>!`;
                }
                if (welcomeDesc) {
                    welcomeDesc.innerHTML =
                        lang === 'de'
                            ? `Vielen Dank für das Scannen des QR-Codes. Auf dieser Website finden Sie interaktive Einblicke in meine Umschulung und meine Programmierprojekte.`
                            : `Thank you for scanning the QR code in my resume. On this website, you will find interactive details regarding my retraining journey and coding projects.`;
                }
            } else if (name) {
                if (welcomeTitle) {
                    welcomeTitle.innerHTML =
                        lang === 'de'
                            ? `<i class="fa fa-handshake" aria-hidden="true"></i> Herzlich willkommen, <strong>${escapeHtml(name)}</strong>!`
                            : `<i class="fa fa-handshake" aria-hidden="true"></i> Warm welcome, <strong>${escapeHtml(name)}</strong>!`;
                }
                if (welcomeDesc) {
                    welcomeDesc.innerHTML =
                        lang === 'de'
                            ? `Schön, dass Sie mein Profil aufrufen! Entdecken Sie meine IHK-Abschlussarbeit „EcoChef“ oder testen Sie mein Wissen im Bewerbungstrainer.`
                            : `Thank you for checking out my profile! Explore my capstone project "EcoChef" or practice coding concepts with my mock interview simulator.`;
                }
            }
        }

        // Populate and display the application status tracker widget if company is known
        if (trackerCard) {
            if (company) {
                trackerCard.style.display = 'block';
                const companySpans = trackerCard.querySelectorAll('.tracker-company-name');
                companySpans.forEach((span) => {
                    span.textContent = company;
                });

                const footerNote = trackerCard.querySelector('.tracker-footer-note');
                if (footerNote) {
                    if (name) {
                        footerNote.style.display = 'flex';
                        const contactSpan = footerNote.querySelector('.tracker-contact-name');
                        if (contactSpan) {
                            contactSpan.textContent = name;
                        }
                    } else {
                        footerNote.style.display = 'none';
                    }
                }
            } else {
                trackerCard.style.display = 'none';
            }
        }

        // Soft welcome text
        if (welcomeText) {
            welcomeText.innerHTML =
                lang === 'de'
                    ? `Schön, dass Sie da sind! Schauen Sie sich gerne in Ruhe um.`
                    : `Great to have you here! Feel free to explore my dashboard.`;
        }
    }
    // 2. Regular user greetings
    else {
        if (recruiterBanner) {
            recruiterBanner.style.display = 'none';
        }
        if (trackerCard) {
            trackerCard.style.display = 'none';
        }
        if (welcomeText) {
            const username = AppStorage.getItem(STORAGE_KEYS.USERNAME, '');
            const greeting =
                lang === 'de'
                    ? `Hallo${username ? `, ${username}` : ''}! Willkommen auf meinem Portfolio.`
                    : `Hello${username ? `, ${username}` : ''}! Welcome to my portfolio.`;
            welcomeText.textContent = greeting;
        }
    }
}
