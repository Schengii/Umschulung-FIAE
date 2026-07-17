/**
 * Dashboard — Stats, Projektübersicht, interaktive Widgets
 * Loaded dynamically as a module.
 */
export function initDashboard() {
    const isDashboardPage = window.location.pathname.endsWith('dashboard.html') || document.getElementById('commit-grid');
    if (!isDashboardPage) return;

    renderStats();
    renderProjectCount();
    renderRecentProjects();
    initQaMetrics();
    renderLearningRecommendations();
    initCommitGrid();
    renderAchievementsWidget();

    // Event listeners for achievements update
    document.addEventListener('langchange', renderAchievementsWidget);
    document.addEventListener('achievementunlocked', renderAchievementsWidget);
}

function renderStats() {
    const container = document.querySelector('.left-col .card');
    if (!container) return;

    const statsCard = document.createElement('div');
    statsCard.className = 'card fade-in visible';
    statsCard.style.marginTop = '1.5rem';

    const lang = document.documentElement.getAttribute('lang') || 'de';

    const pageCount = document.querySelectorAll('a[href$=".html"]').length;

    statsCard.innerHTML = `
        <h3>${lang === 'de' ? '📊 Seiten-Statistiken' : '📊 Page Statistics'}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; margin-top: 1rem;">
            <div class="stat-box" style="text-align:center; padding:1rem; background:var(--bg-page); border-radius:var(--radius-md); border:1px solid var(--border);">
                <div style="font-size:2rem; font-weight:700; color:var(--primary);">${pageCount}</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">${lang === 'de' ? 'HTML-Seiten' : 'HTML Pages'}</div>
            </div>
            <div class="stat-box" style="text-align:center; padding:1rem; background:var(--bg-page); border-radius:var(--radius-md); border:1px solid var(--border);">
                <div style="font-size:2rem; font-weight:700; color:var(--primary);" id="stat-projects">0</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">${lang === 'de' ? 'Projekte' : 'Projects'}</div>
            </div>
            <div class="stat-box" style="text-align:center; padding:1rem; background:var(--bg-page); border-radius:var(--radius-md); border:1px solid var(--border);">
                <div style="font-size:2rem; font-weight:700; color:var(--primary);">3</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">${lang === 'de' ? 'Mini-Games' : 'Mini Games'}</div>
            </div>
            <div class="stat-box" style="text-align:center; padding:1rem; background:var(--bg-page); border-radius:var(--radius-md); border:1px solid var(--border);">
                <div style="font-size:2rem; font-weight:700; color:var(--primary);">${StorageManager.getItem('username') ? '👤' : '—'}</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">${lang === 'de' ? 'Profil' : 'Profile'}</div>
            </div>
        </div>
    `;
    container.after(statsCard);
}

function renderProjectCount() {
    fetch('assets/data/projects.json')
        .then(r => r.json())
        .then(projects => {
            const el = document.getElementById('stat-projects');
            if (el) el.textContent = projects.length;
        })
        .catch(() => { });
}

function renderRecentProjects() {
    const container = document.querySelector('.left-col .card');
    if (!container) return;

    fetch('assets/data/projects.json')
        .then(r => r.json())
        .then(projects => {
            const lang = document.documentElement.getAttribute('lang') || 'de';
            const recent = projects.slice(-3).reverse();

            const card = document.createElement('div');
            card.className = 'card fade-in visible';

            card.innerHTML = `
                <h3>${lang === 'de' ? '📁 Letzte Projekte' : '📁 Recent Projects'}</h3>
                <ul style="list-style:none; padding:0; margin-top:1rem;">
                    ${recent.map(p => `
                        <li style="padding:0.75rem; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-weight:600;">${p.title}</span>
                            <a href="${p.link}" style="font-size:0.85rem;">
                                ${lang === 'de' ? 'Öffnen →' : 'Open →'}
                            </a>
                        </li>
                    `).join('')}
                </ul>
            `;

            container.after(card);
        })
        .catch(() => { });
}

