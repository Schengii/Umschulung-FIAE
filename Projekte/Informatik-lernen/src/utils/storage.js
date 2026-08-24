// Storage utility to manage user state, progress, XP, and badges

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
  savedCodeSnippets: {}
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
  { id: 'exam_passed', title: 'IHK Prüfung Zertifiziert', desc: 'Bestehe die IHK Prüfungssimulation mit über 60%.', icon: '🎓' }
];
