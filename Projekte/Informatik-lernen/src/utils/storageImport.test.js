// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  initialProfileState,
  sanitizeImportedState,
  importUserDataJSON,
  loadUserState,
  exportUserDataJSON,
  saveUserState
} from './storage';

describe('sanitizeImportedState', () => {
  it('lehnt Nicht-Objekte, Arrays und fremde JSON-Dateien ab', () => {
    expect(sanitizeImportedState(null)).toBeNull();
    expect(sanitizeImportedState('text')).toBeNull();
    expect(sanitizeImportedState(42)).toBeNull();
    expect(sanitizeImportedState([])).toBeNull();
    expect(sanitizeImportedState([{ xp: 10 }])).toBeNull();
    expect(sanitizeImportedState({})).toBeNull();
    expect(sanitizeImportedState({ name: 'package', version: '1.0.0' })).toBeNull();
  });

  it('übernimmt einen gültigen Spielstand und berechnet das Level aus den XP', () => {
    const out = sanitizeImportedState({ xp: 450, level: 99, unlockedBadges: ['first_steps'], role: 'azubi' });
    expect(out.xp).toBe(450);
    expect(out.level).toBe(4); // floor(sqrt(450/50)) + 1
    expect(out.unlockedBadges).toEqual(['first_steps']);
    expect(out.role).toBe('azubi');
  });

  it('füllt fehlende Felder aus älteren Backups mit Standardwerten', () => {
    const out = sanitizeImportedState({ xp: 10 });
    expect(out.labProgress).toEqual({});
    expect(out.mistakeJournal).toEqual({});
    expect(out.completedTopics).toEqual([]);
    expect(out.soundSettings).toEqual(initialProfileState.soundSettings);
  });

  it('verwirft Felder mit falschem Typ und nimmt den Standardwert', () => {
    const out = sanitizeImportedState({
      xp: 'viel',
      streak: -3,
      completedTopics: null,
      unlockedBadges: ['ok', 5],
      activityHistory: [],
      role: 7,
      srsFlashcards: 'x'
    });
    expect(out.xp).toBe(0);
    expect(out.streak).toBe(initialProfileState.streak);
    expect(out.completedTopics).toEqual([]);
    expect(out.unlockedBadges).toEqual([]);
    expect(out.activityHistory).toEqual({});
    expect(out.role).toBe(initialProfileState.role);
    expect(out.srsFlashcards).toEqual({});
  });

  it('lehnt NaN/Infinity ab und behält unbekannte Felder, aber keine gefährlichen Schlüssel', () => {
    const parsed = JSON.parse('{"xp": 5, "customFlag": true, "__proto__": {"polluted": true}, "constructor": 1}');
    const out = sanitizeImportedState({ ...parsed, streak: Infinity });
    expect(out.streak).toBe(initialProfileState.streak);
    expect(out.customFlag).toBe(true);
    expect(Object.hasOwn(out, '__proto__')).toBe(false);
    expect(out.constructor).toBe(Object);
    expect({}.polluted).toBeUndefined();
  });

  it('verändert die Eingabe und die Standardwerte nicht', () => {
    const input = { xp: 10, completedTopics: ['a'] };
    const before = JSON.stringify(input);
    const out = sanitizeImportedState(input);
    expect(JSON.stringify(input)).toBe(before);
    expect(out).not.toBe(initialProfileState);
    expect(initialProfileState.xp).toBe(0);
  });
});

describe('importUserDataJSON', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('schreibt einen gültigen Spielstand sofort und ist wieder ladbar', () => {
    expect(importUserDataJSON(JSON.stringify({ xp: 200, unlockedBadges: ['b1'] }))).toBe(true);
    const loaded = loadUserState();
    expect(loaded.xp).toBe(200);
    expect(loaded.level).toBe(3);
    expect(loaded.unlockedBadges).toEqual(['b1']);
  });

  it('gibt false zurück und lässt den vorhandenen Fortschritt unangetastet', () => {
    saveUserState({ ...initialProfileState, xp: 999 }, { immediate: true });
    expect(importUserDataJSON('{kaputt')).toBe(false);
    expect(importUserDataJSON('[]')).toBe(false);
    expect(importUserDataJSON('{"foo":1}')).toBe(false);
    expect(importUserDataJSON('null')).toBe(false);
    expect(loadUserState().xp).toBe(999);
  });
});

describe('exportUserDataJSON', () => {
  it('sichert vor dem Export ein noch ausstehendes Schreiben', () => {
    localStorage.clear();
    saveUserState({ ...initialProfileState, xp: 123 }); // gebündelt, noch nicht in localStorage
    expect(localStorage.getItem('informatik_game_state_v1')).toBeNull();

    const clicks = [];
    const realCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = realCreate(tag);
      if (tag === 'a') el.click = () => clicks.push(decodeURIComponent(el.getAttribute('href')));
      return el;
    });

    exportUserDataJSON();
    expect(clicks).toHaveLength(1);
    expect(clicks[0]).toContain('"xp": 123');
    vi.restoreAllMocks();
  });
});
