/**
 * Main application JS for Umschulung Portfolio
 * Handles Theme Toggle, Mobile Navigation, Accessibility, Combined Search/Category Filter,
 * IHK Countdown Timer, Multilingual Language Switcher (DE/EN), Scroll Animations,
 * Back-to-Top Button, Cookie Banner, and Contact Form.
 */

let currentSearchQuery = "";
let currentCategory = "all";

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initTranslation();
    initSearchAndFilter();
    initCountdown();
    initUsernameGreeting();
    initScrollAnimations();
    initBackToTop();
    initCookieBanner();
    initContactForm();
    initSkillBars();
});

/* ==========================================================================
   1. LIGHT / DARK THEME SYSTEM
   ========================================================================== */
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', initialTheme);
    updateThemeIcon(initialTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle i');
    if (!icon) return;
    if (theme === 'dark') {
        icon.className = 'fa fa-sun-o';
        icon.setAttribute('title', 'Zu hellem Design wechseln');
    } else {
        icon.className = 'fa fa-moon-o';
        icon.setAttribute('title', 'Zu dunklem Design wechseln');
    }
}

/* ==========================================================================
   2. MOBILE MENU & ACCESSIBLE DROPDOWNS
   ========================================================================== */
function initNavigation() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', isOpen);
            menuToggle.querySelector('i').className = isOpen ? 'fa fa-times' : 'fa fa-bars';
        });
    }

    const dropdownItems = document.querySelectorAll('.nav-item');
    dropdownItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        const dropdown = item.querySelector('.dropdown-menu');

        if (dropdown && link) {
            link.setAttribute('aria-haspopup', 'true');
            link.setAttribute('aria-expanded', 'false');

            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const isOpen = item.classList.toggle('open');
                    link.setAttribute('aria-expanded', isOpen);
                }
            });

            const subItems = dropdown.querySelectorAll('.dropdown-item');
            subItems.forEach(subItem => {
                const subLink = subItem.querySelector('.dropdown-link');
                const subDropdown = subItem.querySelector('.sub-dropdown-menu');

                if (subDropdown && subLink) {
                    subLink.setAttribute('aria-haspopup', 'true');
                    subLink.setAttribute('aria-expanded', 'false');

                    subLink.addEventListener('click', (e) => {
                        if (window.innerWidth <= 768) {
                            e.preventDefault();
                            const isSubOpen = subItem.classList.toggle('open');
                            subLink.setAttribute('aria-expanded', isSubOpen);
                        }
                    });
                }
            });
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (navMenu && navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.querySelector('i').className = 'fa fa-bars';
                menuToggle.focus();
            }
            dropdownItems.forEach(item => {
                if (item.classList.contains('open')) {
                    item.classList.remove('open');
                    item.querySelector('.nav-link').setAttribute('aria-expanded', 'false');
                }
            });
        }
    });
}

/* ==========================================================================
   3. TRANSLATION (DE/EN) SYSTEM
   ========================================================================== */
function initTranslation() {
    const langToggle = document.getElementById('lang-toggle');
    if (!langToggle) return;
    
    const storedLang = localStorage.getItem('lang') || 'de';
    document.documentElement.setAttribute('lang', storedLang);
    updateLangToggleButton(storedLang);
    
    langToggle.addEventListener('click', () => {
        const currentLang = document.documentElement.getAttribute('lang') || 'de';
        const newLang = currentLang === 'de' ? 'en' : 'de';
        
        document.documentElement.setAttribute('lang', newLang);
        localStorage.setItem('lang', newLang);
        updateLangToggleButton(newLang);
        
        // Notify other widgets
        document.dispatchEvent(new CustomEvent('langchange', { detail: newLang }));
    });
}

function updateLangToggleButton(lang) {
    const langToggle = document.getElementById('lang-toggle');
    if (!langToggle) return;
    
    if (lang === 'de') {
        langToggle.innerHTML = '<i class="fa fa-globe" aria-hidden="true"></i> DE | <strong>EN</strong>';
        langToggle.setAttribute('aria-label', 'Switch to English');
    } else {
        langToggle.innerHTML = '<i class="fa fa-globe" aria-hidden="true"></i> <strong>DE</strong> | EN';
        langToggle.setAttribute('aria-label', 'Auf Deutsch umstellen');
    }
}

/* ==========================================================================
   4. COMBINED DYNAMIC SEARCH & BLOG CATEGORY FILTER
   ========================================================================== */
