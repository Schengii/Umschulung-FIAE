import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@vaadin/button";
import "@vaadin/text-area";
import "@vaadin/text-field";
import wizardStyles from "./ec-diagnosis-wizard.css?inline";
import "./ec-datasheet-manager";

@customElement("ec-settings")
export class EcSettings extends LitElement {
  static styles = unsafeCSS(wizardStyles);

  @property({ type: String }) apiKey = "";
  @property({ type: String }) perplexityApiKey = "";
  @property({ type: String }) backendUrl = "";
  @property({ type: Boolean }) accessibleMode = false;
  @property({ type: String }) inspectorName = "";
  @property({ type: String }) inspectorCompany = "";
  @property({ type: String }) inspectorId = "";

  @state() private _tempApiKey = "";
  @state() private _tempPerplexityApiKey = "";
  @state() private _tempBackendUrl = "";
  @state() private _tempInspectorName = "";
  @state() private _tempInspectorCompany = "";
  @state() private _tempInspectorId = "";

  connectedCallback() {
    super.connectedCallback();
    this._tempApiKey = this.apiKey;
    this._tempPerplexityApiKey = this.perplexityApiKey;
    this._tempBackendUrl = this.backendUrl || "http://localhost:3000";
    this._tempInspectorName = this.inspectorName;
    this._tempInspectorCompany = this.inspectorCompany;
    this._tempInspectorId = this.inspectorId;
  }

  render() {
    return html`
      <div class="modal-overlay settings-overlay">
        <div class="card settings-card">
          <h3 class="m-0">⚙️ Einstellungen</h3>
          
          <vaadin-text-area
            class="w-100 mt-1"
            label="Gemini API Key (Optional)"
            helper-text="Falls Sie Ihren eigenen API Key nutzen möchten"
            .value="${this._tempApiKey}"
            @value-changed="${(e: CustomEvent) =>
              (this._tempApiKey = e.detail.value)}"
          ></vaadin-text-area>

          <vaadin-text-area
            class="w-100 mt-1"
            label="Perplexity API Key (Optional)"
            helper-text="Für Web-Recherchen zu VDE-Regeln und Reparaturen"
            .value="${this._tempPerplexityApiKey}"
            @value-changed="${(e: CustomEvent) =>
              (this._tempPerplexityApiKey = e.detail.value)}"
          ></vaadin-text-area>

          <vaadin-text-field
            class="w-100 mt-1"
            label="Backend Server URL"
            helper-text="Für Smartphone z.B. http://192.168.x.x:3000"
            .value="${this._tempBackendUrl}"
            @value-changed="${(e: CustomEvent) =>
              (this._tempBackendUrl = e.detail.value)}"
          ></vaadin-text-field>

          <h4 class="privacy-title mt-1" style="color: var(--primary); margin-bottom: 4px; font-size: 0.95rem; font-weight: bold;">👤 Prüferprofil</h4>
          <vaadin-text-field
            class="w-100 mt-1"
            label="Prüfer-Name"
            helper-text="Name des zuständigen Prüfers"
            .value="${this._tempInspectorName}"
            @value-changed="${(e: CustomEvent) =>
              (this._tempInspectorName = e.detail.value)}"
          ></vaadin-text-field>

          <vaadin-text-field
            class="w-100 mt-1"
            label="Firma / Abteilung"
            helper-text="Name des Unternehmens oder der Abteilung"
            .value="${this._tempInspectorCompany}"
            @value-changed="${(e: CustomEvent) =>
              (this._tempInspectorCompany = e.detail.value)}"
          ></vaadin-text-field>

          <vaadin-text-field
            class="w-100 mt-1"
            label="Zertifikatsnummer / Prüfer-ID"
            helper-text="Offizielle Zertifikats- oder Prüfernummer"
            .value="${this._tempInspectorId}"
            @value-changed="${(e: CustomEvent) =>
              (this._tempInspectorId = e.detail.value)}"
          ></vaadin-text-field>

          <div class="privacy-danger-zone mt-1" style="border-color: rgba(2, 119, 189, 0.3); background: rgba(2, 119, 189, 0.05); text-align: left;">
            <h4 class="privacy-title" style="color: var(--primary);">♿ Barrierefreiheit</h4>
            <label class="consent-checkbox-label" style="display: flex; gap: 8px; margin: 8px 0 0 0; cursor: pointer; border: none; background: transparent; padding: 0;">
              <input 
                type="checkbox" 
                .checked="${this.accessibleMode}"
                @change="${this._toggleAccessibleMode}"
                style="margin-top: 4px;"
              />
              <span style="font-size: 0.85rem; line-height: 1.4;"><strong>Lese-Hilfe aktivieren</strong> (größere Wortabstände & Zeilenabstände für LRS-Unterstützung)</span>
            </label>
          </div>

          <ec-datasheet-manager class="mt-1"></ec-datasheet-manager>
          
          <div class="privacy-danger-zone mt-1">
            <h4 class="privacy-title">🔒 Datenschutz & Daten</h4>
            <p style="font-size: 0.8rem; margin: 0 0 10px 0;">Verwalten Sie Ihre lokalen Daten gemäß DSGVO.</p>
            <div style="display: flex; gap: 8px;">
              <vaadin-button theme="secondary" @click="${this._handleExport}" style="flex: 1;"
                >💾 Exportieren</vaadin-button
              >
              <vaadin-button theme="error" @click="${this._handleDelete}" style="flex: 1;"
                >🗑️ Löschen</vaadin-button
              >
            </div>
          </div>

          <div class="modal-actions">
            <vaadin-button
              @click="${this._handleClose}"
              >Schließen</vaadin-button
            >
            <vaadin-button theme="primary" @click="${this._handleSave}"
              >Speichern</vaadin-button
            >
          </div>
        </div>
      </div>
    `;
  }

  private _handleClose() {
    this.dispatchEvent(new CustomEvent("close"));
  }

  private _handleSave() {
    this.dispatchEvent(
      new CustomEvent("save-settings", {
        detail: {
          apiKey: this._tempApiKey,
          perplexityApiKey: this._tempPerplexityApiKey,
          backendUrl: this._tempBackendUrl,
          inspectorName: this._tempInspectorName,
          inspectorCompany: this._tempInspectorCompany,
          inspectorId: this._tempInspectorId,
        },
      })
    );
  }

  private _toggleAccessibleMode(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    this.dispatchEvent(
      new CustomEvent("accessible-changed", {
        detail: { checked }
      })
    );
  }

  private _handleExport() {
    this.dispatchEvent(new CustomEvent("export-data"));
  }

  private _handleDelete() {
    this.dispatchEvent(new CustomEvent("delete-data"));
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "ec-settings": EcSettings;
  }
}
