export interface OfflineDatasheet {
  id?: number;
  name: string;
  modelMatch: string;
  fileData: string;
}

/** Offline gespeichertes Ticket (beliebige Diagnose-Daten plus von IndexedDB vergebene ID). */
export type OfflineTicket = { id: number } & Record<string, unknown>;

const DB_NAME = "electrocheck_offline_db";
const STORE_NAME = "datasheets";
const TICKETS_STORE = "tickets_queue";
const ANALYSIS_QUEUE_STORE = "analysis_queue";
const DB_VERSION = 3;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB nicht verfügbar.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(TICKETS_STORE)) {
        db.createObjectStore(TICKETS_STORE, { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(ANALYSIS_QUEUE_STORE)) {
        db.createObjectStore(ANALYSIS_QUEUE_STORE, { keyPath: "id", autoIncrement: true });
      }
    };
  });
}

export async function saveDatasheet(datasheet: OfflineDatasheet): Promise<number> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(datasheet);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('IndexedDB saveDatasheet fehlgeschlagen:', e);
    throw e;
  }
}

export async function getAllDatasheets(): Promise<OfflineDatasheet[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('IndexedDB getAllDatasheets fehlgeschlagen:', e);
    return [];
  }
}

export async function deleteDatasheet(id: number): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('IndexedDB deleteDatasheet fehlgeschlagen:', e);
    throw e;
  }
}

export async function findMatchingDatasheet(modelName: string): Promise<OfflineDatasheet | null> {
  if (!modelName) return null;
  try {
    const datasheets = await getAllDatasheets();
    const search = modelName.toLowerCase().trim();
    for (const sheet of datasheets) {
      const matchVal = sheet.modelMatch.toLowerCase().trim();
      if (search.includes(matchVal) || matchVal.includes(search)) {
        return sheet;
      }
    }
  } catch (e) {
    console.warn('IndexedDB findMatchingDatasheet fehlgeschlagen:', e);
  }
  return null;
}

export async function saveOfflineTicket(ticketData: object): Promise<number> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(TICKETS_STORE, "readwrite");
      const store = transaction.objectStore(TICKETS_STORE);
      const request = store.add(ticketData);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('IndexedDB saveOfflineTicket fehlgeschlagen:', e);
    throw e;
  }
}

export async function getOfflineTickets(): Promise<OfflineTicket[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(TICKETS_STORE, "readonly");
      const store = transaction.objectStore(TICKETS_STORE);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('IndexedDB getOfflineTickets fehlgeschlagen:', e);
    return [];
  }
}

export async function deleteOfflineTicket(id: number): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(TICKETS_STORE, "readwrite");
      const store = transaction.objectStore(TICKETS_STORE);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('IndexedDB deleteOfflineTicket fehlgeschlagen:', e);
  }
}

/** Offline angestoßene KI-Analyse (Bild als Data-URL + Beschreibung), die später nachgeholt wird. */
export interface QueuedAnalysisRecord {
  id?: number;
  image: string | null;
  description: string;
  timestamp: number;
}

function runOnStore<T>(storeName: string, mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const request = operation(db.transaction(storeName, mode).objectStore(storeName));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}

export async function saveQueuedAnalysis(item: Omit<QueuedAnalysisRecord, "id">): Promise<number> {
  return (await runOnStore(ANALYSIS_QUEUE_STORE, "readwrite", (store) => store.add(item))) as number;
}

export async function getQueuedAnalyses(): Promise<QueuedAnalysisRecord[]> {
  return (await runOnStore(ANALYSIS_QUEUE_STORE, "readonly", (store) => store.getAll())) || [];
}

export async function deleteQueuedAnalysis(id: number): Promise<void> {
  await runOnStore(ANALYSIS_QUEUE_STORE, "readwrite", (store) => store.delete(id));
}
