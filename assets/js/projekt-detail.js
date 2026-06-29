document.addEventListener('DOMContentLoaded', () => {
    const detailContainer = document.getElementById('project-detail-container');
    const breadcrumbCurrent = document.getElementById('breadcrumb-current-project');
    const relatedSection = document.getElementById('related-projects-section');
    const relatedContainer = document.getElementById('related-projects-container');
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
                            enriched.tags = [...new Set([...(enriched.tags || []), ...(ghRepo.topics || [])])];
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
                renderRelatedProjects(project, allProjects);
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

        let mediaHTML = '';

        // 1. Render PPT Downloads
        if (project.downloadPpts && project.downloadPpts.length > 0) {
            mediaHTML += `
                <hr style="margin: 2rem 0; border: 0; border-top: 2px solid var(--border);">
                <h3 lang="de"><i class="fa-solid fa-file-powerpoint" style="color: #d24726;"></i> Projekt-Präsentationen</h3>
                <h3 lang="en"><i class="fa-solid fa-file-powerpoint" style="color: #d24726;"></i> Project Presentations</h3>
                <div class="download-card-container">
            `;
            project.downloadPpts.forEach(ppt => {
                const pptTitle = lang === 'de' ? ppt.titleDe : ppt.titleEn;
                mediaHTML += `
                    <a href="${ppt.url}" class="ppt-download-card" download aria-label="Download ${pptTitle}">
                        <div class="ppt-icon-wrapper">
                            <i class="fa-solid fa-file-powerpoint" aria-hidden="true"></i>
                        </div>
                        <div class="ppt-info">
                            <div class="ppt-title">
                                <span lang="de">${ppt.titleDe}</span>
                                <span lang="en">${ppt.titleEn}</span>
                            </div>
                            <div class="ppt-meta">
                                <span>PowerPoint (.pptx)</span>
                                <span>Größe / Size: ${ppt.size}</span>
                            </div>
                        </div>
                        <div class="ppt-btn">
                            <i class="fa-solid fa-download" aria-hidden="true"></i>
                            <span lang="de">Herunterladen</span>
                            <span lang="en">Download</span>
                        </div>
                    </a>
                `;
            });
            mediaHTML += `</div>`;
        }

        // 2. Render Video Playlist Player
        if (project.videoPlaylist && project.videoPlaylist.length > 0) {
            mediaHTML += `
                <hr style="margin: 2rem 0; border: 0; border-top: 2px solid var(--border);">
                <h3 lang="de"><i class="fa-solid fa-video"></i> Video-Demonstrationen</h3>
                <h3 lang="en"><i class="fa-solid fa-video"></i> Video Demonstrations</h3>
                <div class="video-gallery-container" id="project-video-gallery">
                    <div class="video-player-pane">
                        <div class="video-wrapper">
                            <video id="project-video-player" controls preload="metadata"></video>
                        </div>
                        <div class="video-meta-info">
                            <h4 class="video-current-title" id="project-video-current-title"></h4>
                            <p class="video-current-desc" id="project-video-current-desc"></p>
                        </div>
                    </div>
                    <div class="video-playlist-pane">
                        <h4 class="playlist-header">
                            <span lang="de"><i class="fa-solid fa-circle-play" aria-hidden="true"></i> Video-Auswahl</span>
                            <span lang="en"><i class="fa-solid fa-circle-play" aria-hidden="true"></i> Video Playlist</span>
                        </h4>
                        <div class="playlist-tracks" id="project-video-tracks" role="tablist"></div>
                        <div class="dsgvo-note-card">
                            <i class="fa-solid fa-shield-halved" aria-hidden="true"></i>
                            <div>
                                <strong lang="de">DSGVO-konform:</strong>
                                <span lang="de">Die Videos werden lokal vom Server abgespielt. Keine Tracking-Cookies.</span>
                                <strong lang="en">GDPR Compliant:</strong>
                                <span lang="en">Videos are streamed locally. No tracking cookies are used.</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

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

            ${mediaHTML}

            ${buttonsHTML}
        `;

        // Initialize video player if present
        if (project.videoPlaylist && project.videoPlaylist.length > 0) {
            initProjectVideoPlayer(project);
        }

        // Ensure correct language is displayed
        document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
    }

    function initProjectVideoPlayer(project) {
        const videoEl = document.getElementById('project-video-player');
        const tracksContainer = document.getElementById('project-video-tracks');
        const currentTitleEl = document.getElementById('project-video-current-title');
        const currentDescEl = document.getElementById('project-video-current-desc');

        if (!videoEl || !tracksContainer || !currentTitleEl || !currentDescEl) return;

        let activeIndex = 0;

        function updateVideoUI(shouldPlay = false) {
            const lang = document.documentElement.getAttribute('lang') || 'de';
            const videoItem = project.videoPlaylist[activeIndex];

            const wasPaused = videoEl.paused;
            videoEl.src = videoItem.url;
            videoEl.load();

            if (shouldPlay && !wasPaused) {
                videoEl.play().catch(err => console.log('Autoplay blocked:', err));
            }

            currentTitleEl.textContent = lang === 'de' ? videoItem.titleDe : videoItem.titleEn;
            currentDescEl.textContent = lang === 'de' ? videoItem.descDe : videoItem.descEn;

            const buttons = tracksContainer.querySelectorAll('.playlist-track-btn');
            buttons.forEach((btn, index) => {
                if (index === activeIndex) {
                    btn.classList.add('active');
                    btn.setAttribute('aria-current', 'true');
                } else {
                    btn.classList.remove('active');
                    btn.removeAttribute('aria-current');
                }
            });
        }

        tracksContainer.innerHTML = '';
        project.videoPlaylist.forEach((videoItem, index) => {
            const btn = document.createElement('button');
            btn.className = 'playlist-track-btn';
            btn.setAttribute('aria-label', `Play video: ${videoItem.titleDe}`);
            
            btn.innerHTML = `
                <div class="track-icon">
                    <i class="fa fa-play-circle" aria-hidden="true"></i>
                </div>
                <div class="track-title-wrapper">
                    <div class="track-title">
                        <span lang="de">${videoItem.titleDe}</span>
                        <span lang="en">${videoItem.titleEn}</span>
                    </div>
                    <div class="track-duration">${videoItem.duration} Min</div>
                </div>
            `;

            btn.addEventListener('click', () => {
                activeIndex = index;
                updateVideoUI(true);
            });

            tracksContainer.appendChild(btn);
        });

        // Listen for language changes
        const langChangeHandler = () => updateVideoUI(false);
        document.addEventListener('langchange', langChangeHandler);

        // Clean up listeners if project changes
        videoEl.addEventListener('destroy', () => {
            document.removeEventListener('langchange', langChangeHandler);
        });

        updateVideoUI(false);
    }

    function renderRelatedProjects(currentProject, allProjects) {
        if (!relatedSection || !relatedContainer) return;

        const currentTags = new Set((currentProject.tags || []).map(t => t.toLowerCase()));
        const currentId = currentProject.repoName || currentProject.titleDe;

        const related = allProjects
            .filter(p => (p.repoName || p.titleDe) !== currentId) // Exclude self
            .map(p => {
                const otherTags = new Set((p.tags || []).map(t => t.toLowerCase()));
                const commonTags = new Set([...currentTags].filter(tag => otherTags.has(tag)));
                return { project: p, score: commonTags.size };
            })
            .filter(item => item.score > 0) // Only include projects with at least one common tag
            .sort((a, b) => b.score - a.score) // Sort by most common tags
            .slice(0, 3); // Take top 3

        if (related.length > 0) {
            relatedContainer.innerHTML = related.map(item => generateRelatedCard(item.project)).join('');
            relatedSection.style.display = 'block';
            const lang = document.documentElement.getAttribute('lang') || 'de';
            document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
        }
    }

    function generateRelatedCard(project) {
        const url = project.repoName 
            ? `projekt-detail.html?repo=${encodeURIComponent(project.repoName)}`
            : `projekt-detail.html?title=${encodeURIComponent(project.titleDe)}`;

        return `
            <a href="${url}" class="related-project-card">
                ${project.image ? `<img src="${project.image}" alt="" loading="lazy">` : ''}
                <div class="related-project-info">
                    <h4 lang="de">${project.titleDe}</h4>
                    <h4 lang="en">${project.titleEn}</h4>
                    <p lang="de">${(project.tags || []).slice(0, 3).join(', ')}</p>
                    <p lang="en">${(project.tags || []).slice(0, 3).join(', ')}</p>
                </div>
            </a>
        `;
    }

    loadAndDisplayProject();
});