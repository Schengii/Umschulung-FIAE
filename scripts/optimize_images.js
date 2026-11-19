/**
 * @file optimize_images.js
 * @description Bild-Werkzeug für assets/images, zwei Modi:
 *
 *   node scripts/optimize_images.js              Prüfbericht (nur lesen): Gesamtgröße und Bilder > 500 KB
 *   node scripts/optimize_images.js --compress   verlustbehaftetes Re-Encoding aller Bilder > 80 KB mit
 *                                                sharp, an Ort und Stelle (gleicher Pfad und gleiche
 *                                                Endung, es ändert sich keine HTML-Referenz)
 *
 * npm: `optimize-images` (Bericht) und `compress-images` (Re-Encoding).
 */

const fs = require('fs');
const path = require('path');

const imgDir = path.resolve(__dirname, '..', 'assets', 'images');
const REPORT_THRESHOLD_BYTES = 500 * 1024;
const COMPRESS_THRESHOLD_BYTES = 80 * 1024;

function audit() {
    console.log('=== FIAE Image Optimization & Audit Pipeline ===\n');

    const files = fs.readdirSync(imgDir);
    let totalBytes = 0;
    /** @type {Array<{file: string, kb: string | number}>} */
    const largeFiles = [];

    files.forEach((file) => {
        const stat = fs.statSync(path.join(imgDir, file));
        if (!stat.isFile()) return;
        totalBytes += stat.size;
        if (stat.size > REPORT_THRESHOLD_BYTES) largeFiles.push({ file, kb: (stat.size / 1024).toFixed(1) });
    });

    console.log(`Total images scanned: ${files.length}`);
    console.log(`Total images payload: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`);

    if (largeFiles.length > 0) {
        console.log('\nImages recommended for WebP / Compression (> 500 KB):');
        largeFiles.forEach((item) => console.log(` - ${item.file.padEnd(35)}: ${item.kb} KB`));
    } else {
        console.log('\n✅ All images are lightweight and well optimized (< 500 KB each)!');
    }
}

async function compress() {
    // sharp wird nur für diesen Modus gebraucht.
    const sharp = require('sharp');
    let savedTotal = 0;

    for (const file of fs.readdirSync(imgDir)) {
        const fullPath = path.join(imgDir, file);
        const stat = fs.statSync(fullPath);
        if (!stat.isFile() || stat.size < COMPRESS_THRESHOLD_BYTES) continue;

        const ext = path.extname(file).toLowerCase();
        const before = stat.size;
        let buffer;

        try {
            const img = sharp(fs.readFileSync(fullPath));
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
            console.warn(`Skipped ${file}: ${e instanceof Error ? e.message : e}`);
            continue;
        }

        if (buffer.length < before) {
            fs.writeFileSync(fullPath, buffer);
            savedTotal += before - buffer.length;
            const percent = (((before - buffer.length) / before) * 100).toFixed(0);
            console.log(
                `${file}: ${(before / 1024).toFixed(1)} KB -> ${(buffer.length / 1024).toFixed(1)} KB (-${percent}%)`
            );
        } else {
            console.log(`${file}: already optimal, skipped`);
        }
    }

    console.log(`\nTotal saved: ${(savedTotal / 1024 / 1024).toFixed(2)} MB`);
}

if (!fs.existsSync(imgDir)) {
    console.error(`Image directory not found: ${imgDir}`);
    process.exit(1);
}

if (process.argv.includes('--compress')) compress();
else audit();
