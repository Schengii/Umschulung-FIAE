/**
 * @file portfolio-logic.js
 * @description DOM-free logic of portfolio.html: filter, search, curated sort order, pagination
 * and deep links (`?repo=`, `#hash`). portfolio.js only renders.
 */

/** @typedef {Record<string, any>} PortfolioProject */

/** Projects per page; page 1 shows all curated flagships at once. */
export const FIRST_PAGE_PROJECTS = 8;
export const SUBSEQUENT_PAGE_PROJECTS = 8;

// EcoChef is the IHK graduation project and always leads (it also gets the large hero card).
// FEATURED_REPOS are the next-strongest, most relevant projects for a recruiter scanning the
// page - pinned near the top regardless of GitHub star count, which otherwise rewards older hobby
// repos over newer, more representative work. DEPRIORITIZED_REPOS is the opposite: kept in the
// portfolio but pushed to the back instead of competing for first impressions.
export const FEATURED_REPOS = [
    'ElektroCheck-AI',
    'Amazon-2.0',
    'Finanzenportfolio',
    'Wohnungssuche-KI',
    'Informatik-lernen',
    'ManuFaktur',
    'Minecraft',
];
/** @type {string[]} */
export const DEPRIORITIZED_REPOS = [];

/** Projects that can be played directly in the in-page sandbox modal. */
export const SANDBOX_PLAYABLE_REPOS = [
    'EcoChef',
    'ElektroCheck-AI',
    'Amazon-2.0',
    'Finanzenportfolio',
    'Informatik-lernen',
    'ManuFaktur',
    'Minecraft',
    'Wohnungssuche-KI',
];

const HIGHLIGHT_REPOS = ['EcoChef', 'ElektroCheck-AI', 'Amazon-2.0', 'Minecraft'];

/** @param {PortfolioProject} project */
export function isHighlightProject(project) {
    return Boolean(
        project.highlight ||
        project.isHighlight ||
        HIGHLIGHT_REPOS.includes(project.repoName) ||
        (project.stars && project.stars >= 5)
    );
}

/**
 * @param {PortfolioProject} project
 * @param {string} needle lower case
 */
const hasTag = (project, needle) =>
    Array.isArray(project.tags) &&
    project.tags.some((/** @type {string} */ t) => String(t).toLowerCase().includes(needle));

/**
 * @param {PortfolioProject} project
 * @param {string} category filter key from the buttons (`all`, `highlight`, a category or a language)
 */
export function matchesCategory(project, category) {
    if (category === 'all') return true;
    if (category === 'highlight') return isHighlightProject(project);
    if (typeof project.category === 'string' && project.category.includes(category)) return true;
    const language = typeof project.language === 'string' ? project.language.toLowerCase() : '';
    if (language === category) return true;
    if (category === 'cpp') return project.language === 'C++' || hasTag(project, 'c++');
    if (category === 'typescript') return language === 'typescript' || hasTag(project, 'typescript');
    return false;
}

/**
 * @param {PortfolioProject} project
 * @param {string} term lower case, trimmed; '' matches everything
 */
export function matchesSearch(project, term) {
    if (!term) return true;
    const fields = [project.titleDe, project.titleEn, project.descDe, project.descEn].map((value) =>
        String(value || '').toLowerCase()
    );
    return fields.some((field) => field.includes(term)) || hasTag(project, term);
}

/**
 * @param {PortfolioProject[]} projects
 * @param {{category: string, search: string}} filter
 */
export const filterProjects = (projects, { category, search }) =>
    projects.filter((project) => matchesCategory(project, category) && matchesSearch(project, search));

/** @param {string} repoName */
export function projectTier(repoName) {
    if (repoName === 'EcoChef') return 0;
    if (FEATURED_REPOS.includes(repoName)) return 1;
    if (DEPRIORITIZED_REPOS.includes(repoName)) return 3;
    return 2;
}

/**
 * Curated order first (EcoChef, featured in their listed order), then by stars.
 * @param {PortfolioProject[]} projects
 * @param {string} order `asc` or `desc` (stars)
 */
export function sortProjects(projects, order) {
    return [...projects].sort((a, b) => {
        const tierA = projectTier(a.repoName);
        const tierB = projectTier(b.repoName);
        if (tierA !== tierB) return tierA - tierB;
        if (tierA === 1) return FEATURED_REPOS.indexOf(a.repoName) - FEATURED_REPOS.indexOf(b.repoName);
        const starsA = a.stars || 0;
        const starsB = b.stars || 0;
        return order === 'asc' ? starsA - starsB : starsB - starsA;
    });
}

/** @param {number} totalProjects */
export function totalPages(totalProjects) {
    if (totalProjects <= FIRST_PAGE_PROJECTS) return 1;
    return 1 + Math.ceil((totalProjects - FIRST_PAGE_PROJECTS) / SUBSEQUENT_PAGE_PROJECTS);
}

/**
 * Projects of one page (1-based).
 * @template T
 * @param {T[]} sorted
 * @param {number} page
 */
export function pageSlice(sorted, page) {
    if (page <= 1) return sorted.slice(0, FIRST_PAGE_PROJECTS);
    const start = FIRST_PAGE_PROJECTS + (page - 2) * SUBSEQUENT_PAGE_PROJECTS;
    return sorted.slice(start, start + SUBSEQUENT_PAGE_PROJECTS);
}

/**
 * Page that holds the project at `index` of the list.
 * @param {number} index
 */
export const pageForIndex = (index) =>
    index < FIRST_PAGE_PROJECTS ? 1 : 2 + Math.floor((index - FIRST_PAGE_PROJECTS) / SUBSEQUENT_PAGE_PROJECTS);

/** @param {unknown} value letters and digits only, lower case */
export const normalizeKey = (value) =>
    String(value || '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase();

/**
 * Whether a deep-link target (`?repo=` or `#hash`) names a project; titles match partially,
 * repository names exactly.
 * @param {{titleDe?: string, titleEn?: string, repoName?: string}} project
 * @param {string} target
 */
export function matchesDeepLink(project, target) {
    const key = normalizeKey(target);
    if (!key) return false;
    return (
        normalizeKey(project.titleDe).includes(key) ||
        normalizeKey(project.titleEn).includes(key) ||
        normalizeKey(project.repoName) === key
    );
}

/**
 * Search text from `?tech=` / `?search=`: markup removed, lower case.
 * @param {string} raw
 */
export const cleanSearchParam = (raw) =>
    raw
        .replace(/<[^>]*>/g, '')
        .toLowerCase()
        .trim();
