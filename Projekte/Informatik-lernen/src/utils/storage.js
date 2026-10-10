// @ts-check
// Storage utility to manage user state, progress, XP, activity history and badges
import { syncUserStateToIndexedDb } from './indexedDbStoreMiddleware';

/**
 * @typedef {object} ActivityDay
 * @property {number} count
 * @property {number} xp
 *
 * @typedef {object} SoundSettings
 * @property {number} volume
 * @property {boolean} isMuted
 *
 * @typedef {object} UserState
 * @property {string} role
 * @property {string} userName
 * @property {number} xp
 * @property {number} level
 * @property {number} streak
 * @property {number} streakFreezes
 * @property {string} [lastActiveDate] Letzter aktiver Tag (YYYY-MM-DD, lokale Zeit)
 * @property {Record<string, unknown>} [mistakeJournal]
 * @property {Record<string, import('./labProgressEngine').LabProgressEntry>} [labProgress] Lab-Besuche/-Abschlüsse je Registry-Tab
 * @property {Record<string, unknown>} srsFlashcards
 * @property {string[]} completedTopics
 * @property {string[]} completedGames
 * @property {string[]} completedCloze
 * @property {string[]} completedProjects
 * @property {string[]} unlockedBadges
 * @property {Record<string, unknown>} savedCodeSnippets
 * @property {Record<string, ActivityDay>} activityHistory
 * @property {SoundSettings} soundSettings
 */

const STORAGE_KEY = 'informatik_game_state_v1';

/** @type {UserState} */
export const initialProfileState = {
  role: 'anfaenger', // 'anfaenger' | 'azubi' | 'junior' | 'pro'
  userName: 'Dev Explorer',
  xp: 0,
  level: 1,
  streak: 1,
  streakFreezes: 0,
  lastActiveDate: '', // letzter Tag mit Aktivität (lokal), Basis der Streak-Berechnung
  srsFlashcards: {}, // { [cardId]: { repetitions, interval, easeFactor, dueDate } }
  mistakeJournal: {}, // { [questionId]: { wrongCount, streak, interval, dueDate, lastSeen } } - siehe mistakeJournalEngine
  labProgress: {}, // { [labKey]: { visits, lastVisit, completed, completedOn } } - siehe labProgressEngine
  completedTopics: [],
  completedGames: [],
  completedCloze: [],
  completedProjects: [],
  unlockedBadges: [],
  savedCodeSnippets: {},
  activityHistory: {}, // { '2026-08-22': { count: 3, xp: 150 } }
  soundSettings: { volume: 0.5, isMuted: false }
};

/**
 * Lokaler Datumsschlüssel YYYY-MM-DD. (toISOString() wäre UTC: für Nutzer in
 * Deutschland würde Aktivität zwischen 0 und 2 Uhr dem Vortag zugerechnet.)
 * @param {Date} date
 * @returns {string}
 */
export const toLocalDateKey = (date) => {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
};

/** @returns {string} */
export const getTodayDateKey = () => toLocalDateKey(new Date());

/**
 * Kalendertage zwischen zwei Datumsschlüsseln (YYYY-MM-DD). Rechnet über UTC-Mitternacht,
 * damit Sommer-/Winterzeit-Umstellungen keine 23/25-Stunden-Tage erzeugen.
 * @param {string} fromKey
 * @param {string} toKey
 * @returns {number}
 */
export const daysBetweenDateKeys = (fromKey, toKey) => {
  const toUtc = (/** @type {string} */ key) => {
    const [y, m, d] = key.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(toKey) - toUtc(fromKey)) / 86400000);
};

/**
 * Aktualisiert Streak und Streak-Freezes für Aktivität am Tag `todayKey`.
 * - erster Tag oder gleicher Tag: Streak bleibt (mind. 1)
 * - Folgetag: Streak + 1
 * - Lücke von n verpassten Tagen: pro verpasstem Tag wird ein Streak-Freeze
 *   verbraucht; reichen sie nicht, startet der Streak bei 1 neu (Freezes bleiben erhalten).
 * @param {UserState} state
 * @param {string} todayKey
 * @returns {UserState}
 */
export const updateStreak = (state, todayKey) => {
  const last = state.lastActiveDate;
  if (!last) {
    return { ...state, streak: Math.max(1, state.streak || 1), lastActiveDate: todayKey };
  }
  const gap = daysBetweenDateKeys(last, todayKey);
  if (gap <= 0) return state.lastActiveDate === todayKey ? state : { ...state, lastActiveDate: todayKey };
  if (gap === 1) return { ...state, streak: (state.streak || 1) + 1, lastActiveDate: todayKey };

  const missed = gap - 1;
  const freezes = state.streakFreezes || 0;
  if (freezes >= missed) {
    return { ...state, streak: (state.streak || 1) + 1, streakFreezes: freezes - missed, lastActiveDate: todayKey };
  }
  return { ...state, streak: 1, lastActiveDate: todayKey };
};