function initSearchAndFilter() {
    const searchBar = document.getElementById('searchbar');
    const filterButtons = document.querySelectorAll('.btn-filter');
    
    // 4a. Create a "No Results" message container if it doesn't exist
    let noResultsContainer = document.querySelector('.no-results');
    if (!noResultsContainer) {
        const main = document.querySelector('main');
        if (main) {
            noResultsContainer = document.createElement('div');
            noResultsContainer.className = 'no-results';
            noResultsContainer.innerHTML = `
                <i class="fa fa-search" aria-hidden="true"></i>
                <h2 lang="de">Keine Ergebnisse gefunden</h2>
                <h2 lang="en">No results found</h2>
                <p lang="de">Versuche es mit einem anderen Suchbegriff oder Filter.</p>
                <p lang="en">Try another search term or filter.</p>
            `;
            main.appendChild(noResultsContainer);
        }
    }

    // 4b. Event listener for search bar
    if (searchBar) {
        searchBar.addEventListener('input', () => {
            currentSearchQuery = searchBar.value.toLowerCase().trim();
            applyFilters();
        });
    }

    // 4c. Event listener for category filters (News page)
    if (filterButtons) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Toggle active classes
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                currentCategory = button.getAttribute('data-filter') || 'all';
                applyFilters();
            });
        });
    }
}

function applyFilters() {
    const path = window.location.pathname;
    const currentPage = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    const searchablePages = ['news.html', 'portfolio.html', 'home.html'];
    
    // Only apply card filtering on allowed searchable pages
    if (!searchablePages.includes(currentPage)) {
        return;
    }

    const cards = document.querySelectorAll('.card, .card2');
    const isWelcomePage = !!document.getElementById('mySubmit');
    let visibleCount = 0;
    
    cards.forEach(card => {
        if (isWelcomePage) return; // Skip welcome screen card
        
        // Check Category
        let matchesCategory = true;
        if (currentCategory !== 'all') {
            matchesCategory = card.classList.contains(`filter-${currentCategory}`);
        }
        
        // Check Search Query (matches text in active language to be precise)
        let matchesSearch = true;
        if (currentSearchQuery !== '') {
            // Get visible elements content only, or check full text content
            const text = card.textContent.toLowerCase();
            matchesSearch = text.includes(currentSearchQuery);
        }
        
        const shouldShow = matchesCategory && matchesSearch;
        card.style.display = shouldShow ? '' : 'none';
        
        if (shouldShow) {
            visibleCount++;
        }
    });
    
    const noResultsContainer = document.querySelector('.no-results');
    if (noResultsContainer) {
        const queryActive = currentSearchQuery !== '' || currentCategory !== 'all';
        noResultsContainer.style.display = (visibleCount === 0 && queryActive) ? 'block' : 'none';
    }
}

/* ==========================================================================
   5. IHK EXAM COUNTDOWN TIMER (Ziel: 08. Jun 2026 10:00:00 Uhr)
   ========================================================================== */
function initCountdown() {
    const targetDate = new Date('2026-06-08T10:00:00+02:00').getTime();
    
    const daysVal = document.getElementById('cd-days');
    const hoursVal = document.getElementById('cd-hours');
    const minsVal = document.getElementById('cd-minutes');
    const secsVal = document.getElementById('cd-seconds');
    
    if (!daysVal || !hoursVal || !minsVal || !secsVal) return;
    
    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;
        
        if (difference <= 0) {
            daysVal.textContent = '00';
            hoursVal.textContent = '00';
            minsVal.textContent = '00';
            secsVal.textContent = '00';
            return;
        }
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        daysVal.textContent = String(days).padStart(2, '0');
        hoursVal.textContent = String(hours).padStart(2, '0');
        minsVal.textContent = String(minutes).padStart(2, '0');
        secsVal.textContent = String(seconds).padStart(2, '0');
    }
    
    function updateLabels() {
        const lang = document.documentElement.getAttribute('lang') || 'de';
        const labels = {
            de: { days: 'Tage', hours: 'Stunden', mins: 'Minuten', secs: 'Sekunden' },
            en: { days: 'Days', hours: 'Hours', mins: 'Minutes', secs: 'Seconds' }
        };
        
        const currentLabels = labels[lang] || labels.de;
        
        const lDays = document.getElementById('cd-label-days');
        const lHours = document.getElementById('cd-label-hours');
        const lMins = document.getElementById('cd-label-mins');
        const lSecs = document.getElementById('cd-label-secs');
        
        if (lDays) lDays.textContent = currentLabels.days;
        if (lHours) lHours.textContent = currentLabels.hours;
        if (lMins) lMins.textContent = currentLabels.mins;
        if (lSecs) lSecs.textContent = currentLabels.secs;
    }
    
    updateCountdown();
    updateLabels();
    setInterval(updateCountdown, 1000);
    
    document.addEventListener('langchange', updateLabels);
}

