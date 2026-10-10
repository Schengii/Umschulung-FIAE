// @vitest-environment jsdom
//
// Testet die IndexedDB-Notfall-Hydration beim Store-Start isoliert von
// useStore.test.js: `useStore` wird beim Modul-Import einmalig mit
// `create()` instanziiert, daher braucht dieser Fall einen frischen
// Modul-Kontext (vi.resetModules) pro Test, um verschiedene Startzustände
// (leeres vs. gefülltes localStorage) zu simulieren.
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('useStore: IndexedDB-Notfall-Hydration beim Start', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('hydriert den User-State aus IndexedDB, wenn localStorage beim Start leer ist', async () => {
    const backupState = {
      role: 'pro',
      userName: 'Wiederhergestellt',
      xp: 999,
      level: 5,
      soundSettings: { volume: 0.3, isMuted: true }
    };

    vi.doMock('../utils/indexedDbStoreMiddleware', () => ({
      hydrateUserStateFromIndexedDb: vi.fn().mockResolvedValue(backupState),
      syncUserStateToIndexedDb: vi.fn().mockResolvedValue(true)
    }));

    const { useStore } = await import('./useStore');

    // Die Hydration läuft asynchron (echtes Promise aus dem Mock) - auf den
    // Microtask warten, bevor der resultierende State geprüft wird.
    await new Promise((resolve) => setTimeout(resolve, 0));

    const state = useStore.getState().userState;
    expect(state.xp).toBe(999);
    expect(state.userName).toBe('Wiederhergestellt');
    expect(state.role).toBe('pro');

    // Der wiederhergestellte Zustand muss auch sofort zurück nach localStorage
    // geschrieben werden, damit ein Reload nicht wieder bei Default landet.
    const persisted = JSON.parse(localStorage.getItem('informatik_game_state_v1'));
    expect(persisted.xp).toBe(999);
  });

  it('greift NICHT ein, wenn IndexedDB keinen Backup-Zustand liefert', async () => {
    vi.doMock('../utils/indexedDbStoreMiddleware', () => ({
      hydrateUserStateFromIndexedDb: vi.fn().mockResolvedValue(null),
      syncUserStateToIndexedDb: vi.fn().mockResolvedValue(true)
    }));

    const { useStore } = await import('./useStore');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(useStore.getState().userState.xp).toBe(0);
    expect(localStorage.getItem('informatik_game_state_v1')).toBeNull();
  });

  it('versucht KEINE Hydration, wenn bereits ein User-State in localStorage existiert', async () => {
    localStorage.setItem('informatik_game_state_v1', JSON.stringify({ xp: 42, role: 'azubi' }));

    const hydrateMock = vi.fn().mockResolvedValue({ xp: 999 });
    vi.doMock('../utils/indexedDbStoreMiddleware', () => ({
      hydrateUserStateFromIndexedDb: hydrateMock,
      syncUserStateToIndexedDb: vi.fn().mockResolvedValue(true)
    }));

    const { useStore } = await import('./useStore');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(hydrateMock).not.toHaveBeenCalled();
    expect(useStore.getState().userState.xp).toBe(42);
  });
});
