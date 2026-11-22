/**
 * @file project-detail-logic.js
 * @description DOM-free logic of projekt-detail.html: merging projects.json with the GitHub API
 * response, finding the requested project, related projects and the URL/colour guards for the
 * values that go into the page. The API data is free text (topics, homepage), so nothing from it
 * may reach `innerHTML` or an `href` unchecked.
 */

import { escapeHtml } from './html-utils.js';

/** @typedef {Record<string, any>} ProjectDetailData */

/**
 * URL for an href/src, already escaped: http(s) and relative paths only, so a `javascript:` or
 * `data:` link cannot end up in the page. '' when rejected.
 * @param {unknown} value
 */
export function safeUrl(value) {
    const url = String(value ?? '').trim();
    if (!url) return '';
    // Browsers ignore tabs and newlines inside a scheme ("java\tscript:"), so strip them first.
    const scheme = url.replace(/[\t\n\r]/g, '').match(/^([a-z][a-z0-9+.-]*):/i);
    if (scheme && !['http', 'https'].includes(scheme[1].toLowerCase())) return '';
    return escapeHtml(url);
}

/**
 * CSS colour of a badge: a hex colour, otherwise the accent colour.
 * @param {unknown} value
 */
export const safeColor = (value) => (/^#[0-9a-f]{3,8}$/i.test(String(value)) ? String(value) : 'var(--primary)');

/**
 * Die öffentlichen GitHub-Repositories aus der lokalen Datei assets/data/github-repos.json
 * (täglich per Sync aktualisiert, scripts/fetch_github_repos.js). Es gibt keinen Aufruf an
 * api.github.com mehr, die Besucher-IP geht also nicht an GitHub. Ohne Datei: leere Liste.
 * @param {string} url
 * @param {typeof fetch} [fetchFn]
 * @returns {Promise<Array<Record<string, any>>>}
 */
export async function loadLocalRepos(url, fetchFn = fetch) {
    try {
        const response = await fetchFn(url);
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (_e) {
        return [];
    }
}

/**
 * projects.json enriched with stars, GitHub URL, update date, topics and homepage.
 * @param {ProjectDetailData[]} staticProjects
 * @param {ProjectDetailData[]} githubRepos
 * @returns {ProjectDetailData[]}
 */
export function mergeProjects(staticProjects, githubRepos) {
    const repoMap = new Map(
        githubRepos
            .filter((repo) => repo && typeof repo.name === 'string')
            .map((repo) => [repo.name.toLowerCase(), repo])
    );
    return staticProjects.map((project) => {
        const enriched = { ...project };
        if (!enriched.repoName) return enriched;
        const repo = repoMap.get(String(enriched.repoName).toLowerCase());
        if (!repo) return enriched;
        enriched.stars = repo.stargazers_count || 0;
        enriched.githubUrl = repo.html_url;
        enriched.updatedAt = repo.updated_at;
        const topics = Array.isArray(repo.topics) ? repo.topics.map(String) : [];
        enriched.tags = [...new Set([...(enriched.tags || []), ...topics])];
        if (typeof repo.homepage === 'string' && repo.homepage.trim() !== '') enriched.link = repo.homepage;
        return enriched;
    });
}

/**
 * The project named by `?repo=` or `?title=`.
 * @param {ProjectDetailData[]} projects
 * @param {string | null} repo
 * @param {string | null} title
 */
export function findProject(projects, repo, title) {
    return projects.find((p) => (repo && p.repoName === repo) || (title && p.titleDe === title));
}

/**
 * The project with its link dropped when the scheme is not http(s); the buttons and the demo
 * iframe use `link` directly.
 * @param {ProjectDetailData} project
 * @returns {ProjectDetailData}
 */
export const withSafeLink = (project) => ({ ...project, link: safeUrl(project.link) ? project.link : '' });

/**
 * Up to `limit` other projects, ordered by the number of shared tags (case-insensitive).
 * @param {ProjectDetailData} current
 * @param {ProjectDetailData[]} projects
 * @param {number} [limit]
 */
export function relatedProjects(current, projects, limit = 3) {
    /** @param {ProjectDetailData} project */
    const tagsOf = (project) => new Set((project.tags || []).map((/** @type {string} */ t) => String(t).toLowerCase()));
    const currentTags = tagsOf(current);
    const currentId = current.repoName || current.titleDe;
    return projects
        .filter((p) => (p.repoName || p.titleDe) !== currentId)
        .map((project) => {
            const other = tagsOf(project);
            return { project, score: [...currentTags].filter((tag) => other.has(tag)).length };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => item.project);
}

/**
 * File name of the generated static project page (same rule as scripts/generate_project_pages.js, ADR 0018).
 * @param {string} repoName
 */
export const projectPageName = (repoName) =>
    `projekt-${repoName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')}.html`;

/**
 * Link to the detail page of a project.
 * @param {ProjectDetailData} project
 */
export const detailUrl = (project) =>
    project.repoName
        ? projectPageName(project.repoName)
        : `projekt-detail.html?title=${encodeURIComponent(project.titleDe)}`;
