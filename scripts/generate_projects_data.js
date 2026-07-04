// scripts/generate_projects_data.js
const fs = require('fs');
const path = require('path');
const https = require('https');

const projectsDataFile = path.resolve(__dirname, '..', 'assets', 'js', 'projects_data.js');
const projectsJsonFile = path.resolve(__dirname, '..', 'assets', 'data', 'projects.json');
const projectsBaseDir = path.resolve(__dirname, '..', 'Projekte');

// Static projects that are not scanned (either root HTML files or external GitHub projects not cloned locally)
const staticProjects = [
  {
    "repoName": "CoOpVersusGame",
    "titleDe": "🎮 CoOpVersusGame — Multiplayer Co-Op/Versus Prototyp",
    "titleEn": "🎮 CoOpVersusGame — Multiplayer Co-Op/Versus Prototype",
    "tags": ["Godot Engine 4", "GDScript", "Multiplayer / LAN", "2D Action", "Game Design"],
    "image": "assets/images/coopgame_showcase.png",
    "link": null,
    "descDe": "Ein plattformübergreifender Multiplayer-Prototyp, entwickelt mit Godot 4.6. Das Spiel bietet ein integriertes Lobby-System für LAN- und Netzwerkverbindungen, kooperative Missionen und Versus-Modi, Boss- und Gegner-KIs, Power-ups sowie interaktive Druckplatten-Rätsel.",
    "descEn": "A cross-platform multiplayer game prototype built in Godot 4.6. It features a local/network lobby system, cooperative missions, versus modes, intelligent boss/enemy AI, power-ups, and interactive pressure-plate puzzles.",
    "category": "games",
    "stars": 2,
    "language": "GDScript"
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
    "category": "games",
    "language": "JavaScript"
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
    "category": "web",
    "language": "JavaScript"
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
    "category": "games",
    "language": "JavaScript"
  },
  {
    "repoName": null,
    "titleDe": "☕ Java OOP & Spring Boot — Übungsprojekte",
    "titleEn": "☕ Java OOP & Spring Boot — Practice Projects",
    "tags": ["Java SE", "OOP", "Spring Boot", "JDBC / SQL", "Unit Testing"],
    "image": null,
    "link": null,
    "descDe": "Eine Sammlung von Java-Übungsanwendungen aus der Umschulung. Enthält Konsolenanwendungen, fortgeschrittene objektorientierte Entwurfsmuster (OOP), JUnit-Tests sowie eine Spring Boot REST-API zur Verwaltung von Kurs- und Schülerdaten.",
    "descEn": "A collection of Java practice applications from my retraining program. Includes command-line tools, advanced OOP design patterns, JUnit test suites, and a Spring Boot REST API for managing course and student databases.",
    "category": "web",
    "language": "Java"
  }
];

// Scan local folders for portfolio-metadata.json
function scanLocalProjects() {
  const scanned = [];
  if (!fs.existsSync(projectsBaseDir)) {
    console.warn(`Base projects directory not found: ${projectsBaseDir}`);
    return scanned;
  }

  const entries = fs.readdirSync(projectsBaseDir, { withFileTypes: true });
  entries.forEach(entry => {
    if (entry.isDirectory()) {
      const metadataPath = path.join(projectsBaseDir, entry.name, 'portfolio-metadata.json');
      if (fs.existsSync(metadataPath)) {
        try {
          const raw = fs.readFileSync(metadataPath, 'utf-8');
          const data = JSON.parse(raw);
          // Set standard defaults if missing
          data.link = data.link || `Projekte/${entry.name}/index.html`;
          scanned.push(data);
          console.log(`Scanned project metadata from: ${entry.name}`);
        } catch (e) {
          console.error(`Error reading metadata for folder ${entry.name}:`, e.message);
        }
      }
    }
  });

  return scanned;
}

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
  console.log('Scanning local projects...');
  const localProjects = scanLocalProjects();
  
  // Combine scanned projects and static/root projects
  const combinedProjects = [...localProjects, ...staticProjects];

  console.log(`Total projects to process: ${combinedProjects.length}`);
  console.log('Fetching GitHub repository data...');
  const enriched = [];

  for (const project of combinedProjects) {
    if (project.repoName) {
      const info = await fetchRepoInfo(project.repoName);
      if (info) {
        project.stars = info.stargazers_count || 0;
        project.githubUrl = info.html_url;
        project.updatedAt = info.updated_at;
        project.language = project.language || info.language || "";
        if (info.homepage && info.homepage.trim() !== '') {
          project.link = info.homepage;
        }
        console.log(`Enriched ${project.repoName}: ${project.stars} stars`);
      } else {
        project.stars = project.stars || 0;
        project.githubUrl = `https://github.com/Schengii/${project.repoName}`;
        project.updatedAt = new Date().toISOString();
        project.language = project.language || "";
        console.log(`Fallback for ${project.repoName} (No API info)`);
      }
    } else {
      project.language = project.language || "";
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
