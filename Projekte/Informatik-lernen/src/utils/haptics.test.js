import { describe, it, expect, vi, afterEach } from 'vitest';
import { triggerHaptic, HAPTIC_PATTERNS } from './haptics';

describe('Web Haptics Utility', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('triggers vibrate pattern when navigator.vibrate is available', () => {
    const vibrateMock = vi.fn();
    vi.stubGlobal('navigator', { vibrate: vibrateMock });

    const res = triggerHaptic('SUCCESS');
    expect(res).toBe(true);
    expect(vibrateMock).toHaveBeenCalledWith(HAPTIC_PATTERNS.SUCCESS);
  });

  it('handles fallback when navigator.vibrate is not available', () => {
    vi.stubGlobal('navigator', {});
    const res = triggerHaptic('LEVEL_UP');
    expect(res).toBe(false);
  });
});
