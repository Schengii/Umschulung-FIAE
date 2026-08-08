export interface OfflineDatasheet {
  id?: number;
  name: string;      // Dateiname des PDFs (z. B. "Dell_E2222H_Manual.pdf")
  modelMatch: string; // Welches Gerätemodell gematcht werden soll (z. B. "Dell E2222H")
  fileData: string;  // Base64 Data URL des PDFs
}

const DB_NAME = "electrocheck_offline_db";
const STORE_NAME = "datasheets";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
  });
}

export async function saveDatasheet(datasheet: OfflineDatasheet): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(transaction.objectStoreNames[0]);
    const request = store.put(datasheet);

    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllDatasheets(): Promise<OfflineDatasheet[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteDatasheet(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function findMatchingDatasheet(modelName: string): Promise<OfflineDatasheet | null> {
  if (!modelName) return null;
  const datasheets = await getAllDatasheets();
  const search = modelName.toLowerCase().trim();

  for (const sheet of datasheets) {
    const matchVal = sheet.modelMatch.toLowerCase().trim();
    if (search.includes(matchVal) || matchVal.includes(search)) {
      return sheet;
    }
  }
  return null;
}
