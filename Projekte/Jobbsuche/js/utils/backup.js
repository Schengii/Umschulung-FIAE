/**
 * Data Backup & Snapshot Utility for JobMatch
 * Allows full export, auto-snapshotting in IndexedDB/LocalStorage, and restore/rollback functionality.
 */
import { storage } from '../storage.js';
import { db } from './db.js';

export const backupManager = {
    /**
     * Creates a complete data snapshot of LocalStorage & IndexedDB
     * @returns {Promise<Object>} Snapshot object
     */
    async createSnapshot(label = 'Manual Snapshot') {
        const jobs = storage.getJobs();
        const profile = storage.getProfile();
        const expenses = storage.getExpenses();
        const customColumns = storage.getCustomColumns();
        const rejectionHistory = storage.getRejectionHistory();
        const documents = await db.getAllDocuments().catch(() => []);

        const snapshot = {
            id: 'snapshot_' + Date.now(),
            createdAt: new Date().toISOString(),
            label,
            version: '2.0',
            data: {
                jobs,
                profile,
                expenses,
                customColumns,
                rejectionHistory,
                documentsMeta: documents.map(d => ({ id: d.id, name: d.name, type: d.type, size: d.size, date: d.date }))
            }
        };

        // Save snapshot to snapshot history in LocalStorage (keep last 5 snapshots)
        const history = this.getSnapshotHistory();
        history.unshift(snapshot);
        if (history.length > 5) history.pop();
        localStorage.setItem('jobmatch_snapshot_history', JSON.stringify(history));

        return snapshot;
    },

    /**
     * Gets stored snapshot history
     * @returns {Array}
     */
    getSnapshotHistory() {
        try {
            return JSON.parse(localStorage.getItem('jobmatch_snapshot_history') || '[]');
        } catch (e) {
            return [];
        }
    },

    /**
     * Restores data from a snapshot object
     * @param {Object} snapshot 
     */
    async restoreSnapshot(snapshot) {
        if (!snapshot || !snapshot.data) {
            throw new Error('Ungültiger Snapshot.');
        }

        if (snapshot.data.jobs) storage.saveJobs(snapshot.data.jobs);
        if (snapshot.data.profile) storage.saveProfile(snapshot.data.profile);
        if (snapshot.data.expenses) storage.saveExpenses(snapshot.data.expenses);
        if (snapshot.data.customColumns) storage.saveCustomColumns(snapshot.data.customColumns);
        if (snapshot.data.rejectionHistory) storage.saveRejectionHistory(snapshot.data.rejectionHistory);

        return true;
    }
};
