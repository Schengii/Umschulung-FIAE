/**
 * Dashboard — Stats, Projektübersicht, interaktive Widgets
 * Wird von dashboard.html geladen.
 */
document.addEventListener('DOMContentLoaded', () => {
    renderStats();
    renderProjectCount();
    renderRecentProjects();
    initNotenrechner();
    initCommitGrid();
});

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
        .catch(() => {});
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
        .catch(() => {});
}

/* ==========================================================================
   IHK NOTENRECHNER LOGIC
   ========================================================================== */
function initNotenrechner() {
    const ap1Input = document.getElementById('ihk-ap1');
    const ap2ProjektInput = document.getElementById('ihk-ap2-projekt');
    const ap2PlanenInput = document.getElementById('ihk-ap2-planen');
    const ap2EntwickelnInput = document.getElementById('ihk-ap2-entwickeln');
    const ap2WisoInput = document.getElementById('ihk-ap2-wiso');

    if (!ap1Input || !ap2ProjektInput || !ap2PlanenInput || !ap2EntwickelnInput || !ap2WisoInput) return;

    const ring = document.getElementById('grade-progress-ring');
    const percentText = document.getElementById('overall-percentage');
    const gradeText = document.getElementById('overall-grade-label');
    const badge = document.getElementById('grade-status-badge');

    const inputs = [ap1Input, ap2ProjektInput, ap2PlanenInput, ap2EntwickelnInput, ap2WisoInput];
    inputs.forEach(input => {
        input.addEventListener('input', calculateGrade);
    });

    document.addEventListener('langchange', calculateGrade);

    // Initial calculation
    calculateGrade();

    function calculateGrade() {
        const lang = document.documentElement.getAttribute('lang') || 'de';

        const ap1 = Math.min(100, Math.max(0, parseFloat(ap1Input.value) || 0));
        const ap2Proj = Math.min(100, Math.max(0, parseFloat(ap2ProjektInput.value) || 0));
        const ap2Plan = Math.min(100, Math.max(0, parseFloat(ap2PlanenInput.value) || 0));
        const ap2Entw = Math.min(100, Math.max(0, parseFloat(ap2EntwickelnInput.value) || 0));
        const ap2Wiso = Math.min(100, Math.max(0, parseFloat(ap2WisoInput.value) || 0));

        // Weightings:
        // AP1 = 20%
        // AP2 Projekt = 50%
        // AP2 Planen = 10%
        // AP2 Entwickeln = 10%
        // AP2 WiSo = 10%
        const overallScore = (ap1 * 0.2) + (ap2Proj * 0.5) + (ap2Plan * 0.1) + (ap2Entw * 0.1) + (ap2Wiso * 0.1);
        const ap2Score = (ap2Proj * 0.5 + ap2Plan * 0.1 + ap2Entw * 0.1 + ap2Wiso * 0.1) / 0.8;

        // IHK Grade Scale
        let grade = 6;
        let gradeName = '';
        if (overallScore >= 92) { grade = 1; gradeName = lang === 'de' ? 'Sehr gut' : 'Very good'; }
        else if (overallScore >= 81) { grade = 2; gradeName = lang === 'de' ? 'Gut' : 'Good'; }
        else if (overallScore >= 67) { grade = 3; gradeName = lang === 'de' ? 'Befriedigend' : 'Satisfactory'; }
        else if (overallScore >= 50) { grade = 4; gradeName = lang === 'de' ? 'Ausreichend' : 'Sufficient'; }
        else if (overallScore >= 30) { grade = 5; gradeName = lang === 'de' ? 'Mangelhaft' : 'Poor'; }
        else { grade = 6; gradeName = lang === 'de' ? 'Ungenügend' : 'Inadequate'; }

        // Exclusion criteria (Sperrklauseln)
        // 1. Overall Score >= 50
        // 2. AP2 weighted total >= 50 (i.e. sufficient)
        // 3. At least 2 sub-areas of AP2 must be >= 50
        // 4. No sub-area of AP2 must be < 30 (ungenügend)
        const subAreasAP2 = [ap2Proj, ap2Plan, ap2Entw, ap2Wiso];
        const countSufficientAP2 = subAreasAP2.filter(v => v >= 50).length;
        const hasUngenuegendAP2 = subAreasAP2.some(v => v < 30);

        let passed = true;
        let failReason = '';

        if (overallScore < 50) {
            passed = false;
            failReason = lang === 'de' ? 'Gesamtnote unter 50 Punkte' : 'Total points below 50';
        } else if (ap2Score < 50) {
            passed = false;
            failReason = lang === 'de' ? 'Teil 2 der Prüfung unter 50 Punkte' : 'Part 2 below 50 points';
        } else if (countSufficientAP2 < 2) {
            passed = false;
            failReason = lang === 'de' ? 'Weniger als zwei Bereiche in Teil 2 ausreichend (>= 50)' : 'Less than two Part 2 fields >= 50';
        } else if (hasUngenuegendAP2) {
            passed = false;
            failReason = lang === 'de' ? 'Ein Bereich in Teil 2 ungenügend (< 30)' : 'A Part 2 field is < 30';
        }

        // Update UI
        percentText.textContent = `${Math.round(overallScore)}%`;
        gradeText.textContent = `${lang === 'de' ? 'Note' : 'Grade'}: ${grade} (${gradeName})`;

        // Update SVG circle gauge
        // Circumference = 2 * Math.PI * 65 = ~408.4
        const circ = 2 * Math.PI * 65;
        ring.style.strokeDasharray = circ;
        const offset = circ - (overallScore / 100) * circ;
        ring.style.strokeDashoffset = offset;

        // Ring Color
        if (passed) {
            ring.style.stroke = 'var(--primary)';
            if (badge) {
                badge.className = 'grade-alert success';
                badge.innerHTML = `<span><i class="fa fa-check-circle"></i> ${lang === 'de' ? 'Bestanden!' : 'Passed!'}</span>`;
            }
        } else {
            ring.style.stroke = '#ef4444';
            if (badge) {
                badge.className = 'grade-alert danger';
                badge.innerHTML = `<span><i class="fa fa-exclamation-circle"></i> ${lang === 'de' ? 'Nicht bestanden' : 'Failed'}<br><small style="font-size:0.75rem;">${failReason}</small></span>`;
            }
        }
    }
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

// Global function to trigger a live commit on the dashboard from games/other areas
window.addLiveCommit = function() {
    let liveCommitsToday = parseInt(StorageManager.getItem('github_live_commits_today', 0)) || 0;
    liveCommitsToday++;
    StorageManager.setItem('github_live_commits_today', liveCommitsToday);
    
    // Re-initialize if we are on dashboard
    initCommitGrid();
};

