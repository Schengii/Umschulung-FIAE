const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\sche-\\Folder_with_permission_maybe?'; // wait, the path to the brain directory is:
const realSrcDir = 'C:\\Users\\sche-\\.gemini\\antigravity-ide\\brain\\eae69804-d3c6-4e76-8274-f6544296ca58';
const dstDir = path.join(__dirname, 'assets', 'images');

const mapping = {
    "elektrocheck_showcase_1781892012516.png": "elektrocheck_showcase.png",
    "gluecksspiel_showcase_1781892026252.png": "gluecksspiel_showcase.png",
    "jobsuche_showcase_1781892038091.png": "jobsuche_showcase.png",
    "arbeitszeit_showcase_1781892054701.png": "arbeitszeit_showcase.png",
    "finance_bot_showcase_1781892065353.png": "finance_bot_showcase.png"
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
