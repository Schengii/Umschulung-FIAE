/**
 * Praktikumsbetrieb Media Module — Handles DFG Image Gallery and EcoChef Video Player
 */

// Global state for media items
const DFG_GALLERY_DATA = [
    {
        id: 'abteilungen',
        titleDe: 'Organisationsstruktur (vereinfacht)',
        titleEn: 'Organizational Structure (simplified)',
        src: 'assets/images/Abteilungen-DFG.png',
        altDe: 'Vereinfachtes, zur Veranschaulichung erstelltes Organigramm mit Fachabteilungen und administrativen Bereichen.',
        altEn: 'Simplified, illustrative organization chart with specialist departments and administrative areas.',
        descDe: 'Eine vereinfachte, zur Veranschaulichung erstellte Darstellung, wie eine große Forschungsförderorganisation wie die DFG in Fachabteilungen und administrative Bereiche gegliedert sein kann — keine originalgetreue interne Unterlage.',
        descEn: 'A simplified, illustrative diagram of how a large research funding organization like the DFG can be structured into departments and administrative areas — not a verbatim internal document.'
    },
    {
        id: 'team-anwendungsmanagement',
        titleDe: 'Mein Team im Webentwicklungsbereich',
        titleEn: 'My Team in Web Development',
        src: 'assets/images/Team-Anwendungsmanagement-Z-INF.png',
        altDe: 'Vereinfachte Darstellung eines Web-Entwicklerteams mit Rollenverteilung.',
        altEn: 'Simplified illustration of a web development team with role distribution.',
        descDe: 'Eine vereinfachte, anonymisierte Darstellung der Rollenverteilung im 9-köpfigen Web-Entwicklerteam mit Schwerpunkt Frontend-Technologien, in dem ich eingesetzt war.',
        descEn: 'A simplified, anonymized illustration of the role distribution within the 9-member web development team focused on frontend technologies where I was deployed.'
    },
    {
        id: 'zuständigkeiten',
        titleDe: 'Fachliche Zuständigkeiten im Team',
        titleEn: 'Areas of Expertise within the Team',
        src: 'assets/images/Fachliche-Zuständigkeiten-Z-INF.png',
        altDe: 'Vereinfachtes Übersichtsdiagramm typischer fachlicher Zuständigkeiten innerhalb eines Entwicklungsteams.',
        altEn: 'Simplified overview diagram of typical areas of responsibility within a development team.',
        descDe: 'Eine vereinfachte, zur Veranschaulichung erstellte Übersicht, wie fachliche Zuständigkeiten und Software-Bereiche innerhalb meines Entwicklungsteams grob aufgeteilt waren.',
        descEn: 'A simplified, illustrative overview of how technical areas and software responsibilities were roughly divided within my development team.'
    },
    {
        id: 'foerderaktivitaeten',
        titleDe: 'Förderlandschaft (illustrativ)',
        titleEn: 'Funding Landscape (illustrative)',
        src: 'assets/images/Förderaktivitäten-DFG-2023.png',
        altDe: 'Illustratives Diagramm zur Verteilung von Fördermitteln nach Wissenschaftsbereichen.',
        altEn: 'Illustrative chart showing the distribution of funding by scientific domain.',
        descDe: 'Eine vereinfachte, illustrative Grafik zum Prinzip der Fördermittelverteilung nach Wissenschaftsbereichen bei einer Forschungsförderorganisation — keine originalen internen Zahlen.',
        descEn: 'A simplified, illustrative graphic on the principle of funding distribution by scientific field at a research funding organization — not original internal figures.'
    },
    {
        id: 'neufa',
        titleDe: 'Modernisierungsinitiative IT-Infrastruktur',
        titleEn: 'IT Infrastructure Modernization Initiative',
        src: 'assets/images/Projekt-Neufa-dfg.png',
        altDe: 'Vereinfachte Visualisierung einer internen Modernisierungsinitiative zur IT-Infrastruktur.',
        altEn: 'Simplified visualization of an internal IT infrastructure modernization initiative.',
        descDe: 'Ein vereinfachter Einblick in eine interne Modernisierungs- und Web-Infrastruktur-Initiative, an der ich mitwirken durfte.',
        descEn: 'A simplified glimpse into an internal modernization and web infrastructure initiative I was able to contribute to.'
    },
    {
        id: 'elan',
        titleDe: 'Elektronisches Antragsportal (Prinzip)',
        titleEn: 'Electronic Submission Portal (Concept)',
        src: 'assets/images/Elan-Bild.png',
        altDe: 'Vereinfachte Konzeptdarstellung eines Portals für elektronische Antragstellung.',
        altEn: 'Simplified concept illustration of an electronic proposal submission portal.',
        descDe: 'Ein vereinfachtes Konzeptbild zu einem zentralen Portal für elektronische Antragstellung, an dessen Frontend-Komponenten ich mitgearbeitet habe.',
        descEn: 'A simplified concept illustration of a central portal for electronic proposal submissions, whose frontend components I helped work on.'
    },
    {
        id: 'sprint',
        titleDe: 'Agiler Sprint-Zyklus',
        titleEn: 'Agile Sprint Cycle',
        src: 'assets/images/Sprint-Zyklus.png',
        altDe: 'Darstellung des agilen Scrum-Prozesses mit Sprint-Planung, Daily Standup, Review und Retrospektive.',
        altEn: 'Diagram showing the agile Scrum process with Sprint Planning, Daily Standup, Review, and Retrospective.',
        descDe: 'Die allgemeine agile Entwicklungsmethodik (Scrum) meines Teams, bestehend aus 2-Wochen-Sprints zur strukturierten Projektabwicklung.',
        descEn: 'The general agile development methodology (Scrum) used by my team, utilizing 2-week sprints for structured project execution.'
    }
];

