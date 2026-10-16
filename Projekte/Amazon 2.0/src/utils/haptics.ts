// ============================================================
// Amazon 2.0 – Native Haptics & Gamepad Vibration Engine
// ============================================================

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'alert' | 'spin';

const VIBRATION_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 15,
  medium: 35,
  heavy: 60,
  success: [25, 50, 40],
  alert: [50, 100, 50, 100, 60],
  spin: [10, 20, 15, 25, 20, 30, 40],
};

let hapticsEnabled = true;

export function isHapticsSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

export function setHapticsEnabled(enabled: boolean): void {
  hapticsEnabled = enabled;
}

export function triggerHaptic(pattern: HapticPattern = 'light'): void {
  if (!hapticsEnabled || typeof navigator === 'undefined') return;

  // 1. Mobile Vibration API
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(VIBRATION_PATTERNS[pattern]);
    }
  } catch {
    // Ignore permissions/unsupported errors
  }

  // 2. Web Gamepad Vibration Actuator
  try {
    if (typeof window !== 'undefined' && 'getGamepads' in navigator) {
      const gamepads = navigator.getGamepads();
      for (const gp of gamepads) {
        if (gp && gp.vibrationActuator) {
          const intensity = pattern === 'heavy' ? 0.8 : pattern === 'medium' ? 0.5 : 0.25;
          const duration = pattern === 'spin' ? 400 : 150;
          (gp.vibrationActuator as any).playEffect('dual-rumble', {
            startDelay: 0,
            duration,
            weakMagnitude: intensity,
            strongMagnitude: intensity,
          }).catch(() => {});
        }
      }
    }
  } catch {
    // Ignore gamepad errors
  }
}
