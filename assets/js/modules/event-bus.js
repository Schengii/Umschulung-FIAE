/**
 * @file event-bus.js
 * @description Zentraler, leichtgewichtiger nativer Event-Bus für reaktives State-Management
 * Ermöglicht lose gekoppelte Kommunikation zwischen Komponenten (z.B. Theme-Wechsel, Sprachwechsel, A11y)
 */

export const FIAE_EVENTS = {
  THEME_CHANGE: 'fiae:theme-change',
  LANG_CHANGE: 'fiae:lang-change',
  ACCENT_CHANGE: 'fiae:accent-change',
  A11Y_CHANGE: 'fiae:a11y-change',
  PROJECT_SELECT: 'fiae:project-select',
  ACHIEVEMENT_UNLOCKED: 'fiae:achievement-unlocked'
};

/**
 * Sendet ein CustomEvent über das window-Objekt
 * @param {string} eventName Name des Events aus FIAE_EVENTS
 * @param {any} [detail] Optionale Nutzdaten
 */
export function emitEvent(eventName, detail = {}) {
  const event = new CustomEvent(eventName, {
    detail,
    bubbles: true,
    cancelable: true
  });
  window.dispatchEvent(event);
}

/**
 * Registriert einen Listener für ein Event
 * @param {string} eventName Name des Events
 * @param {(e: CustomEvent) => void} callback Auszuführende Funktion
 * @returns {() => void} Unsubscribe-Funktion
 */
export function onEvent(eventName, callback) {
  const handler = (e) => callback(e);
  window.addEventListener(eventName, handler);
  return () => window.removeEventListener(eventName, handler);
}

/**
 * Registriert einen Listener, der nur einmalig ausgelöst wird
 * @param {string} eventName 
 * @param {(e: CustomEvent) => void} callback 
 */
export function onceEvent(eventName, callback) {
  const handler = (e) => {
    window.removeEventListener(eventName, handler);
    callback(e);
  };
  window.addEventListener(eventName, handler);
}
