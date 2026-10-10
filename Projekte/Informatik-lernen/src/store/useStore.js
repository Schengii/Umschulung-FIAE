import { create } from 'zustand';
import { loadUserState, saveUserState, hasStoredUserState, initialProfileState, calculateLevel, recordDailyActivity, getTodayDateKey } from '../utils/storage';
import { hydrateUserStateFromIndexedDb } from '../utils/indexedDbStoreMiddleware';
import { loadUiPreferences, saveUiPreferences } from '../utils/uiPreferences';
import { soundManager } from '../utils/audioSystem';
import { applyAnswerResults } from '../utils/mistakeJournalEngine';
import { recordVisit, recordCompletion } from '../utils/labProgressEngine';

export const useStore = create((set) => {
  const initialUser = loadUserState();
  if (initialUser.soundSettings) {
    soundManager.setVolume(initialUser.soundSettings.volume ?? 0.5);
    soundManager.setMuted(initialUser.soundSettings.isMuted ?? false);
  }

  const initialUiPreferences = loadUiPreferences();

  // Anzeige-/Barrierefreiheits-Einstellung setzen UND persistieren, damit
  // sie einen Reload überlebt (siehe utils/uiPreferences.js).
  const setUiPreference = (patch) => {
    saveUiPreferences(patch);
    set(patch);
  };

  // Notfall-Hydration: localStorage kann gelöscht werden (manuell, durch den
  // Browser bei Speicherdruck, oder bei Überschreitung des 5-MB-Quotas) ohne
  // dass IndexedDB davon betroffen ist, da beide unabhängige Speicher sind.
  // War localStorage beim Start leer, wird asynchron versucht, den zuletzt
  // redundant gesicherten Zustand aus IndexedDB wiederherzustellen, statt den
  // Nutzer stillschweigend auf Level 1 zurückzusetzen. Betrifft nur den
  // seltenen Fall eines leeren localStorage - der normale Ladepfad oben
  // bleibt synchron und unverändert.
  if (!hasStoredUserState()) {
    hydrateUserStateFromIndexedDb().then((backupState) => {
      if (!backupState) return;
      const restored = { ...initialProfileState, ...backupState };
      saveUserState(restored, { immediate: true });
      soundManager.setVolume(restored.soundSettings?.volume ?? 0.5);
      soundManager.setMuted(restored.soundSettings?.isMuted ?? false);
      set({
        userState: restored,
        soundVolume: restored.soundSettings?.volume ?? 0.5,
        isSoundMuted: restored.soundSettings?.isMuted ?? false
      });
    });
  }

  return {
    // User Progress State
    userState: initialUser,
    
    // Theme & Accessibility State
    ...initialUiPreferences,
    difficultyFilter: 'all',

    // Sound State
    soundVolume: initialUser.soundSettings?.volume ?? 0.5,
    isSoundMuted: initialUser.soundSettings?.isMuted ?? false,

    // Actions
    setTheme: (theme) => setUiPreference({ theme }),
    setFontSize: (fontSize) => setUiPreference({ fontSize }),
    setIsDyslexic: (isDyslexic) => setUiPreference({ isDyslexic }),
    setIsColorblind: (isColorblind) => setUiPreference({ isColorblind }),
    setIsHighContrast: (isHighContrast) => setUiPreference({ isHighContrast }),
    setIsReducedMotion: (isReducedMotion) => setUiPreference({ isReducedMotion }),
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
        // Seltene, bewusste Aktion (einmalig beim Onboarding/Rollenwechsel) -
        // sofort persistieren statt zu debouncen, damit sie auch bei einem
        // direkt folgenden Reload sicher übernommen ist.
        saveUserState(updatedState, { immediate: true });
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

    // Fehlerjournal: results = [{ id, correct }] aus Prüfung/Wiederholung
    recordMistakeResults: (results) => {
      if (!Array.isArray(results) || results.length === 0) return;
      set((state) => {
        const prev = state.userState;
        const updatedState = { ...prev, mistakeJournal: applyAnswerResults(prev.mistakeJournal, results) };
        saveUserState(updatedState);
        return { userState: updatedState };
      });
    },

    // Lab-Fortschritt: Besuch beim Öffnen, Abschluss bei XP-Belohnung des Labs
    recordLabVisit: (labKey) => {
      if (!labKey) return;
      set((state) => {
        const prev = state.userState;
        const updatedState = { ...prev, labProgress: recordVisit(prev.labProgress, labKey, getTodayDateKey()) };
        saveUserState(updatedState);
        return { userState: updatedState };
      });
    },

    recordLabCompletion: (labKey) => {
      if (!labKey) return;
      set((state) => {
        const prev = state.userState;
        const labProgress = recordCompletion(prev.labProgress, labKey, getTodayDateKey());
        if (labProgress === (prev.labProgress || {}) && prev.labProgress) return { userState: prev };
        const updatedState = { ...prev, labProgress };
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

// Multi-Tab Synchronisation: Aktualisiert offene Tabs bei Änderungen in anderen Fenstern
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'it_devgame_user_state') {
      useStore.getState().refreshStateFromStorage();
    }
  });

  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const syncChannel = new BroadcastChannel('it_devgame_sync');
      syncChannel.onmessage = (event) => {
        if (event.data?.type === 'SYNC_STATE' && event.data.state) {
          useStore.setState({ userState: event.data.state });
        }
      };
    } catch {
      // Safe no-op in restricted iframe/environment
    }
  }
}

