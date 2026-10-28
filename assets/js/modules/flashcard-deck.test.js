import { describe, it, expect } from 'vitest';
import {
    cardText,
    cardsForTab,
    combineDeck,
    dueCards,
    hasTrustedMarkup,
    isExtendedCard,
    masteryCards,
    parseExtendedDeck,
} from './flashcard-deck.js';

const NOW = new Date('2026-10-28T10:00:00').getTime();
const DAY = 86400000;

const core = [
    { id: 1, category: 'software', question_de: 'F1', question_en: 'Q1', answer_de: 'A1', answer_en: 'A1en' },
    { id: 2, category: 'database', question_de: 'F2', question_en: 'Q2', answer_de: 'A2', answer_en: 'A2en' },
];
const custom = [{ id: 'custom_1', category: 'wiso', question_de: '<b>x</b>', answer_de: 'y' }];
const extended = [
    { id: 'vault_000000000001', category: 'network', question_de: 'Was ist DNS?', answer_de: 'Namensauflösung' },
    { id: 'vault_000000000002', category: 'software', question_de: 'Was ist OOP?', answer_de: 'Objekte' },
];
const state = (overrides = {}) => ({ starredIds: [], boxLevels: {}, dueDates: {}, now: NOW, ...overrides });

describe('combineDeck', () => {
    it('leaves the IHK-Kartei out until it is switched on', () => {
        expect(combineDeck({ core, custom, extended })).toHaveLength(3);
        expect(combineDeck({ core, custom, extended, includeExtended: true })).toHaveLength(5);
    });
});

describe('cardsForTab', () => {
    const deck = combineDeck({ core, custom, extended, includeExtended: true });

    it('filters by category, custom and imported cards', () => {
        expect(cardsForTab(deck, 'software', state()).map((c) => c.id)).toEqual([1, 'vault_000000000002']);
        expect(cardsForTab(deck, 'custom', state()).map((c) => c.id)).toEqual(['custom_1']);
        expect(cardsForTab(deck, 'extended', state())).toHaveLength(2);
        expect(cardsForTab(deck, 'all', state())).toHaveLength(5);
    });

    it('shows starred cards and Leitner boxes', () => {
        expect(cardsForTab(deck, 'marked', state({ starredIds: [2] })).map((c) => c.id)).toEqual([2]);
        const boxLevels = { 1: 3, vault_000000000001: 2 };
        expect(cardsForTab(deck, 'box3', state({ boxLevels })).map((c) => c.id)).toEqual([1]);
        expect(cardsForTab(deck, 'box2', state({ boxLevels })).map((c) => c.id)).toEqual(['vault_000000000001']);
    });
});

describe('dueCards', () => {
    it('counts unseen curated cards as due but unseen imported cards not', () => {
        const deck = combineDeck({ core, custom, extended, includeExtended: true });
        expect(dueCards(deck, {}, {}, NOW).map((c) => c.id)).toEqual([1, 2, 'custom_1']);
    });

    it('counts an imported card once it has been answered and its day has come', () => {
        const deck = combineDeck({ core: [], custom: [], extended, includeExtended: true });
        const boxLevels = { vault_000000000001: 1, vault_000000000002: 2 };
        const dueDates = { vault_000000000002: NOW + 3 * DAY };
        expect(dueCards(deck, boxLevels, dueDates, NOW).map((c) => c.id)).toEqual(['vault_000000000001']);
    });
});

describe('card helpers', () => {
    it('trusts markup of built-in and imported cards, not of custom cards', () => {
        expect(hasTrustedMarkup(core[0])).toBe(true);
        expect(hasTrustedMarkup(extended[0])).toBe(true);
        expect(hasTrustedMarkup(custom[0])).toBe(false);
    });

    it('excludes the IHK-Kartei from the mastery achievement', () => {
        const deck = combineDeck({ core, custom, extended, includeExtended: true });
        expect(masteryCards(deck).some(isExtendedCard)).toBe(false);
        expect(masteryCards(deck)).toHaveLength(3);
    });

    it('falls back to German in English mode and says so', () => {
        expect(cardText(extended[0], 'question', 'en')).toEqual({ text: 'Was ist DNS?', germanOnly: true });
        expect(cardText(core[0], 'question', 'en')).toEqual({ text: 'Q1', germanOnly: false });
        expect(cardText(core[0], 'question', 'de')).toEqual({ text: 'F1', germanOnly: false });
        expect(cardText({ id: 'x' }, 'hint', 'de')).toEqual({ text: '', germanOnly: false });
    });
});

describe('parseExtendedDeck', () => {
    it('keeps only well-formed imported cards', () => {
        const parsed = parseExtendedDeck([
            extended[0],
            { id: 'custom_9', question_de: 'x', answer_de: 'y', category: 'wiso' },
            { id: 'vault_000000000003', question_de: 'nur Frage', category: 'wiso' },
            null,
        ]);
        expect(parsed).toEqual([extended[0]]);
    });

    it('returns an empty deck for anything but an array', () => {
        expect(parseExtendedDeck({ cards: [] })).toEqual([]);
        expect(parseExtendedDeck(null)).toEqual([]);
    });
});
