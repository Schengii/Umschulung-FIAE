/**
 * Schreibt die öffentlichen Repositories des Portfolio-Eigentümers nach
 * assets/data/github-repos.json.
 *
 * Die Seiten lesen nur noch diese Datei, statt zur Laufzeit api.github.com anzufragen
 * (Datenschutz: keine IP-Übermittlung an GitHub beim Seitenaufruf, kein Rate-Limit,
 * funktioniert offline). Aktualisiert wird sie im täglichen Sync (.github/workflows/sync.yml).
 * Schlägt der Abruf fehl, bleibt die vorhandene Datei unverändert und das Skript endet
 * ohne Fehlercode, damit ein GitHub-Ausfall den Sync nicht blockiert.
 *
 * Aufruf: node scripts/fetch_github_repos.js   (GITHUB_TOKEN optional, erhöht das Rate-Limit)
 */
const fs = require('fs');
const path = require('path');

const USERNAME = 'Schengii';
const OUTPUT = path.join(__dirname, '..', 'assets', 'data', 'github-repos.json');

/**
 * Nur die Felder, die die Seiten wirklich nutzen; hält die Datei klein und die Diffs ruhig.
 * @param {Record<string, any>} repo
 */
function pickRepoFields(repo) {
    return {
        name: String(repo.name),
        html_url: String(repo.html_url),
        homepage: typeof repo.homepage === 'string' ? repo.homepage : '',
        topics: Array.isArray(repo.topics) ? repo.topics.map(String).sort() : [],
        stargazers_count: Number(repo.stargazers_count) || 0,
        pushed_at: repo.pushed_at || null,
        updated_at: repo.updated_at || null,
        fork: Boolean(repo.fork),
    };
}

/**
 * Reduzierte, nach Name sortierte Liste ohne Archivierte und ohne Forks-Details.
 * @param {Array<Record<string, any>>} repos
 */
function normalizeRepos(repos) {
    return repos
        .filter((repo) => repo && typeof repo.name === 'string' && !repo.archived)
        .map(pickRepoFields)
        .sort((a, b) => a.name.localeCompare(b.name));
}

async function main() {
    /** @type {Record<string, string>} */
    const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-repo-sync' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    try {
        const response = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`, { headers });
        if (!response.ok) throw new Error(`GitHub API antwortete mit ${response.status}`);
        const repos = normalizeRepos(await response.json());
        if (repos.length === 0) throw new Error('Keine öffentlichen Repositories erhalten');
        fs.writeFileSync(OUTPUT, JSON.stringify(repos, null, 4) + '\n');
        console.log(`✓ ${repos.length} Repositories nach assets/data/github-repos.json geschrieben.`);
    } catch (error) {
        console.warn(`⚠ GitHub-Repositories nicht aktualisiert (${error.message}); vorhandene Datei bleibt.`);
    }
}

module.exports = { pickRepoFields, normalizeRepos };

if (require.main === module) main();
