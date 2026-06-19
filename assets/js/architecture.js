/**
 * Architecture & API Explorer Logic
 * Handles interactive SVG hotspot clicks and simulated Swagger API playground
 */

const ARCHITECTURE_DATA = {
    // --- ECOCHEF COMPONENT DETAILS ---
    ecochef: {
        client: {
            titleDe: "Web-Frontend (Thymeleaf & CSS3)",
            titleEn: "Web Frontend (Thymeleaf & CSS3)",
            techDe: "HTML5, CSS3, JavaScript (ES6), Thymeleaf Templates",
            techEn: "HTML5, CSS3, JavaScript (ES6), Thymeleaf Templates",
            descDe: "Die Benutzeroberfläche stellt die Rezepte, den ökologischen Fußabdruck und die Saisonalitätskalender dar. Thymeleaf rendert die Daten serverseitig in HTML. JavaScript fügt Interaktionen hinzu (wie die CO2-Ringe).",
            descEn: "The user interface displays recipes, the ecological footprint, and seasonality calendars. Thymeleaf renders the backend data into HTML server-side. JavaScript adds interaction features (like animated CO2 progress rings)."
        },
        controller: {
            titleDe: "Spring Boot Controller (API & Web Layer)",
            titleEn: "Spring Boot Controller (API & Web Layer)",
            techDe: "Java, Spring Web MVC, REST Controllers, Thymeleaf Integration",
            techEn: "Java, Spring Web MVC, REST Controllers, Thymeleaf Integration",
            descDe: "Nimmt HTTP-Anfragen vom Client entgegen. `RecipeController` lädt Rezepte für die Thymeleaf-Webseiten. Der `RecipeRestController` stellt REST-Schnittstellen für JSON-Daten bereit (z. B. für API-Abfragen).",
            descEn: "Receives incoming HTTP requests. `RecipeController` loads recipe data for Thymeleaf pages, while `RecipeRestController` exposes REST endpoints returning JSON (e.g., for API requests)."
        },
        service: {
            titleDe: "Business Logic Layer (Services)",
            titleEn: "Business Logic Layer (Services)",
            techDe: "Java, Spring Service, CO2 Calculation Engine, Validator",
            techEn: "Java, Spring Service, CO2 Calculation Engine, Validator",
            descDe: "Enthält die Kernlogik von EcoChef. Der `CalculationService` berechnet den ökologischen Fußabdruck (CO₂-Emissionen und Wasserverbrauch) anhand der Gewichte und Kategorien der Zutaten.",
            descEn: "Contains the core business rules. The `CalculationService` computes the ecological footprint (CO₂ emissions and water consumption) using ingredient weights and category emission constants."
        },
        repo: {
            titleDe: "Data Access Layer (Spring Data JPA)",
            titleEn: "Data Access Layer (Spring Data JPA)",
            techDe: "Java, Spring Data JPA, Hibernate, PostgreSQL Driver",
            techEn: "Java, Spring Data JPA, Hibernate, PostgreSQL Driver",
            descDe: "Schreibt und liest Daten aus der Datenbank über Object-Relational-Mapping (ORM). Das `RecipeRepository` und das `IngredientRepository` bieten vordefinierte Abfrage-Methoden wie `findByCategory()`.",
            descEn: "Writes and reads database records using Object-Relational-Mapping (ORM). The `RecipeRepository` and `IngredientRepository` offer query methods like `findByCategory()`."
        },
        database: {
            titleDe: "PostgreSQL Relationale Datenbank",
            titleEn: "PostgreSQL Relational Database",
            techDe: "PostgreSQL SQL, Relationell, Normalisiert (3NF)",
            techEn: "PostgreSQL SQL, Relational, Normalized (3NF)",
            descDe: "Speichert Tabellen für Rezepte, Zutaten, CO₂-Footprints und Benutzerkonten. Durch Fremdschlüssel (Foreign Keys) sind Zutaten direkt mit Rezepten und Emissions-Faktoren verknüpft.",
            descEn: "Stores tables for recipes, ingredients, CO₂ footprints, and user profiles. Relationships (foreign keys) link ingredients to recipes and category emission factors."
        }
    },
    // --- ELEKTROCHECK COMPONENT DETAILS ---
    elektrocheck: {
        client: {
            titleDe: "React SPA Frontend (Vite)",
            titleEn: "React SPA Frontend (Vite)",
            techDe: "React.js, Vite, TailwindCSS, Chart.js, HTML5 File API",
            techEn: "React.js, Vite, TailwindCSS, Chart.js, HTML5 File API",
            descDe: "Das Single-Page App Dashboard. Ermöglicht dem Prüfer den PDF-Berichtsupload per Drag-and-Drop, rendert interaktive Risikodiagramme und bietet To-Do-Checklisten.",
            descEn: "The Single Page App Dashboard. Allows users to upload PDF inspection sheets via drag-and-drop, renders interactive risk charts, and shows checklist actions."
        },
        pdf_parser: {
            titleDe: "PDF Text-Parser (Client-seitig)",
            titleEn: "PDF Text Parser (Client-side)",
            techDe: "pdfjs-dist, Text-Extraktion, Text-Matching",
            techEn: "pdfjs-dist, Text Extraction, Text Matching",
            descDe: "Extrahiert rohen Text direkt im Browser aus der hochgeladenen Binärdatei, bereitet den String auf (Trimmen, Regex-Bereinigung) und übergibt ihn an das Analyse-Modul.",
            descEn: "Extracts raw text directly in the browser from the uploaded PDF binary, sanitizes the string (trimming, regex cleanup), and passes it to the analysis modules."
        },
        ai_node: {
            titleDe: "OpenAI AI Analyzer API Integration",
            titleEn: "OpenAI AI Analyzer API Integration",
            techDe: "Node.js (Mock), OpenAI GPT-4o API, System Prompts, JSON Mode",
            techEn: "Node.js (Mock), OpenAI GPT-4o API, System Prompts, JSON Mode",
            descDe: "Sendet den extrahierten Text an die OpenAI API mit einem strukturierten System-Prompt. Die KI analysiert den Text auf DGUV V3 Fristenüberschreitungen und mangelhafte Messwerte.",
            descEn: "Sends the parsed report text to the OpenAI API using a structured system prompt. The AI evaluates the contents for DGUV V3 deadline violations and invalid measurements."
        },
        plans_creator: {
            titleDe: "Maßnahmen-Generator & Export",
            titleEn: "Corrective Action Generator & Export",
            techDe: "JavaScript JSON Schema, JSZip, CSV Engine",
            techEn: "JavaScript JSON Schema, JSZip, CSV Engine",
            descDe: "Wandelt die strukturierten Mängelberichte der KI in konkrete To-Do-Einträge um (z. B. 'Wasserkocher in Büro 12 austauschen') und bietet einen direkten Excel/CSV-Export für Elektriker.",
            descEn: "Converts the structured anomalies returned by the AI into concrete actionable tickets (e.g., 'Replace kettle in office 12') and offers Excel/CSV export utilities."
        }
    }
};

