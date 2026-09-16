import { describe, it, expect } from 'vitest';
import { KafkaRebalanceSimulator } from './kafkaRebalanceEngine';

describe('Kafka Rebalance Protocol Engine', () => {
  it('contrasts downtime between Eager and Cooperative Sticky rebalances', () => {
    const sim = new KafkaRebalanceSimulator();

    sim.rebalanceProtocol = 'COOPERATIVE_STICKY';
    const coop = sim.simulateRebalance('CONSUMER_JOINED');
    expect(coop.isZeroDowntime).toBe(true);
    expect(coop.downtimeMs).toBeLessThan(100);

    sim.rebalanceProtocol = 'EAGER';
    const eager = sim.simulateRebalance('CONSUMER_JOINED');
    expect(eager.isZeroDowntime).toBe(false);
    expect(eager.downtimeMs).toBeGreaterThan(1000);
  });
});
