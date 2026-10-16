import { describe, it, expect } from 'vitest';
import { idbSet, idbGet, idbDelete, idbClear, STORES } from '../utils/indexedDB';

describe('IndexedDB Async Storage Suite', () => {
  it('defines valid storage stores', () => {
    expect(STORES.chatLogs).toBe('chat_logs');
    expect(STORES.sellerListings).toBe('seller_listings');
    expect(STORES.cachedAssets).toBe('cached_assets');
  });

  it('safely handles set and get operations with fallback', async () => {
    await idbSet(STORES.chatLogs, 'test_key', { text: 'test_message' });
    const val = await idbGet(STORES.chatLogs, 'test_key', null);
    expect(val).toEqual({ text: 'test_message' });
  });

  it('returns fallback value when key is not found', async () => {
    const val = await idbGet(STORES.chatLogs, 'non_existent_key_123', 'default_val');
    expect(val).toBe('default_val');
  });

  it('safely performs delete and clear operations', async () => {
    await expect(idbDelete(STORES.chatLogs, 'test_key')).resolves.not.toThrow();
    await expect(idbClear(STORES.chatLogs)).resolves.not.toThrow();
  });
});