const ECOCHEF_VIDEO_DATA = [
    {
        id: 'v1',
        titleDe: 'Hauptclip — Übersicht & Navigation',
        titleEn: 'Main Clip — Overview & Navigation',
        src: 'assets/videos/V1_Hauptclip.mp4',
        duration: '1:06',
        descDe: 'Der Hauptclip zeigt das grundlegende Konzept von EcoChef: Zutateneingabe im virtuellen Kühlschrank, Absenden an die Gemini-KI, Generierung des Rezepts mit Nährwert- und CO2-Ersparnis-Berechnung.',
        descEn: 'The main clip highlights the core concept of EcoChef: entering ingredients in the virtual pantry, submitting to Gemini AI, and generating custom recipes with nutrition and carbon savings data.'
    },
    {
        id: 'v2',
        titleDe: 'Kochmodus & Sprachausgabe (TTS)',
        titleEn: 'Cooking Mode & Text-to-Speech (TTS)',
        src: 'assets/videos/V2_Kochmodusclip.mp4',
        duration: '0:22',
        descDe: 'Demonstration des interaktiven Kochmodus. Dank Sprachausgabe liest der intelligente Assistent die Zubereitungsschritte vor, damit man beim Kochen die Hände frei hat.',
        descEn: 'Demonstration of the interactive cooking mode. Thanks to speech synthesis, the assistant reads out the cooking steps hands-free.'
    },
    {
        id: 'v3',
        titleDe: 'Rezept anpassen per KI',
        titleEn: 'Customize Recipe via AI',
        src: 'assets/videos/V3_Rezept_anpassen_clip.mp4',
        duration: '1:16',
        descDe: 'Zeigt, wie flexibel die Anwendung ist: Ein generiertes Rezept lässt sich nachträglich anpassen (z. B. "mach es schärfer" oder "vegane Option"), woraufhin Gemini das Rezept neu ausgibt.',
        descEn: 'Shows the app flexibility: Any generated recipe can be modified on the fly (e.g. "make it spicier" or "vegan option"), and Gemini adjusts it instantly.'
    },
    {
        id: 'v4',
        titleDe: 'Rezept im LocalStorage speichern',
        titleEn: 'Save Recipe in LocalStorage',
        duration: '1:33',
        src: 'assets/videos/V4_Rezept_speichern_im_lokalstorage.mp4',
        descDe: 'EcoChef speichert Lieblingsrezepte dauerhaft lokal ab. Dieser Clip zeigt das Speichern, Abrufen und Verwalten der erstellten Rezepte ohne Server-Zwang.',
        descEn: 'EcoChef stores favorite recipes permanently in local storage. This clip shows saving, loading, and managing custom recipes serverlessly.'
    },
    {
        id: 'v5',
        titleDe: 'Farbschema-Wechsel (Dark/Light Mode)',
        titleEn: 'Theme Toggle (Dark/Light Mode)',
        duration: '0:50',
        src: 'assets/videos/V5_Dark_Light_Mode_Wechsel.mp4',
        descDe: 'Veranschaulichung des flüssigen und barrierefreien Wechsels zwischen Dark und Light Mode in der EcoChef-App, abgestimmt auf die Präferenzen des Benutzers.',
        descEn: 'Demonstration of the smooth and accessible transition between dark and light modes in the EcoChef application, tailored to user preferences.'
    }
];

