/**
 * Portfolio Page Logic
 * Handles dynamic project loading from static projectsData and GitHub API,
 * LocalStorage caching for GitHub data, search, filtering, pagination,
 * testimonial carousel, contact form submission, and language changes.
 * Filter, sort, pagination and deep links are DOM-free in modules/portfolio-logic.js.
 */
import { escapeHtml } from './modules/html-utils.js';
import {
    SANDBOX_PLAYABLE_REPOS,
    cleanSearchParam,
    filterProjects,
    matchesDeepLink,
    pageForIndex,
    pageSlice,
    sortProjects,
    totalPages,
} from './modules/portfolio-logic.js';

document.addEventListener('DOMContentLoaded', () => {
    // Moved off an inline onclick attribute (CSP script-src hardening)
    document.getElementById('btn-cv-download-portfolio')?.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('achievement:unlock', { detail: 'cv_downloaded' }));
    });

    const searchInput = /** @type {HTMLInputElement} */ (document.getElementById('portfolio-searchbar'));
    const sortSelect = /** @type {HTMLInputElement} */ (document.getElementById('sort-select'));
    const filterButtons = document.querySelectorAll('.portfolio-filters .btn-filter');
    const noResultsContainer = document.getElementById('no-results-container');
    const paginationContainer = document.getElementById('pagination-container');
    const dynamicContainer = document.getElementById('dynamic-projects-container');
    const skeletonLoader = document.getElementById('skeleton-loader');

    const SORT_KEY = 'portfolio_sort_order';
    const DEFAULT_SORT_ORDER = 'desc';

    // State for filtering and pagination (Page 1 = 8 projects to show all curated flagships seamlessly)
    /** @type {Array<Record<string, any>>} */
    let allProjects = [];
    let currentPage = 1;
    let currentSearchTerm = '';
    let currentCategory = 'all';
    const clearSearchBtn = document.getElementById('btn-clear-search');

    // Event Listeners for Filters & Sorting
    const persistedSort = AppStorage.getItem(SORT_KEY) || DEFAULT_SORT_ORDER;
    if (sortSelect) {
        sortSelect.value = persistedSort;
        sortSelect.addEventListener('change', () => {
            const order = sortSelect.value;
            AppStorage.setItem(SORT_KEY, order);
            if (allProjects.length) renderAllProjects();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchTerm = /** @type {HTMLInputElement} */ (e.target).value.toLowerCase().trim();
            if (clearSearchBtn) {
                clearSearchBtn.style.display = currentSearchTerm ? 'block' : 'none';
            }
            currentPage = 1; // Reset to first page on search
            renderAllProjects();
        });
    }

    if (clearSearchBtn && searchInput) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            currentSearchTerm = '';
            clearSearchBtn.style.display = 'none';
            currentPage = 1;
            renderAllProjects();
            searchInput.focus();
        });
    }

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            filterButtons.forEach((btn) => btn.classList.remove('active'));
            button.classList.add('active');
            currentCategory = button.getAttribute('data-filter') || 'all';
            currentPage = 1; // Reset to first page on filter change
            renderAllProjects();
        });
    });

    let hashHandled = false;
    function handleDeepLink() {
        if (hashHandled) return;

        // Parse query parameters (e.g., ?category=web, ?tech=Java, ?search=EcoChef, ?repo=EcoChef)
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        const techParam = urlParams.get('tech');
        const searchParam = urlParams.get('search');
        const repoParam = urlParams.get('repo');

        if (categoryParam) {
            currentCategory = categoryParam.toLowerCase();
            filterButtons.forEach((btn) => {
                const f = btn.getAttribute('data-filter') || 'all';
                if (f === currentCategory) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }

        if (techParam || searchParam) {
            const cleanQuery = cleanSearchParam(techParam || searchParam);
            if (searchInput) searchInput.value = cleanQuery;
            currentSearchTerm = cleanQuery;
        }

        const hash = decodeURIComponent(window.location.hash.substring(1)).trim();
        const targetQuery = repoParam || hash;
        if (!targetQuery) return;

        // Find the project in the list as it is rendered (filtered and sorted)
        const index = visibleProjects().findIndex((proj) => matchesDeepLink(proj, targetQuery));

        if (index !== -1) {
            currentPage = pageForIndex(index);
            hashHandled = true;
            renderAllProjects(); // Render the correct page

            // Find card in DOM and open it after render
            setTimeout(() => {
                const cards = document.querySelectorAll('.project-card');
                for (const card of cards) {
                    const target = {
                        titleDe: card.dataset.titleDe,
                        titleEn: card.dataset.titleEn,
                        repoName: card.dataset.repoName,
                    };
                    if (matchesDeepLink(target, targetQuery)) {
                        if (typeof window.openProjectModal === 'function') {
                            window.openProjectModal(card);
                            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                        break;
                    }
                }
            }, 250);
        }
    }

    // Load and render projects statically (without runtime GitHub API requests)
    async function loadAndRenderProjects() {
        if (!dynamicContainer) return;
        if (skeletonLoader) skeletonLoader.style.display = 'grid';

        try {
            // Load pre-loaded static projects from projects_data.js
            allProjects = window.projectsData && Array.isArray(window.projectsData) ? window.projectsData : [];

            // Handle deep link
            handleDeepLink();

            // Render everything
            renderAllProjects();
        } catch (e) {
            console.error('Error loading or rendering projects:', e);
        } finally {
            if (skeletonLoader) skeletonLoader.style.display = 'none';
        }
    }

    /** @param {string} value class name part: letters, digits and dashes only */
    const normalizeClass = (value) =>
        String(value)
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '');

    /**
     * data-* attributes of a card; the project modal reads them back through dataset.
     * @param {Record<string, any>} project
     * @param {string} imagesAttr
     * @param {string} tagsAttr
     */
    const cardDataAttributes = (project, imagesAttr, tagsAttr) =>
        [
            ['repo-name', project.repoName],
            ['title-de', project.titleDe],
            ['title-en', project.titleEn],
            ['desc-de', project.descDe],
            ['desc-en', project.descEn],
            ['image', project.image],
            ['images', imagesAttr],
            ['link', project.link],
            ['github', project.githubUrl],
            ['tags', tagsAttr],
        ]
            .map(([name, value]) => `data-${name}="${escapeHtml(value || '')}"`)
            .join(' ');

    /** Filtered and sorted projects, in the order they are rendered. */
    function visibleProjects() {
        const filtered = filterProjects(allProjects, { category: currentCategory, search: currentSearchTerm });
        return sortProjects(filtered, AppStorage.getItem(SORT_KEY) || DEFAULT_SORT_ORDER);
    }

    // Dynamic Card Generator
    /** @param {Record<string, any>} project */
    function generateDynamicCardHTML(project) {
        const isGame = project.category && project.category.includes('games');
        const isAi = project.category && project.category.includes('ai');

        // Build tags (guard against null/empty)
        const tags = Array.isArray(project.tags) ? project.tags : [];
        const tagsHTML =
            tags.length > 0
                ? tags
                      .map((/** @type {string} */ tag) => `<span class="tech-tag">${escapeHtml(tag)}</span>`)
                      .join('\n        ')
                : '';

        // Build image
        let imageHTML = '';
        if (project.image) {
            const resolvedImg = (window.resolveAssetPath || ((p) => p))(project.image);
            imageHTML = `
            <div class="project-image-container">
                <img src="${escapeHtml(resolvedImg)}" alt="${escapeHtml(project.titleDe)}" width="400" height="225" loading="lazy" class="project-image" data-img-fallback="fallback">
            </div>`;
        }

        // Build stars badge
        let starsHTML = '';
        if (project.stars !== undefined && project.stars > 0) {
            starsHTML = `<span class="stars-badge" title="${escapeHtml(project.stars)} Stars on GitHub"><i class="fa fa-star" aria-hidden="true"></i> ${escapeHtml(project.stars)}</span>`;
        }

        // Build buttons
        let buttonsHTML = '<div class="project-buttons">';

        // Primary: Details
        buttonsHTML += `
        <button class="btn-primary btn-project btn-details">
            <span lang="de"><i class="fa fa-info-circle" aria-hidden="true"></i> Details</span>
            <span lang="en"><i class="fa fa-info-circle" aria-hidden="true"></i> Details</span>
        </button>`;

        if (project.link) {
            let btnTextDe = 'Projekt starten';
            let btnTextEn = 'Launch Project';
            let btnIcon = 'fa-external-link';

            if (isGame) {
                btnTextDe = 'Spielen';
                btnTextEn = 'Play Game';
                btnIcon = 'fa-play';
            } else if (isAi) {
                btnTextDe = 'Ausprobieren';
                btnTextEn = 'Try Out';
            }

            const resolvedLink = (window.resolveAssetPath || ((p) => p))(project.link);
            buttonsHTML += `
            <a href="${escapeHtml(resolvedLink)}" class="btn-secondary btn-project" target="_blank" rel="noopener">
                <span lang="de"><i class="fa ${btnIcon}" aria-hidden="true"></i> ${btnTextDe}</span>
                <span lang="en"><i class="fa ${btnIcon}" aria-hidden="true"></i> ${btnTextEn}</span>
            </a>`;
        }

        if (project.githubUrl) {
            buttonsHTML += `
            <a href="${escapeHtml(project.githubUrl)}" class="btn-secondary btn-project btn-github" target="_blank" rel="noopener">
                <span lang="de"><i class="fa-brands fa-github" aria-hidden="true"></i> Quellcode</span>
                <span lang="en"><i class="fa-brands fa-github" aria-hidden="true"></i> View Source</span>
            </a>`;
        }

        // Compare selection button
        buttonsHTML += `
        <button type="button" class="btn-compare-select" data-repo="${escapeHtml(project.repoName || project.titleDe)}" title="Mit anderen Projekten vergleichen" data-en-title="Compare with other projects">
            <i class="fa-solid fa-code-compare"></i> <span>Vergleichen</span>
        </button>`;

        // Quick-Sandbox trigger: only for projects playable directly in the in-page modal
        if (project.repoName && SANDBOX_PLAYABLE_REPOS.includes(project.repoName)) {
            buttonsHTML += `
            <button type="button" class="btn-secondary btn-project btn-sandbox-launch" data-sandbox-project="${escapeHtml(project.repoName)}" title="Direkt hier im Portfolio starten" data-en-title="Launch right here in the portfolio">
                <span lang="de"><i class="fa-solid fa-bolt" aria-hidden="true"></i> Direkt testen</span>
                <span lang="en"><i class="fa-solid fa-bolt" aria-hidden="true"></i> Quick Play</span>
            </button>`;
        }

        buttonsHTML += '</div>';

        // Set category class for filtering
        const languageClass = project.language ? `filter-${normalizeClass(project.language)}` : '';
        let categoryClass;
        if (project.category) {
            categoryClass = project.category
                .split(' ')
                .map((/** @type {string} */ c) => `filter-${normalizeClass(c)}`)
                .join(' ');
        } else {
            categoryClass = 'filter-web';
        }

        const safeTagsAttr = encodeURIComponent(JSON.stringify(project.tags));

        if (project.repoName === 'EcoChef') {
            const highlightBadgeHTML = `
            <div class="highlight-badge">
                <span lang="de"><i class="fa fa-trophy" aria-hidden="true"></i> Abschlussprojekt IHK</span>
                <span lang="en"><i class="fa fa-trophy" aria-hidden="true"></i> IHK Graduation Project</span>
            </div>`;
            const safeImagesAttr = encodeURIComponent(
                JSON.stringify(project.images || (project.image ? [project.image] : []))
            );
            return `
            <article class="card project-card highlight-project fade-in visible ${categoryClass} ${languageClass}" ${cardDataAttributes(project, safeImagesAttr, safeTagsAttr)}>
                ${imageHTML}
                <div class="highlight-content-wrapper">
                    ${highlightBadgeHTML}
                    <div class="project-card-header">
                        <h3 lang="de">${escapeHtml(project.titleDe)}</h3>
                        <h3 lang="en">${escapeHtml(project.titleEn)}</h3>
                        ${starsHTML}
                    </div>
                    <div class="tech-tags">
                        ${tagsHTML}
                    </div>
                    <p lang="de">${escapeHtml(project.descDe)}</p>
                    <p lang="en">${escapeHtml(project.descEn)}</p>
                    ${buttonsHTML}
                </div>
            </article>`;
        }

        const safeImagesAttr = encodeURIComponent(
            JSON.stringify(project.images || (project.image ? [project.image] : []))
        );
        return `
        <article class="card project-card fade-in visible ${categoryClass} ${languageClass}" ${cardDataAttributes(project, safeImagesAttr, safeTagsAttr)}>
            <div class="project-card-header">
                <h3 lang="de">${escapeHtml(project.titleDe)}</h3>
                <h3 lang="en">${escapeHtml(project.titleEn)}</h3>
                ${starsHTML}
            </div>
            <div class="tech-tags">
                ${tagsHTML}
            </div>
            ${imageHTML}
            <p lang="de">${escapeHtml(project.descDe)}</p>
            <p lang="en">${escapeHtml(project.descEn)}</p>
            ${buttonsHTML}
        </article>`;
    }

    function renderAllProjects() {
        if (!dynamicContainer) return;

        // 1. Filter and sort
        const sorted = visibleProjects();

        // Handle No Results
        if (sorted.length === 0) {
            dynamicContainer.innerHTML = '';
            if (noResultsContainer) noResultsContainer.style.display = 'block';
            if (paginationContainer) paginationContainer.innerHTML = '';
            return;
        }
        if (noResultsContainer) noResultsContainer.style.display = 'none';

        // 2. Paginate
        const paginatedProjects = pageSlice(sorted, currentPage);

        // 3. Render
        dynamicContainer.innerHTML = paginatedProjects.map((proj) => generateDynamicCardHTML(proj)).join('\n');

        renderPagination(sorted.length);

        const activeLang = document.documentElement.getAttribute('lang') || 'de';
        document.dispatchEvent(new CustomEvent('langchange', { detail: activeLang }));
    }

    /** @param {number} totalProjects */
    function renderPagination(totalProjects) {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';
        const pageCount = totalPages(totalProjects);

        if (pageCount <= 1) return;

        for (let i = 1; i <= pageCount; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = String(i);
            pageBtn.className = 'btn-filter btn-pagination';
            if (i === currentPage) {
                pageBtn.classList.add('active');
            }
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                renderAllProjects();
                window.scrollTo({ top: document.getElementById('portfolio-searchbar').offsetTop, behavior: 'smooth' });
            });
            paginationContainer.appendChild(pageBtn);
        }
    }

    // Initial Load
    loadAndRenderProjects();

    // Dynamic Searchbar Placeholder translation
    const initialLang = document.documentElement.getAttribute('lang') || 'de';
    updateSearchbarPlaceholder(initialLang);

    document.addEventListener('langchange', (e) => {
        updateSearchbarPlaceholder(e.detail || 'de');
    });

    /** @param {string} lang */
    function updateSearchbarPlaceholder(lang) {
        if (!searchInput) return;
        searchInput.placeholder = lang === 'de' ? '🔍 Projekte durchsuchen...' : '🔍 Search projects...';
    }

    // Hire-Me Form handler
    const hireMeForm = document.getElementById('hire-me-form');
    if (hireMeForm) {
        hireMeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name =
                /** @type {HTMLInputElement | null} */ (document.getElementById('hire-me-name'))?.value.trim() || '';
            const email =
                /** @type {HTMLInputElement | null} */ (document.getElementById('hire-me-email'))?.value.trim() || '';
            const msg =
                /** @type {HTMLInputElement | null} */ (document.getElementById('hire-me-message'))?.value.trim() || '';
            const feedback = document.getElementById('hire-me-feedback');
            const subject = encodeURIComponent(`Portfolio Kontakt von ${name}`);
            const body = encodeURIComponent(`${msg}\n\nAbsender: ${name} <${email}>`);
            window.location.href = `mailto:sche-max@web.de?subject=${subject}&body=${body}`;
            if (feedback) {
                feedback.style.display = 'flex';
                setTimeout(() => {
                    feedback.style.display = 'none';
                }, 4000);
            }
        });
    }

    // Testimonial Carousel handler
    const testimonialDots = document.querySelectorAll('.testimonial-dot');
    const testimonialItems = document.querySelectorAll('.testimonial-item');
    if (testimonialDots.length && testimonialItems.length) {
        testimonialDots.forEach((dot) => {
            dot.addEventListener('click', () => {
                const idx = parseInt(dot.dataset.index);
                testimonialItems.forEach((item) => item.classList.remove('active'));
                testimonialDots.forEach((d) => d.classList.remove('active'));
                if (testimonialItems[idx]) testimonialItems[idx].classList.add('active');
                dot.classList.add('active');
            });
        });

        let currentTestimonial = 0;
        setInterval(() => {
            currentTestimonial = (currentTestimonial + 1) % testimonialItems.length;
            testimonialItems.forEach((item) => item.classList.remove('active'));
            testimonialDots.forEach((d) => d.classList.remove('active'));
            testimonialItems[currentTestimonial].classList.add('active');
            testimonialDots[currentTestimonial].classList.add('active');
        }, 6000);
    }

    // Handle radar chart click filtering
    document.addEventListener('radarfilter', (e) => {
        const rawSkill = e.detail;
        let searchWord = rawSkill;
        if (rawSkill === 'Java/OOP') searchWord = 'Java';
        else if (rawSkill === 'SQL/DB') searchWord = 'SQL';
        else if (rawSkill === 'HTML/CSS') searchWord = 'HTML';

        if (searchInput) {
            searchInput.value = searchWord;
            currentSearchTerm = searchWord.toLowerCase().trim();
            currentPage = 1;
            renderAllProjects();
            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            searchInput.focus();
        }
    });

    // Handle tag clicking in cards
    document.addEventListener('click', (e) => {
        const tagEl = /** @type {HTMLElement} */ (e.target).closest('.tech-tag');
        if (!tagEl) return;

        const tagName = tagEl.textContent.trim();
        if (searchInput) {
            searchInput.value = tagName;
            currentSearchTerm = tagName.toLowerCase();
            currentPage = 1;
            renderAllProjects();
            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            searchInput.focus();
        }
    });

    // Game Modal Functions
    /**
     * @param {string} gameUrl
     * @param {string} gameTitle
     */
    function openGameModal(gameUrl, gameTitle) {
        let modal = document.getElementById('game-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'game-modal';
            modal.className = 'game-modal hidden';
            modal.innerHTML = `
                <div class="game-modal-backdrop"></div>
                <div class="game-modal-content">
                    <div class="game-modal-header">
                        <h3 class="game-modal-title">${gameTitle}</h3>
                        <button class="game-modal-close" aria-label="Schließen / Close">✕</button>
                    </div>
                    <div class="game-modal-body">
                        <iframe id="game-modal-iframe" src="" style="width: 100%; height: 65vh; border: none; background: #000;"></iframe>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            modal.querySelector('.game-modal-close').addEventListener('click', closeGameModal);
            modal.querySelector('.game-modal-backdrop').addEventListener('click', closeGameModal);
        }

        const iframe = /** @type {HTMLImageElement} */ (document.getElementById('game-modal-iframe'));
        if (iframe) iframe.src = gameUrl;

        modal.classList.remove('hidden');
        modal.offsetHeight; // force reflow
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Keyboard handler for Game Modal Escape
        const handleEsc = (/** @type {KeyboardEvent} */ e) => {
            if (e.key === 'Escape') {
                closeGameModal();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }

    function closeGameModal() {
        const modal = document.getElementById('game-modal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
            const iframe = /** @type {HTMLImageElement} */ (document.getElementById('game-modal-iframe'));
            if (iframe) iframe.src = 'about:blank'; // unload game audio/scripts
            setTimeout(() => {
                if (!modal.classList.contains('show')) {
                    modal.classList.add('hidden');
                }
            }, 320);
        }
    }

    // Intercept game launch clicks
    document.addEventListener('click', (e) => {
        const link = /** @type {HTMLElement} */ (e.target).closest('a');
        if (!link) return;

        const href = link.getAttribute('href') || '';
        const isGameLink = href === 'snake.html' || href === 'memory.html' || href === 'quiz.html';

        if (isGameLink) {
            e.preventDefault();
            const card = link.closest('.project-card');
            const titleDe = card?.dataset.titleDe || card?.querySelector('h3')?.textContent || 'Game';
            openGameModal(href, titleDe);
        }
    });

    // Code Showcase Accordion Toggle
    const codeAccordionToggle = document.getElementById('code-accordion-toggle');
    const codeAccordionContent = document.getElementById('code-accordion-content');
    const codeShowcaseCard = document.getElementById('code-showcase');

    if (codeAccordionToggle && codeAccordionContent) {
        const toggleAccordion = () => {
            const isExpanded = codeAccordionToggle.getAttribute('aria-expanded') === 'true';
            const nextState = !isExpanded;

            codeAccordionToggle.setAttribute('aria-expanded', String(nextState));
            codeAccordionContent.setAttribute('aria-hidden', String(!nextState));

            if (nextState) {
                codeAccordionContent.style.display = 'block';
                codeShowcaseCard?.classList.add('open');
                codeAccordionToggle.querySelectorAll('.code-accordion-badge-text').forEach((el) => {
                    if (el.getAttribute('lang') === 'de') el.textContent = 'Code ausblenden';
                    if (el.getAttribute('lang') === 'en') el.textContent = 'Hide Code';
                });
            } else {
                codeAccordionContent.style.display = 'none';
                codeShowcaseCard?.classList.remove('open');
                codeAccordionToggle.querySelectorAll('.code-accordion-badge-text').forEach((el) => {
                    if (el.getAttribute('lang') === 'de') el.textContent = 'Code anzeigen';
                    if (el.getAttribute('lang') === 'en') el.textContent = 'Show Code';
                });
            }
        };

        codeAccordionToggle.addEventListener('click', toggleAccordion);
        codeAccordionToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleAccordion();
            }
        });
    }

    // Code Showcase Tab Switcher
    const codeTabButtons = document.querySelectorAll('.code-tab-btn');
    const codeSnippets = document.querySelectorAll('.code-snippet');
    if (codeTabButtons.length && codeSnippets.length) {
        codeTabButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;

                // Toggle active button
                codeTabButtons.forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');

                // Toggle active snippet
                codeSnippets.forEach((snip) => {
                    if (snip.id === targetId) {
                        snip.classList.add('active');
                        snip.style.display = 'block';
                    } else {
                        snip.classList.remove('active');
                        snip.style.display = 'none';
                    }
                });
            });
        });
    }
});
