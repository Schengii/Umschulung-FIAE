/**
 * C4 Architecture Model Deep-Dive Module
 * Adds C4 Level controls (Context, Container, Component) to architecture diagrams
 * and interactive component drilldowns with module responsibilities and GitHub source links.
 */

/** @type {Record<string, string>} level number as string -> description */
export const C4_DESCRIPTIONS = {
    1: 'High-Level System Overview: Interaktion zwischen Nutzer, Frontend & Cloud-Services',
    2: 'Container Diagramm: Schnittstellen zwischen Web-App, Spring Boot API & Database',
    3: 'Component View: Detaillierte Klassen, Services, DTOs & JPA Repositories',
};

/**
 * Detailed responsibilities and source repository links for each C4 container/component.
 */
/** @type {Record<string, Record<string, {responsibilitiesDe: string, responsibilitiesEn: string, sourcePath: string, githubUrl: string}>>} */
export const COMPONENT_DETAILS = {
    ecochef: {
        client: {
            responsibilitiesDe: 'Thymeleaf/JS Client zur interaktiven Darstellung von Rezepten und CO2-Ringen.',
            responsibilitiesEn: 'Thymeleaf/JS client displaying interactive recipes and animated CO2 rings.',
            sourcePath: 'Projekte/EcoChef/www/index.html',
            githubUrl: 'https://github.com/Schengii/Umschulung-FIAE/tree/main/Projekte/EcoChef/www',
        },
        controller: {
            responsibilitiesDe: 'REST- & Web-Controller zur Entgegennahme von HTTP-Anfragen und JSON-Ausgabe.',
            responsibilitiesEn: 'REST & Web controllers handling incoming HTTP requests and serving JSON.',
            sourcePath: 'src/main/java/com/ecochef/controller/RecipeController.java',
            githubUrl: 'https://github.com/Schengii/Umschulung-FIAE/tree/main/Projekte/EcoChef',
        },
        service: {
            responsibilitiesDe: 'Berechnung des CO2- und Wasser-Fußabdrucks anhand von Zutaten-Emissionskonstanten.',
            responsibilitiesEn: 'Calculates CO2 and water footprints using ingredient emission constants.',
            sourcePath: 'src/main/java/com/ecochef/service/CalculationService.java',
            githubUrl: 'https://github.com/Schengii/Umschulung-FIAE/tree/main/Projekte/EcoChef',
        },
        repo: {
            responsibilitiesDe: 'Spring Data JPA Schnittstelle zur Datenbank-Persistenz mit optimierten Abfragen.',
            responsibilitiesEn: 'Spring Data JPA repository interface for database persistence and queries.',
            sourcePath: 'src/main/java/com/ecochef/repository/RecipeRepository.java',
            githubUrl: 'https://github.com/Schengii/Umschulung-FIAE/tree/main/Projekte/EcoChef',
        },
        database: {
            responsibilitiesDe: 'Relationale PostgreSQL Datenbank für Rezepte, Zutaten und CO2-Stammdaten.',
            responsibilitiesEn: 'Relational PostgreSQL database storing recipes, ingredients and CO2 constants.',
            sourcePath: 'schema.sql',
            githubUrl: 'https://github.com/Schengii/Umschulung-FIAE/tree/main/Projekte/EcoChef',
        },
    },
    elektrocheck: {
        client: {
            responsibilitiesDe: 'React SPA (Vite) mit Drag-and-Drop PDF-Upload, Risikodiagrammen und To-Dos.',
            responsibilitiesEn: 'React SPA (Vite) with drag-and-drop PDF upload, risk charts, and action items.',
            sourcePath: 'Projekte/ElektroCheck AI/src/App.tsx',
            githubUrl: 'https://github.com/Schengii/Umschulung-FIAE/tree/main/Projekte/ElektroCheck%20AI',
        },
        pdf_parser: {
            responsibilitiesDe: 'Clientseitige Textextraktion und Regex-Bereinigung von DGUV V3 Prüfberichten.',
            responsibilitiesEn: 'Client-side text extraction and regex sanitization of DGUV V3 inspection sheets.',
            sourcePath: 'Projekte/ElektroCheck AI/src/parser/pdfParser.ts',
            githubUrl: 'https://github.com/Schengii/Umschulung-FIAE/tree/main/Projekte/ElektroCheck%20AI',
        },
        ai_node: {
            responsibilitiesDe: 'KI-Analyse via OpenAI GPT-4o gegen Grenzwerte und Prüffristen.',
            responsibilitiesEn: 'AI analysis via OpenAI GPT-4o against safety thresholds and testing deadlines.',
            sourcePath: 'Projekte/ElektroCheck AI/src/services/aiAnalyzer.ts',
            githubUrl: 'https://github.com/Schengii/Umschulung-FIAE/tree/main/Projekte/ElektroCheck%20AI',
        },
        plans_creator: {
            responsibilitiesDe: 'Transformation strukturierter Mängelberichte in Handlungsanweisungen und CSV-Export.',
            responsibilitiesEn: 'Transforms structured findings into corrective actions and CSV/Excel export.',
            sourcePath: 'Projekte/ElektroCheck AI/src/export/actionExporter.ts',
            githubUrl: 'https://github.com/Schengii/Umschulung-FIAE/tree/main/Projekte/ElektroCheck%20AI',
        },
    },
};