export function initPraktikumsbetriebMedia() {
    const isInternshipPage = window.location.pathname.endsWith('praktikumsbetrieb.html') || document.getElementById('dfg-gallery-section');
    if (!isInternshipPage) return;

    setupDfgGallery();
    setupEcoChefVideoPlayer();
    setupElektroCheckScanner();
}

// 1. Setup DFG Interactive Gallery
function setupDfgGallery() {
    const tabsContainer = document.getElementById('dfg-gallery-tabs');
    const imageEl = document.getElementById('dfg-gallery-img');
    const titleEl = document.getElementById('dfg-gallery-title');
    const descEl = document.getElementById('dfg-gallery-desc');

    if (!tabsContainer || !imageEl || !titleEl || !descEl) return;

    let activeIndex = 0;

    function updateGalleryUI() {
        const lang = document.documentElement.getAttribute('lang') || 'de';
        const item = DFG_GALLERY_DATA[activeIndex];

        // Update Image attributes (supporting WCAG Alt text)
        imageEl.style.opacity = '0';
        setTimeout(() => {
            imageEl.src = (window.resolveAssetPath || (p => p))(item.src);
            imageEl.alt = lang === 'de' ? item.altDe : item.altEn;
            imageEl.style.opacity = '1';
        }, 150);

        // Update titles & descriptions
        titleEl.textContent = lang === 'de' ? item.titleDe : item.titleEn;
        descEl.textContent = lang === 'de' ? item.descDe : item.descEn;

        // Update Tab active classes & accessibility attributes
        const buttons = tabsContainer.querySelectorAll('.gallery-tab-btn');
        buttons.forEach((btn, index) => {
            if (index === activeIndex) {
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            }
        });
    }

    // Build the buttons dynamically
    tabsContainer.innerHTML = '';
    DFG_GALLERY_DATA.forEach((item, index) => {
        const btn = document.createElement('button');
        btn.className = 'gallery-tab-btn';
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-controls', 'dfg-gallery-viewer');
        btn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');

        // Language specific label inside button
        btn.innerHTML = `
            <i class="fa-solid fa-image" aria-hidden="true"></i>
            <span lang="de">${item.titleDe}</span>
            <span lang="en">${item.titleEn}</span>
        `;

        btn.addEventListener('click', () => {
            activeIndex = index;
            updateGalleryUI();
        });

        tabsContainer.appendChild(btn);
    });

    // Listen for global language change events
    document.addEventListener('langchange', () => {
        updateGalleryUI();
    });

    // Initialize UI
    updateGalleryUI();
}