/* ==========================================================================
   IHK NOTENRECHNER LOGIC
   ========================================================================== */
function getIhkGrade(score) {
    if (score >= 92) return 1;
    if (score >= 81) return 2;
    if (score >= 67) return 3;
    if (score >= 50) return 4;
    if (score >= 30) return 5;
    return 6;
}

function initQaMetrics() {
    const coverageInput = document.getElementById('qa-test-coverage');
    const cleanCodeInput = document.getElementById('qa-clean-code');
    const docsInput = document.getElementById('qa-documentation');
    const securityInput = document.getElementById('qa-security-scan');

    // Ranges
    const coverageRange = document.getElementById('qa-test-coverage-range');
    const cleanCodeRange = document.getElementById('qa-clean-code-range');
    const docsRange = document.getElementById('qa-documentation-range');
    const securityRange = document.getElementById('qa-security-scan-range');

    if (!coverageInput || !cleanCodeInput || !docsInput || !securityInput) return;

    const ring = document.getElementById('grade-progress-ring');
    const percentText = document.getElementById('overall-percentage');
    const badge = document.getElementById('grade-status-badge');

    const mappings = [
        { num: coverageInput, range: coverageRange },
        { num: cleanCodeInput, range: cleanCodeRange },
        { num: docsInput, range: docsRange },
        { num: securityInput, range: securityRange }
    ];

    mappings.forEach(pair => {
        if (!pair.range) return;

        pair.num.addEventListener('input', () => {
            pair.range.value = pair.num.value;
            calculateQuality();
        });

        pair.range.addEventListener('input', () => {
            pair.num.value = pair.range.value;
            calculateQuality();
        });
    });

    document.addEventListener('langchange', calculateQuality);

    // Initial calculation
    calculateQuality();

    function calculateQuality() {
        const lang = document.documentElement.getAttribute('lang') || 'de';

        const coverage = Math.min(100, Math.max(0, parseFloat(coverageInput.value) || 0));
        const cleanCode = Math.min(100, Math.max(0, parseFloat(cleanCodeInput.value) || 0));
        const docs = Math.min(100, Math.max(0, parseFloat(docsInput.value) || 0));
        const security = Math.min(100, Math.max(0, parseFloat(securityInput.value) || 0));

        // Weightings:
        // Coverage = 40%
        // Clean Code = 30%
        // Documentation = 15%
        // Security = 15%
        const overallScore = (coverage * 0.4) + (cleanCode * 0.3) + (docs * 0.15) + (security * 0.15);

        // Update UI
        percentText.textContent = `${Math.round(overallScore)}%`;

        // Update SVG circle gauge
        const circ = 2 * Math.PI * 65;
        ring.style.strokeDasharray = circ;
        const offset = circ - (overallScore / 100) * circ;
        ring.style.strokeDashoffset = offset;

        // Status determinations
        if (overallScore >= 90) {
            ring.style.stroke = '#10b981'; // Green
            if (badge) {
                badge.className = 'grade-alert success';
                badge.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                badge.style.borderColor = 'rgba(16, 185, 129, 0.2)';
                badge.style.color = '#10b981';
                badge.innerHTML = `<span><i class="fa fa-check-circle"></i> ${lang === 'de' ? 'Produktionsbereit!' : 'Production Ready!'}</span>`;
            }
        } else if (overallScore >= 75) {
            ring.style.stroke = '#f59e0b'; // Amber
            if (badge) {
                badge.className = 'grade-alert warning';
                badge.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
                badge.style.borderColor = 'rgba(245, 158, 11, 0.2)';
                badge.style.color = '#f59e0b';
                badge.innerHTML = `<span><i class="fa fa-info-circle"></i> ${lang === 'de' ? 'Freigabe-Kandidat' : 'Release Candidate'}</span>`;
            }
        } else {
            ring.style.stroke = '#ef4444'; // Red
            if (badge) {
                badge.className = 'grade-alert danger';
                badge.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                badge.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                badge.style.color = '#ef4444';
                badge.innerHTML = `<span><i class="fa fa-exclamation-circle"></i> ${lang === 'de' ? 'Refactoring empfohlen' : 'Refactoring Recommended'}</span>`;
            }
        }
    }
}

