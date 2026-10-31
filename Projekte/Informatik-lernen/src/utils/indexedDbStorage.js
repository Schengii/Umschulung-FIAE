/**
 * Offline IndexedDB Storage Synchronizer & Persistence Layer
 * Skalierbare, asynchrone NoSQL-Speicherung für Notizen, Karteikarten & Challenges
 * mit sicherem In-Memory/LocalStorage-Fallback für Test- und Restricted-Umgebungen.
 */

const DB_NAME = 'it_devgame_db';
const DB_VERSION = 1;
export const STORES = ['notes', 'flashcards', 'custom_challenges', 'keyvalue'];

// Fallback Memory Store falls IndexedDB nicht verfügbar ist (z. B. Node.js Testumgebung)
const memoryFallback = new Map();
STORES.forEach(store => memoryFallback.set(store, new Map()));

export function isIndexedDbAvailable() {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

/**
 * Öffnet die IndexedDB Verbindung oder liefert Fallback
 */
export function openDatabase() {
  return new Promise((resolve) => {
    if (!isIndexedDbAvailable()) {
      resolve({ isFallback: true });
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      STORES.forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          const keyPath = storeName === 'keyvalue' ? 'key' : 'id';
          db.createObjectStore(storeName, { keyPath });
        }
      });
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      // Bei Permission-Denied auf Fallback ausweichen
      resolve({ isFallback: true, error: event.target.error });
    };
  });
}

/**
 * Speichert ein Objekt im angegebenen Store
 */
export async function saveItem(storeName, item) {
  const db = await openDatabase();

  if (db.isFallback) {
    const storeMap = memoryFallback.get(storeName);
    const key = storeName === 'keyvalue' ? item.key : item.id;
    if (storeMap) storeMap.set(key, item);
    return;
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.put(item);

    req.onsuccess = () => resolve(true);
    req.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Liest ein Objekt anhand seines Primärschlüssels
 */
export async function getItem(storeName, key) {
  const db = await openDatabase();

  if (db.isFallback) {
    const storeMap = memoryFallback.get(storeName);
    return storeMap ? storeMap.get(key) || null : null;
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.get(key);

    req.onsuccess = () => resolve(req.result || null);
    req.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Liest alle Objekte eines Stores
 */
export async function getAllItems(storeName) {
  const db = await openDatabase();

  if (db.isFallback) {
    const storeMap = memoryFallback.get(storeName);
    return storeMap ? Array.from(storeMap.values()) : [];
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Löscht einen Eintrag anhand seines Schlüssels
 */
export async function deleteItem(storeName, key) {
  const db = await openDatabase();

  if (db.isFallback) {
    const storeMap = memoryFallback.get(storeName);
    if (storeMap) storeMap.delete(key);
    return;
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.delete(key);

    req.onsuccess = () => resolve(true);
    req.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Leert einen Store vollständig
 */
export async function clearStore(storeName) {
  const db = await openDatabase();

  if (db.isFallback) {
    const storeMap = memoryFallback.get(storeName);
    if (storeMap) storeMap.clear();
    return;
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.clear();

    req.onsuccess = () => resolve(true);
    req.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Exportiert die Daten aller Stores in ein einziges JSON-Objekt
 */
export async function exportAllStores() {
  const exportData = {
    version: DB_VERSION,
    timestamp: new Date().toISOString(),
    stores: {}
  };

  for (const storeName of STORES) {
    exportData.stores[storeName] = await getAllItems(storeName);
  }

  return exportData;
}
