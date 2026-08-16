/**
 * Project Side-by-Side Comparison Module
 * Allows users and recruiters to select 2 or 3 projects and see an immediate architectural diff.
 */

(function() {
    'use strict';

    let selectedProjects = [];
    const MAX_COMPARE = 3;

    function initProjectCompare() {
        if (!window.location.pathname.includes('portfolio.html')) return;

        // Create Drawer DOM
        const drawer = document.createElement('div');
        drawer.id = 'project-compare-drawer';
        drawer.className = 'compare-drawer';
        drawer.innerHTML = `
            <div class="compare-header">
                <h3 class="compare-title"><i class="fa-solid fa-code-compare"></i> <span lang="de">Projekt-Vergleichsmatrix</span><span lang="en">Project Comparison Matrix</span></h3>
                <button id="compare-drawer-close" class="btn-filter" style="border: none; background: none; font-size: 1.2rem; cursor: pointer;">&times;</button>
            </div>
            <div id="compare-content-grid" class="compare-content-grid"></div>
        `;
        document.body.appendChild(drawer);

        // Create Floating Trigger Bar
        const floatingBar = document.createElement('div');
        floatingBar.id = 'compare-floating-bar';
        floatingBar.className = 'compare-floating-bar hidden';
        floatingBar.innerHTML = `
            <i class="fa-solid fa-code-compare"></i>
            <span id="compare-count-text">0 Projekte vergleichen</span>
        `;
        document.body.appendChild(floatingBar);

        floatingBar.addEventListener('click', () => {
            drawer.classList.add('open');
            renderComparison();
        });

        drawer.querySelector('#compare-drawer-close').addEventListener('click', () => {
            drawer.classList.remove('open');
        });

        // Delegate click for project compare buttons inside cards
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-compare-select');
            if (!btn) return;
            e.stopPropagation();

            const repoName = btn.dataset.repo;
            const project = (window.projectsData || []).find(p => p.repoName === repoName || p.titleDe === repoName);
            if (!project) return;

            const existingIndex = selectedProjects.findIndex(p => (p.repoName || p.titleDe) === (project.repoName || project.titleDe));
            if (existingIndex >= 0) {
                selectedProjects.splice(existingIndex, 1);
                btn.classList.remove('active');
            } else {
                if (selectedProjects.length >= MAX_COMPARE) {
                    if (typeof showToast === 'function') {
                        showToast('Maximal 3 Projekte gleichzeitig vergleichbar.', 'warning');
                    }
                    return;
                }
                selectedProjects.push(project);
                btn.classList.add('active');
            }

            updateFloatingBar();
            if (drawer.classList.contains('open')) {
                renderComparison();
            }
        });
    }

    function updateFloatingBar() {
        const bar = document.getElementById('compare-floating-bar');
        const countText = document.getElementById('compare-count-text');
        if (!bar || !countText) return;

        const lang = document.documentElement.getAttribute('lang') || 'de';
        if (selectedProjects.length > 0) {
            bar.classList.remove('hidden');
            countText.textContent = lang === 'de' 
                ? `${selectedProjects.length} ${selectedProjects.length === 1 ? 'Projekt' : 'Projekte'} vergleichen` 
                : `Compare ${selectedProjects.length} ${selectedProjects.length === 1 ? 'Project' : 'Projects'}`;
        } else {
            bar.classList.add('hidden');
        }
    }

    function renderComparison() {
        const grid = document.getElementById('compare-content-grid');
        if (!grid) return;

        const lang = document.documentElement.getAttribute('lang') || 'de';
        if (selectedProjects.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-muted);">
                    <i class="fa-solid fa-code-compare fa-3x" style="margin-bottom: 0.5rem;"></i>
                    <p>Wähle mindestens 2 Projekte im Portfolio über den "Vergleichen"-Button aus.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = selectedProjects.map((p, idx) => {
            const title = lang === 'de' ? p.titleDe : p.titleEn;
            const badges = (p.architectureBadges || []).map(b => `<span class="badge" style="background: ${b.color}15; color: ${b.color}; font-size: 0.72rem; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${b.name}</span>`).join(' ');
            const kl = p.keyLearnings;

            return `
                <div class="compare-column">
                    <button class="compare-column-close" data-index="${idx}" title="Entfernen">&times;</button>
                    <h4 style="margin: 0; color: var(--primary); font-size: 1rem;">${title}</h4>
                    
                    <div class="compare-feature-row">
                        <strong>Kategorie &amp; Sprache</strong>
                        <span>${p.category || 'Web'} &bull; ${p.language || 'JavaScript'}</span>
                    </div>

                    <div class="compare-feature-row">
                        <strong>Architektur-Badges</strong>
                        <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px;">
                            ${badges || '<span class="small-muted">Modulare Vanilla-Architektur</span>'}
                        </div>
                    </div>

                    <div class="compare-feature-row">
                        <strong>Tech-Stack &amp; Frameworks</strong>
                        <div class="tech-tags" style="margin-top: 4px;">
                            ${(p.tags || []).map(t => `<span class="tech-tag" style="font-size: 0.7rem;">${t}</span>`).join('')}
                        </div>
                    </div>

                    ${kl ? `
                        <div class="compare-feature-row">
                            <strong>Kern-Herausforderung</strong>
                            <span style="font-size: 0.8rem; color: var(--text-secondary);">${lang === 'de' ? kl.challengeDe : kl.challengeEn}</span>
                        </div>
                        <div class="compare-feature-row">
                            <strong>Lösungsansatz</strong>
                            <span style="font-size: 0.8rem; color: var(--text-secondary);">${lang === 'de' ? kl.solutionDe : kl.solutionEn}</span>
                        </div>
                    ` : ''}

                    <div style="margin-top: auto; padding-top: 0.5rem; display: flex; gap: 0.5rem;">
                        ${p.link ? `<a href="${p.link}" target="_blank" rel="noopener" class="btn-primary font-size-0-75rem padding-4px-8px" style="flex:1; text-align:center;">Launch Demo</a>` : ''}
                        <a href="projekt-detail.html?repo=${encodeURIComponent(p.repoName || '')}" class="btn-secondary font-size-0-75rem padding-4px-8px" style="flex:1; text-align:center;">Deep-Dive</a>
                    </div>
                </div>
            `;
        }).join('');

        // Bind remove buttons inside compare columns
        grid.querySelectorAll('.compare-column-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.dataset.index);
                const removed = selectedProjects.splice(idx, 1)[0];
                
                // Uncheck button on card
                const cardBtn = document.querySelector(`.btn-compare-select[data-repo="${removed.repoName || removed.titleDe}"]`);
                if (cardBtn) cardBtn.classList.remove('active');

                updateFloatingBar();
                renderComparison();
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProjectCompare);
    } else {
        initProjectCompare();
    }
})();
