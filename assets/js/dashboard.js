/**
 * Dashboard — Stats, Projektübersicht, interaktive Widgets
 * Wird von dashboard.html geladen.
 */
document.addEventListener('DOMContentLoaded', () => {
    renderStats();
    renderProjectCount();
    renderRecentProjects();
});

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
                <div style="font-size:2rem; font-weight:700; color:var(--primary);">2</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">${lang === 'de' ? 'Mini-Games' : 'Mini Games'}</div>
            </div>
            <div class="stat-box" style="text-align:center; padding:1rem; background:var(--bg-page); border-radius:var(--radius-md); border:1px solid var(--border);">
                <div style="font-size:2rem; font-weight:700; color:var(--primary);">${StorageManager.getItem('username') ? '👤' : '—'}</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">${lang === 'de' ? 'Profil' : 'Profile'}</div>
            </div>
        </div>
    `;
    container.after(statsCard);
}

function renderProjectCount() {
    fetch('assets/data/projects.json')
        .then(r => r.json())
        .then(projects => {
            const el = document.getElementById('stat-projects');
            if (el) el.textContent = projects.length;
        })
        .catch(() => {});
}

function renderRecentProjects() {
    const container = document.querySelector('.left-col .card');
    if (!container) return;

    fetch('assets/data/projects.json')
        .then(r => r.json())
        .then(projects => {
            const lang = document.documentElement.getAttribute('lang') || 'de';
            const recent = projects.slice(-3).reverse();

            const card = document.createElement('div');
            card.className = 'card fade-in visible';

            card.innerHTML = `
                <h3>${lang === 'de' ? '📁 Letzte Projekte' : '📁 Recent Projects'}</h3>
                <ul style="list-style:none; padding:0; margin-top:1rem;">
                    ${recent.map(p => `
                        <li style="padding:0.75rem; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-weight:600;">${p.title}</span>
                            <a href="${p.link}" style="font-size:0.85rem;">
                                ${lang === 'de' ? 'Öffnen →' : 'Open →'}
                            </a>
                        </li>
                    `).join('')}
                </ul>
            `;

            container.after(card);
        })
        .catch(() => {});
}
