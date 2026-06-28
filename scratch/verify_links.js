const fs = require('fs');
const path = require('path');

// Mock window to load projects_data.js
global.window = {};
require('../assets/js/projects_data.js');

const projects = global.window.projectsData;
console.log(`Loaded ${projects.length} projects.`);

let allExist = true;

projects.forEach(p => {
    if (!p.link) {
        console.log(`[Static Only] ${p.titleDe} has no launch link.`);
        return;
    }

    // Decode URL-encoded link (like %20 to space)
    const decodedLink = decodeURIComponent(p.link);
    const absolutePath = path.resolve(__dirname, '..', decodedLink);
    const exists = fs.existsSync(absolutePath);

    if (exists) {
        console.log(`✅ [EXISTS] ${p.titleDe}: ${p.link}`);
    } else {
        console.log(`❌ [MISSING] ${p.titleDe}: ${p.link} (Resolved path: ${absolutePath})`);
        allExist = false;
    }
});

if (allExist) {
    console.log('\nAll project links exist!');
} else {
    console.log('\nSome project links are missing!');
}
