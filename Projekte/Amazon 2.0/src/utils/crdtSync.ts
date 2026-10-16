// ============================================================
// Amazon 2.0 – Offline-First CRDT State Machine Engine
// ============================================================

export interface CRDTElement<T> {
  id: string;
  value: T;
  timestamp: number;
  authorNodeId: string;
  isDeleted: boolean;
}

export class CRDTObservedRemoveSet<T> {
  private elements: Map<string, CRDTElement<T>> = new Map();

  add(id: string, value: T, authorNodeId: string, timestamp: number = Date.now()): void {
    const existing = this.elements.get(id);
    if (!existing || existing.timestamp <= timestamp) {
      this.elements.set(id, { id, value, timestamp, authorNodeId, isDeleted: false });
    }
  }

  remove(id: string, authorNodeId: string, timestamp: number = Date.now()): void {
    const existing = this.elements.get(id);
    if (existing && existing.timestamp <= timestamp) {
      existing.isDeleted = true;
      existing.timestamp = timestamp;
      existing.authorNodeId = authorNodeId;
    }
  }

  read(): T[] {
    const result: T[] = [];
    for (const el of this.elements.values()) {
      if (!el.isDeleted) {
        result.push(el.value);
      }
    }
    return result;
  }

  merge(remoteSet: CRDTObservedRemoveSet<T>): void {
    for (const [id, remoteEl] of remoteSet.elements.entries()) {
      const localEl = this.elements.get(id);
      if (!localEl || remoteEl.timestamp > localEl.timestamp) {
        this.elements.set(id, { ...remoteEl });
      }
    }
  }

  getAllElements(): CRDTElement<T>[] {
    return Array.from(this.elements.values());
  }
}

export type NetworkMode = 'online' | 'offline' | 'unstable';

let currentNetworkMode: NetworkMode = 'online';

export function getNetworkMode(): NetworkMode {
  return currentNetworkMode;
}

export function setNetworkMode(mode: NetworkMode): void {
  currentNetworkMode = mode;
}