/**
 * @param {UserState} state
 * @param {number} [xpGained]
 * @returns {UserState}
 */
export const recordDailyActivity = (state, xpGained = 0) => {
  const dateKey = getTodayDateKey();
  const history = { ...(state.activityHistory || {}) };
  const current = history[dateKey] || { count: 0, xp: 0 };
  
  history[dateKey] = {
    count: current.count + 1,
    xp: current.xp + xpGained
  };

  return updateStreak({
    ...state,
    activityHistory: history
  }, dateKey);
};

/** @returns {UserState} */
export const loadUserState = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return initialProfileState;
    return { ...initialProfileState, ...JSON.parse(data) };
  } catch (e) {
    console.error('Failed to load storage:', e);
    return initialProfileState;
  }
};

/**
 * Prüft, ob bereits ein persistierter User-State in localStorage existiert.
 * Wird beim App-Start genutzt, um zu entscheiden, ob eine asynchrone
 * Notfall-Hydration aus IndexedDB versucht werden soll (siehe
 * `useStore.js`): Nur ein wirklich leerer/gelöschter localStorage gilt als
 * Hydrations-Kandidat, nicht jeder Nutzer mit Default-Werten.
 * @returns {boolean}
 */
export const hasStoredUserState = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
};

/** @param {UserState} state */
const persistStateNow = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save storage:', e);
  }
  try {
    syncUserStateToIndexedDb(state);
  } catch {
    // Ignoriere Fehler im synchronen Pfad
  }
};

// Debounced Persistenz: Der Zustand im Zustand-Store (Zustand/zustand) wird
// bei JEDER Mikro-Aktion (XP-Vergabe, SRS-Update, Sound-Toggle, ...) neu
// gesetzt. Würde jede dieser Aktionen sofort einen kompletten
// `JSON.stringify` + `localStorage.setItem` auslösen, würde ein häufiges
// Trigger-Muster (z. B. mehrere XP-Events in schneller Folge) unnötig oft
// den kompletten, mit der Zeit wachsenden State (Notizen, SRS-Karten,
// Activity-Verlauf) neu serialisieren. Stattdessen wird nur der jeweils
// letzte Zustand innerhalb eines kurzen Zeitfensters tatsächlich geschrieben
// ("trailing debounce"). Der In-Memory-Zustand im Store ist davon nicht
// betroffen - die UI bleibt sofort reaktiv, nur das Schreiben auf die Platte
// wird gebündelt.
const PERSIST_DEBOUNCE_MS = 400;
/** @type {UserState | null} */
let pendingState = null;
/** @type {ReturnType<typeof setTimeout> | null} */
let debounceTimer = null;

const flushPendingWrite = () => {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  if (pendingState !== null) {
    persistStateNow(pendingState);
    pendingState = null;
  }
};

// Sicherheitsnetz: Falls der Tab geschlossen oder in den Hintergrund gelegt
// wird, während noch ein gebündeltes Schreiben aussteht, wird sofort
// synchron persistiert - so geht trotz Debounce kein Fortschritt verloren.
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushPendingWrite);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushPendingWrite();
    }
  });
}

/**
 * Persistiert den User-State in localStorage & IndexedDB.
 *
 * @param {UserState} state - Der zu speichernde User-State.
 * @param {{ immediate?: boolean }} [options] - `immediate: true` erzwingt ein
 *   sofortiges, synchrones Schreiben (z. B. für Backup-Export/Import oder
 *   Rollenwahl, wo der Nutzer eine unmittelbare Bestätigung erwartet).
 *   Ohne diese Option wird das Schreiben um `PERSIST_DEBOUNCE_MS` gebündelt.
 */
export const saveUserState = (state, options = {}) => {
  if (options.immediate) {
    flushPendingWrite();
    persistStateNow(state);
    return;
  }

  pendingState = state;
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(flushPendingWrite, PERSIST_DEBOUNCE_MS);
};

/** Erzwingt das sofortige Schreiben eines eventuell noch ausstehenden, gebündelten Speichervorgangs. */
export const flushUserState = () => {
  flushPendingWrite();
};

