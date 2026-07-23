const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const projectsJsonPath = path.join(rootDir, 'assets', 'data', 'projects.json');
const projects = JSON.parse(fs.readFileSync(projectsJsonPath, 'utf8'));

console.log(`Checking ${projects.length} project links...`);

let missingCount = 0;

projects.forEach((proj, idx) => {
    const rawLink = proj.link;
    if (!rawLink) {
        console.warn(`[${idx + 1}/${projects.length}] ${proj.titleDe}: Missing link property!`);
        missingCount++;
        return;
    }

    // Unescape %20 or similar in file paths
    const unescapedLink = decodeURIComponent(rawLink);
    const targetPath = path.join(rootDir, unescapedLink);

    // Also check inside pages/ folder if link is e.g. snake.html
    const targetPathInPages = path.join(rootDir, 'pages', unescapedLink);

    const existsInRoot = fs.existsSync(targetPath);
    const existsInPages = fs.existsSync(targetPathInPages);

    if (existsInRoot) {
        console.log(`✅ [${idx + 1}/${projects.length}] ${proj.titleDe} -> ${unescapedLink} (Exists in Root)`);
    } else if (existsInPages) {
        console.log(`✅ [${idx + 1}/${projects.length}] ${proj.titleDe} -> pages/${unescapedLink} (Exists in Pages)`);
    } else {
        console.error(`❌ [${idx + 1}/${projects.length}] ${proj.titleDe} -> Missing: ${targetPath}`);
        missingCount++;
    }
});

if (missingCount === 0) {
    console.log('\n🎉 ALL 18 PROJECT LINKS EXIST ON DISK!');
} else {
    console.warn(`\n⚠️ ${missingCount} project links are missing or pointing to non-existent files.`);
}