/**
 * @param {string|number|undefined} level
 * @param {string|undefined} component
 */
export function getHotspotStyleForLevel(level, component) {
    const lvl = String(level);
    if (lvl === '1') {
        return { opacity: '1', transform: 'scale(1)' };
    }
    if (lvl === '2') {
        const isCore = component === 'database' || component === 'client';
        return { opacity: isCore ? '1' : '0.7', transform: 'scale(1.02)' };
    }
    return { opacity: '1', transform: 'scale(1.04)' };
}

/**
 * Renders the C4 drilldown detail panel into the details container.
 * @param {string} project
 * @param {string} component
 * @param {HTMLElement|null} [container]
 */
export function renderC4Drilldown(project, component, container = null) {
    const pane = container || (typeof document !== 'undefined' ? document.getElementById('c4-drilldown-panel') : null);
    if (!pane) return;

    const details = COMPONENT_DETAILS[project]?.[component];
    if (!details) {
        pane.innerHTML = '';
        return;
    }

    const lang =
        (typeof document !== 'undefined' && document.documentElement
            ? document.documentElement.getAttribute('lang')
            : 'de') || 'de';
    const respLabel = lang === 'en' ? 'Core Responsibilities:' : 'Modul-Verantwortlichkeiten:';
    const respText = lang === 'en' ? details.responsibilitiesEn : details.responsibilitiesDe;
    const srcLabel = lang === 'en' ? 'Source File:' : 'Quellcode:';
    const codeBtnLabel = lang === 'en' ? 'View on GitHub' : 'Quellcode auf GitHub';

    pane.innerHTML = `
        <div class="c4-drilldown-box">
            <h5 class="c4-drilldown-heading">
                <i class="fa-solid fa-bullseye" aria-hidden="true"></i>
                <span>${respLabel}</span>
            </h5>
            <p class="c4-drilldown-text">${respText}</p>
            <div class="c4-drilldown-footer">
                <span class="c4-source-path">
                    <i class="fa-solid fa-code" aria-hidden="true"></i>
                    <code>${srcLabel} ${details.sourcePath}</code>
                </span>
                <a href="${details.githubUrl}" target="_blank" rel="noopener noreferrer" class="c4-github-link">
                    <i class="fa-brands fa-github" aria-hidden="true"></i>
                    <span>${codeBtnLabel}</span>
                </a>
            </div>
        </div>
    `;
}

