/**
 * Web Vibration API & Haptic Feedback Utility
 */

export const HAPTIC_PATTERNS = {
  SUCCESS: [40, 60, 40],
  WARNING: [80, 50, 80],
  ERROR: [120, 80, 120, 80, 120],
  SELECTION: [25],
  LEVEL_UP: [50, 50, 100, 50, 200]
};

export function triggerHaptic(type = 'SELECTION') {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      const pattern = HAPTIC_PATTERNS[type] || HAPTIC_PATTERNS.SELECTION;
      navigator.vibrate(pattern);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
