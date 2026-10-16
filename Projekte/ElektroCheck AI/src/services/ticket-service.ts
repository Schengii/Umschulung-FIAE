import { withAccessToken } from '../utils/auth-headers';
import { fetchWithTimeout } from '../utils/fetch-timeout';
import { DiagnosisResult } from './ai-types';
import { Network } from '@capacitor/network';
import { saveOfflineTicket, getOfflineTickets, deleteOfflineTicket } from '../utils/indexed-db';

/** Früheres Queue-Format (nur noch Notfall-Fallback und Migration alter Einträge). */
const LEGACY_QUEUE_KEY = "electrocheck_offline_tickets";

export class TicketService {
  private _getBackendUrl(): string {
    const savedUrl = localStorage.getItem("electrocheck_backend_url");
    return savedUrl ? savedUrl.trim() : "";
  }

  /**
   * Erstellt ein Wartungsticket im Backend. Wenn offline, wird das Ticket in der lokalen Queue
   * (IndexedDB, nur bei Ausfall LocalStorage) gespeichert und automatisch synchronisiert.
   */
  async createMaintenanceTicket(diagnosis: DiagnosisResult): Promise<string> {
    const status = await Network.getStatus();

    if (!status.connected) {
      await this._enqueueOffline(diagnosis);
      throw new Error("Offline! Das Ticket wurde in der Offline-Warteschlange gespeichert und wird synchronisiert, sobald Sie wieder online sind.");
    }

    const response = await fetchWithTimeout(`${this._getBackendUrl()}/api/tickets`, {
      method: "POST",
      headers: withAccessToken({ "Content-Type": "application/json" }),
      body: JSON.stringify(diagnosis)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Fehler beim Erstellen des Tickets im Backend.");
    }

    const resData = await response.json();
    return resData.id;
  }

  /** IndexedDB ist der Speicher der Wahl (große Fotos); LocalStorage nur als Notfall-Fallback. */
  private async _enqueueOffline(diagnosis: DiagnosisResult): Promise<void> {
    try {
      await saveOfflineTicket({ ...diagnosis, queuedAt: new Date().toISOString() });
      return;
    } catch (err) {
      console.warn("IndexedDB Ticket-Queue fehlgeschlagen, Fallback auf LocalStorage:", err);
    }
    try {
      const queue = this._readLegacyQueue();
      queue.push(diagnosis);
      localStorage.setItem(LEGACY_QUEUE_KEY, JSON.stringify(queue));
    } catch (err) {
      console.error("Offline-Ticket konnte nicht gespeichert werden:", err);
      throw new Error("Offline! Das Ticket konnte nicht zwischengespeichert werden (Speicher voll oder gesperrt).");
    }
  }

  private _readLegacyQueue(): DiagnosisResult[] {
    try {
      const raw = localStorage.getItem(LEGACY_QUEUE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? (parsed as DiagnosisResult[]) : [];
    } catch {
      return [];
    }
  }

  private async _upload(ticket: object): Promise<boolean> {
    const response = await fetchWithTimeout(`${this._getBackendUrl()}/api/tickets`, {
      method: "POST",
      headers: withAccessToken({ "Content-Type": "application/json" }),
      body: JSON.stringify(ticket)
    });
    return response.ok;
  }

  /**
   * Synchronisiert alle offline gespeicherten Tickets, wenn die Verbindung wiederhergestellt ist.
   * Jedes Ticket wird einzeln aus der Queue entfernt, sobald es übertragen wurde; Fehlgeschlagene bleiben erhalten.
   * Alte Einträge aus dem früheren LocalStorage-Format werden dabei mit übertragen.
   */
  async syncOfflineTickets(): Promise<number> {
    let syncedCount = 0;

    const idbTickets = await getOfflineTickets();
    for (const entry of idbTickets) {
      const { id, queuedAt, ...ticket } = entry;
      void queuedAt;
      try {
        if (await this._upload(ticket)) {
          await deleteOfflineTicket(id);
          syncedCount++;
        }
      } catch (e) {
        console.error("Fehler beim Synchronisieren eines Offline-Tickets:", e);
      }
    }

    const legacy = this._readLegacyQueue();
    if (legacy.length > 0) {
      const remaining: DiagnosisResult[] = [];
      for (const ticket of legacy) {
        try {
          if (await this._upload(ticket)) syncedCount++;
          else remaining.push(ticket);
        } catch (e) {
          console.error("Fehler beim Synchronisieren eines Offline-Tickets:", e);
          remaining.push(ticket);
        }
      }
      try {
        if (remaining.length === 0) localStorage.removeItem(LEGACY_QUEUE_KEY);
        else localStorage.setItem(LEGACY_QUEUE_KEY, JSON.stringify(remaining));
      } catch {
        // Speicher nicht verfügbar – Rest bleibt bis zum nächsten Versuch
      }
    }

    return syncedCount;
  }

  /**
   * Ruft die Liste der Tickets vom Backend ab.
   */
  async getTickets(options?: { limit?: number; page?: number }): Promise<Ticket[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.page) params.set("page", String(options.page));
    const qs = params.toString() ? `?${params.toString()}` : "";

    const response = await fetchWithTimeout(`${this._getBackendUrl()}/api/tickets${qs}`, {
      method: "GET",
      headers: withAccessToken()
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Fehler beim Laden der Tickets.");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.tickets || []);
  }

  /**
   * Aktualisiert ein bestehendes Ticket im Backend.
   */
  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket> {
    if (!id) throw new Error("Ticket-ID erforderlich.");

    const response = await fetchWithTimeout(`${this._getBackendUrl()}/api/tickets/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: withAccessToken({ "Content-Type": "application/json" }),
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Fehler beim Aktualisieren des Tickets ${id}.`);
    }

    return await response.json();
  }

  /**
   * Löscht ein Ticket im Backend.
   */
  async deleteTicket(id: string): Promise<boolean> {
    if (!id) throw new Error("Ticket-ID erforderlich.");

    const response = await fetchWithTimeout(`${this._getBackendUrl()}/api/tickets/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: withAccessToken()
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Fehler beim Löschen des Tickets ${id}.`);
    }

    return true;
  }
}

export interface Ticket extends Partial<DiagnosisResult> {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  ownerEmail?: string;
  assignedTo?: string;
  status?: string;
  [key: string]: unknown;
}
