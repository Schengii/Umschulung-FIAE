import { describe, it, expect } from 'vitest';
import { isAudioMuted, toggleAudioMute, setAudioMuted, playSound } from '../utils/audio';

describe('Audio Synthesizer Suite', () => {
  it('toggles audio mute status reliably', () => {
    const initial = isAudioMuted();
    const toggled = toggleAudioMute();
    expect(toggled).toBe(!initial);
    expect(isAudioMuted()).toBe(!initial);

    // Toggle back
    toggleAudioMute();
    expect(isAudioMuted()).toBe(initial);
  });

  it('sets explicit mute state', () => {
    setAudioMuted(true);
    expect(isAudioMuted()).toBe(true);

    setAudioMuted(false);
    expect(isAudioMuted()).toBe(false);
  });

  it('safely handles playSound calls in test environment without throwing', () => {
    expect(() => playSound('click')).not.toThrow();
    expect(() => playSound('cart')).not.toThrow();
    expect(() => playSound('checkout')).not.toThrow();
    expect(() => playSound('quest')).not.toThrow();
    expect(() => playSound('success')).not.toThrow();
    expect(() => playSound('alert')).not.toThrow();
  });
});
