// scripts/generate_projects_json.js
const fs = require('fs');
const path = require('path');

const projectsDir = path.resolve(__dirname, '..', '..', 'Projekte');
const outputFile = path.resolve(__dirname, '..', '..', 'assets', 'data', 'projects.json');

function getProjects() {
  const entries = fs.readdirSync(projectsDir, { withFileTypes: true });
  const projects = entries
    .filter(e => e.isDirectory())
    .map(dir => {
      const name = dir.name;
      const title = name.replace(/_/g, ' ');
      const link = `Projekte/${name}/index.html`;
      return { title, link };
    });
  return projects;
}

const projects = getProjects();
fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(projects, null, 2), 'utf-8');
console.log('Generated projects.json with', projects.length, 'entries');
