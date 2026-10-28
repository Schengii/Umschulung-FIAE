/**
 * @file import_vault_flashcards.js
 * @description Imports the RemNote flashcards from the Obsidian vault into
 * assets/data/flashcards-extended.json, the optional "IHK-Kartei" deck of flashcards.html.
 *
 * The vault lives outside the repository, so CI cannot regenerate the deck. The importer runs
 * locally; `--check` (part of `npm run check` and CI) validates the committed file instead:
 * schema, unique ids, valid categories and that the answer markup only uses the tags the
 * importer itself produces. The cards are German only (source material, the IHK exam is German).
 *
 * Card format in the vault: blocks separated by `---`; a block holds optional `###`/`####`
 * headings, the question, a line with a single `?` and the answer.
 *
 * Usage:
 *   node scripts/import_vault_flashcards.js [vault-folder]   (default: VAULT_FLASHCARDS_DIR or the usual vault path)
 *   node scripts/import_vault_flashcards.js --check
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const OUTPUT = path.join(root, 'assets', 'data', 'flashcards-extended.json');

const DEFAULT_VAULT_DIR = path.join(
    os.homedir(),
    'Desktop',
    'Obsidian',
    '03 Resources',
    'Umschulung-FIAE - Wissen',
    'RemNote-Karteikarten FIAE - Lernkarten'
);

const CATEGORIES = ['software', 'database', 'network', 'wiso'];

/**
 * Vault file -> default category. Files missing here are not imported (shortcut lists and
 * near-empty stubs are no exam material).
 * @type {Record<string, string>}
 */
const FILE_CATEGORIES = {
    'Allgemeinwissen FIAE - Karteikarten.md': 'software',
    'Anwendungsentwicklung - Karteikarten.md': 'software',
    'FIAE Prüfungsvorbereitung AP2 - Karteikarten.md': 'software',
    'Grundlagen Anwendungsentwicklung - Karteikarten.md': 'software',
    'IT-Systemtechnik - Karteikarten.md': 'network',
    'Kommunikation - Karteikarten.md': 'wiso',
    'Programmiersprachen - Karteikarten.md': 'software',
    'Projektmanagement - Karteikarten.md': 'software',
    'Wirtschafts- und Geschäftsprozesse (WGP) - Karteikarten.md': 'wiso',
    'Wirtschafts- und Sozialkunde (WISO) - Karteikarten.md': 'wiso',
};

/**
 * Keywords that override the file category, checked in this order against the heading and then
 * against the question (headings in the vault are often only chapter numbers).
 */
const KEYWORD_CATEGORIES = [
    {
        pattern:
            /datenbank|\bsql\b|\bselect\b.*\bfrom\b|\bjoin\b|normalform|entity-relationship|\bdbms\b|primärschlüssel|fremdschlüssel/i,
        category: 'database',
    },
    {
        pattern:
            /netzwerk|wlan|\blan\b|\bwan\b|ip-?adress|\bipv[46]\b|\bip\b|subnetz|\bosi\b|router|switch|\bdns\b|\bdhcp\b|\btcp\b|\budp\b|\bvlan\b|firewall|802\.\d|hardware|drucker|printserver|speicher|elektro|\braid\b|backup|\busv\b|verschlüssel|\bbsi\b|it-sicherheit|informationssicherheit|netzwerkkabel|internet/i,
        category: 'network',
    },
];

const MAX_QUESTION_LENGTH = 300;
const MAX_ANSWER_LENGTH = 2000;

/** Tags the importer emits; `--check` rejects anything else. */
const ALLOWED_TAGS = new Set(['strong', 'em', 'code', 'ul', 'li', 'br']);

/** @param {string} text */
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Obsidian/RemNote markup of one line -> plain text: wikilinks become their label, tags,
 * cloze markers and highlight marks disappear.
 * @param {string} line
 */
