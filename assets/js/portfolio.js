/**
 * Portfolio Page Logic
 * Handles dynamic project addition, fetching projects from local projects.json and GitHub API,
 * LocalStorage caching for GitHub data, real-time live preview rendering,
 * HTML code export, and custom project removal.
 */

document.addEventListener('DOMContentLoaded', () => {
    const toggleAdminBtn = document.getElementById('toggle-admin-btn');
    const adminFormContainer = document.getElementById('admin-form-container');
    const projectForm = document.getElementById('project-form');    
    const githubLoading = document.getElementById('github-loading');
    const dynamicContainer = document.getElementById('dynamic-projects-container');
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
    const skeletonLoader = document.getElementById('skeleton-loader');

    // GitHub API Configuration & Caching
    const GITHUB_USERNAME = document.getElementById('github-username')?.value?.trim() || 'Schengii';
    const CACHE_KEY = 'github_projects_cache';
    const CACHE_TIME_KEY = 'github_projects_cache_time';
    const CACHE_DURATION = 3600000; // 1 hour in milliseconds
    const SORT_KEY = 'portfolio_sort_order';
    const DEFAULT_SORT_ORDER = 'desc';

    // State for filtering and pagination
    let allProjects = [];
    let customProjects = [];
    let currentPage = 1;
    const projectsPerPage = 6;
    let currentSearchTerm = '';
    let currentCategory = 'all';

    // Load and render existing custom projects from LocalStorage
    const persistedSort = localStorage.getItem(SORT_KEY) || DEFAULT_SORT_ORDER;
    const sortSelect = document.getElementById('sort-select');
    const searchInput = document.getElementById('portfolio-searchbar');
    const filterButtons = document.querySelectorAll('.portfolio-filters .btn-filter');
    const noResultsContainer = document.getElementById('no-results-container');
    const paginationContainer = document.getElementById('pagination-container');

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
            currentPage = 1; // Reset to first page on new search
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

    try {
        if (typeof StorageManager !== 'undefined') {
            customProjects = JSON.parse(StorageManager.getItem('portfolio_custom_projects', '[]')) || [];
            const stored = JSON.parse(StorageManager.getItem('portfolio_custom_projects', '[]')) || [];
            customProjects = stored.map(p => ({ ...p, isCustom: true }));
        } else {
            customProjects = JSON.parse(localStorage.getItem('portfolio_custom_projects') || '[]');
            const stored = JSON.parse(localStorage.getItem('portfolio_custom_projects') || '[]');
            customProjects = stored.map(p => ({ ...p, isCustom: true }));
        }
    } catch (e) {
        console.warn('Failed to parse custom projects:', e);
        customProjects = [];
    }

    // Load dynamic projects (projects.json + GitHub API)
    // Note: only called once here; removed duplicate call at line ~677

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
    
            // 1. Process and enrich static projects from projects.json
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
    
            // 2. Add new, unprocessed repos from GitHub
            const newGithubProjects = [];
            githubRepos.forEach(repo => {
                const repoNameLower = repo.name.toLowerCase();
                if (repo.fork || repoNameLower === 'umschulung-fiae' || processedRepoNames.has(repoNameLower)) {
                    return; // Skip forks, the portfolio repo itself, and already processed repos
                }
    
                let category = 'web';
                const topics = repo.topics || [];
                if (topics.some(t => ['game', 'games', 'godot', 'unity'].includes(t.toLowerCase()))) {
                    category = 'games';
                } else if (topics.some(t => ['ai', 'artificial-intelligence', 'machine-learning', 'data'].includes(t.toLowerCase()))) {
                    category = 'ai';
                }
    
                const cleanTitle = repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    
                newGithubProjects.push({
                    repoName: repo.name,
                    titleDe: cleanTitle,
                    titleEn: cleanTitle,
                    tags: topics.length > 0 ? topics.slice(0, 5) : (repo.language ? [repo.language] : ['GitHub']),
                    image: repo.owner?.avatar_url || 'assets/images/default_project.png',
                    link: repo.homepage && repo.homepage.trim() !== '' ? repo.homepage : repo.html_url,
                    githubUrl: repo.html_url,
                    descDe: repo.description || 'Keine Beschreibung auf GitHub hinterlegt.',
                    descEn: repo.description || 'No description provided on GitHub.',
                    category: category,
                    stars: repo.stargazers_count || 0,
                    updatedAt: repo.updated_at
                });
            });
    
            // Filter out folder projects that are already covered by enrichedStaticProjects
            // Also filter out folder projects with no description (they're empty/placeholder entries)
            const enrichedRepoNames = new Set(enrichedStaticProjects.map(p => (p.titleDe || '').toLowerCase()));
            const filteredFolderProjects = folderProjects.filter(fp => {
                const fpTitle = (fp.titleDe || '').toLowerCase();
                const isDuplicate = enrichedRepoNames.has(fpTitle);
                const hasDescription = fp.descDe && fp.descDe.trim() !== '';
                return !isDuplicate && hasDescription;
            });

            // Store all fetched projects
            allProjects = [...enrichedStaticProjects, ...filteredFolderProjects, ...newGithubProjects, ...customProjects];
    
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
        if (!dynamicContainer || !customProjectsContainer) return;

        // 1. Filter
        const filteredProjects = allProjects.filter(proj => {
            const matchesCategory = currentCategory === 'all' || (proj.category && proj.category.includes(currentCategory)) || (proj.language && proj.language.toLowerCase() === currentCategory);
            
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
            customProjectsContainer.innerHTML = '';
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
        dynamicContainer.innerHTML = paginatedProjects
            .filter(p => !customProjects.some(cp => cp.titleDe === p.titleDe)) // Exclude custom projects from dynamic render
            .map(proj => generateDynamicCardHTML(proj)).join('\n');

        customProjectsContainer.innerHTML = paginatedProjects
            .filter(p => customProjects.some(cp => cp.titleDe === p.titleDe)) // Only render custom projects for this page
            .map(proj => {
                const originalIndex = customProjects.findIndex(cp => cp.titleDe === proj.titleDe);
                return generateCardHTML(proj, false, originalIndex);
            })
            .join('\n');

        renderPagination(sorted.length);
        attachCardListeners();
        attachAdminListeners(); // Re-attach delete/edit listeners

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
            pageBtn.className = 'btn-pagination';
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

    // Note: Card click-to-open-modal is handled by modal.js to avoid duplicate listeners
    function attachCardListeners() {
        // Modal.js handles project card clicks via event delegation
        // This function is kept for compatibility but does nothing active
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
        let editBtnHTML = '';
        if (!isPreview && index !== null) {
            editBtnHTML = `
            <button class="btn-edit-project" data-index="${index}" title="Projekt bearbeiten" aria-label="Projekt bearbeiten" style="position: absolute; top: 10px; right: 45px; z-index: 10; background: #f59e0b; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                <i class="fa fa-pencil" aria-hidden="true"></i>
            </button>`;
        }

        if (!isPreview && index !== null) {
            deleteBtnHTML = `
            <button class="btn-delete-project" data-index="${index}" title="Projekt löschen" aria-label="Projekt löschen">
                <i class="fa fa-trash" aria-hidden="true"></i>
            </button>`;
        }

        return `
<article class="card fade-in visible project-card" style="position: relative;" data-title-de="${project.titleDe}" data-title-en="${project.titleEn}" data-desc-de="${project.descDe}" data-desc-en="${project.descEn}" data-image="${project.image || ''}" data-link="${project.link || ''}" data-github="" data-tags="${encodeURIComponent(JSON.stringify(project.tags))}">
    ${editBtnHTML}
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

    // Form submit to save custom project
    if (projectForm) {
        projectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const project = { ...getFormValues(), isCustom: true };
            const editIndex = projectForm.dataset.editIndex;

            if (editIndex !== undefined && editIndex !== null) {
                // Update mode
                customProjects[parseInt(editIndex)] = project;
                delete projectForm.dataset.editIndex; // Reset mode
                projectForm.querySelector('button[type="submit"]').innerHTML = '<span lang="de">Projekt erstellen</span><span lang="en">Create Project</span>';
            } else {
                // Create mode
                customProjects.push(project);
            }
            
            const projectsToStore = customProjects.map(({ isCustom, ...rest }) => rest);
            if (typeof StorageManager !== 'undefined') {
                StorageManager.setItem('portfolio_custom_projects', JSON.stringify(customProjects));
            } else {
                localStorage.setItem('portfolio_custom_projects', JSON.stringify(customProjects));
            }
            
            renderCustomProjects();
            
            // Show Export section
            if (exportSection && htmlExportCode && editIndex === undefined) {
                const rawHTML = generateCardHTML(project, true).trim();
                htmlExportCode.textContent = rawHTML;
                exportSection.style.display = 'block';
            } else if (exportSection) {
                exportSection.style.display = 'none';
            }
            
            // Reset form
            projectForm.reset();
            updateLivePreview();
            if (exportSection) exportSection.style.display = 'none';

            // Re-trigger language for button text
            const activeLang = document.documentElement.getAttribute('lang') || 'de';
            document.dispatchEvent(new CustomEvent('langchange', { detail: activeLang }));
        });
    }

    // Render Saved Custom Projects
    function renderCustomProjects() {
        if (!customProjectsContainer) return;
        customProjectsContainer.innerHTML = '';
        
        // This function is now mostly for initial setup and attaching listeners.
        // The main rendering is handled by renderAllProjects.
        attachAdminListeners();
    }

    function attachAdminListeners() {
        customProjects.forEach((proj, idx) => {
            // Listeners are attached based on the full customProjects array, not the paginated view
        });

        // Add delete listeners
        const deleteButtons = document.querySelectorAll('#custom-projects-container .btn-delete-project');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
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
                    // Re-build allProjects and re-render
                    const projectToDelete = customProjects[idx];
                    allProjects = allProjects.filter(p => p.titleDe !== projectToDelete.titleDe);
                    renderAllProjects();
                    if (exportSection) exportSection.style.display = 'none';
                }
            });
        });

        // Add edit listeners
        const editButtons = document.querySelectorAll('#custom-projects-container .btn-edit-project');
        editButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.getAttribute('data-index'));
                const projectToEdit = customProjects[idx];
                
                if (inputTitleDe) inputTitleDe.value = projectToEdit.titleDe;
                if (inputTitleEn) inputTitleEn.value = projectToEdit.titleEn;
                if (inputTags) inputTags.value = projectToEdit.tags.join(', ');
                if (inputImage) inputImage.value = projectToEdit.image;
                if (inputDescDe) inputDescDe.value = projectToEdit.descDe;
                if (inputDescEn) inputDescEn.value = projectToEdit.descEn;
                if (inputLink) inputLink.value = projectToEdit.link;
                
                if (adminFormContainer.classList.contains('collapsed')) {
                    toggleAdminBtn.click();
                }
                
                projectForm.dataset.editIndex = idx;
                projectForm.querySelector('button[type="submit"]').innerHTML = '<span lang="de">Projekt aktualisieren</span><span lang="en">Update Project</span>';
                
                inputTitleDe.focus();
                const activeLang = document.documentElement.getAttribute('lang') || 'de';
                document.dispatchEvent(new CustomEvent('langchange', { detail: activeLang }));
            });
        });

        // Trigger language switcher alignment
        const activeLang = document.documentElement.getAttribute('lang') || 'de';
        document.dispatchEvent(new CustomEvent('langchange', { detail: activeLang }));
    }

    // Initial Load (called once at top of DOMContentLoaded)
    loadAndRenderProjects();

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
     // Dark mode button – now uses #theme-toggle id and handles theme switching.
function initDarkModeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;
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
initDarkModeToggle();

    // Listen to global language change to keep previews in sync
    document.addEventListener('langchange', () => {
        updateLivePreview();
    });

    // Back-to-Top Button
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }, { passive: true });
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('project-modal');
            if (modal && modal.classList.contains('show')) {
                modal.classList.remove('show');
                modal.classList.add('hidden');
            }
        }
    });

    // Hire-Me Form
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

    // Testimonial Carousel
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
        // Auto-rotate every 6 seconds
        let currentTestimonial = 0;
        setInterval(() => {
            currentTestimonial = (currentTestimonial + 1) % testimonialItems.length;
            testimonialItems.forEach(item => item.classList.remove('active'));
            testimonialDots.forEach(d => d.classList.remove('active'));
            testimonialItems[currentTestimonial].classList.add('active');
            testimonialDots[currentTestimonial].classList.add('active');
        }, 6000);
    }

    // Skill bar animation on scroll — uses .animated class + --skill-level CSS var
    const skillFills = document.querySelectorAll('.skill-fill');
    if (skillFills.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        skillFills.forEach(fill => observer.observe(fill));
    }

    // Radar Chart (SVG-based)
    const radarContainer = document.getElementById('skill-radar-container');
    if (radarContainer) {
        const skills = [
            { label: 'HTML/CSS', value: 85 },
            { label: 'JavaScript', value: 75 },
            { label: 'Java', value: 70 },
            { label: 'SQL', value: 65 },
            { label: 'Git', value: 80 },
            { label: 'React', value: 60 }
        ];
        const size = 200;
        const center = size / 2;
        const radius = 80;
        const angleStep = (2 * Math.PI) / skills.length;

        const points = skills.map((s, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const r = (s.value / 100) * radius;
            return {
                x: center + r * Math.cos(angle),
                y: center + r * Math.sin(angle),
                lx: center + (radius + 20) * Math.cos(angle),
                ly: center + (radius + 20) * Math.sin(angle),
                label: s.label
            };
        });

        const gridLines = [0.25, 0.5, 0.75, 1].map(pct => {
            const gridPts = skills.map((_, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const r = pct * radius;
                return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            }).join(' ');
            return `<polygon points="${gridPts}" fill="none" stroke="var(--border)" stroke-width="1"/>`;
        }).join('');

        const spokeLines = skills.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            return `<line x1="${center}" y1="${center}" x2="${center + radius * Math.cos(angle)}" y2="${center + radius * Math.sin(angle)}" stroke="var(--border)" stroke-width="1"/>`;
        }).join('');

        const dataPoints = points.map(p => `${p.x},${p.y}`).join(' ');
        const labels = points.map(p => {
            const anchor = p.lx > center + 5 ? 'start' : p.lx < center - 5 ? 'end' : 'middle';
            return `<text x="${p.lx}" y="${p.ly + 4}" text-anchor="${anchor}" font-size="9" fill="var(--text-secondary)" font-family="var(--font-sans)">${p.label}</text>`;
        }).join('');

        radarContainer.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            ${gridLines}
            ${spokeLines}
            <polygon points="${dataPoints}" fill="rgba(37,99,235,0.25)" stroke="var(--primary)" stroke-width="2"/>
            ${labels}
        </svg>`;
    }
});
