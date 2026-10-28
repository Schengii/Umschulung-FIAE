/**
 * @file flashcard-deck.js
 * @description DOM-free deck logic of flashcards.html: which cards a tab shows, which cards carry
 * trusted markup and how the optional IHK-Kartei (assets/data/flashcards-extended.json, imported
 * from the vault by scripts/import_vault_flashcards.js) joins the deck.
 */

import { filterByBox, filterDue } from './leitner-box.js';

/** Storage key of the "include IHK-Kartei" switch. */
export const EXTENDED_ENABLED_KEY = 'flashcards_extended_enabled';

/** Path of the generated deck, relative to the site root. */
export const EXTENDED_DECK_PATH = 'assets/data/flashcards-extended.json';

/** @typedef {{id: string | number} & Record<string, any>} Card */

/** @param {Card} card */
export const isCustomCard = (card) => typeof card.id === 'string' && card.id.startsWith('custom_');

/** @param {Card} card */
export const isExtendedCard = (card) => typeof card.id === 'string' && card.id.startsWith('vault_');

/**
 * Built-in and imported cards carry markup the site produced itself (the import escapes the
 * vault text and `check-flashcards` only allows a few formatting tags); cards typed in by the
 * user are plain text.
 * @param {Card} card
 */
export const hasTrustedMarkup = (card) => !isCustomCard(card);

/**
 * All cards in play.
 * @param {{core: Card[], custom: Card[], extended?: Card[], includeExtended?: boolean}} sources
 */
export function combineDeck({ core, custom, extended = [], includeExtended = false }) {
    return includeExtended ? [...core, ...custom, ...extended] : [...core, ...custom];
}

/**
 * Cards due today. A card of the IHK-Kartei only counts once it has been answered: two thousand
 * unseen cards would bury the reviews in the "due" tab.
 * @param {Card[]} cards
 * @param {Record<string, number>} boxLevels
 * @param {Record<string, number>} dueDates
 * @param {number} now
 */
export function dueCards(cards, boxLevels, dueDates, now) {
    return filterDue(
        cards.filter((card) => !isExtendedCard(card) || boxLevels[card.id] !== undefined),
        dueDates,
        now
    );
}

/**
 * Cards of one tab.
 * @param {Card[]} cards combined deck
 * @param {string} category tab key (`all`, `due`, `marked`, `custom`, `extended`, `box1`-`box3` or a category)
 * @param {{starredIds: Array<string | number>, boxLevels: Record<string, number>, dueDates: Record<string, number>, now: number}} state
 */
export function cardsForTab(cards, category, { starredIds, boxLevels, dueDates, now }) {
    switch (category) {
        case 'all':
            return [...cards];
        case 'marked':
            return cards.filter((card) => starredIds.includes(card.id));
        case 'custom':
            return cards.filter(isCustomCard);
        case 'extended':
            return cards.filter(isExtendedCard);
        case 'due':
            return dueCards(cards, boxLevels, dueDates, now);
        case 'box1':
        case 'box2':
        case 'box3':
            return filterByBox(cards, boxLevels, category);
        default:
            return cards.filter((card) => card.category === category);
    }
}

/**
 * Cards that count for the "flashcard master" achievement: the curated and custom cards. The
 * IHK-Kartei is optional and too large to make the achievement reachable.
 * @param {Card[]} cards
 */
export const masteryCards = (cards) => cards.filter((card) => !isExtendedCard(card));

/**
 * Validates the fetched deck; drops anything that does not look like an imported card.
 * @param {unknown} data
 * @returns {Card[]}
 */
export function parseExtendedDeck(data) {
    if (!Array.isArray(data)) return [];
    return data.filter(
        (card) =>
            card &&
            typeof card === 'object' &&
            isExtendedCard(card) &&
            typeof card.question_de === 'string' &&
            typeof card.answer_de === 'string' &&
            typeof card.category === 'string'
    );
}

/**
 * Text of a card side in the current language. Imported cards exist only in German; in English
 * they show the German text and `germanOnly` is true so the page can say so.
 * @param {Card} card
 * @param {'hint' | 'question' | 'answer'} field
 * @param {string} lang
 */
export function cardText(card, field, lang) {
    const de = card[`${field}_de`];
    const en = card[`${field}_en`];
    if (lang === 'en') return { text: en || de || '', germanOnly: !en && Boolean(de) };
    return { text: de || en || '', germanOnly: false };
}
