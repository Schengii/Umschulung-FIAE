const fs = require('fs');
const path = require('path');

const rootFiles = ['index.html', '404.html'];
const pagesDir = 'pages';
const pages = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html')).map(f => path.join(pagesDir, f));

const allTargetFiles = [
  ...rootFiles,
  ...pages,
  'Projekte/java-playground.html',
  'Projekte/CoOpVersusGame/coop-versus-demo.html'
];

let totalUpdated = 0;

allTargetFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const isSubdir = file.startsWith('pages') || file.startsWith('Projekte');
  const faLocalPath = isSubdir ? '../assets/vendor/fontawesome/css/all.min.css' : 'assets/vendor/fontawesome/css/all.min.css';

  // Replace FontAwesome CDN link tag
  if (content.includes('cdnjs.cloudflare.com/ajax/libs/font-awesome')) {
    content = content.replace(/<link\s+rel=["']stylesheet["']\s+href=["']https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/[^"']+["'][^>]*>/g,
      `<link rel="stylesheet" href="${faLocalPath}">`);
    changed = true;
  }

  // Replace Prism CDN in projekt-detail.html
  if (file.includes('projekt-detail.html')) {
    content = content.replace(/https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/prism\/[^"']+\/prism-tomorrow\.min\.css/g, '../assets/vendor/prism/prism-tomorrow.min.css');
    content = content.replace(/https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/prism\/[^"']+\/prism\.min\.js/g, '../assets/vendor/prism/prism.min.js');
    content = content.replace(/https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/prism\/[^"']+\/prism-typescript\.min\.js/g, '../assets/vendor/prism/prism-typescript.min.js');
    changed = true;
  }

  // Clean CSP header (remove cdnjs.cloudflare.com)
  if (content.includes('https://cdnjs.cloudflare.com')) {
    content = content.replace(/https:\/\/cdnjs\.cloudflare\.com\s*/g, '');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    totalUpdated++;
    console.log(`[UPDATED] ${file}`);
  }
});

console.log(`\nSuccessfully updated ${totalUpdated} files with local vendor paths and hardened CSP!`);
