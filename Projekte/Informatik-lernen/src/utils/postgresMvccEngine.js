/**
 * PostgreSQL MVCC, Tuple Headers & Autovacuum Engine
 * Simulates Tuple versions (xmin, xmax, t_ctid), Dead Tuple generation,
 * Table Bloat, and Autovacuum trigger threshold calculations.
 */

export class PostgresMvccSimulator {
  constructor(initialTuples = 50000) {
    this.reltuples = initialTuples;
    this.deadTuples = 2500;
    this.vacuumThreshold = 50;
    this.vacuumScaleFactor = 0.2; // 20%
    this.tableDiskSizeMb = 45.0;
    this.tuples = [
      { id: 101, xmin: 5040, xmax: 0, ctid: '(0,1)', status: 'LIVE', value: 'Active User Alice' },
      { id: 102, xmin: 5041, xmax: 5055, ctid: '(0,3)', status: 'DEAD (Updated)', value: 'Bob Old Email' },
      { id: 102, xmin: 5055, xmax: 0, ctid: '(0,3)', status: 'LIVE (Current)', value: 'Bob New Email' }
    ];
  }

  getAutovacuumThreshold() {
    return Math.round(this.vacuumThreshold + (this.vacuumScaleFactor * this.reltuples));
  }

  executeDml(operation = 'UPDATE', count = 2000) {
    const safeCount = Math.max(10, count);

    if (operation === 'UPDATE') {
      this.deadTuples += safeCount;
      this.tableDiskSizeMb += (safeCount * 0.0008);
    } else if (operation === 'DELETE') {
      this.deadTuples += safeCount;
      this.reltuples = Math.max(0, this.reltuples - safeCount);
    } else if (operation === 'INSERT') {
      this.reltuples += safeCount;
      this.tableDiskSizeMb += (safeCount * 0.0008);
    }

    const threshold = this.getAutovacuumThreshold();
    const shouldAutovacuum = this.deadTuples >= threshold;

    return {
      operation,
      count: safeCount,
      reltuples: this.reltuples,
      deadTuples: this.deadTuples,
      threshold,
      shouldAutovacuum,
      tableDiskSizeMb: parseFloat(this.tableDiskSizeMb.toFixed(2))
    };
  }

  runVacuum(isFull = false) {
    const deadReclaimed = this.deadTuples;
    this.deadTuples = 0;

    if (isFull) {
      // VACUUM FULL rewrites entire table and shrinks disk size
      this.tableDiskSizeMb = parseFloat((this.reltuples * 0.0007).toFixed(2));
      return {
        type: 'VACUUM FULL',
        deadReclaimed,
        lockType: 'AccessExclusiveLock (Blocks Reads/Writes)',
        newTableSizeMb: this.tableDiskSizeMb,
        description: 'Vollständiges Tabellen-Rewrite auf Disk. Gibt Speicherplatz an das Betriebssystem zurück.'
      };
    } else {
      // Normal VACUUM marks space in FSM for future inserts
      return {
        type: 'VACUUM (Standard)',
        deadReclaimed,
        lockType: 'ShareUpdateExclusiveLock (Online, Non-blocking)',
        newTableSizeMb: this.tableDiskSizeMb,
        description: 'Bereinigt Dead Tuples in Free Space Map (FSM) für künftige INSERTs, Dateigröße bleibt unverändert.'
      };
    }
  }
}
