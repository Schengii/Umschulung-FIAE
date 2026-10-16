import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import wizardStyles from "./ec-diagnosis-wizard.css?inline";
import type { DiagnosisResult } from "../services/ai-types";

/** Liste der letzten Diagnosen. Löst "history-selected" {result} aus. */
@customElement("ec-history-list")
export class EcHistoryList extends LitElement {
  static styles = unsafeCSS(wizardStyles);

  @property({ attribute: false }) history: DiagnosisResult[] = [];

  render() {
    if (this.history.length === 0) return html``;

    return html`
      <div class="history-section mt-1-5">
        <div class="history-header">🗂️ Letzte Diagnosen</div>
        ${this.history.map(
          (h) => html`
            <div
              class="history-item"
              @click="${() => this.dispatchEvent(new CustomEvent("history-selected", { detail: { result: h } }))}"
            >
              <span class="history-title">${h.deviceName}</span>
              <span class="history-defect">${h.identifiedDefect}</span>
            </div>
          `,
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-history-list": EcHistoryList;
  }
}
