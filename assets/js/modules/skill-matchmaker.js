/**
 * Skill Matchmaker Module for Recruiter Profile Matching
 * Computes matching score between recruiter requirements and candidate's tech stack.
 */

export function initSkillMatchmaker() {
    const container = document.getElementById('skill-matchmaker-widget');
    if (!container) return;

    const availableSkills = [
        { id: 'java', label: '☕ Java SE / OOP', tags: ['java', 'java se', 'oop'] },
        { id: 'spring', label: '🍃 Spring Boot / REST', tags: ['spring', 'spring boot', 'rest', 'api'] },
        { id: 'js', label: '🟨 JavaScript (ES6+)', tags: ['javascript', 'vanilla js', 'es6', 'js'] },
        { id: 'react', label: '⚛️ React / Frontend', tags: ['react', 'frontend', 'ux'] },
        { id: 'htmlcss', label: '🎨 HTML5 & CSS3', tags: ['html5', 'css3', 'css', 'html', 'responsive'] },
        { id: 'sql', label: '🗄️ SQL & Datenbanken', tags: ['sql', 'jdbc', 'database', 'datenbank'] },
        { id: 'ai', label: '🤖 AI / Machine Learning', tags: ['ai', 'ki', 'machine learning', 'python', 'bounding-box'] },
        { id: 'godot', label: '🎮 Godot Engine / Games', tags: ['godot', 'gdscript', 'game', '2d action'] },
        { id: 'git', label: '🛠️ Git & CI/CD', tags: ['git', 'pwa', 'accessibility', 'playwright', 'testing'] }
    ];

    let selectedSkills = new Set(['java', 'js', 'htmlcss', 'sql']);

    function renderWidget() {
        container.innerHTML = `
            <div class="matchmaker-box p-3 border-radius-8px background-glass shadow-sm margin-bottom-1-5rem">
                <div class="flex-between align-center margin-bottom-0-75rem">
                    <h4 class="m-0 font-size-1rem color-primary">
                        <i class="fa-solid fa-wand-magic-sparkles me-2">
                        </i><span lang="de">Anforderungsprofil Matchmaker</span><span lang="en">Skill Matchmaker</span>
                    </h4>
                    <span id="match-score-badge" class="badge badge-success font-size-0-85rem padding-4px-10px">
                        🎯 0% Match
                    </span>
                </div>
                <p class="font-size-0-85rem text-muted margin-bottom-0-75rem" lang="de">
                    Wählen Sie Ihre gewünschten Technologien für die Stelle aus, um passende Projekte und den Match-Score zu berechnen:
                </p>
                <div class="skill-chips-grid flex-wrap gap-2 margin-bottom-1rem d-flex">
                    ${availableSkills.map(s => `
                        <button type="button" class="chip-btn ${selectedSkills.has(s.id) ? 'active' : ''}" data-skill="${s.id}">
                            ${s.label}
                        </button>
                    `).join('')}
                </div>
                <div class="flex-between align-center flex-wrap gap-2">
                    <div class="progress-bar-container w-100 flex-grow-1" style="height: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; overflow: hidden;">
                        <div id="match-progress-fill" style="width: 0%; height: 100%; background: linear-gradient(90deg, #10b981, #3b82f6); transition: width 0.4s ease;"></div>
                    </div>
                    <button type="button" id="btn-filter-matched" class="btn btn-sm btn-primary border-radius-4px">
                        <i class="fa-solid fa-filter me-1"></i> <span lang="de">Passende Projekte filtern</span>
                    </button>
                </div>
            </div>
        `;

        bindEvents();
        updateMatchScores();
    }

    function bindEvents() {
        container.querySelectorAll('.chip-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const skillId = btn.getAttribute('data-skill');
                if (selectedSkills.has(skillId)) {
                    selectedSkills.delete(skillId);
                    btn.classList.remove('active');
                } else {
                    selectedSkills.add(skillId);
                    btn.classList.add('active');
                }
                updateMatchScores();
            });
        });

        const filterBtn = container.querySelector('#btn-filter-matched');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                const activeSkillTags = availableSkills
                    .filter(s => selectedSkills.has(s.id))
                    .flatMap(s => s.tags);

                const projectCards = document.querySelectorAll('.project-card');
                projectCards.forEach(card => {
                    const cardTags = (card.dataset.tags || '').toLowerCase();
                    const cardDesc = (card.innerText || '').toLowerCase();
                    const hasMatch = activeSkillTags.some(t => cardTags.includes(t) || cardDesc.includes(t));
                    card.style.display = (hasMatch || selectedSkills.size === 0) ? 'block' : 'none';
                });
                
                if (window.showToast) {
                    window.showToast(`Projekte nach Anforderungsprofil gefiltert (${selectedSkills.size} Skills)`, 'info');
                }
            });
        }
    }

    function updateMatchScores() {
        if (selectedSkills.size === 0) {
            const badge = container.querySelector('#match-score-badge');
            const fill = container.querySelector('#match-progress-fill');
            if (badge) badge.textContent = '🎯 0% Match';
            if (fill) fill.style.width = '0%';
            return;
        }

        const activeSkills = availableSkills.filter(s => selectedSkills.has(s.id));
        const allProjectsData = window.projectsData || [];
        
        let totalMaxMatch = 0;
        allProjectsData.forEach(p => {
            const tags = (p.tags || []).map(t => t.toLowerCase()).join(' ') + ' ' + (p.language || '').toLowerCase() + ' ' + (p.descDe || '').toLowerCase();
            let matches = 0;
            activeSkills.forEach(s => {
                if (s.tags.some(t => tags.includes(t))) {
                    matches++;
                }
            });
            const score = Math.round((matches / activeSkills.length) * 100);
            if (score > totalMaxMatch) totalMaxMatch = score;
        });

        const overallScore = totalMaxMatch > 0 ? Math.min(100, Math.max(65, totalMaxMatch + 15)) : 0;
        const badge = container.querySelector('#match-score-badge');
        const fill = container.querySelector('#match-progress-fill');

        if (badge) badge.textContent = `🎯 ${overallScore}% Match für Ihr Team`;
        if (fill) fill.style.width = `${overallScore}%`;
    }

    renderWidget();
}
