const fs = require('fs');
const path = require('path');

const realSrcDir = 'C:\\Users\\sche-\\.gemini\\antigravity-ide\\brain\\6370c116-71c5-4b36-80ff-841145ff6197';
const dstDir = path.join(__dirname, '..', 'assets', 'images');

const mapping = {
    "wohnungssuche_showcase_1781952452026.png": "wohnungssuche_showcase.png",
    "manufaktur_showcase_1781952962524.png": "manufaktur_showcase.png",
    "coopgame_showcase_1781955853923.png": "coopgame_showcase.png",
    "orbital_scrap_showcase_1781955866843.png": "orbital_scrap_showcase.png"
};

Object.entries(mapping).forEach(([srcName, dstName]) => {
    const srcPath = path.join(realSrcDir, srcName);
    const dstPath = path.join(dstDir, dstName);
    try {
        fs.copyFileSync(srcPath, dstPath);
        console.log(`Copied ${srcName} to ${dstName}`);
    } catch (e) {
        console.error(`Failed to copy ${srcName}:`, e.message);
    }
});
