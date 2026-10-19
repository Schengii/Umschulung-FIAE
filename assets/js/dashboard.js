/**
 * Dashboard — Stats, Projektübersicht, interaktive Widgets
 * Loaded dynamically as a module.
 */
import { computeQualityScore, getQualityStatus } from './modules/grade-calculator.js';
import { Achievements } from './modules/achievements.js';
import { EXAM_QUESTIONS, EXAM_TOPICS } from './modules/exam-questions.js';
import {
    rankLearningRecommendations,
    getRecommendationCategoryName,
    getRecommendationLink,
    getContributionLevel,
    buildContributionData,
} from './modules/dashboard-logic.js';
import { getLocalDateKey, getDailyQuestionIndex, loadDailyState, recordDailyAnswer } from './modules/daily-question.js';

export function initDashboard() {
    const isDashboardPage =
        window.location.pathname.endsWith('dashboard.html') || document.getElementById('commit-grid');
    if (!isDashboardPage) return;

    renderStats();
    renderProjectCount();
    renderRecentProjects();
    initQaMetrics();
    initDailyQuestionWidget();
    renderLearningRecommendations();
    initCommitGrid();
    renderAchievementsWidget();
    initPwaTelemetry();

    // Event listeners for achievements update
    document.addEventListener('langchange', renderAchievementsWidget);
    document.addEventListener('achievementunlocked', renderAchievementsWidget);
}

/**
 * PWA widget: shows what this browser really has cached (Cache API) instead of fixed numbers.
 */
