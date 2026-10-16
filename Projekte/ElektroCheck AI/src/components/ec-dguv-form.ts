import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@vaadin/text-field";
import "@vaadin/button";
import "./ec-signature-pad";
import {
  evaluateDguvV3,
  type ProtectionClass,
  type DguvEvaluationResult,
} from "../utils/dguv-evaluator";
import { parseTesterFile } from "../utils/tester-importer";
import { showToast } from "../utils/toast";
import { getErrorMessage } from "../utils/error";

@customElement("ec-dguv-form")
export class EcDguvForm extends LitElement {
  @property({ type: String }) rPe = "";
  @property({ type: String }) rIso = "";
  @property({ type: String }) iLeak = "";
  @property({ type: String }) iTouch = "";
  @property({ type: Boolean }) isScanning = false;

  @state() private _protectionClass: ProtectionClass = "SK_I";
  @state() private _cableLengthMeters: number = 0;
  @state() private _isHeatingElement: boolean = false;
  @state() private _inspectionIntervalMonths: number = 12;
  @state() private _signatureUrl: string | null = null;
  @state() private _equipmentName: string = "";
  @state() private _inventoryNumber: string = "";
  // Felder für ortsfeste Anlagen
  @state() private _rcdTripTimeMs: string = "";
  @state() private _rcdTripCurrentMa: string = "";
  @state() private _loopImpedanceZs: string = "";
  @state() private _mcbRatingA: number = 16;
  @state() private _mcbChar: 'B' | 'C' | 'D' = 'B';

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

