import { describe, it, expect } from 'vitest';
import { STATIONS, nextStation, prevStation, togglePlay } from '../components/shoppingRadio';

describe('Shopping Radio Player Suite', () => {
  it('defines diverse curated radio stations', () => {
    expect(STATIONS.length).toBeGreaterThanOrEqual(3);
    expect(STATIONS[0].id).toBe('deals-radar');
    expect(STATIONS[0].title).toContain('Deal Radar');
  });

  it('safely cycles between stations without throwing in test environment', () => {
    expect(() => nextStation()).not.toThrow();
    expect(() => prevStation()).not.toThrow();
  });

  it('safely toggles play state in test environment', () => {
    expect(() => togglePlay()).not.toThrow();
  });
});
