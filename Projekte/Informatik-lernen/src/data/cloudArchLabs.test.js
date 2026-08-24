import { describe, it, expect } from 'vitest';
import { 
  JWKS_SETS, 
  POSTGRES_MVCC_SCENARIOS, 
  HTTP3_QUIC_BENCHMARKS 
} from './cloudArchLabsData';

describe('Cloud Arch Labs: JWKS Rotation, Postgres MVCC & HTTP/3 QUIC', () => {
  it('should validate JWKS Key Rotation keys and JWT payload', () => {
    expect(JWKS_SETS.keys.length).toBeGreaterThanOrEqual(2);
    expect(JWKS_SETS.currentKeyId).toBeDefined();
    expect(JWKS_SETS.sampleJwt.header.kid).toBe(JWKS_SETS.currentKeyId);
    expect(JWKS_SETS.sampleJwt.header.alg).toBe('RS256');
  });

  it('should validate PostgreSQL MVCC 4-step life cycle (xmin, xmax and VACUUM reclaim)', () => {
    expect(POSTGRES_MVCC_SCENARIOS.length).toBe(4);
    
    // Step 1: Insert creates live tuple
    const step1 = POSTGRES_MVCC_SCENARIOS[0];
    expect(step1.tablePage[0].state).toBe('LIVE');
    expect(step1.tablePage[0].xmax).toBe(0);

    // Step 2: Update creates dead tuple and new live tuple
    const step2 = POSTGRES_MVCC_SCENARIOS[1];
    expect(step2.tablePage[0].state).toContain('DEAD');
    expect(step2.tablePage[0].xmax).toBe(step2.txId);

    // Step 4: VACUUM reclaims space
    const step4 = POSTGRES_MVCC_SCENARIOS[3];
    expect(step4.tablePage[0].state).toContain('RECLAIMED');
  });

  it('should validate HTTP/3 QUIC protocol comparison vs TCP', () => {
    expect(HTTP3_QUIC_BENCHMARKS.length).toBe(3);
    const quic = HTTP3_QUIC_BENCHMARKS.find(b => b.protocol.includes('HTTP/3'));
    expect(quic).toBeDefined();
    expect(quic.headOfLineBlocking).toContain('NEIN');
    expect(quic.connMigration).toContain('Ja');
  });
});
