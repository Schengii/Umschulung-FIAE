import { describe, it, expect } from 'vitest';
import { VOICE_PERSONAS, getActiveVoicePersona, setActiveVoicePersona } from '../utils/voicePersonas';

describe('Custom Synthetic AI Voice Personas', () => {
  it('provides configured voice personas and allows selection', () => {
    expect(VOICE_PERSONAS.length).toBe(4);
    expect(VOICE_PERSONAS.map(p => p.id)).toContain('tech-guru');
    expect(VOICE_PERSONAS.map(p => p.id)).toContain('bargain-hunter');

    setActiveVoicePersona('cyberpunk-ai');
    const active = getActiveVoicePersona();
    expect(active.id).toBe('cyberpunk-ai');
    expect(active.pitch).toBe(0.7);
  });
});
