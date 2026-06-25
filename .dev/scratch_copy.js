const fs = require('fs');
const path = require('path');

const files = [
    {
        src: 'C:\\Users\\sche-\\.gemini\\antigravity-ide\\brain\\6370c116-71c5-4b36-80ff-841145ff6197\\wohnungssuche_showcase_1781952452026.png',
        dest: 'c:\\Users\\sche-\\Desktop\\Programmieren Projekte\\Umschulung-FIAE\\assets\\images\\wohnungssuche_showcase.png'
    },
    {
        src: 'C:\\Users\\sche-\\.gemini\\antigravity-ide\\brain\\6370c116-71c5-4b36-80ff-841145ff6197\\manufaktur_showcase_1781952962524.png',
        dest: 'c:\\Users\\sche-\\Desktop\\Programmieren Projekte\\Umschulung-FIAE\\assets\\images\\manufaktur_showcase.png'
    }
];

files.forEach(f => {
    try {
        fs.copyFileSync(f.src, f.dest);
        console.log(`Successfully copied ${f.src} to ${f.dest}`);
    } catch (e) {
        console.error(`Failed to copy ${f.src}:`, e.message);
    }
});
