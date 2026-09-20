import { describe, it, expect } from 'vitest';
import { formatTimerText } from './ihk-exam-simulator.js';

describe('formatTimerText', () => {
    it('formats a full 90-minute countdown as mm:ss', () => {
        expect(formatTimerText(5400)).toBe('90:00');
    });

    it('pads single-digit minutes and seconds with a leading zero', () => {
        expect(formatTimerText(65)).toBe('01:05');
    });

    it('formats zero seconds remaining as 00:00', () => {
        expect(formatTimerText(0)).toBe('00:00');
    });

    it('clamps negative values to 00:00 instead of showing a negative time', () => {
        expect(formatTimerText(-5)).toBe('00:00');
    });
});
