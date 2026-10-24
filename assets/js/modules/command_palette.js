/**
 * Command Palette Controller (Ctrl+K / Cmd+K / Quick Trigger)
 * Allows instant fuzzy search across all pages, projects, and learning resources.
 */

(function () {
    'use strict';

    const NAV_ITEMS = [
        {
            titleDe: 'Home / Dashboard',
            titleEn: 'Home / Dashboard',
            category: 'Navigation',
            icon: 'fa-house',
            url: 'home.html',
        },
        {
            titleDe: 'Projekt-Portfolio',
            titleEn: 'Project Portfolio',
            category: 'Navigation',
            icon: 'fa-briefcase',
            url: 'portfolio.html',
        },
        {
            titleDe: 'Lebenslauf & Zeugnisse',
            titleEn: 'CV & Credentials',
            category: 'Karriere',
            icon: 'fa-file-lines',
            url: 'lebenslauf.html',
        },
        {
            titleDe: 'Über mich & Elektroniker-Brücke',
            titleEn: 'About Me & Skill Bridge',
            category: 'Profil',
            icon: 'fa-user',
            url: 'ueber-mich.html',
        },
        {
            titleDe: 'IHK Notenrechner & AP1/AP2 Simulator',
            titleEn: 'IHK Grade Calculator',
            category: 'Tools',
            icon: 'fa-calculator',
            url: 'dashboard.html',
        },
        {
            titleDe: 'IHK Lernkarten (Spaced Repetition)',
            titleEn: 'IHK Flashcards',
            category: 'Lernen',
            icon: 'fa-layer-group',
            url: 'flashcards.html',
        },
        {
            titleDe: 'Interaktiver Bewerbungs-Trainer',
            titleEn: 'Interview Trainer',
            category: 'Karriere',
            icon: 'fa-user-tie',
            url: 'interview-trainer.html',
        },
        {
            titleDe: 'SQL & Code Playground',
            titleEn: 'SQL & Code Playground',
            category: 'Lernen',
            icon: 'fa-terminal',
            url: 'playground.html',
        },
        {
            titleDe: 'Git Branching Simulator (CRT Terminal)',
            titleEn: 'Git Branching Simulator',
            category: 'Games & Sim',
            icon: 'fa-code-branch',
            url: 'git-simulator.html',
        },
        {
            titleDe: 'C4 Software-Architektur Diagramm',
            titleEn: 'C4 Architecture Diagram',
            category: 'Architektur',
            icon: 'fa-sitemap',
            url: 'architecture.html',
        },
        {
            titleDe: 'Quellen, Links & QR Generator',
            titleEn: 'Links & QR Generator',
            category: 'Info',
            icon: 'fa-link',
            url: 'links.html',
        },
        {
            titleDe: 'Impressum & iCal Terminbuchung',
            titleEn: 'Legal Notice & iCal',
            category: 'Rechtliches',
            icon: 'fa-scale-balanced',
            url: 'impressum.html',
        },
    ];

    function initCommandPalette() {
        // Create DOM structure
        const overlay = document.createElement('div');
        overlay.id = 'command-palette-overlay';
        overlay.className = 'command-palette-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Befehlsmenü / Command palette');
        // Hidden until its stylesheet has arrived, so the markup never flashes unstyled.
        overlay.hidden = true;
        const stylesReady = window.loadStylesheet
            ? window.loadStylesheet('assets/css/modules/command_palette.css')
            : Promise.resolve();
        stylesReady.then(() => {
            overlay.hidden = false;
        });

        overlay.innerHTML = `
            <div class="command-palette-modal">
                <div class="command-palette-header">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" id="command-palette-input" class="command-palette-input" placeholder="Suche nach Seiten, Projekten, Skills... (oder Tippe 'Git', 'EcoChef', 'SQL')" data-en-placeholder="Search pages, projects, skills... (or type 'Git', 'EcoChef', 'SQL')" autocomplete="off">
                    <span class="command-palette-kbd">ESC</span>
                </div>
                <ul id="command-palette-results" class="command-palette-results"></ul>
                <div class="command-palette-footer">
                    <span><strong>↑↓</strong> Navigieren</span>
                    <span><strong>ENTER</strong> Öffnen</span>
                    <span><strong>ESC</strong> Schließen</span>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const input = /** @type {HTMLInputElement} */ (overlay.querySelector('#command-palette-input'));
        const results = overlay.querySelector('#command-palette-results');
        let selectedIndex = 0;
        /** @type {Array<Record<string, any>>} */
        let currentItems = [];

        function getCombinedCatalog() {
            const isPages =
                window.location.pathname.includes('/pages/') || window.location.pathname.includes('\\pages\\');
            const pagePrefix = isPages ? '' : 'pages/';

            /** @type {Array<Record<string, any>>} */
            const items = NAV_ITEMS.map((item) => ({
                ...item,
                url: pagePrefix + item.url,
            }));

            // Include all projects if available
            const projectsList = window.projectsData || window._cachedProjectsData || [];
            if (Array.isArray(projectsList) && projectsList.length > 0) {
                projectsList.forEach((proj) => {
                    const detailUrl = `${pagePrefix}projekt-detail.html?repo=${encodeURIComponent(proj.repoName || '')}`;
                    items.push({
                        titleDe: proj.titleDe || proj.repoName || '',
                        titleEn: proj.titleEn || proj.repoName || '',
                        category: `Projekt (${proj.category || 'Web'})`,
                        icon: 'fa-cube',
                        url: detailUrl,
                        tags: (proj.tags || []).join(' '),
                    });
                });
            }

            // Headings of the content pages (assets/data/search-index.json), once it has been fetched.
            for (const page of contentIndex) {
                for (const heading of page.h || []) {
                    items.push({
                        titleDe: heading.de,
                        titleEn: heading.en,
                        category: page.t?.de || page.p,
                        categoryEn: page.t?.en || page.p,
                        icon: 'fa-hashtag',
                        // Matched by the heading only: the page name would list every section of a
                        // page for each search for that page.
                        titleOnly: true,
                        url: `${pagePrefix}${page.p}${heading.id ? `#${heading.id}` : ''}`,
                    });
                }
            }

            return items;
        }

        // The headings of all content pages (~15 KB), fetched on first open like the project catalogue.
        /** @type {Array<{p: string, t?: {de: string, en: string}, h?: Array<{id: string, de: string, en: string}>}>} */
        let contentIndex = [];
        let contentIndexRequested = false;
        function ensureContentIndex() {
            if (contentIndexRequested || typeof fetch !== 'function') return;
            contentIndexRequested = true;
            const isPages =
                window.location.pathname.includes('/pages/') || window.location.pathname.includes('\\pages\\');
            fetch(`${isPages ? '../' : ''}assets/data/search-index.json`)
                .then(
                    (response) => /** @type {Promise<unknown>} */ (response.ok ? response.json() : Promise.resolve([]))
                )
                .then((data) => {
                    if (!Array.isArray(data)) return;
                    contentIndex = data;
                    if (overlay.classList.contains('open')) renderResults(input.value);
                })
                .catch(() => {
                    // Offline or blocked: the palette still finds pages and projects.
                });
        }

        /** @param {unknown} text */
        function escapeText(text) {
            return String(text ?? '').replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
        }

        // The project catalogue (~45 KB) is only needed once the palette is used: fetch it
        // on first open instead of on every page load.
        let projectDataRequested = false;
        function ensureProjectData() {
            if (window.projectsData || projectDataRequested) return;
            projectDataRequested = true;
            const isPages =
                window.location.pathname.includes('/pages/') || window.location.pathname.includes('\\pages\\');
            const dataScript = document.createElement('script');
            dataScript.src = isPages ? '../assets/js/projects_data.js' : 'assets/js/projects_data.js';
            dataScript.onload = () => {
                window._cachedProjectsData = window.projectsData;
                if (overlay.classList.contains('open')) renderResults(input.value);
            };
            document.body.appendChild(dataScript);
        }

        function renderResults(filterText = '') {
            const allItems = getCombinedCatalog();
            const lang = document.documentElement.getAttribute('lang') || 'de';
            const term = filterText.toLowerCase().trim();

            if (!term) {
                currentItems = allItems.slice(0, 8);
            } else {
                currentItems = allItems
                    .filter((item) => {
                        const title = (lang === 'de' ? item.titleDe : item.titleEn) || item.titleDe;
                        const cat = ((lang === 'en' && item.categoryEn) || item.category || '') + '';
                        const tags = item.tags || '';
                        if (item.titleOnly) return title.toLowerCase().includes(term);
                        return (
                            title.toLowerCase().includes(term) ||
                            cat.toLowerCase().includes(term) ||
                            tags.toLowerCase().includes(term)
                        );
                    })
                    .slice(0, 10);
            }

            selectedIndex = 0;
            results.innerHTML = '';

            if (currentItems.length === 0) {
                // The search text is user input: set it as text, never as markup.
                results.innerHTML = `
                    <li style="padding: 1.5rem; text-align: center; color: var(--text-muted);">
                        <i class="fa-solid fa-circle-question fa-2x" style="margin-bottom: 0.5rem; display: block;"></i>
                        <span>${lang === 'de' ? 'Keine passenden Einträge für' : 'No matching entries for'} "<strong></strong>"${lang === 'de' ? ' gefunden' : ''}.</span>
                    </li>
                `;
                results.querySelector('strong').textContent = filterText;
                return;
            }

            currentItems.forEach((item, index) => {
                const title = (lang === 'de' ? item.titleDe : item.titleEn) || item.titleDe;
                const li = document.createElement('li');
                li.className = `command-palette-item${index === 0 ? ' active' : ''}`;
                li.innerHTML = `
                    <div class="item-icon"><i class="fa-solid ${item.icon}"></i></div>
                    <div class="item-details">
                        <div class="item-title">${escapeText(title)}</div>
                        <div class="item-category">${escapeText((lang === 'en' && item.categoryEn) || item.category)}</div>
                    </div>
                    <i class="fa-solid fa-arrow-turn-down" style="font-size: 0.75rem; opacity: 0.4;"></i>
                `;

                li.addEventListener('click', () => {
                    window.location.href = item.url;
                });

                results.appendChild(li);
            });
        }

        /** @type {HTMLElement | null} */
        let opener = null;

        function openPalette() {
            ensureProjectData();
            ensureContentIndex();
            opener = /** @type {HTMLElement | null} */ (document.activeElement);
            overlay.classList.add('open');
            input.value = '';
            renderResults('');
            setTimeout(() => input.focus(), 50);
        }

        function closePalette() {
            overlay.classList.remove('open');
            // Hand the focus back, otherwise keyboard users restart from the top of the page.
            if (opener && opener !== document.body && opener.isConnected) opener.focus();
            opener = null;
        }

        // Global Keyboard Shortcut: Ctrl+K or Cmd+K
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                if (overlay.classList.contains('open')) {
                    closePalette();
                } else {
                    openPalette();
                }
            } else if (e.key === 'Escape' && overlay.classList.contains('open')) {
                closePalette();
            } else if (overlay.classList.contains('open')) {
                const itemsEls = results.querySelectorAll('.command-palette-item');
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (itemsEls.length > 0) {
                        selectedIndex = (selectedIndex + 1) % itemsEls.length;
                        updateSelection(itemsEls);
                    }
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (itemsEls.length > 0) {
                        selectedIndex = (selectedIndex - 1 + itemsEls.length) % itemsEls.length;
                        updateSelection(itemsEls);
                    }
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (currentItems[selectedIndex]) {
                        window.location.href = currentItems[selectedIndex].url;
                    }
                }
            }
        });

        /** @param {Element[] | NodeListOf<Element>} itemsEls */
        function updateSelection(itemsEls) {
            itemsEls.forEach((el, idx) => {
                if (idx === selectedIndex) {
                    el.classList.add('active');
                    el.scrollIntoView({ block: 'nearest' });
                } else {
                    el.classList.remove('active');
                }
            });
        }

        input.addEventListener('input', (e) => {
            renderResults(/** @type {HTMLInputElement} */ (e.target).value);
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closePalette();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCommandPalette);
    } else {
        initCommandPalette();
    }
})();
