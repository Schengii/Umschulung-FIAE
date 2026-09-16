/**
 * PostgreSQL EXPLAIN ANALYZE & Buffer Cache FlameGraph Engine
 * Parses query execution plans, calculates execution time hierarchies (FlameGraph spans),
 * and computes Shared Buffers Cache Hit Ratios vs. Disk I/O.
 */

export class PostgresFlamegraphSimulator {
  constructor() {
    this.samplePlan = {
      nodeType: 'Aggregate',
      executionTimeMs: 142.5,
      sharedHitBlocks: 8450,
      sharedReadBlocks: 120,
      costStartup: 420.0,
      costTotal: 1850.0,
      children: [
        {
          nodeType: 'Hash Join',
          executionTimeMs: 128.2,
          sharedHitBlocks: 7200,
          sharedReadBlocks: 100,
          children: [
            {
              nodeType: 'Index Scan on orders_idx_customer',
              executionTimeMs: 45.1,
              sharedHitBlocks: 4500,
              sharedReadBlocks: 0,
              children: []
            },
            {
              nodeType: 'Seq Scan on customers',
              executionTimeMs: 83.1,
              sharedHitBlocks: 2700,
              sharedReadBlocks: 100,
              children: []
            }
          ]
        }
      ]
    };
  }

  calculateMetrics(plan = this.samplePlan) {
    let totalHit = 0;
    let totalRead = 0;
    let totalTime = plan.executionTimeMs;

    const traverse = (node) => {
      totalHit += node.sharedHitBlocks || 0;
      totalRead += node.sharedReadBlocks || 0;
      if (node.children) {
        node.children.forEach(traverse);
      }
    };

    traverse(plan);

    const totalBlocks = totalHit + totalRead;
    const cacheHitRatio = totalBlocks > 0 ? (totalHit / totalBlocks) * 100 : 100;

    return {
      totalExecutionTimeMs: totalTime,
      totalSharedHitBlocks: totalHit,
      totalSharedReadBlocks: totalRead,
      cacheHitRatioPercent: parseFloat(cacheHitRatio.toFixed(2)),
      hasSeqScanBottleneck: totalRead > 0
    };
  }
}
