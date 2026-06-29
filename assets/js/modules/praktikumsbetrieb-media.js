/**
 * Praktikumsbetrieb Media Module — Handles DFG Image Gallery and EcoChef Video Player
 */

// Global state for media items
const DFG_GALLERY_DATA = [
    {
        id: 'abteilungen',
        titleDe: 'Abteilungen der DFG',
        titleEn: 'DFG Departments',
        src: 'assets/images/Abteilungen-DFG.png',
        altDe: 'Organigramm der DFG mit den verschiedenen Abteilungen und deren Beziehungen.',
        altEn: 'DFG organization chart showing various departments and their relationships.',
        descDe: 'Dieses Organigramm zeigt die strukturelle Aufteilung der DFG in verschiedene Fachabteilungen und administrative Bereiche.',
        descEn: 'This organization chart shows the structural division of the DFG into various specialist departments and administrative areas.'
    },
    {
        id: 'team-anwendungsmanagement',
        titleDe: 'Team Anwendungsmanagement Z-INF',
        titleEn: 'Application Management Team Z-INF',
        src: 'assets/images/Team-Anwendungsmanagement-Z-INF.png',
        altDe: 'Struktur des Teams Anwendungsmanagement der Z-INF Abteilung mit Rollen und Personen.',
        altEn: 'Structure of the application management team in the Z-INF department with roles and team members.',
        descDe: 'Die Zusammensetzung des 9-köpfigen Web-Entwicklerteams mit Schwerpunkt Frontend-Technologien, in dem Maximilian eingesetzt war.',
        descEn: 'The composition of the 9-member web development team focusing on frontend technologies where Maximilian was deployed.'
    },
    {
        id: 'zuständigkeiten',
        titleDe: 'Fachliche Zuständigkeiten Z-INF',
        titleEn: 'Z-INF Areas of Expertise',
        src: 'assets/images/Fachliche-Zuständigkeiten-Z-INF.png',
        altDe: 'Übersichtsdiagramm der fachlichen Zuständigkeiten innerhalb der Z-INF Gruppe.',
        altEn: 'Overview diagram of specialized responsibilities within the Z-INF group.',
        descDe: 'Dieses Diagramm ordnet die verschiedenen Fachbereiche und Software-Zuständigkeiten den jeweiligen Entwicklergruppen innerhalb der Z-INF Abteilung zu.',
        descEn: 'This diagram maps the various technical areas and software responsibilities to the respective developer groups within the Z-INF department.'
    },
    {
        id: 'foerderaktivitaeten',
        titleDe: 'Förderaktivitäten DFG 2023',
        titleEn: 'DFG Funding Activities 2023',
        src: 'assets/images/Förderaktivitäten-DFG-2023.png',
        altDe: 'Diagramm zur Verteilung der DFG-Fördergelder nach Wissenschaftsbereichen im Jahr 2023.',
        altEn: 'Chart showing the distribution of DFG funding by scientific domain in the year 2023.',
        descDe: 'Statistische Übersicht über die Bewilligungen und Verteilungen der DFG-Mittel im Jahr 2023 nach Fachgebieten.',
        descEn: 'Statistical overview of DFG approvals and funding distributions in 2023 by scientific field.'
    },
    {
        id: 'neufa',
        titleDe: 'Projekt Neufa-dfg',
        titleEn: 'Project Neufa DFG',
        src: 'assets/images/Projekt-Neufa-dfg.png',
        altDe: 'Visualisierung des DFG Projekts Neufa zur Modernisierung der IT-Infrastruktur.',
        altEn: 'Visualization of the DFG Project Neufa for modernizing the IT infrastructure.',
        descDe: 'Einblicke in die Modernisierungs- und Web-Infrastruktur-Initiative (Projekt Neufa), an der Maximilian mitwirkte.',
        descEn: 'Insights into the modernization and web infrastructure initiative (Project Neufa) in which Maximilian participated.'
    },
    {
        id: 'elan',
        titleDe: 'Das elan-Portal',
        titleEn: 'The elan Portal',
        src: 'assets/images/Elan-Bild.png',
        altDe: 'Screenshot des elan-Portals für elektronische Antragstellung bei der DFG.',
        altEn: 'Screenshot of the elan portal for electronic research proposal submissions at the DFG.',
        descDe: 'Das zentrale Portal der DFG zur Einreichung von Forschungsanträgen. Maximilian arbeitete an Frontend-Komponenten dieses Systems.',
        descEn: 'The central DFG portal for submitting research proposals. Maximilian worked on frontend components for this system.'
    },
    {
        id: 'sprint',
        titleDe: 'Agiler Sprint-Zyklus',
        titleEn: 'Agile Sprint Cycle',
        src: 'assets/images/Sprint-Zyklus.png',
        altDe: 'Darstellung des agilen Scrum-Prozesses mit Sprint-Planung, Daily Standup, Review und Retrospektive.',
        altEn: 'Diagram showing the agile Scrum process with Sprint Planning, Daily Standup, Review, and Retrospective.',
        descDe: 'Die agile Entwicklungsmethodik (Scrum) bei der DFG, bestehend aus 2-Wochen-Sprints zur strukturierten Projektabwicklung.',
        descEn: 'The agile development methodology (Scrum) used at DFG, utilizing 2-week sprints for structured project execution.'
    }
];

