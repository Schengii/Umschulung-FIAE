/**
 * Setup-Datei der Unit-Tests (vitest.config.js, `setupFiles`): happy-dom lädt keine iframe-Seiten und
 * schreibt jede iframe-Navigation als DOMException samt Stacktrace in den Testlauf (Quick-Sandbox,
 * Portfolio-Vorschau). Genau diese eine Meldung wird verworfen, damit echte Fehler im Log auffallen;
 * alles andere gelangt unverändert an stderr.
 */
const MESSAGE = 'Iframe page loading is disabled';

const write = process.stderr.write.bind(process.stderr);
/** @param {string | Uint8Array} chunk @param {...any} rest */
process.stderr.write = (chunk, ...rest) => {
    if (String(chunk).includes(MESSAGE)) {
        const callback = rest.find((entry) => typeof entry === 'function');
        if (callback) callback();
        return true;
    }
    return write(chunk, ...rest);
};
