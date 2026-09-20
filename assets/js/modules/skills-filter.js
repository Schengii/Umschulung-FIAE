/**
 * @file skills-filter.js
 * @description Pure filter/sort logic for the skills matrix (radar + list view)
 * used by skills_matrix.js. Kept dependency-free (no DOM) so it can be unit-tested directly.
 */

/** Skills shown for the radar chart's 'all' category (kept to max 6 axes). */
export function filterRadarSkills(skills, category, repsForAll) {
    if (category === 'all') {
        return skills.filter((s) => repsForAll.includes(s.name));
    }
    return skills.filter((s) => s.category === category);
}

/** Skills shown in the list view for a given category tab. */
export function filterListSkills(skills, category) {
    if (category === 'all') return [...skills];
    return skills.filter((s) => s.category === category);
}

/** Sorts a skills list by the given sort mode ('alpha'|'level-desc'|'level-asc'|'default'). */
export function sortSkills(skills, mode) {
    const sorted = [...skills];
    if (mode === 'alpha') {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (mode === 'level-desc') {
        sorted.sort((a, b) => b.score - a.score);
    } else if (mode === 'level-asc') {
        sorted.sort((a, b) => a.score - b.score);
    }
    return sorted;
}