function stripVaultSyntax(line) {
    return line
        .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
        .replace(/\[\[([^\]]+)\]\]/g, (_m, target) => target.split('/').pop())
        .replace(/\{\{([^}]+)\}\}/g, '$1')
        .replace(/==([^=]+)==/g, '$1')
        .replace(/(^|\s)#[\p{L}\d/_-]+/gu, '$1')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Inline formatting on already escaped text: `**bold**`, `*italic*`, `` `code` ``.
 * @param {string} escaped
 */
function inlineFormat(escaped) {
    return escaped
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
}

/**
 * One text line -> safe HTML. RemNote's `term;;definition` becomes "<strong>term</strong>: definition".
 * @param {string} line
 */
function formatLine(line) {
    const text = stripVaultSyntax(line);
    const pair = text.match(/^(.+?);;(.*)$/);
    if (pair) {
        const term = inlineFormat(escapeHtml(pair[1].trim()));
        const definition = inlineFormat(escapeHtml(pair[2].trim()));
        return definition ? `<strong>${term}</strong>: ${definition}` : `<strong>${term}</strong>`;
    }
    return inlineFormat(escapeHtml(text));
}

/**
 * Answer lines -> HTML: consecutive list items become one `<ul>`, other lines are joined with `<br>`.
 * @param {string[]} lines
 */
function formatAnswer(lines) {
    /** @type {string[]} */
    const parts = [];
    /** @type {string[]} */
    let list = [];
    const flushList = () => {
        if (list.length) parts.push(`<ul>${list.map((item) => `<li>${item}</li>`).join('')}</ul>`);
        list = [];
    };
    for (const raw of lines) {
        const bullet = raw.match(/^\s*(?:[-*+]|\d+[.)])\s+(.*)$/);
        if (bullet) {
            // Multiple-choice cards mark the right option with ✅.
            const correct = bullet[1].includes('✅');
            const item = formatLine(bullet[1].replace(/✅\s*/g, ''));
            if (item) list.push(correct ? `<strong>✅ ${item}</strong>` : item);
            continue;
        }
        flushList();
        const text = formatLine(raw);
        if (text) parts.push(text);
    }
    flushList();
    // A list already breaks the line; <br> only between two text parts.
    return parts.reduce(
        (html, part, index) =>
            index === 0 || part.startsWith('<ul>') || parts[index - 1].startsWith('<ul>')
                ? html + part
                : `${html}<br>${part}`,
        ''
    );
}

/** @param {string} text */
function plainLength(text) {
    return text.replace(/<[^>]*>/g, '').length;
}

/**
 * @param {string} heading
 * @param {string} question
 * @param {string} fallback
 */
function categoryFor(heading, question, fallback) {
    // WISO material stays WISO even when a question mentions a technical term.
    if (fallback === 'wiso') return fallback;
    for (const text of [heading, question]) {
        const match = KEYWORD_CATEGORIES.find(({ pattern }) => pattern.test(text));
        if (match) return match.category;
    }
    return fallback;
}

/**
 * Display hint from a heading: chapter numbers ("1.3.1.0 -") and status emojis removed.
 * @param {string} heading
 */