export const exportUserDataJSON = () => {
  try {
    // Ausstehendes, gebündeltes Schreiben zuerst sichern, damit der Export den aktuellen Stand enthält.
    flushPendingWrite();
    const state = loadUserState();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `IT-DevGame-Backup-${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  } catch (e) {
    console.error('Failed to export user data:', e);
  }
};

const isPlainObject = (/** @type {unknown} */ v) => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStringArray = (/** @type {unknown} */ v) => Array.isArray(v) && v.every((x) => typeof x === 'string');
const isFiniteNumber = (/** @type {unknown} */ v) => typeof v === 'number' && Number.isFinite(v);
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/** Typprüfungen je bekanntem Feld des Spielstands; passt der Typ nicht, gilt der Standardwert. */
/** @type {Record<string, (v: unknown) => boolean>} */
const FIELD_VALIDATORS = {
  role: (v) => typeof v === 'string',
  userName: (v) => typeof v === 'string',
  lastActiveDate: (v) => typeof v === 'string',
  xp: (v) => isFiniteNumber(v) && /** @type {number} */ (v) >= 0,
  level: (v) => isFiniteNumber(v) && /** @type {number} */ (v) >= 1,
  streak: (v) => isFiniteNumber(v) && /** @type {number} */ (v) >= 0,
  streakFreezes: (v) => isFiniteNumber(v) && /** @type {number} */ (v) >= 0,
  completedTopics: isStringArray,
  completedGames: isStringArray,
  completedCloze: isStringArray,
  completedProjects: isStringArray,
  unlockedBadges: isStringArray,
  srsFlashcards: isPlainObject,
  mistakeJournal: isPlainObject,
  labProgress: isPlainObject,
  savedCodeSnippets: isPlainObject,
  activityHistory: isPlainObject,
  soundSettings: isPlainObject
};

/**
 * Bereinigt einen importierten Spielstand: Felder mit falschem Typ fallen auf den
 * Standardwert zurück, das Level wird aus den XP neu berechnet, unbekannte Felder
 * bleiben erhalten (außer gefährlichen Schlüsseln). Gibt `null` zurück, wenn die
 * Daten kein Spielstand sind (kein Objekt oder kein einziges bekanntes Feld) –
 * so überschreibt eine fremde JSON-Datei nie den vorhandenen Fortschritt.
 * @param {unknown} parsed
 * @returns {UserState | null}
 */
export const sanitizeImportedState = (parsed) => {
  if (!isPlainObject(parsed)) return null;
  const input = /** @type {Record<string, unknown>} */ (parsed);
  if (!Object.keys(FIELD_VALIDATORS).some((key) => key in input)) return null;

  /** @type {Record<string, unknown>} */
  const result = { ...initialProfileState };
  for (const [key, value] of Object.entries(input)) {
    if (UNSAFE_KEYS.has(key)) continue;
    const validate = FIELD_VALIDATORS[key];
    if (validate && !validate(value)) continue;
    result[key] = value;
  }
  result.level = calculateLevel(/** @type {number} */ (result.xp));
  return /** @type {UserState} */ (result);
};

/**
 * @param {string} jsonString
 * @returns {boolean}
 */
export const importUserDataJSON = (jsonString) => {
  try {
    const sanitized = sanitizeImportedState(JSON.parse(jsonString));
    if (!sanitized) return false;
    saveUserState(sanitized, { immediate: true });
    return true;
  } catch (e) {
    console.error('Failed to import user data:', e);
    return false;
  }
};

/**
 * @param {number} xp
 * @returns {number}
 */
export const calculateLevel = (xp) => {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
};

export const BADGES = [
  { id: 'first_steps', title: 'Erste Schritte', desc: 'Wähle dein Profil und schließe dein erstes Modul ab.', icon: '🚀' },
  { id: 'sql_master', title: 'SQL Commander', desc: 'Meistere das SQL Dungeon und führe komplexe Queries aus.', icon: '⚡' },
  { id: 'security_expert', title: 'Cyber Defender', desc: 'Behebe alle Sicherheitslücken im Security Lab.', icon: '🛡️' },
  { id: 'cloze_wizard', title: 'Lückentext-Meister', desc: 'Absolviere 5 Lückentexte fehlerfrei.', icon: '📜' },
  { id: 'web_builder', title: 'Fullstack Explorer', desc: 'Erstelle dein erstes Web-Projekt in der Live Sandbox.', icon: '🌐' },
  { id: 'logic_genius', title: 'Gatter-Genie', desc: 'Löse alle Logikschaltungen im Logic Game.', icon: '💡' },
  { id: 'regex_master', title: 'RegEx Meister', desc: 'Löse RegEx-Suchmuster Aufgaben.', icon: '🔍' },
  { id: 'exam_passed', title: 'IHK Prüfung Zertifiziert', desc: 'Bestehe die IHK Prüfungssimulation mit über 60%.', icon: '🎓' },
  { id: 'wiso_master', title: 'WISO Kalkulator', desc: 'Schließe eine Handelskalkulation oder einen Netzplan fehlerfrei ab.', icon: '📊' },
  { id: 'ieee_architect', title: 'Hardware Architect', desc: 'Analysiere IEEE-754 Floats und KV-Diagramme.', icon: '🔬' },
  { id: 'ipv6_expert', title: 'IPv6 & Routing Pioneer', desc: 'Generiere EUI-64 Adressen und meistere LPM-Routing.', icon: '🌐' },
  { id: 'owasp_guardian', title: 'OWASP Guardian', desc: 'Identifiziere und neutralisiere Top-10 Schwachstellen.', icon: '🔒' },
  { id: 'ai_pioneer', title: 'Neural AI Pioneer', desc: 'Erkunde neuronale Schichten und BPE Tokenizer.', icon: '🧠' }
];