// 2. Setup EcoChef Video Playlist Player
function setupEcoChefVideoPlayer() {
    const videoEl = document.getElementById('ecochef-video-player');
    const tracksContainer = document.getElementById('ecochef-video-tracks');
    const currentTitleEl = document.getElementById('ecochef-video-current-title');
    const currentDescEl = document.getElementById('ecochef-video-current-desc');

    if (!videoEl || !tracksContainer || !currentTitleEl || !currentDescEl) return;

    let activeIndex = 0;

    function updateVideoUI(shouldPlay = false) {
        const lang = document.documentElement.getAttribute('lang') || 'de';
        const videoItem = ECOCHEF_VIDEO_DATA[activeIndex];

        // Update player source
        const wasPaused = videoEl.paused;
        videoEl.src = (window.resolveAssetPath || (p => p))(videoItem.src);
        videoEl.load();

        if (shouldPlay && !wasPaused) {
            videoEl.play().catch(err => console.log('Autoplay blocked or interrupted:', err));
        }

        // Update titles and descriptions
        currentTitleEl.textContent = lang === 'de' ? videoItem.titleDe : videoItem.titleEn;
        currentDescEl.textContent = lang === 'de' ? videoItem.descDe : videoItem.descEn;

        // Update track active class
        const buttons = tracksContainer.querySelectorAll('.playlist-track-btn');
        buttons.forEach((btn, index) => {
            if (index === activeIndex) {
                btn.classList.add('active');
                btn.setAttribute('aria-current', 'true');
            } else {
                btn.classList.remove('active');
                btn.removeAttribute('aria-current');
            }
        });
    }

    // Build the playlist track buttons dynamically
    tracksContainer.innerHTML = '';
    ECOCHEF_VIDEO_DATA.forEach((videoItem, index) => {
        const btn = document.createElement('button');
        btn.className = 'playlist-track-btn';
        btn.setAttribute('aria-label', `Play video: ${videoItem.titleDe}`);

        btn.innerHTML = `
            <div class="track-icon">
                <i class="fa fa-play-circle" aria-hidden="true"></i>
            </div>
            <div class="track-title-wrapper">
                <div class="track-title">
                    <span lang="de">${videoItem.titleDe}</span>
                    <span lang="en">${videoItem.titleEn}</span>
                </div>
                <div class="track-duration">${videoItem.duration} Min</div>
            </div>
        `;

        btn.addEventListener('click', () => {
            activeIndex = index;
            updateVideoUI(true);
        });

        tracksContainer.appendChild(btn);
    });

    // Listen for global language change events
    document.addEventListener('langchange', () => {
        updateVideoUI(false);
    });

    // Initialize UI
    updateVideoUI(false);
}

