// @ts-check
// Lab-Fortschritt und Lernpfad-Empfehlung. Reine Logik ohne Seiteneffekte
// (Datum wird als Parameter übergeben).

/**
 * @typedef {Object} LabProgressEntry
 * @property {number} visits         Wie oft das Lab geöffnet wurde
 * @property {string} lastVisit      Letzter Besuch (YYYY-MM-DD, lokale Zeit)
 * @property {boolean} completed     XP-Belohnung des Labs wurde erreicht
 * @property {string} [completedOn]  Datum des Abschlusses (YYYY-MM-DD)
 */

/** @typedef {Record<string, LabProgressEntry>} LabProgress */

/**
 * @typedef {Object} LabModuleLike
 * @property {string} id
 * @property {string} category
 * @property {string[]} tags
 * @property {string} difficulty
 * @property {string} [badge]
 */

export const DIFFICULTY_ORDER = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

/**
 * Registriert einen Besuch des Labs.
 * @param {LabProgress | undefined | null} progress
 * @param {string} labKey
 * @param {string} todayKey
 * @returns {LabProgress}
 */
export function recordVisit(progress, labKey, todayKey) {
  const prev = progress?.[labKey];
  return {
    ...(progress || {}),
    [labKey]: {
      visits: (prev?.visits || 0) + 1,
      lastVisit: todayKey,
      completed: prev?.completed || false,
      ...(prev?.completedOn ? { completedOn: prev.completedOn } : {})
    }
  };
}

/**
 * Markiert das Lab als abgeschlossen (idempotent: das erste Abschlussdatum bleibt).
 * @param {LabProgress | undefined | null} progress
 * @param {string} labKey
 * @param {string} todayKey
 * @returns {LabProgress}
 */
export function recordCompletion(progress, labKey, todayKey) {
  const prev = progress?.[labKey];
  if (prev?.completed) return progress || {};
  return {
    ...(progress || {}),
    [labKey]: {
      visits: prev?.visits || 1,
      lastVisit: todayKey,
      completed: true,
      completedOn: todayKey
    }
  };
}

/**
 * Berufsfilter für Labs (Single Source für Dashboard-Filter und Empfehlungen).
 * @param {LabModuleLike} lab
 * @param {string} careerId 'all' | 'ap1' | 'fiae' | 'fisi' | 'itse' | 'wiso'
 * @returns {boolean}
 */
export function matchesCareer(lab, careerId) {
  const tags = lab.tags || [];
  const anyTag = (/** @type {RegExp} */ re) => tags.some((t) => re.test(t));
  switch (careerId) {
    case 'ap1':
      return anyTag(/ap1|ihk|netzwerk|sql|wiso|hardware/i) || Boolean(lab.badge?.includes('IHK'));
    case 'fiae':
      return ['fiae', 'algorithms', 'databases'].includes(lab.category) || anyTag(/fiae|code|sql|uml/i);
    case 'fisi':
      return ['network', 'devops', 'cloud'].includes(lab.category) || anyTag(/fisi|cisco|routing|vlan|dhcp|linux|usv/i);
    case 'itse':
      return lab.category === 'hardware' || anyTag(/itse|usv|dguv|elektro|strom/i);
    case 'wiso':
      return lab.category === 'wiso' || anyTag(/wiso|kalkulation|bbig|vertrag|skonto/i);
    default:
      return true;
  }
}

/**
 * @param {LabModuleLike[]} modules
 * @param {LabProgress | undefined | null} progress
 * @param {(moduleId: string) => string} [resolveKey] Modul-ID → Schlüssel im Fortschritt
 * @returns {{ done: number, total: number, percent: number }}
 */
export function summarizeLabProgress(modules, progress, resolveKey = (id) => id) {
  const total = modules.length;
  const done = modules.filter((m) => progress?.[resolveKey(m.id)]?.completed).length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

/**
 * Empfiehlt die nächsten, noch nicht abgeschlossenen Labs: einfachere zuerst,
 * innerhalb eines Schwierigkeitsgrades bereits begonnene Labs vor unberührten,
 * danach in der Reihenfolge der Liste.
 * @param {LabModuleLike[]} modules
 * @param {Object} options
 * @param {string} [options.careerId]
 * @param {LabProgress | undefined | null} [options.progress]
 * @param {(moduleId: string) => string} [options.resolveKey]
 * @param {number} [options.limit]
 * @returns {LabModuleLike[]}
 */
export function recommendNextLabs(modules, { careerId = 'all', progress, resolveKey = (id) => id, limit = 3 } = {}) {
  const rank = (/** @type {string} */ d) => {
    const i = DIFFICULTY_ORDER.indexOf(d);
    return i === -1 ? DIFFICULTY_ORDER.length : i;
  };
  return modules
    .map((lab, index) => ({ lab, index, entry: progress?.[resolveKey(lab.id)] }))
    .filter(({ lab, entry }) => !entry?.completed && matchesCareer(lab, careerId))
    .sort((a, b) =>
      rank(a.lab.difficulty) - rank(b.lab.difficulty) ||
      Number(Boolean(b.entry)) - Number(Boolean(a.entry)) ||
      a.index - b.index
    )
    .slice(0, Math.max(0, limit))
    .map(({ lab }) => lab);
}