function cleanHint(heading) {
    return heading
        .replace(/^[\d.]+\s*-?\s*/, '')
        .replace(/[\u2705\u274c\u2b50\u2601\u{1F300}-\u{1FAFF}]/gu, '')
        .replace(/\bKarteikarten\b\s*/g, '')
        .replace(/\s+\d{3}$/, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Cards of one vault file.
 * @param {string} markdown
 * @param {string} fileName
 * @returns {{id: string, category: string, hint_de: string, question_de: string, answer_de: string}[]}
 */
function parseVaultFile(markdown, fileName) {
    const fileCategory = FILE_CATEGORIES[fileName];
    if (!fileCategory) return [];
    const body = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
    const blocks = body.split(/\r?\n-{3,}\s*\r?\n/);
    /** @type {ReturnType<typeof parseVaultFile>} */
    const cards = [];
    let topic = '';
    let section = '';
    for (const block of blocks) {
        const lines = block.split(/\r?\n/);
        /** @type {string[]} */
        const before = [];
        /** @type {string[] | null} */
        let after = null;
        for (const line of lines) {
            const heading = line.match(/^(#{1,6})\s+(.*)$/);
            if (heading && after === null) {
                const level = heading[1].length;
                const title = stripVaultSyntax(heading[2]);
                // The note title (#) names the whole file and is no hint.
                if (level === 1) continue;
                if (level <= 3) {
                    topic = title;
                    section = '';
                } else {
                    section = title;
                }
                continue;
            }
            if (after === null && line.trim() === '?') {
                after = [];
                continue;
            }
            if (after === null) before.push(line);
            else after.push(line);
        }
        if (after === null) continue;

        // Callouts, tags and embeds carry no card content.
        const keep = (/** @type {string} */ line) =>
            line.trim() !== '' && !/^\s*>/.test(line) && !/^\s*#[\p{L}\d/_-]+\s*$/u.test(line);
        const questionLines = before.filter(keep);
        const answerLines = after.filter(keep);
        // Images are not part of the site; a card that needs one is incomplete without it.
        if ([...questionLines, ...answerLines].some((line) => /!\[\[|!\[[^\]]*\]\(/.test(line))) continue;

        const question = formatLine(questionLines.join(' '));
        const answer = formatAnswer(answerLines);
        if (!question || !answer) continue;
        if (plainLength(question) > MAX_QUESTION_LENGTH || plainLength(answer) > MAX_ANSWER_LENGTH) continue;

        const hint = cleanHint(section) || cleanHint(topic) || fileName.replace(/ - Karteikarten\.md$/, '');
        const id = `vault_${crypto.createHash('sha1').update(`${fileName}\n${question}`).digest('hex').slice(0, 12)}`;
        cards.push({
            id,
            category: categoryFor(`${topic} ${section}`, question, fileCategory),
            hint_de: hint,
            question_de: question,
            answer_de: answer,
        });
    }
    return cards;
}

/**
 * All cards of a vault folder, without duplicates (same question and answer).
 * @param {Record<string, string>} files file name -> markdown
 */
function buildDeck(files) {
    const seenIds = new Set();
    const seenContent = new Set();
    /** @type {ReturnType<typeof parseVaultFile>} */
    const deck = [];
    for (const name of Object.keys(files).sort()) {
        for (const card of parseVaultFile(files[name], name)) {
            const content = `${card.question_de}\n${card.answer_de}`;
            if (seenIds.has(card.id) || seenContent.has(content)) continue;
            seenIds.add(card.id);
            seenContent.add(content);
            deck.push(card);
        }
    }
    return deck;
}

/**
 * Problems of a deck; an empty list means it is valid.
 * @param {unknown} deck
 * @returns {string[]}
 */
function validateDeck(deck) {
    if (!Array.isArray(deck)) return ['deck is not an array'];
    /** @type {string[]} */
    const problems = [];
    const ids = new Set();
    deck.forEach((card, index) => {
        const where = `card ${index} (${card && card.id})`;
        if (!card || typeof card !== 'object') {
            problems.push(`${where}: not an object`);
            return;
        }
        for (const field of ['id', 'category', 'hint_de', 'question_de', 'answer_de']) {
            if (typeof card[field] !== 'string' || card[field].trim() === '')
                problems.push(`${where}: ${field} missing`);
        }
        if (typeof card.id === 'string' && !/^vault_[0-9a-f]{12}$/.test(card.id)) problems.push(`${where}: bad id`);
        if (ids.has(card.id)) problems.push(`${where}: duplicate id`);
        ids.add(card.id);
        if (!CATEGORIES.includes(card.category)) problems.push(`${where}: unknown category ${card.category}`);
        for (const field of ['hint_de', 'question_de', 'answer_de']) {
            const value = String(card[field] || '');
            for (const [, tag] of value.matchAll(/<\/?([a-zA-Z0-9]+)[^>]*>/g)) {
                if (!ALLOWED_TAGS.has(tag.toLowerCase())) problems.push(`${where}: tag <${tag}> in ${field}`);
            }
            if (/<[a-zA-Z]+\s[^>]*>/.test(value)) problems.push(`${where}: attributes in ${field}`);
        }
    });
    return problems;
}

/** @param {string} dir */
function readVault(dir) {
    /** @type {Record<string, string>} */
    const files = {};
    for (const name of fs.readdirSync(dir)) {
        if (name.endsWith('.md')) files[name] = fs.readFileSync(path.join(dir, name), 'utf8');
    }
    return files;
}

function main() {
    if (process.argv.includes('--check')) {
        if (!fs.existsSync(OUTPUT)) {
            console.error('✗ assets/data/flashcards-extended.json is missing. Run: npm run import-flashcards');
            process.exit(1);
        }
        const problems = validateDeck(JSON.parse(fs.readFileSync(OUTPUT, 'utf8')));
        if (problems.length) {
            console.error(`✗ flashcards-extended.json is invalid:\n  ${problems.slice(0, 20).join('\n  ')}`);
            process.exit(1);
        }
        console.log('✅ Extended flashcard deck is valid.');
        return;
    }
    const dir = process.argv[2] || process.env.VAULT_FLASHCARDS_DIR || DEFAULT_VAULT_DIR;
    if (!fs.existsSync(dir)) {
        console.error(`✗ Vault folder not found: ${dir}`);
        process.exit(1);
    }
    const deck = buildDeck(readVault(dir));
    const problems = validateDeck(deck);
    if (problems.length) {
        console.error(`✗ Import produced an invalid deck:\n  ${problems.slice(0, 20).join('\n  ')}`);
        process.exit(1);
    }
    const json = JSON.stringify(deck) + '\n';
    fs.writeFileSync(OUTPUT, json);
    /** @type {Record<string, number>} */
    const perCategory = {};
    for (const card of deck) perCategory[card.category] = (perCategory[card.category] || 0) + 1;
    console.log(
        `✓ Wrote ${path.relative(root, OUTPUT)}: ${deck.length} cards (${(json.length / 1024).toFixed(1)} KB)`,
        perCategory
    );
}

if (require.main === module) main();

module.exports = { parseVaultFile, buildDeck, validateDeck, formatAnswer, formatLine, stripVaultSyntax };
