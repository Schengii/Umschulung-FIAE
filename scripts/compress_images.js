/**
 * @file compress_images.js
 * @description One-off/repeatable lossy re-encode of large images in assets/images
 * using sharp, in place (same path/extension, so no HTML references need to change).
 * Only touches files above a size threshold to avoid needlessly re-encoding
 * already-small assets.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imgDir = path.resolve(__dirname, '..', 'assets', 'images');
const THRESHOLD_BYTES = 80 * 1024; // only re-encode files bigger than 80 KB

async function run() {
  const files = fs.readdirSync(imgDir);
  let savedTotal = 0;

  for (const file of files) {
    const fullPath = path.join(imgDir, file);
    const stat = fs.statSync(fullPath);
    if (!stat.isFile()) continue;
    if (stat.size < THRESHOLD_BYTES) continue;

    const ext = path.extname(file).toLowerCase();
    const before = stat.size;
    let buffer;

    try {
      const inputBuffer = fs.readFileSync(fullPath);
      const img = sharp(inputBuffer);
      if (ext === '.jpg' || ext === '.jpeg') {
        buffer = await img.jpeg({ quality: 78, mozjpeg: true }).toBuffer();
      } else if (ext === '.png') {
        buffer = await img.png({ compressionLevel: 9, quality: 85 }).toBuffer();
      } else if (ext === '.webp') {
        buffer = await img.webp({ quality: 80 }).toBuffer();
      } else {
        continue;
      }
    } catch (e) {
      console.warn(`Skipped ${file}: ${e.message}`);
      continue;
    }

    if (buffer.length < before) {
      fs.writeFileSync(fullPath, buffer);
      const saved = before - buffer.length;
      savedTotal += saved;
      console.log(
        `${file}: ${(before / 1024).toFixed(1)} KB -> ${(buffer.length / 1024).toFixed(1)} KB (-${(
          (saved / before) * 100
        ).toFixed(0)}%)`
      );
    } else {
      console.log(`${file}: already optimal, skipped`);
    }
  }

  console.log(`\nTotal saved: ${(savedTotal / 1024 / 1024).toFixed(2)} MB`);
}

run();
