/**
 * @file qr-local.js
 * @description Renders QR codes in the browser (vendored qrcode-generator, MIT, assets/vendor/qrcode),
 * so no text - the sync payload contains the learning progress - leaves the device for a QR web service.
 */

// @ts-ignore vendored ES module without type declarations
import qrcode from '../../vendor/qrcode/qrcode.mjs';

/**
 * Builds a scannable QR code as SVG data URL (black modules on a white quiet zone, so it also
 * scans on the dark theme).
 * @param {string} text ASCII text to encode (URLs are percent-encoded already)
 * @param {{ cellSize?: number, margin?: number }} [options]
 * @returns {string} data:image/svg+xml URL
 * @throws {Error} when the text exceeds what one QR code can hold
 */
export function createQrDataUrl(text, { cellSize = 6, margin = 4 } = {}) {
    const qr = qrcode(0, 'L');
    qr.addData(text);
    qr.make();

    const count = qr.getModuleCount();
    const size = (count + margin * 2) * cellSize;
    let path = '';
    for (let row = 0; row < count; row++) {
        for (let col = 0; col < count; col++) {
            if (qr.isDark(row, col)) {
                path += `M${(col + margin) * cellSize} ${(row + margin) * cellSize}h${cellSize}v${cellSize}h-${cellSize}z`;
            }
        }
    }

    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">` +
        `<rect width="${size}" height="${size}" fill="#fff"/><path d="${path}" fill="#000"/></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
