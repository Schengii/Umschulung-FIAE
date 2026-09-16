import { describe, it, expect } from 'vitest';
import { calculateAbcXyzMatrix } from './wisoAbcXyzEngine';

describe('IHK WISO ABC & XYZ Analysis Engine', () => {
  it('correctly classifies items into ABC and XYZ classes with strategies', () => {
    const res = calculateAbcXyzMatrix();

    expect(res.summeGesamtwert).toBeGreaterThan(0);
    const cpu = res.analyzedItems.find(it => it.name.includes('CPUs'));
    expect(cpu.abcClass).toBe('A');
    expect(cpu.xyzClass).toBe('X');
    expect(cpu.matrixCode).toBe('AX');
    expect(cpu.strategie).toContain('Just-in-Time');

    const screws = res.analyzedItems.find(it => it.name.includes('Schrauben'));
    expect(screws.abcClass).toBe('C');
    expect(screws.xyzClass).toBe('Z');
  });
});
