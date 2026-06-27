// scripts/generate_projects_data.js
const fs = require('fs');
const path = require('path');
const https = require('https');

const projectsDataFile = path.resolve(__dirname, '..', 'assets', 'js', 'projects_data.js');
const projectsJsonFile = path.resolve(__dirname, '..', 'assets', 'data', 'projects.json');

const baseProjects = [
  {
    "repoName": "ElektroCheck-AI",
    "titleDe": "⚡ ElektroCheck AI — Intelligente Prüfberichtsanalyse",
    "titleEn": "⚡ ElektroCheck AI — Intelligent Inspection Report Analytics",
    "tags": ["React / Vite", "OpenAI API", "PDF Parsing", "TailwindCSS", "AI Integration"],
    "image": "assets/images/elektrocheck_showcase.png",
    "link": "Projekte/ElektroCheck%20AI/dist/index.html",
    "descDe": "ElektroCheck AI ist eine intelligente Web-Applikation zur Analyse von DGUV V3 Prüfprotokollen. Mittels künstlicher Intelligenz scannt die Anwendung Sicherheitsberichte von Elektroprüfungen, identifiziert Anomalien oder Mängel im Text und schlägt vollautomatisch strukturierte Maßnahmenpläne vor.",
    "descEn": "ElektroCheck AI is an intelligent web application for analyzing DGUV V3 safety inspection reports. Powered by artificial intelligence, it scans safety reports, identifies anomalies or defects, and generates structured action plans automatically.",
    "category": "ai",
    "stars": 4
  },
  {
    "repoName": "Wohnungssuche-KI",
    "titleDe": "🏠 Wohnungssuche KI — Intelligenter Such-Assistent",
    "titleEn": "🏠 Wohnungssuche KI — Intelligent Apartment Finder",
    "tags": ["React / Vite", "Node.js / Express", "Puppeteer / Scraper", "OpenAI API", "Capacitor PWA"],
    "image": "assets/images/wohnungssuche_showcase.png",
    "link": "Projekte/Wohnungssuche%20KI/frontend/dist/index.html",
    "descDe": "Eine KI-gestützte Komplettlösung zur automatisierten Wohnungssuche. Das System scannt Immobilienportale per Web-Scraper und E-Mail-Postfächer per IMAP, analysiert Angebote mit GPT-Modellen, berechnet Entfernungen zu POIs und generiert fertige Bewerbungs-PDFs.",
    "descEn": "An AI-powered system designed to automate apartment searching. It scrapes real estate portals via Puppeteer, scans inbox folders using IMAP, evaluates listings using OpenAI's API, calculates POI proximity, and generates custom tenant disclosure PDFs.",
    "category": "ai filter-web",
    "stars": 5
  },
  {
    "repoName": "Glücksspiel",
    "titleDe": "🎰 Glücksspiel — Casual Games Plattform",
    "titleEn": "🎰 Glücksspiel — Casual Mini Games Suite",
    "tags": ["Vanilla JavaScript", "Web Audio API", "LocalStorage", "CSS3 Animations", "Game Design"],
    "image": "assets/images/gluecksspiel_showcase.png",
    "link": "Projekte/Glücksspiel/index.html",
    "descDe": "Eine bunte, animierte Casino-Spiele-Plattform mit klassischen Casual-Mini-Spielen wie Spielautomaten (Slots), Roulette, Plinko, Mines und dem Zauberkessel (Cauldron). Das Projekt zeichnet sich durch flüssige CSS-Animationen, Soundeffekte und ein lokales Guthaben-Management aus.",
    "descEn": "A vibrant casino mini-games platform featuring slots, roulette, plinko, mines, and cauldron. The project features smooth CSS animations, retro sound effects, and persistent local balance tracking.",
    "category": "games",
    "stars": 3
  },
  {
    "repoName": "Jobsuche",
    "titleDe": "💼 Jobsuche — PWA Stellenportal",
    "titleEn": "💼 Jobsuche — PWA Job Board",
    "tags": ["HTML5 / CSS3", "Vanilla JS", "REST Integration", "PWA / Offline", "Job Board"],
    "image": "assets/images/jobsuche_showcase.png",
    "link": "Projekte/Jobbsuche/index.html",
    "descDe": "Jobsuche ist ein PWA-basiertes Stellenportal für Webentwickler. Es ermöglicht das Suchen, Filtern und Speichern von Jobangeboten. Dank PWA-Technologie können gemerkte Stellen offline eingesehen werden, und Push-Benachrichtigungen informieren über neue Angebote.",
    "descEn": "Jobsuche is a PWA job board for web developers. It allows users to search, filter, and save job postings. Thanks to PWA technologies, saved jobs are readable offline, and push notifications alert you about new listings.",
    "category": "web",
    "stars": 2
  },
  {
    "repoName": "ManuFaktur",
    "titleDe": "🎨 ManuFAKTUR Schenk — Kunst- & Bildergalerie",
    "titleEn": "🖼️ ManuFAKTUR Schenk — Art Portfolio & Gallery",
    "tags": ["HTML5 / CSS3", "Vanilla JS", "LocalStorage", "Bildergalerie", "Merkliste"],
    "image": "assets/images/manufaktur_showcase.png",
    "link": "Projekte/ManuFaktur/index.html",
    "descDe": "Ein kunstvolles Web-Portfolio für handgemalte Bilder und Kunstwerke. Die responsive Seite präsentiert Tierportraits und Landschaftsgemälde (Acryl/Öl), bietet eine interaktive Bildergalerie mit Lightbox-Effekt, ein individuelles Kontaktformular sowie eine neue, persistente Favoriten/Merkliste (LocalStorage) für interessierte Käufer.",
    "descEn": "An artistic web portfolio showcasing hand-painted custom artworks. The responsive website features sections for pet portraits and landscapes (acrylic/oil), an interactive lightbox image gallery, a custom order form, and a newly integrated persistent Favorites Wishlist (LocalStorage) for potential buyers.",
    "category": "web",
    "stars": 2
  },
  {
    "repoName": "arbeitszeiterfassung",
    "titleDe": "⏱️ Arbeitszeiterfassung — PWA Zeiterfassung",
    "titleEn": "⏱️ Arbeitszeiterfassung — Time Tracker PWA",
    "tags": ["PWA / Mobile First", "Firebase Cloud-Sync", "Chart.js & SVG Analytics", "Vanilla JS", "Productivity"],
    "image": "assets/images/arbeitszeit_showcase.png",
    "link": "Projekte/arbeitszeiterfassung/index.html",
    "descDe": "Eine PWA auf Enterprise-Niveau zur Erfassung von Arbeitsstunden, Überstunden und Abwesenheiten (Urlaub/Krankheit). Die App bietet Firebase Cloud-Synchronisation, ArbZG-Pausenautomatik, erweiterte Projekt-Analytics per SVG Donut-Chart und einen nativen Dark/Light-Mode.",
    "descEn": "An enterprise-grade PWA to track daily working hours, overtime, and absences. Features include real-time Firebase Cloud-Sync, automated legal break calculations, advanced project analytics via SVG donut charts, and a native Dark/Light mode switch.",
    "category": "web",
    "stars": 4
  },
  {
    "repoName": "finance-ai-bot",
    "titleDe": "🤖 Finance AI Bot — Finanzplaner & Chatbot",
    "titleEn": "🤖 Finance AI Bot — Financial Assistant & Chatbot",
    "tags": ["NLP / AI Bot", "JavaScript (ES6+)", "Financial Analytics", "Conversational UI", "Flexbox / CSS3"],
    "image": "assets/images/finance_bot_showcase.png",
    "link": "Projekte/finance-ai-bot/frontend/index.html",
    "descDe": "Finance AI Bot ist ein interaktiver Finanzplaner-Assistent. Der Chatbot verarbeitet natürliche Sprache, analysiert persönliche Einnahmen und Ausgaben, berechnet Sparraten und hilft Nutzern dabei, ein monatliches Budget spielerisch zu planen.",
    "descEn": "Finance AI Bot is an interactive financial assistant chatbot. It processes natural language queries to analyze personal income and expenses, calculate savings rates, and help users set and achieve monthly budget targets.",
    "category": "ai filter-web",
    "stars": 3
  },
  {
    "repoName": "CoOpVersusGame",
    "titleDe": "🎮 CoOpVersusGame — Multiplayer Co-Op/Versus Prototyp",
    "titleEn": "🎮 CoOpVersusGame — Multiplayer Co-Op/Versus Prototype",
    "tags": ["Godot Engine 4", "GDScript", "Multiplayer / LAN", "2D Action", "Game Design"],
    "image": "assets/images/coopgame_showcase.png",
    "link": "Projekte/Games/CoOpVersusGame/",
    "descDe": "Ein plattformübergreifender Multiplayer-Prototyp, entwickelt mit Godot 4.6. Das Spiel bietet ein integriertes Lobby-System für LAN- und Netzwerkverbindungen, kooperative Missionen und Versus-Modi, Boss- und Gegner-KIs, Power-ups sowie interaktive Druckplatten-Rätsel.",
    "descEn": "A cross-platform multiplayer game prototype built in Godot 4.6. It features a local/network lobby system, cooperative missions, versus modes, intelligent boss/enemy AI, power-ups, and interactive pressure-plate puzzles.",
    "category": "games",
    "stars": 2
  },
  {
    "repoName": "orbital-scrap",
    "titleDe": "🚀 OrbitalScrap — Sci-Fi Clicker- & Idle-Game",
    "titleEn": "🚀 OrbitalScrap — Sci-Fi Clicker & Idle Game",
    "tags": ["Godot Engine 4", "GDScript", "Incremental Game", "Jolt 3D Physics", "UI & Game Loop"],
    "image": "assets/images/orbital_scrap_showcase.png",
    "link": "Projekte/orbital-scrap/",
    "descDe": "Ein inkrementelles Weltraum-Clicker-Spiel, entwickelt in Godot 4.6. Spieler sammeln Weltraumschrott per Mausklick, erwerben automatisierte Sammeldrohnen mit exponentiell steigenden Kosten und optimieren ihre Schrottproduktion pro Sekunde im Hintergrund.",
    "descEn": "An incremental sci-fi space clicker game built in Godot 4.6. Players gather space scrap manually, purchase autonomous harvesting drones with compounding costs, and monitor their production rates in real time.",
    "category": "games",
    "stars": 3
  },
  {
    "repoName": null,
    "titleDe": "🐍 Retro-Klassiker Snake (Javascript)",
    "titleEn": "🐍 Retro Classic Snake (Javascript)",
    "tags": ["HTML5 Canvas", "CSS3", "Vanilla JS (ES6)", "LocalStorage"],
    "image": null,
    "link": "snake.html",
    "descDe": "Ein responsives Browserspiel, das auf einem HTML5-Canvas gerendert wird. Es verfügt über eine präzise Steuerung, Pausen- und Neustartfunktionen sowie eine persistente Highscore-Speicherung mittels LocalStorage.",
    "descEn": "A responsive browser game rendered on an HTML5 canvas. Features precise movement controls, start/pause/restart functions, and persistent high score storage using LocalStorage.",
    "category": "games"
  },
  {
    "repoName": null,
    "titleDe": "💡 Interaktives IT-Wissens-Quiz",
    "titleEn": "💡 Interactive IT Knowledge Quiz",
    "tags": ["DOM Manipulation", "Dynamic HTML", "UX Design", "Accessibility"],
    "image": null,
    "link": "quiz.html",
    "descDe": "Ein barrierefreies Web-Quiz mit einer dynamischen Benutzeroberfläche. Das System bietet sofortiges visuelles UX-Feedback (Grün/Rot-Farben), sperrt Mehrfachantworten, zeigt den Lernfortschritt über eine animierte Leiste an und berechnet abschließend eine detaillierte Auswertung.",
    "descEn": "An accessible web quiz with a dynamic user interface. The system provides instant visual UX feedback, locks choices after submission, displays progress via an animated bar, and shows a detailed scorecard at the end.",
    "category": "web"
  },
  {
    "repoName": null,
    "titleDe": "🧠 Memory — Finde die Paare",
    "titleEn": "🧠 Memory — Find the Pairs",
    "tags": ["CSS 3D Transforms", "IntersectionObserver", "Game Logic", "LocalStorage"],
    "image": null,
    "link": "memory.html",
    "descDe": "Ein klassisches Gedächtnisspiel mit 8 Paaren programmierungsbezogener Symbole. Features: CSS-Flip-Animationen, Zugzähler, Timer und persistenter Highscore.",
    "descEn": "A classic memory game with 8 pairs of programming-related symbols. Features: CSS flip animations, move counter, timer, and persistent high score.",
    "category": "games"
  }
];