    .class-selector {
      display: flex;
      gap: 8px;
      margin-bottom: 1rem;
    }
    .class-btn {
      flex: 1;
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid var(--border, #cbd5e1);
      background: var(--bg-card, #ffffff);
      color: var(--text-primary);
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
      transition: all 0.2s ease;
      text-align: center;
    }
    .class-btn.active {
      background: var(--accent-primary, #0284c7);
      color: #ffffff;
      border-color: var(--accent-primary, #0284c7);
      box-shadow: 0 0 10px rgba(2, 132, 199, 0.3);
    }

    .grid-inputs {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 1rem;
    }

    .options-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
      margin-bottom: 1rem;
      background: rgba(0, 0, 0, 0.03);
      padding: 10px;
      border-radius: 6px;
      font-size: 0.85rem;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      font-weight: 500;
    }

    .result-badge {
      padding: 14px;
      border-radius: 8px;
      border: 1px solid var(--border);
      margin-top: 1rem;
    }
    .passed {
      background: var(--success-glow, rgba(11, 138, 90, 0.15));
      border: 1.5px solid var(--success, #0b8a5a);
    }
    .failed {
      background: var(--danger-glow, rgba(220, 38, 38, 0.15));
      border: 2px dashed var(--danger, #dc2626);
    }

    .dguv-seal {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 16px;
      background: #0b8a5a;
      color: #ffffff;
      border-radius: 30px;
      font-weight: bold;
      font-size: 0.85rem;
      box-shadow: 0 4px 12px rgba(11, 138, 90, 0.3);
      margin-top: 10px;
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
  `;

  private _getEvaluation(): DguvEvaluationResult {
    return evaluateDguvV3({
      protectionClass: this._protectionClass,
      rPe: this.rPe,
      cableLengthMeters: this._cableLengthMeters,
      rIso: this.rIso,
      isHeatingElement: this._isHeatingElement,
      iLeak: this.iLeak,
      iTouch: this.iTouch,
      inspectionIntervalMonths: this._inspectionIntervalMonths,
      rcdTripTimeMs: this._rcdTripTimeMs,
      rcdTripCurrentMa: this._rcdTripCurrentMa,
      loopImpedanceZs: this._loopImpedanceZs,
      mcbRatingA: this._mcbRatingA,
      mcbChar: this._mcbChar,
    });
  }

  private _handleClassChange(pc: ProtectionClass) {
    this._protectionClass = pc;
    this._notifyChange();
  }

  private _handleValueChange(
    field: "rPe" | "rIso" | "iLeak" | "iTouch" | "equipmentName" | "inventoryNumber" | "rcdTripTimeMs" | "rcdTripCurrentMa" | "loopImpedanceZs",
    value: string
  ) {
    if (field === "rPe") this.rPe = value;
    if (field === "rIso") this.rIso = value;
    if (field === "iLeak") this.iLeak = value;
    if (field === "iTouch") this.iTouch = value;
    if (field === "equipmentName") this._equipmentName = value;
    if (field === "inventoryNumber") this._inventoryNumber = value;
    if (field === "rcdTripTimeMs") this._rcdTripTimeMs = value;
    if (field === "rcdTripCurrentMa") this._rcdTripCurrentMa = value;
    if (field === "loopImpedanceZs") this._loopImpedanceZs = value;

    this._notifyChange();
  }

  private _handleSignatureChanged(e: CustomEvent) {
    this._signatureUrl = e.detail.dataUrl;
    this._notifyChange();
  }

  private _requestMultimeterScan() {
    this.dispatchEvent(new CustomEvent("scan-multimeter-requested"));
  }

  private async _handleTesterFileUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    try {
      const text = await file.text();
      const result = parseTesterFile(text);
      if (!result.measurements || result.measurements.length === 0) {
        showToast("Keine gültigen Messdatensätze in der Datei gefunden.", "warning");
        return;
      }

      // Nimm den ersten Datensatz für das aktuelle Formular
      const rec = result.measurements[0];
      if (rec.name && !this._equipmentName) this._equipmentName = rec.name;
      if (rec.circuitNumber && !this._inventoryNumber) this._inventoryNumber = rec.circuitNumber;
      if (rec.rPe !== undefined && rec.rPe !== '') this.rPe = String(rec.rPe);
      if (rec.rIso !== undefined && rec.rIso !== '') this.rIso = String(rec.rIso);
      if (rec.rcdTripTimeMs !== undefined && rec.rcdTripTimeMs !== '') this._rcdTripTimeMs = String(rec.rcdTripTimeMs);
      if (rec.rcdTripCurrentMa !== undefined && rec.rcdTripCurrentMa !== '') this._rcdTripCurrentMa = String(rec.rcdTripCurrentMa);
      if (rec.loopImpedanceZs !== undefined && rec.loopImpedanceZs !== '') this._loopImpedanceZs = String(rec.loopImpedanceZs);

      this._notifyChange();
      this.requestUpdate();

      showToast(`Messdaten erfolgreich importiert (${result.deviceType})! ${result.measurements.length} Messung(en) geladen.`, "success");
    } catch (err) {
      showToast(`Fehler beim Einlesen: ${getErrorMessage(err)}`, "error");
    } finally {
      input.value = "";
    }
  }

  private _notifyChange() {
    const evalRes = this._getEvaluation();
    this.dispatchEvent(
      new CustomEvent("dguv-changed", {
        detail: {
          protectionClass: this._protectionClass,
          rPe: this.rPe,
          rIso: this.rIso,
          iLeak: this.iLeak,
          iTouch: this.iTouch,
          rcdTripTimeMs: this._rcdTripTimeMs,
          rcdTripCurrentMa: this._rcdTripCurrentMa,
          loopImpedanceZs: this._loopImpedanceZs,
          mcbRatingA: this._mcbRatingA,
          mcbChar: this._mcbChar,
          cableLengthMeters: this._cableLengthMeters,
          isHeatingElement: this._isHeatingElement,
          equipmentName: this._equipmentName,
          inventoryNumber: this._inventoryNumber,
          signatureUrl: this._signatureUrl,
          passed: evalRes.passed,
          status: evalRes.status,
          details: evalRes.details,
          nextInspectionDate: evalRes.nextInspectionDateFormatted,
          ruleChecks: evalRes.ruleChecks,
        },
      })
    );
  }

  render() {
    const evalRes = this._getEvaluation();
    const hasAny =
      this.rPe.trim() ||
      this.rIso.trim() ||
      this.iLeak.trim() ||
      this.iTouch.trim() ||
      this._rcdTripTimeMs.trim() ||
      this._rcdTripCurrentMa.trim() ||
      this._loopImpedanceZs.trim();

    return html`
      <div class="dguv-container">
        <div class="header-row">
          <h4>📋 DGUV V3 / VDE 0701-0702 Prüfassistent</h4>
          <div style="display: flex; gap: 6px; align-items: center;">
            <input
              type="file"
              id="testerFileInput"
              accept=".csv,.txt"
              style="display: none;"
              @change="${this._handleTesterFileUpload}"
            />
            <vaadin-button
              theme="secondary"
              @click="${() => this.shadowRoot?.getElementById('testerFileInput')?.click()}"
              title="Messdaten von Benning IT, GMC Profitest oder Fluke CSV importieren"
              style="min-height: auto; height: 30px; font-size: 0.8rem;"
            >
              📥 Messgeräte-Import
            </vaadin-button>
            <vaadin-button
              theme="secondary success"
              @click="${this._requestMultimeterScan}"
              ?disabled="${this.isScanning}"
              style="min-height: auto; height: 30px; font-size: 0.8rem;"
            >
              ${this.isScanning ? "⏳ Scannen..." : "📸 Messwert-Scan"}
            </vaadin-button>
          </div>
        </div>
        <p class="subtitle">
          Geräteprüfung nach VDE 0701-0702 (ortsveränderliche elektrische Betriebsmittel):
        </p>

        <!-- Schutzklassen-Auswahl -->
        <label style="font-size: 0.8rem; font-weight: bold; margin-bottom: 6px; display: block;">
          Prüfnorm & Kategorie des Prüflings:
        </label>
        <div class="class-selector" style="flex-wrap: wrap;">
          <button
            class="class-btn ${this._protectionClass === "SK_I" ? "active" : ""}"
            @click="${() => this._handleClassChange("SK_I")}"
          >
            🛡️ SK I (Schutzleiter)
          </button>
          <button
            class="class-btn ${this._protectionClass === "SK_II" ? "active" : ""}"
            @click="${() => this._handleClassChange("SK_II")}"
          >
            🔲 SK II (Schutzisoliert)
          </button>
          <button
            class="class-btn ${this._protectionClass === "SK_III" ? "active" : ""}"
            @click="${() => this._handleClassChange("SK_III")}"
          >
            ⚡ SK III (SELV / PELV)
          </button>
          <button
            class="class-btn ${this._protectionClass === "INSTALLATION_VDE0100" ? "active" : ""}"
            @click="${() => this._handleClassChange("INSTALLATION_VDE0100")}"
          >
            🏢 VDE 0100 (Verteilung/Anlage)
          </button>
        </div>

        <!-- Gerätedaten -->
        <div class="grid-inputs" style="margin-bottom: 0.75rem;">
          <vaadin-text-field
            label="${this._protectionClass === 'INSTALLATION_VDE0100' ? 'Stromkreis / Verteilung' : 'Gerätebezeichnung'}"
            placeholder="${this._protectionClass === 'INSTALLATION_VDE0100' ? 'z.B. UV-EG Stromkreis F4 Steckdosen' : 'z.B. Bohrhammer GBH 2-28'}"
            .value="${this._equipmentName}"
            @value-changed="${(e: CustomEvent) =>
              this._handleValueChange("equipmentName", e.detail.value)}"
          ></vaadin-text-field>
          <vaadin-text-field
            label="${this._protectionClass === 'INSTALLATION_VDE0100' ? 'Stromkreis-Nr. / Feld' : 'Inventar- / Seriennr.'}"
            placeholder="${this._protectionClass === 'INSTALLATION_VDE0100' ? 'z.B. UV-01/F4' : 'z.B. INV-2026-88'}"
            .value="${this._inventoryNumber}"
            @value-changed="${(e: CustomEvent) =>
              this._handleValueChange("inventoryNumber", e.detail.value)}"
          ></vaadin-text-field>
        </div>

        <!-- Dynamic Inputs based on Protection Class / Installation -->
        <div class="grid-inputs">
          ${this._protectionClass === "SK_I" || this._protectionClass === "INSTALLATION_VDE0100"
            ? html`
                <vaadin-text-field
                  label="${this._protectionClass === 'INSTALLATION_VDE0100' ? 'PE-Durchgängigkeit (Ω)' : 'R_PE Schutzleiter (Ω)'}"
                  placeholder="${this._protectionClass === 'INSTALLATION_VDE0100' ? '≤ 1.0' : '≤ 0.3'}"
                  .value="${this.rPe}"
                  @value-changed="${(e: CustomEvent) =>
                    this._handleValueChange("rPe", e.detail.value)}"
                ></vaadin-text-field>
              `
            : ""}

          <vaadin-text-field
            label="R_ISO Isolation (MΩ)"
            placeholder="${this._protectionClass === "SK_I" || this._protectionClass === "INSTALLATION_VDE0100"
              ? "≥ 1.0"
              : this._protectionClass === "SK_II"
              ? "≥ 2.0"
              : "≥ 0.25"}"
            .value="${this.rIso}"
            @value-changed="${(e: CustomEvent) =>
              this._handleValueChange("rIso", e.detail.value)}"
          ></vaadin-text-field>

          ${this._protectionClass === "SK_I"
            ? html`
                <vaadin-text-field
                  label="I_PE Ableitstrom (mA)"
                  placeholder="≤ 3.5"
                  .value="${this.iLeak}"
                  @value-changed="${(e: CustomEvent) =>
                    this._handleValueChange("iLeak", e.detail.value)}"
                ></vaadin-text-field>
              `
            : ""}
          ${this._protectionClass === "SK_II"
            ? html`
                <vaadin-text-field
                  label="I_B Berührungsstrom (mA)"
                  placeholder="≤ 0.5"
                  .value="${this.iTouch}"
                  @value-changed="${(e: CustomEvent) =>
                    this._handleValueChange("iTouch", e.detail.value)}"
                ></vaadin-text-field>
              `
            : ""}

          ${this._protectionClass === "INSTALLATION_VDE0100"
            ? html`
                <vaadin-text-field
                  label="FI/RCD Zeit t_a (ms)"
                  placeholder="≤ 300 ms"
                  .value="${this._rcdTripTimeMs}"
                  @value-changed="${(e: CustomEvent) =>
                    this._handleValueChange("rcdTripTimeMs", e.detail.value)}"
                ></vaadin-text-field>
                <vaadin-text-field
                  label="FI/RCD Strom I_ΔN (mA)"
                  placeholder="15 - 30 mA"
                  .value="${this._rcdTripCurrentMa}"
                  @value-changed="${(e: CustomEvent) =>
                    this._handleValueChange("rcdTripCurrentMa", e.detail.value)}"
                ></vaadin-text-field>
                <vaadin-text-field
                  label="Schleifenimpedanz Z_s (Ω)"
                  placeholder="≤ 1.44 (B16)"
                  .value="${this._loopImpedanceZs}"
                  @value-changed="${(e: CustomEvent) =>
                    this._handleValueChange("loopImpedanceZs", e.detail.value)}"
                ></vaadin-text-field>
              `
            : ""}
        </div>

        <!-- Optionen -->
        <div class="options-row">
          ${this._protectionClass === "SK_I"
            ? html`
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    ?checked="${this._isHeatingElement}"
                    @change="${(e: Event) => {
                      this._isHeatingElement = (e.target as HTMLInputElement).checked;
                      this._notifyChange();
                    }}"
                  />
                  Heizelement vorhanden (Grenzwert R_ISO: 0.3 MΩ)
                </label>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span>Leitungslänge:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    style="width: 60px; padding: 4px; border-radius: 4px; border: 1px solid var(--border);"
                    .value="${String(this._cableLengthMeters)}"
                    @input="${(e: Event) => {
                      this._cableLengthMeters =
                        parseFloat((e.target as HTMLInputElement).value) || 0;
                      this._notifyChange();
                    }}"
                  />
                  <span>m</span>
                </div>
              `
            : ""}

          <div style="display: flex; align-items: center; gap: 6px;">
            <span>Prüfintervall:</span>
            <select
              aria-label="Prüfintervall"
              style="padding: 4px; border-radius: 4px; border: 1px solid var(--border);"
              .value="${String(this._inspectionIntervalMonths)}"
              @change="${(e: Event) => {
                this._inspectionIntervalMonths = parseInt(
                  (e.target as HTMLSelectElement).value,
                  10
                );
                this._notifyChange();
              }}"
            >
              <option value="6">6 Monate</option>
              <option value="12" selected>12 Monate</option>
              <option value="24">24 Monate</option>
            </select>
          </div>
        </div>

