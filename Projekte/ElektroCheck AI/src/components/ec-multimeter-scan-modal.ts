import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@vaadin/button";
import "./ec-camera-capture";
import wizardStyles from "./ec-diagnosis-wizard.css?inline";

/**
 * Modal zum Abfotografieren eines Multimeter-Displays.
 * Events: photo-captured {image}, close
 */
@customElement("ec-multimeter-scan-modal")
export class EcMultimeterScanModal extends LitElement {
  static styles = unsafeCSS(wizardStyles);

  @property({ type: Boolean }) isLoading = false;

  private _close() {
    this.dispatchEvent(new CustomEvent("close"));
  }

  private _onPhoto(e: CustomEvent) {
    this.dispatchEvent(new CustomEvent("photo-captured", { detail: e.detail }));
  }

  render() {
    return html`
      <div class="modal-overlay" role="dialog" aria-modal="true" aria-label="Multimeter-Scan">
        <div class="card" style="max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">
          <h3 class="m-0" style="margin-bottom: 8px;">📸 Multimeter-Scan</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px;">
            Zentrieren Sie die Messwertanzeige des Multimeters auf dem Bildschirm. Die KI versucht den Wert automatisch abzulesen.
          </p>
          <ec-camera-capture
            .isLoading="${this.isLoading}"
            @photo-captured="${this._onPhoto}"
            @camera-stopped="${this._close}"
          ></ec-camera-capture>
          <div class="modal-actions" style="margin-top: 12px; justify-content: flex-end;">
            <vaadin-button theme="tertiary" @click="${this._close}">Schließen</vaadin-button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-multimeter-scan-modal": EcMultimeterScanModal;
  }
}
