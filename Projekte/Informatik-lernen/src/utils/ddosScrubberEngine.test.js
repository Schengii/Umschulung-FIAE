import { describe, it, expect } from 'vitest';
import {
  INITIAL_POPS,
  processPopTraffic
} from './ddosScrubberEngine';

describe('ddosScrubberEngine', () => {
  it('processes normal traffic as clean when no attack is present', () => {
    const pop = INITIAL_POPS[0];
    const result = processPopTraffic({
      pop,
      attackType: 'NONE',
      attackGbps: 0
    });

    expect(result.mitigationStatus).toBe('CLEAN');
    expect(result.scrubbedPop.isHealthy).toBe(true);
    expect(result.droppedTrafficGbps).toBe(0);
  });

  it('mitigates SYN flood using SYN cookies and protects PoP capacity', () => {
    const pop = { ...INITIAL_POPS[0], capacityGbps: 100, currentTrafficGbps: 10 };
    const result = processPopTraffic({
      pop,
      attackType: 'SYN_FLOOD',
      attackGbps: 50,
      enableSynCookies: true
    });

    expect(result.mitigationStatus).toBe('SCRUBBING');
    expect(result.scrubbedPop.isHealthy).toBe(true);
    expect(result.droppedTrafficGbps).toBeGreaterThan(40);
  });

  it('triggers BGP withdrawal when PoP is overwhelmed and withdrawal is enabled', () => {
    const pop = { ...INITIAL_POPS[0], capacityGbps: 50, currentTrafficGbps: 20 };
    const result = processPopTraffic({
      pop,
      attackType: 'UDP_AMPLIFICATION',
      attackGbps: 100,
      enableBgpWithdrawal: true
    });

    expect(result.mitigationStatus).toBe('WITHDRAWN');
    expect(result.scrubbedPop.currentTrafficGbps).toBe(0);
  });
});
