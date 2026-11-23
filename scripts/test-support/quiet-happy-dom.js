/**
 * Setup-Datei der Unit-Tests (vitest.config.js, `setupFiles`): happy-dom lädt keine iframe-Seiten und
 * schreibt jede iframe-Navigation als DOMException samt Stacktrace in den Testlauf (Quick-Sandbox,
 * Portfolio-Vorschau); ebenso jedes nachgeladene Stylesheet und Script (components.js, Tests der klassischen
 * Scripts). Genau diese Meldungen werden verworfen, damit echte Fehler im Log auffallen;
 * alles andere gelangt unverändert an stderr.
 */
const MESSAGES = [
    'Iframe page loading is disabled',
    'CSS file loading is disabled',
    'JavaScript file loading is disabled',
];

const write = process.stderr.write.bind(process.stderr);
/** @param {string | Uint8Array} chunk @param {...any} rest */
process.stderr.write = (chunk, ...rest) => {
    if (MESSAGES.some((message) => String(chunk).includes(message))) {
        const callback = rest.find((entry) => typeof entry === 'function');
        if (callback) callback();
        return true;
    }
    return write(chunk, ...rest);
};
