/**
 * Recruiter Filter Module
 * Dynamically switches target role and focus skills in the Steckbrief card based on selected profile.
 */
import { loadLocalRepos } from './project-detail-logic.js';

export function initRecruiterFilter() {
    const filterButtons = document.querySelectorAll('.role-filter-container .btn-filter');
    const positionCell = document.getElementById('steckbrief-position');
    const schwerpunkteCell = document.getElementById('steckbrief-schwerpunkte');

    if (!filterButtons.length || !positionCell || !schwerpunkteCell) return;

    filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach((b) => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const role = btn.getAttribute('data-role');
            const lang = document.documentElement.getAttribute('lang') || 'de';

            if (role === 'frontend') {
                positionCell.innerHTML =
                    lang === 'de' ? 'Frontend-Entwickler / Web-Entwickler' : 'Frontend Developer / Web Developer';
                schwerpunkteCell.innerHTML = `<strong>React</strong>, <strong>TypeScript</strong>, HTML5, CSS3`;
            } else if (role === 'backend') {
                positionCell.innerHTML =
                    lang === 'de' ? 'Backend-Entwickler / Java-Spezialist' : 'Backend Developer / Java Specialist';
                schwerpunkteCell.innerHTML = `<strong>Java SE</strong>, <strong>Spring Boot</strong>, <strong>SQL</strong>, REST-APIs`;
            } else {
                // 'all' / default
                positionCell.innerHTML = 'Junior Software Developer / Web Developer';
                schwerpunkteCell.innerHTML = 'React, TypeScript, Java SE, SQL';
            }
        });
    });

    // Re-trigger layout on language change
    document.addEventListener('langchange', () => {
        const activeBtn = /** @type {HTMLElement} */ (
            document.querySelector('.role-filter-container .btn-filter.active')
        );
        if (activeBtn) activeBtn.click();
    });

    renderGitActivity();
}

/**
 * The public repositories of the portfolio owner, from the local data file the daily sync
 * keeps current (no request to api.github.com, see loadLocalRepos).
 * @returns {Promise<Array<Record<string, any>>>}
 */
function loadPublicRepos() {
    return loadLocalRepos((window.resolveAssetPath || ((p) => p))('assets/data/github-repos.json'));
}

/**
 * "Recent code activity": the most recently pushed public repositories. This used to request
 * the commits of the portfolio repository itself, which is private (always 404), and then
 * showed invented commits with relative dates as if they were live data. Now it shows real
 * data or says plainly that none could be loaded.
 */
function renderGitActivity() {
    const listElement = document.getElementById('live-git-list');
    if (!listElement) return;

    const lang = () => (document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'de');
    const profileUrl = `https://github.com/${APP.GITHUB_USERNAME}`;

    const item = () => {
        const li = document.createElement('li');
        li.className = 'git-activity-item';
        return li;
    };

    const render = (/** @type {Array<Record<string, any>>} */ repos) => {
        const recent = repos
            .filter((repo) => !repo.fork && repo.pushed_at)
            .sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at))
            .slice(0, 4);
        if (recent.length === 0) throw new Error('no public repositories');

        listElement.replaceChildren(
            ...recent.map((repo) => {
                const li = item();
                const link = document.createElement('a');
                link.href = repo.html_url;
                link.target = '_blank';
                link.rel = 'noopener';
                link.className = 'git-activity-repo';
                link.textContent = repo.name;
                const date = document.createElement('div');
                date.className = 'git-activity-date';
                const formatted = new Date(repo.pushed_at).toLocaleDateString(lang() === 'en' ? 'en-GB' : 'de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                });
                date.textContent = (lang() === 'en' ? 'Last push: ' : 'Letzter Push: ') + formatted;
                li.append(link, date);
                return li;
            })
        );
    };

    const renderUnavailable = () => {
        const li = item();
        const text = document.createElement('span');
        text.textContent =
            lang() === 'en'
                ? 'GitHub activity cannot be loaded right now. '
                : 'Die GitHub-Aktivität kann gerade nicht geladen werden. ';
        const link = document.createElement('a');
        link.href = profileUrl;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = lang() === 'en' ? 'Open GitHub profile' : 'GitHub-Profil öffnen';
        li.append(text, link);
        listElement.replaceChildren(li);
    };

    /** @type {Array<Record<string, any>> | null} */
    let lastRepos = null;
    const update = () => (lastRepos ? render(lastRepos) : renderUnavailable());

    loadPublicRepos()
        .then((repos) => {
            lastRepos = repos;
            render(repos);
        })
        .catch(() => {
            lastRepos = null;
            renderUnavailable();
        });

    // Dates and labels are language-dependent.
    document.addEventListener('langchange', () => {
        try {
            update();
        } catch (_e) {
            renderUnavailable();
        }
    });
}
