/**
 * Main application JS for Umschulung Portfolio
 * Handles Theme Toggle, Mobile Navigation, Accessibility, and Dynamic Card Search
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initSearch();
    initUsernameGreeting();
});

/* ==========================================================================
   1. LIGHT / DARK THEME SYSTEM
   ========================================================================== */
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    // Read stored preference or system preference
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
        icon.className = 'fa fa-sun-o'; // Sun icon to switch to light
        icon.setAttribute('title', 'Zu hellem Design wechseln');
    } else {
        icon.className = 'fa fa-moon-o'; // Moon icon to switch to dark
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

    // Accessible keyboard and touch handling for dropdowns on mobile/tablet
    const dropdownItems = document.querySelectorAll('.nav-item');
    dropdownItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        const dropdown = item.querySelector('.dropdown-menu');

        // Only add interactive logic if a dropdown actually exists
        if (dropdown && link) {
            // Add accessibility attributes
            link.setAttribute('aria-haspopup', 'true');
            link.setAttribute('aria-expanded', 'false');

            // Toggle dropdown on click for touch screens / mobile
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const isOpen = item.classList.toggle('open');
                    link.setAttribute('aria-expanded', isOpen);
                }
            });

            // Handle sub-dropdowns in navigation
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

    // Close mobile menu or dropdowns on ESC key
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
   3. DYNAMIC SEARCH FUNCTION
   ========================================================================== */
function initSearch() {
    const searchBar = document.getElementById('searchbar');
    if (!searchBar) return;

    // Create a "No Results" message container if it doesn't exist
    let noResultsContainer = document.querySelector('.no-results');
    if (!noResultsContainer) {
        const main = document.querySelector('main');
        if (main) {
            noResultsContainer = document.createElement('div');
            noResultsContainer.className = 'no-results';
            noResultsContainer.innerHTML = `
                <i class="fa fa-search"></i>
                <h2>Keine Ergebnisse gefunden</h2>
                <p>Versuche es mit einem anderen Suchbegriff.</p>
            `;
            main.appendChild(noResultsContainer);
        }
    }

    // Attach search keyup handler
    searchBar.addEventListener('input', () => {
        const query = searchBar.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.card, .card2');
        let visibleCount = 0;

        cards.forEach(card => {
            // Skip cards inside layouts that are not direct article contents (like rightcolumn side boxes on some templates)
            // But usually we want to search all cards
            const text = card.textContent.toLowerCase();
            const shouldShow = text.includes(query);
            
            card.style.display = shouldShow ? '' : 'none';
            if (shouldShow) {
                visibleCount++;
            }
        });

        // Toggle visibility of the "No Results" feedback container
        if (noResultsContainer) {
            noResultsContainer.style.display = (visibleCount === 0 && query !== '') ? 'block' : 'none';
        }
    });
}

/* ==========================================================================
   4. USERNAME GREETING LOGIC
   ========================================================================== */
function initUsernameGreeting() {
    // 4a. Handler for username input page (index.html / Startseite)
    const mySubmit = document.getElementById('mySubmit');
    const myText = document.getElementById('myText');
    const myH1 = document.getElementById('myH1');

    if (mySubmit && myText) {
        // Retrieve and pre-fill name if exists
        const storedName = localStorage.getItem('username');
        if (storedName) {
            myText.value = storedName;
            if (myH1) myH1.textContent = `Willkommen zurück, ${storedName}!`;
        }

        mySubmit.addEventListener('click', () => {
            const username = myText.value.trim();
            if (username) {
                localStorage.setItem('username', username);
                if (myH1) myH1.textContent = `Willkommen, ${username}!`;
                
                // Add a small positive feedback effect
                mySubmit.style.backgroundColor = '#10b981'; // Green
                mySubmit.textContent = 'Gespeichert!';
                setTimeout(() => {
                    mySubmit.style.backgroundColor = '';
                    mySubmit.textContent = 'Submit';
                    // Redirect to home dashboard after a short delay
                    window.location.href = 'home.html';
                }, 800);
            } else {
                myText.focus();
            }
        });

        // Allow submitting via Enter key
        myText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                mySubmit.click();
            }
        });
    }

    // 4b. Welcome banner greeting on Home page (home.html)
    const welcomeUser = document.getElementById('welcome-user');
    if (welcomeUser) {
        const username = localStorage.getItem('username');
        if (username) {
            welcomeUser.textContent = `, ${username}`;
        }
    }
}