function fetchRepoInfo(repoName) {
  return new Promise((resolve) => {
    if (!repoName) return resolve(null);
    const options = {
      hostname: 'api.github.com',
      path: `/repos/Schengii/${repoName}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (_) {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    }).on('error', () => {
      resolve(null);
    });
  });
}

async function build() {
  console.log('Fetching GitHub repository data...');
  const enriched = [];

  for (const project of baseProjects) {
    if (project.repoName) {
      const info = await fetchRepoInfo(project.repoName);
      if (info) {
        project.stars = info.stargazers_count || 0;
        project.githubUrl = info.html_url;
        project.updatedAt = info.updated_at;
        project.language = info.language || "";
        if (info.homepage && info.homepage.trim() !== '') {
          project.link = info.homepage;
        }
        console.log(`Enriched ${project.repoName}: ${project.stars} stars`);
      } else {
        project.stars = 0;
        project.githubUrl = `https://github.com/Schengii/${project.repoName}`;
        project.updatedAt = new Date().toISOString();
        console.log(`Fallback for ${project.repoName} (No API info)`);
      }
    }
    enriched.push(project);
  }

  // Write static JS
  const jsContent = `window.projectsData = ${JSON.stringify(enriched, null, 2)};\n`;
  fs.writeFileSync(projectsDataFile, jsContent, 'utf-8');
  console.log(`Successfully generated projects_data.js -> ${projectsDataFile}`);

  // Write static JSON
  fs.writeFileSync(projectsJsonFile, JSON.stringify(enriched, null, 2), 'utf-8');
  console.log(`Successfully generated projects.json -> ${projectsJsonFile}`);
}

build();