const API_ROUTES = [
    // --- ECOCHEF API ROUTES ---
    {
        project: "ecochef",
        method: "GET",
        path: "/api/recipes",
        summaryDe: "Alle Rezepte abrufen",
        summaryEn: "Retrieve all recipes",
        descriptionDe: "Gibt eine Liste aller gespeicherten Rezepte inklusive deren Zutaten und berechneten CO₂-Footprints zurück.",
        descriptionEn: "Returns a list of all stored recipes, including their ingredients and computed CO₂ footprints.",
        parameters: [],
        requestBody: null,
        responseMock: [
            {
                id: 1,
                titleDe: "Vegane Linsensuppe",
                titleEn: "Vegan Lentil Soup",
                co2FootprintGrams: 320,
                waterUsageLitres: 120,
                ingredients: ["Linsen", "Karotten", "Gemüsebrühe"]
            },
            {
                id: 2,
                titleDe: "Klassischer Rinderbraten",
                titleEn: "Classic Roast Beef",
                co2FootprintGrams: 4200,
                waterUsageLitres: 950,
                ingredients: ["Rindfleisch", "Zwiebeln", "Rotwein"]
            }
        ]
    },
    {
        project: "ecochef",
        method: "POST",
        path: "/api/recipes",
        summaryDe: "Neues Rezept erstellen",
        summaryEn: "Create new recipe",
        descriptionDe: "Erstellt ein neues Rezept. Das System berechnet den CO₂-Wert basierend auf den Zutaten automatisch im Service-Layer.",
        descriptionEn: "Creates a new recipe. The system automatically computes the CO₂ footprint based on the ingredients in the service layer.",
        parameters: [],
        requestBody: {
            titleDe: "Tomatensalat",
            titleEn: "Tomato Salad",
            ingredients: [
                { name: "Tomaten", weightGrams: 200, category: "VEGETABLE" },
                { name: "Olivenöl", weightGrams: 15, category: "OIL" }
            ]
        },
        responseMock: {
            status: "SUCCESS",
            messageDe: "Rezept erfolgreich erstellt!",
            messageEn: "Recipe successfully created!",
            recipeId: 104,
            calculatedCo2Grams: 75,
            calculatedWaterLitres: 18
        }
    },
    // --- ELEKTROCHECK API ROUTES ---
    {
        project: "elektrocheck",
        method: "POST",
        path: "/api/v1/analyze",
        summaryDe: "Prüfprotokoll-Text mit KI analysieren",
        summaryEn: "Analyze inspection report text via AI",
        descriptionDe: "Sendet extrahierten Berichtstext an die KI-Engine. Gibt gefundene Mängel, Fristen und Risikoeinstufungen zurück.",
        descriptionEn: "Sends extracted report text to the AI engine. Returns detected defects, deadlines, and risk evaluations.",
        parameters: [],
        requestBody: {
            reportText: "Prüfung nach DGUV Vorschrift 3. Gerät: Kaffeemaschine. Standort: Küche EG. Isolationswiderstand: 0.1 MOhm (Grenzwert 0.3 MOhm). Sichtprüfung: Netzkabel beschädigt. Nächster Prüftermin: überfällig seit 05.2026."
        },
        responseMock: {
            analyzerStatus: "COMPLETED",
            anomaliesFoundCount: 2,
            anomalies: [
                {
                    item: "Kaffeemaschine (Küche EG)",
                    defectDe: "Isolationswiderstand zu gering (0.1 MOhm statt >= 0.3 MOhm)",
                    defectEn: "Insulation resistance too low (0.1 MOhm vs >= 0.3 MOhm)",
                    riskLevel: "CRITICAL",
                    actionDe: "Sofort außer Betrieb nehmen und Kabel tauschen.",
                    actionEn: "Decommission immediately and replace power cord."
                },
                {
                    item: "Kaffeemaschine (Küche EG)",
                    defectDe: "Prüffrist überfällig seit Mai 2026",
                    defectEn: "Testing deadline overdue since May 2026",
                    riskLevel: "MEDIUM",
                    actionDe: "Sicherheitsprüfung unverzüglich nachholen.",
                    actionEn: "Schedule safety inspection immediately."
                }
            ],
            overallRiskScore: 92
        }
    }
];

