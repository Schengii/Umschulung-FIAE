// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './useStore';
import { initialProfileState, toLocalDateKey } from '../utils/storage';
import { loadUiPreferences } from '../utils/uiPreferences';

describe('useStore Zustand Store', () => {
  beforeEach(() => {
    localStorage.clear();
    useStore.setState({
      userState: { ...initialProfileState, completedTopics: [], unlockedBadges: [], xp: 0, level: 1 },
      theme: 'light',
      fontSize: 100,
      isDyslexic: false,
      isColorblind: false,
      isHighContrast: false,
      isReducedMotion: false,
      difficultyFilter: 'all'
    });
  });

  it('updates accessibility options correctly', () => {
    const { setTheme, setFontSize, setIsDyslexic, setIsColorblind, setIsHighContrast, setIsReducedMotion, setDifficultyFilter } = useStore.getState();

    setTheme('dark');
    expect(useStore.getState().theme).toBe('dark');

    setFontSize(120);
    expect(useStore.getState().fontSize).toBe(120);

    setIsDyslexic(true);
    expect(useStore.getState().isDyslexic).toBe(true);

    setIsColorblind(true);
    expect(useStore.getState().isColorblind).toBe(true);

    setIsHighContrast(true);
    expect(useStore.getState().isHighContrast).toBe(true);

    setIsReducedMotion(true);
    expect(useStore.getState().isReducedMotion).toBe(true);

    setDifficultyFilter('junior');
    expect(useStore.getState().difficultyFilter).toBe('junior');
  });

  it('persists theme & accessibility options so they survive a reload', () => {
    const { setTheme, setFontSize, setIsReducedMotion } = useStore.getState();

    setTheme('dark');
    setFontSize(120);
    setIsReducedMotion(true);

    expect(loadUiPreferences()).toMatchObject({ theme: 'dark', fontSize: 120, isReducedMotion: true });
  });

  it('awards XP and increases level properly', () => {
    const { awardXP } = useStore.getState();

    awardXP(60, 'first_lesson');
    
    const state = useStore.getState().userState;
    expect(state.xp).toBe(60);
    expect(state.level).toBe(2);
    expect(state.unlockedBadges).toContain('first_lesson');
  });

  it('handles role selection and saves state', () => {
    const { handleSelectRole } = useStore.getState();

    handleSelectRole('fisi');
    expect(useStore.getState().userState.role).toBe('fisi');
  });

  it('handles topic completion without duplicate XP awards', () => {
    const { handleCompleteTopic } = useStore.getState();

    handleCompleteTopic('binary_basics', 50);
    let state = useStore.getState().userState;
    expect(state.completedTopics).toContain('binary_basics');
    expect(state.xp).toBe(50);

    // Completing the same topic again shouldn't award duplicate XP
    handleCompleteTopic('binary_basics', 50);
    state = useStore.getState().userState;
    expect(state.xp).toBe(50);
  });

  it('erhöht den Streak, wenn gestern aktiv und heute XP vergeben wird', () => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    useStore.setState((st) => ({ userState: { ...st.userState, streak: 3, lastActiveDate: toLocalDateKey(y) } }));
    useStore.getState().awardXP(10);
    expect(useStore.getState().userState.streak).toBe(4);
    // zweite Aktion am selben Tag ändert den Streak nicht
    useStore.getState().awardXP(10);
    expect(useStore.getState().userState.streak).toBe(4);
  });

  it('verbraucht Streak-Freezes bei einem verpassten Tag', () => {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    useStore.setState((st) => ({ userState: { ...st.userState, streak: 5, streakFreezes: 1, lastActiveDate: toLocalDateKey(d) } }));
    useStore.getState().awardXP(10);
    const s = useStore.getState().userState;
    expect(s.streak).toBe(6);
    expect(s.streakFreezes).toBe(0);
  });

  it('kauft einen Streak-Freeze nur bei ausreichend XP', () => {
    expect(useStore.getState().buyStreakFreeze(100)).toBe(false);
    useStore.setState((st) => ({ userState: { ...st.userState, xp: 150 } }));
    expect(useStore.getState().buyStreakFreeze(100)).toBe(true);
    const s = useStore.getState().userState;
    expect(s.xp).toBe(50);
    expect(s.streakFreezes).toBe(1);
  });
});
