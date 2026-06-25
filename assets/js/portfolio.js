/**
 * Portfolio Project Manager JS
 * Handles dynamic project addition, fetching projects from local projects.json and GitHub API,
 * LocalStorage caching for GitHub data, real-time live preview rendering,
 * HTML code export, and custom project removal.
 */

document.addEventListener('DOMContentLoaded', () => {
    const toggleAdminBtn = document.getElementById('toggle-admin-btn');
    const adminFormContainer = document.getElementById('admin-form-container');
    const projectForm = document.getElementById('project-form');
    const githubLoading = document.getElementById('github-loading');
    const githubError = document.getElementById('github-error');
    
    const inputTitleDe = document.getElementById('proj-title-de');
    const inputTitleEn = document.getElementById('proj-title-en');
    const inputTags = document.getElementById('proj-tags');
    const inputImage = document.getElementById('proj-image');
    const inputDescDe = document.getElementById('proj-desc-de');
    const inputDescEn = document.getElementById('proj-desc-en');
    const inputLink = document.getElementById('proj-link');
    
    const livePreviewContainer = document.getElementById('live-preview-container');
    const customProjectsContainer = document.getElementById('custom-projects-container');
    const exportSection = document.getElementById('export-section');
    const htmlExportCode = document.getElementById('html-export-code');
    const copyCodeBtn = document.getElementById('copy-code-btn');

    // GitHub API Configuration & Caching
    const GITHUB_USERNAME = document.getElementById('github-username')?.value?.trim() || 'Schengii';
    const CACHE_KEY = 'github_projects_cache';
    const CACHE_TIME_KEY = 'github_projects_cache_time';
    const CACHE_DURATION = 3600000; // 1 hour in milliseconds
    const SORT_KEY = 'portfolio_sort_order';
    const DEFAULT_SORT_ORDER = 'desc'; // default most stars first

    // Load and render existing custom projects from LocalStorage
    let customProjects = [];
    let allProjects = [];
    // Load persisted sort order
    const persistedSort = localStorage.getItem(SORT_KEY) || DEFAULT_SORT_ORDER;
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.value = persistedSort;
        sortSelect.addEventListener('change', () => {
            const order = sortSelect.value;
            localStorage.setItem(SORT_KEY, order);
            if (allProjects.length) renderProjects(sortProjects(allProjects, order));
        });
    }
    try {
        if (typeof StorageManager !== 'undefined') {
            customProjects = JSON.parse(StorageManager.getItem('portfolio_custom_projects', '[]')) || [];
        } else {
            customProjects = JSON.parse(localStorage.getItem('portfolio_custom_projects') || '[]');
        }
    } catch (e) {
        console.warn('Failed to parse custom projects:', e);
    }
    renderCustomProjects();

    // Load dynamic projects (projects.json + GitHub API)
    loadAndRenderProjects();

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
                    // Rate limit or forbidden
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
        const dynamicContainer = document.getElementById('dynamic-projects-container');
        if (!dynamicContainer) return;

        // Show loading spinner
        githubLoading.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <i class="fa fa-spinner fa-spin fa-2x" aria-hidden="true"></i>
                <p style="margin-top: 0.5rem;" lang="de">GitHub‑Projekte werden geladen...</p>
                <p style="margin-top: 0.5rem;" lang="en">Loading GitHub projects...</p>
            </div>
        `;
        githubLoading.style.display = 'block';

        try {
            let staticProjects = [];
        // Load static projects from window.projectsData if available
        if (window.projectsData && Array.isArray(window.projectsData)) {
            staticProjects = window.projectsData;
        } else {
            // Fallback to fetch projects.json
            const response = await fetch('./assets/data/projects.json');
            if (!response.ok) {
                throw new Error(`Failed to load projects.json: ${response.status}`);
            }
            staticProjects = await response.json();
        }
        // Additionally load folder projects (generated from local Projekt folders)
        try {
            const folderResponse = await fetch('./assets/data/folder_projects.json');
            if (folderResponse.ok) {
                const folderProjects = await folderResponse.json();
                staticProjects = staticProjects.concat(folderProjects);
            }
        } catch (e) {
            console.warn('Failed to load folder_projects.json', e);
        }
        const githubRepos = await fetchGitHubRepos();
            
            const mergedProjects = [];
            const claimedRepos = new Set();
            
            // 1. Process static projects from projects.json
            staticProjects.forEach(staticProj => {
                const proj = { ...staticProj };
                
                if (proj.repoName) {
                    const matchedRepo = githubRepos.find(repo => 
                        repo.name.toLowerCase() === proj.repoName.toLowerCase()
                    );
                    
                    if (matchedRepo) {
                        claimedRepos.add(matchedRepo.name.toLowerCase());
                        proj.stars = matchedRepo.stargazers_count || 0;
                        proj.githubUrl = matchedRepo.html_url;
                        proj.updatedAt = matchedRepo.updated_at;
                        // Use GitHub Pages URL if set on GitHub and not empty
                        if (matchedRepo.homepage && matchedRepo.homepage.trim() !== '') {
                            proj.link = matchedRepo.homepage;
                        }
                    } else {
                        proj.stars = 0;
                        proj.updatedAt = new Date().toISOString();
                    }
                } else {
                    proj.stars = 0;
                    proj.updatedAt = new Date().toISOString();
                }
                
                mergedProjects.push(proj);
            });
            
            // 2. Append new repositories from GitHub that are not in projects.json
            githubRepos.forEach(repo => {
                const nameLower = repo.name.toLowerCase();
                
                // Skip the portfolio repository itself, forks, and already claimed repositories
                if (nameLower === 'umschulung-fiae' || claimedRepos.has(nameLower) || repo.fork) {
                    return;
                }
                
                // Infer category based on topics
                let category = 'web';
                const topics = repo.topics || [];
                if (topics.some(t => ['game', 'games', 'godot', 'unity'].includes(t.toLowerCase()))) {
                    category = 'games';
                } else if (topics.some(t => ['ai', 'artificial-intelligence', 'machine-learning', 'data'].includes(t.toLowerCase()))) {
                    category = 'ai';
                }
                
                // Clean up name for title (e.g. "my-project-name" -> "My Project Name")
                const cleanTitle = repo.name
                    .replace(/[-_]/g, ' ')
                    .replace(/\b\w/g, c => c.toUpperCase());
                    
                const dynamicProj = {
                      repoName: repo.name,
                      titleDe: cleanTitle,
                      titleEn: cleanTitle,
                      tags: topics.length > 0 ? topics.slice(0, 5) : (repo.language ? [repo.language] : ['GitHub']),
                      // Use the repository owner's avatar as a preview image placeholder when no custom image is defined
                      image: repo.owner?.avatar_url || 'assets/images/default_project.png',
                      // Prefer a GitHub Pages homepage if set; otherwise fall back to the GitHub repo URL
                      link: repo.homepage && repo.homepage.trim() !== '' ? repo.homepage : repo.html_url,
                      githubUrl: repo.html_url,
                      descDe: repo.description || 'Keine Beschreibung auf GitHub hinterlegt.',
                      descEn: repo.description || 'No description provided on GitHub.',
                      category: category,
                      stars: repo.stargazers_count || 0,
                      updatedAt: repo.updated_at
                  };
                
                mergedProjects.push(dynamicProj);
            });
            
            // Store globally so sort works
            allProjects = mergedProjects;

            // Render the full merged project list
            githubLoading.style.display = 'none';
            githubError.style.display = 'none';
            dynamicContainer.innerHTML = mergedProjects.map(proj => generateDynamicCardHTML(proj)).join('\n');
            
            // Always attach listeners after render
            attachCardListeners();

            // Trigger translation alignment for new elements
            const activeLang = document.documentElement.getAttribute('lang') || 'de';
            document.dispatchEvent(new CustomEvent('langchange', { detail: activeLang }));
            
            // Re-apply category filters if search-filter.js is loaded
            if (typeof applyFilters === 'function') {
                applyFilters();
            }
        } catch (e) {
            console.error('Error loading or rendering projects:', e);
            githubError.innerHTML = `<div class="github-error">
                <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
                <span lang="de">GitHub‑Projekte konnten nicht geladen werden.</span>
                <span lang="en">GitHub projects could not be loaded.</span>
            </div>`;
            githubError.style.display = 'block';
            githubLoading.style.display = 'none';
        }
    }

    // Dynamic Card Generator
    function generateDynamicCardHTML(project) {
    // Build language/framework badges if available
    let techBadge = '';
    if (project.language || project.framework) {
        const lang = project.language ? `${project.language}` : '';
        const fw = project.framework ? ` / ${project.framework}` : '';
        techBadge = `\n            <p class="project-tech" style="margin: 0.5rem 0; font-weight: 500; color: var(--text-primary);"><strong>Tech:</strong> ${lang}${fw}</p>`;
    }
        const isGame = project.category && project.category.includes('games');
        const isAi = project.category && project.category.includes('ai');
        
        // Build tags
        const tagsHTML = project.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('\n        ');
        
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
        if (project.stars > 0) {
            starsHTML = `
            <span class="stars-badge" title="${project.stars} Stars on GitHub" style="display: inline-flex; align-items: center; background: var(--bg-page); border: 1px solid var(--border); border-radius: var(--radius-full); padding: 0.25rem 0.6rem; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-left: 0.5rem; float: right;">
                <i class="fa fa-star" aria-hidden="true" style="color: #eab308; margin-right: 0.25rem;"></i> ${project.stars}
            </span>`;
        }

        // Build buttons
        let buttonsHTML = '<div class="mt-1rem" style="display: flex; gap: 0.75rem; flex-wrap: wrap;">';
        
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
            <a href="${project.link}" class="btn-primary custom-size" target="_blank" rel="noopener" style="flex: 1; min-width: 130px; text-align: center; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;">
                <span lang="de"><i class="fa ${btnIcon}" aria-hidden="true"></i> ${btnTextDe}</span>
                <span lang="en"><i class="fa ${btnIcon}" aria-hidden="true"></i> ${btnTextEn}</span>
            </a>`;
        }
        
        if (project.githubUrl) {
            buttonsHTML += `
            <a href="${project.githubUrl}" class="btn-primary custom-size" target="_blank" rel="noopener" style="flex: 1; min-width: 130px; text-align: center; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; background-color: var(--bg-nav); border-color: var(--bg-nav);">
                <span lang="de"><i class="fa-brands fa-github" aria-hidden="true"></i> Quellcode</span>
                <span lang="en"><i class="fa-brands fa-github" aria-hidden="true"></i> View Source</span>
            </a>`;
        }
        
        buttonsHTML += '</div>';

        // Set category class for filtering
        let categoryClass = '';
        if (project.category) {
            categoryClass = project.category.split(' ').map(c => `filter-${c}`).join(' ');
        } else {
            categoryClass = 'filter-web';
        }

        const safeTagsAttr = encodeURIComponent(JSON.stringify(project.tags));
        return `
        <article class="card project-card fade-in visible ${categoryClass}" data-title-de="${project.titleDe}" data-title-en="${project.titleEn}" data-desc-de="${project.descDe}" data-desc-en="${project.descEn}" data-image="${project.image || ''}" data-link="${project.link || ''}" data-github="${project.githubUrl || ''}" data-tags="${safeTagsAttr}">
            ${starsHTML}
            <h3 lang="de">${project.titleDe}</h3>
            <h3 lang="en">${project.titleEn}</h3>
            
            <div class="tech-tags">
                ${tagsHTML}
            </div>
            ${imageHTML}
            <p lang="de">${project.descDe}</p>
            ${techBadge}
            <p lang="en">${project.descEn}</p>
            ${buttonsHTML}
        </article>`;
    }

    // Modal handling functions
    function openProjectModal(card) {
        const modal = document.getElementById('project-modal');
        const body = document.getElementById('modal-body-content');
        if (!modal || !body) return;
        const titleDe = card.dataset.titleDe || '';
        const titleEn = card.dataset.titleEn || '';
        const descDe = card.dataset.descDe || '';
        const descEn = card.dataset.descEn || '';
        const image = card.dataset.image;
        const link = card.dataset.link;
        const github = card.dataset.github;
        let tags = [];
        try {
            tags = JSON.parse(decodeURIComponent(card.dataset.tags || '%5B%5D'));
        } catch(e) { tags = []; }
        const tagsHTML = tags.map(tag => `<span class="tech-tag">${tag}</span>`).join(' ');
        body.innerHTML = `
            <h2 lang="de">${titleDe}</h2>
            <h2 lang="en">${titleEn}</h2>
            <div class="tech-tags">${tagsHTML}</div>
            ${image ? `<img src="${image}" alt="${titleDe}" style="width:100%;border-radius:8px;margin:1rem 0;">` : ''}
            <p lang="de">${descDe}</p>
            <p lang="en">${descEn}</p>
            <div class="modal-buttons" style="margin-top:1rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
                ${link ? `<a href="${link}" target="_blank" rel="noopener" class="btn-primary custom-size"><span lang="de"><i class="fa fa-external-link" aria-hidden="true"></i> Projekt öffnen</span><span lang="en"><i class="fa fa-external-link" aria-hidden="true"></i> Open Project</span></a>` : ''}
                ${github ? `<a href="${github}" target="_blank" rel="noopener" class="btn-primary custom-size" style="background-color:var(--bg-nav); border-color:var(--bg-nav);"><span lang="de"><i class="fa-brands fa-github" aria-hidden="true"></i> Quellcode</span><span lang="en"><i class="fa-brands fa-github" aria-hidden="true"></i> View Source</span></a>` : ''}
            </div>`;
        modal.classList.add('show');
        modal.removeAttribute('aria-hidden');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeProjectModal() {
        const modal = document.getElementById('project-modal');
        if (modal) {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }

    function attachCardListeners() {
        // Card click opens modal (excluding inner links/buttons)
        // Use a flag to avoid adding duplicate listeners on re-renders
        // No blacklist – show all projects
        const cards = document.querySelectorAll('.project-card');
        cards.forEach(card => {
            if (!card.dataset.listenerAttached) {
                card.dataset.listenerAttached = 'true';
                card.addEventListener('click', (e) => {
                    if (e.target.closest('a') || e.target.closest('button')) return;
                    openProjectModal(card);
                });
            }
        });

        // Modal close button (only attach once)
        const closeBtn = document.querySelector('.modal-close:not([data-listener-attached])');
        if (closeBtn) {
            closeBtn.setAttribute('data-listener-attached', 'true');
            closeBtn.addEventListener('click', closeProjectModal);
        }

        // Click outside modal content to close (only attach once)
        const modal = document.getElementById('project-modal');
        if (modal && !modal.dataset.backdropListener) {
            modal.dataset.backdropListener = 'true';
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeProjectModal();
            });
        }

        // Escape key to close modal (only attach once)
        if (!document._escListenerAttached) {
            document._escListenerAttached = true;
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeProjectModal();
            });
        }
    }
    // ============================================================
    // ADMIN PROJECT FORM & PREVIEW (LOCAL ONLY)
    // ============================================================

    // Toggle Admin Card
    if (toggleAdminBtn && adminFormContainer) {
        toggleAdminBtn.addEventListener('click', () => {
            const isCollapsed = adminFormContainer.classList.contains('collapsed');
            if (isCollapsed) {
                adminFormContainer.classList.remove('collapsed');
                toggleAdminBtn.setAttribute('aria-expanded', 'true');
                toggleAdminBtn.innerHTML = '<i class="fa fa-minus" aria-hidden="true"></i> Schließen / Close';
                updateLivePreview(); // Init preview
            } else {
                adminFormContainer.classList.add('collapsed');
                toggleAdminBtn.setAttribute('aria-expanded', 'false');
                toggleAdminBtn.innerHTML = '<i class="fa fa-plus" aria-hidden="true"></i> Neues Projekt / New Project';
            }
        });
    }

    // Real-time Live Preview listeners
    const inputFields = [inputTitleDe, inputTitleEn, inputTags, inputImage, inputDescDe, inputDescEn, inputLink];
    inputFields.forEach(field => {
        if (field) {
            field.addEventListener('input', updateLivePreview);
        }
    });

    function getFormValues() {
        const titleDe = (inputTitleDe ? inputTitleDe.value.trim() : '') || '🍳 Projekt-Titel';
        const titleEn = (inputTitleEn ? inputTitleEn.value.trim() : '') || '🍳 Project Title';
        const tagsRaw = inputTags ? inputTags.value.trim() : '';
        const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(t => t) : ['HTML5', 'CSS3', 'JS'];
        const image = (inputImage ? inputImage.value.trim() : '') || 'assets/images/career_mentoring.png';
        const descDe = (inputDescDe ? inputDescDe.value.trim() : '') || 'Hier steht deine deutsche Projektbeschreibung...';
        const descEn = (inputDescEn ? inputDescEn.value.trim() : '') || 'Your English project description goes here...';
        const link = inputLink ? inputLink.value.trim() : '';

        return { titleDe, titleEn, tags, image, descDe, descEn, link };
    }

    function generateCardHTML(project, isPreview = false, index = null) {
        const tagsHTML = project.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('\n        ');
        
        let imageHTML = '';
        if (project.image) {
            imageHTML = `
    <div style="margin: 1.25rem 0; border-radius: 8px; overflow: hidden; border: 1px solid var(--border);">
        <img src="${project.image}" alt="${project.titleDe}" loading="lazy" style="width: 100%; height: auto; display: block; max-height: 350px; object-fit: cover; margin-bottom: 0;">
    </div>`;
        }

        let linkHTML = '';
        if (project.link) {
            linkHTML = `
    <div style="margin-top: 1rem;">
        <a href="${project.link}" target="_blank" rel="noopener" class="btn-primary" style="display: inline-block; width: auto; text-decoration: none; padding: 0.5rem 1rem;">
            <span lang="de"><i class="fa fa-external-link" aria-hidden="true"></i> Link öffnen</span>
            <span lang="en"><i class="fa fa-external-link" aria-hidden="true"></i> View Link</span>
        </a>
    </div>`;
        }

        let deleteBtnHTML = '';
        if (!isPreview && index !== null) {
            deleteBtnHTML = `
            <button class="btn-delete-project" data-index="${index}" title="Projekt löschen" aria-label="Projekt löschen">
                <i class="fa fa-trash" aria-hidden="true"></i>
            </button>`;
        }

        return `
<article class="card fade-in visible" style="position: relative;">
    ${deleteBtnHTML}
    <h3 lang="de">${project.titleDe}</h3>
    <h3 lang="en">${project.titleEn}</h3>
    <div class="tech-tags">
        ${tagsHTML}
    </div>
    ${imageHTML}
    <p lang="de">${project.descDe}</p>
    <p lang="en">${project.descEn}</p>
    ${linkHTML}
</article>`;
    }

    function updateLivePreview() {
        if (!livePreviewContainer) return;
        const project = getFormValues();
        livePreviewContainer.innerHTML = generateCardHTML(project, true);
        
        // Reinforce translation rules in preview
        const activeLang = document.documentElement.getAttribute('lang') || 'de';
        const deEl = livePreviewContainer.querySelectorAll('[lang="de"]');
        const enEl = livePreviewContainer.querySelectorAll('[lang="en"]');
        
        if (activeLang === 'de') {
            enEl.forEach(el => el.style.setProperty('display', 'none', 'important'));
            deEl.forEach(el => el.style.removeProperty('display'));
        } else {
            deEl.forEach(el => el.style.setProperty('display', 'none', 'important'));
            enEl.forEach(el => el.style.removeProperty('display'));
        }
    }

    // Form submit to save
    if (projectForm) {
        projectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const project = getFormValues();
            
            // Save to array
            customProjects.push(project);
            if (typeof StorageManager !== 'undefined') {
                StorageManager.setItem('portfolio_custom_projects', JSON.stringify(customProjects));
            } else {
                localStorage.setItem('portfolio_custom_projects', JSON.stringify(customProjects));
            }
            
            // Update container
            renderCustomProjects();
            
            // Show Export section
            if (exportSection && htmlExportCode) {
                const rawHTML = generateCardHTML(project, true).trim();
                htmlExportCode.textContent = rawHTML;
                exportSection.style.display = 'block';
            }
            
            // Reset form
            projectForm.reset();
            updateLivePreview();
        });
    }

    // Render Saved Custom Projects
    function renderCustomProjects() {
        if (!customProjectsContainer) return;
        customProjectsContainer.innerHTML = '';

        customProjects.forEach((proj, idx) => {
            const cardHTML = generateCardHTML(proj, false, idx);
            customProjectsContainer.insertAdjacentHTML('beforeend', cardHTML);
        });

        // Add delete listeners
        const deleteButtons = customProjectsContainer.querySelectorAll('.btn-delete-project');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.getAttribute('data-index'));
                const confirmDe = confirm('Möchtest du dieses Projekt wirklich aus deinem lokalen Speicher löschen?\n\nDo you really want to delete this project from your local storage?');
                if (confirmDe) {
                    customProjects.splice(idx, 1);
                    if (typeof StorageManager !== 'undefined') {
                        StorageManager.setItem('portfolio_custom_projects', JSON.stringify(customProjects));
                    } else {
                        localStorage.setItem('portfolio_custom_projects', JSON.stringify(customProjects));
                    }
                    renderCustomProjects();
                    if (exportSection) exportSection.style.display = 'none';
                }
            });
        });

        // Trigger language switcher alignment
        const activeLang = document.documentElement.getAttribute('lang') || 'de';
        document.dispatchEvent(new CustomEvent('langchange', { detail: activeLang }));
        attachCardListeners();
    }

    // Copy Code button
    if (copyCodeBtn && htmlExportCode) {
        copyCodeBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(htmlExportCode.textContent).then(() => {
                const origText = copyCodeBtn.innerHTML;
                copyCodeBtn.innerHTML = '<i class="fa fa-check"></i> Kopiert! / Copied!';
                copyCodeBtn.style.backgroundColor = '#10b981';
                setTimeout(() => {
                    copyCodeBtn.innerHTML = origText;
                    copyCodeBtn.style.backgroundColor = '';
                }, 1500);
            });
        });
    }

    // Dark mode button – theme.js handles the actual init;
    // here we just sync the portfolio-page toggle button if theme.js isn't available
    function initDarkModeToggleFallback() {
        const toggleBtn = document.getElementById('dark-mode-toggle');
        if (!toggleBtn) return;
        // Only attach if theme.js hasn't already done it (check for data attribute set by theme.js)
        if (toggleBtn.dataset.themeInitialized) return;
        const stored = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = stored || (prefersDark ? 'dark' : 'light');
        document.documentElement.dataset.theme = theme;
        toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
        toggleBtn.classList.toggle('rotate', theme === 'dark');
        toggleBtn.addEventListener('click', () => {
            const newTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            document.documentElement.dataset.theme = newTheme;
            localStorage.setItem('theme', newTheme);
            toggleBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
            toggleBtn.classList.toggle('rotate', newTheme === 'dark');
        });
    }

    initDarkModeToggleFallback();

    // Listen to global language change to keep previews in sync
    document.addEventListener('langchange', () => {
        updateLivePreview();
    });
});
