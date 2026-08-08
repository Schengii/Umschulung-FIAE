const DB_NAME = 'UrlaubsfotosDB';
const DB_VERSION = 2;
const STORE_NAME = 'photos';
const ALBUMS_STORE = 'albums';

export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(ALBUMS_STORE)) {
        db.createObjectStore(ALBUMS_STORE, { keyPath: 'id' });
      }
    };
  });
}

export async function savePhoto(photo, profileId = 'default') {
  const db = await initDB();
  const photoWithProfile = { ...photo, profileId: photo.profileId || profileId };
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(photoWithProfile);

    request.onsuccess = () => resolve(photoWithProfile.id);
    request.onerror = (event) => reject(event.target.error);
  });
}

export async function getAllPhotos(profileId = 'default') {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const all = request.result || [];
      const filtered = all.filter(p => (p.profileId || 'default') === profileId);
      resolve(filtered);
    };
    request.onerror = (event) => reject(event.target.error);
  });
}

export async function deletePhoto(id) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
}

export async function clearAllPhotos() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME, ALBUMS_STORE], 'readwrite');
    const storePhotos = transaction.objectStore(STORE_NAME);
    const storeAlbums = transaction.objectStore(ALBUMS_STORE);
    
    storePhotos.clear();
    storeAlbums.clear();

    transaction.oncomplete = () => resolve();
    transaction.onerror = (event) => reject(event.target.error);
  });
}

// Album Helpers
export async function getAllAlbums(profileId = 'default') {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ALBUMS_STORE], 'readonly');
    const store = transaction.objectStore(ALBUMS_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const all = request.result || [];
      const filtered = all.filter(a => (a.profileId || 'default') === profileId);
      resolve(filtered);
    };
    request.onerror = (event) => reject(event.target.error);
  });
}

export async function saveAlbum(album, profileId = 'default') {
  const db = await initDB();
  const albumWithProfile = { ...album, profileId: album.profileId || profileId };
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ALBUMS_STORE], 'readwrite');
    const store = transaction.objectStore(ALBUMS_STORE);
    const request = store.put(albumWithProfile);

    request.onsuccess = () => resolve(albumWithProfile.id);
    request.onerror = (event) => reject(event.target.error);
  });
}

export async function deleteAlbum(id) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ALBUMS_STORE], 'readwrite');
    const store = transaction.objectStore(ALBUMS_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
}

