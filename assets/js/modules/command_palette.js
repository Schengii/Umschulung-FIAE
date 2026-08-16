/**
 * Command Palette Controller (Ctrl+K / Cmd+K / Quick Trigger)
 * Allows instant fuzzy search across all pages, projects, and learning resources.
 */

(function() {
    'use strict';

    const NAV_ITEMS = [
        { titleDe: "Home / Dashboard", titleEn: "Home / Dashboard", category: "Navigation", icon: "fa-house", url: "home.html" },
        { titleDe: "Projekt-Portfolio (21 Projekte)", titleEn: "Project Portfolio", category: "Navigation", icon: "fa-briefcase", url: "portfolio.html" },
        { titleDe: "Lebenslauf & Zeugnisse", titleEn: "CV & Credentials", category: "Karriere", icon: "fa-file-lines", url: "lebenslauf.html" },
        { titleDe: "Über mich & Elektroniker-Brücke", titleEn: "About Me & Skill Bridge", category: "Profil", icon: "fa-user", url: "ueber-mich.html" },
        { titleDe: "IHK Notenrechner & AP1/AP2 Simulator", titleEn: "IHK Grade Calculator", category: "Tools", icon: "fa-calculator", url: "dashboard.html" },
        { titleDe: "IHK Lernkarten (Spaced Repetition)", titleEn: "IHK Flashcards", category: "Lernen", icon: "fa-layer-group", url: "flashcards.html" },
        { titleDe: "Interaktiver Bewerbungs-Trainer", titleEn: "Interview Trainer", category: "Karriere", icon: "fa-user-tie", url: "interview-trainer.html" },
        { titleDe: "SQL & Code Playground", titleEn: "SQL & Code Playground", category: "Lernen", icon: "fa-terminal", url: "playground.html" },
        { titleDe: "Git Branching Simulator (CRT Terminal)", titleEn: "Git Branching Simulator", category: "Games & Sim", icon: "fa-code-branch", url: "git-simulator.html" },
        { titleDe: "C4 Software-Architektur Diagramm", titleEn: "C4 Architecture Diagram", category: "Architektur", icon: "fa-sitemap", url: "architecture.html" },
        { titleDe: "Quellen, Links & QR Generator", titleEn: "Links & QR Generator", category: "Info", icon: "fa-link", url: "links.html" },
        { titleDe: "Impressum & iCal Terminbuchung", titleEn: "Legal Notice & iCal", category: "Rechtliches", icon: "fa-scale-balanced", url: "impressum.html" }
    ];

    function initCommandPalette() {
        // Create DOM structure
        const overlay = document.createElement('div');
        overlay.id = 'command-palette-overlay';
        overlay.className = 'command-palette-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Befehlsmenü');

        overlay.innerHTML = `
            <div class="command-palette-modal">
                <div class="command-palette-header">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" id="command-palette-input" class="command-palette-input" placeholder="Suche nach Seiten, Projekten, Skills... (oder Tippe 'Git', 'EcoChef', 'SQL')" autocomplete="off">
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

        const input = overlay.querySelector('#command-palette-input');
        const results = overlay.querySelector('#command-palette-results');
        let selectedIndex = 0;
        let currentItems = [];

        function getCombinedCatalog() {
            const isPages = window.location.pathname.includes('/pages/') || window.location.pathname.includes('\\pages\\');
            const pagePrefix = isPages ? '' : 'pages/';

            let items = NAV_ITEMS.map(item => ({
                ...item,
                url: pagePrefix + item.url
            }));

            // Include all projects if available
            const projectsList = window.projectsData || window._cachedProjectsData || [];
            if (Array.isArray(projectsList) && projectsList.length > 0) {
                projectsList.forEach(proj => {
                    const detailUrl = `${pagePrefix}projekt-detail.html?repo=${encodeURIComponent(proj.repoName || '')}`;
                    items.push({
                        titleDe: proj.titleDe || proj.repoName || '',
                        titleEn: proj.titleEn || proj.repoName || '',
                        category: `Projekt (${proj.category || 'Web'})`,
                        icon: 'fa-cube',
                        url: detailUrl,
                        tags: (proj.tags || []).join(' ')
                    });
                });
            }

            return items;
        }

        // Preload projectsData dynamically if not yet on page
        if (!window.projectsData) {
            const isPages = window.location.pathname.includes('/pages/') || window.location.pathname.includes('\\pages\\');
            const dataScript = document.createElement('script');
            dataScript.src = isPages ? '../assets/js/projects_data.js' : 'assets/js/projects_data.js';
            dataScript.onload = () => {
                window._cachedProjectsData = window.projectsData;
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
                currentItems = allItems.filter(item => {
                    const title = (lang === 'de' ? item.titleDe : item.titleEn) || item.titleDe;
                    const cat = item.category || '';
                    const tags = item.tags || '';
                    return title.toLowerCase().includes(term) || cat.toLowerCase().includes(term) || tags.toLowerCase().includes(term);
                }).slice(0, 10);
            }

            selectedIndex = 0;
            results.innerHTML = '';

            if (currentItems.length === 0) {
                results.innerHTML = `
                    <li style="padding: 1.5rem; text-align: center; color: var(--text-muted);">
                        <i class="fa-solid fa-circle-question fa-2x" style="margin-bottom: 0.5rem; display: block;"></i>
                        <span>Keine passenden Einträge für "<strong>${filterText}</strong>" gefunden.</span>
                    </li>
                `;
                return;
            }

            currentItems.forEach((item, index) => {
                const title = (lang === 'de' ? item.titleDe : item.titleEn) || item.titleDe;
                const li = document.createElement('li');
                li.className = `command-palette-item${index === 0 ? ' active' : ''}`;
                li.innerHTML = `
                    <div class="item-icon"><i class="fa-solid ${item.icon}"></i></div>
                    <div class="item-details">
                        <div class="item-title">${title}</div>
                        <div class="item-category">${item.category}</div>
                    </div>
                    <i class="fa-solid fa-arrow-turn-down" style="font-size: 0.75rem; opacity: 0.4;"></i>
                `;

                li.addEventListener('click', () => {
                    window.location.href = item.url;
                });

                results.appendChild(li);
            });
        }

        function openPalette() {
            overlay.classList.add('open');
            input.value = '';
            renderResults('');
            setTimeout(() => input.focus(), 50);
        }

        function closePalette() {
            overlay.classList.remove('open');
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
            renderResults(e.target.value);
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
