import { describe, it, expect } from 'vitest';
import { C4_DESCRIPTIONS, getHotspotStyleForLevel } from './c4-architecture.js';

describe('C4 Architecture Helper Logic', () => {
    it('provides descriptions for levels 1, 2, and 3', () => {
        expect(C4_DESCRIPTIONS['1']).toContain('System Overview');
        expect(C4_DESCRIPTIONS['2']).toContain('Container Diagramm');
        expect(C4_DESCRIPTIONS['3']).toContain('Component View');
    });

    it('returns default full opacity and scale 1 for Level 1', () => {
        const style = getHotspotStyleForLevel('1', 'database');
        expect(style.opacity).toBe('1');
        expect(style.transform).toBe('scale(1)');
    });

    it('highlights core components on Level 2 with opacity 1 and dims others to 0.7', () => {
        const dbStyle = getHotspotStyleForLevel('2', 'database');
        expect(dbStyle.opacity).toBe('1');
        expect(dbStyle.transform).toBe('scale(1.02)');

        const clientStyle = getHotspotStyleForLevel('2', 'client');
        expect(clientStyle.opacity).toBe('1');

        const otherStyle = getHotspotStyleForLevel('2', 'cloud-api');
        expect(otherStyle.opacity).toBe('0.7');
        expect(otherStyle.transform).toBe('scale(1.02)');
    });

    it('zooms into components on Level 3 with scale 1.04', () => {
        const style = getHotspotStyleForLevel('3', 'any-component');
        expect(style.opacity).toBe('1');
        expect(style.transform).toBe('scale(1.04)');
    });
});
