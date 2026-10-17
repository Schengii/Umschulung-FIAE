import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Achievements } from './achievements.js';

describe('Achievements definitions', () => {
    it('defines required achievements with bilingual metadata', () => {
        expect(Object.keys(Achievements.definitions).length).toBeGreaterThan(5);

        for (const [id, def] of Object.entries(Achievements.definitions)) {
            expect(def.icon, `${id} must have an icon`).toBeTypeOf('string');
            expect(def.title_de, `${id} must have a German title`).toBeTypeOf('string');
            expect(def.title_en, `${id} must have an English title`).toBeTypeOf('string');
            expect(def.desc_de, `${id} must have a German description`).toBeTypeOf('string');
            expect(def.desc_en, `${id} must have an English description`).toBeTypeOf('string');
        }
    });
});

describe('Achievements logic', () => {
    let storageMap;

    beforeEach(() => {
        storageMap = new Map();
        globalThis.AppStorage = {
            getItem: (key, fallback = null) => (storageMap.has(key) ? storageMap.get(key) : fallback),
            setItem: (key, val) => storageMap.set(key, String(val)),
            removeItem: (key) => storageMap.delete(key),
        };
        globalThis.STORAGE_KEYS = { ACHIEVEMENTS: 'achievements' };
    });

    afterEach(() => {
        delete globalThis.AppStorage;
        delete globalThis.STORAGE_KEYS;
    });

    it('returns empty array when storage is empty or invalid', () => {
        expect(Achievements.getUnlocked()).toEqual([]);

        storageMap.set('achievements', '{ damaged-json');
        expect(Achievements.getUnlocked()).toEqual([]);
    });

    it('checks whether an achievement is unlocked', () => {
        storageMap.set('achievements', JSON.stringify(['first_visit']));
        expect(Achievements.isUnlocked('first_visit')).toBe(true);
        expect(Achievements.isUnlocked('quiz_perfect')).toBe(false);
    });

    it('ignores unknown achievement IDs', () => {
        Achievements.unlock('non_existent_id_xyz');
        expect(Achievements.getUnlocked()).toEqual([]);
    });

    it('unlocks valid achievements and avoids duplicates', () => {
        Achievements.unlock('first_visit');
        expect(Achievements.isUnlocked('first_visit')).toBe(true);
        expect(Achievements.getUnlocked()).toEqual(['first_visit']);

        // Duplicate attempt should not append
        Achievements.unlock('first_visit');
        expect(Achievements.getUnlocked()).toEqual(['first_visit']);

        Achievements.unlock('quiz_perfect');
        expect(Achievements.getUnlocked()).toEqual(['first_visit', 'quiz_perfect']);
    });

    it('dispatches achievementunlocked event on document', () => {
        const events = [];
        const mockDocument = {
            dispatchEvent: vi.fn((e) => events.push(e)),
            documentElement: { getAttribute: () => 'de' },
            body: { appendChild: vi.fn() },
            createElement: () => ({
                classList: { add: vi.fn(), remove: vi.fn() },
                setAttribute: vi.fn(),
                style: {},
            }),
        };
        globalThis.document = /** @type {any} */ (mockDocument);
        globalThis.requestAnimationFrame = (fn) => fn();

        try {
            Achievements.unlock('dark_mode_fan');
            expect(mockDocument.dispatchEvent).toHaveBeenCalled();
            expect(events.length).toBe(1);
            expect(events[0].type).toBe('achievementunlocked');
            expect(events[0].detail).toBe('dark_mode_fan');
        } finally {
            delete globalThis.document;
            delete globalThis.requestAnimationFrame;
        }
    });
});