class ArchitectureExplorer {
    constructor() {
        this.selectedLanguage = 'de';
        this.activeTab = 'ecochef';
        this.activeRouteIndex = 0;

        // Tabs
        this.tabEcochefBtn = document.getElementById('tab-btn-ecochef');
        this.tabElektrocheckBtn = document.getElementById('tab-btn-elektrocheck');
        this.tabApiBtn = document.getElementById('tab-btn-api');

        // View Panels
        this.panelEcochef = document.getElementById('panel-ecochef');
        this.panelElektrocheck = document.getElementById('panel-elektrocheck');
        this.panelApi = document.getElementById('panel-api');

        // Details Side Pane
        this.detailsTitle = document.getElementById('details-title');
        this.detailsTech = document.getElementById('details-tech');
        this.detailsDesc = document.getElementById('details-desc');
        this.detailsPane = document.getElementById('details-pane');

        // API Layout Elements
        this.apiRoutesList = document.getElementById('api-routes-list');
        this.apiDetailsContainer = document.getElementById('api-details-container');

        this.init();
    }

    init() {
        // Tab switching listeners
        if (this.tabEcochefBtn) this.tabEcochefBtn.addEventListener('click', () => this.switchTab('ecochef'));
        if (this.tabElektrocheckBtn) this.tabElektrocheckBtn.addEventListener('click', () => this.switchTab('elektrocheck'));
        if (this.tabApiBtn) this.tabApiBtn.addEventListener('click', () => this.switchTab('api'));

        // Language toggle listener
        document.addEventListener('langchange', (e) => {
            this.selectedLanguage = e.detail || 'de';
            this.updateLanguageStrings();
        });
        this.selectedLanguage = document.documentElement.getAttribute('lang') || 'de';

        // Hotspot click handlers inside SVG diagrams
        document.querySelectorAll('.hotspot').forEach(hotspot => {
            hotspot.addEventListener('click', (e) => {
                const project = hotspot.getAttribute('data-project');
                const component = hotspot.getAttribute('data-component');
                this.showComponentDetails(project, component);
                
                // Highlight active hotspot
                document.querySelectorAll('.hotspot').forEach(h => h.classList.remove('active-hotspot'));
                hotspot.classList.add('active-hotspot');

                // Increment contributions
                this.addPracticeCommit();
            });
        });

        // Load initial details
        this.showComponentDetails('ecochef', 'client');
        this.renderApiRoutes();
    }

