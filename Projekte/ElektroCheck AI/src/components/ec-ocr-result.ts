import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@vaadin/button";
import wizardStyles from "./ec-diagnosis-wizard.css?inline";
import type { TypePlateResult } from "../services/ai-types";

/** Ergebnis des Typenschild-Scans mit Datenblatt-Links. Löst "open-datasheet" aus. */
@customElement("ec-ocr-result")
export class EcOcrResult extends LitElement {
  static styles = unsafeCSS(wizardStyles);

  @property({ attribute: false }) result: TypePlateResult | null = null;
  @property({ type: Boolean }) hasOfflineDatasheet = false;

  render() {
    if (!this.result) return html``;

    return html`
      <div class="card ocr-card mt-1">
        <h3 class="m-0">🔍 ${this.result.componentName}</h3>
        <p>${this.result.extractedText}</p>

        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;">
          <a
            href="${this.result.datasheetSearchUrl}"
            target="_blank"
            rel="noopener noreferrer"
            class="no-underline"
            style="flex: 1; min-width: 120px;"
          >
            <vaadin-button theme="secondary" style="width: 100%;">🌐 Datenblatt suchen</vaadin-button>
          </a>

          ${this.hasOfflineDatasheet
            ? html`
                <vaadin-button
                  theme="primary success"
                  @click="${() => this.dispatchEvent(new CustomEvent("open-datasheet"))}"
                  style="flex: 1; min-width: 120px;"
                >
                  📄 Offline-Datenblatt öffnen
                </vaadin-button>
              `
            : ""}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-ocr-result": EcOcrResult;
  }
}
