const fs = require('fs');
const path = require('path');

function getDirSummary(dir) {
  let size = 0;
  let fileCount = 0;
  function traverse(current) {
    try {
      const list = fs.readdirSync(current);
      list.forEach(f => {
        const p = path.join(current, f);
        const s = fs.statSync(p);
        if (s.isDirectory()) {
          traverse(p);
        } else {
          size += s.size;
          fileCount++;
        }
      });
    } catch(e) {}
  }
  traverse(dir);
  return { size, fileCount };
}

console.log('=== Projects Breakdown ===');
fs.readdirSync('Projekte').forEach(item => {
  const p = path.join('Projekte', item);
  if (fs.statSync(p).isDirectory()) {
    const summary = getDirSummary(p);
    console.log(item.padEnd(30), (summary.size / (1024*1024)).toFixed(2) + ' MB', `(${summary.fileCount} files)`);
  }
});

console.log('\n=== Bewerbungsunterlagen ===');
if (fs.existsSync('Bewerbungsunterlagen')) {
  fs.readdirSync('Bewerbungsunterlagen').forEach(f => {
    const stat = fs.statSync(path.join('Bewerbungsunterlagen', f));
    console.log(' -', f, `(${(stat.size / 1024).toFixed(1)} KB)`);
  });
}
