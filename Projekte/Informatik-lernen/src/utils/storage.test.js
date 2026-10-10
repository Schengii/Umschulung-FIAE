// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initialProfileState, calculateLevel, saveUserState, loadUserState, flushUserState, updateStreak, daysBetweenDateKeys, toLocalDateKey, recordDailyActivity, getTodayDateKey } from './storage';

describe('Storage Utilities & Game Logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    flushUserState();
    vi.useRealTimers();
  });

  it('calculates the correct level based on XP', () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(50)).toBe(2);
    expect(calculateLevel(199)).toBe(2);
    expect(calculateLevel(200)).toBe(3);
  });

  it('loads initial state if localStorage is empty', () => {
    const state = loadUserState();
    expect(state).toEqual(initialProfileState);
  });

  it('saves immediately when options.immediate is true', () => {
    const newState = { ...initialProfileState, xp: 500, userName: 'TestUser' };
    saveUserState(newState, { immediate: true });

    const loadedState = loadUserState();
    expect(loadedState.xp).toBe(500);
    expect(loadedState.userName).toBe('TestUser');
    expect(loadedState.level).toBe(1); // loadUserState doesn't recalculate level, store handles it
  });

  it('debounces the default (non-immediate) write and applies it after the delay', () => {
    vi.useFakeTimers();
    const newState = { ...initialProfileState, xp: 500, userName: 'TestUser' };
    saveUserState(newState);

    // Direkt nach dem Aufruf ist noch nichts persistiert - das Schreiben ist gebündelt.
    expect(loadUserState().xp).toBe(0);

    vi.advanceTimersByTime(500);

    expect(loadUserState().xp).toBe(500);
    expect(loadUserState().userName).toBe('TestUser');
  });

  it('coalesces mehrere schnelle Aufrufe zu genau einem Schreibvorgang', () => {
    vi.useFakeTimers();
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    saveUserState({ ...initialProfileState, xp: 10 });
    saveUserState({ ...initialProfileState, xp: 20 });
    saveUserState({ ...initialProfileState, xp: 30 });

    vi.advanceTimersByTime(500);

    expect(setItemSpy).toHaveBeenCalledTimes(1);
    expect(loadUserState().xp).toBe(30); // nur der letzte Zustand gewinnt
    setItemSpy.mockRestore();
  });

  it('flushUserState() erzwingt ein sofortiges Schreiben eines ausstehenden Speichervorgangs', () => {
    vi.useFakeTimers();
    saveUserState({ ...initialProfileState, xp: 42 });

    expect(loadUserState().xp).toBe(0);
    flushUserState();
    expect(loadUserState().xp).toBe(42);
  });
});

describe('Streak-Logik (updateStreak / recordDailyActivity)', () => {
  const base = { ...initialProfileState, streak: 1, streakFreezes: 0, lastActiveDate: '' };

  it('daysBetweenDateKeys ist DST-sicher und monatsübergreifend korrekt', () => {
    expect(daysBetweenDateKeys('2026-03-28', '2026-03-30')).toBe(2); // Sommerzeit-Umstellung
    expect(daysBetweenDateKeys('2026-10-24', '2026-10-26')).toBe(2); // Winterzeit-Umstellung
    expect(daysBetweenDateKeys('2026-12-31', '2027-01-01')).toBe(1);
  });

  it('toLocalDateKey nutzt lokale Zeit statt UTC', () => {
    expect(toLocalDateKey(new Date(2026, 5, 7, 0, 30))).toBe('2026-06-07');
  });

  it('setzt beim ersten Tag lastActiveDate, Streak bleibt 1', () => {
    const s = updateStreak(base, '2026-05-01');
    expect(s).toMatchObject({ streak: 1, lastActiveDate: '2026-05-01' });
  });

  it('verändert den Streak am selben Tag nicht', () => {
    const s1 = updateStreak({ ...base, streak: 4, lastActiveDate: '2026-05-01' }, '2026-05-01');
    expect(s1.streak).toBe(4);
  });

  it('erhöht den Streak am Folgetag', () => {
    expect(updateStreak({ ...base, streak: 4, lastActiveDate: '2026-05-01' }, '2026-05-02').streak).toBe(5);
  });

  it('setzt den Streak nach verpassten Tagen ohne Freeze auf 1 zurück', () => {
    const s = updateStreak({ ...base, streak: 9, lastActiveDate: '2026-05-01' }, '2026-05-04');
    expect(s).toMatchObject({ streak: 1, streakFreezes: 0 });
  });

  it('verbraucht pro verpasstem Tag einen Freeze und erhält den Streak', () => {
    const s = updateStreak({ ...base, streak: 9, streakFreezes: 3, lastActiveDate: '2026-05-01' }, '2026-05-04');
    expect(s).toMatchObject({ streak: 10, streakFreezes: 1 }); // 2 verpasste Tage
  });

  it('behält Freezes, wenn sie nicht ausreichen (Streak-Reset)', () => {
    const s = updateStreak({ ...base, streak: 9, streakFreezes: 1, lastActiveDate: '2026-05-01' }, '2026-05-05');
    expect(s).toMatchObject({ streak: 1, streakFreezes: 1 });
  });

  it('recordDailyActivity bucht Aktivität und aktualisiert den Streak', () => {
    const s = recordDailyActivity({ ...base, streak: 2, lastActiveDate: '1999-01-01', streakFreezes: 0 }, 25);
    expect(s.streak).toBe(1);
    expect(s.lastActiveDate).toBe(getTodayDateKey());
    expect(s.activityHistory[getTodayDateKey()]).toMatchObject({ count: 1, xp: 25 });
  });
});
