import { create } from 'zustand';
import { loadUserState, saveUserState, calculateLevel, recordDailyActivity } from '../utils/storage';
import { soundManager } from '../utils/audioSystem';

export const useStore = create((set) => {
  const initialUser = loadUserState();
  if (initialUser.soundSettings) {
    soundManager.setVolume(initialUser.soundSettings.volume ?? 0.5);
    soundManager.setMuted(initialUser.soundSettings.isMuted ?? false);
  }

  return {
    // User Progress State
    userState: initialUser,
    
    // Theme & Accessibility State
    lang: 'de',
    theme: 'light',
    fontSize: 100,
    isDyslexic: false,
    isColorblind: false,
    isHighContrast: false,
    isReducedMotion: false,
    difficultyFilter: 'all',

    // Sound State
    soundVolume: initialUser.soundSettings?.volume ?? 0.5,
    isSoundMuted: initialUser.soundSettings?.isMuted ?? false,

    // Actions
    setLang: (lang) => set({ lang }),
    setTheme: (theme) => set({ theme }),
    setFontSize: (fontSize) => set({ fontSize }),
    setIsDyslexic: (isDyslexic) => set({ isDyslexic }),
    setIsColorblind: (isColorblind) => set({ isColorblind }),
    setIsHighContrast: (isHighContrast) => set({ isHighContrast }),
    setIsReducedMotion: (isReducedMotion) => set({ isReducedMotion }),
    setDifficultyFilter: (difficultyFilter) => set({ difficultyFilter }),

    setSoundVolume: (vol) => {
      soundManager.setVolume(vol);
      set((state) => {
        const updated = {
          ...state.userState,
          soundSettings: { ...(state.userState.soundSettings || {}), volume: vol }
        };
        saveUserState(updated);
        return { soundVolume: vol, userState: updated };
      });
    },

    setIsSoundMuted: (muted) => {
      soundManager.setMuted(muted);
      set((state) => {
        const updated = {
          ...state.userState,
          soundSettings: { ...(state.userState.soundSettings || {}), isMuted: muted }
        };
        saveUserState(updated);
        return { isSoundMuted: muted, userState: updated };
      });
    },

    // User Actions
    setUserState: (newState) => {
      set((state) => {
        const updatedState = typeof newState === 'function' ? newState(state.userState) : newState;
        saveUserState(updatedState);
        return { userState: updatedState };
      });
    },

    handleSelectRole: (roleId) => {
      set((state) => {
        const updatedState = { ...state.userState, role: roleId };
        saveUserState(updatedState);
        return { userState: updatedState };
      });
    },

    awardXP: (amount, achievementId = null) => {
      let triggeredConfetti = false;
      soundManager.playSFX('success');
      set((state) => {
        const prev = state.userState;
        const newXP = prev.xp + amount;
        const newLevel = calculateLevel(newXP);
        const unlocked = [...prev.unlockedBadges];
        
        if (newLevel > prev.level) {
          soundManager.playSFX('levelUp');
        }

        if (achievementId && !unlocked.includes(achievementId)) {
          unlocked.push(achievementId);
        }
        
        let updatedState = {
          ...prev,
          xp: newXP,
          level: newLevel,
          unlockedBadges: unlocked
        };

        updatedState = recordDailyActivity(updatedState, amount);
        saveUserState(updatedState);
        triggeredConfetti = true;
        return { userState: updatedState };
      });
      return triggeredConfetti;
    },

    handleCompleteTopic: (topicId, xp) => {
      let triggeredConfetti = false;
      soundManager.playSFX('success');
      set((state) => {
        const prev = state.userState;
        if (!prev.completedTopics.includes(topicId)) {
          const completed = [...prev.completedTopics, topicId];
          const newXP = prev.xp + xp;
          const newLevel = calculateLevel(newXP);
          const unlocked = [...prev.unlockedBadges];
          if (!unlocked.includes('first_steps')) {
            unlocked.push('first_steps');
          }

          if (newLevel > prev.level) {
            soundManager.playSFX('levelUp');
          }

          let updatedState = {
            ...prev,
            xp: newXP,
            level: newLevel,
            completedTopics: completed,
            unlockedBadges: unlocked
          };
          updatedState = recordDailyActivity(updatedState, xp);
          saveUserState(updatedState);
          triggeredConfetti = true;
          return { userState: updatedState };
        }
        return { userState: prev };
      });
      return triggeredConfetti;
    },

    updateSrsCard: (cardId, srsResult) => {
      set((state) => {
        const prev = state.userState;
        const updatedSrs = {
          ...(prev.srsFlashcards || {}),
          [cardId]: srsResult
        };
        const updatedState = { ...prev, srsFlashcards: updatedSrs };
        saveUserState(updatedState);
        return { userState: updatedState };
      });
    },

    buyStreakFreeze: (costXp = 100) => {
      let success = false;
      set((state) => {
        const prev = state.userState;
        if (prev.xp >= costXp) {
          const updatedState = {
            ...prev,
            xp: prev.xp - costXp,
            streakFreezes: (prev.streakFreezes || 0) + 1
          };
          saveUserState(updatedState);
          success = true;
          return { userState: updatedState };
        }
        return { userState: prev };
      });
      return success;
    },

    refreshStateFromStorage: () => {
      set({ userState: loadUserState() });
    }
  };
});
