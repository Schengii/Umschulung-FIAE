/**
 * IndexedDB Store Hydration & Redundant Persistence Layer
 * Synchronisiert den Zustand des IT-DevGames redundant in IndexedDB (keyvalue Store).
 * Ermöglicht automatische Wiederherstellung bei gelöschtem LocalStorage oder Überschreitung des 5MB Quotas.
 */

import { saveItem, getItem, getAllItems, deleteItem } from './indexedDbStorage';

export const IDB_STORE_BACKUP_KEY = 'user_state_backup';
export const IDB_SNAPSHOT_PREFIX = 'snapshot_';

/**
 * Asynchrone redundante Speicherung des Nutzerzustands in IndexedDB
 */
export async function syncUserStateToIndexedDb(state) {
  if (!state) return false;
  try {
    const payload = {
      key: IDB_STORE_BACKUP_KEY,
      updatedAt: new Date().toISOString(),
      state
    };
    await saveItem('keyvalue', payload);
    return true;
  } catch (err) {
    console.warn('[IndexedDB Store] Fehler beim redundanten Sichern:', err);
    return false;
  }
}

/**
 * Lädt den gesicherten Zustand aus der IndexedDB (z. B. zur Notfall-Hydration)
 */
export async function hydrateUserStateFromIndexedDb() {
  try {
    const record = await getItem('keyvalue', IDB_STORE_BACKUP_KEY);
    if (record && record.state) {
      return record.state;
    }
    return null;
  } catch (err) {
    console.warn('[IndexedDB Store] Fehler beim Lesen aus IndexedDB:', err);
    return null;
  }
}

/**
 * Erstellt einen benannten Snapshot mit Zeitstempel
 */
export async function createStoreSnapshot(name = 'Manueller Snapshot', state) {
  if (!state) return null;
  try {
    const snapshotId = `${IDB_SNAPSHOT_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const payload = {
      key: snapshotId,
      name,
      createdAt: new Date().toISOString(),
      state
    };
    await saveItem('keyvalue', payload);
    return payload;
  } catch (err) {
    console.warn('[IndexedDB Store] Fehler beim Erstellen des Snapshots:', err);
    return null;
  }
}

/**
 * Listet alle gespeicherten Snapshots auf
 */
export async function listStoreSnapshots() {
  try {
    const all = await getAllItems('keyvalue');
    return all.filter(item => typeof item.key === 'string' && item.key.startsWith(IDB_SNAPSHOT_PREFIX));
  } catch (err) {
    console.warn('[IndexedDB Store] Fehler beim Laden der Snapshots:', err);
    return [];
  }
}

/**
 * Löscht einen Snapshot anhand seiner ID
 */
export async function deleteStoreSnapshot(snapshotId) {
  try {
    await deleteItem('keyvalue', snapshotId);
    return true;
  } catch (err) {
    console.warn('[IndexedDB Store] Fehler beim Löschen des Snapshots:', err);
    return false;
  }
}
