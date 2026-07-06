/**
 * Skills Matrix JavaScript Logic
 * Renders SVG Radar Chart dynamically and manages filtering of skill detail cards.
 */

const SKILLS_DATA = [
    // Frontend
    {
        name: "HTML5 / CSS3",
        score: 90,
        category: "frontend",
        descDe: "Semantisches HTML, CSS-Layouts (Flexbox, Grid), responsive Anpassungen und BFW-barrierefreie Designs.",
        descEn: "Semantic HTML, CSS layouts (Flexbox, Grid), responsive design, and accessible markup.",
        refLink: "playground.html",
        refTextDe: "Im Code Playground testen",
        refTextEn: "Test in Code Playground"
    },
    {
        name: "JavaScript (ES6+)",
        score: 85,
        category: "frontend",
        descDe: "Moderne Syntax, Asynchronität (Promises, async/await), DOM-Manipulation und Event-Handling.",
        descEn: "Modern ES6+ syntax, asynchronous programming (Promises, async/await), DOM and Event APIs.",
        refLink: "playground.html",
        refTextDe: "Im Code Playground testen",
        refTextEn: "Test in Code Playground"
    },
    {
        name: "TypeScript",
        score: 75,
        category: "frontend",
        descDe: "Statische Typisierung, Interfaces, Generics und sichere Datenstrukturen in App-Projekten.",
        descEn: "Static typing, Interfaces, Generics, and robust data structures in application projects.",
        refLink: "playground.html",
        refTextDe: "TypeScript ansehen",
        refTextEn: "View TypeScript"
    },
    {
        name: "Lit (Web Components)",
        score: 80,
        category: "frontend",
        descDe: "Erstellung modularer, reaktiver Web Components im Entwicklerteam der DFG.",
        descEn: "Creating modular, reactive Web Components within the DFG web development team.",
        refLink: "praktikumsbetrieb.html",
        refTextDe: "Praktikums-Details ansehen",
        refTextEn: "View Internship Details"
    },
    {
        name: "Apache Cordova",
        score: 70,
        category: "frontend",
        descDe: "Kompilierung von Webanwendungen in native Hybrid-Apps für Android und iOS.",
        descEn: "Compiling web applications into native hybrid apps for Android and iOS.",
        refLink: "praktikumsbetrieb.html",
        refTextDe: "EcoChef App ansehen",
        refTextEn: "View EcoChef App"
    },
    // Backend
    {
        name: "Java SE",
        score: 75,
        category: "backend",
        descDe: "Objektorientierung (OOP), Datenstrukturen, Unit-Testing (JUnit) und IHK-Kernkompetenzen.",
        descEn: "Object-oriented programming (OOP), standard data structures, unit testing, and core IHK modules.",
        refLink: "flashcards.html",
        refTextDe: "Mit Lernkarten üben",
        refTextEn: "Practice with Flashcards"
    },
    {
        name: "C# / .NET",
        score: 65,
        category: "backend",
        descDe: "Grundlagen der C#-Entwicklung, Klassenhierarchien und OOP-Paradigmen.",
        descEn: "Basics of C# development, class hierarchies, and OOP paradigms.",
        refLink: "flashcards.html",
        refTextDe: "Mit Lernkarten üben",
        refTextEn: "Practice with Flashcards"
    },
    {
        name: "SQL (PostgreSQL)",
        score: 80,
        category: "backend",
        descDe: "Relationale Schemata, JOINs, Indexierung, Unterabfragen und referenzielle Integrität.",
        descEn: "Relational schemas, JOIN queries, indexing, subqueries, and referential integrity.",
        refLink: "flashcards.html",
        refTextDe: "SQL Lernkarten ansehen",
        refTextEn: "View SQL Flashcards"
    },
    {
        name: "REST APIs",
        score: 85,
        category: "backend",
        descDe: "Integration, Entwurf und Konsumierung von RESTful Web Services via JSON.",
        descEn: "Integration, design, and consumption of RESTful Web Services via JSON.",
        refLink: "playground.html",
        refTextDe: "API Fetcher testen",
        refTextEn: "Test API Fetcher"
    },
    // Tools
    {
        name: "Git / GitHub",
        score: 85,
        category: "tools",
        descDe: "Versionsverwaltung, Branching (Gitflow), Pull Requests und CI/CD-Workflows.",
        descEn: "Version control, branching (Gitflow), pull requests, and CI/CD pipelines.",
        refLink: "dashboard.html",
        refTextDe: "GitHub Grid ansehen",
        refTextEn: "View GitHub Grid"
    },
    {
        name: "npm / Webpack Basics",
        score: 70,
        category: "tools",
        descDe: "Paketmanagement, Script-Automatisierung und Asset-Bundling.",
        descEn: "Package management, scripting automation, and asset bundling.",
        refLink: "playground.html",
        refTextDe: "Code Playground ansehen",
        refTextEn: "View Code Playground"
    },
    {
        name: "Docker Basics",
        score: 60,
        category: "tools",
        descDe: "Grundwissen zur Containerisierung lokaler Entwicklungsumgebungen.",
        descEn: "Basic knowledge of containerizing local development environments.",
        refLink: "architecture.html",
        refTextDe: "Architektur ansehen",
        refTextEn: "View Architecture"
    },
    // Electronics
    {
        name: "SPS / PLC (TIA-Portal)",
        score: 70,
        category: "electronics",
        descDe: "Programmierung von Industriesteuerungen (FUP, KOP, Grafcet) für Betriebstechnik.",
        descEn: "Programming industrial controllers (FBD, LD, Grafcet) for electrical engineering.",
        refLink: "playground.html",
        refTextDe: "SPS-Simulator starten",
        refTextEn: "Start PLC Simulator"
    },
    {
        name: "DGUV Vorschrift 3",
        score: 85,
        category: "electronics",
        descDe: "Sicherheitsprüfung ortsveränderlicher elektrischer Betriebsmittel gemäß Unfallverhütungsvorschrift.",
        descEn: "Safety inspection of mobile electrical devices in compliance with accident prevention regulations.",
        refLink: "praktikumsbetrieb.html",
        refTextDe: "Mängelscanner starten",
        refTextEn: "Start Defect Scanner"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.skills-tab');
    const svgEl = document.getElementById('skills-radar-svg');
    const listGrid = document.getElementById('skills-list-grid');

    if (!svgEl || !listGrid) return;

    let activeCategory = 'all';

    // Radarchart Constants
    const cx = 160;
    const cy = 160;
    const maxRadius = 100;

    // Representative skills for 'all' mode to keep chart clean (max 6 axes)
    const repsForAll = [
        "HTML5 / CSS3",
        "JavaScript (ES6+)",
        "REST APIs",
        "SQL (PostgreSQL)",
        "Git / GitHub",
        "DGUV Vorschrift 3"
    ];

    function getFilteredRadarSkills() {
        if (activeCategory === 'all') {
            return SKILLS_DATA.filter(s => repsForAll.includes(s.name));
        }
        return SKILLS_DATA.filter(s => s.category === activeCategory);
    }

    function renderRadarChart() {
        const skills = getFilteredRadarSkills();
        const N = skills.length;
        const lang = document.documentElement.getAttribute('lang') || 'de';

        // Clear previous paths
        svgEl.innerHTML = '';

        // 1. Draw grid circles (concentric webs)
        const levels = [25, 50, 75, 100];
        levels.forEach(level => {
            const rad = maxRadius * (level / 100);
            const points = [];
            for (let i = 0; i < N; i++) {
                const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
                const px = cx + rad * Math.cos(angle);
                const py = cy + rad * Math.sin(angle);
                points.push(`${px},${py}`);
            }
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', points.join(' '));
            polygon.setAttribute('class', 'grid-line');
            svgEl.appendChild(polygon);
        });

        // 2. Draw axis lines and text labels
        skills.forEach((s, i) => {
            const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
            const targetX = cx + maxRadius * Math.cos(angle);
            const targetY = cy + maxRadius * Math.sin(angle);

            // Line
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', cx);
            line.setAttribute('y1', cy);
            line.setAttribute('x2', targetX);
            line.setAttribute('y2', targetY);
            line.setAttribute('class', 'axis-line');
            svgEl.appendChild(line);

            // Label coordinates offset
            const labelDist = maxRadius + 18;
            const lx = cx + labelDist * Math.cos(angle);
            let ly = cy + labelDist * Math.sin(angle);

            // Vertical adjustment
            if (Math.sin(angle) > 0.5) ly += 5;
            if (Math.sin(angle) < -0.5) ly -= 2;

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', lx);
            text.setAttribute('y', ly);
            text.setAttribute('class', 'axis-label');
            
            // Adjust anchor based on side
            if (Math.cos(angle) > 0.1) {
                text.setAttribute('text-anchor', 'start');
            } else if (Math.cos(angle) < -0.1) {
                text.setAttribute('text-anchor', 'end');
            } else {
                text.setAttribute('text-anchor', 'middle');
            }

            text.textContent = s.name;
            svgEl.appendChild(text);
        });

        // 3. Draw score polygon path
        const polyPoints = [];
        skills.forEach((s, i) => {
            const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
            const scoreRad = maxRadius * (s.score / 100);
            const px = cx + scoreRad * Math.cos(angle);
            const py = cy + scoreRad * Math.sin(angle);
            polyPoints.push(`${px},${py}`);
        });

        const radarPoly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        radarPoly.setAttribute('points', polyPoints.join(' '));
        radarPoly.setAttribute('class', 'radar-poly');
        svgEl.appendChild(radarPoly);

        // 4. Draw interactive circles (dots) on each vertex
        skills.forEach((s, i) => {
            const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
            const scoreRad = maxRadius * (s.score / 100);
            const px = cx + scoreRad * Math.cos(angle);
            const py = cy + scoreRad * Math.sin(angle);

            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('cx', px);
            dot.setAttribute('cy', py);
            dot.setAttribute('r', '4');
            dot.setAttribute('class', 'radar-dot');

            // Interactive Tooltip Title
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = `${s.name}: ${s.score}%`;
            dot.appendChild(title);

            svgEl.appendChild(dot);
        });
    }

    function renderDetailsGrid() {
        const lang = document.documentElement.getAttribute('lang') || 'de';
        // Get ALL skills of this category (not just the representatives)
        let filteredSkills = [];
        if (activeCategory === 'all') {
            filteredSkills = [...SKILLS_DATA];
        } else {
            filteredSkills = SKILLS_DATA.filter(s => s.category === activeCategory);
        }

        listGrid.innerHTML = filteredSkills.map(s => `
            <div class="skill-matrix-card">
                <div class="skill-card-header">
                    <span class="skill-card-name">${s.name}</span>
                    <span class="skill-card-badge">${s.score}%</span>
                </div>
                <div class="skill-track" style="height:6px; background:var(--border); border-radius:3px; overflow:hidden; position:relative;">
                    <div class="skill-fill" data-width="${s.score}%" style="width:0%; background:var(--primary); height:100%; transition:width 1s cubic-bezier(0.4, 0, 0.2, 1);"></div>
                </div>
                <div class="skill-card-desc">${lang === 'de' ? s.descDe : s.descEn}</div>
                <div class="skill-card-footer">
                    <a href="${s.refLink}" class="skill-card-link">
                        <i class="fa-solid fa-square-arrow-up-right"></i>
                        <span>${lang === 'de' ? s.refTextDe : s.refTextEn}</span>
                    </a>
                </div>
            </div>
        `).join('');

        // Trigger transition width after rendering
        setTimeout(() => {
            const fills = listGrid.querySelectorAll('.skill-fill');
            fills.forEach(fill => {
                fill.style.width = fill.getAttribute('data-width');
            });
        }, 50);
    }

    // Bind click events on filter tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelector('.skills-tab.active').classList.remove('active');
            tab.classList.add('active');
            activeCategory = tab.getAttribute('data-cat');
            
            renderRadarChart();
            renderDetailsGrid();

            // Dynamic commit grid tick (Punkte sammeln!)
            if (typeof window.addLiveCommit === 'function') {
                window.addLiveCommit();
            }
        });
    });

    // Listen for language changes to update labels/descriptions
    document.addEventListener('langchange', () => {
        renderRadarChart();
        renderDetailsGrid();
    });

    // Initial render
    renderRadarChart();
    renderDetailsGrid();
});
