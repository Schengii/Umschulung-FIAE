import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@vaadin/text-field";
import "@vaadin/button";
import "./ec-signature-pad";

@customElement("ec-dguv-form")
export class EcDguvForm extends LitElement {
  @property({ type: String }) rPe = "";
  @property({ type: String }) rIso = "";
  @property({ type: String }) iLeak = "";
  @property({ type: Boolean }) isScanning = false;
  
  @state() private _signatureUrl: string | null = null;

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
    .dguv-container {
      margin: 1.5rem 0;
      padding: 1.25rem;
      background: var(--bg-app, #f1f5f9);
      border-radius: var(--radius-s, 8px);
      border: 1px solid var(--border, #64748b);
      text-align: left;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 0.75rem;
    }
    h4 {
      margin: 0;
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .subtitle {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin: 0 0 1rem 0;
    }
    .grid-inputs {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 8px;
      margin-bottom: 1rem;
    }
    .result-badge {
      padding: 10px;
      border-radius: 6px;
      border: 1px solid var(--border);
      margin-top: 10px;
    }
    .passed {
      background: var(--success-glow, rgba(11, 138, 90, 0.15));
      border: 1.5px solid var(--success, #0b8a5a);
    }
    .failed {
      background: var(--danger-glow, rgba(220, 38, 38, 0.15));
      border: 3.5px dashed var(--danger, #dc2626);
    }
    .signature-section {
      margin-top: 1rem;
      border-top: 1px solid var(--border);
      padding-top: 1rem;
    }
    .signature-title {
      font-size: 0.85rem;
      font-weight: bold;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    /* Dyslexie (LRS) Lese-Hilfe Support */
    :host-context(.accessible-reading) p,
    :host-context(.accessible-reading) span,
    :host-context(.accessible-reading) div,
    :host-context(.accessible-reading) label,
    :host-context(.accessible-reading) input,
    :host-context(.accessible-reading) vaadin-text-field {
      word-spacing: 0.15em !important;
      letter-spacing: 0.05em !important;
      line-height: 1.75 !important;
    }
  `;

  private _getDguvStatus() {
    const details: string[] = [];
    let passed = true;

    if (this.rPe.trim()) {
      const val = parseFloat(this.rPe.replace(",", "."));
      if (isNaN(val)) {
        details.push("R_PE: Ungültiger Wert");
        passed = false;
      } else if (val > 0.3) {
        details.push(`R_PE: ${val} Ω (> 0.3 Ω Grenzwert) ❌`);
        passed = false;
      } else {
        details.push(`R_PE: ${val} Ω (≤ 0.3 Ω) ✅`);
      }
    }

    if (this.rIso.trim()) {
      const val = parseFloat(this.rIso.replace(",", "."));
      if (isNaN(val)) {
        details.push("R_ISO: Ungültiger Wert");
        passed = false;
      } else if (val < 1.0) {
        details.push(`R_ISO: ${val} MΩ (< 1.0 MΩ Grenzwert) ❌`);
        passed = false;
      } else {
        details.push(`R_ISO: ${val} MΩ (≥ 1.0 MΩ) ✅`);
      }
    }

    if (this.iLeak.trim()) {
      const val = parseFloat(this.iLeak.replace(",", "."));
      if (isNaN(val)) {
        details.push("I_leak: Ungültiger Wert");
        passed = false;
      } else if (val > 3.5) {
        details.push(`Ableitstrom: ${val} mA (> 3.5 mA Grenzwert) ❌`);
        passed = false;
      } else {
        details.push(`Ableitstrom: ${val} mA (≤ 3.5 mA) ✅`);
      }
    }

    const hasAny = this.rPe.trim() || this.rIso.trim() || this.iLeak.trim();
    if (!hasAny) {
      return { passed: true, message: "Keine Messdaten", details: [] };
    }

    return {
      passed,
      message: passed ? "BESTANDEN" : "NICHT BESTANDEN",
      details,
    };
  }

  private _handleValueChange(field: "rPe" | "rIso" | "iLeak", value: string) {
    if (field === "rPe") this.rPe = value;
    if (field === "rIso") this.rIso = value;
    if (field === "iLeak") this.iLeak = value;

    this._notifyChange();
  }

  private _handleSignatureChanged(e: CustomEvent) {
    this._signatureUrl = e.detail.dataUrl;
    this._notifyChange();
  }

  private _requestMultimeterScan() {
    this.dispatchEvent(new CustomEvent("scan-multimeter-requested"));
  }

  private _notifyChange() {
    const statusObj = this._getDguvStatus();
    this.dispatchEvent(
      new CustomEvent("dguv-changed", {
        detail: {
          rPe: this.rPe,
          rIso: this.rIso,
          iLeak: this.iLeak,
          signatureUrl: this._signatureUrl,
          passed: statusObj.passed,
          status: statusObj.message,
          details: statusObj.details,
        },
      })
    );
  }

  render() {
    const statusObj = this._getDguvStatus();
    const hasAny = this.rPe.trim() || this.rIso.trim() || this.iLeak.trim();

    return html`
      <div class="dguv-container">
        <div class="header-row">
          <h4>📋 DGUV V3 / VDE 0701-0702 Prüfassistent</h4>
          <vaadin-button
            theme="secondary success"
            @click="${this._requestMultimeterScan}"
            ?disabled="${this.isScanning}"
            style="min-height: auto; height: 30px; font-size: 0.8rem;"
          >
            ${this.isScanning ? "⏳ Scannen..." : "📸 Messwert-Scan"}
          </vaadin-button>
        </div>
        <p class="subtitle">Sicherheitsmesswerte (ortsveränderliche Geräte):</p>

        <div class="grid-inputs">
          <vaadin-text-field
            label="R_PE (Ω)"
            placeholder="≤ 0.3"
            .value="${this.rPe}"
            @value-changed="${(e: CustomEvent) =>
              this._handleValueChange("rPe", e.detail.value)}"
          ></vaadin-text-field>
          <vaadin-text-field
            label="R_ISO (MΩ)"
            placeholder="≥ 1.0"
            .value="${this.rIso}"
            @value-changed="${(e: CustomEvent) =>
              this._handleValueChange("rIso", e.detail.value)}"
          ></vaadin-text-field>
          <vaadin-text-field
            label="Ableitstrom (mA)"
            placeholder="≤ 3.5"
            .value="${this.iLeak}"
            @value-changed="${(e: CustomEvent) =>
              this._handleValueChange("iLeak", e.detail.value)}"
          ></vaadin-text-field>
        </div>

        ${hasAny
          ? html`
              <div class="result-badge ${statusObj.passed ? "passed" : "failed"}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong style="font-size: 0.9rem;">Gesamturteil:</strong>
                  <span
                    style="font-weight: 800; font-size: 1rem; color: ${statusObj.passed
                      ? "var(--success, #0b8a5a)"
                      : "var(--danger, #dc2626)"};"
                  >
                    ${statusObj.message}
                  </span>
                </div>
                <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 0.85rem; color: var(--text-secondary);">
                  ${statusObj.details.map((d) => html`<li>${d}</li>`)}
                </ul>
              </div>
            `
          : html`
              <div style="font-size: 0.85rem; color: var(--text-muted); font-style: italic; text-align: center;">
                Keine Messdaten eingetragen (optional)
              </div>
            `}

        <div class="signature-section">
          <div class="signature-title">✍️ Digitale Unterschrift der Prüffachkraft</div>
          <ec-signature-pad @signature-changed="${this._handleSignatureChanged}"></ec-signature-pad>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-dguv-form": EcDguvForm;
  }
}
