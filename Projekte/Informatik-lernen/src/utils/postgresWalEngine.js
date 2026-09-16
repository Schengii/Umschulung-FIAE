/**
 * PostgreSQL WAL (Write-Ahead Logging) & LSN Replication Lag Engine
 * Calculates 64-bit Log Sequence Number (LSN) offsets, byte-level replication lag,
 * and simulates Synchronous vs. Asynchronous streaming replication and PITR.
 */

export class PostgresWalSimulator {
  constructor() {
    this.currentPrimaryLsn = '0/16B3748';
    this.currentStandbyLsn = '0/169A120';
  }

  lsnToBytes(lsn = '0/16B3748') {
    const parts = lsn.split('/');
    if (parts.length !== 2) return 0;
    const high = parseInt(parts[0], 16) || 0;
    const low = parseInt(parts[1], 16) || 0;
    return (high * 0x100000000) + low;
  }

  calculateLag(primaryLsn = this.currentPrimaryLsn, standbyLsn = this.currentStandbyLsn) {
    const primaryBytes = this.lsnToBytes(primaryLsn);
    const standbyBytes = this.lsnToBytes(standbyLsn);
    const lagBytes = Math.max(0, primaryBytes - standbyBytes);
    const lagMb = parseFloat((lagBytes / (1024 * 1024)).toFixed(3));

    return {
      primaryLsn,
      standbyLsn,
      primaryBytes,
      standbyBytes,
      lagBytes,
      lagMb,
      replayLagMs: Math.round(lagBytes / 1250), // Approx replay latency
      isSynchronized: lagBytes === 0
    };
  }
}
