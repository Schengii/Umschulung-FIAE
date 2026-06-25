const fs = require('fs');
const path = require('path');

// Paths (relative to this script file)
const projectRoot = path.resolve(__dirname, '../../Projekte');
const outputFile = path.resolve(__dirname, '../data/projects.json');
const imagesRoot = path.resolve(__dirname, '../../assets/images');
const defaultImage = 'assets/images/academy_campus.png'; // generic placeholder

/**
 * Convert folder‑name like "my‑project_name" → "My Project Name"
 */
function camelToTitle(str) {
  return str.replace(/[_-]+/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Return the first non‑empty line of a README.md (or empty string)
 */
function getFirstLineOfReadme(dir) {
  const readmePath = path.join(dir, 'README.md');
  if (fs.existsSync(readmePath)) {
    const content = fs.readFileSync(readmePath, 'utf8');
    const first = content.split(/\r?\n/).find(l => l.trim().length > 0);
    return first ? first.trim() : '';
  }
  return '';
}

/**
 * Find the best entry‑point HTML file inside a project folder.
 * Returns a path relative to the repository root (forward slashes).
 */
function findMainLink(dir) {
  const candidates = ['index.html', 'www/index.html', 'dist/index.html'];
  for (const cand of candidates) {
    const full = path.join(dir, cand);
    if (fs.existsSync(full)) {
      return path.relative(path.resolve(__dirname, '../../'), full).replace(/\\/g, '/');
    }
  }
  // Fallback → open the folder itself (GitHub repo view)
  return path.relative(path.resolve(__dirname, '../../'), dir).replace(/\\/g, '/');
}

/**
 * Very small heuristic to pick a category for the filter UI.
 */
function inferCategory(name) {
  const lower = name.toLowerCase();
  if (lower.includes('game') || lower.includes('games')) return 'games';
  if (lower.includes('ai') || lower.includes('bot')) return 'ai';
  return 'web';
}

/**
 * Detect language & framework from common manifest files.
 */
function detectLanguageAndFramework(dir) {
  // Node / JavaScript
  const pkgPath = path.join(dir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const deps = Object.keys(pkg.dependencies || {});
      const framework = deps.length ? deps[0] : '';
      return { language: 'JavaScript', framework };
    } catch (_) {}
  }

  // Maven / Java
  const pomPath = path.join(dir, 'pom.xml');
  if (fs.existsSync(pomPath)) {
    const content = fs.readFileSync(pomPath, 'utf8');
    const artifact = content.match(/<artifactId>([^<]+)<\/artifactId>/i);
    const framework = artifact ? artifact[1] : '';
    return { language: 'Java', framework };
  }

  // .NET / C#
  const csprojFiles = fs.readdirSync(dir).filter(f => f.endsWith('.csproj'));
  if (csprojFiles.length) {
    const csprojPath = path.join(dir, csprojFiles[0]);
    const content = fs.readFileSync(csprojPath, 'utf8');
    const tf = content.match(/<TargetFramework>([^<]+)<\/TargetFramework>/i);
    const framework = tf ? tf[1] : '';
    return { language: 'C#', framework };
  }

  // Python
  const reqPath = path.join(dir, 'requirements.txt');
  if (fs.existsSync(reqPath)) {
    const lines = fs.readFileSync(reqPath, 'utf8')
                    .split(/\r?\n/)
                    .filter(l => l.trim());
    const framework = lines.length ? lines[0].split('==')[0] : '';
    return { language: 'Python', framework };
  }

  // Fallback – unknown
  return { language: '', framework: '' };
}

/**
 * Find a thumbnail image that matches the project name.
 * Looks for files like "<project>_showcase.png", "<project>.png", etc.
 */
function detectImage(projectName) {
  const lowered = projectName.toLowerCase();
  const allowed = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];
  const candidates = fs.readdirSync(imagesRoot)
                       .filter(f => allowed.includes(path.extname(f).toLowerCase()));

  // Prefer an exact‑name match (ignoring extension)
  const exact = candidates.find(f => path.parse(f).name.toLowerCase() === lowered);
  if (exact) return `assets/images/${exact}`;

  // Otherwise, look for a file that contains the project name
  const includes = candidates.find(f => f.toLowerCase().includes(lowered));
  if (includes) return `assets/images/${includes}`;

  // Fallback to generic placeholder
  return defaultImage;
}

/**
 * Build the JSON array and write it to `assets/data/projects.json`
 */
function generateProjects() {
  const entries = [];

  if (!fs.existsSync(projectRoot)) {
    console.error('Project directory not found:', projectRoot);
    process.exit(1);
  }

  const dirs = fs.readdirSync(projectRoot, { withFileTypes: true })
                 .filter(d => d.isDirectory())
                 .map(d => d.name);

  dirs.forEach(dirName => {
    const dirPath = path.join(projectRoot, dirName);
    const title = camelToTitle(dirName);
    const desc = getFirstLineOfReadme(dirPath) || 'No description available.';
    const link = findMainLink(dirPath);
    const category = inferCategory(dirName);
    const { language, framework } = detectLanguageAndFramework(dirPath);
    const image = detectImage(dirName);

    const project = {
      titleDe: title,
      titleEn: title,
      tags: [],
      image,
      link,
      descDe: desc,
      descEn: desc,
      category,
      stars: 0,
      updatedAt: new Date().toISOString(),
      language,
      framework
    };
    entries.push(project);
  });

  // Write pretty‑printed JSON
  fs.writeFileSync(outputFile, JSON.stringify(entries, null, 2), 'utf8');
  console.log(`Generated ${entries.length} project entries → ${outputFile}`);
}

generateProjects();
