// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './useStore';
import { initialProfileState } from '../utils/storage';

describe('useStore Zustand Store', () => {
  beforeEach(() => {
    localStorage.clear();
    useStore.setState({
      userState: { ...initialProfileState, completedTopics: [], unlockedBadges: [], xp: 0, level: 1 },
      lang: 'de',
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
    const { setLang, setTheme, setFontSize, setIsDyslexic, setIsColorblind, setIsHighContrast, setIsReducedMotion, setDifficultyFilter } = useStore.getState();
    
    setLang('en');
    expect(useStore.getState().lang).toBe('en');

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
});
