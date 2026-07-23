// scripts/generate_qr_codes.js
const fs = require('fs');
const path = require('path');
const https = require('https');

const targetDir = path.resolve(__dirname, '..', 'assets', 'images');
const docxTargetDir = path.resolve(__dirname, '..', 'Bewerbungsunterlagen', 'extracted_images');

const baseDomain = 'https://max-schenk.developerakademie.net/Umschulung-FIAE';

const qrCodesToGenerate = [
  {
    filename: 'qr_portfolio.png',
    url: `${baseDomain}/pages/portfolio.html`
  },
  {
    filename: 'qr_interview.png',
    url: `${baseDomain}/pages/interview-trainer.html`
  },
  {
    filename: 'qr_playground.png',
    url: `${baseDomain}/pages/playground.html`
  },
  {
    filename: 'qr_home.png',
    url: `${baseDomain}/pages/home.html`
  }
];

function downloadQrCode(qr) {
  return new Promise((resolve, reject) => {
    // Generate QR API URL (using api.qrserver.com, 350x350px, black on white)
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(qr.url)}&margin=10`;
    
    https.get(apiUrl, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch QR code for ${qr.url}. Status code: ${res.statusCode}`));
        return;
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        
        // Write to assets/images
        const assetsPath = path.join(targetDir, qr.filename);
        fs.writeFileSync(assetsPath, buffer);
        console.log(`Saved QR code: ${assetsPath} -> pointing to ${qr.url}`);

        // Also write to Bewerbungsunterlagen/extracted_images so they are in his CV resources
        if (fs.existsSync(docxTargetDir)) {
          const docxPath = path.join(docxTargetDir, qr.filename);
          fs.writeFileSync(docxPath, buffer);
          console.log(`Copied to CV images: ${docxPath}`);
        }

        resolve();
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function run() {
  console.log('Starting QR Code generation...');
  try {
    for (const qr of qrCodesToGenerate) {
      await downloadQrCode(qr);
    }
    console.log('All QR Codes generated successfully!');
  } catch (e) {
    console.error('Error generating QR Codes:', e.message);
  }
}

run();
