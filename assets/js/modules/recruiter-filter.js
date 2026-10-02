/**
 * Recruiter Filter Module
 * Dynamically switches target role and focus skills in the Steckbrief card based on selected profile.
 */
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

const GITHUB_CACHE_DURATION = 3600000; // 1 hour; cache shared with projekt-detail.js

/**
 * The public repositories of the portfolio owner, from the cache projekt-detail.js also
 * uses or from the GitHub API (unauthenticated: 60 requests per hour and IP).
 * @returns {Promise<Array<{name: string, html_url: string, pushed_at: string, fork?: boolean}>>}
 */
async function loadPublicRepos() {
    const cachedTime = parseInt(AppStorage.getItem(STORAGE_KEYS.GITHUB_PROJECTS_CACHE_TIME) || '0', 10);
    if (Date.now() - cachedTime < GITHUB_CACHE_DURATION) {
        try {
            const cached = JSON.parse(AppStorage.getItem(STORAGE_KEYS.GITHUB_PROJECTS_CACHE) || '[]');
            if (Array.isArray(cached) && cached.length > 0) return cached;
        } catch (_e) {
            // Damaged cache entry: fall through to the network.
        }
    }
    const response = await fetch(`https://api.github.com/users/${APP.GITHUB_USERNAME}/repos?per_page=100`);
    if (!response.ok) throw new Error(`GitHub API responded with ${response.status}`);
    const repos = await response.json();
    AppStorage.setItem(STORAGE_KEYS.GITHUB_PROJECTS_CACHE, JSON.stringify(repos));
    AppStorage.setItem(STORAGE_KEYS.GITHUB_PROJECTS_CACHE_TIME, Date.now().toString());
    return repos;
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

    const render = (repos) => {
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