/* ==========================================================================
   LEARNING RECOMMENDATIONS LOGIC
   ========================================================================== */
function renderLearningRecommendations() {
    const container = document.querySelector('.right-col');
    if (!container) return;

    const lang = document.documentElement.getAttribute('lang') || 'de';

    const weakQuizCategories = JSON.parse(StorageManager.getItem(STORAGE_KEYS.LEARNING_RECOMMENDATIONS_QUIZ_WEAK_CATEGORIES, '[]'));
    const flashcardsWrongCounts = JSON.parse(StorageManager.getItem(STORAGE_KEYS.LEARNING_RECOMMENDATIONS_FLASHCARDS_WRONG_COUNTS, '{}'));

    const recommendations = {};

    // Process quiz recommendations
    weakQuizCategories.forEach(cat => {
        recommendations[cat] = (recommendations[cat] || 0) + 2; // Higher weight for quiz
    });

    // Process flashcard recommendations
    for (const cat in flashcardsWrongCounts) {
        recommendations[cat] = (recommendations[cat] || 0) + flashcardsWrongCounts[cat];
    }

    // Sort recommendations by weight (descending)
    const sortedRecommendations = Object.entries(recommendations)
        .sort(([, a], [, b]) => b - a)
        .map(([cat]) => cat);

    let recommendationsHtml = '';
    if (sortedRecommendations.length > 0) {
        recommendationsHtml = sortedRecommendations.map(cat => {
            let categoryName = cat; // Default to category key
            // Map internal category keys to user-friendly names
            switch (cat) {
                case 'tech': categoryName = lang === 'de' ? 'Technische Fragen' : 'Technical Questions'; break;
                case 'project': categoryName = lang === 'de' ? 'Projektfragen' : 'Project Questions'; break;
                case 'personal': categoryName = lang === 'de' ? 'Persönliche Fragen' : 'Personal Questions'; break;
                case 'ihk': categoryName = lang === 'de' ? 'IHK-Fragen' : 'IHK Questions'; break;
                case 'software': categoryName = lang === 'de' ? 'Softwareentwicklung' : 'Software Development'; break;
                case 'database': categoryName = lang === 'de' ? 'Datenbanken' : 'Databases'; break;
                case 'network': categoryName = lang === 'de' ? 'Netzwerke & Sicherheit' : 'Networking & Security'; break;
                case 'wiso': categoryName = lang === 'de' ? 'Wirtschaft & Soziales' : 'Business & Society'; break;
                // Add more mappings as needed
            }
            return `<li><a href="${getRecommendationLink(cat)}">${categoryName}</a></li>`;
        }).join('');
    } else {
        recommendationsHtml = `<li><span lang="de">Keine spezifischen Empfehlungen. Mach ein Quiz oder lerne Lernkarten!</span><span lang="en">No specific recommendations yet. Take a quiz or study flashcards!</span></li>`;
    }

    const recommendationCard = document.createElement('section');
    recommendationCard.className = 'card fade-in visible';
    recommendationCard.setAttribute('aria-labelledby', 'recommendations-title');
    recommendationCard.innerHTML = `
        <h3 id="recommendations-title"><span lang="de">📚 Lernempfehlungen</span><span lang="en">📚 Learning Recommendations</span></h3>
        <ul style="padding-left: 1.25rem; font-size: 0.9rem; color: var(--text-secondary);">
            ${recommendationsHtml}
        </ul>
    `;
    container.appendChild(recommendationCard);
}

/* ==========================================================================
   GITHUB ACTIVITY GRID LOGIC
   ========================================================================== */
