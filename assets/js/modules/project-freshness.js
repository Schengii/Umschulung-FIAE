/**
 * @file project-freshness.js
 * @description Shows on the portfolio when each project's data was last updated, so an outdated
 * demo stands out. The date comes from `updatedAt` in the generated project data (GitHub
 * `updated_at`, or the time of the last data run for projects without a public repository), and
 * the overall "data as of" line shows the newest one. The first half is pure logic (no DOM).
 */

/** A project counts as aging after this many days without an update ... */
export const AGING_AFTER_DAYS = 30;
/** ... and as stale after this many. */
export const STALE_AFTER_DAYS = 90;

/**
 * @param {unknown} updatedAt ISO timestamp from the project data
 * @param {Date} now
 * @returns {{level: 'unknown' | 'fresh' | 'aging' | 'stale', days: number, date: Date | null}}
 */
export function describeFreshness(updatedAt, now) {
    const time = typeof updatedAt === 'string' ? Date.parse(updatedAt) : NaN;
    if (Number.isNaN(time)) return { level: 'unknown', days: 0, date: null };
    // A date in the future (clock skew) counts as today.
    const days = Math.max(0, Math.floor((now.getTime() - time) / 86_400_000));
    const level = days > STALE_AFTER_DAYS ? 'stale' : days > AGING_AFTER_DAYS ? 'aging' : 'fresh';
    return { level, days, date: new Date(time) };
}

/**
 * Newest valid `updatedAt` of a list of projects.
 * @param {{updatedAt?: unknown}[]} projects
 * @returns {Date | null}
 */
export function latestUpdate(projects) {
    let latest = NaN;
    for (const project of projects || []) {
        const time = typeof project?.updatedAt === 'string' ? Date.parse(project.updatedAt) : NaN;
        if (!Number.isNaN(time) && (Number.isNaN(latest) || time > latest)) latest = time;
    }
    return Number.isNaN(latest) ? null : new Date(latest);
}

/**
 * @param {number} days
 * @param {'de' | 'en'} lang
 */
export function formatAge(days, lang) {
    if (lang === 'en') return days === 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`;
    return days === 0 ? 'heute' : days === 1 ? 'gestern' : `vor ${days} Tagen`;
}

/* ------------------------------------------------------------------------------------ */
/* Page integration                                                                      */
/* ------------------------------------------------------------------------------------ */

/**
 * @param {Date} date
 * @param {'de' | 'en'} lang
 */
const formatDate = (date, lang) => date.toLocaleDateString(lang === 'en' ? 'en-GB' : 'de-DE');

/**
 * A bilingual DE/EN pair of spans, like the markup elsewhere on the site.
 * @param {string} de
 * @param {string} en
 * @returns {DocumentFragment}
 */
function bilingual(de, en) {
    const fragment = document.createDocumentFragment();
    for (const [lang, text] of /** @type {const} */ ([
        ['de', de],
        ['en', en],
    ])) {
        const span = document.createElement('span');
        span.lang = lang;
        span.textContent = text;
        fragment.appendChild(span);
    }
    return fragment;
}

export function initProjectFreshness() {
    const container = document.getElementById('dynamic-projects-container');
    if (!container) return;

    /** @returns {Array<Record<string, any>>} */
    const projects = () => (Array.isArray(window.projectsData) ? window.projectsData : []);

    function renderNote() {
        const latest = latestUpdate(projects());
        let note = document.getElementById('projects-data-freshness');
        if (!latest) {
            note?.remove();
            return;
        }
        if (!note) {
            note = document.createElement('p');
            note.id = 'projects-data-freshness';
            note.className = 'card-source projects-data-freshness';
            container?.before(note);
        }
        note.replaceChildren(
            bilingual(
                `Projektdaten zuletzt aktualisiert: ${formatDate(latest, 'de')}`,
                `Project data last updated: ${formatDate(latest, 'en')}`
            )
        );
    }

    /** Adds the "updated" line to every rendered card that does not have one yet. */
    function decorateCards() {
        const now = new Date();
        for (const card of container?.querySelectorAll('.project-card[data-repo-name]') ?? []) {
            if (card.querySelector('.project-updated')) continue;
            const project = projects().find((entry) => entry.repoName === card.getAttribute('data-repo-name'));
            const { level, days, date } = describeFreshness(project?.updatedAt, now);
            if (!date) continue;

            const line = document.createElement('p');
            line.className = `card-source project-updated project-updated-${level}`;
            line.appendChild(
                bilingual(
                    `Stand: ${formatDate(date, 'de')} (${formatAge(days, 'de')})${level === 'stale' ? ' – evtl. veraltet' : ''}`,
                    `Updated: ${formatDate(date, 'en')} (${formatAge(days, 'en')})${level === 'stale' ? ' – may be outdated' : ''}`
                )
            );
            const buttons = card.querySelector('.project-buttons');
            if (buttons) buttons.before(line);
            else card.appendChild(line);
        }
    }

    renderNote();
    decorateCards();
    // Filtering, sorting and paging replace the cards wholesale; the observer only watches the
    // container's direct children, so adding the line to a card does not trigger it again.
    new MutationObserver(decorateCards).observe(container, { childList: true });
}
