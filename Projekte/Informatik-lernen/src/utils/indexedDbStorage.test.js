import { describe, it, expect, beforeEach } from 'vitest';
import {
  STORES,
  saveItem,
  getItem,
  getAllItems,
  deleteItem,
  clearStore,
  exportAllStores
} from './indexedDbStorage';

describe('indexedDbStorage (Offline IndexedDB Persistence & Fallback)', () => {
  beforeEach(async () => {
    for (const store of STORES) {
      await clearStore(store);
    }
  });

  it('speichert und liest Objekte aus dem Notes Store', async () => {
    const note = {
      id: 'note_ihk_1',
      title: 'IHK Prüfungsformeln',
      content: 'LEP - Rabatt = ZEP',
      tags: ['wiso']
    };

    await saveItem('notes', note);
    const retrieved = await getItem('notes', 'note_ihk_1');
    expect(retrieved).toBeDefined();
    expect(retrieved.title).toBe('IHK Prüfungsformeln');
  });

  it('listet alle Items auf und löscht gezielt', async () => {
    await saveItem('flashcards', { id: 'card_1', front: 'Was ist CPM?', back: 'Netzplantechnik' });
    await saveItem('flashcards', { id: 'card_2', front: 'Was ist VLSM?', back: 'Variable Length Subnet Mask' });

    let all = await getAllItems('flashcards');
    expect(all.length).toBe(2);

    await deleteItem('flashcards', 'card_1');
    all = await getAllItems('flashcards');
    expect(all.length).toBe(1);
    expect(all[0].id).toBe('card_2');
  });

  it('exportiert alle Stores in ein vollständiges JSON-Backup', async () => {
    await saveItem('notes', { id: 'n1', title: 'Test Note' });
    await saveItem('custom_challenges', { id: 'c1', title: 'Custom RegEx' });

    const backup = await exportAllStores();
    expect(backup.stores.notes.length).toBe(1);
    expect(backup.stores.custom_challenges.length).toBe(1);
    expect(backup.stores.flashcards.length).toBe(0);
    expect(backup.timestamp).toBeDefined();
  });
});
