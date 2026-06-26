document.addEventListener('DOMContentLoaded', () => {
    const detailContainer = document.getElementById('project-detail-container');
    const breadcrumbCurrent = document.getElementById('breadcrumb-current-project');
    const GITHUB_USERNAME = 'Schengii';
    const CACHE_KEY = 'github_projects_cache';
    const CACHE_TIME_KEY = 'github_projects_cache_time';
    const CACHE_DURATION = 3600000; // 1 hour

    async function fetchGitHubRepos() {
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
        if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime) < CACHE_DURATION)) {
            return JSON.parse(cachedData);
        }
        try {
            const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`);
            if (!response.ok) throw new Error('GitHub API request failed');
            const repos = await response.json();
            localStorage.setItem(CACHE_KEY, JSON.stringify(repos));
            localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
            return repos;
        } catch (e) {
            console.warn('Could not fetch from GitHub, using cache if available.', e);
            return cachedData ? JSON.parse(cachedData) : [];
        }
    }

    async function loadAndDisplayProject() {
        if (!detailContainer) return;

        detailContainer.innerHTML = `<p>Lade Projektdaten...</p>`;

        try {
            // Get project identifier from URL
            const urlParams = new URLSearchParams(window.location.search);
            const repoIdentifier = urlParams.get('repo');
            const titleIdentifier = urlParams.get('title');

            if (!repoIdentifier && !titleIdentifier) {
                throw new Error('Kein Projekt angegeben.');
            }

            // Fetch all project data sources
            const [staticProjects, githubRepos, customProjects] = await Promise.all([
                fetch('./assets/data/projects.json').then(res => res.ok ? res.json() : []),
                fetchGitHubRepos(),
                JSON.parse(localStorage.getItem('portfolio_custom_projects') || '[]')
            ]);

            const githubRepoMap = new Map(githubRepos.map(repo => [repo.name.toLowerCase(), repo]));

            // Combine all projects into one list
            let allProjects = [
                ...staticProjects.map(proj => {
                    const enriched = { ...proj };
                    if (enriched.repoName) {
                        const ghRepo = githubRepoMap.get(enriched.repoName.toLowerCase());
                        if (ghRepo) {
                            enriched.stars = ghRepo.stargazers_count || 0;
                            enriched.githubUrl = ghRepo.html_url;
                            enriched.updatedAt = ghRepo.updated_at;
                            if (ghRepo.homepage && ghRepo.homepage.trim() !== '') {
                                enriched.link = ghRepo.homepage;
                            }
                        }
                    }
                    return enriched;
                }),
                ...customProjects
            ];

            // Find the requested project
            const project = allProjects.find(p => 
                (repoIdentifier && p.repoName === repoIdentifier) || 
                (titleIdentifier && p.titleDe === titleIdentifier)
            );

            if (project) {
                renderProjectDetails(project);
            } else {
                throw new Error('Projekt nicht gefunden.');
            }

        } catch (error) {
            detailContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fa fa-exclamation-triangle fa-3x" style="color: var(--danger);"></i>
                    <h3 lang="de">Fehler</h3>
                    <h3 lang="en">Error</h3>
                    <p lang="de">Das angeforderte Projekt konnte nicht gefunden werden.</p>
                    <p lang="en">The requested project could not be found.</p>
                    <a href="portfolio.html" class="btn-primary">Zurück zum Portfolio</a>
                </div>
            `;
            console.error('Error loading project details:', error);
        }
    }

    function renderProjectDetails(project) {
        const lang = document.documentElement.getAttribute('lang') || 'de';
        const title = lang === 'de' ? project.titleDe : project.titleEn;
        const description = lang === 'de' ? project.descDe : project.descEn;

        document.title = `${title} - Projektdetail`;
        if (breadcrumbCurrent) {
            breadcrumbCurrent.textContent = title;
        }

        const tagsHTML = (project.tags || []).map(tag => `<span class="tech-tag">${tag}</span>`).join(' ');

        let buttonsHTML = '<div style="margin-top: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap;">';
        if (project.link) {
            buttonsHTML += `<a href="${project.link}" class="btn-primary" target="_blank" rel="noopener"><i class="fa fa-external-link"></i> <span lang="de">Live ansehen</span><span lang="en">View Live</span></a>`;
        }
        if (project.githubUrl) {
            buttonsHTML += `<a href="${project.githubUrl}" class="btn-secondary" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> <span lang="de">Quellcode</span><span lang="en">Source Code</span></a>`;
        }
        buttonsHTML += '</div>';

        detailContainer.innerHTML = `
            ${project.image ? `<img src="${project.image}" alt="${title}" style="width: 100%; border-radius: var(--radius-lg); margin-bottom: 1.5rem; border: 1px solid var(--border);">` : ''}
            
            <h2 lang="de">${project.titleDe}</h2>
            <h2 lang="en">${project.titleEn}</h2>

            ${project.stars > 0 ? `<p style="color: var(--text-muted);"><i class="fa fa-star" style="color: #eab308;"></i> ${project.stars} Stars auf GitHub</p>` : ''}

            <div class="tech-tags" style="margin: 1rem 0;">
                ${tagsHTML}
            </div>

            <div class="project-description">
                <p lang="de">${description}</p>
                <p lang="en">${description}</p>
            </div>

            ${buttonsHTML}
        `;

        // Ensure correct language is displayed
        document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
    }

    loadAndDisplayProject();
});