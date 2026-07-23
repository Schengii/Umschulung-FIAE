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
console.log(`Processing ${htmlFiles.length} HTML files in Projekte/...`);

let fixedCount = 0;

htmlFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace href="/..." with href="./..." (ignoring //, http, https)
    const newContent = content
        .replace(/href=["']\/(?!\/)([^\s"'>]+)["']/gi, 'href="./$1"')
        .replace(/src=["']\/(?!\/)([^\s"'>]+)["']/gi, 'src="./$1"');

    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        const relPath = path.relative(rootDir, filePath);
        console.log(`✅ Fixed asset paths in: ${relPath}`);
        fixedCount++;
    }
});

console.log(`\n🎉 Successfully fixed ${fixedCount} project HTML files!`);
