// @ts-check
/**
 * Apache Kafka Consumer Group Lag & Rebalance Protocol Engine
 * Simulates Consumer Groups, Partition Assignment (Range vs. RoundRobin vs. CooperativeSticky),
 * Log End Offset (LEO), Current Offset, Consumer Lag calculation and Rebalance impact.
 */

/**
 * @typedef {Object} PartitionState
 * @property {number} partitionId Partition number (0, 1, 2, ...)
 * @property {number} logEndOffset LEO (latest produced message offset)
 * @property {number} currentOffset Latest committed consumer offset
 * @property {string} assignedConsumer Consumer instance ID currently processing this partition
 */

/**
 * @typedef {Object} ConsumerMember
 * @property {string} id Member identifier (e.g. 'consumer-pod-a')
 * @property {string} host Client hostname or IP
 * @property {number} assignedPartitionsCount Number of assigned partitions
 * @property {boolean} isHealthy Heartbeat status
 */

/**
 * @typedef {'EAGER' | 'COOPERATIVE_STICKY'} RebalanceStrategy
 */

/**
 * @typedef {'RANGE' | 'ROUND_ROBIN' | 'STICKY'} PartitionAssignor
 */

/**
 * Calculates current consumer lag across all partitions
 * Formula: Lag = Log End Offset (LEO) - Current Committed Offset
 * 
 * @param {PartitionState[]} partitions
 * @returns {{ totalLag: number, maxLag: number, partitionsWithLag: Array<PartitionState & { lag: number, status: 'NORMAL' | 'ELEVATED' | 'CRITICAL' }> }}
 */
export function calculateConsumerLag(partitions) {
  let totalLag = 0;
  let maxLag = 0;

  const partitionsWithLag = partitions.map(p => {
    const lag = Math.max(0, p.logEndOffset - p.currentOffset);
    totalLag += lag;
    if (lag > maxLag) maxLag = lag;

    /** @type {'NORMAL' | 'ELEVATED' | 'CRITICAL'} */
    let status = 'NORMAL';
    if (lag > 5000) status = 'CRITICAL';
    else if (lag > 1000) status = 'ELEVATED';

    return {
      ...p,
      lag,
      status
    };
  });

  return {
    totalLag,
    maxLag,
    partitionsWithLag
  };
}

/**
 * Simulates partition reassignment according to selected assignor strategy
 * @param {number[]} partitionIds
 * @param {string[]} consumerIds
 * @param {PartitionAssignor} [assignor='ROUND_ROBIN']
 * @returns {Record<string, number[]>} Mapping of consumer ID to assigned partition IDs
 */
export function assignPartitions(partitionIds, consumerIds, assignor = 'ROUND_ROBIN') {
  /** @type {Record<string, number[]>} */
  const assignment = {};
  consumerIds.forEach(id => { assignment[id] = []; });

  if (consumerIds.length === 0) return assignment;

  if (assignor === 'ROUND_ROBIN' || assignor === 'STICKY') {
    partitionIds.forEach((pId, idx) => {
      const consumerId = consumerIds[idx % consumerIds.length];
      assignment[consumerId].push(pId);
    });
  } else if (assignor === 'RANGE') {
    // Range assignor divides contiguous blocks of partitions
    const numPartitions = partitionIds.length;
    const numConsumers = consumerIds.length;
    const numPartitionsPerConsumer = Math.floor(numPartitions / numConsumers);
    const consumersWithExtra = numPartitions % numConsumers;

    let currentStart = 0;
    consumerIds.forEach((cId, i) => {
      const length = numPartitionsPerConsumer + (i < consumersWithExtra ? 1 : 0);
      assignment[cId] = partitionIds.slice(currentStart, currentStart + length);
      currentStart += length;
    });
  }

  return assignment;
}

/**
 * Simulates a Consumer Group Rebalance event (Eager vs. Cooperative Sticky)
 * @param {Object} params
 * @param {string} params.eventType 'CONSUMER_JOIN' | 'CONSUMER_CRASH' | 'TOPIC_SCALED'
 * @param {RebalanceStrategy} params.protocol 'EAGER' | 'COOPERATIVE_STICKY'
 * @param {number} params.partitionCount
 * @param {string[]} params.existingConsumers
 * @returns {{ protocol: RebalanceStrategy, event: string, isStopTheWorld: boolean, downtimeMs: number, revokedPartitionsCount: number, description: string }}
 */
export function simulateRebalanceEvent({ eventType, protocol, partitionCount, existingConsumers }) {
  const isEager = protocol === 'EAGER';

  // Eager revokes 100% of all assigned partitions causing a cluster-wide Stop-The-World
  const revokedPartitionsCount = isEager
    ? partitionCount
    : Math.max(1, Math.round(partitionCount / (existingConsumers.length + 1)));

  // Cooperative Sticky takes only tens of ms for incremental handoff, Eager takes seconds
  const downtimeMs = isEager ? 3500 : 45;

  const description = isEager
    ? 'Eager Rebalance Protocol: Alle Consumer geben zeitgleich alle Partitionen ab (Stop-The-World). Kompletter Verarbeitungsstillstand bis alle Zuordnungen neu verhandelt sind.'
    : 'Cooperative Sticky Rebalance Protocol: Nur betroffene Partitionen werden schrittweise migriert. Nicht betroffene Consumer verarbeiten ihre Partitionen unterbrechungsfrei weiter.';

  return {
    protocol,
    event: eventType,
    isStopTheWorld: isEager,
    downtimeMs,
    revokedPartitionsCount,
    description
  };
}
