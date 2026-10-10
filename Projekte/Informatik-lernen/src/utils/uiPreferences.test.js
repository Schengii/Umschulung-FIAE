// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  loadUiPreferences,
  saveUiPreferences,
  sanitizeUiPreferences,
  getDefaultUiPreferences
} from './uiPreferences';

const UI_PREFS_KEY = 'informatik_game_ui_prefs_v1';

const mockMatchMedia = (matchingQueries) => {
  window.matchMedia = vi.fn((query) => ({ matches: matchingQueries.includes(query) }));
};

describe('uiPreferences', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    delete window.matchMedia;
  });

  it('liefert ohne gespeicherte Werte und ohne matchMedia die hellen Standardwerte', () => {
    expect(loadUiPreferences()).toEqual({
      theme: 'light',
      fontSize: 100,
      isDyslexic: false,
      isColorblind: false,
      isHighContrast: false,
      isReducedMotion: false
    });
  });

  it('übernimmt Dark Mode und reduzierte Bewegung vom Betriebssystem', () => {
    mockMatchMedia(['(prefers-color-scheme: dark)', '(prefers-reduced-motion: reduce)']);
    const defaults = getDefaultUiPreferences();
    expect(defaults.theme).toBe('dark');
    expect(defaults.isReducedMotion).toBe(true);
  });

  it('gespeicherte Einstellungen überleben einen Neustart und haben Vorrang vor dem System', () => {
    mockMatchMedia(['(prefers-color-scheme: dark)']);
    saveUiPreferences({ theme: 'light', fontSize: 120, isDyslexic: true });

    const loaded = loadUiPreferences();
    expect(loaded.theme).toBe('light');
    expect(loaded.fontSize).toBe(120);
    expect(loaded.isDyslexic).toBe(true);
  });

  it('speichert nur geänderte Werte, der Rest folgt weiter dem System', () => {
    saveUiPreferences({ fontSize: 110 });
    expect(JSON.parse(localStorage.getItem(UI_PREFS_KEY))).toEqual({ fontSize: 110 });

    mockMatchMedia(['(prefers-color-scheme: dark)']);
    expect(loadUiPreferences().theme).toBe('dark');
  });

  it('führt mehrere Speichervorgänge zusammen', () => {
    saveUiPreferences({ theme: 'dark' });
    saveUiPreferences({ isHighContrast: true });
    expect(JSON.parse(localStorage.getItem(UI_PREFS_KEY))).toEqual({ theme: 'dark', isHighContrast: true });
  });

  it('verwirft ungültige Werte und begrenzt die Schriftgröße', () => {
    expect(sanitizeUiPreferences({
      theme: 'neon',
      fontSize: 900,
      isDyslexic: 'ja',
      isColorblind: true,
      unbekannt: 1
    })).toEqual({ fontSize: 140, isColorblind: true });
    expect(sanitizeUiPreferences({ fontSize: 10 })).toEqual({ fontSize: 85 });
    expect(sanitizeUiPreferences(null)).toEqual({});
    expect(sanitizeUiPreferences('dark')).toEqual({});
  });

  it('fällt bei kaputtem JSON im Speicher auf die Standardwerte zurück', () => {
    localStorage.setItem(UI_PREFS_KEY, '{kaputt');
    expect(loadUiPreferences().theme).toBe('light');
    expect(loadUiPreferences().fontSize).toBe(100);
  });
});
