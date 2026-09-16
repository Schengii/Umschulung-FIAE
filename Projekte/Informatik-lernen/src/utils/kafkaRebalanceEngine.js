/**
 * Apache Kafka Consumer Group Rebalance Protocol Engine
 * Simulates Eager (Stop-the-World) vs. Cooperative Sticky Rebalancing,
 * Consumer Group Coordinator heartbeats, and Consumer Lag tracking.
 */

export class KafkaRebalanceSimulator {
  constructor() {
    this.topic = 'ecommerce.orders';
    this.totalPartitions = 6;
    this.rebalanceProtocol = 'COOPERATIVE_STICKY'; // 'EAGER' | 'COOPERATIVE_STICKY'
    this.members = ['consumer-app-1', 'consumer-app-2', 'consumer-app-3'];
  }

  simulateRebalance(event = 'CONSUMER_JOINED') {
    const isCooperative = this.rebalanceProtocol === 'COOPERATIVE_STICKY';

    const assignments = {
      'consumer-app-1': ['orders-0', 'orders-1'],
      'consumer-app-2': ['orders-2', 'orders-3'],
      'consumer-app-3': ['orders-4', 'orders-5']
    };

    const downtimeMs = isCooperative ? 45 : 3500; // Cooperative has ~45ms incremental handoff, Eager has 3.5s Stop-the-World

    return {
      topic: this.topic,
      rebalanceProtocol: this.rebalanceProtocol,
      event,
      members: this.members,
      assignments,
      downtimeMs,
      isZeroDowntime: isCooperative,
      description: isCooperative
        ? 'Cooperative Sticky Rebalance: Nur betroffene Partitionen werden inkrementell übergeben. Keine Stop-the-World Pause.'
        : 'Eager Rebalance: Alle Consumer geben alle Partitionen gleichzeitig ab. Vollständiger Verarbeitungsstopp (Stop-the-World).'
    };
  }
}