        <!-- Result Badge & Digital Seal -->
        ${hasAny
          ? html`
              <div class="result-badge ${evalRes.passed ? "passed" : "failed"}">
                <div
                  style="display: flex; justify-content: space-between; align-items: center;"
                >
                  <strong style="font-size: 0.9rem;"
                    >Normbeurteilung (${this._protectionClass}):</strong
                  >
                  <span
                    style="font-weight: 800; font-size: 1rem; color: ${evalRes.passed
                      ? "var(--success, #0b8a5a)"
                      : "var(--danger, #dc2626)"};"
                  >
                    ${evalRes.status}
                  </span>
                </div>
                <ul
                  style="margin: 8px 0 0 0; padding-left: 20px; font-size: 0.85rem; color: var(--text-secondary);"
                >
                  ${evalRes.details.map((d) => html`<li>${d}</li>`)}
                </ul>

                ${evalRes.passed
                  ? html`
                      <div class="dguv-seal">
                        ✅ DGUV V3 Geprüft — Nächste Prüfung: ${evalRes.nextInspectionDateFormatted}
                      </div>
                    `
                  : ""}
              </div>
            `
          : html`
              <div
                style="font-size: 0.85rem; color: var(--text-muted); font-style: italic; text-align: center;"
              >
                Keine Messdaten eingetragen (optional)
              </div>
            `}

        <div class="signature-section">
          <div class="signature-title">✍️ Digitale Unterschrift der Prüffachkraft</div>
          <ec-signature-pad
            @signature-changed="${this._handleSignatureChanged}"
          ></ec-signature-pad>
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
