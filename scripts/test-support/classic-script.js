/**
 * Lädt ein klassisches Seiten-Script (ohne import/export, z. B. components.js, modal.js) für Unit-Tests.
 * Der Quelltext läuft mit seinem echten Dateipfad per `vm`, damit die V8-Coverage ihn der Datei zuordnet.
 * Er wird in eine Funktion gewickelt (der Wrapper steht in der ersten Zeile, die Zeilennummern bleiben
 * gleich), so kann dasselbe Script je Test neu geladen werden, ohne dass `const`-Deklarationen kollidieren.
 * Liegt wie dom-helpers.js unter scripts/, damit es nie in dist/ oder den Precache gelangt.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

/**
 * @param {string} relativePath Pfad ab dem Projektroot, z. B. 'assets/js/components.js'
 * @param {string[]} [names] Funktionen/Variablen des Scripts, die der Test braucht
 * @returns {Record<string, any>} die angeforderten Namen
 */
function loadClassicScript(relativePath, names = []) {
    const filename = path.resolve(__dirname, '..', '..', relativePath);
    const source = fs.readFileSync(filename, 'utf8');
    const wrapped = `(function () {${source}\n;return { ${names.join(', ')} };\n})()`;
    return vm.runInThisContext(wrapped, { filename });
}

module.exports = { loadClassicScript };
