/**
 * Achievement System Module — Gamification with unlock badges
 * Tracks user accomplishments across the portfolio site.
 */
export const Achievements = {
    definitions: {
        first_visit: {
            icon: '👋',
            title_de: 'Erster Besuch',
            title_en: 'First Visit',
            desc_de: 'Du hast das Portfolio zum ersten Mal besucht!',
            desc_en: 'You visited the portfolio for the first time!',
        },
        flashcard_master: {
            icon: '🧠',
            title_de: 'Lernkarten-Meister',
            title_en: 'Flashcard Master',
            desc_de: 'Alle Lernkarten mindestens einmal als "Gewusst" markiert.',
            desc_en: 'Marked all flashcards as "Got it" at least once.',
        },
        quiz_perfect: {
            icon: '🏆',
            title_de: 'Quiz-Champion',
            title_en: 'Quiz Champion',
            desc_de: '100% im Quiz erreicht.',
            desc_en: 'Scored 100% on the quiz.',
        },
        snake_50: {
            icon: '🐍',
            title_de: 'Snake-Profi',
            title_en: 'Snake Pro',
            desc_de: 'Im Snake-Spiel 50 Punkte erreicht.',
            desc_en: 'Scored 50 points in Snake.',
        },
        memory_fast: {
            icon: '⚡',
            title_de: 'Blitzmerker',
            title_en: 'Speed Memory',
            desc_de: 'Memory in unter 60 Sekunden geschafft.',
            desc_en: 'Completed Memory in under 60 seconds.',
        },
        interview_ace: {
            icon: '💼',
            title_de: 'Interview-Ass',
            title_en: 'Interview Ace',
            desc_de: 'Über 80% im Interview-Trainer erreicht.',
            desc_en: 'Scored over 80% in the Interview Trainer.',
        },
        dark_mode_fan: {
            icon: '🌙',
            title_de: 'Dark-Mode Fan',
            title_en: 'Dark Mode Fan',
            desc_de: 'Den Dark Mode aktiviert.',
            desc_en: 'Activated dark mode.',
        },
        konami_master: {
            icon: '🎮',
            title_de: 'Konami-Meister',
            title_en: 'Konami Master',
            desc_de: 'Den geheimen Konami Code eingegeben!',
            desc_en: 'Entered the secret Konami Code!',
        },
        polyglot: {
            icon: '🌍',
            title_de: 'Polyglott',
            title_en: 'Polyglot',
            desc_de: 'Die Sprache gewechselt.',
            desc_en: 'Switched the language.',
        },
        explorer: {
            icon: '🗺️',
            title_de: 'Entdecker',
            title_en: 'Explorer',
            desc_de: 'Mindestens 5 verschiedene Seiten besucht.',
            desc_en: 'Visited at least 5 different pages.',
        },
        exam_passed: {
            icon: '🎓',
            title_de: 'Prüfung bestanden',
            title_en: 'Exam Passed',
            desc_de: 'Eine IHK-Prüfungssimulation mit mindestens 50 % bestanden.',
            desc_en: 'Passed an IHK exam simulation with at least 50%.',
        },
        git_master: {
            icon: '🌿',
            title_de: 'Git-Profi',
            title_en: 'Git Pro',
            desc_de: 'Eine Challenge im Git-Simulator bestanden.',
            desc_en: 'Passed a challenge in the Git simulator.',
        },
        cv_downloaded: {
            icon: '📄',
            title_de: 'Bewerbungsmappe geöffnet',
            title_en: 'Application Opened',
            desc_de: 'Den Lebenslauf oder die Bewerbungsmappe heruntergeladen!',
            desc_en: 'Downloaded the CV or application folder!',
        },
    },

    getUnlocked() {
        const data = AppStorage.getItem('achievements', '[]');
        try {
            return JSON.parse(data);
        } catch {
            return [];
        }
    },

    isUnlocked(id) {
        return this.getUnlocked().includes(id);
    },

    unlock(id) {
        if (!this.definitions[id] || this.isUnlocked(id)) return;

        const unlocked = this.getUnlocked();
        unlocked.push(id);
        AppStorage.setItem('achievements', JSON.stringify(unlocked));

        this.showNotification(id);
        document.dispatchEvent(new CustomEvent('achievementunlocked', { detail: id }));
    },

    showNotification(id) {
        const def = this.definitions[id];
        if (!def) return;

        const lang = document.documentElement.getAttribute('lang') || 'de';

        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.innerHTML = `
            <div class="achievement-toast-icon">${def.icon}</div>
            <div class="achievement-toast-body">
                <div class="achievement-toast-title">
                    🏅 ${lang === 'de' ? 'Achievement freigeschaltet!' : 'Achievement Unlocked!'}
                </div>
                <div class="achievement-toast-name">
                    ${lang === 'de' ? def.title_de : def.title_en}
                </div>
                <div class="achievement-toast-desc">
                    ${lang === 'de' ? def.desc_de : def.desc_en}
                </div>
            </div>
        `;
        document.body.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => toast.classList.add('show'));

        // Play sound (silent unless the visitor enabled sound)
        if (window.GameAudio) {
            window.GameAudio.play('success');
        }

        // Auto-dismiss
        setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    },
};

// The page scripts (quiz.js, snake.js, memory.js, interview.js, ...) are classic <script>
// files and cannot import this module; they reach it through the global.
window.Achievements = Achievements;

export function initAchievements() {
    // Track first visit
    if (!AppStorage.getItem('has_visited')) {
        AppStorage.setItem('has_visited', 'true');
        Achievements.unlock('first_visit');
    }

    // Track page visits for explorer achievement
    let visitedPages = [];
    try {
        const stored = JSON.parse(AppStorage.getItem('visited_pages', '[]') || '[]');
        if (Array.isArray(stored)) visitedPages = stored;
    } catch {
        // corrupt entry: start over
    }
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (!visitedPages.includes(currentPage)) {
        visitedPages.push(currentPage);
        AppStorage.setItem('visited_pages', JSON.stringify(visitedPages));
    }
    if (visitedPages.length >= 5) {
        Achievements.unlock('explorer');
    }

    // Listen for theme changes (dark mode achievement)
    const observer = new MutationObserver(() => {
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            Achievements.unlock('dark_mode_fan');
        }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Language switched by the visitor. Not 'langchange': several modules dispatch that
    // one themselves just to re-render their texts.
    window.addEventListener('fiae:lang-change', () => {
        Achievements.unlock('polyglot');
    });

    // CV opened, downloaded or printed (delegated: some of these controls are rendered later)
    document.addEventListener('click', (e) => {
        const target = /** @type {HTMLElement} */ (e.target);
        const link = target.closest('a[href]');
        const isCvLink = link && /lebenslauf[^/]*\.pdf$/i.test(link.getAttribute('href'));
        if (isCvLink || target.closest('#btn-cv-print-header, #btn-cv-print-card')) {
            Achievements.unlock('cv_downloaded');
        }
    });
}
