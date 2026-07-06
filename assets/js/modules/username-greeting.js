/**
 * Username & Recruiter Greeting Module — Welcome page and dashboard personalization
 * Supports session-based recruiter greetings via URL query parameters (?c=Company or ?n=Name).
 */
function initUsernameGreeting() {
    const mySubmit = document.getElementById('mySubmit');
    const myText = document.getElementById('myText');
    
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

    if (mySubmit && myText) {
        const storedName = StorageManager.getItem(STORAGE_KEYS.USERNAME);
        if (storedName) {
            myText.value = storedName;
            updateWelcomeH1(storedName);
        }

        mySubmit.addEventListener('click', () => {
            const username = myText.value.trim();
            if (username) {
                StorageManager.setItem(STORAGE_KEYS.USERNAME, username);
                updateWelcomeH1(username);
                
                const lang = document.documentElement.getAttribute('lang') || APP.DEFAULT_LANG;
                mySubmit.style.backgroundColor = '#10b981';
                mySubmit.innerHTML = `
                    <span lang="de">Gespeichert!</span>
                    <span lang="en">Saved!</span>
                `;
                document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
                
                setTimeout(() => {
                    mySubmit.style.backgroundColor = '';
                    mySubmit.innerHTML = `
                        <span lang="de">Eintreten</span>
                        <span lang="en">Enter</span>
                    `;
                    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
                    window.location.href = 'home.html';
                }, 800);
            } else {
                myText.focus();
            }
        });

        myText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') mySubmit.click();
        });
        
        document.addEventListener('langchange', () => {
            updateWelcomeH1(myText.value.trim());
        });
    }

    updateDashboardGreeting();
    document.addEventListener('langchange', updateDashboardGreeting);
}

function updateWelcomeH1(username) {
    const myH1 = document.getElementById('myH1');
    if (!myH1) return;
    const lang = document.documentElement.getAttribute('lang') || APP.DEFAULT_LANG;
    myH1.textContent = username
        ? (lang === 'de' ? `Willkommen zurück, ${username}!` : `Welcome back, ${username}!`)
        : (lang === 'de' ? 'Willkommen' : 'Welcome');
}

function updateDashboardGreeting() {
    const welcomeText = document.getElementById('welcome-text');
    const recruiterBanner = document.getElementById('recruiter-greeting-banner');
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
                    welcomeTitle.innerHTML = lang === 'de'
                        ? `<i class="fa fa-handshake" aria-hidden="true"></i> Herzlich willkommen, <strong>${escapeHTML(name)}</strong> vom Team <strong>${escapeHTML(company)}</strong>!`
                        : `<i class="fa fa-handshake" aria-hidden="true"></i> Warm welcome, <strong>${escapeHTML(name)}</strong> from the team at <strong>${escapeHTML(company)}</strong>!`;
                }
                if (welcomeDesc) {
                    welcomeDesc.innerHTML = lang === 'de'
                        ? `Schön, dass Sie da sind! Auf dieser Website finden Sie interaktive Einblicke in meine Umschulung, Projekte (wie „EcoChef“) und meinen Werdegang.`
                        : `Great to have you here! On this website, you will find interactive details regarding my retraining journey, projects (such as "EcoChef"), and career path.`;
                }
            } else if (company) {
                if (welcomeTitle) {
                    welcomeTitle.innerHTML = lang === 'de'
                        ? `<i class="fa fa-handshake" aria-hidden="true"></i> Herzlich willkommen, Team von <strong>${escapeHTML(company)}</strong>!`
                        : `<i class="fa fa-handshake" aria-hidden="true"></i> Warm welcome to the team at <strong>${escapeHTML(company)}</strong>!`;
                }
                if (welcomeDesc) {
                    welcomeDesc.innerHTML = lang === 'de'
                        ? `Vielen Dank für das Scannen des QR-Codes. Auf dieser Website finden Sie interaktive Einblicke in meine Umschulung und meine Programmierprojekte.`
                        : `Thank you for scanning the QR code in my resume. On this website, you will find interactive details regarding my retraining journey and coding projects.`;
                }
            } else if (name) {
                if (welcomeTitle) {
                    welcomeTitle.innerHTML = lang === 'de'
                        ? `<i class="fa fa-handshake" aria-hidden="true"></i> Herzlich willkommen, <strong>${escapeHTML(name)}</strong>!`
                        : `<i class="fa fa-handshake" aria-hidden="true"></i> Warm welcome, <strong>${escapeHTML(name)}</strong>!`;
                }
                if (welcomeDesc) {
                    welcomeDesc.innerHTML = lang === 'de'
                        ? `Schön, dass Sie mein Profil aufrufen! Entdecken Sie meine IHK-Abschlussarbeit „EcoChef“ oder testen Sie mein Wissen im Bewerbungstrainer.`
                        : `Thank you for checking out my profile! Explore my capstone project "EcoChef" or practice coding concepts with my mock interview simulator.`;
                }
            }
        }
        
        // Soft welcome text
        if (welcomeText) {
            welcomeText.innerHTML = lang === 'de'
                ? `Schön, dass Sie da sind! Schauen Sie sich gerne in Ruhe um.`
                : `Great to have you here! Feel free to explore my dashboard.`;
        }
    } 
    // 2. Regular user greetings
    else {
        if (recruiterBanner) {
            recruiterBanner.style.display = 'none';
        }
        if (welcomeText) {
            const username = StorageManager.getItem(STORAGE_KEYS.USERNAME, '');
            const greeting = lang === 'de'
                ? `Hallo${username ? `, ${username}` : ''}! Willkommen auf meinem Umschulungs-Portfolio.`
                : `Hello${username ? `, ${username}` : ''}! Welcome to my retraining portfolio.`;
            welcomeText.innerHTML = greeting;
        }
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
