/**
 * @file check_bilingual.js
 * @description Visible text is written as a <span lang="de"> / <span lang="en"> pair. A German
 * element without an English sibling of the same tag (or the other way round) shows up empty or
 * untranslated in one language and is easy to miss in review, so this lists every such element.
 *
 * Usage: node scripts/check_bilingual.js
 */

const fs = require('fs');
const path = require('path');
const { Window } = require('happy-dom');

const root = path.resolve(__dirname, '..');

/**
 * Elements whose lang="de"/"en" partner is missing among their siblings.
 * @param {string} html
 * @returns {string[]} short descriptions of the unpaired elements
 */
function findUnpairedLanguageElements(html) {
    const window = new Window();
    window.document.write(html);
    const problems = [];
    for (const element of window.document.querySelectorAll('[lang="de"], [lang="en"]')) {
        if (element.tagName === 'HTML') continue;
        const lang = element.getAttribute('lang');
        const partnerLang = lang === 'de' ? 'en' : 'de';
        const hasPartner = [...(element.parentElement?.children ?? [])].some(
            (sibling) =>
                sibling !== element &&
                sibling.tagName === element.tagName &&
                sibling.getAttribute('lang') === partnerLang
        );
        if (!hasPartner) {
            const text = (element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50);
            problems.push(
                `<${element.tagName.toLowerCase()} lang="${lang}"> "${text}" has no lang="${partnerLang}" sibling`
            );
        }
    }
    window.close();
    return problems;
}

/** @returns {string[]} */
function pageFiles() {
    const pages = fs.readdirSync(path.join(root, 'pages')).map((name) => path.join('pages', name));
    return [...pages, 'index.html', '404.html'].filter(
        (file) => file.endsWith('.html') && fs.existsSync(path.join(root, file))
    );
}

function main() {
    let failures = 0;
    for (const file of pageFiles()) {
        const problems = findUnpairedLanguageElements(fs.readFileSync(path.join(root, file), 'utf8'));
        for (const problem of problems) console.error(`✗ ${file.replace(/\\/g, '/')}: ${problem}`);
        failures += problems.length;
    }
    if (failures) {
        console.error(`\n${failures} unpaired language element(s). Add the missing DE/EN counterpart.`);
        process.exit(1);
    }
    console.log('✅ Every lang="de"/"en" element has its counterpart.');
}

if (require.main === module) main();

module.exports = { findUnpairedLanguageElements };
