// Storage utility to manage user state, progress, XP, activity history and badges
import { syncUserStateToIndexedDb } from './indexedDbStoreMiddleware';

const STORAGE_KEY = 'informatik_game_state_v1';

export const initialProfileState = {
  role: 'anfaenger', // 'anfaenger' | 'azubi' | 'junior' | 'pro'
  userName: 'Dev Explorer',
  xp: 0,
  level: 1,
  streak: 1,
  streakFreezes: 0,
  srsFlashcards: {}, // { [cardId]: { repetitions, interval, easeFactor, dueDate } }
  completedTopics: [],
  completedGames: [],
  completedCloze: [],
  completedProjects: [],
  unlockedBadges: [],
  savedCodeSnippets: {},
  activityHistory: {}, // { '2026-08-22': { count: 3, xp: 150 } }
  soundSettings: { volume: 0.5, isMuted: false }
};

export const getTodayDateKey = () => {
  return new Date().toISOString().slice(0, 10);
};

export const recordDailyActivity = (state, xpGained = 0) => {
  const dateKey = getTodayDateKey();
  const history = { ...(state.activityHistory || {}) };
  const current = history[dateKey] || { count: 0, xp: 0 };
  
  history[dateKey] = {
    count: current.count + 1,
    xp: current.xp + xpGained
  };

  return {
    ...state,
    activityHistory: history
  };
};

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

export const saveUserState = (state) => {
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

export const exportUserDataJSON = () => {
  try {
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

export const importUserDataJSON = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed === 'object' && parsed !== null) {
      saveUserState({ ...initialProfileState, ...parsed });
      return true;
    }
    return false;
  } catch (e) {
    console.error('Failed to import user data:', e);
    return false;
  }
};

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
