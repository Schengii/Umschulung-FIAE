import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

// The privacy notice lists the localStorage keys the site uses. This test keeps that list and
// the code in step: a new key in constants.js has to be named in pages/datenschutz.html.
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const STORAGE_KEYS = new Function('window', `${read('assets/js/constants.js')}; return STORAGE_KEYS;`)({
    location: { pathname: '/' },
});

// Keys the code uses without an entry in STORAGE_KEYS.
const KEYS_OUTSIDE_CONSTANTS = ['flashcards_extended_enabled', 'last_backup_at'];

const html = read('pages/datenschutz.html');
const listMatch = /<ul id="storage-key-list">([\s\S]*?)<\/ul>/.exec(html);
const listed = listMatch ? [...listMatch[1].matchAll(/<code>([^<]+)<\/code>/g)].map((match) => match[1]) : [];
const exact = listed.filter((key) => !key.endsWith('*'));
const prefixes = listed.filter((key) => key.endsWith('*')).map((key) => key.slice(0, -1));
const isListed = (key) => exact.includes(key) || prefixes.some((prefix) => key.startsWith(prefix));

describe('privacy notice: localStorage keys', () => {
    it('contains the key list', () => {
        expect(listed.length).toBeGreaterThan(0);
    });

    it('names every key from STORAGE_KEYS', () => {
        const missing = Object.values(STORAGE_KEYS).filter((key) => !isListed(key));
        expect(missing).toEqual([]);
    });

    it('names the keys that are used outside STORAGE_KEYS', () => {
        expect(KEYS_OUTSIDE_CONSTANTS.filter((key) => !isListed(key))).toEqual([]);
    });

    it('names no key the code does not know (renamed or removed keys)', () => {
        const known = new Set([...Object.values(STORAGE_KEYS), ...KEYS_OUTSIDE_CONSTANTS]);
        expect(exact.filter((key) => !known.has(key))).toEqual([]);
    });

    it('lists no key twice', () => {
        expect(new Set(listed).size).toBe(listed.length);
    });
});
