// scripts/generate_projects_data.js
const fs = require('fs');
const path = require('path');
const https = require('https');

const projectsDataFile = path.resolve(__dirname, '..', 'assets', 'js', 'projects_data.js');
const projectsJsonFile = path.resolve(__dirname, '..', 'assets', 'data', 'projects.json');
const projectsBaseDir = path.resolve(__dirname, '..', 'Projekte');

// Static projects that are not scanned
/** @type {Array<Record<string, any>>} */
const staticProjects = [];

// Scan local folders for portfolio-metadata.json
function scanLocalProjects() {
    /** @type {Array<Record<string, any>>} */
    const scanned = [];
    if (!fs.existsSync(projectsBaseDir)) {
        console.warn(`Base projects directory not found: ${projectsBaseDir}`);
        return scanned;
    }

    const entries = fs.readdirSync(projectsBaseDir, { withFileTypes: true });
    entries.forEach((entry) => {
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

/** @param {string} repoName */
function fetchRepoInfo(repoName) {
    return new Promise((resolve) => {
        if (!repoName) return resolve(null);
        const options = {
            hostname: 'api.github.com',
            path: `/repos/Schengii/${repoName}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
        };
        https
            .get(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            resolve(JSON.parse(data));
                        } catch {
                            resolve(null);
                        }
                    } else {
                        resolve(null);
                    }
                });
            })
            .on('error', () => {
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
                project.language = project.language || info.language || '';
                if (info.homepage && info.homepage.trim() !== '') {
                    project.link = info.homepage;
                }
                console.log(`Enriched ${project.repoName}: ${project.stars} stars`);
            } else {
                project.stars = project.stars || 0;
                // Kein öffentliches Repo (privat, archiviert oder umbenannt): ein Link auf
                // github.com/Schengii/<repo> würde für Besucher in einer 404 enden. Stattdessen
                // auf den Projektordner im Monorepo verlinken, sonst keinen Link ausgeben.
                const folderMatch = /^Projekte\/([^/]+)\//.exec(project.link || '');
                project.githubUrl = folderMatch
                    ? `https://github.com/Schengii/Umschulung-FIAE/tree/main/Projekte/${encodeURIComponent(decodeURIComponent(folderMatch[1]))}`
                    : undefined;
                project.updatedAt = new Date().toISOString();
                project.language = project.language || '';
                console.log(`Fallback for ${project.repoName} (No API info)`);
            }
        }

        // Ensure every project has a valid images array containing at least 2 images
        if (!project.images || !Array.isArray(project.images)) {
            project.images = project.image ? [project.image] : [];
        }

        // If we only have 1 image, add a category-appropriate second image
        if (project.images.length === 1) {
            const cat = (project.category || '').toLowerCase();
            if (cat.includes('game')) {
                project.images.push('assets/images/game_leaderboard.webp');
            } else if (cat.includes('ai')) {
                project.images.push('assets/images/ai_chat_showcase.webp');
            } else {
                project.images.push('assets/images/analytics_showcase.webp');
            }
        }

        // If no images at all, add two default fallbacks
        if (project.images.length === 0) {
            const cat = (project.category || '').toLowerCase();
            if (cat.includes('game')) {
                project.images = ['assets/images/game_leaderboard.webp', 'assets/images/it_workspace.webp'];
            } else if (cat.includes('ai')) {
                project.images = ['assets/images/ai_chat_showcase.webp', 'assets/images/it_workspace.webp'];
            } else {
                project.images = ['assets/images/analytics_showcase.webp', 'assets/images/it_workspace.webp'];
            }
        }

        // Ensure project.image matches the first slide
        project.image = project.images[0];

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
