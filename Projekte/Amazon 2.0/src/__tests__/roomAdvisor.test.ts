import { describe, it, expect } from 'vitest';
import { state } from '../store';
import { getMatchingProducts } from '../components/roomAdvisor';

describe('Room Advisor Suite', () => {
  it('extracts matching products for home-office preset', () => {
    const preset = {
      id: 'office',
      name: 'Modernes Office',
      style: 'Minimalistisch',
      icon: '💻',
      palette: ['#000', '#fff'],
      recommendedCategories: ['electronics', 'audio'],
      description: 'Office test',
    };

    const matches = getMatchingProducts(state, preset);
    expect(Array.isArray(matches)).toBe(true);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every(p => ['electronics', 'audio'].includes(p.category))).toBe(true);
  });
});
