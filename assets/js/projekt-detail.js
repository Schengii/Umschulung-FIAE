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
                fetch((window.resolveAssetPath || (p => p))('assets/data/projects.json')).then(res => res.ok ? res.json() : []),
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
            buttonsHTML += `
                <button id="start-live-demo" class="btn-primary"><i class="fa fa-play-circle"></i> <span lang="de">Live-Demo starten 🚀</span><span lang="en">Start Live Demo 🚀</span></button>
                <a href="${project.link}" class="btn-secondary" target="_blank" rel="noopener"><i class="fa fa-external-link"></i> <span lang="de">Im neuen Tab öffnen</span><span lang="en">Open in New Tab</span></a>
            `;
        } else if (project.githubUrl) {
            buttonsHTML += `<a href="${project.githubUrl}" class="btn-primary" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> <span lang="de">Quellcode</span><span lang="en">Source Code</span></a>`;
        }
        buttonsHTML += '</div>';

        let mediaHTML = '';

        // 1. Render IHK Presentation Stepper (EcoChef special)
        if (project.ihkPresentation && project.ihkPresentation.length > 0) {
            mediaHTML += `
                <hr style="margin: 2rem 0; border: 0; border-top: 2px solid var(--border);">
                <h3 lang="de"><i class="fa-solid fa-person-chalkboard"></i> IHK-Präsentations-Bühne</h3>
                <h3 lang="en"><i class="fa-solid fa-person-chalkboard"></i> IHK Presentation Stage</h3>
                <div class="ihk-stepper-widget" id="ihk-stepper">
                    <div class="stepper-progress-bar">
                        <div class="stepper-progress-fill" id="stepper-progress-fill"></div>
                    </div>
                    <div class="stepper-slides-container" id="stepper-slides-container">
                        <!-- Slide contents injected by JS -->
                    </div>
                    <div class="stepper-controls">
                        <button class="btn-secondary" id="stepper-prev-btn"><i class="fa fa-chevron-left"></i> <span lang="de">Zurück</span><span lang="en">Back</span></button>
                        <span class="stepper-indicator" id="stepper-indicator">Schritt 1</span>
                        <button class="btn-primary" id="stepper-next-btn"><span lang="de">Weiter</span><span lang="en">Next</span> <i class="fa fa-chevron-right"></i></button>
                    </div>
                </div>
            `;
        }

        // 2. Render PPT Downloads
        if (project.downloadPpts && project.downloadPpts.length > 0) {
            mediaHTML += `
                <hr style="margin: 2rem 0; border: 0; border-top: 2px solid var(--border);">
                <h3 lang="de"><i class="fa-solid fa-file-powerpoint" style="color: #d24726;"></i> Projekt-Präsentationen</h3>
                <h3 lang="en"><i class="fa-solid fa-file-powerpoint" style="color: #d24726;"></i> Project Presentations</h3>
                <div class="download-card-container">
            `;
            project.downloadPpts.forEach(ppt => {
                const pptTitle = lang === 'de' ? ppt.titleDe : ppt.titleEn;
                const pptUrl = (window.resolveAssetPath || (p => p))(ppt.url);
                mediaHTML += `
                    <a href="${pptUrl}" class="ppt-download-card" download aria-label="Download ${pptTitle}">
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

        // 3. Render Video Playlist Player
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

        // 4. Render Code Explorer
        if (project.codeFiles && project.codeFiles.length > 0) {
            mediaHTML += `
                <hr style="margin: 2rem 0; border: 0; border-top: 2px solid var(--border);">
                <h3 lang="de"><i class="fa-solid fa-folder-open"></i> Quellcode-Explorer</h3>
                <h3 lang="en"><i class="fa-solid fa-folder-open"></i> Source Code Explorer</h3>
                <div class="code-explorer-widget">
                    <div class="explorer-tree-pane" id="explorer-tree"></div>
                    <div class="explorer-code-pane">
                        <div class="code-pane-header">
                            <span class="code-file-name" id="explorer-active-file"></span>
                            <button class="btn-copy-code" id="explorer-copy-btn"><i class="fa-regular fa-copy"></i> Copy</button>
                        </div>
                        <pre class="line-numbers"><code id="explorer-code-view" class="language-javascript">// Klicke links auf eine Datei, um den Code anzuzeigen</code></pre>
                    </div>
                </div>
            `;
        }

        // Build architecture badges
        let archBadgesHTML = '';
        if (project.architectureBadges && Array.isArray(project.architectureBadges) && project.architectureBadges.length > 0) {
            archBadgesHTML = `
                <div class="architecture-badges-container" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 0.75rem 0;">
                    ${project.architectureBadges.map(b => `
                        <span class="badge" style="background: ${b.color}15; color: ${b.color}; border: 1px solid ${b.color}40; font-size: 0.78rem; font-weight: 700; padding: 4px 10px; border-radius: 6px;">
                            <i class="fa-solid fa-layer-group" style="margin-right: 5px;"></i>${b.name}
                        </span>
                    `).join('')}
                </div>
            `;
        }

        // Build Key Learnings & Challenges section
        let keyLearningsHTML = '';
        if (project.keyLearnings) {
            const kl = project.keyLearnings;
            keyLearningsHTML = `
                <div class="card key-learnings-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-left: 4px solid var(--primary); padding: 1.25rem 1.5rem; border-radius: var(--radius-md); margin: 1.5rem 0;">
                    <h3 style="margin: 0 0 0.75rem 0; font-size: 1.05rem; color: var(--primary); display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-lightbulb"></i>
                        <span lang="de">Key Learnings &amp; Architektur-Lösung</span>
                        <span lang="en">Key Learnings &amp; Architecture Solution</span>
                    </h3>
                    <div style="font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary);">
                        <div style="margin-bottom: 0.75rem;">
                            <strong style="color: var(--text-primary); display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                                <i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b;"></i>
                                <span lang="de">Technische Herausforderung:</span>
                                <span lang="en">Technical Challenge:</span>
                            </strong>
                            <p style="margin: 0;" lang="de">${kl.challengeDe}</p>
                            <p style="margin: 0;" lang="en">${kl.challengeEn}</p>
                        </div>
                        <div style="margin-bottom: 0.75rem;">
                            <strong style="color: var(--text-primary); display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                                <i class="fa-solid fa-circle-check" style="color: #10b981;"></i>
                                <span lang="de">Architektur-Lösung:</span>
                                <span lang="en">Architecture Solution:</span>
                            </strong>
                            <p style="margin: 0;" lang="de">${kl.solutionDe}</p>
                            <p style="margin: 0;" lang="en">${kl.solutionEn}</p>
                        </div>
                        ${kl.architectureHighlightsDe && kl.architectureHighlightsDe.length > 0 ? `
                            <div>
                                <strong style="color: var(--text-primary);"><span lang="de">Architektur-Highlights:</span><span lang="en">Architecture Highlights:</span></strong>
                                <ul style="margin: 0.35rem 0 0 1.2rem; padding: 0;">
                                    ${kl.architectureHighlightsDe.map((hDe, i) => `
                                        <li>
                                            <span lang="de">${hDe}</span>
                                            <span lang="en">${(kl.architectureHighlightsEn && kl.architectureHighlightsEn[i]) || hDe}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        const projectImgResolved = project.image ? (window.resolveAssetPath || (p => p))(project.image) : '';

        detailContainer.innerHTML = `
            ${projectImgResolved ? `<img src="${projectImgResolved}" alt="${title}" style="width: 100%; border-radius: var(--radius-lg); margin-bottom: 1.5rem; border: 1px solid var(--border);" onerror="this.onerror=null;this.src=window.PLACEHOLDER_IMAGE;this.style.objectFit='contain';this.style.background='var(--bg-page)';this.style.padding='2rem';">` : ''}
            
            <h2 lang="de">${project.titleDe}</h2>
            <h2 lang="en">${project.titleEn}</h2>

            ${project.stars > 0 ? `<p style="color: var(--text-muted);"><i class="fa fa-star" style="color: #eab308;"></i> ${project.stars} Stars auf GitHub</p>` : ''}

            ${archBadgesHTML}

            <div class="tech-tags" style="margin: 1rem 0;">
                ${tagsHTML}
            </div>

            <div class="project-description">
                <p lang="de">${description}</p>
                <p lang="en">${description}</p>
            </div>

            ${keyLearningsHTML}

            ${mediaHTML}

            ${buttonsHTML}
        `;

        // Initialize video player if present
        if (project.videoPlaylist && project.videoPlaylist.length > 0) {
            initProjectVideoPlayer(project);
        }

        // Initialize IHK Presentation Stepper if present
        if (project.ihkPresentation && project.ihkPresentation.length > 0) {
            initIhkStepper(project);
        }

        // Initialize Code Explorer if present
        if (project.codeFiles && project.codeFiles.length > 0) {
            initCodeExplorer(project);
        }

        // Initialize Live Demo Modal if present
        if (project.link) {
            initLiveDemoModal(project);
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
            videoEl.src = (window.resolveAssetPath || (p => p))(videoItem.url);
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

        const imgResolved = project.image ? (window.resolveAssetPath || (p => p))(project.image) : '';

        return `
            <a href="${url}" class="related-project-card">
                ${imgResolved ? `<img src="${imgResolved}" alt="" loading="lazy" onerror="this.onerror=null;this.src=window.PLACEHOLDER_IMAGE;this.classList.add('img-fallback');">` : ''}
                <div class="related-project-info">
                    <h4 lang="de">${project.titleDe}</h4>
                    <h4 lang="en">${project.titleEn}</h4>
                    <p lang="de">${(project.tags || []).slice(0, 3).join(', ')}</p>
                    <p lang="en">${(project.tags || []).slice(0, 3).join(', ')}</p>
                </div>
            </a>
        `;
    }

    function initIhkStepper(project) {
        const prevBtn = document.getElementById('stepper-prev-btn');
        const nextBtn = document.getElementById('stepper-next-btn');
        const indicator = document.getElementById('stepper-indicator');
        const progressFill = document.getElementById('stepper-progress-fill');
        const container = document.getElementById('stepper-slides-container');

        if (!prevBtn || !nextBtn || !indicator || !progressFill || !container) return;

        let currentSlide = 0;
        const slides = project.ihkPresentation;

        function renderSlide() {
            const lang = document.documentElement.getAttribute('lang') || 'de';
            const slideItem = slides[currentSlide];

            container.innerHTML = `
                <div class="stepper-slide active">
                    <h4>${lang === 'de' ? slideItem.titleDe : slideItem.titleEn}</h4>
                    <p style="margin-top: 1rem; line-height: 1.6; color: var(--text-secondary);">${lang === 'de' ? slideItem.descDe : slideItem.descEn}</p>
                </div>
            `;

            indicator.textContent = lang === 'de' 
                ? `Schritt ${currentSlide + 1} von ${slides.length}`
                : `Step ${currentSlide + 1} of ${slides.length}`;

            progressFill.style.width = `${((currentSlide + 1) / slides.length) * 100}%`;

            prevBtn.disabled = currentSlide === 0;
            nextBtn.disabled = currentSlide === slides.length - 1;
        }

        prevBtn.addEventListener('click', () => {
            if (currentSlide > 0) {
                currentSlide--;
                renderSlide();
            }
        });

        nextBtn.addEventListener('click', () => {
            if (currentSlide < slides.length - 1) {
                currentSlide++;
                renderSlide();
            }
        });

        document.addEventListener('langchange', renderSlide);
        renderSlide();
    }

    function initCodeExplorer(project) {
        const treeContainer = document.getElementById('explorer-tree');
        const activeFileEl = document.getElementById('explorer-active-file');
        const copyBtn = document.getElementById('explorer-copy-btn');

        if (!treeContainer || !activeFileEl) return;

        treeContainer.innerHTML = '';

        project.codeFiles.forEach((fileItem, index) => {
            const item = document.createElement('div');
            item.className = 'tree-item';

            let iconClass = 'fa-regular fa-file-code';
            if (fileItem.type === 'html') iconClass = 'fa-brands fa-html5';
            else if (fileItem.type === 'css') iconClass = 'fa-brands fa-css3-alt';
            else if (fileItem.type === 'typescript') iconClass = 'fa-solid fa-code';

            item.innerHTML = `
                <i class="${iconClass}"></i>
                <span>${fileItem.name}</span>
            `;

            item.addEventListener('click', () => {
                const active = treeContainer.querySelector('.tree-item.active');
                if (active) active.classList.remove('active');
                item.classList.add('active');

                activeFileEl.textContent = fileItem.name;
                loadCodeFile(fileItem.path, fileItem.type);
            });

            treeContainer.appendChild(item);

            if (index === 0) {
                item.click();
            }
        });

        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const codeView = document.getElementById('explorer-code-view');
                if (!codeView) return;
                navigator.clipboard.writeText(codeView.textContent).then(() => {
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fa fa-check"></i> Copied!';
                    setTimeout(() => copyBtn.innerHTML = originalText, 2000);
                });
            });
        }
    }

    async function loadCodeFile(filePath, fileType) {
        const codeView = document.getElementById('explorer-code-view');
        if (!codeView) return;

        codeView.textContent = '// Lade Code...';
        codeView.className = `language-${fileType}`;
        if (window.Prism) {
            Prism.highlightElement(codeView);
        }

        try {
            const resolvedPath = (window.resolveAssetPath || (p => p))(filePath);
            const response = await fetch(resolvedPath);
            if (!response.ok) throw new Error('Datei konnte nicht geladen werden.');
            const codeText = await response.text();
            codeView.textContent = codeText;
            codeView.className = `language-${fileType}`;
            if (window.Prism) {
                Prism.highlightElement(codeView);
            }
        } catch (e) {
            codeView.textContent = `// Fehler beim Laden: ${e.message}`;
        }
    }

    function initLiveDemoModal(project) {
        const startBtn = document.getElementById('start-live-demo');
        if (!startBtn) return;

        let modal = document.getElementById('live-demo-modal');
        if (!modal) {
            const modalHTML = `
                <div class="live-demo-modal" id="live-demo-modal" role="dialog" aria-modal="true" style="display: none;">
                    <div class="demo-modal-header">
                        <span class="demo-project-title" id="demo-project-title"></span>
                        <div class="demo-controls">
                            <button class="demo-btn-control" id="demo-reload-btn" title="Reload"><i class="fa-solid fa-rotate-right"></i></button>
                            <button class="demo-btn-control" id="demo-fullscreen-btn" title="Toggle Fullscreen"><i class="fa-solid fa-expand"></i></button>
                            <button class="demo-btn-control close-btn" id="demo-close-btn" title="Close"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                    </div>
                    <div class="demo-modal-body">
                        <iframe id="demo-iframe" src="" allow="geolocation; microphone; camera; midi"></iframe>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            modal = document.getElementById('live-demo-modal');
        }

        const iframe = document.getElementById('demo-iframe');
        const titleSpan = document.getElementById('demo-project-title');
        const closeBtn = document.getElementById('demo-close-btn');
        const reloadBtn = document.getElementById('demo-reload-btn');
        const fullscreenBtn = document.getElementById('demo-fullscreen-btn');

        startBtn.addEventListener('click', () => {
            const lang = document.documentElement.getAttribute('lang') || 'de';
            titleSpan.textContent = lang === 'de' ? project.titleDe : project.titleEn;
            iframe.src = (window.resolveAssetPath || (p => p))(project.link);
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            iframe.src = '';
            document.body.style.overflow = '';
        });

        reloadBtn.addEventListener('click', () => {
            iframe.contentWindow.location.reload();
        });

        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                modal.requestFullscreen().catch(err => {
                    console.warn(`Error attempting to enable full-screen mode: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
        });
    }

    loadAndDisplayProject();
});