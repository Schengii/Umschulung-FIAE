/**
 * Roadmap Module — Interactive FIAE learning path timeline
 */
function initRoadmap() {
    const roadmapItems = document.querySelectorAll('.roadmap-item');
    const drawer = document.getElementById('roadmap-drawer');
    const overlay = document.getElementById('roadmap-overlay');
    const closeBtn = document.getElementById('roadmap-drawer-close');
    const drawerContent = document.getElementById('roadmap-drawer-content');
    const drawerTitle = document.getElementById('drawer-title');

    if (!roadmapItems.length || !drawer || !overlay || !closeBtn || !drawerContent) return;

    // Database of phase details
    const phaseData = {
        1: {
            title_de: "Phase 1: Grundlagen & Algorithmen",
            title_en: "Phase 1: Fundamentals & Algorithms",
            topics_de: ["Variablen & Datentypen", "Kontrollstrukturen (if/else, Schleifen)", "Funktionen & Parameter", "Einfache Datenstrukturen (Arrays)", "Algorithmen & Flussdiagramme"],
            topics_en: ["Variables & Data Types", "Control Structures (if/else, loops)", "Functions & Parameters", "Simple Data Structures (Arrays)", "Algorithms & Flowcharts"],
            code: `// Primzahlprüfung in JS\nfunction istPrimzahl(n) {\n    if (n <= 1) return false;\n    for (let i = 2; i <= Math.sqrt(n); i++) {\n        if (n % i === 0) return false;\n    }\n    return true;\n}`,
            codeLang: "javascript",
            project_title_de: "Glücksspiel JS",
            project_title_en: "Glücksspiel JS",
            project_link: "Projekte/Glücksspiel/index.html"
        },
        2: {
            title_de: "Phase 2: OOP & Datenbanken",
            title_en: "Phase 2: OOP & Databases",
            topics_de: ["Objektorientierte Programmierung (OOP)", "Klassen, Vererbung & Polymorphismus", "Datenbank-Design (ERD & Kardinalitäten)", "SQL-Abfragen (SELECT, JOIN, GROUP BY)", "Normalisierung (1. bis 3. Normalform)"],
            topics_en: ["Object-Oriented Programming (OOP)", "Classes, Inheritance & Polymorphism", "Database Design (ERD & Cardinalities)", "SQL Queries (SELECT, JOIN, GROUP BY)", "Normalization (1st to 3rd Normal Form)"],
            code: `-- SQL Join Abfrage\nSELECT p.Projektname, m.Name\nFROM Projekte p\nINNER JOIN Mitarbeiter m ON p.MitarbeiterID = m.ID\nWHERE m.Abteilung = 'IT';`,
            codeLang: "sql",
            project_title_de: "Arbeitszeiterfassung",
            project_title_en: "Time Tracking Tool",
            project_link: "Projekte/arbeitszeiterfassung/index.html"
        },
        3: {
            title_de: "Phase 3: Web-Development & APIs",
            title_en: "Phase 3: Web Development & APIs",
            topics_de: ["Frontend-Grundlagen (HTML5, CSS3, Flexbox/Grid)", "JavaScript DOM-Manipulation & Events", "Asynchrone Programmierung (Promises, Fetch API)", "Datenformate (JSON, XML)", "RESTful APIs & Client-Server-Modell"],
            topics_en: ["Frontend Basics (HTML5, CSS3, Flexbox/Grid)", "JavaScript DOM Manipulation & Events", "Asynchronous Programming (Promises, Fetch API)", "Data Formats (JSON, XML)", "RESTful APIs & Client-Server Model"],
            code: `// API Daten holen mit Async/Await\nasync function holeWetter(stadt) {\n    try {\n        const res = await fetch(\`/api/wetter?q=\${stadt}\`);\n        const daten = await res.json();\n        console.log(\`Temperatur: \${daten.temp}°C\`);\n    } catch (e) {\n        console.error("Fehler beim Abrufen:", e);\n    }\n}`,
            codeLang: "javascript",
            project_title_de: "Jobsuche Portal",
            project_title_en: "Job Search Portal",
            project_link: "Projekte/Jobbsuche/index.html"
        },
        4: {
            title_de: "Phase 4: Software-Engineering & agile Methoden",
            title_en: "Phase 4: Software Engineering & Agile Methods",
            topics_de: ["Architekturmuster (MVC, MVVM)", "Clean Code & Refactoring", "Softwaretests (Unit Testing, Jest/JUnit)", "Versionsverwaltung mit Git & GitHub", "Agile Entwicklung mit Scrum"],
            topics_en: ["Architectural Patterns (MVC, MVVM)", "Clean Code & Refactoring", "Software Testing (Unit Testing, Jest/JUnit)", "Version Control with Git & GitHub", "Agile Development with Scrum"],
            code: `// C# Unit Test Beispiel\n[Test]\npublic void BerechneRabatt_SollteRabattAbziehen() {\n    var rechner = new RabattRechner();\n    double ergebnis = rechner.Berechne(100.0, 10.0); // 10% Rabatt\n    Assert.AreEqual(90.0, ergebnis);\n}`,
            codeLang: "csharp",
            project_title_de: "Finance AI Bot",
            project_title_en: "Finance AI Bot",
            project_link: "Projekte/finance-ai-bot/index.html"
        },
        5: {
            title_de: "Phase 5: IHK-Projekt & Abschluss",
            title_en: "Phase 5: IHK Project & Final Exam",
            topics_de: ["Konzeptionierung und Wirtschaftlichkeitsanalyse", "Dokumentation nach IHK-Vorgaben (Fachbericht)", "Entwickeln eines Software-Projekts", "Vorbereitung auf das Fachgespräch & Präsentation", "AP2 Prüfungsabschluss Juni 2026"],
            topics_en: ["Conceptualization & Economic Feasibility", "Project Documentation (IHK Guidelines)", "Developing a Software Capstone Project", "Oral Exam & Presentation Preparation", "AP2 Final Examination June 2026"],
            code: `// IHK-Projekt: EcoChef (Gemini AI Integration)\nconst chef = new EcoChefMealPlanner();\nconst recipes = await chef.generateRecipes({\n    ingredients: ["Tomaten", "Nudeln", "Käse"],\n    preferences: "vegan"\n});\nconsole.log(recipes[0].title);`,
            codeLang: "javascript",
            project_title_de: "EcoChef (IHK)",
            project_title_en: "EcoChef (IHK)",
            project_link: "Projekte/EcoChef/www/index.html"
        }
    };

    roadmapItems.forEach(item => {
        item.addEventListener('click', () => {
            const phaseId = item.getAttribute('data-phase');
            const data = phaseData[phaseId];
            if (!data) return;

            openDrawer(data);
        });
    });

    closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDrawer();
    });

    function openDrawer(data) {
        const lang = document.documentElement.getAttribute('lang') || 'de';
        
        // Set Header
        drawerTitle.textContent = lang === 'de' ? data.title_de : data.title_en;
        
        // Topics HTML
        const topics = lang === 'de' ? data.topics_de : data.topics_en;
        const topicsListHTML = topics.map(t => `<li><i class="fa fa-check" style="color:var(--primary); margin-right:0.5rem;" aria-hidden="true"></i> ${t}</li>`).join('');

        // Populate Content
        drawerContent.innerHTML = `
            <div>
                <h4 style="margin-bottom:0.5rem; font-weight:600;">
                    ${lang === 'de' ? '🔑 Kernkompetenzen' : '🔑 Core Competencies'}
                </h4>
                <ul style="list-style:none; padding:0; margin-bottom:1.5rem; display:flex; flex-direction:column; gap:0.5rem;">
                    ${topicsListHTML}
                </ul>
            </div>

            <hr style="border:none; border-top:1px solid var(--border); margin:0.5rem 0;">

            <div>
                <h4 style="margin-bottom:0.5rem; font-weight:600;">
                    ${lang === 'de' ? '💻 Code-Beispiel' : '💻 Code Example'}
                </h4>
                <div class="code-snippet-wrapper">
                    <button class="code-copy-btn" id="code-copy-btn">
                        <i class="fa fa-copy" aria-hidden="true"></i> ${lang === 'de' ? 'Kopieren' : 'Copy'}
                    </button>
                    <pre><code class="language-${data.codeLang}">${escapeHTML(data.code)}</code></pre>
                </div>
            </div>

            <hr style="border:none; border-top:1px solid var(--border); margin:0.5rem 0;">

            <div>
                <h4 style="margin-bottom:0.5rem; font-weight:600;">
                    ${lang === 'de' ? '📁 Passendes Projekt' : '📁 Related Project'}
                </h4>
                <a href="${data.project_link}" class="btn-primary" style="display:inline-flex; align-items:center; justify-content:center; gap:0.5rem; text-decoration:none; padding:0.6rem 1.2rem; font-size:0.9rem;">
                    <i class="fa fa-external-link" aria-hidden="true"></i>
                    <span>${lang === 'de' ? data.project_title_de : data.project_title_en} ${lang === 'de' ? 'ansehen' : 'view'}</span>
                </a>
            </div>
        `;

        // Copy button listener
        const copyBtn = document.getElementById('code-copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(data.code).then(() => {
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = `<i class="fa fa-check" aria-hidden="true"></i> ${lang === 'de' ? 'Kopiert!' : 'Copied!'}`;
                    copyBtn.style.backgroundColor = '#10b981';
                    copyBtn.style.color = 'white';
                    copyBtn.style.borderColor = '#10b981';
                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                        copyBtn.style.backgroundColor = '';
                        copyBtn.style.color = '';
                        copyBtn.style.borderColor = '';
                    }, 1500);
                });
            });
        }

        // Show drawer and overlay
        drawer.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Disable page scrolling
    }

    function closeDrawer() {
        drawer.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Enable page scrolling
    }

    function escapeHTML(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
