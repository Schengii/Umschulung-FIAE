import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@vaadin/button";
import wizardStyles from "./ec-diagnosis-wizard.css?inline";

/** Modal mit PDF-Vorschau (auf iOS nur Download-Link). Löst "close" aus. */
@customElement("ec-pdf-preview")
export class EcPdfPreview extends LitElement {
  static styles = unsafeCSS(wizardStyles);

  @property({ type: String }) url = "";

  render() {
    return html`
      <div class="modal-overlay" role="dialog" aria-modal="true" aria-label="PDF-Protokoll Vorschau">
        <div class="card pdf-modal-card">
          <h3 class="m-0">📄 PDF Protokoll Vorschau</h3>
          ${/iPad|iPhone|iPod/.test(navigator.userAgent)
            ? html`
                <p style="text-align:center; color: var(--text-secondary); margin: 1rem 0;">
                  PDF-Vorschau wird auf iOS nicht unterstützt. Bitte laden Sie das PDF herunter.
                </p>
                <a href="${this.url}" download="Protokoll.pdf" style="display:block; text-align:center;">
                  <vaadin-button theme="primary success" style="width:100%">📥 PDF herunterladen</vaadin-button>
                </a>
              `
            : html`<iframe src="${this.url}" class="pdf-iframe"></iframe>`}
          <div class="modal-actions">
            <vaadin-button theme="primary" @click="${() => this.dispatchEvent(new CustomEvent("close"))}"
              >Schließen</vaadin-button
            >
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-pdf-preview": EcPdfPreview;
  }
}
