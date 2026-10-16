import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@vaadin/button";
import wizardStyles from "./ec-diagnosis-wizard.css?inline";
import { classifyDue, sortByDue, type DueState, type InspectionRecord } from "../utils/inspection-schedule";
import { showToast } from "../utils/toast";

const STATE_LABEL: Record<DueState, { icon: string; text: string; color: string }> = {
  overdue: { icon: "🔴", text: "Überfällig", color: "#dc2626" },
  "due-soon": { icon: "🟠", text: "Bald fällig", color: "#d97706" },
  ok: { icon: "🟢", text: "Im Plan", color: "#16a34a" },
};

/**
 * Übersicht der Prüffristen aller dokumentierten Prüfungen.
 * Events: inspection-removed {id}
 */
@customElement("ec-inspection-schedule")
export class EcInspectionSchedule extends LitElement {
  static styles = unsafeCSS(wizardStyles);

  @property({ attribute: false }) records: InspectionRecord[] = [];

  @state() private _notificationState: NotificationPermission | "unsupported" =
    typeof Notification === "undefined" ? "unsupported" : Notification.permission;

  private async _enableReminders() {
    if (typeof Notification === "undefined") return;
    this._notificationState = await Notification.requestPermission();
    if (this._notificationState === "granted") {
      showToast("Erinnerungen aktiv: Beim Öffnen der App werden fällige Prüfungen gemeldet.", "success", 5000);
    }
  }

  render() {
    if (this.records.length === 0) {
      return html`
        <div class="card" style="text-align: left;">
          <h3 class="m-0">🗓️ Prüffristen</h3>
          <p style="color: var(--text-secondary); font-size: 0.85rem;">
            Noch keine Prüfungen erfasst. Sobald du im Diagnose-Tab ein Protokoll mit Prüfintervall erstellst oder exportierst, erscheint
            das Gerät hier mit seiner nächsten Fälligkeit.
          </p>
        </div>
      `;
    }

    const sorted = sortByDue(this.records);
    const counts = sorted.reduce(
      (acc, r) => ({ ...acc, [classifyDue(r)]: acc[classifyDue(r)] + 1 }),
      { overdue: 0, "due-soon": 0, ok: 0 } as Record<DueState, number>,
    );

    return html`
      <div class="card" style="text-align: left;">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
          <h3 class="m-0">🗓️ Prüffristen</h3>
          ${this._notificationState === "default"
            ? html`<vaadin-button theme="tertiary" @click="${this._enableReminders}">🔔 Erinnerung aktivieren</vaadin-button>`
            : ""}
        </div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 8px 0;">
          ${counts.overdue} überfällig · ${counts["due-soon"]} in den nächsten 30 Tagen fällig · ${counts.ok} im Plan
        </p>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${sorted.map((r) => {
            const label = STATE_LABEL[classifyDue(r)];
            return html`
              <div style="display: flex; justify-content: space-between; gap: 8px; align-items: center; padding: 8px 10px; background: var(--bg-app); border: 1px solid var(--border); border-radius: 6px;">
                <div>
                  <strong>${r.deviceName}</strong>${r.inventoryNumber ? html` <span style="color: var(--text-muted);">(${r.inventoryNumber})</span>` : ""}
                  <div style="font-size: 0.8rem; color: var(--text-secondary);">
                    ${r.location ? html`${r.location} · ` : ""}geprüft ${new Date(r.inspectedAt).toLocaleDateString("de-DE")} · ${r.status}
                  </div>
                </div>
                <div style="display: flex; gap: 8px; align-items: center; white-space: nowrap;">
                  <span style="color: ${label.color}; font-weight: bold; font-size: 0.85rem;">${label.icon} ${label.text} · ${r.nextInspection}</span>
                  <vaadin-button
                    theme="tertiary error"
                    aria-label="Eintrag entfernen"
                    @click="${() => this.dispatchEvent(new CustomEvent("inspection-removed", { detail: { id: r.id } }))}"
                    >✕</vaadin-button
                  >
                </div>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-inspection-schedule": EcInspectionSchedule;
  }
}
