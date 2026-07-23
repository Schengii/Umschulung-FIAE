/**
 * Portfolio Page Logic
 * Handles dynamic project loading from static projectsData and GitHub API,
 * LocalStorage caching for GitHub data, search, filtering, pagination,
 * testimonial carousel, contact form submission, and language changes.
 */

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('portfolio-searchbar');
    const sortSelect = document.getElementById('sort-select');
    const filterButtons = document.querySelectorAll('.portfolio-filters .btn-filter');
    const noResultsContainer = document.getElementById('no-results-container');
    const paginationContainer = document.getElementById('pagination-container');
    const dynamicContainer = document.getElementById('dynamic-projects-container');
    const skeletonLoader = document.getElementById('skeleton-loader');
    const githubError = document.getElementById('github-error');

    // GitHub API Configuration & Caching
    const GITHUB_USERNAME = document.getElementById('github-username')?.value?.trim() || 'Schengii';
    const CACHE_KEY = 'github_projects_cache';
    const CACHE_TIME_KEY = 'github_projects_cache_time';
    const CACHE_DURATION = 3600000; // 1 hour in milliseconds
    const SORT_KEY = 'portfolio_sort_order';
    const DEFAULT_SORT_ORDER = 'desc';

    // State for filtering and pagination
    let allProjects = [];
    let currentPage = 1;
    const projectsPerPage = 6;
    let currentSearchTerm = '';
    let currentCategory = 'all';

    // Event Listeners for Filters & Sorting
    const persistedSort = localStorage.getItem(SORT_KEY) || DEFAULT_SORT_ORDER;
    if (sortSelect) {
        sortSelect.value = persistedSort;
        sortSelect.addEventListener('change', () => {
            const order = sortSelect.value;
            localStorage.setItem(SORT_KEY, order);
            if (allProjects.length) renderAllProjects();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value.toLowerCase().trim();
            currentPage = 1; // Reset to first page on search
            renderAllProjects();
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentCategory = button.getAttribute('data-filter') || 'all';
            currentPage = 1; // Reset to first page on filter change
            renderAllProjects();
        });
    });

    let hashHandled = false;
    function handleDeepLink() {
        if (hashHandled) return;
        const hash = decodeURIComponent(window.location.hash.substring(1)).trim();
        if (!hash) return;
        
        // Find project in allProjects
        const index = allProjects.findIndex(proj => {
            const titleDe = (proj.titleDe || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const titleEn = (proj.titleEn || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const repoName = (proj.repoName || '').toLowerCase();
            const cleanHash = hash.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            
            return titleDe.includes(cleanHash) || titleEn.includes(cleanHash) || repoName === cleanHash;
        });
        
        if (index !== -1) {
            currentPage = Math.floor(index / projectsPerPage) + 1;
            hashHandled = true;
            renderAllProjects(); // Render the correct page
            
            // Find card in DOM and open it after render
            setTimeout(() => {
                const cards = document.querySelectorAll('.project-card');
                const cleanHash = hash.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                for (const card of cards) {
                    const titleDe = (card.dataset.titleDe || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                    const titleEn = (card.dataset.titleEn || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                    if (titleDe.includes(cleanHash) || titleEn.includes(cleanHash)) {
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
            allProjects = (window.projectsData && Array.isArray(window.projectsData)) ? window.projectsData : [];
            
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

    // Dynamic Card Generator
    function generateDynamicCardHTML(project) {
        const isGame = project.category && project.category.includes('games');
        const isAi = project.category && project.category.includes('ai');
        
        // Build tags (guard against null/empty)
        const tags = Array.isArray(project.tags) ? project.tags : [];
        const tagsHTML = tags.length > 0
            ? tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('\n        ')
            : '';
        
        // Build image
        let imageHTML = '';
        if (project.image) {
            const resolvedImg = (window.resolveAssetPath || (p => p))(project.image);
            imageHTML = `
            <div class="project-image-container">
                <img src="${resolvedImg}" alt="${project.titleDe}" loading="lazy" class="project-image">
            </div>`;
        }
        
        // Build stars badge
        let starsHTML = '';
        if (project.stars !== undefined && project.stars > 0) {
            starsHTML = `<span class="stars-badge" title="${project.stars} Stars on GitHub"><i class="fa fa-star" aria-hidden="true"></i> ${project.stars}</span>`;
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
            
            const resolvedLink = (window.resolveAssetPath || (p => p))(project.link);
            buttonsHTML += `
            <a href="${resolvedLink}" class="btn-secondary btn-project" target="_blank" rel="noopener">
                <span lang="de"><i class="fa ${btnIcon}" aria-hidden="true"></i> ${btnTextDe}</span>
                <span lang="en"><i class="fa ${btnIcon}" aria-hidden="true"></i> ${btnTextEn}</span>
            </a>`;
        }
        
        if (project.githubUrl) {
            buttonsHTML += `
            <a href="${project.githubUrl}" class="btn-secondary btn-project btn-github" target="_blank" rel="noopener">
                <span lang="de"><i class="fa-brands fa-github" aria-hidden="true"></i> Quellcode</span>
                <span lang="en"><i class="fa-brands fa-github" aria-hidden="true"></i> View Source</span>
            </a>`;
        }
        
        buttonsHTML += '</div>';

        // Set category class for filtering
        const languageClass = project.language ? `filter-${project.language.toLowerCase()}` : '';
        let categoryClass = '';
        if (project.category) {
            categoryClass = project.category.split(' ').map(c => `filter-${c}`).join(' ');
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
            const safeImagesAttr = encodeURIComponent(JSON.stringify(project.images || (project.image ? [project.image] : [])));
            return `
            <article class="card project-card highlight-project fade-in visible ${categoryClass} ${languageClass}" data-repo-name="${project.repoName || ''}" data-title-de="${project.titleDe}" data-title-en="${project.titleEn}" data-desc-de="${project.descDe}" data-desc-en="${project.descEn}" data-image="${project.image || ''}" data-images="${safeImagesAttr}" data-link="${project.link || ''}" data-github="${project.githubUrl || ''}" data-tags="${safeTagsAttr}">
                ${imageHTML}
                <div class="highlight-content-wrapper">
                    ${highlightBadgeHTML}
                    <div class="project-card-header">
                        <h3 lang="de">${project.titleDe}</h3>
                        <h3 lang="en">${project.titleEn}</h3>
                        ${starsHTML}
                    </div>
                    <div class="tech-tags">
                        ${tagsHTML}
                    </div>
                    <p lang="de">${project.descDe}</p>
                    <p lang="en">${project.descEn}</p>
                    ${buttonsHTML}
                </div>
            </article>`;
        }

        const safeImagesAttr = encodeURIComponent(JSON.stringify(project.images || (project.image ? [project.image] : [])));
        return `
        <article class="card project-card fade-in visible ${categoryClass} ${languageClass}" data-repo-name="${project.repoName || ''}" data-title-de="${project.titleDe}" data-title-en="${project.titleEn}" data-desc-de="${project.descDe}" data-desc-en="${project.descEn}" data-image="${project.image || ''}" data-images="${safeImagesAttr}" data-link="${project.link || ''}" data-github="${project.githubUrl || ''}" data-tags="${safeTagsAttr}">
            <div class="project-card-header">
                <h3 lang="de">${project.titleDe}</h3>
                <h3 lang="en">${project.titleEn}</h3>
                ${starsHTML}
            </div>
            <div class="tech-tags">
                ${tagsHTML}
            </div>
            ${imageHTML}
            <p lang="de">${project.descDe}</p>
            <p lang="en">${project.descEn}</p>
            ${buttonsHTML}
        </article>`;
    }

    function renderAllProjects() {
        if (!dynamicContainer) return;

        // 1. Filter
        const filteredProjects = allProjects.filter(proj => {
            const matchesCategory = currentCategory === 'all' || 
                                   (proj.category && proj.category.includes(currentCategory)) || 
                                   (proj.language && proj.language.toLowerCase() === currentCategory);
            
            if (!matchesCategory) return false;

            if (currentSearchTerm) {
                const titleDe = (proj.titleDe || '').toLowerCase();
                const titleEn = (proj.titleEn || '').toLowerCase();
                const descDe = (proj.descDe || '').toLowerCase();
                const descEn = (proj.descEn || '').toLowerCase();
                const tags = (proj.tags || []).map(t => t.toLowerCase());

                return titleDe.includes(currentSearchTerm) ||
                       titleEn.includes(currentSearchTerm) ||
                       descDe.includes(currentSearchTerm) ||
                       descEn.includes(currentSearchTerm) ||
                       tags.some(tag => tag.includes(currentSearchTerm));
            }
            return true;
        });

        // 2. Sort
        const sorted = sortProjects(filteredProjects, localStorage.getItem(SORT_KEY) || DEFAULT_SORT_ORDER);

        // 3. Handle No Results
        if (sorted.length === 0) {
            dynamicContainer.innerHTML = '';
            if (noResultsContainer) noResultsContainer.style.display = 'block';
            if (paginationContainer) paginationContainer.innerHTML = '';
            return;
        }
        if (noResultsContainer) noResultsContainer.style.display = 'none';

        // 4. Paginate
        const startIndex = (currentPage - 1) * projectsPerPage;
        const endIndex = startIndex + projectsPerPage;
        const paginatedProjects = sorted.slice(startIndex, endIndex);

        // 5. Render
        dynamicContainer.innerHTML = paginatedProjects.map(proj => generateDynamicCardHTML(proj)).join('\n');

        renderPagination(sorted.length);

        const activeLang = document.documentElement.getAttribute('lang') || 'de';
        document.dispatchEvent(new CustomEvent('langchange', { detail: activeLang }));
    }

    function renderPagination(totalProjects) {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(totalProjects / projectsPerPage);

        if (totalPages <= 1) return;

        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
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

    function sortProjects(projects, order) {
        return [...projects].sort((a, b) => {
            if (a.repoName === 'EcoChef') return -1;
            if (b.repoName === 'EcoChef') return 1;
            if (a.repoName === 'ManuFaktur') return -1;
            if (b.repoName === 'ManuFaktur') return 1;
            const starsA = a.stars || 0;
            const starsB = b.stars || 0;
            return order === 'asc' ? starsA - starsB : starsB - starsA;
        });
    }

    // Initial Load
    loadAndRenderProjects();

    // Dynamic Searchbar Placeholder translation
    const initialLang = document.documentElement.getAttribute('lang') || 'de';
    updateSearchbarPlaceholder(initialLang);

    document.addEventListener('langchange', (e) => {
        updateSearchbarPlaceholder(e.detail || 'de');
    });

    function updateSearchbarPlaceholder(lang) {
        if (!searchInput) return;
        searchInput.placeholder = lang === 'de' ? '🔍 Projekte durchsuchen...' : '🔍 Search projects...';
    }

    // Hire-Me Form handler
    const hireMeForm = document.getElementById('hire-me-form');
    if (hireMeForm) {
        hireMeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('hire-me-name')?.value.trim() || '';
            const email = document.getElementById('hire-me-email')?.value.trim() || '';
            const msg = document.getElementById('hire-me-message')?.value.trim() || '';
            const feedback = document.getElementById('hire-me-feedback');
            const subject = encodeURIComponent(`Portfolio Kontakt von ${name}`);
            const body = encodeURIComponent(`${msg}\n\nAbsender: ${name} <${email}>`);
            window.location.href = `mailto:sche-max@web.de?subject=${subject}&body=${body}`;
            if (feedback) {
                feedback.style.display = 'flex';
                setTimeout(() => { feedback.style.display = 'none'; }, 4000);
            }
        });
    }

    // Testimonial Carousel handler
    const testimonialDots = document.querySelectorAll('.testimonial-dot');
    const testimonialItems = document.querySelectorAll('.testimonial-item');
    if (testimonialDots.length && testimonialItems.length) {
        testimonialDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const idx = parseInt(dot.dataset.index);
                testimonialItems.forEach(item => item.classList.remove('active'));
                testimonialDots.forEach(d => d.classList.remove('active'));
                if (testimonialItems[idx]) testimonialItems[idx].classList.add('active');
                dot.classList.add('active');
            });
        });
        
        let currentTestimonial = 0;
        setInterval(() => {
            currentTestimonial = (currentTestimonial + 1) % testimonialItems.length;
            testimonialItems.forEach(item => item.classList.remove('active'));
            testimonialDots.forEach(d => d.classList.remove('active'));
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
        const tagEl = e.target.closest('.tech-tag');
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

            // Inject game modal styles
            const style = document.createElement('style');
            style.textContent = `
                .game-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                }
                .game-modal.show {
                    opacity: 1;
                    pointer-events: all;
                }
                .game-modal-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.85);
                    backdrop-filter: blur(5px);
                }
                .game-modal-content {
                    position: relative;
                    width: 95%;
                    max-width: 950px;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg, 12px);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                    transform: scale(0.95);
                    transition: transform 0.3s ease;
                }
                .game-modal.show .game-modal-content {
                    transform: scale(1);
                }
                .game-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem 1.25rem;
                    border-bottom: 1px solid var(--border);
                }
                .game-modal-title {
                    margin: 0;
                    font-size: 1.15rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }
                .game-modal-close {
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    font-weight: bold;
                    cursor: pointer;
                    color: var(--text-muted);
                    transition: color 0.2s;
                }
                .game-modal-close:hover {
                    color: var(--primary);
                }
                .game-modal-body {
                    padding: 0;
                    background: #000;
                }
            `;
            document.head.appendChild(style);

            modal.querySelector('.game-modal-close').addEventListener('click', closeGameModal);
            modal.querySelector('.game-modal-backdrop').addEventListener('click', closeGameModal);
        }

        const iframe = document.getElementById('game-modal-iframe');
        if (iframe) iframe.src = gameUrl;
        
        modal.classList.remove('hidden');
        modal.offsetHeight; // force reflow
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Keyboard handler for Game Modal Escape
        const handleEsc = (e) => {
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
            const iframe = document.getElementById('game-modal-iframe');
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
        const link = e.target.closest('a');
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

    // Code Showcase Tab Switcher
    const codeTabButtons = document.querySelectorAll('.code-tab-btn');
    const codeSnippets = document.querySelectorAll('.code-snippet');
    if (codeTabButtons.length && codeSnippets.length) {
        codeTabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                
                // Toggle active button
                codeTabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Toggle active snippet
                codeSnippets.forEach(snip => {
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
