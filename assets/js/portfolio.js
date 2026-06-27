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

    // Fetch repositories from GitHub API with caching
    async function fetchGitHubRepos() {
        const maxAttempts = 3;
        const delay = 500; // ms
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const cachedData = localStorage.getItem(CACHE_KEY);
                const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
                if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime) < CACHE_DURATION)) {
                    return JSON.parse(cachedData);
                }
                const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`);
                if (response.status === 403) {
                    const errorMsg = 'GitHub rate limit exceeded or access forbidden.';
                    showError(githubError, errorMsg);
                    throw new Error(errorMsg);
                }
                if (!response.ok) {
                    throw new Error(`GitHub API error: ${response.status}`);
                }
                const repos = await response.json();
                localStorage.setItem(CACHE_KEY, JSON.stringify(repos));
                localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
                return repos;
            } catch (e) {
                if (attempt < maxAttempts) {
                    await new Promise(res => setTimeout(res, delay * Math.pow(2, attempt - 1)));
                } else {
                    console.warn('Failed to fetch from GitHub API after retries, falling back to cache:', e);
                    const cachedData = localStorage.getItem(CACHE_KEY);
                    return cachedData ? JSON.parse(cachedData) : [];
                }
            }
        }
    }

    // Utility to show error messages
    function showError(container, message) {
        if (!container) return;
        container.innerHTML = `<div class="github-error"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> ${message}</div>`;
        container.style.display = 'block';
    }

    // Merge static and dynamic project data and render them
    async function loadAndRenderProjects() {
        if (!dynamicContainer) return;
        if (skeletonLoader) skeletonLoader.style.display = 'grid';
        if (githubError) githubError.style.display = 'none';
    
        try {
            // Use pre-loaded window.projectsData to avoid fetch CORS issues with file:// protocol
            const staticProjects = (window.projectsData && Array.isArray(window.projectsData)) ? window.projectsData : [];
            const [githubRepos, folderProjects] = await Promise.all([
                fetchGitHubRepos(),
                fetch('assets/data/folder_projects.json').then(res => res.ok ? res.json() : []).catch(() => [])
            ]);
    
            const githubRepoMap = new Map(githubRepos.map(repo => [repo.name.toLowerCase(), repo]));
            const processedRepoNames = new Set();
    
            // 1. Process and enrich static projects from projects_data.js
            const enrichedStaticProjects = staticProjects.map(proj => {
                const enriched = { ...proj };
                if (enriched.repoName) {
                    const repoNameLower = enriched.repoName.toLowerCase();
                    processedRepoNames.add(repoNameLower);
                    const ghRepo = githubRepoMap.get(repoNameLower);
                    if (ghRepo) {
                        enriched.stars = ghRepo.stargazers_count || 0;
                        enriched.githubUrl = ghRepo.html_url;
                        enriched.updatedAt = ghRepo.updated_at;
                        enriched.language = ghRepo.language;
                        if (ghRepo.homepage && ghRepo.homepage.trim() !== '') {
                            enriched.link = ghRepo.homepage;
                        }
                    }
                }
                return enriched;
            });
    
            // 2. Add new, unprocessed repos from GitHub (disabled - user wants individual integration)
            const newGithubProjects = [];
    
            // Filter out folder projects that are already covered by enrichedStaticProjects
            const enrichedRepoNames = new Set(enrichedStaticProjects.map(p => (p.titleDe || '').toLowerCase()));
            const filteredFolderProjects = folderProjects.filter(fp => {
                const fpTitle = (fp.titleDe || '').toLowerCase();
                const isDuplicate = enrichedRepoNames.has(fpTitle);
                const hasDescription = fp.descDe && fp.descDe.trim() !== '';
                return !isDuplicate && hasDescription;
            });
 
            // Store all fetched projects
            allProjects = [...enrichedStaticProjects, ...filteredFolderProjects, ...newGithubProjects];
    
            // Render everything
            renderAllProjects();
    
        } catch (e) {
            console.error('Error loading or rendering projects:', e);
            if (githubError) {
                githubError.innerHTML = `<div class="github-error">
                <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
                <span lang="de">GitHub‑Projekte konnten nicht geladen werden.</span>
                <span lang="en">GitHub projects could not be loaded.</span>
            </div>`;
                githubError.style.display = 'block';
            }
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
            imageHTML = `
            <div class="project-image-container">
                <img src="${project.image}" alt="${project.titleDe}" loading="lazy" class="project-image">
            </div>`;
        }
        
        // Build stars badge
        let starsHTML = '';
        if (project.stars !== undefined && project.stars > 0) {
            starsHTML = `<span class="stars-badge" title="${project.stars} Stars on GitHub"><i class="fa fa-star" aria-hidden="true"></i> ${project.stars}</span>`;
        }

        // Build buttons
        let buttonsHTML = '<div class="project-buttons">';
        
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
            
            buttonsHTML += `
            <a href="${project.link}" class="btn-primary btn-project" target="_blank" rel="noopener">
                <span lang="de"><i class="fa ${btnIcon}" aria-hidden="true"></i> ${btnTextDe}</span>
                <span lang="en"><i class="fa ${btnIcon}" aria-hidden="true"></i> ${btnTextEn}</span>
            </a>`;
        }
        
        if (project.githubUrl) {
            buttonsHTML += `
            <a href="${project.githubUrl}" class="btn-primary btn-project btn-github" target="_blank" rel="noopener">
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
        return `
        <article class="card project-card fade-in visible ${categoryClass} ${languageClass}" data-repo-name="${project.repoName || ''}" data-title-de="${project.titleDe}" data-title-en="${project.titleEn}" data-desc-de="${project.descDe}" data-desc-en="${project.descEn}" data-image="${project.image || ''}" data-link="${project.link || ''}" data-github="${project.githubUrl || ''}" data-tags="${safeTagsAttr}">
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
            window.location.href = `mailto:max@max-schenk.de?subject=${subject}&body=${body}`;
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
});
