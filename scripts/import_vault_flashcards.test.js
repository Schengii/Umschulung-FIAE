import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import importer from './import_vault_flashcards.js';

const { parseVaultFile, buildDeck, validateDeck, formatAnswer, formatLine, stripVaultSyntax } = importer;
const AP2 = 'FIAE Prüfungsvorbereitung AP2 - Karteikarten.md';
const WISO = 'Wirtschafts- und Sozialkunde (WISO) - Karteikarten.md';
const note = (body) => `---\ntags:\n  - fiae\n---\n\n# Titel\n\n${body}`;

describe('stripVaultSyntax', () => {
    it('turns wikilinks into their label and drops tags, highlights and cloze braces', () => {
        expect(stripVaultSyntax('Siehe [[Ordner/Notiz|OSI-Modell]] und [[Ordner/TCP]] #flashcards/FIAE')).toBe(
            'Siehe OSI-Modell und TCP'
        );
        expect(stripVaultSyntax('Das ist ==wichtig== und {{Lücke}}')).toBe('Das ist wichtig und Lücke');
    });
});

describe('formatLine', () => {
    it('escapes HTML from the vault text', () => {
        expect(formatLine('<script>alert(1)</script> & "x"')).toBe(
            '&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;x&quot;'
        );
    });

    it('renders RemNote term;;definition pairs and inline formatting', () => {
        expect(formatLine('RAM;;flüchtiger **Arbeits**speicher mit `DDR5`')).toBe(
            '<strong>RAM</strong>: flüchtiger <strong>Arbeits</strong>speicher mit <code>DDR5</code>'
        );
    });
});

describe('formatAnswer', () => {
    it('groups bullet lines into one list and joins text lines with <br>', () => {
        expect(formatAnswer(['Zwei Arten:', '- Blackbox', '- Whitebox'])).toBe(
            'Zwei Arten:<ul><li>Blackbox</li><li>Whitebox</li></ul>'
        );
        expect(formatAnswer(['Zeile eins', 'Zeile zwei'])).toBe('Zeile eins<br>Zeile zwei');
    });

    it('highlights the option marked with ✅ in multiple-choice cards', () => {
        expect(formatAnswer(['- falsch', '- ✅ richtig'])).toBe(
            '<ul><li>falsch</li><li><strong>✅ richtig</strong></li></ul>'
        );
    });
});

describe('parseVaultFile', () => {
    const markdown = note(
        [
            '### Netzwerke',
            '#### WLAN',
            '',
            'Was ist ein Mesh-Netzwerk?',
            '?',
            'Ein Netz, in dem jeder Knoten mit mehreren anderen verbunden ist.',
            '',
            '---',
            '',
            '### 1.2.0.0 - Klausuren',
            '',
            'Welche Klausel fehlt in `SELECT * FROM t`?',
            '?',
            'Keine, die Abfrage ist vollständig.',
            '',
            '---',
            '',
            'Karte mit Bild',
            '?',
            '![[diagramm.png]]',
            '',
            '---',
            '',
            'Nur Text ohne Fragezeichenzeile',
        ].join('\n')
    );

    it('reads question, answer and the closest heading as hint', () => {
        const cards = parseVaultFile(markdown, AP2);
        expect(cards[0]).toMatchObject({
            category: 'network',
            hint_de: 'WLAN',
            question_de: 'Was ist ein Mesh-Netzwerk?',
            answer_de: 'Ein Netz, in dem jeder Knoten mit mehreren anderen verbunden ist.',
        });
        expect(cards[0].id).toMatch(/^vault_[0-9a-f]{12}$/);
    });

    it('derives the category from keywords in the question when the heading has none', () => {
        const card = parseVaultFile(markdown, AP2)[1];
        expect(card.category).toBe('database');
        // chapter number removed from the hint
        expect(card.hint_de).toBe('Klausuren');
    });

    it('lets a heading keyword win over the question', () => {
        const cards = parseVaultFile(note('### WLAN\n\nWo liegt die SQL-Datei?\n?\nAuf dem Server.'), AP2);
        expect(cards[0].category).toBe('network');
    });

    it('skips cards with images and blocks without a "?" line', () => {
        const questions = parseVaultFile(markdown, AP2).map((card) => card.question_de);
        expect(questions).not.toContain('Karte mit Bild');
        expect(questions).toHaveLength(2);
    });

    it('keeps WISO cards in WISO even when they mention a technical term', () => {
        const cards = parseVaultFile(note('Was regelt die DSGVO beim Backup?\n?\nDie Aufbewahrung.'), WISO);
        expect(cards[0].category).toBe('wiso');
    });

    it('imports nothing from files that are not mapped (shortcut lists)', () => {
        expect(parseVaultFile(markdown, 'Developer Akademie Shortcuts - Karteikarten.md')).toEqual([]);
    });

    it('gives the same card the same id on every run', () => {
        expect(parseVaultFile(markdown, AP2)[0].id).toBe(parseVaultFile(markdown, AP2)[0].id);
    });
});

describe('buildDeck', () => {
    it('drops duplicate cards across files', () => {
        const card = note('Was ist TCP?\n?\nEin verbindungsorientiertes Protokoll.');
        const deck = buildDeck({ [AP2]: card, 'IT-Systemtechnik - Karteikarten.md': card });
        expect(deck).toHaveLength(1);
    });
});

describe('validateDeck', () => {
    const valid = {
        id: 'vault_0123456789ab',
        category: 'software',
        hint_de: 'Test',
        question_de: 'Frage?',
        answer_de: '<strong>Antwort</strong>',
    };

    it('accepts a valid deck', () => {
        expect(validateDeck([valid])).toEqual([]);
    });

    it('rejects foreign tags, attributes, unknown categories and duplicate ids', () => {
        const problems = validateDeck([
            { ...valid, answer_de: '<img src=x onerror=alert(1)>' },
            { ...valid, id: 'vault_aaaaaaaaaaaa', category: 'cooking' },
            { ...valid, answer_de: '<strong class="x">a</strong>' },
            valid,
        ]);
        expect(problems.join('\n')).toMatch(/tag <img>/);
        expect(problems.join('\n')).toMatch(/unknown category cooking/);
        expect(problems.join('\n')).toMatch(/attributes/);
        expect(problems.join('\n')).toMatch(/duplicate id/);
    });

    it('accepts the committed deck', () => {
        const file = path.resolve(__dirname, '..', 'assets', 'data', 'flashcards-extended.json');
        const deck = JSON.parse(fs.readFileSync(file, 'utf8'));
        expect(deck.length).toBeGreaterThan(100);
        expect(validateDeck(deck)).toEqual([]);
    });
});
