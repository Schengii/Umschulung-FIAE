// scripts/generate_projects_json.js
const fs = require('fs');
const path = require('path');

const projectsDir = path.resolve(__dirname, '..', '..', 'Projekte');
const outputFile = path.resolve(__dirname, '..', '..', 'assets', 'data', 'folder_projects.json');

function getProjects() {
  const entries = fs.readdirSync(projectsDir, { withFileTypes: true });
  const projects = entries
    .filter(e => e.isDirectory())
    .map(dir => {
      const name = dir.name;
      const cleanTitle = name.replace(/_/g, ' ');
      return {
        titleDe: cleanTitle,
        titleEn: cleanTitle,
        link: `Projekte/${name}/index.html`,
        image: null,
        descDe: '',
        descEn: '',
        tags: [],
        category: 'web'
      };
    });
  return projects;
}

const projects = getProjects();
fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(projects, null, 2), 'utf-8');
console.log('Generated projects.json with', projects.length, 'entries');