    switchTab(tab) {
        this.activeTab = tab;

        // Manage active classes on tab buttons
        [this.tabEcochefBtn, this.tabElektrocheckBtn, this.tabApiBtn].forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        if (tab === 'ecochef' && this.tabEcochefBtn) this.tabEcochefBtn.classList.add('active');
        if (tab === 'elektrocheck' && this.tabElektrocheckBtn) this.tabElektrocheckBtn.classList.add('active');
        if (tab === 'api' && this.tabApiBtn) this.tabApiBtn.classList.add('active');

        // Toggle panel visibility
        [this.panelEcochef, this.panelElektrocheck, this.panelApi].forEach(p => {
            if (p) p.classList.add('collapsed');
        });
        if (tab === 'ecochef' && this.panelEcochef) this.panelEcochef.classList.remove('collapsed');
        if (tab === 'elektrocheck' && this.panelElektrocheck) this.panelElektrocheck.classList.remove('collapsed');
        if (tab === 'api' && this.panelApi) this.panelApi.classList.remove('collapsed');

        // If switching to diagram tab, show initial details
        if (tab === 'ecochef') {
            this.showComponentDetails('ecochef', 'client');
        } else if (tab === 'elektrocheck') {
            this.showComponentDetails('elektrocheck', 'client');
        }
    }

    showComponentDetails(project, component) {
        const projData = ARCHITECTURE_DATA[project];
        if (!projData) return;
        
        const comp = projData[component];
        if (!comp) return;

        if (this.detailsPane) {
            this.detailsPane.classList.remove('collapsed');
        }

        if (this.detailsTitle) {
            this.detailsTitle.textContent = this.selectedLanguage === 'de' ? comp.titleDe : comp.titleEn;
        }
        if (this.detailsTech) {
            this.detailsTech.textContent = this.selectedLanguage === 'de' ? comp.techDe : comp.techEn;
        }
        if (this.detailsDesc) {
            this.detailsDesc.textContent = this.selectedLanguage === 'de' ? comp.descDe : comp.descEn;
        }
    }

    renderApiRoutes() {
        if (!this.apiRoutesList) return;
        this.apiRoutesList.innerHTML = '';

        API_ROUTES.forEach((route, idx) => {
            const sumText = this.selectedLanguage === 'de' ? route.summaryDe : route.summaryEn;
            const routeHTML = `
                <div class="api-route-item method-${route.method.toLowerCase()} ${idx === this.activeRouteIndex ? 'active' : ''}" data-index="${idx}">
                    <span class="route-badge">${route.method}</span>
                    <span class="route-path">${route.path}</span>
                    <span class="route-summary small-muted" style="margin-left:auto; font-size:0.75rem;">${sumText}</span>
                </div>
            `;
            this.apiRoutesList.insertAdjacentHTML('beforeend', routeHTML);
        });

        // Attach click listeners to route list
        const routeItems = this.apiRoutesList.querySelectorAll('.api-route-item');
        routeItems.forEach(item => {
            item.addEventListener('click', () => {
                routeItems.forEach(ri => ri.classList.remove('active'));
                item.classList.add('active');
                
                this.activeRouteIndex = parseInt(item.getAttribute('data-index'));
                this.renderApiDetails();
            });
        });

        this.renderApiDetails();
    }

