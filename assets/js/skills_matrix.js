/**
 * Skills Matrix JavaScript Logic
 * Renders SVG Radar Chart dynamically and manages filtering of skill detail cards.
 */
import { filterRadarSkills, filterListSkills, sortSkills } from './modules/skills-filter.js';

/** Drei Stufen statt selbst vergebener Prozentwerte; jede Stufe wird durch Projekte belegt. */
/** @type {Record<number, {de: string, en: string}>} */
const LEVELS = {
    1: { de: 'Grundkenntnisse', en: 'Basic knowledge' },
    2: { de: 'Fortgeschritten', en: 'Intermediate' },
    3: { de: 'Sicher im Einsatz', en: 'Confident in use' },
};
const MAX_LEVEL = 3;

/** @type {{name: string, level: number, proofs: [string, string][], category: string, descDe: string, descEn: string, refLink: string, refTextDe: string, refTextEn: string}[]} */
const SKILLS_DATA = [
    // Frontend
    {
        name: 'HTML5 / CSS3',
        level: 3,
        proofs: [
            ['projekt-manufaktur.html', 'ManuFAKTUR'],
            ['projekt-umschulung-fiae.html', 'Dieses Portfolio'],
        ],
        category: 'frontend',
        descDe: 'Semantisches HTML, CSS-Layouts (Flexbox, Grid), responsive Anpassungen und BFW-barrierefreie Designs.',
        descEn: 'Semantic HTML, CSS layouts (Flexbox, Grid), responsive design, and accessible markup.',
        refLink: 'portfolio.html',
        refTextDe: 'Projekte ansehen',
        refTextEn: 'View projects',
    },
    {
        name: 'JavaScript (ES6+)',
        level: 3,
        proofs: [
            ['projekt-umschulung-fiae.html', 'Dieses Portfolio'],
            ['projekt-manufaktur.html', 'ManuFAKTUR'],
        ],
        category: 'frontend',
        descDe: 'Moderne Syntax, Asynchronität (Promises, async/await), DOM-Manipulation und Event-Handling.',
        descEn: 'Modern ES6+ syntax, asynchronous programming (Promises, async/await), DOM and Event APIs.',
        refLink: 'portfolio.html',
        refTextDe: 'Projekte ansehen',
        refTextEn: 'View projects',
    },
    {
        name: 'TypeScript',
        level: 2,
        proofs: [
            ['projekt-amazon-2-0.html', 'Amazon 2.0'],
            ['projekt-finanzenportfolio.html', 'Finanzportfolio'],
            ['projekt-informatik-lernen.html', 'Informatik-Lernen'],
        ],
        category: 'frontend',
        descDe: 'Statische Typisierung, Interfaces, Generics und sichere Datenstrukturen in App-Projekten.',
        descEn: 'Static typing, Interfaces, Generics, and robust data structures in application projects.',
        refLink: 'portfolio.html',
        refTextDe: 'Projekte ansehen',
        refTextEn: 'View projects',
    },
    {
        name: 'React 19 & Vite',
        level: 3,
        proofs: [
            ['projekt-finanzenportfolio.html', 'Finanzportfolio'],
            ['projekt-elektrocheck-ai.html', 'ElektroCheck AI'],
            ['projekt-informatik-lernen.html', 'Informatik-Lernen'],
        ],
        category: 'frontend',
        descDe: 'Moderne SPA-Architekturen, Hooks, Zustand-Store, reaktive Datenflüsse und Vite Tooling.',
        descEn: 'Modern SPA architectures, Hooks, Zustand store, reactive state flows, and Vite tooling.',
        refLink: 'portfolio.html',
        refTextDe: 'React-Projekte ansehen',
        refTextEn: 'View React Projects',
    },
    {
        name: 'Lit (Web Components)',
        level: 3,
        proofs: [['projekt-ecochef.html', 'EcoChef']],
        category: 'frontend',
        descDe: 'Erstellung modularer, reaktiver Web Components im Entwicklerteam der DFG.',
        descEn: 'Creating modular, reactive Web Components within the DFG web development team.',
        refLink: 'praktikumsbetrieb.html',
        refTextDe: 'Praktikums-Details ansehen',
        refTextEn: 'View Internship Details',
    },
    {
        name: 'Apache Cordova',
        level: 2,
        proofs: [['projekt-ecochef.html', 'EcoChef']],
        category: 'frontend',
        descDe: 'Kompilierung von Webanwendungen in native Hybrid-Apps für Android und iOS.',
        descEn: 'Compiling web applications into native hybrid apps for Android and iOS.',
        refLink: 'praktikumsbetrieb.html',
        refTextDe: 'EcoChef App ansehen',
        refTextEn: 'View EcoChef App',
    },
    // Backend
    {
        name: 'Java SE',
        level: 2,
        proofs: [],
        category: 'backend',
        descDe: 'Objektorientierung (OOP), Datenstrukturen, Unit-Testing (JUnit) und IHK-Kernkompetenzen.',
        descEn: 'Object-oriented programming (OOP), standard data structures, unit testing, and core IHK modules.',
        refLink: 'lebenslauf.html',
        refTextDe: 'Im Lebenslauf ansehen',
        refTextEn: 'View in CV',
    },
    {
        name: 'C# / .NET',
        level: 2,
        proofs: [],
        category: 'backend',
        descDe: 'Grundlagen der C#-Entwicklung, Klassenhierarchien und OOP-Paradigmen.',
        descEn: 'Basics of C# development, class hierarchies, and OOP paradigms.',
        refLink: 'lebenslauf.html',
        refTextDe: 'Im Lebenslauf ansehen',
        refTextEn: 'View in CV',
    },
    {
        name: 'SQL (PostgreSQL)',
        level: 2,
        proofs: [],
        category: 'backend',
        descDe: 'Relationale Schemata, JOINs, Indexierung, Unterabfragen und referenzielle Integrität.',
        descEn: 'Relational schemas, JOIN queries, indexing, subqueries, and referential integrity.',
        refLink: 'portfolio.html',
        refTextDe: 'Projekte ansehen',
        refTextEn: 'View projects',
    },
    {
        name: 'REST APIs',
        level: 3,
        proofs: [
            ['projekt-ecochef.html', 'EcoChef'],
            ['projekt-elektrocheck-ai.html', 'ElektroCheck AI'],
            ['projekt-wohnungssuche-ki.html', 'Wohnungssuche KI'],
        ],
        category: 'backend',
        descDe: 'Integration, Entwurf und Konsumierung von RESTful Web Services via JSON.',
        descEn: 'Integration, design, and consumption of RESTful Web Services via JSON.',
        refLink: 'portfolio.html',
        refTextDe: 'Projekte ansehen',
        refTextEn: 'View projects',
    },
    {
        name: 'C++20 & 3D Engine',
        level: 2,
        proofs: [['projekt-minecraft.html', 'Minecraft C++ Engine']],
        category: 'backend',
        descDe: 'Moderne C++-Standards (C++20), RAII, Smart Pointer, OpenGL 4.5 Grafikpipeline und CMake.',
        descEn: 'Modern C++ standards (C++20), RAII, smart pointers, OpenGL 4.5 graphics pipeline, and CMake.',
        refLink: 'portfolio.html',
        refTextDe: 'Minecraft Engine ansehen',
        refTextEn: 'View Minecraft Engine',
    },
    {
        name: 'Generative KI (Gemini & OpenAI)',
        level: 3,
        proofs: [
            ['projekt-ecochef.html', 'EcoChef'],
            ['projekt-elektrocheck-ai.html', 'ElektroCheck AI'],
            ['projekt-wohnungssuche-ki.html', 'Wohnungssuche KI'],
        ],
        category: 'backend',
        descDe: 'Strukturierte LLM-Prompts, JSON-Schema-Guards, multimodale Einbettung und RAG-Pipelines.',
        descEn: 'Structured LLM prompting, JSON schema guards, multimodal embeddings, and RAG pipelines.',
        refLink: 'portfolio.html',
        refTextDe: 'KI-Projekte ansehen',
        refTextEn: 'View AI Projects',
    },
    // Tools
    {
        name: 'Git / GitHub',
        level: 3,
        proofs: [['projekt-umschulung-fiae.html', 'Dieses Portfolio']],
        category: 'tools',
        descDe: 'Versionsverwaltung, Branching (Gitflow), Pull Requests und CI/CD-Workflows.',
        descEn: 'Version control, branching (Gitflow), pull requests, and CI/CD pipelines.',
        refLink: 'portfolio.html',
        refTextDe: 'Projekte ansehen',
        refTextEn: 'View projects',
    },
    {
        name: 'npm / Webpack Basics',
        level: 2,
        proofs: [
            ['projekt-amazon-2-0.html', 'Amazon 2.0'],
            ['projekt-finanzenportfolio.html', 'Finanzportfolio'],
        ],
        category: 'tools',
        descDe: 'Paketmanagement, Script-Automatisierung und Asset-Bundling.',
        descEn: 'Package management, scripting automation, and asset bundling.',
        refLink: 'portfolio.html',
        refTextDe: 'Projekte ansehen',
        refTextEn: 'View projects',
    },
    {
        name: 'Docker Basics',
        level: 1,
        proofs: [],
        category: 'tools',
        descDe: 'Grundwissen zur Containerisierung lokaler Entwicklungsumgebungen.',
        descEn: 'Basic knowledge of containerizing local development environments.',
        refLink: 'architecture.html',
        refTextDe: 'Architektur ansehen',
        refTextEn: 'View Architecture',
    },
    // Electronics
    {
        name: 'SPS / PLC (TIA-Portal)',
        level: 2,
        proofs: [],
        category: 'electronics',
        descDe: 'Programmierung von Industriesteuerungen (FUP, KOP, Grafcet) für Betriebstechnik.',
        descEn: 'Programming industrial controllers (FBD, LD, Grafcet) for electrical engineering.',
        refLink: 'portfolio.html',
        refTextDe: 'Projekte ansehen',
        refTextEn: 'View projects',
    },
    {
        name: 'DGUV Vorschrift 3',
        level: 3,
        proofs: [],
        category: 'electronics',
        descDe: 'Sicherheitsprüfung ortsveränderlicher elektrischer Betriebsmittel gemäß Unfallverhütungsvorschrift.',
        descEn: 'Safety inspection of mobile electrical devices in compliance with accident prevention regulations.',
        refLink: 'praktikumsbetrieb.html',
        refTextDe: 'Mängelscanner starten',
        refTextEn: 'Start Defect Scanner',
    },
];

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.skills-tab');
    // Der Guard darunter bricht ab, wenn eines fehlt; die Casts gelten damit auch in den Funktionen.
    const svgEl = /** @type {HTMLElement} */ (document.getElementById('skills-radar-svg'));
    const listGrid = /** @type {HTMLElement} */ (document.getElementById('skills-list-grid'));

    if (!svgEl || !listGrid) return;

    let activeCategory = 'all';

    // Radarchart Constants
    const cx = 160;
    const cy = 160;
    const maxRadius = 100;

    // Representative skills for 'all' mode to keep chart clean (max 6 axes)
    const repsForAll = [
        'HTML5 / CSS3',
        'JavaScript (ES6+)',
        'REST APIs',
        'SQL (PostgreSQL)',
        'Git / GitHub',
        'DGUV Vorschrift 3',
    ];

    function getFilteredRadarSkills() {
        return filterRadarSkills(SKILLS_DATA, activeCategory, repsForAll);
    }

    function renderRadarChart() {
        const skills = getFilteredRadarSkills();
        const N = skills.length;

        // Clear previous paths
        svgEl.innerHTML = '';

        // 1. Draw grid circles (concentric webs)
        for (let level = 1; level <= MAX_LEVEL; level++) {
            const rad = maxRadius * (level / MAX_LEVEL);
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
        }

        // 2. Draw axis lines and text labels
        skills.forEach((/** @type {Record<string, any>} */ s, /** @type {number} */ i) => {
            const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
            const targetX = cx + maxRadius * Math.cos(angle);
            const targetY = cy + maxRadius * Math.sin(angle);

            // Line
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', String(cx));
            line.setAttribute('y1', String(cy));
            line.setAttribute('x2', String(targetX));
            line.setAttribute('y2', String(targetY));
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
            text.setAttribute('x', String(lx));
            text.setAttribute('y', String(ly));
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
            text.style.cursor = 'pointer';
            text.setAttribute('title', `Klicken für Portfolio-Filter: ${s.name}`);
            text.addEventListener('click', () => {
                window.location.href = `portfolio.html?search=${encodeURIComponent(s.name.split('/')[0].trim())}`;
            });
            svgEl.appendChild(text);
        });

        // 3. Draw score polygon path
        /** @type {string[]} */
        const polyPoints = [];
        skills.forEach((/** @type {Record<string, any>} */ s, /** @type {number} */ i) => {
            const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
            const scoreRad = maxRadius * (s.level / MAX_LEVEL);
            const px = cx + scoreRad * Math.cos(angle);
            const py = cy + scoreRad * Math.sin(angle);
            polyPoints.push(`${px},${py}`);
        });

        const radarPoly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        radarPoly.setAttribute('points', polyPoints.join(' '));
        radarPoly.setAttribute('class', 'radar-poly');
        svgEl.appendChild(radarPoly);

        // 4. Draw interactive circles (dots) on each vertex
        skills.forEach((/** @type {Record<string, any>} */ s, /** @type {number} */ i) => {
            const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
            const scoreRad = maxRadius * (s.level / MAX_LEVEL);
            const px = cx + scoreRad * Math.cos(angle);
            const py = cy + scoreRad * Math.sin(angle);

            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('cx', String(px));
            dot.setAttribute('cy', String(py));
            dot.setAttribute('r', '5');
            dot.setAttribute('class', 'radar-dot');
            dot.style.cursor = 'pointer';

            // Interactive Tooltip Title & Click Event
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            const radarLang = document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'de';
            title.textContent = `${s.name}: ${LEVELS[s.level][radarLang]}`;
            dot.appendChild(title);

            dot.addEventListener('click', () => {
                window.location.href = `portfolio.html?search=${encodeURIComponent(s.name.split('/')[0].trim())}`;
            });

            svgEl.appendChild(dot);
        });
    }

    function renderDetailsGrid() {
        const lang = document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'de';
        // Get ALL skills of this category (not just the representatives)
        const sortSelect = /** @type {HTMLInputElement} */ (document.getElementById('skills-sort-select'));
        const sortVal = sortSelect ? sortSelect.value : 'default';
        const filteredSkills = sortSkills(filterListSkills(SKILLS_DATA, activeCategory), sortVal);

        listGrid.innerHTML = filteredSkills
            .map(
                (s) => `
            <div class="skill-matrix-card">
                <div class="skill-card-header">
                    <span class="skill-card-name">${s.name}</span>
                    <span class="skill-card-badge">${LEVELS[s.level ?? 1][lang]}</span>
                </div>
                <div class="skill-level" role="img" aria-label="${LEVELS[s.level ?? 1][lang]}">
                    ${[1, 2, 3].map((n) => `<span class="skill-level-step${n <= (s.level ?? 1) ? ' is-on' : ''}"></span>`).join('')}
                </div>
                <div class="skill-card-desc">${lang === 'de' ? s.descDe : s.descEn}</div>
                <div class="skill-card-proof">
                    <span class="skill-card-proof-label">${lang === 'de' ? 'Beleg' : 'Evidence'}:</span>
                    ${
                        s.proofs.length
                            ? s.proofs
                                  .map(
                                      (/** @type {[string, string]} */ [href, title]) =>
                                          `<a href="${href}">${title}</a>`
                                  )
                                  .join(', ')
                            : lang === 'de'
                              ? 'kein eigenes Projekt, siehe Lebenslauf'
                              : 'no project of my own, see CV'
                    }
                </div>
                <div class="skill-card-footer">
                    <a href="${s.refLink}" class="skill-card-link">
                        <i class="fa-solid fa-square-arrow-up-right"></i>
                        <span>${lang === 'de' ? s.refTextDe : s.refTextEn}</span>
                    </a>
                </div>
            </div>
        `
            )
            .join('');
    }

    // Bind click events on filter tabs
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            document.querySelector('.skills-tab.active')?.classList.remove('active');
            tab.classList.add('active');
            activeCategory = tab.getAttribute('data-cat') || 'all';

            renderRadarChart();
            renderDetailsGrid();
        });
    });

    // Bind sorting change event
    const sortSelect = document.getElementById('skills-sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', renderDetailsGrid);
    }

    // Listen for language changes to update labels/descriptions
    document.addEventListener('langchange', () => {
        renderRadarChart();
        renderDetailsGrid();
    });

    // Initial render
    renderRadarChart();
    renderDetailsGrid();
});
