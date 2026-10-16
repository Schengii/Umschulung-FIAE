import type { ReactiveController, ReactiveControllerHost } from "lit";
import type { DiagnosisResult } from "../services/ai-types";
import type { GeminiAIService } from "../services/gemini-services";
import {
  deleteQueuedAnalysis,
  getQueuedAnalyses,
  saveQueuedAnalysis,
  type QueuedAnalysisRecord,
} from "../utils/indexed-db";

const HISTORY_KEY = "electrocheck_history_v2";
/** Frühere Ablage der Warteschlange im localStorage (Bilder sprengten dort das Speicherlimit) */
const LEGACY_QUEUE_KEY = "electrocheck_queue";
const MAX_HISTORY = 10;

export type QueuedAnalysis = QueuedAnalysisRecord;

/**
 * Diagnosehistorie (letzte 10, localStorage) und Warteschlange für Analysen, die offline angestoßen
 * wurden (IndexedDB, da Data-URL-Bilder zu groß für den localStorage sind).
 */
export class HistoryController implements ReactiveController {
  history: DiagnosisResult[] = [];
  offlineQueue: QueuedAnalysis[] = [];

  constructor(private readonly host: ReactiveControllerHost) {
    host.addController(this);
  }

  hostConnected(): void {
    // Laden erfolgt explizit über load()
  }

  async load(): Promise<void> {
    try {
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      if (savedHistory) this.history = JSON.parse(savedHistory);
    } catch (e) {
      console.warn("LocalStorage-Verlauf konnte nicht geladen werden:", e);
    }
    this.host.requestUpdate();

    await this.migrateLegacyQueue();
    try {
      this.offlineQueue = await getQueuedAnalyses();
    } catch (e) {
      console.warn("Offline-Warteschlange konnte nicht geladen werden:", e);
    }
    this.host.requestUpdate();
  }

  /** Legt ein Ergebnis oben in der Historie ab; ein bereits enthaltenes (geändertes) Ergebnis wird nur neu gespeichert. */
  save(result: DiagnosisResult): void {
    if (!this.history.includes(result)) {
      this.history = [result, ...this.history.slice(0, MAX_HISTORY - 1)];
    }
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(this.history));
    } catch (e) {
      console.warn("Historie konnte nicht gespeichert werden:", e);
    }
    this.host.requestUpdate();
  }

  /** Reiht eine Analyse ein. Rückgabe false, wenn sie nicht dauerhaft gespeichert werden konnte (bleibt dann nur im Speicher). */
  async enqueue(item: Omit<QueuedAnalysis, "id">): Promise<boolean> {
    const entry: QueuedAnalysis = { ...item };
    this.offlineQueue = [...this.offlineQueue, entry];
    this.host.requestUpdate();
    try {
      entry.id = await saveQueuedAnalysis(item);
      return true;
    } catch (e) {
      console.warn("Offline-Analyse konnte nicht dauerhaft gespeichert werden:", e);
      return false;
    }
  }

  clearHistory(): void {
    this.history = [];
    this.host.requestUpdate();
  }

  /**
   * Überträgt die wartenden Analysen nacheinander. Bricht beim ersten Fehler ab
   * (vermutlich wieder offline). Rückgabe: Anzahl der noch wartenden Einträge.
   */
  async processQueue(ai: GeminiAIService): Promise<number> {
    for (const task of [...this.offlineQueue]) {
      try {
        const res = await ai.getDiagnosis(task.image, task.description);
        this.save(res);
        this.offlineQueue = this.offlineQueue.filter((item) => item !== task);
        this.host.requestUpdate();
        if (task.id !== undefined) await deleteQueuedAnalysis(task.id).catch(() => undefined);
      } catch (e) {
        console.warn("Fehler bei der Abarbeitung der Offline-Queue. Pausiere Übertragung.", e);
        break;
      }
    }
    return this.offlineQueue.length;
  }

  private async migrateLegacyQueue(): Promise<void> {
    try {
      const legacy = localStorage.getItem(LEGACY_QUEUE_KEY);
      if (!legacy) return;
      const items: Omit<QueuedAnalysis, "id">[] = JSON.parse(legacy);
      for (const item of items) await saveQueuedAnalysis(item);
      localStorage.removeItem(LEGACY_QUEUE_KEY);
    } catch (e) {
      console.warn("Alte Offline-Warteschlange konnte nicht übernommen werden:", e);
    }
  }
}
