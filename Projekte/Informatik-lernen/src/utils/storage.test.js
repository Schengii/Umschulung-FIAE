// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initialProfileState, calculateLevel, saveUserState, loadUserState } from './storage';

describe('Storage Utilities & Game Logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
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

  it('saves and loads user state correctly', () => {
    const newState = { ...initialProfileState, xp: 500, userName: 'TestUser' };
    saveUserState(newState);
    
    const loadedState = loadUserState();
    expect(loadedState.xp).toBe(500);
    expect(loadedState.userName).toBe('TestUser');
    expect(loadedState.level).toBe(1); // loadUserState doesn't recalculate level, store handles it
  });
});