export function initC4Architecture() {
    const tabsBar = document.querySelector('.arch-tabs-bar');
    if (!tabsBar) return;

    // Ensure drilldown container exists inside details pane
    const detailsPane = document.getElementById('details-pane');
    if (detailsPane && !document.getElementById('c4-drilldown-panel')) {
        const drilldownDiv = document.createElement('div');
        drilldownDiv.id = 'c4-drilldown-panel';
        drilldownDiv.className = 'c4-drilldown-panel';
        detailsPane.appendChild(drilldownDiv);
    }

    if (!document.getElementById('c4-level-switcher')) {
        const switcher = document.createElement('div');
        switcher.id = 'c4-level-switcher';
        switcher.className =
            'c4-level-bar margin-bottom-1rem p-2 background-glass border-radius-6px flex-between align-center flex-wrap gap-2';
        switcher.innerHTML = `
            <div class="d-flex align-center gap-2">
                <span class="font-weight-600 font-size-0-85rem color-primary me-2">
                    <i class="fa-solid fa-layer-group me-1"></i> C4 Architecture Level:
                </span>
                <button type="button" class="btn btn-sm btn-outline-primary btn-c4-level active" data-level="1">
                    L1: System Context
                </button>
                <button type="button" class="btn btn-sm btn-outline-primary btn-c4-level" data-level="2">
                    L2: Container Diagram
                </button>
                <button type="button" class="btn btn-sm btn-outline-primary btn-c4-level" data-level="3">
                    L3: Component View
                </button>
            </div>
            <span id="c4-level-info" class="badge badge-secondary font-size-0-8rem padding-4px-8px">
                High-Level System Overview
            </span>
        `;

        tabsBar.parentNode.insertBefore(switcher, tabsBar);

        const levelBtns = switcher.querySelectorAll('.btn-c4-level');
        const levelInfo = switcher.querySelector('#c4-level-info');

        levelBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                levelBtns.forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');

                const lvl = btn.dataset.level;
                if (levelInfo) levelInfo.textContent = C4_DESCRIPTIONS[lvl] || '';

                const hotspots = document.querySelectorAll('.hotspot');
                hotspots.forEach((h) => {
                    h.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
                    const style = getHotspotStyleForLevel(lvl, h.dataset.component);
                    h.style.opacity = style.opacity;
                    h.style.transform = style.transform;
                });

                if (window.showToast) {
                    window.showToast(
                        { de: `C4-Zoom auf Level ${lvl} angepasst`, en: `C4 zoom set to level ${lvl}` },
                        'info'
                    );
                }
            });
        });
    }

    // Attach hotspot click listeners for C4 drilldown
    document.querySelectorAll('.hotspot').forEach((hotspot) => {
        hotspot.addEventListener('click', () => {
            const project = hotspot.getAttribute('data-project');
            const component = hotspot.getAttribute('data-component');
            if (project && component) {
                renderC4Drilldown(project, component);
            }
        });
    });

    // Render drilldown for active hotspot initially
    const activeHotspot = document.querySelector('.hotspot.active-hotspot');
    if (activeHotspot) {
        const p = activeHotspot.getAttribute('data-project');
        const c = activeHotspot.getAttribute('data-component');
        if (p && c) renderC4Drilldown(p, c);
    } else {
        renderC4Drilldown('ecochef', 'client');
    }

    // Listen for custom component change or language change
    document.addEventListener('langchange', () => {
        const currentActive = document.querySelector('.hotspot.active-hotspot');
        if (currentActive) {
            const p = currentActive.getAttribute('data-project');
            const c = currentActive.getAttribute('data-component');
            if (p && c) renderC4Drilldown(p, c);
        }
    });

    window.addEventListener('c4componentchange', (e) => {
        const detail = /** @type {CustomEvent} */ (e).detail;
        if (detail && detail.project && detail.component) {
            renderC4Drilldown(detail.project, detail.component);
        }
    });
}