// 3. Setup ElektroCheck AI Live Defect Scanner
function setupElektroCheckScanner() {
    const runBtn = document.getElementById('run-scanner-btn');
    const clearBtn = document.getElementById('clear-scanner-btn');
    const laser = document.getElementById('scanner-laser');
    const spinner = document.getElementById('scanner-spinner');
    const playIcon = document.getElementById('scanner-play-icon');
    const statusBox = document.getElementById('scanner-status');
    const resultsCard = document.getElementById('scanner-results-card');
    const resultsList = document.getElementById('scanner-results-list');

    if (!runBtn || !clearBtn || !laser || !statusBox || !resultsCard || !resultsList) return;

    let bboxRenderer = null;

    const defects = [
        {
            x: 0.45,
            y: 0.68,
            width: 0.18,
            height: 0.22,
            label: "Isolationsfehler / Cable damage",
            color: "#ef4444",
            titleDe: "⚠️ Kabel beschädigt (Isolationsfehler)",
            titleEn: "⚠️ Damaged Cable (Insulation fault)",
            risk: "CRITICAL",
            descDe: "Das Netzkabel der Kaffeemaschine weist eine mechanische Beschädigung mit freiliegenden Adern auf. Gefahr von Kurzschluss und elektrischem Schlag.",
            descEn: "The power cord shows mechanical damage with exposed copper wires. Risk of short circuit and electric shock.",
            actionDe: "Maßnahme: Sofort außer Betrieb nehmen, Plakette 'Gesperrt' anbringen und Kabel tauschen.",
            actionEn: "Action: Decommission immediately, attach 'Locked' label, and replace power cord."
        },
        {
            x: 0.72,
            y: 0.22,
            width: 0.08,
            height: 0.1,
            label: "Prüffrist überfällig / Overdue",
            color: "#f97316",
            titleDe: "⏱️ Prüffrist abgelaufen (DGUV V3)",
            titleEn: "⏱️ Testing Period Overdue (DGUV V3)",
            risk: "MEDIUM",
            descDe: "Die regelmäßige Sicherheitsprüfung nach DGUV Vorschrift 3 für diese Kaffeemaschine ist seit Mai 2026 abgelaufen.",
            descEn: "The regular safety inspection according to DGUV regulation 3 for this coffee machine is overdue since May 2026.",
            actionDe: "Maßnahme: Wiederholungsprüfung durch befähigte Person unverzüglich durchführen lassen.",
            actionEn: "Action: Schedule re-testing by a qualified inspector immediately."
        }
    ];

    function renderResultsList() {
        const lang = document.documentElement.getAttribute('lang') || 'de';
        resultsList.innerHTML = defects.map(d => `
            <div class="scanner-result-item ${d.risk.toLowerCase()}">
                <div class="scanner-result-title">
                    <span>${lang === 'de' ? d.titleDe : d.titleEn}</span>
                    <span class="badge-match" style="background:${d.color}; color:white; font-size:0.7rem; padding:0.1rem 0.4rem;">${d.risk}</span>
                </div>
                <div class="scanner-result-desc">${lang === 'de' ? d.descDe : d.descEn}</div>
                <div class="scanner-result-action">${lang === 'de' ? d.actionDe : d.actionEn}</div>
            </div>
        `).join('');
    }

    runBtn.addEventListener('click', () => {
        const lang = document.documentElement.getAttribute('lang') || 'de';

        // Lazy instantiate BoundingBoxRenderer
        if (!bboxRenderer && typeof BoundingBoxRenderer !== 'undefined') {
            bboxRenderer = new BoundingBoxRenderer('uploaded-image', 'bounding-box-overlay');
        }

        // Start scanning state
        runBtn.disabled = true;
        clearBtn.disabled = true;
        if (spinner) spinner.style.display = 'inline-block';
        if (playIcon) playIcon.style.display = 'none';
        laser.classList.add('active');

        statusBox.innerHTML = lang === 'de'
            ? `<span><i class="fa fa-sync fa-spin"></i> KI analysiert Bild auf Mängel...</span>`
            : `<span><i class="fa fa-sync fa-spin"></i> AI analyzing image for anomalies...</span>`;

        resultsCard.classList.add('collapsed');

        // Simulate AI response delay
        setTimeout(() => {
            laser.classList.remove('active');
            if (spinner) spinner.style.display = 'none';
            if (playIcon) playIcon.style.display = 'inline-block';
            clearBtn.disabled = false;

            statusBox.innerHTML = lang === 'de'
                ? `<span><i class="fa fa-check-circle" style="color:#10b981;"></i> Analyse abgeschlossen. 2 Mängel identifiziert.</span>`
                : `<span><i class="fa fa-check-circle" style="color:#10b981;"></i> Analysis completed. 2 defects identified.</span>`;

            // Draw bounding boxes
            if (bboxRenderer) {
                bboxRenderer.renderBoundingBoxes(defects);
            }

            // Fill results list and show
            renderResultsList();
            resultsCard.classList.remove('collapsed');

            // Log dynamic commit grid increment (Punkte sammeln!)
            if (typeof window.addLiveCommit === 'function') {
                window.addLiveCommit();
            }
        }, 2200);
    });

    clearBtn.addEventListener('click', () => {
        const lang = document.documentElement.getAttribute('lang') || 'de';

        if (bboxRenderer) {
            bboxRenderer.clearBoundingBoxes();
        }

        resultsCard.classList.add('collapsed');
        clearBtn.disabled = true;
        runBtn.disabled = false;

        statusBox.innerHTML = lang === 'de'
            ? `<span><i class="fa-solid fa-circle-info"></i> Bereit für Analyse.</span>`
            : `<span><i class="fa-solid fa-circle-info"></i> Ready for analysis.</span>`;
    });

    // Listen for language changes to update existing details
    document.addEventListener('langchange', () => {
        if (!resultsCard.classList.contains('collapsed')) {
            renderResultsList();

            // Re-render status text
            const lang = document.documentElement.getAttribute('lang') || 'de';
            statusBox.innerHTML = lang === 'de'
                ? `<span><i class="fa fa-check-circle" style="color:#10b981;"></i> Analyse abgeschlossen. 2 Mängel identifiziert.</span>`
                : `<span><i class="fa fa-check-circle" style="color:#10b981;"></i> Analysis completed. 2 defects identified.</span>`;
        } else {
            const lang = document.documentElement.getAttribute('lang') || 'de';
            statusBox.innerHTML = lang === 'de'
                ? `<span><i class="fa-solid fa-circle-info"></i> Bereit für Analyse.</span>`
                : `<span><i class="fa-solid fa-circle-info"></i> Ready for analysis.</span>`;
        }
    });
}

// Register initialization
if (typeof window !== 'undefined') {
    window.initPraktikumsbetriebMedia = initPraktikumsbetriebMedia;
}
