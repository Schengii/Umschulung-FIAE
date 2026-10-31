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
 * @property {string} [examTargetDate] Ziel-Prüfungstermin (YYYY-MM-DD)
 * @property {string} [examTargetType] Prüfungstyp ('ap1' | 'ap2' | 'wiso')
 * @property {Record<string, unknown>} [mistakeJournal]
 * @property {Record<string, import('./labProgressEngine').LabProgressEntry>} [labProgress] Lab-Besuche/-Abschlüsse je Registry-Tab
 * @property {Record<string, boolean>} [studyPlanWeeks] Abgehakte Wochen im IHK-Lernplaner ({ [weekNum]: boolean })
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
  examTargetDate: '',
  examTargetType: 'ap2',
  studyPlanWeeks: {}, // { [weekNum]: boolean }
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
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const channel = new BroadcastChannel('it_devgame_sync');
      channel.postMessage({ type: 'SYNC_STATE', state });
      channel.close();
    } catch {
      // Ignoriere Fehler in eingeschränkten Umgebungen
    }
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
  examTargetDate: (v) => typeof v === 'string',
  examTargetType: (v) => typeof v === 'string',
  xp: (v) => isFiniteNumber(v) && /** @type {number} */ (v) >= 0,
  level: (v) => isFiniteNumber(v) && /** @type {number} */ (v) >= 1,
  streak: (v) => isFiniteNumber(v) && /** @type {number} */ (v) >= 0,
  streakFreezes: (v) => isFiniteNumber(v) && /** @type {number} */ (v) >= 0,
  completedTopics: isStringArray,
  completedGames: isStringArray,
  completedCloze: isStringArray,
  completedProjects: isStringArray,
  unlockedBadges: isStringArray,
  studyPlanWeeks: isPlainObject,
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
  { id: "first_steps", title: "Erste Schritte", desc: "Wähle dein Profil und schließe dein erstes Modul ab.", icon: "🚀" },
  { id: "sql_master", title: "SQL Commander", desc: "Meistere das SQL Dungeon und führe komplexe Queries aus.", icon: "⚡" },
  { id: "security_expert", title: "Cyber Defender", desc: "Behebe alle Sicherheitslücken im Security Lab.", icon: "🛡️" },
  { id: "cloze_wizard", title: "Lückentext-Meister", desc: "Absolviere 5 Lückentexte fehlerfrei.", icon: "📜" },
  { id: "web_builder", title: "Fullstack Explorer", desc: "Erstelle dein erstes Web-Projekt in der Live Sandbox.", icon: "🌐" },
  { id: "logic_genius", title: "Gatter-Genie", desc: "Löse alle Logikschaltungen im Logic Game.", icon: "💡" },
  { id: "regex_master", title: "RegEx Meister", desc: "Löse RegEx-Suchmuster Aufgaben.", icon: "🔍" },
  { id: "exam_passed", title: "IHK Prüfung Zertifiziert", desc: "Bestehe die IHK Prüfungssimulation mit über 60%.", icon: "🎓" },
  { id: "wiso_master", title: "WISO Kalkulator", desc: "Schließe eine Handelskalkulation oder einen Netzplan fehlerfrei ab.", icon: "📊" },
  { id: "ieee_architect", title: "Hardware Architect", desc: "Analysiere IEEE-754 Floats und KV-Diagramme.", icon: "🔬" },
  { id: "ipv6_expert", title: "IPv6 & Routing Pioneer", desc: "Generiere EUI-64 Adressen und meistere LPM-Routing.", icon: "🌐" },
  { id: "owasp_guardian", title: "OWASP Guardian", desc: "Identifiziere und neutralisiere Top-10 Schwachstellen.", icon: "🔒" },
  { id: "ai_pioneer", title: "Neural AI Pioneer", desc: "Erkunde neuronale Schichten und BPE Tokenizer.", icon: "🧠" },
  { id: "stp_rstp_master", title: "IEEE 802.1D / 802.1w Spanning Tree Protocol Meister", desc: "Root-Bridge-Wahl (Priority + MAC), Pfadkosten (10G/1G/100M), Port-Rollen (Root, Designated, Alt...", icon: "🌐" },
  { id: "bpmn_process_master", title: "OMG BPMN 2.0 Geschäftsprozessmodellierung & Swimlanes Meister", desc: "Standardkonforme Geschäftsprozesse: Startereignisse, Endereignisse, Tasks, Gateways (XOR/AND/OR...", icon: "🏆" },
  { id: "backup_disaster_recovery_master", title: "IHK Backup-Strategien & Disaster Recovery Meister", desc: "Voll- vs. Diff- vs. Inkrementelle Sicherung, Großvater-Vater-Sohn 20-Medien-Rotationsrechner, R...", icon: "🏆" },
  { id: "wiso_sachmaengel_master", title: "IHK WISO Sachmängelhaftung & Gewährleistung Meister", desc: "Mangelarten nach BGB § 434 (Beschaffenheit, Montage, Aliud, Mindermenge), vorrangige Nacherfüll...", icon: "📊" },
  { id: "struktogramm_master", title: "DIN 66261 Nassi-Shneiderman Struktogramm & Schreibtischtest Meister", desc: "Interaktiver DIN 66261 Visualisierer: Sequenz, Verzweigung (IF/CASE), kopf- & fußgesteuerte Sch...", icon: "🏆" },
  { id: "database_normalization_master", title: "IHK Relationales Datenbank-Normalisierungs- Meister", desc: "Schrittweise Überführung unnormalisierter Relationen bis zur 3. NF: Atomarisierung, Beseitigung...", icon: "🗄️" },
  { id: "nat_pat_master", title: "RFC 3022 / RFC 2663 NAT, PAT & Port-Forwarding Meister", desc: "Header-Transformation im Router: Inside Local zu Inside Global, dynamische PAT-Portvergabe, Liv...", icon: "🏆" },
  { id: "vlan_trunking_master", title: "IEEE 802.1Q VLAN, Trunking & Router-on-a-Stick Meister", desc: "4-Byte 802.1Q Tag-Bitfeldrechner (TPID 0x8100, PCP QoS, DEI, 12-Bit VID), Access- vs. Trunk-Por...", icon: "🌐" },
  { id: "usv_calculator_master", title: "IHK USV-Dimensionierung & Stromversorgungs- Meister", desc: "Berechnung von Wirk- & Scheinleistung (W / VA) mit cos φ, Autonomiezeit-Kalkulation im Akkubetr...", icon: "⚡" },
  { id: "dhcp_dora_master", title: "RFC 2131 DHCP DORA & Relay-Agent Meister", desc: "4-Way DORA Handshake (Discover -> Offer -> Request -> Ack), Lease-Time Lifecycle (T1 50% Renewa...", icon: "🏆" },
  { id: "testverfahren_master", title: "IHK Software-Testverfahren & Grenzwertanalyse Meister", desc: "Black-Box Äquivalenzklassenbildung (GÄK & UÄK), 6-Punkte Grenzwertanalyse (min-1, min, max+1) u...", icon: "🏆" },
  { id: "wiso_angebotsvergleich_master", title: "IHK WISO Angebotsvergleich & Skontorechner Meister", desc: "Kaufmännischer Angebotsvergleich (LEP -> Rabatt -> ZEP -> Skonto -> BEP -> Bezugskosten -> Bezu...", icon: "📊" },
  { id: "tcp_state_machine_master", title: "TCP Connection State Machine & 3-Way Handshake Meister", desc: "Interaktiver RFC 793 Zustandsautomat: 3-Way Handshake (SYN -> SYN-ACK -> ACK), Datenfluss mit P...", icon: "🏆" },
  { id: "wiso_payment_master", title: "IHK Übertragungszeit- & Bandbreiten- Meister", desc: "Dateigröße, Bandbreite und Übertragungsdauer berechnen (Bit/Byte, Protokoll-Overhead)....", icon: "📊" },
  { id: "oral_exam_master", title: "WISO & Handelskalkulations- Meister", desc: "Vorwärtskalkulation, Deckungsbeiträge, Kritischer Pfad (CPM) & Arbeitsrecht....", icon: "🏆" },
  { id: "sql_join_master", title: "SQL JOINs & Venn-Diagramm Builder Meister", desc: "Visuelle In-Memory Simulation von INNER, LEFT, RIGHT & FULL JOINs....", icon: "🗄️" },
  { id: "git_graph_master", title: "Git Branching & Rebase Graph Meister", desc: "Visueller interaktiver Commit-Graph mit Branch-Pointern, Merges & interaktivem Terminal....", icon: "🔄" },
  { id: "cpu_master", title: "Von-Neumann CPU & Register- Meister", desc: "Taktzyklen (Fetch, Decode, Execute), Register (PC, AC, IR, MAR) & RAM-Matrix live simulieren....", icon: "⚡" },
  { id: "sql_optimizer_master", title: "SQL Query Optimizer & EXPLAIN ANALYZE Meister", desc: "Vergleiche Full Table Scans vs. B-Tree Index Scans und reduziere Abfrage-Kosten....", icon: "🗄️" },
  { id: "trees_graphs_master", title: "Data Structures Tree & Graph Meister", desc: "Binäre Suchbäume (Inorder, Preorder, Postorder) und Dijkstra-Wegfinder visualisieren....", icon: "🏆" },
  { id: "cicd_workflow_master", title: "CI/CD Workflow Pipeline Builder Meister", desc: "Visueller Stufen- & Job-Builder für automatische Builds, Unit Tests & Kubernetes Deployment....", icon: "🔄" },
  { id: "subnetting_master", title: "Einsteiger Kurs ohne Vorwissen Meister", desc: "EVA-Prinzip, CPU, Binärlogik & Web...", icon: "🏆" },
  { id: "git_master", title: "Git- Meister", desc: "Git-Workflows üben: Commits, Branches, Merge und Rebase....", icon: "🔄" },
  { id: "algo_master", title: "Algorithmen Step-Visualisierer Meister", desc: "Sortier- & Suchalgorithmen Schritt für Schritt...", icon: "🏆" },
  { id: "python_wasm_master", title: "Python WebAssembly Meister", desc: "Führe echten Python-Code ohne Server direkt im Browser über WebAssembly aus....", icon: "🏆" },
  { id: "packet_tracer_master", title: "Network Packet Tracer Meister", desc: "Route Visualizer & Ping-Simulation...", icon: "🏆" },
  { id: "leitner_master", title: "Leitner Karteikarten-System Meister", desc: "Spaced Repetition mit 5 Lernboxen...", icon: "🏆" },
  { id: "monaco_master", title: "Monaco Code Meister", desc: "VS-Code-Editor direkt im Browser...", icon: "🏆" },
  { id: "cloud_designer_master", title: "Cloud Infrastructure Designer Meister", desc: "Architektur-Canvas & Terraform-Code-Export...", icon: "☁️" },
  { id: "api_mock_master", title: "API Mock Meister", desc: "REST-Endpunkte mocken und Anfragen testen....", icon: "🏆" },
  { id: "ctf_master", title: "Cybersecurity CTF Quest Meister", desc: "XSS, SQL-Injection & Command Injection...", icon: "🏆" },
  { id: "cicd_master", title: "CI/CD Pipeline Builder Meister", desc: "GitHub-Actions-Stages & YAML-Export...", icon: "🔄" },
  { id: "docker_compose_master", title: "Docker Compose Meister", desc: "Multi-Container-Anwendungen mit Docker Compose beschreiben und starten....", icon: "☁️" },
  { id: "system_design_master", title: "System Design & Load Balancer Meister", desc: "Skalierung, Caching & Balancing-Strategien...", icon: "🏆" },
  { id: "websocket_protocol_master", title: "WebSockets & Real-Time Protokoll Meister", desc: "Handshake, Frames & Ping/Pong...", icon: "🏆" },
  { id: "vector_search_master", title: "Vektorsuche Meister", desc: "Ähnlichkeitssuche über Embeddings, die Grundlage von RAG-Pipelines....", icon: "🏆" },
  { id: "bigo_benchmark_master", title: "Big-O Algorithm Benchmark Meister", desc: "Vergleiche O(1), O(log n), O(n), O(n²) und O(2^n) mit dynamischen Diagrammen....", icon: "🏆" },
  { id: "wasm_rust_master", title: "WebAssembly & Rust Compiler Meister", desc: "Rust zu Wasm kompilieren & ausführen...", icon: "🏆" },
  { id: "linux_memory_master", title: "OAuth2 JWKS & Key Rotation Meister", desc: "Asymmetrische Token-Signierung & Zero-Downtime Key Rotation....", icon: "⚡" },
  { id: "postgres_pool_master", title: "PostgreSQL Connection Pooling & SQL Isolation Meister", desc: "PostgreSQL Connection Pooling & SQL Isolation Studio (PgBouncer)...", icon: "🗄️" },
  { id: "wiso_dunning_master", title: "IHK Skonto-Effektivzins & Mahnwesen Meister", desc: "Skonto-Effektivzins und Mahnwesen nach BGB § 288....", icon: "📊" },
  { id: "service_mesh_master", title: "Service Mesh mTLS & Envoy Sidecar Meister", desc: "Service Mesh mTLS & Envoy Sidecar Studio (SPIFFE & Canary)...", icon: "🏆" },
  { id: "linux_container_master", title: "Linux Namespaces & Cgroups v2 Meister", desc: "PID/NET Isolation, cpu.max & OOM-Kill...", icon: "🏆" },
  { id: "wiso_contribution_margin_master", title: "IHK Deckungsbeitrag & BEP Meister", desc: "Stück-DB, Break-Even & mehrstufige Fixkosten...", icon: "📊" },
  { id: "oauth_token_exchange_master", title: "OAuth 2.0 Token Exchange Meister", desc: "RFC 8693 Delegation, Actor Claim & JWT...", icon: "🛡️" },
  { id: "ebpf_xdp_master", title: "Linux eBPF & XDP Packet Filter Meister", desc: "Kernel Verifier, XDP_DROP & JIT Engine...", icon: "🏆" },
  { id: "postgres_flamegraph_master", title: "PostgreSQL EXPLAIN FlameGraph Meister", desc: "Buffer Cache Hits, Seq Scan & Tree Latency...", icon: "🗄️" },
  { id: "wiso_abc_xyz_master", title: "IHK ABC- & XYZ-Materialanalyse Meister", desc: "Kumulativ-Werte & 3x3 Beschaffungsmatrix...", icon: "📊" },
  { id: "wireguard_ztna_master", title: "WireGuard VPN & Zero-Trust ZTNA Meister", desc: "1-RTT NoiseIK & Cryptokey Routing...", icon: "🛡️" },
  { id: "promql_alert_master", title: "Prometheus PromQL & Alerting Meister", desc: "p95 Latency, Error-Rate & Rule YAMLs...", icon: "🏆" },
  { id: "event_sourcing_master", title: "Event-Sourcing & CQRS Meister", desc: "Append-Only Event Log & Read-Model...", icon: "🏆" },
  { id: "wiso_loan_collateral_master", title: "IHK Darlehensarten & Kredite Meister", desc: "Annuität vs. Rate & Realsicherheiten...", icon: "📊" },
  { id: "webrtc_sfu_master", title: "WebRTC Media Server Meister", desc: "Simulcast Routing vs. P2P-Mesh...", icon: "🏆" },
  { id: "bpftrace_master", title: "Linux BPFtrace Dynamic Tracing Meister", desc: "Kernel Kprobes, Tracepoints & Syscalls...", icon: "🏆" },
  { id: "postgres_wal_master", title: "PostgreSQL WAL & Replication Lag Meister", desc: "LSN Offsets, Streaming & PITR...", icon: "🗄️" },
  { id: "wiso_andler_master", title: "IHK Optimale Bestellmenge Meister", desc: "Losgröße x_opt, Intervalle & Kostenkurve...", icon: "📊" },
  { id: "opentelemetry_tracing_master", title: "OpenTelemetry Distributed Tracing Meister", desc: "W3C traceparent & Waterfall Spans...", icon: "🏆" },
  { id: "linux_bridge_vxlan_master", title: "Linux Bridge & VXLAN Overlay Meister", desc: "veth-Paare, br0 FDB & UDP 4789 Tunnel...", icon: "🏆" },
  { id: "postgres_partitioning_master", title: "PostgreSQL Partitioning & Pruning Meister", desc: "Range, List & Hash Partitioning DDL...", icon: "🗄️" },
  { id: "wiso_interest_master", title: "IHK Zinsrechnung & Zinseszins Meister", desc: "Deutsche Methode 30/360 & Aufzinsung...", icon: "📊" },
  { id: "kafka_event_master", title: "Kafka Event-Streaming Meister", desc: "Partitionen, Schlüssel, Consumer Groups & Offsets...", icon: "📨" },
  { id: "kafka_rebalance_master", title: "Kafka Partition Rebalance Meister", desc: "Eager vs. Cooperative Sticky Rebalancing...", icon: "🏆" },
  { id: "bgp_anycast_master", title: "Linux BGP Routing & Anycast Meister", desc: "eBGP/iBGP Peering, AS-Path & Anycast IP...", icon: "🌐" },
  { id: "tls_handshake_master", title: "TLS 1.3 Handshake Meister", desc: "1-RTT Full Handshake & 0-RTT Session Resumption...", icon: "🛡️" },
  { id: "jwt_attack_defender", title: "JWT Sicherheitslücken Meister", desc: "alg:none Fälschung, Secret-Bruteforce & kid-Injection...", icon: "🏆" },
  { id: "cors_defender", title: "CORS Fehlkonfigurationen Meister", desc: "Origin-Reflection, Regex-Bypass & Wildcard-Konflikt...", icon: "🏆" },
  { id: "postgres_fulltext_master", title: "PostgreSQL Full-Text Search Meister", desc: "tsvector, tsquery & ts_rank Scoring...", icon: "🗄️" },
  { id: "wiso_capital_value_master", title: "IHK Kapitalwertmethode Meister", desc: "Dynamische Investitionsrechnung & Barwert...", icon: "📊" },
  { id: "grpc_protobuf_master", title: "gRPC Protocol Buffers Meister", desc: "Proto3 Schema, Wire Varints & HTTP/2...", icon: "🏆" },
  { id: "nwa_master", title: "IHK Nutzwertanalyse Meister", desc: "Offizielle Bewertungsmatrix mit Gewichtung, K.O.-Kriterien & IHK-Projektbericht Export....", icon: "🏆" },
  { id: "raid_master", title: "RAID Storage & Paritäts- Meister", desc: "Simuliere RAID 0, 1, 5, 6, 10 & 50. Berechne Kapazitäten, URE-Risiko & Rebuild-Zeiten....", icon: "🏆" },
  { id: "vlsm_master", title: "VLSM Subnet Splitter & IP-Planer Meister", desc: "Hierarchische IPv4-Subnetzaufteilung nach Host-Bedarf ohne Adressraum-Verschwendung....", icon: "🏆" },
  { id: "ihk_proposal_master", title: "IHK Projektantrags-Prüfer & Meilenstein-Planer Meister", desc: "Stundenprüfung (80h/40h), Phasenverteilung und IHK-Genehmigungs-Checkliste....", icon: "🏆" },
  { id: "cpm_master", title: "IHK Netzplan Meister", desc: "Vorwärts- & Rückwärtsrechnung, FAZ/FEZ/SAZ/SEZ, Pufferzeiten GP/FP & Kritischer Pfad....", icon: "🏆" },
  { id: "uml_master", title: "UML Meister", desc: "Interaktive Modellierung synchroner/asynchroner Nachrichtenflüsse & Mermaid.js Export....", icon: "🏆" },
  { id: "terraform_master", title: "Terraform & OpenTofu IaC Meister", desc: "Deklaratives State-Management, Execution Plans (Diff) & Directed Acyclic Resource Graph....", icon: "🏆" },
  { id: "oral_defense_master", title: "IHK Fachgespräch & Audio- Meister", desc: "15-minütiges Prüfungsgespräch mit Sprachausgabe, Persona-Prüfern und Antwort-Scoring....", icon: "🏆" },
  { id: "ansible_master", title: "Ansible Playbook & Idempotenz Meister", desc: "Server-Provisionierung mit apt, template & systemd. Beweise das Idempotenz-Prinzip....", icon: "🏆" },
  { id: "worker_master", title: "Web Worker & Concurrency Meister", desc: "Main Thread vs. Worker Thread CPU-Benchmarks ohne UI-Blockaden (60fps Garantie)....", icon: "🏆" },
  { id: "presentation_master", title: "IHK Präsentations-Stoppuhr & Gliederung Meister", desc: "15-Minuten Zeitüberwachung mit Phasengliederung, Akustik-Warnung & IHK-Rubriken....", icon: "🏆" },
  { id: "github_actions_master", title: "GitHub Actions CI/CD Workflow Meister", desc: "DAG Job-Stufen, Dependency Caching, Secrets-Maskierung und Live ANSI Runner-Logs....", icon: "🔄" },
  { id: "ihk_gantt_master", title: "IHK Projekt-Gantt & Meilenstein-Editor Meister", desc: "Interaktive Zeit- & Phasenplanung für den IHK-Abschlussbericht mit Soll/Ist-Prüfung & Export....", icon: "🏆" },
  { id: "wasm_simd_master", title: "WebAssembly SIMD & Vector Meister", desc: "128-Bit Vektor-Register (f32x4), Geschwindigkeits-Benchmark vs. JS Loop & WAT Bytecode....", icon: "🏆" },
  { id: "ihk_wirtschaftlichkeit_master", title: "IHK Wirtschaftlichkeit & Amortisation Meister", desc: "Kaufmännische Amortisationsrechnung (Pay-Off), Make-or-Buy Matrix und Kostenvergleich Alt vs. N...", icon: "🏆" },
  { id: "passkey_master", title: "FIDO2 WebAuthn & Passkey Meister", desc: "Passwortlose Anmeldung via Hardware-Tokens & Biometrie mit interaktivem Phishing-Schutz-Beweis....", icon: "🏆" },
  { id: "systemd_master", title: "Linux Systemd & Cgroups v2 Sandbox Meister", desc: "Service Lifecycle, Restart-Policies (on-failure) und Cgroups v2 Memory-Limits unter OOM-Stress....", icon: "🏆" },
  { id: "tls_replay_master", title: "TLS 1.3 0-RTT Replay Attack Meister", desc: "RFC 8446 Early Data Sicherheit, Replay-Angriffe auf Zahlungen und Single-Use Ticket Abwehr....", icon: "🛡️" },
  { id: "ihk_risk_master", title: "IHK Risikoanalyse & 5x5 Risikomatrix Meister", desc: "DIN EN 31010 & FMEA Risikomatrix (W × S = RPZ), Gegenmaßnahmen & IHK-Markdown-Export....", icon: "🏆" },
  { id: "cilium_master", title: "eBPF Cilium Service Mesh & L7 Tracing Meister", desc: "Sidecarless Cloud-Native Architektur: Linux Kernel Socket-Bypass (sockmap) vs. Envoy Sidecars....", icon: "🏆" },
  { id: "postgres_index_master", title: "PostgreSQL Index Types Deep Dive Meister", desc: "Vergleiche B-Tree, GIN, GiST und BRIN Indizes hinsichtlich Speicherbedarf & Abfrage-Speedup....", icon: "🗄️" },
  { id: "dnssec_master", title: "DNSSEC Chain of Trust & RRSIG Meister", desc: "Hierarchische Validierung vom Root-Anker über TLDs, NSEC3 Denial-of-Existence und Kaminsky-Abwe...", icon: "🏆" },
  { id: "ihk_burndown_master", title: "IHK Agile vs. Waterfall & Burndown Meister", desc: "Sprint-Burndown Chart (Ideal vs. Ist), Scope-Creep, WIP-Bottlenecks und IHK-Begründungsgenerato...", icon: "🏆" },
  { id: "linux_cow_master", title: "Linux Btrfs/ZFS Copy-on-Write Sandbox Meister", desc: "Block-Level Refcounts, atomare 0-Byte-Snapshots, Write-Deltas, Rollbacks und Bit-Rot Self-Heali...", icon: "🏆" },
  { id: "openapi_contract_master", title: "OpenAPI 3.1 & JSON-Schema Contract Testing Meister", desc: "Echtzeit-Payload-Validierung gegen JSON Schema 2020-12, Breaking Change Erkennung und DTO-Expor...", icon: "🏆" },
  { id: "etl_data_lineage_master", title: "ETL Pipeline & Data Lineage Meister", desc: "FIDP/FIAE Datenintegration, DWH & Schema-Drift Audit...", icon: "🏆" },
  { id: "ihk_dsgvo_tom_master", title: "IHK DSGVO TOM-Katalog Meister", desc: "Audit aller 8 gesetzlichen TOM-Kategorien nach Art. 32 DSGVO mit Score & IHK-Markdown-Export....", icon: "🏆" },
  { id: "wiso_labor_law_master", title: "IHK Arbeitsrecht & Kündigungsschutz Meister", desc: "Gesetzliche Kündigungsfristen nach BGB § 622, KSchG-Wartezeit & Sonderkündigungsschutz prüfen....", icon: "📊" },
  { id: "ihk_dpia_master", title: "IHK Datenschutz-Folgenabschätzung Meister", desc: "Schwellenwertanalyse (DSK-Blacklist), Risikomatrix für Betroffene & Markdown Doku-Export....", icon: "🏆" },
  { id: "bsi_grundschutz_master", title: "BSI IT-Grundschutz & NIS-2 Risiko- Meister", desc: "Schutzbedarfsfeststellung (BSI 200-2), Baustein-Audit (BSI 200-3) & NIS-2 Melde- und Risikoplan...", icon: "🏆" },
  { id: "ipv6_ndp_master", title: "IPv6 SLAAC, DHCPv6 & NDP Inspector Meister", desc: "RFC 4861 Neighbor Discovery Protocol, invertiertes EUI-64 u/l Bit & RFC 8981 Privacy Extensions...", icon: "🏆" },
  { id: "wiso_payroll_master", title: "WISO Brutto-Netto & Lohnabrechnungs- Meister", desc: "Lohnsteuerklassen I-VI, Sozialabgaben (KV, PV mit Kinderlosenzuschlag, RV, AV) & AG-Gesamtbelas...", icon: "📊" },
  { id: "certificate_pdf_master", title: "IHK Lernpass & Zertifikats-Generator Meister", desc: "Offizieller PDF-Ausbildungsnachweis für das Berichtsheft mit allen absolvierten IHK-Kompetenzen...", icon: "🏆" },
  { id: "clean_arch_master", title: "Clean Architecture & Hexagonal Ports/Adapters Meister", desc: "Interaktiver Architektur-Linter nach Robert C. Martin: Dependency Rule, Domänen-Entkopplung & P...", icon: "🏆" },
  { id: "netns_master", title: "Linux Network Namespaces, veth & Bridge Meister", desc: "Container-Netzwerkgrundlagen: Virtual Ethernet Pairs, br0 Switching & iptables MASQUERADE....", icon: "🏆" },
  { id: "multi_contribution_master", title: "Mehrstufige Deckungsbeitragsrechnung & Break-Even Meister", desc: "DB I bis DB IV (Erzeugnis-, Gruppen-, Bereichs- & Unternehmensfix) und dynamischer Sicherheitsk...", icon: "🏆" },
  { id: "oauth_revocation_master", title: "OAuth 2.0 Token Revocation & Introspection Meister", desc: "RFC 7009 Token Revocation & RFC 7662 Introspection am API Gateway mit Kaskadierungslogik....", icon: "🛡️" },
  { id: "raid6_galois_master", title: "RAID 6 Dual-Parity & Galois Field GF Meister", desc: "Mathematische P (XOR) & Q (GF 2^8) Paritätsberechnung und simultane Rekonstruktion zweier Ausfä...", icon: "🏆" },
  { id: "sqlite_worker_master", title: "SQLite Web Worker Sandbox Meister", desc: "Asynchrone Auslagerung rechenintensiver SQL-Abfragen und Aggregationen in einen Hintergrund-Thr...", icon: "🗄️" },
  { id: "zuschlagskalkulation_master", title: "IHK Fertigungs- & Zuschlagskalkulation Meister", desc: "Staffelrechnung: MGKZ, FGKZ, Herstellkosten, VwGKZ/VtGKZ, Gewinn und Barverkaufspreis....", icon: "🏆" },
  { id: "seccomp_master", title: "Linux Capabilities & Seccomp BPF Sandbox Meister", desc: "Principle of Least Privilege: CAP_NET_BIND_SERVICE, CAP_SYS_ADMIN, Syscall-Filtering & SECCOMP_...", icon: "🏆" },
  { id: "bgp_selection_master", title: "BGP Path Selection & Decision Meister", desc: "RFC 4271 8-Stufen-Entscheidungsprozess: Weight, Local Preference, AS-Path-Länge, Origin, MED, e...", icon: "🌐" },
  { id: "maschinenstundensatz_master", title: "IHK Maschinenstundensatz- Meister", desc: "Kalkulatorische Abschreibung, Zinsen nach Durchschnittsmethode, Raum-, Energie- & Werkzeugkoste...", icon: "🏆" },
  { id: "rag_chunking_master", title: "LLM RAG Chunking & Cross-Encoder Re-Ranking Meister", desc: "Dokumenten-Chunking (Fixed, Sliding, Paragraph) und Two-Stage Retrieval mit Cross-Attention geg...", icon: "🏆" },
  { id: "linux_psi_master", title: "Linux Cgroups v2 & PSI Pressure Stall Meister", desc: "CPU, Memory & I/O Pressure Stalls (some vs. full), CFS-Throttling und OOM-Killer Vermeidung für...", icon: "🏆" },
  { id: "nwa_sensitivity_master", title: "IHK Nutzwertanalyse Meister", desc: "DIN/VDI 2225 Entscheidungsmatrix mit 500x Monte-Carlo Stresstest und K.O.-Kriterien Absicherung...", icon: "🏆" },
  { id: "webrtc_ice_master", title: "WebRTC STUN/TURN & ICE Candidate Gathering Meister", desc: "RFC 8445 Candidate Gathering (Host, Server Reflexive, Relay), NAT-Traversal & automatischer TUR...", icon: "🏆" },
  { id: "wiso_leverage_master", title: "WISO Rentabilitätskennzahlen & Leverage-Effekt Meister", desc: "Eigenkapital-, Gesamtkapital- und Umsatzrendite sowie Hebelwirkung von Fremdkapital (Leverage-E...", icon: "📊" },
  { id: "selinux_master", title: "Linux SELinux & AppArmor MAC Security Meister", desc: "Mandatory Access Control vs. DAC (chmod/chown), Type Enforcement (httpd_t -> shadow_t), AVC Den...", icon: "🏆" },
  { id: "dns_privacy_master", title: "DNS Privacy Inspector: DoH & DoT vs. Port 53 Meister", desc: "RFC 8484 DNS-over-HTTPS & RFC 7858 DNS-over-TLS Wire-Format-Analyse, ISP-Eavesdropping Abwehr u...", icon: "🏆" },
  { id: "wiso_liquiditaet_master", title: "IHK WISO Liquiditätsgrade & Working Capital Meister", desc: "Berechnung von Liquidität 1., 2. und 3. Grades (Cash, Quick, Current Ratio), Net Working Capita...", icon: "📊" },
  { id: "semantic_cache_master", title: "RAG Semantic Cache & Vector Similarity Meister", desc: "Vektor-Ähnlichkeits-Caching mit Cosine-Similarity Schwellenwert. Schnelle Index-Lookups (<10ms)...", icon: "🏆" },
  { id: "jwt_confusion_master", title: "JWT Algorithm Confusion & Security Meister", desc: "RFC 7519 / 7518: Asymmetrische RS256 vs. symmetrische HS256 Key-Confusion, None-Algorithmus Exp...", icon: "🏆" },
  { id: "sql_window_functions_master", title: "SQL Window Functions & Analytics Meister", desc: "Analytische SQL-Fensterfunktionen nach ANSI SQL:2003: ROW_NUMBER(), RANK(), DENSE_RANK(), NTILE...", icon: "🗄️" },
  { id: "argocd_gitops_master", title: "ArgoCD GitOps & Cluster Sync Meister", desc: "Deklaratives GitOps mit ArgoCD: Git als Single Source of Truth, Drift-Erkennung (Out-of-Sync), ...", icon: "🔄" },
  { id: "vector_math_master", title: "Vektor-Mathematik & Embedding-Distanz Meister", desc: "Mathematisches Fundament von Vektordatenbanken: Cosine-Similarity, Euklidische L2-Distanz, Manh...", icon: "🏆" },
  { id: "dijkstra_stp_master", title: "SQL Transaction Isolation & ACID Meister", desc: "ANSI SQL:1992 Isolationslevel (Read Committed, Repeatable Read, SSI): Interaktive Simulation vo...", icon: "🌐" },
  { id: "http_caching_master", title: "HTTP Caching Meister", desc: "Browser- und Reverse-Proxy Caching nach RFC 9111: max-age, no-cache vs. no-store, bedingte Anfr...", icon: "🏆" },
  { id: "exam_readiness_master", title: "Adaptiver IHK Prüfungspfad & Countdown-Planer Meister", desc: "Echtzeit-Prüfungsbereitschaftsanalyse mit Tagen bis zum nächsten IHK-Termin, gewichteter Notenp...", icon: "🏆" },
  { id: "srp_zero_knowledge_master", title: "SRP-6a Zero-Knowledge Authentication Meister", desc: "Kryptographische Authentifizierung ohne Passwortübertragung: Ephemere Schlüssel (a/b), Public K...", icon: "🏆" },
  { id: "wiso_contract_breach_master", title: "IHK WISO Kaufvertragsstörungen & Sachmängelhaftung Meister", desc: "Rechtliche Fallsimulation nach BGB §§ 433–441 & HGB § 377: Rügefristen (B2B vs. B2C), Vorrang d...", icon: "📊" },
  { id: "wiso_company_forms_master", title: "IHK WISO Rechtsformen & Haftungs-Entscheidungsmatrix Meister", desc: "Systematischer Vergleich von Einzelunternehmen, Personengesellschaften (GbR, OHG, KG) und Kapit...", icon: "📊" },
  { id: "mtls_ztna_master", title: "Mutual TLS Meister", desc: "Gegenseitige Zertifikatsprüfung auf Transportschicht, CRL-Zertifikatssperren und feingranulare ...", icon: "🛡️" },
  { id: "wiso_personal_planung_master", title: "IHK WISO Personalbedarfsplanung: Brutto & Netto Meister", desc: "Kaufmännische Personalbedarfsermittlung: Arbeitszeit- und Kennzahlenmethode, Reservebedarf bei ...", icon: "📊" },
  { id: "oauth21_dpop_master", title: "OAuth 2.1 & RFC 9449 DPoP Sender-Constrained Security Meister", desc: "Modernste Token-Sicherheit: Wegfall unsicherer Legacy-Flows (Implicit, Password), strikter PKCE...", icon: "🛡️" },
  { id: "ihk_proposal_pdf_master", title: "IHK Projektantrag PDF- & Dokumentations-Generator Meister", desc: "Offizieller Antrag auf Zulassung zur Projektarbeit (AP2 Teil A): Detaillierte Zeit- & Phasenpla...", icon: "🏆" },
  { id: "bgp_anycast_ddos_master", title: "BGP Anycast & DDoS Flow-Scrubber Meister", desc: "Weltweite Ingress-Verkehrsverteilung über Edge-PoPs (Frankfurt, Amsterdam, New York, Tokio), SY...", icon: "🌐" },
  { id: "cloud_iam_governance_master", title: "Cloud IAM Policy Evaluator & Least-Privilege Linter Meister", desc: "Auswertung von Organization SCPs, Identity- und Resource-Policies mit striktem Explicit Deny Vo...", icon: "☁️" },
  { id: "sre_slo_burn_master", title: "Prometheus PromQL Alerting & SRE Error-Budget Burn Meister", desc: "SLO-Verfügbarkeitsberechnung und Multi-Window Multi-Burn-Rate Alerting nach Google SRE Workbook...", icon: "🏆" },
  { id: "kafka_consumer_lag_master", title: "Kafka Consumer Lag & Partition Rebalance Protocol Meister", desc: "Echtzeit-Tracking von Consumer Lag, Partition-Assignor-Strategien und Gegenüberstellung von Eag...", icon: "🏆" },
  { id: "linux_auditd_ebpf_master", title: "Linux Auditd & eBPF Syscall Tracepoint Security Meister", desc: "Kernel-Level Threat Hunting: Erkennung von RCE-Reverse-Shells, Privilege Escalation und Passwor...", icon: "🏆" },
  { id: "k8s_gateway_api_master", title: "Kubernetes Gateway API & Envoy Traffic Splitting Meister", desc: "Moderne Service-Mesh- und Ingress-Architektur: Gewichtetes Canary-Traffic-Splitting, HTTP-Heade...", icon: "☁️" },
  { id: "wiso_break_even_master", title: "IHK WISO Deckungsbeitrag Stufe 2 & Break-Even-Point Solver Meister", desc: "Mehrstufige Deckungsbeitragsrechnung (DB I & DB II), Erzeugnis- und Unternehmensfixkosten, opti...", icon: "📊" },
  { id: "dnssec_rollover_master", title: "DNSSEC KSK & ZSK Key Rollover & Chain-of-Trust Meister", desc: "Simuliere ZSK Pre-Publish und KSK Double-DS Rollover Schritt für Schritt: TTL-Caches, Parent-Zo...", icon: "🏆" },
  { id: "wiso_bookkeeping_master", title: "IHK WISO Doppelte Buchführung Meister", desc: "Doppelte Buchführung: T-Konten, Buchungssätze (SKR03), GuV und Bilanz....", icon: "📊" },
  { id: "wiso_bab_master", title: "IHK WISO Betriebsabrechnungsbogen BAB Meister", desc: "Betriebsabrechnungsbogen: Kostenstellenrechnung, Zuschlagssätze und Kalkulation....", icon: "📊" },
  { id: "tdd_master", title: "Apache Kafka Event-Architektur Meister", desc: "Producers, Topics & Consumer Groups...", icon: "🏆" },
  { id: "quiz_master", title: "Systemarchitektur & Microservices Meister", desc: "Clean Architecture, Scalability & Caching...", icon: "🏆" },
  { id: "app_builder", title: "Programmiersprachen Academy Meister", desc: "Python, JavaScript, TypeScript, Java, C#...", icon: "🏆" },
  { id: "study_plan_master", title: "IHK Prüfungs-Countdown & Adaptiver Lernplaner Meister", desc: "Prüfungstermine für AP1/AP2, tagesgenauer Countdown und personalisierte wochenbasierte Sprints....", icon: "🏆" },
  { id: "weakness_audit_master", title: "IHK Schwachstellen-Audit & Adaptiver Assistent Meister", desc: "Fehlerquoten-Analyse nach IHK-Lernfeldern mit automatischer Generierung gezielter Wiederholungs...", icon: "🏆" }
];
