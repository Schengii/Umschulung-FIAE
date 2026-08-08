import { DiagnosisResult } from './ai-types';
import { Network } from '@capacitor/network';

export class TicketService {
  private _getBackendUrl(): string {
    const savedUrl = localStorage.getItem("electrocheck_backend_url");
    return savedUrl ? savedUrl.trim() : "http://localhost:3000";
  }

  /**
   * Erstellt ein Wartungsticket im Backend. Wenn offline, wird das Ticket in einer lokalen Queue
   * in LocalStorage gespeichert und später synchronisiert, wenn die Verbindung zurückkehrt.
   */
  async createMaintenanceTicket(diagnosis: DiagnosisResult): Promise<string> {
    const status = await Network.getStatus();
    
    if (!status.connected) {
      // Offline -> Ticket lokal in Warteschlange einreihen
      const queueJson = localStorage.getItem("electrocheck_offline_tickets");
      const queue: DiagnosisResult[] = queueJson ? JSON.parse(queueJson) : [];
      queue.push(diagnosis);
      localStorage.setItem("electrocheck_offline_tickets", JSON.stringify(queue));
      
      throw new Error("Offline! Das Ticket wurde in der Offline-Warteschlange gespeichert und wird synchronisiert, sobald Sie wieder online sind.");
    }

    console.log("Sende Daten an Backend...", diagnosis);

    const backendUrl = this._getBackendUrl();
    const response = await fetch(`${backendUrl}/api/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(diagnosis)
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Fehler beim Erstellen des Tickets im Backend.");
    }

    const resData = await response.json();
    return resData.id;
  }

  /**
   * Synchronisiert alle offline gespeicherten Tickets, wenn die Verbindung wiederhergestellt ist.
   */
  async syncOfflineTickets(): Promise<number> {
    const queueJson = localStorage.getItem("electrocheck_offline_tickets");
    if (!queueJson) return 0;
    
    const queue: DiagnosisResult[] = JSON.parse(queueJson);
    if (queue.length === 0) return 0;

    console.log(`Synchronisiere ${queue.length} Offline-Ticket(s)...`);
    let syncedCount = 0;
    const backendUrl = this._getBackendUrl();

    for (const ticket of queue) {
      try {
        console.log(`Lade Ticket für ${ticket.deviceName} hoch...`);
        const response = await fetch(`${backendUrl}/api/tickets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(ticket)
        });
        if (response.ok) {
          syncedCount++;
        }
      } catch (e) {
        console.error("Fehler beim Synchronisieren eines Offline-Tickets:", e);
      }
    }

    // Warteschlange leeren
    localStorage.removeItem("electrocheck_offline_tickets");
    return syncedCount;
  }
}