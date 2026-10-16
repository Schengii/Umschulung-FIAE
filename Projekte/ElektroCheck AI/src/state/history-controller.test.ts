import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { HistoryController } from './history-controller';
import { getQueuedAnalyses } from '../utils/indexed-db';
import type { DiagnosisResult } from '../services/ai-types';
import type { GeminiAIService } from '../services/gemini-services';

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}

const host = { addController() {}, requestUpdate() {} } as never;

const result = (deviceName: string): DiagnosisResult => ({
  deviceName,
  identifiedDefect: 'x',
  recommendation: 'y',
  estimatedRepairCost: '1 €',
  repairDifficulty: 1,
  safetyLevel: 'SAFE',
  additionalTips: [],
  sparePartSearchTerm: '',
  customerExperience: '',
});

async function clearQueue() {
  const ctl = new HistoryController(host);
  await ctl.load();
  const ai = { getDiagnosis: async () => result('leer') } as unknown as GeminiAIService;
  await ctl.processQueue(ai);
}

describe('HistoryController', () => {
  beforeEach(async () => {
    (globalThis as { localStorage: unknown }).localStorage = new MemoryStorage();
    await clearQueue();
    (globalThis as { localStorage: unknown }).localStorage = new MemoryStorage(); // Spuren von clearQueue entfernen
  });

  it('legt neue Ergebnisse oben ab und begrenzt die Historie auf 10 Einträge', () => {
    const ctl = new HistoryController(host);
    for (let i = 0; i < 12; i++) ctl.save(result(`Gerät ${i}`));
    expect(ctl.history).toHaveLength(10);
    expect(ctl.history[0].deviceName).toBe('Gerät 11');
    expect(JSON.parse(localStorage.getItem('electrocheck_history_v2')!)).toHaveLength(10);
  });

  it('dupliziert ein bereits enthaltenes, geändertes Ergebnis nicht', () => {
    const ctl = new HistoryController(host);
    const entry = result('A');
    ctl.save(entry);
    ctl.save(result('B'));
    entry.identifiedDefect = 'geändert';
    ctl.save(entry);
    expect(ctl.history.map((h) => h.deviceName)).toEqual(['B', 'A']);
    expect(JSON.parse(localStorage.getItem('electrocheck_history_v2')!)[1].identifiedDefect).toBe('geändert');
  });

  it('lädt gespeicherte Historie', async () => {
    localStorage.setItem('electrocheck_history_v2', JSON.stringify([result('X')]));
    const ctl = new HistoryController(host);
    await ctl.load();
    expect(ctl.history[0].deviceName).toBe('X');
  });

  it('übernimmt die alte localStorage-Warteschlange nach IndexedDB', async () => {
    localStorage.setItem('electrocheck_queue', JSON.stringify([{ image: null, description: 'alt', timestamp: 5 }]));
    const ctl = new HistoryController(host);
    await ctl.load();
    expect(ctl.offlineQueue.map((q) => q.description)).toEqual(['alt']);
    expect(localStorage.getItem('electrocheck_queue')).toBeNull();
    expect(await getQueuedAnalyses()).toHaveLength(1);
  });

  it('speichert Warteschlange dauerhaft und überlebt einen Neustart', async () => {
    const first = new HistoryController(host);
    await first.load();
    expect(await first.enqueue({ image: 'data:image/jpeg;base64,AAA', description: 'eins', timestamp: 1 })).toBe(true);

    const second = new HistoryController(host);
    await second.load();
    expect(second.offlineQueue.map((q) => q.description)).toEqual(['eins']);
  });

  it('arbeitet die Warteschlange ab und bricht beim ersten Fehler ab', async () => {
    const ctl = new HistoryController(host);
    await ctl.load();
    await ctl.enqueue({ image: null, description: 'eins', timestamp: 1 });
    await ctl.enqueue({ image: null, description: 'zwei', timestamp: 2 });
    await ctl.enqueue({ image: null, description: 'drei', timestamp: 3 });

    let calls = 0;
    const ai = {
      getDiagnosis: async (_img: string | null, description: string) => {
        calls++;
        if (description === 'zwei') throw new Error('offline');
        return result(description);
      },
    } as unknown as GeminiAIService;

    const remaining = await ctl.processQueue(ai);
    expect(calls).toBe(2);
    expect(remaining).toBe(2);
    expect(ctl.history.map((h) => h.deviceName)).toEqual(['eins']);
    expect((await getQueuedAnalyses()).map((q) => q.description)).toEqual(['zwei', 'drei']);
  });
});