    renderApiDetails() {
        if (!this.apiDetailsContainer) return;
        const route = API_ROUTES[this.activeRouteIndex];
        if (!route) return;

        const summary = this.selectedLanguage === 'de' ? route.summaryDe : route.summaryEn;
        const desc = this.selectedLanguage === 'de' ? route.descriptionDe : route.descriptionEn;

        let requestBodyHTML = '';
        if (route.requestBody) {
            const bodyJSON = JSON.stringify(route.requestBody, null, 4);
            requestBodyHTML = `
                <div class="api-section">
                    <h5 style="margin-bottom:0.5rem;"><span lang="de">Anfrage-Body (JSON):</span><span lang="en">Request Body (JSON):</span></h5>
                    <textarea class="code-textarea" id="api-req-body" style="width:100%; height:120px; font-family:monospace; font-size:0.8rem; background:#09090b; color:#e4e4e7; border:1px solid var(--border); border-radius:6px; padding:0.5rem; outline:none; resize:none;">${bodyJSON}</textarea>
                </div>
            `;
        } else {
            requestBodyHTML = `
                <div class="api-section">
                    <h5 style="margin-bottom:0.5rem;"><span lang="de">Anfrage-Body (JSON):</span><span lang="en">Request Body (JSON):</span></h5>
                    <p class="small-muted" style="font-style:italic;">None / Keine Parameter benötigt</p>
                </div>
            `;
        }

        const detailsHTML = `
            <h4 style="margin-top:0; color:var(--text-primary); display:flex; align-items:center; gap:0.5rem;">
                <span class="route-badge ${route.method.toLowerCase()}">${route.method}</span>
                <span>${route.path}</span>
            </h4>
            <p class="small-muted" style="margin-bottom:1rem;"><strong>${summary}</strong><br>${desc}</p>
            
            ${requestBodyHTML}

            <div class="api-section" style="margin-top:1.5rem;">
                <button class="btn-primary" id="api-execute-btn" style="width:auto; padding: 0.5rem 1.5rem;">
                    <span lang="de">Ausführen <i class="fa fa-play"></i></span>
                    <span lang="en">Execute <i class="fa fa-play"></i></span>
                </button>
            </div>

            <div class="api-section collapsed" id="api-response-section" style="margin-top:1.5rem;">
                <h5 style="margin-bottom:0.5rem;"><span lang="de">Server-Antwort (JSON):</span><span lang="en">Server Response (JSON):</span></h5>
                
                <div style="background:#18181b; border:1px solid var(--border); border-radius:6px; overflow:hidden;">
                    <div style="background:#27272a; padding:0.35rem 0.75rem; color:#a1a1aa; font-size:0.75rem; font-family:monospace; display:flex; justify-content:space-between;">
                        <span>HTTP/1.1 200 OK</span>
                        <span id="response-time">Time: 0ms</span>
                    </div>
                    <pre style="margin:0; padding:1rem; font-family:monospace; font-size:0.8rem; color:#10b981; overflow-x:auto;"><code id="api-resp-body"></code></pre>
                </div>
            </div>
        `;

        this.apiDetailsContainer.innerHTML = detailsHTML;

        // Bind Execute button Click
        const executeBtn = document.getElementById('api-execute-btn');
        if (executeBtn) {
            executeBtn.addEventListener('click', () => this.executeApiRequest());
        }

        // Align dynamic text blocks
        document.dispatchEvent(new CustomEvent('langchange', { detail: this.selectedLanguage }));
    }

    executeApiRequest() {
        const executeBtn = document.getElementById('api-execute-btn');
        const respSection = document.getElementById('api-response-section');
        const respBody = document.getElementById('api-resp-body');
        const respTime = document.getElementById('response-time');
        
        if (!executeBtn || !respSection || !respBody) return;

        const route = API_ROUTES[this.activeRouteIndex];
        if (!route) return;

        executeBtn.disabled = true;
        executeBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Loading...';

        const startTime = performance.now();

        setTimeout(() => {
            executeBtn.disabled = false;
            executeBtn.innerHTML = this.selectedLanguage === 'de' ? 'Ausführen <i class="fa fa-play"></i>' : 'Execute <i class="fa fa-play"></i>';

            // Get calculation time
            const duration = Math.round(performance.now() - startTime + 80);
            if (respTime) respTime.textContent = `Time: ${duration}ms`;

            // Display response JSON
            respBody.textContent = JSON.stringify(route.responseMock, null, 4);
            respSection.classList.remove('collapsed');

            // Play audio effect
            if (typeof GameAudio !== 'undefined') {
                GameAudio.play('match');
            }

            // Practice commit grid increase!
            this.addPracticeCommit();
            
        }, 800);
    }

    updateLanguageStrings() {
        // Redraw route lists and active diagram component description to adapt translation
        if (this.activeTab === 'api') {
            this.renderApiRoutes();
        } else {
            const activeHotspot = document.querySelector('.active-hotspot');
            if (activeHotspot) {
                const project = activeHotspot.getAttribute('data-project');
                const component = activeHotspot.getAttribute('data-component');
                this.showComponentDetails(project, component);
            }
        }
    }

    addPracticeCommit() {
        if (window.addLiveCommit) {
            window.addLiveCommit();
        } else {
            let liveCommitsToday = parseInt(StorageManager.getItem('github_live_commits_today', 0)) || 0;
            liveCommitsToday++;
            StorageManager.setItem('github_live_commits_today', liveCommitsToday);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ArchitectureExplorer();
});
