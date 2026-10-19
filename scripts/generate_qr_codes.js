// scripts/generate_qr_codes.js
// Renders the static QR images locally (qrcode-generator + sharp); no QR web service is contacted.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { pathToFileURL } = require('url');

const targetDir = path.resolve(__dirname, '..', 'assets', 'images');
const docxTargetDir = path.resolve(__dirname, '..', 'Bewerbungsunterlagen', 'extracted_images');

const baseDomain = 'https://www.max-schenk.tech';

const qrCodesToGenerate = [
    {
        filename: 'qr_portfolio.png',
        url: `${baseDomain}/pages/portfolio.html`,
    },
    {
        filename: 'qr_interview.png',
        url: `${baseDomain}/pages/interview-trainer.html`,
    },
    {
        filename: 'qr_playground.png',
        url: `${baseDomain}/pages/playground.html`,
    },
    {
        filename: 'qr_home.png',
        url: `${baseDomain}/pages/home.html`,
    },
];

/**
 * @param {{ filename: string, url: string }} qr
 * @param {(text: string) => string} createQrDataUrl
 */
async function renderQrCode(qr, createQrDataUrl) {
    const dataUrl = createQrDataUrl(qr.url);
    const svg = decodeURIComponent(dataUrl.slice(dataUrl.indexOf(',') + 1));
    // 350x350 px, black on white, nearest-neighbour so the modules stay sharp.
    const buffer = await sharp(Buffer.from(svg)).resize(350, 350, { kernel: 'nearest' }).png().toBuffer();

    const assetsPath = path.join(targetDir, qr.filename);
    fs.writeFileSync(assetsPath, buffer);
    console.log(`Saved QR code: ${assetsPath} -> pointing to ${qr.url}`);

    // Also write to Bewerbungsunterlagen/extracted_images so they are in his CV resources
    if (fs.existsSync(docxTargetDir)) {
        const docxPath = path.join(docxTargetDir, qr.filename);
        fs.writeFileSync(docxPath, buffer);
        console.log(`Copied to CV images: ${docxPath}`);
    }
}

async function run() {
    console.log('Starting QR Code generation...');
    try {
        const qrLocal = await import(
            pathToFileURL(path.resolve(__dirname, '..', 'assets', 'js', 'modules', 'qr-local.js')).href
        );
        for (const qr of qrCodesToGenerate) {
            await renderQrCode(qr, qrLocal.createQrDataUrl);
        }
        console.log('All QR Codes generated successfully!');
    } catch (e) {
        console.error('Error generating QR Codes:', e.message);
        process.exitCode = 1;
    }
}

run();