function initPwaTelemetry() {
    const statusBadge = document.getElementById('pwa-sync-status-badge');
    const netState = document.getElementById('pwa-network-state');
    const netDetail = document.getElementById('pwa-network-detail');
    const cacheSize = document.getElementById('pwa-cache-size');
    const cachePages = document.getElementById('pwa-cache-pages');
    const swState = document.getElementById('pwa-sw-state');
    const swDetail = document.getElementById('pwa-sw-detail');
    const testBtn = document.getElementById('pwa-test-offline-btn');
    const updateBtn = document.getElementById('pwa-purge-cache-btn');
    if (!statusBadge && !cacheSize) return;

    const isEnglish = () => document.documentElement.getAttribute('lang') === 'en';
    const toast = (text, type) => window.showToast && window.showToast(text, type);
    const hasCacheApi = 'caches' in window;

    /** Reads the site's precache: name, number of entries and how many of them are pages. */
    async function readCache() {
        if (!hasCacheApi) return null;
        const names = (await caches.keys()).filter((name) => name.startsWith('umschulung-fiae-'));
        if (names.length === 0) return null;
        const name = names[names.length - 1];
        const requests = await (await caches.open(name)).keys();
        const pages = requests.filter((req) => /(\.html|\/)$/.test(new URL(req.url).pathname)).length;
        return { name, files: requests.length, pages };
    }

    async function render() {
        const en = isEnglish();
        const online = navigator.onLine;

        if (netState) {
            netState.textContent = online ? 'Online' : en ? 'Offline (served from cache)' : 'Offline (Cache-Modus)';
            netState.style.color = online ? '#10b981' : '#ef4444';
        }
        if (netDetail) {
            const type = /** @type {any} */ (navigator).connection?.effectiveType;
            netDetail.textContent = type ? (en ? `Connection type: ${type}` : `Verbindungstyp: ${type}`) : '';
        }

        const controlled = 'serviceWorker' in navigator && Boolean(navigator.serviceWorker.controller);
        if (swState) swState.textContent = controlled ? (en ? 'Active' : 'Aktiv') : en ? 'Not active' : 'Nicht aktiv';
        if (swDetail) {
            swDetail.textContent = controlled
                ? en
                    ? 'This page is served through the service worker.'
                    : 'Diese Seite läuft über den Service Worker.'
                : en
                  ? 'Takes over after the first reload.'
                  : 'Übernimmt nach dem ersten Neuladen.';
        }

        let cache = null;
        try {
            cache = await readCache();
        } catch (e) {
            console.warn('PWA widget: Cache API not readable:', e);
        }
        document.querySelectorAll('.pwa-cache-name').forEach((el) => {
            el.textContent = cache ? cache.name : '–';
        });
        if (cacheSize) {
            cacheSize.textContent = cache
                ? en
                    ? `${cache.files} files`
                    : `${cache.files} Dateien`
                : en
                  ? 'No cache yet'
                  : 'Noch kein Cache';
        }
        if (cachePages) {
            cachePages.textContent = cache
                ? en
                    ? `${cache.pages} pages available offline`
                    : `${cache.pages} Seiten offline verfügbar`
                : '';
        }
        if (statusBadge) {
            const ready = Boolean(cache);
            statusBadge.textContent = !online
                ? en
                    ? '⚠ Offline – served from cache'
                    : '⚠ Offline – Auslieferung aus dem Cache'
                : ready
                  ? en
                      ? '● Offline cache ready'
                      : '● Offline-Cache bereit'
                  : en
                    ? '○ Offline cache not set up yet'
                    : '○ Offline-Cache noch nicht eingerichtet';
            statusBadge.style.color = !online ? '#f59e0b' : ready ? '#10b981' : '';
        }
        return cache;
    }

    window.addEventListener('online', render);
    window.addEventListener('offline', render);
    document.addEventListener('langchange', render);
    render();
    if ('serviceWorker' in navigator) {
        // The first visit installs the worker while the page is already open.
        navigator.serviceWorker.ready.then(render).catch(() => {});
        navigator.serviceWorker.addEventListener('controllerchange', render);
    }

    if (testBtn) {
        testBtn.addEventListener('click', async () => {
            const cache = await render();
            if (!cache) {
                toast(
                    {
                        de: 'Noch kein Offline-Cache vorhanden – Seite einmal neu laden.',
                        en: 'No offline cache yet – reload the page once.',
                    },
                    'warning'
                );
                return;
            }
            toast(
                {
                    de: `${cache.pages} Seiten und ${cache.files - cache.pages} weitere Dateien sind offline verfügbar.`,
                    en: `${cache.pages} pages and ${cache.files - cache.pages} other files are available offline.`,
                },
                'success'
            );
        });
    }

    if (updateBtn) {
        updateBtn.addEventListener('click', async () => {
            if (!('serviceWorker' in navigator)) return;
            try {
                const registration = await navigator.serviceWorker.getRegistration();
                if (!registration) throw new Error('no registration');
                await registration.update();
                await render();
                toast(
                    registration.installing || registration.waiting
                        ? { de: 'Neue Version gefunden – wird installiert.', en: 'New version found – installing.' }
                        : { de: 'Der Offline-Cache ist aktuell.', en: 'The offline cache is up to date.' },
                    'success'
                );
            } catch (e) {
                console.warn('PWA widget: update check failed:', e);
                toast({ de: 'Update-Prüfung nicht möglich.', en: 'Update check not possible.' }, 'warning');
            }
        });
    }
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
                <div style="font-size:2rem; font-weight:700; color:var(--primary);">${AppStorage.getItem('username') ? '👤' : '—'}</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">${lang === 'de' ? 'Profil' : 'Profile'}</div>
            </div>
        </div>
    `;
    container.after(statsCard);
}

function renderProjectCount() {
    fetch((window.resolveAssetPath || ((p) => p))('assets/data/projects.json'))
        .then((r) => r.json())
        .then((projects) => {
            const el = document.getElementById('stat-projects');
            if (el) el.textContent = projects.length;
        })
        .catch(() => {});
}

function renderRecentProjects() {
    const container = document.querySelector('.left-col .card');
    if (!container) return;

    fetch((window.resolveAssetPath || ((p) => p))('assets/data/projects.json'))
        .then((r) => r.json())
        .then((projects) => {
            const lang = document.documentElement.getAttribute('lang') || 'de';
            const recent = projects.slice(-3).reverse();

            const card = document.createElement('div');
            card.className = 'card fade-in visible';

            card.innerHTML = `
                <h3>${lang === 'de' ? '📁 Letzte Projekte' : '📁 Recent Projects'}</h3>
                <ul style="list-style:none; padding:0; margin-top:1rem;">
                    ${recent
                        .map(
                            (p) => `
                        <li style="padding:0.75rem; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-weight:600;">${p.title}</span>
                            <a href="${p.link}" style="font-size:0.85rem;">
                                ${lang === 'de' ? 'Öffnen →' : 'Open →'}
                            </a>
                        </li>
                    `
                        )
                        .join('')}
                </ul>
            `;

            container.after(card);
        })
        .catch(() => {});
}

/* ==========================================================================
   IHK NOTENRECHNER LOGIC
   ========================================================================== */
function initQaMetrics() {
    const coverageInput = /** @type {HTMLInputElement} */ (document.getElementById('qa-test-coverage'));
    const cleanCodeInput = /** @type {HTMLInputElement} */ (document.getElementById('qa-clean-code'));
    const docsInput = /** @type {HTMLInputElement} */ (document.getElementById('qa-documentation'));
    const securityInput = /** @type {HTMLInputElement} */ (document.getElementById('qa-security-scan'));

    // Ranges
    const coverageRange = document.getElementById('qa-test-coverage-range');
    const cleanCodeRange = document.getElementById('qa-clean-code-range');
    const docsRange = document.getElementById('qa-documentation-range');
    const securityRange = document.getElementById('qa-security-scan-range');

    if (!coverageInput || !cleanCodeInput || !docsInput || !securityInput) return;

    const ring = document.getElementById('grade-progress-ring');
    const percentText = document.getElementById('overall-percentage');
    const badge = document.getElementById('grade-status-badge');

    /** @type {{ num: any, range: any }[]} */
    const mappings = [
        { num: coverageInput, range: coverageRange },
        { num: cleanCodeInput, range: cleanCodeRange },
        { num: docsInput, range: docsRange },
        { num: securityInput, range: securityRange },
    ];

    mappings.forEach((pair) => {
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

        const coverage = parseFloat(coverageInput.value) || 0;
        const cleanCode = parseFloat(cleanCodeInput.value) || 0;
        const docs = parseFloat(docsInput.value) || 0;
        const security = parseFloat(securityInput.value) || 0;

        // Weightings: Coverage 40% / Clean Code 30% / Documentation 15% / Security 15%
        const overallScore = computeQualityScore({ coverage, cleanCode, docs, security });

        // Update UI
        percentText.textContent = `${Math.round(overallScore)}%`;

        // Update SVG circle gauge
        const circ = 2 * Math.PI * 65;
        ring.style.strokeDasharray = String(circ);
        const offset = circ - (overallScore / 100) * circ;
        ring.style.strokeDashoffset = String(offset);

        // Status determinations
        const statusConfig = {
            success: {
                stroke: '#10b981',
                bg: 'rgba(16, 185, 129, 0.1)',
                border: 'rgba(16, 185, 129, 0.2)',
                icon: 'fa-check-circle',
                text_de: 'Produktionsbereit!',
                text_en: 'Production Ready!',
            },
            warning: {
                stroke: '#f59e0b',
                bg: 'rgba(245, 158, 11, 0.1)',
                border: 'rgba(245, 158, 11, 0.2)',
                icon: 'fa-info-circle',
                text_de: 'Freigabe-Kandidat',
                text_en: 'Release Candidate',
            },
            danger: {
                stroke: '#ef4444',
                bg: 'rgba(239, 68, 68, 0.1)',
                border: 'rgba(239, 68, 68, 0.2)',
                icon: 'fa-exclamation-circle',
                text_de: 'Refactoring empfohlen',
                text_en: 'Refactoring Recommended',
            },
        };
        const status = statusConfig[getQualityStatus(overallScore)];
        ring.style.stroke = status.stroke;
        if (badge) {
            badge.className = `grade-alert ${getQualityStatus(overallScore)}`;
            badge.style.backgroundColor = status.bg;
            badge.style.borderColor = status.border;
            badge.style.color = status.stroke;
            badge.innerHTML = `<span><i class="fa ${status.icon}"></i> ${lang === 'de' ? status.text_de : status.text_en}</span>`;
        }

        const barChartSvg = document.getElementById('qa-bar-chart');
        if (barChartSvg) {
            const metrics = [
                { name: lang === 'de' ? 'Coverage' : 'Coverage', val: coverage, color: '#3b82f6' },
                { name: lang === 'de' ? 'Clean Code' : 'Clean Code', val: cleanCode, color: '#a855f7' },
                { name: lang === 'de' ? 'Doku' : 'Docs', val: docs, color: '#10b981' },
                { name: lang === 'de' ? 'Security' : 'Security', val: security, color: '#f43f5e' },
            ];

            let svgContent = '';
            metrics.forEach((m, idx) => {
                const y = 8 + idx * 25;
                const widthPercent = Math.max(5, m.val);
                svgContent += `
                    <text x="5" y="${y + 11}" fill="var(--text-primary)" font-size="10" font-family="sans-serif">${m.name}</text>
                    <rect x="75" y="${y}" width="160" height="13" rx="3" fill="var(--border)" />
                    <rect x="75" y="${y}" width="${(widthPercent / 100) * 160}" height="13" rx="3" fill="${m.color}" />
                    <text x="245" y="${y + 11}" fill="var(--text-secondary)" font-size="10" font-family="sans-serif" font-weight="bold">${Math.round(m.val)}%</text>
                `;
            });
            barChartSvg.innerHTML = svgContent;
        }
    }
}

/* ==========================================================================
   DAILY EXAM QUESTION WIDGET (OPT-08)
   ========================================================================== */
function initDailyQuestionWidget() {
    const container = document.getElementById('daily-question-container');
    const streakCount = document.getElementById('daily-streak-count');
    if (!container) return;

    function render() {
        const lang = document.documentElement.getAttribute('lang') || 'de';
        const dateKey = getLocalDateKey();
        const index = getDailyQuestionIndex(dateKey, EXAM_QUESTIONS.length);
        const question = EXAM_QUESTIONS[index];
        const state = loadDailyState();

        if (streakCount) {
            streakCount.textContent = String(state.streak);
        }

        const answeredToday = state.answered[dateKey];
        const isAnswered = Boolean(answeredToday);

        const topicInfo = EXAM_TOPICS[question.topic] || { de: question.topic, en: question.topic };
        const topicName = topicInfo[lang] || topicInfo.de;

        container.replaceChildren();

        const metaRow = document.createElement('div');
        metaRow.className = 'daily-question-meta';

        const topicBadge = document.createElement('span');
        topicBadge.className = 'exam-topic-chip';
        topicBadge.textContent = topicName;
        metaRow.appendChild(topicBadge);

        if (isAnswered && answeredToday) {
            const statusBadge = document.createElement('span');
            statusBadge.className = `daily-status-badge ${answeredToday.isCorrect ? 'correct' : 'incorrect'}`;
            statusBadge.innerHTML = answeredToday.isCorrect
                ? `<i class="fa-solid fa-circle-check" aria-hidden="true"></i> ${lang === 'en' ? 'Solved' : 'Gelöst'}`
                : `<i class="fa-solid fa-circle-xmark" aria-hidden="true"></i> ${lang === 'en' ? 'Attempted' : 'Beantwortet'}`;
            metaRow.appendChild(statusBadge);
        }

        const qTitle = document.createElement('h4');
        qTitle.className = 'daily-question-title';
        qTitle.textContent = question.question[lang] || question.question.de;

        const optionsList = document.createElement('div');
        optionsList.className = 'daily-question-options';

        question.answers.forEach((ans, aIdx) => {
            const optBtn = document.createElement('button');
            optBtn.type = 'button';
            optBtn.className = 'daily-opt-btn';
            const letter = String.fromCharCode(65 + aIdx);
            const answerText = ans[lang] || ans.de;

            optBtn.innerHTML = `<strong>${letter}:</strong> <span>${answerText}</span>`;

            if (isAnswered && answeredToday) {
                optBtn.disabled = true;
                if (aIdx === question.correct) {
                    optBtn.classList.add('correct');
                }
                if (aIdx === answeredToday.answeredIndex && !answeredToday.isCorrect) {
                    optBtn.classList.add('incorrect');
                }
            } else {
                optBtn.addEventListener('click', () => {
                    const isCorrect = aIdx === question.correct;
                    recordDailyAnswer(dateKey, aIdx, isCorrect);
                    render();
                });
            }

            optionsList.appendChild(optBtn);
        });

        container.appendChild(metaRow);
        container.appendChild(qTitle);
        container.appendChild(optionsList);

        if (isAnswered && answeredToday) {
            const explanationBox = document.createElement('div');
            explanationBox.className = `daily-explanation ${answeredToday.isCorrect ? 'success' : 'info'}`;
            const expTitle = answeredToday.isCorrect
                ? lang === 'en'
                    ? 'Correct!'
                    : 'Richtig!'
                : lang === 'en'
                  ? 'Explanation:'
                  : 'Erklärung:';
            const expText = question.explanation[lang] || question.explanation.de;
            explanationBox.innerHTML = `<strong>${expTitle}</strong> ${expText}`;
            container.appendChild(explanationBox);
        }
    }

    render();
    document.addEventListener('langchange', render);
}

/* ==========================================================================
   LEARNING RECOMMENDATIONS LOGIC
   ========================================================================== */
function renderLearningRecommendations() {
    const container = document.querySelector('.right-col');
    if (!container) return;

    const lang = document.documentElement.getAttribute('lang') || 'de';

    const weakQuizCategories = JSON.parse(
        AppStorage.getItem(STORAGE_KEYS.LEARNING_RECOMMENDATIONS_QUIZ_WEAK_CATEGORIES, '[]')
    );
    const flashcardsWrongCounts = JSON.parse(
        AppStorage.getItem(STORAGE_KEYS.LEARNING_RECOMMENDATIONS_FLASHCARDS_WRONG_COUNTS, '{}')
    );

    const sortedRecommendations = rankLearningRecommendations(weakQuizCategories, flashcardsWrongCounts);

    let recommendationsHtml;
    if (sortedRecommendations.length > 0) {
        recommendationsHtml = sortedRecommendations
            .map(
                (cat) =>
                    `<li><a href="${getRecommendationLink(cat)}">${getRecommendationCategoryName(cat, lang)}</a></li>`
            )
            .join('');
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

    // Representing ~1 year of activity (53 weeks * 7 days = 371 cells)
    const liveCommitsToday = parseInt(AppStorage.getItem('github_live_commits_today', 0)) || 0;
    const { cells: cellsData, totalCommits, maxStreak } = buildContributionData(new Date(), liveCommitsToday);

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

    cellsData.forEach((cell) => {
        const cellEl = document.createElement('div');
        cellEl.className = 'commit-cell';

        const level = getContributionLevel(cell.commits);

        cellEl.classList.add(`level-${level}`);

        // Tooltip listeners
        cellEl.addEventListener('mouseenter', (e) => {
            const formattedDate = cell.date.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            tooltip.innerHTML = `<strong>${cell.commits} Commits</strong> am / on ${formattedDate}`;
            tooltip.style.opacity = String(1);

            // Position
            const rect = cellEl.getBoundingClientRect();
            tooltip.style.left = `${rect.left + window.scrollX - tooltip.offsetWidth / 2 + 5}px`;
            tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 8}px`;
        });

        cellEl.addEventListener('mouseleave', () => {
            tooltip.style.opacity = String(0);
        });

        gridContainer.appendChild(cellEl);
    });

    // Update totals
    if (totalSpan) {
        totalSpan.textContent =
            lang === 'de'
                ? `${totalCommits} Beiträge im letzten Jahr`
                : `${totalCommits} contributions in the last year`;
    }
    if (streakSpan) {
        streakSpan.textContent = lang === 'de' ? `Beste Strähne: ${maxStreak} Tage` : `Best Streak: ${maxStreak} days`;
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
    let liveCommitsToday = parseInt(AppStorage.getItem('github_live_commits_today', 0)) || 0;
    liveCommitsToday++;
    AppStorage.setItem('github_live_commits_today', liveCommitsToday);

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

    const definitions = Achievements.definitions;
    const unlockedIds = Achievements.getUnlocked();
    const totalCount = Object.keys(definitions).length;
    const unlockedCount = unlockedIds.length;
    const percentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

    // Update Progress UI
    if (progressText) {
        progressText.textContent =
            lang === 'de'
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

    Object.keys(definitions).forEach((id) => {
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
                ? lang === 'de'
                    ? '🏅 Freigeschaltet'
                    : '🏅 Unlocked'
                : lang === 'de'
                  ? '🔒 Gesperrt'
                  : '🔒 Locked';

            tooltip.innerHTML = `
                <div style="font-weight: 700; font-family: var(--font-heading); color: var(--primary); margin-bottom: 2px;">${title}</div>
                <div style="color: var(--text-primary); font-size: 0.8rem; margin-bottom: 4px; max-width: 220px; white-space: normal;">${desc}</div>
                <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 500;">${statusText}</div>
            `;
            tooltip.style.opacity = String(1);

            const rect = badgeBox.getBoundingClientRect();
            tooltip.style.left = `${rect.left + window.scrollX - tooltip.offsetWidth / 2 + rect.width / 2}px`;
            tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 8}px`;
        };

        const hideTooltip = () => {
            tooltip.style.opacity = String(0);
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