const ECOCHEF_VIDEO_DATA = [
    {
        id: 'v1',
        titleDe: 'Hauptclip — Übersicht & Navigation',
        titleEn: 'Main Clip — Overview & Navigation',
        src: 'assets/videos/V1 - Hauptclip.mp4',
        duration: '1:06',
        descDe: 'Der Hauptclip zeigt das grundlegende Konzept von EcoChef: Zutateneingabe im virtuellen Kühlschrank, Absenden an die Gemini-KI, Generierung des Rezepts mit Nährwert- und CO2-Ersparnis-Berechnung.',
        descEn: 'The main clip highlights the core concept of EcoChef: entering ingredients in the virtual pantry, submitting to Gemini AI, and generating custom recipes with nutrition and carbon savings data.'
    },
    {
        id: 'v2',
        titleDe: 'Kochmodus & Sprachausgabe (TTS)',
        titleEn: 'Cooking Mode & Text-to-Speech (TTS)',
        src: 'assets/videos/V2 - Kochmodusclip.mp4',
        duration: '0:22',
        descDe: 'Demonstration des interaktiven Kochmodus. Dank Sprachausgabe liest der intelligente Assistent die Zubereitungsschritte vor, damit man beim Kochen die Hände frei hat.',
        descEn: 'Demonstration of the interactive cooking mode. Thanks to speech synthesis, the assistant reads out the cooking steps hands-free.'
    },
    {
        id: 'v3',
        titleDe: 'Rezept anpassen per KI',
        titleEn: 'Customize Recipe via AI',
        src: 'assets/videos/V3 - Rezept anpassen clip.mp4',
        duration: '1:16',
        descDe: 'Zeigt, wie flexibel die Anwendung ist: Ein generiertes Rezept lässt sich nachträglich anpassen (z. B. "mach es schärfer" oder "vegane Option"), woraufhin Gemini das Rezept neu ausgibt.',
        descEn: 'Shows the app flexibility: Any generated recipe can be modified on the fly (e.g. "make it spicier" or "vegan option"), and Gemini adjusts it instantly.'
    },
    {
        id: 'v4',
        titleDe: 'Rezept im LocalStorage speichern',
        titleEn: 'Save Recipe in LocalStorage',
        duration: '1:33',
        src: 'assets/videos/V4 - Rezept speichern im lokalstorage.mp4',
        descDe: 'EcoChef speichert Lieblingsrezepte dauerhaft lokal ab. Dieser Clip zeigt das Speichern, Abrufen und Verwalten der erstellten Rezepte ohne Server-Zwang.',
        descEn: 'EcoChef stores favorite recipes permanently in local storage. This clip shows saving, loading, and managing custom recipes serverlessly.'
    },
    {
        id: 'v5',
        titleDe: 'Farbschema-Wechsel (Dark/Light Mode)',
        titleEn: 'Theme Toggle (Dark/Light Mode)',
        duration: '0:50',
        src: 'assets/videos/V5 - Dark Light Mode Wechsel.mp4',
        descDe: 'Veranschaulichung des flüssigen und barrierefreien Wechsels zwischen Dark und Light Mode in der EcoChef-App, abgestimmt auf die Präferenzen des Benutzers.',
        descEn: 'Demonstration of the smooth and accessible transition between dark and light modes in the EcoChef application, tailored to user preferences.'
    }
];

function initPraktikumsbetriebMedia() {
    const isInternshipPage = window.location.pathname.endsWith('praktikumsbetrieb.html') || document.getElementById('dfg-gallery-section');
    if (!isInternshipPage) return;

    setupDfgGallery();
    setupEcoChefVideoPlayer();
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
            imageEl.src = item.src;
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
        videoEl.src = videoItem.src;
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

// Register initialization
if (typeof window !== 'undefined') {
    window.initPraktikumsbetriebMedia = initPraktikumsbetriebMedia;
}
