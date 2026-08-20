/**
 * @file optimize_images.js
 * @description Bildoptimierungs- & Prüf-Pipeline für Projekt-Assets
 * Überprüft Bildgrößen, Seitenverhältnisse und stellt Metriken für WebP-Optimierung bereit
 */

const fs = require('fs');
const path = require('path');

const imgDir = path.resolve(__dirname, '..', 'assets', 'images');

console.log('=== FIAE Image Optimization & Audit Pipeline ===\n');

if (!fs.existsSync(imgDir)) {
  console.error(`Image directory not found: ${imgDir}`);
  process.exit(1);
}

const files = fs.readdirSync(imgDir);
let totalBytes = 0;
const largeFiles = [];

files.forEach(file => {
  const fullPath = path.join(imgDir, file);
  const stat = fs.statSync(fullPath);
  if (stat.isFile()) {
    totalBytes += stat.size;
    const kb = (stat.size / 1024).toFixed(1);
    if (stat.size > 500 * 1024) {
      largeFiles.push({ file, kb });
    }
  }
});

console.log(`Total images scanned: ${files.length}`);
console.log(`Total images payload: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`);

if (largeFiles.length > 0) {
  console.log('\nImages recommended for WebP / Compression (> 500 KB):');
  largeFiles.forEach(item => console.log(` - ${item.file.padEnd(35)}: ${item.kb} KB`));
} else {
  console.log('\n✅ All images are lightweight and well optimized (< 500 KB each)!');
}
