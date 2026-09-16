/**
 * PostgreSQL Connection Pooling (PgBouncer) & SQL Transaction Isolation Engine
 * Simulates Session vs. Transaction vs. Statement pooling memory footprint & client queues,
 * and visualizes the SQL Isolation Level Anomaly Matrix.
 */

export class PostgresPoolSimulator {
  constructor(maxServerConnections = 20, maxClientConnections = 500) {
    this.maxServerConnections = maxServerConnections;
    this.maxClientConnections = maxClientConnections;
    this.poolMode = 'transaction'; // 'session' | 'transaction' | 'statement'
  }

  calculatePoolMetrics(activeClients = 300) {
    const clients = Math.min(this.maxClientConnections, Math.max(1, activeClients));

    let activeServerBackends = 0;
    let queuedClients = 0;
    let ramUsageDirectMb = clients * 10; // Postgres backend ~10MB per connection

    if (this.poolMode === 'session') {
      activeServerBackends = Math.min(this.maxServerConnections, clients);
      queuedClients = Math.max(0, clients - this.maxServerConnections);
    } else if (this.poolMode === 'transaction') {
      // Transaction pooling: multiplexed, ~1 server connection per 15 active transactions
      activeServerBackends = Math.min(this.maxServerConnections, Math.ceil(clients / 15));
      queuedClients = 0;
    } else {
      // Statement pooling
      activeServerBackends = Math.min(this.maxServerConnections, Math.ceil(clients / 30));
      queuedClients = 0;
    }

    const ramUsagePgBouncerMb = Math.round((activeServerBackends * 10) + (clients * 0.002));

    return {
      poolMode: this.poolMode,
      activeClients: clients,
      activeServerBackends,
      queuedClients,
      ramUsageDirectMb,
      ramUsagePgBouncerMb,
      ramSavedPercent: Math.round(((ramUsageDirectMb - ramUsagePgBouncerMb) / ramUsageDirectMb) * 100)
    };
  }
}

export const SQL_ISOLATION_LEVELS = [
  {
    level: 'READ UNCOMMITTED',
    dirtyRead: true,
    nonRepeatableRead: true,
    phantomRead: true,
    serializationAnomaly: true,
    postgresEquivalent: 'In PostgreSQL wie READ COMMITTED behandelt.'
  },
  {
    level: 'READ COMMITTED (PG Default)',
    dirtyRead: false,
    nonRepeatableRead: true,
    phantomRead: true,
    serializationAnomaly: true,
    postgresEquivalent: 'Sieht nur committete Daten vor jedem Query-Start.'
  },
  {
    level: 'REPEATABLE READ',
    dirtyRead: false,
    nonRepeatableRead: false,
    phantomRead: false, // In Postgres MVCC Snapshot Isolation verhindert auch Phantoms
    serializationAnomaly: true,
    postgresEquivalent: 'Snapshot Isolation: Sieht konsistenten Zustand bei Transaktionsstart.'
  },
  {
    level: 'SERIALIZABLE',
    dirtyRead: false,
    nonRepeatableRead: false,
    phantomRead: false,
    serializationAnomaly: false,
    postgresEquivalent: 'SSI (Serializable Snapshot Isolation) mit Abort bei Schreibkonflikten (40001).'
  }
];
