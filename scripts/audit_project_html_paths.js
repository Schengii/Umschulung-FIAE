const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const projekteDir = path.join(rootDir, 'Projekte');

function scanHtmlFiles(dir) {
    const results = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory() && file !== 'node_modules' && file !== '.git') {
            results.push(...scanHtmlFiles(fullPath));
        } else if (file.endsWith('.html')) {
            results.push(fullPath);
        }
    }
    return results;
}

const htmlFiles = scanHtmlFiles(projekteDir);
console.log(`Auditing ${htmlFiles.length} HTML files in Projekte/...`);

let issuesFound = 0;

htmlFiles.forEach(filePath => {
    const relPath = path.relative(rootDir, filePath);
    const content = fs.readFileSync(filePath, 'utf8');

    // Find src="/..." or href="/..." (excluding http/https or data URIs)
    const matches = content.match(/(src|href)=["']\/(?!\/)([^\s"'>]+)["']/gi);
    if (matches) {
        console.warn(`\n⚠️ ${relPath}:`);
        matches.forEach(match => {
            console.warn(`   ${match}`);
            issuesFound++;
        });
    }
});

if (issuesFound === 0) {
    console.log('\n✅ No absolute root paths (src="/..." or href="/...") found in Projekte/ HTML files!');
} else {
    console.warn(`\n⚠️ Found ${issuesFound} absolute root path references that will 404 when opened in subdirectories!`);
}
