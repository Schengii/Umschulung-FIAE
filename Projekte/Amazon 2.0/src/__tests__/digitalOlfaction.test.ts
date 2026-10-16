import { describe, it, expect } from 'vitest';
import { getScentPyramid } from '../utils/digitalOlfaction';

describe('Digital Olfaction & Scent Protocol Engine', () => {
  it('generates 3-phase scent pyramid and connects to diffuser', () => {
    const scent = getScentPyramid();
    expect(scent.topNotes.length).toBeGreaterThan(0);
    expect(scent.heartNotes.length).toBeGreaterThan(0);
    expect(scent.baseNotes.length).toBeGreaterThan(0);
    expect(scent.diffuserPaired).toBe(true);
    expect(scent.intensityScorePercent).toBeGreaterThan(70);
  });
});
