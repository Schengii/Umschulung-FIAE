// ============================================================
// Amazon 2.0 – IndexedDB High-Capacity Async Storage & Cache
// ============================================================
const DB_NAME = 'amz2_indexed_db';
const DB_VERSION = 1;

export const STORES = {
  chatLogs: 'chat_logs',
  sellerListings: 'seller_listings',
  cachedAssets: 'cached_assets',
  customData: 'custom_data',
} as const;

let dbPromise: Promise<IDBDatabase | null> | null = null;

function getIndexedDB(): IDBFactory | null {
  if (typeof window !== 'undefined' && 'indexedDB' in window) {
    return window.indexedDB;
  }
  return null;
}

export function openDatabase(): Promise<IDBDatabase | null> {
  const idb = getIndexedDB();
  if (!idb) return Promise.resolve(null);

  if (!dbPromise) {
    dbPromise = new Promise<IDBDatabase | null>((resolve) => {
      try {
        const req = idb.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = () => {
          const db = req.result;
          Object.values(STORES).forEach((store) => {
            if (!db.objectStoreNames.contains(store)) {
              db.createObjectStore(store);
            }
          });
        };

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
          console.warn('[IndexedDB] Database open error:', req.error);
          resolve(null);
        };
      } catch (err) {
        console.warn('[IndexedDB] Error initializing:', err);
        resolve(null);
      }
    });
  }

  return dbPromise;
}

const memoryStoreFallback = new Map<string, any>();

export async function idbSet<T>(storeName: string, key: string, value: T): Promise<void> {
  try {
    const db = await openDatabase();
    if (!db) {
      // In-memory or localStorage fallback
      memoryStoreFallback.set(`${storeName}_${key}`, value);
      try {
        if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
          localStorage.setItem(`idb_fallback_${storeName}_${key}`, JSON.stringify(value));
        }
      } catch { /* ignore */ }
      return;
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[IndexedDB] Set failed for ${storeName}/${key}:`, err);
  }
}

export async function idbGet<T>(storeName: string, key: string, fallback: T): Promise<T> {
  try {
    const db = await openDatabase();
    if (!db) {
      if (memoryStoreFallback.has(`${storeName}_${key}`)) {
        return memoryStoreFallback.get(`${storeName}_${key}`) as T;
      }
      try {
        if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
          const raw = localStorage.getItem(`idb_fallback_${storeName}_${key}`);
          return raw ? (JSON.parse(raw) as T) : fallback;
        }
      } catch { /* ignore */ }
      return fallback;
    }

    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => {
        resolve(req.result !== undefined ? (req.result as T) : fallback);
      };
      req.onerror = () => resolve(fallback);
    });
  } catch {
    return fallback;
  }
}

export async function idbGetAll<T>(storeName: string): Promise<T[]> {
  try {
    const db = await openDatabase();
    if (!db) return [];

    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as T[]);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function idbDelete(storeName: string, key: string): Promise<void> {
  try {
    memoryStoreFallback.delete(`${storeName}_${key}`);
    const db = await openDatabase();
    if (!db) {
      try {
        if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
          localStorage.removeItem(`idb_fallback_${storeName}_${key}`);
        }
      } catch { /* ignore */ }
      return;
    }

    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
}

export async function idbClear(storeName: string): Promise<void> {
  try {
    memoryStoreFallback.clear();
    const db = await openDatabase();
    if (!db) return;

    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
}
