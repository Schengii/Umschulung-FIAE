const DB_NAME = 'jobmatch_db';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'fileId' });
            }
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

export const db = {
    async saveFile(fileId, jobId, filename, fileBlob) {
        const database = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put({ fileId, jobId, filename, fileBlob });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async getFile(fileId) {
        const database = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(fileId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async deleteFile(fileId) {
        const database = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(fileId);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
};