/* ==========================================================================
   6. USERNAME GREETING LOGIC (Zweisprachig)
   ========================================================================== */
function initUsernameGreeting() {
    const mySubmit = document.getElementById('mySubmit');
    const myText = document.getElementById('myText');
    const myH1 = document.getElementById('myH1');

    if (mySubmit && myText) {
        const storedName = localStorage.getItem('username');
        if (storedName) {
            myText.value = storedName;
            updateWelcomeH1(storedName);
        }

        mySubmit.addEventListener('click', () => {
            const username = myText.value.trim();
            if (username) {
                localStorage.setItem('username', username);
                updateWelcomeH1(username);
                
                const lang = document.documentElement.getAttribute('lang') || 'de';
                mySubmit.style.backgroundColor = '#10b981';
                mySubmit.textContent = lang === 'de' ? 'Gespeichert!' : 'Saved!';
                
                setTimeout(() => {
                    mySubmit.style.backgroundColor = '';
                    mySubmit.textContent = 'Submit';
                    window.location.href = 'home.html';
                }, 800);
            } else {
                myText.focus();
            }
        });

        myText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                mySubmit.click();
            }
        });
        
        document.addEventListener('langchange', () => {
            updateWelcomeH1(myText.value.trim());
        });
    }

    // Welcomes the user on dashboard pages (e.g. home.html)
    updateDashboardGreeting();
    document.addEventListener('langchange', updateDashboardGreeting);
}

function updateWelcomeH1(username) {
    const myH1 = document.getElementById('myH1');
    if (!myH1) return;
    
    const lang = document.documentElement.getAttribute('lang') || 'de';
    if (username) {
        myH1.textContent = lang === 'de' ? `Willkommen zurück, ${username}!` : `Welcome back, ${username}!`;
    } else {
        myH1.textContent = lang === 'de' ? 'Willkommen' : 'Welcome';
    }
}

function updateDashboardGreeting() {
    const welcomeText = document.getElementById('welcome-text');
    if (!welcomeText) return;
    
    const username = localStorage.getItem('username') || '';
    const lang = document.documentElement.getAttribute('lang') || 'de';
    
    if (lang === 'de') {
        welcomeText.innerHTML = `Hallo${username ? `, ${username}` : ''}! Willkommen auf meinem Umschulungs-Portfolio.`;
    } else {
        welcomeText.innerHTML = `Hello${username ? `, ${username}` : ''}! Welcome to my retraining portfolio.`;
    }
}

/* ==========================================================================
   7. SCROLL REVEAL ANIMATIONS (Intersection Observer)
   ========================================================================== */
function initScrollAnimations() {
    const cards = document.querySelectorAll('.card');
    if (!cards.length) return;

    // Don't animate the welcome card on index.html
    const isWelcomePage = !!document.getElementById('mySubmit');
    if (isWelcomePage) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    });

    cards.forEach(card => {
        card.classList.add('fade-in');
        observer.observe(card);
    });
}

/* ==========================================================================
   8. BACK-TO-TOP BUTTON
   ========================================================================== */
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    const toggleVisibility = () => {
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ==========================================================================
   9. COOKIE CONSENT BANNER
   ========================================================================== */
function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept');
    if (!banner || !acceptBtn) return;

    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'true');
        banner.style.animation = 'slideUp 0.3s ease reverse forwards';
        setTimeout(() => banner.remove(), 300);
    });
}

/* ==========================================================================
   10. IMPROVED CONTACT FORM
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    // Remove inline onsubmit if present
    form.removeAttribute('onsubmit');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('contact-name');
        const email = document.getElementById('contact-email');
        const message = document.getElementById('contact-message');
        const feedback = document.getElementById('form-feedback');

        // Basic validation
        if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
            return;
        }

        // Show success feedback
        if (feedback) {
            feedback.style.display = 'block';
        }

        // Reset form
        form.reset();

        // Auto-hide feedback after 5 seconds
        if (feedback) {
            setTimeout(() => {
                feedback.style.display = 'none';
            }, 5000);
        }
    });
}

/* ==========================================================================
   11. ANIMATED SKILL BARS (Intersection Observer)
   ========================================================================== */
function initSkillBars() {
    const skillFills = document.querySelectorAll('.skill-fill');
    if (!skillFills.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    skillFills.forEach(fill => observer.observe(fill));
}
