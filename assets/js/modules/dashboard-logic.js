/**
 * Dashboard logic without DOM access: learning recommendations and the contribution grid.
 * dashboard.js only reads storage, calls these functions and renders the result (see CLAUDE.md,
 * pattern "pure logic with Vitest, page code stays thin").
 */

const CATEGORY_NAMES = {
    tech: { de: 'Technische Fragen', en: 'Technical Questions' },
    project: { de: 'Projektfragen', en: 'Project Questions' },
    personal: { de: 'Persönliche Fragen', en: 'Personal Questions' },
    ihk: { de: 'IHK-Fragen', en: 'IHK Questions' },
    software: { de: 'Softwareentwicklung', en: 'Software Development' },
    database: { de: 'Datenbanken', en: 'Databases' },
    network: { de: 'Netzwerke & Sicherheit', en: 'Networking & Security' },
    wiso: { de: 'Wirtschaft & Soziales', en: 'Business & Society' },
};

/**
 * Categories to study, weakest first. A category listed as weak in the quiz counts 2, every wrong
 * flashcard answer counts 1.
 * @param {string[]} weakQuizCategories
 * @param {Record<string, number>} flashcardsWrongCounts
 * @returns {string[]}
 */
export function rankLearningRecommendations(weakQuizCategories, flashcardsWrongCounts) {
    /** @type {Record<string, number>} */
    const weights = {};
    for (const category of weakQuizCategories) {
        weights[category] = (weights[category] || 0) + 2;
    }
    for (const category of Object.keys(flashcardsWrongCounts)) {
        weights[category] = (weights[category] || 0) + flashcardsWrongCounts[category];
    }
    return Object.entries(weights)
        .sort(([, a], [, b]) => b - a)
        .map(([category]) => category);
}

/**
 * @param {string} category internal category key
 * @param {string} lang 'de' or 'en'
 * @returns {string} display name, the key itself for unknown categories
 */
export function getRecommendationCategoryName(category, lang) {
    const names = CATEGORY_NAMES[/** @type {keyof typeof CATEGORY_NAMES} */ (category)];
    if (!names) return category;
    return lang === 'de' ? names.de : names.en;
}

/**
 * @param {string} category internal category key
 * @returns {string} page that trains this category
 */
export function getRecommendationLink(category) {
    switch (category) {
        case 'tech':
        case 'project':
        case 'personal':
        case 'ihk':
            return 'interview-trainer.html';
        case 'software':
        case 'database':
        case 'network':
        case 'wiso':
            return 'flashcards.html';
        default:
            return 'quiz.html';
    }
}

/**
 * Colour level (0-4) of a day in the contribution grid.
 * @param {number} commits
 * @returns {0 | 1 | 2 | 3 | 4}
 */
export function getContributionLevel(commits) {
    if (commits <= 0) return 0;
    if (commits <= 2) return 1;
    if (commits <= 4) return 2;
    if (commits <= 6) return 3;
    return 4;
}

/**
 * Builds the simulated contribution history: seeded pseudo-random days (fewer on weekends), the
 * last day shows the live commits of today.
 * @param {Date} today
 * @param {number} liveCommitsToday
 * @param {number} [totalDays] 371 = 53 weeks
 * @returns {{ cells: { date: Date, commits: number }[], totalCommits: number, maxStreak: number }}
 */
export function buildContributionData(today, liveCommitsToday, totalDays = 371) {
    let seed = 42;
    const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    const cells = [];
    let totalCommits = 0;
    let currentStreak = 0;
    let maxStreak = 0;

    for (let i = totalDays - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        let commits;
        if (i === 0) {
            commits = liveCommitsToday;
        } else {
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const value = random();
            if (isWeekend) {
                commits = value > 0.9 ? Math.floor(value * 3) : 0;
            } else {
                commits = value > 0.4 ? Math.floor(value * 8) : 0;
            }
        }

        totalCommits += commits;
        if (commits > 0) {
            currentStreak++;
            if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else {
            currentStreak = 0;
        }

        cells.push({ date, commits });
    }

    return { cells, totalCommits, maxStreak };
}
