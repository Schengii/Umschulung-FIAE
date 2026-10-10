import { describe, it, expect } from 'vitest';
import { 
  ISOLATION_LEVELS, 
  ANOMALIES, 
  simulateTransactionIsolation 
} from './sqlIsolationEngine';

describe('sqlIsolationEngine', () => {
  it('enthält alle 4 ANSI-SQL Isolationslevel', () => {
    expect(ISOLATION_LEVELS.read_uncommitted).toBeDefined();
    expect(ISOLATION_LEVELS.read_committed).toBeDefined();
    expect(ISOLATION_LEVELS.repeatable_read).toBeDefined();
    expect(ISOLATION_LEVELS.serializable).toBeDefined();
  });

  it('verhindert Dirty Reads ab Read Committed', () => {
    const dirtyOnUncommitted = simulateTransactionIsolation('read_uncommitted', 'dirty_read');
    expect(dirtyOnUncommitted.prevented).toBe(false);

    const dirtyOnCommitted = simulateTransactionIsolation('read_committed', 'dirty_read');
    expect(dirtyOnCommitted.prevented).toBe(true);
  });

  it('verhindert Non-Repeatable Reads ab Repeatable Read', () => {
    const nonRepeatableCommitted = simulateTransactionIsolation('read_committed', 'non_repeatable_read');
    expect(nonRepeatableCommitted.prevented).toBe(false);

    const nonRepeatableRepeatable = simulateTransactionIsolation('repeatable_read', 'non_repeatable_read');
    expect(nonRepeatableRepeatable.prevented).toBe(true);
  });

  it('verhindert Write Skew nur unter Serializable (SSI)', () => {
    const skewRepeatable = simulateTransactionIsolation('repeatable_read', 'write_skew');
    expect(skewRepeatable.prevented).toBe(false);

    const skewSerializable = simulateTransactionIsolation('serializable', 'write_skew');
    expect(skewSerializable.prevented).toBe(true);
    expect(skewSerializable.technicalDetail).toContain('SSI');
  });

  it('stellt Szenario-Schritte für alle Anomalien bereit', () => {
    Object.values(ANOMALIES).forEach(anomaly => {
      expect(anomaly.scenario.length).toBeGreaterThanOrEqual(3);
      expect(anomaly.title).toBeDefined();
    });
  });
});