function initCommitGrid() {
    const gridContainer = document.getElementById('commit-grid');
    if (!gridContainer) return;

    const totalSpan = document.getElementById('commit-grid-total');
    const streakSpan = document.getElementById('commit-grid-streak');

    const lang = document.documentElement.getAttribute('lang') || 'de';

    // Dates setup
    // Representing ~1 year of activity (53 weeks * 7 days = 371 cells)
    const totalDays = 371;
    const today = new Date();
    const cellsData = [];

    // Simple seeded LCG PRNG for historical contributions
    let seed = 42;
    function random() {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    let totalCommits = 0;
    let currentStreak = 0;
    let maxStreak = 0;

    // Load custom live commits added today
    let liveCommitsToday = parseInt(StorageManager.getItem('github_live_commits_today', 0)) || 0;

    // Generate contribution data going back from today
    for (let i = totalDays - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        let commits = 0;
        const dayOfWeek = date.getDay(); // 0 is Sunday, 6 Saturday

        // Historical simulation: Umschulungszeit started 2024. Let's make weekends light, weekdays busier.
        if (i === 0) {
            // Today
            commits = liveCommitsToday;
        } else {
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const randVal = random();
            if (isWeekend) {
                commits = randVal > 0.9 ? Math.floor(randVal * 3) : 0;
            } else {
                commits = randVal > 0.4 ? Math.floor(randVal * 8) : 0;
            }
        }

        totalCommits += commits;

        // Streak check
        if (commits > 0) {
            currentStreak++;
            if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else {
            currentStreak = 0;
        }

        cellsData.push({
            date: date,
            commits: commits
        });
    }

    // Render cells
    gridContainer.innerHTML = '';

    // Create Tooltip
    let tooltip = document.getElementById('grid-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'grid-tooltip';
        tooltip.className = 'grid-tooltip';
        document.body.appendChild(tooltip);
    }

    cellsData.forEach(cell => {
        const cellEl = document.createElement('div');
        cellEl.className = 'commit-cell';

        // Map commit counts to 5 levels (0 to 4)
        let level = 0;
        if (cell.commits > 0) {
            if (cell.commits <= 2) level = 1;
            else if (cell.commits <= 4) level = 2;
            else if (cell.commits <= 6) level = 3;
            else level = 4;
        }

        cellEl.classList.add(`level-${level}`);

        // Tooltip listeners
        cellEl.addEventListener('mouseenter', (e) => {
            const formattedDate = cell.date.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            tooltip.innerHTML = `<strong>${cell.commits} Commits</strong> am / on ${formattedDate}`;
            tooltip.style.opacity = 1;

            // Position
            const rect = cellEl.getBoundingClientRect();
            tooltip.style.left = `${rect.left + window.scrollX - tooltip.offsetWidth / 2 + 5}px`;
            tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 8}px`;
        });

        cellEl.addEventListener('mouseleave', () => {
            tooltip.style.opacity = 0;
        });

        gridContainer.appendChild(cellEl);
    });

    // Update totals
    if (totalSpan) {
        totalSpan.textContent = lang === 'de'
            ? `${totalCommits} Beiträge im letzten Jahr`
            : `${totalCommits} contributions in the last year`;
    }
    if (streakSpan) {
        streakSpan.textContent = lang === 'de'
            ? `Beste Strähne: ${maxStreak} Tage`
            : `Best Streak: ${maxStreak} days`;
    }
}

function getRecommendationLink(category) {
    // Map categories to relevant pages
    switch (category) {
        case 'tech':
        case 'project':
        case 'personal':
        case 'ihk':
            return 'interview-trainer.html'; // Interview Trainer covers these
        case 'software':
        case 'database':
        case 'network':
        case 'wiso':
            return 'flashcards.html'; // Flashcards cover these
        default:
            return 'quiz.html'; // Fallback to quiz
    }
}

// Listen to global language change to keep recommendations in sync
document.addEventListener('langchange', () => {
    const existingRecCard = document.querySelector('.right-col .card[aria-labelledby="recommendations-title"]');
    if (existingRecCard) {
        existingRecCard.remove();
    }
    renderLearningRecommendations();
});

// Global function to trigger a live commit on the dashboard from games/other areas
window.addLiveCommit = function () {
    let liveCommitsToday = parseInt(StorageManager.getItem('github_live_commits_today', 0)) || 0;
    liveCommitsToday++;
    StorageManager.setItem('github_live_commits_today', liveCommitsToday);

    // Re-initialize if we are on dashboard
    initCommitGrid();
};

/* ==========================================================================
   ACHIEVEMENTS WIDGET LOGIC
   ========================================================================= */
function renderAchievementsWidget() {
    const gridContainer = document.getElementById('achievements-widget-grid');
    if (!gridContainer) return;

    const progressText = document.getElementById('achievements-progress-text');
    const progressBar = document.getElementById('achievements-progress-bar');
    const progressPercent = document.getElementById('achievements-progress-percent');

    const lang = document.documentElement.getAttribute('lang') || 'de';

    if (typeof Achievements === 'undefined') {
        console.warn('Achievements module not loaded.');
        return;
    }

    const definitions = Achievements.definitions;
    const unlockedIds = Achievements.getUnlocked();
    const totalCount = Object.keys(definitions).length;
    const unlockedCount = unlockedIds.length;
    const percentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

    // Update Progress UI
    if (progressText) {
        progressText.textContent = lang === 'de'
            ? `${unlockedCount} von ${totalCount} freigeschaltet`
            : `${unlockedCount} of ${totalCount} unlocked`;
    }
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
    if (progressPercent) {
        progressPercent.textContent = `${percentage}%`;
    }

    // Build grid
    gridContainer.innerHTML = '';

    // Create or reuse tooltip
    let tooltip = document.getElementById('grid-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'grid-tooltip';
        tooltip.className = 'grid-tooltip';
        document.body.appendChild(tooltip);
    }

    Object.keys(definitions).forEach(id => {
        const def = definitions[id];
        const isUnlocked = unlockedIds.includes(id);

        const badgeBox = document.createElement('div');
        badgeBox.className = 'achievement-badge-box';
        if (!isUnlocked) {
            badgeBox.classList.add('locked');
        }

        badgeBox.innerHTML = `
            <span>${def.icon}</span>
            ${!isUnlocked ? `<span class="lock-overlay-icon"><i class="fa fa-lock" aria-hidden="true"></i></span>` : ''}
        `;

        // Tooltip hover actions
        badgeBox.style.position = 'relative'; // Ensure tooltip coordinates are absolute based on page

        const showTooltip = () => {
            const title = lang === 'de' ? def.title_de : def.title_en;
            const desc = lang === 'de' ? def.desc_de : def.desc_en;
            const statusText = isUnlocked
                ? (lang === 'de' ? '🏅 Freigeschaltet' : '🏅 Unlocked')
                : (lang === 'de' ? '🔒 Gesperrt' : '🔒 Locked');

            tooltip.innerHTML = `
                <div style="font-weight: 700; font-family: var(--font-heading); color: var(--primary); margin-bottom: 2px;">${title}</div>
                <div style="color: var(--text-primary); font-size: 0.8rem; margin-bottom: 4px; max-width: 220px; white-space: normal;">${desc}</div>
                <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 500;">${statusText}</div>
            `;
            tooltip.style.opacity = 1;

            const rect = badgeBox.getBoundingClientRect();
            tooltip.style.left = `${rect.left + window.scrollX - tooltip.offsetWidth / 2 + rect.width / 2}px`;
            tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 8}px`;
        };

        const hideTooltip = () => {
            tooltip.style.opacity = 0;
        };

        badgeBox.addEventListener('mouseenter', showTooltip);
        badgeBox.addEventListener('mouseleave', hideTooltip);
        // Added accessibility click for touch devices
        badgeBox.addEventListener('click', () => {
            showTooltip();
            setTimeout(hideTooltip, 3000);
        });

        gridContainer.appendChild(badgeBox);
    });
}
