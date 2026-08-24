import { create } from 'zustand';
import { initialProfileState, loadUserState, saveUserState, calculateLevel } from '../utils/storage';

// Simple Web Audio API Synthesizer for SFX
const playSFX = (type = 'success') => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    // Ignore if audio context fails (e.g., before user interaction)
  }
};

export const useStore = create((set, get) => ({
  // User Progress State
  userState: loadUserState(),
  
  // Theme & Accessibility State
  lang: 'de',
  theme: 'light',
  fontSize: 100,
  isDyslexic: false,
  isColorblind: false,
  isHighContrast: false,
  isReducedMotion: false,
  difficultyFilter: 'all',

  // Actions
  setLang: (lang) => set({ lang }),
  setTheme: (theme) => set({ theme }),
  setFontSize: (fontSize) => set({ fontSize }),
  setIsDyslexic: (isDyslexic) => set({ isDyslexic }),
  setIsColorblind: (isColorblind) => set({ isColorblind }),
  setIsHighContrast: (isHighContrast) => set({ isHighContrast }),
  setIsReducedMotion: (isReducedMotion) => set({ isReducedMotion }),
  setDifficultyFilter: (difficultyFilter) => set({ difficultyFilter }),

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
    playSFX('success');
    set((state) => {
      const prev = state.userState;
      const newXP = prev.xp + amount;
      const newLevel = calculateLevel(newXP);
      const unlocked = [...prev.unlockedBadges];
      
      if (achievementId && !unlocked.includes(achievementId)) {
        unlocked.push(achievementId);
      }
      
      const updatedState = {
        ...prev,
        xp: newXP,
        level: newLevel,
        unlockedBadges: unlocked
      };
      
      saveUserState(updatedState);
      triggeredConfetti = true;
      return { userState: updatedState };
    });
    return triggeredConfetti; // Let components trigger confetti using framer/canvas-confetti independently if needed
  },

  handleCompleteTopic: (topicId, xp) => {
    let triggeredConfetti = false;
    playSFX('success');
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

        const updatedState = {
          ...prev,
          xp: newXP,
          level: newLevel,
          completedTopics: completed,
          unlockedBadges: unlocked
        };
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
}));
