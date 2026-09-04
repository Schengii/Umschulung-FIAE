/**
 * @file generate_og_image.js
 * @description Generates a branded 1200x630 social preview image
 * (assets/images/og-cover.png) from an inline SVG, so every page
 * shares one consistent, on-brand Open Graph / Twitter Card image.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outPath = path.resolve(__dirname, '..', 'assets', 'images', 'og-cover.png');

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b0f19"/>
      <stop offset="100%" stop-color="#101a33"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#60a5fa"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1060" cy="90" r="220" fill="#2563eb" opacity="0.12"/>
  <circle cx="120" cy="560" r="180" fill="#60a5fa" opacity="0.10"/>
  <rect x="80" y="80" width="86" height="6" rx="3" fill="url(#accent)"/>
  <text x="80" y="230" font-family="Arial, Helvetica, sans-serif" font-size="66" font-weight="700" fill="#f8fafc">Maximilian Schenk</text>
  <text x="80" y="288" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="500" fill="#93c5fd">Fachinformatiker für Anwendungsentwicklung</text>
  <text x="80" y="360" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#cbd5e1">Portfolio &amp; Projekte &#183; IHK geprüft &#183; Bonn, Deutschland</text>
  <g transform="translate(80,410)">
    <rect width="220" height="46" rx="23" fill="#111a2e" stroke="#2563eb" stroke-width="1.5"/>
    <text x="110" y="30" font-family="Arial, Helvetica, sans-serif" font-size="19" fill="#93c5fd" text-anchor="middle">Web &amp; App Development</text>
  </g>
  <g transform="translate(320,410)">
    <rect width="150" height="46" rx="23" fill="#111a2e" stroke="#2563eb" stroke-width="1.5"/>
    <text x="75" y="30" font-family="Arial, Helvetica, sans-serif" font-size="19" fill="#93c5fd" text-anchor="middle">Clean Code</text>
  </g>
  <g transform="translate(490,410)">
    <rect width="130" height="46" rx="23" fill="#111a2e" stroke="#2563eb" stroke-width="1.5"/>
    <text x="65" y="30" font-family="Arial, Helvetica, sans-serif" font-size="19" fill="#93c5fd" text-anchor="middle">KI &amp; Tools</text>
  </g>
  <text x="80" y="570" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#64748b">max-schenk.tech</text>
</svg>`;

sharp(Buffer.from(svg))
  .png()
  .toFile(outPath)
  .then(() => console.log(`OG image written to ${outPath}`))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
