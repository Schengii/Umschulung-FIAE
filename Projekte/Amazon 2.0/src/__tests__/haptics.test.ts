import { describe, it, expect } from 'vitest';
import { triggerHaptic, isHapticsSupported, setHapticsEnabled } from '../utils/haptics';

describe('Haptics & Gamepad Vibration Suite', () => {
  it('checks support status safely', () => {
    expect(typeof isHapticsSupported()).toBe('boolean');
  });

  it('safely handles all haptic patterns without throwing', () => {
    expect(() => triggerHaptic('light')).not.toThrow();
    expect(() => triggerHaptic('medium')).not.toThrow();
    expect(() => triggerHaptic('heavy')).not.toThrow();
    expect(() => triggerHaptic('success')).not.toThrow();
    expect(() => triggerHaptic('alert')).not.toThrow();
    expect(() => triggerHaptic('spin')).not.toThrow();
  });

  it('toggles haptics state', () => {
    setHapticsEnabled(false);
    expect(() => triggerHaptic('light')).not.toThrow();
    setHapticsEnabled(true);
  });
});
