// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { soundManager } from './audioSystem';

describe('audioSystem / SoundController', () => {
  let mockOscillator;
  let mockGain;
  let mockAudioContext;

  beforeEach(() => {
    soundManager.setVolume(0.5);
    soundManager.setMuted(false);

    mockOscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn()
    };

    mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
      },
      connect: vi.fn()
    };

    mockAudioContext = {
      state: 'running',
      currentTime: 10,
      destination: {},
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGain),
      resume: vi.fn().mockResolvedValue(undefined)
    };

    window.AudioContext = vi.fn(function MockAudioContext() {
      return mockAudioContext;
    });
    soundManager.audioCtx = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete window.AudioContext;
    delete window.webkitAudioContext;
  });

  it('clamps volume properly between 0 and 1', () => {
    soundManager.setVolume(0.8);
    expect(soundManager.volume).toBe(0.8);

    soundManager.setVolume(-0.5);
    expect(soundManager.volume).toBe(0);

    soundManager.setVolume(1.5);
    expect(soundManager.volume).toBe(1);
  });

  it('toggles muted state', () => {
    soundManager.setMuted(true);
    expect(soundManager.isMuted).toBe(true);

    soundManager.setMuted(false);
    expect(soundManager.isMuted).toBe(false);
  });

  it('does not play sound when muted or volume is 0', () => {
    soundManager.setMuted(true);
    soundManager.playSFX('success');
    expect(window.AudioContext).not.toHaveBeenCalled();

    soundManager.setMuted(false);
    soundManager.setVolume(0);
    soundManager.playSFX('success');
    expect(window.AudioContext).not.toHaveBeenCalled();
  });

  it('creates AudioContext and resumes if suspended', () => {
    mockAudioContext.state = 'suspended';
    const ctx = soundManager.getAudioContext();
    expect(ctx).toBe(mockAudioContext);
    expect(mockAudioContext.resume).toHaveBeenCalled();
  });

  it('plays all supported sound effect types', () => {
    const sfxTypes = ['success', 'levelUp', 'error', 'click', 'timerBell'];
    sfxTypes.forEach((type) => {
      soundManager.playSFX(type);
      expect(mockOscillator.start).toHaveBeenCalled();
      expect(mockOscillator.stop).toHaveBeenCalled();
      expect(mockGain.connect).toHaveBeenCalledWith(mockAudioContext.destination);
    });
  });

  it('handles AudioContext errors silently without throwing', () => {
    mockAudioContext.createOscillator = vi.fn(() => {
      throw new Error('AudioContext locked');
    });
    expect(() => soundManager.playSFX('success')).not.toThrow();
  });
});
