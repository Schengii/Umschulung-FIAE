/**
 * Recruiter Filter Module
 * Dynamically switches target role and focus skills in the Steckbrief card based on selected profile.
 */
export function initRecruiterFilter() {
    const filterButtons = document.querySelectorAll('.role-filter-container .btn-filter');
    const positionCell = document.getElementById('steckbrief-position');
    const schwerpunkteCell = document.getElementById('steckbrief-schwerpunkte');

    if (!filterButtons.length || !positionCell || !schwerpunkteCell) return;

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const role = btn.getAttribute('data-role');
            const lang = document.documentElement.getAttribute('lang') || 'de';

            if (role === 'frontend') {
                positionCell.innerHTML = lang === 'de' 
                    ? 'Frontend-Entwickler / Web-Entwickler' 
                    : 'Frontend Developer / Web Developer';
                schwerpunkteCell.innerHTML = `<strong>React</strong>, <strong>TypeScript</strong>, HTML5, CSS3`;
            } else if (role === 'backend') {
                positionCell.innerHTML = lang === 'de' 
                    ? 'Backend-Entwickler / Java-Spezialist' 
                    : 'Backend Developer / Java Specialist';
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
        const activeBtn = document.querySelector('.role-filter-container .btn-filter.active');
        if (activeBtn) activeBtn.click();
    });

    renderGitActivity();
}

function renderGitActivity() {
    const listElement = document.getElementById('live-git-list');
    if (!listElement) return;

    const mockCommits = [
        { message: "feat: add recruiter role filter to home", date: "Just now" },
        { message: "refactor: optimize PWA service worker caching", date: "1 day ago" },
        { message: "docs: update API documentation for EcoChef capstone project", date: "3 days ago" },
        { message: "fix: resolve memory leaks in 2D strategy game loop", date: "5 days ago" }
    ];

    fetch('https://api.github.com/repos/Schengii/Umschulung-FIAE/commits?per_page=4')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch from GitHub API');
            return response.json();
        })
        .then(data => {
            listElement.innerHTML = '';
            data.forEach(item => {
                const li = document.createElement('li');
                li.style.marginBottom = '8px';
                li.style.paddingBottom = '8px';
                li.style.borderBottom = '1px dashed var(--border)';
                
                const dateObj = new Date(item.commit.author.date);
                const formattedDate = dateObj.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });

                li.innerHTML = `
                    <div style="font-weight: 600; color: var(--primary);">${escapeHTML(item.commit.message.split('\n')[0])}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${formattedDate}</div>
                `;
                listElement.appendChild(li);
            });
        })
        .catch(() => {
            // Fallback to mock data if API limits are hit or offline
            listElement.innerHTML = '';
            mockCommits.forEach(item => {
                const li = document.createElement('li');
                li.style.marginBottom = '8px';
                li.style.paddingBottom = '8px';
                li.style.borderBottom = '1px dashed var(--border)';
                li.innerHTML = `
                    <div style="font-weight: 600; color: var(--primary);">${item.message}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${item.date}</div>
                `;
                listElement.appendChild(li);
            });
        });
}

function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
