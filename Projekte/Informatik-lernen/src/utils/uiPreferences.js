// @ts-check
// Persistenz der Anzeige- und Barrierefreiheits-Einstellungen (Theme,
// Schriftgröße, Lese-Hilfe, Farbsehschwäche, Hochkontrast, reduzierte
// Bewegung). Bewusst ein eigener localStorage-Schlüssel statt Teil des
// User-States aus `storage.js`: die Einstellungen sind gerätebezogen und
// sollen weder im Fortschritts-Backup landen noch beim Import eines Backups
// auf einem anderen Gerät überschrieben werden.

/**
 * @typedef {object} UiPreferences
 * @property {'light' | 'dark'} theme
 * @property {number} fontSize
 * @property {boolean} isDyslexic
 * @property {boolean} isColorblind
 * @property {boolean} isHighContrast
 * @property {boolean} isReducedMotion
 */

const UI_PREFS_KEY = 'informatik_game_ui_prefs_v1';

export const MIN_FONT_SIZE = 85;
export const MAX_FONT_SIZE = 140;

/** @type {(keyof UiPreferences)[]} */
const BOOLEAN_KEYS = ['isDyslexic', 'isColorblind', 'isHighContrast', 'isReducedMotion'];

/**
 * @param {string} query
 * @returns {boolean}
 */
const matchesMedia = (query) => {
  try {
    return typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia(query).matches;
  } catch {
    return false;
  }
};

/**
 * Startwerte, solange der Nutzer nichts selbst eingestellt hat: Theme und
 * reduzierte Bewegung folgen den Betriebssystem-Einstellungen.
 * @returns {UiPreferences}
 */
export const getDefaultUiPreferences = () => ({
  theme: matchesMedia('(prefers-color-scheme: dark)') ? 'dark' : 'light',
  fontSize: 100,
  isDyslexic: false,
  isColorblind: false,
  isHighContrast: false,
  isReducedMotion: matchesMedia('(prefers-reduced-motion: reduce)')
});

/**
 * Übernimmt aus einem beliebigen (z. B. manuell veränderten oder von einer
 * älteren Version geschriebenen) Objekt nur gültige Einstellungen.
 * @param {unknown} raw
 * @returns {Partial<UiPreferences>}
 */
export const sanitizeUiPreferences = (raw) => {
  if (typeof raw !== 'object' || raw === null) return {};
  const source = /** @type {Record<string, unknown>} */ (raw);
  /** @type {Partial<UiPreferences>} */
  const clean = {};

  if (source.theme === 'light' || source.theme === 'dark') {
    clean.theme = source.theme;
  }
  if (typeof source.fontSize === 'number' && Number.isFinite(source.fontSize)) {
    clean.fontSize = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, source.fontSize));
  }
  for (const key of BOOLEAN_KEYS) {
    const value = source[key];
    if (typeof value === 'boolean') {
      Object.assign(clean, { [key]: value });
    }
  }
  return clean;
};

/** @returns {Partial<UiPreferences>} */
const readStoredUiPreferences = () => {
  try {
    const data = localStorage.getItem(UI_PREFS_KEY);
    return data ? sanitizeUiPreferences(JSON.parse(data)) : {};
  } catch {
    return {};
  }
};

/** @returns {UiPreferences} */
export const loadUiPreferences = () => ({
  ...getDefaultUiPreferences(),
  ...readStoredUiPreferences()
});

/**
 * Speichert nur die übergebenen Einstellungen. Alles, was der Nutzer nie
 * selbst angefasst hat, bleibt ungespeichert und folgt weiter den
 * Betriebssystem-Einstellungen.
 * @param {Partial<UiPreferences>} patch
 */
export const saveUiPreferences = (patch) => {
  try {
    const merged = { ...readStoredUiPreferences(), ...sanitizeUiPreferences(patch) };
    localStorage.setItem(UI_PREFS_KEY, JSON.stringify(merged));
  } catch (e) {
    console.error('Failed to save UI preferences:', e);
  }
};
