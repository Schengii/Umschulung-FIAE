import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import "@vaadin/button";
import "@vaadin/text-field";
import { saveDatasheet, getAllDatasheets, deleteDatasheet, OfflineDatasheet } from "../utils/indexed-db";

@customElement("ec-datasheet-manager")
export class EcDatasheetManager extends LitElement {
  @state() private _datasheets: OfflineDatasheet[] = [];
  @state() private _modelMatch = "";
  @state() private _selectedFile: File | null = null;
  @state() private _isSaving = false;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      text-align: left;
    }
    .manager-card {
      background: var(--bg-card, #ffffff);
      padding: 12px;
      border-radius: var(--radius-s, 8px);
      border: 1px solid var(--border, #64748b);
      margin-top: 10px;
    }
    h4 {
      margin: 0 0 8px 0;
      font-size: 0.95rem;
      color: var(--text-primary);
    }
    p {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin: 0 0 12px 0;
      line-height: 1.4;
    }
    .upload-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
    }
    .file-input-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
    }
    input[type="file"] {
      font-size: 0.8rem;
    }
    .datasheet-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 200px;
      overflow-y: auto;
    }
    .datasheet-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 8px;
      background: var(--bg-app);
      border: 1px solid var(--border);
      border-radius: var(--radius-s);
      font-size: 0.8rem;
    }
    .datasheet-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
      flex: 1;
    }
    .datasheet-name {
      font-weight: bold;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .datasheet-match {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .empty-text {
      text-align: center;
      font-style: italic;
      color: var(--text-muted);
      font-size: 0.8rem;
      margin: 8px 0;
    }

    /* Dyslexie (LRS) Lese-Hilfe Support */
    :host-context(.accessible-reading) p,
    :host-context(.accessible-reading) span,
    :host-context(.accessible-reading) div,
    :host-context(.accessible-reading) label,
    :host-context(.accessible-reading) input,
    :host-context(.accessible-reading) vaadin-text-field,
    :host-context(.accessible-reading) vaadin-button {
      word-spacing: 0.15em !important;
      letter-spacing: 0.05em !important;
      line-height: 1.75 !important;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._loadDatasheets();
  }

  private async _loadDatasheets() {
    try {
      this._datasheets = await getAllDatasheets();
    } catch (e) {
      console.error("Fehler beim Laden der Offline-Datenblätter", e);
    }
  }

  private _handleFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this._selectedFile = input.files[0];
    } else {
      this._selectedFile = null;
    }
  }

  private async _handleUpload() {
    if (!this._modelMatch.trim()) {
      alert("Bitte ein Gerätemodell eingeben.");
      return;
    }
    if (!this._selectedFile) {
      alert("Bitte ein PDF-Datenblatt auswählen.");
      return;
    }

    this._isSaving = true;

    try {
      const base64Data = await this._fileToBase64(this._selectedFile);
      const newSheet: OfflineDatasheet = {
        name: this._selectedFile.name,
        modelMatch: this._modelMatch.trim(),
        fileData: base64Data
      };

      await saveDatasheet(newSheet);
      this._modelMatch = "";
      this._selectedFile = null;
      // Reset input element
      const fileInput = this.shadowRoot?.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      await this._loadDatasheets();
      alert("Datenblatt erfolgreich offline gespeichert!");
    } catch (e) {
      console.error(e);
      alert("Fehler beim Speichern des Datenblatts.");
    } finally {
      this._isSaving = false;
    }
  }

  private _fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  private async _handleDelete(id: number) {
    if (confirm("Dieses Offline-Datenblatt wirklich löschen?")) {
      try {
        await deleteDatasheet(id);
        await this._loadDatasheets();
      } catch (e) {
        alert("Fehler beim Löschen.");
      }
    }
  }

  render() {
    return html`
      <div class="manager-card">
        <h4>📂 Offline-Datenblätter (PDF)</h4>
        <p>Lade Bedienungsanleitungen oder Datenblätter hoch, um sie bei der Arbeit offline parat zu haben.</p>

        <div class="upload-form">
          <vaadin-text-field
            label="Gerätemodell (z. B. Saeco Royal)"
            .value="${this._modelMatch}"
            @value-changed="${(e: CustomEvent) => this._modelMatch = e.detail.value}"
            style="width: 100%;"
          ></vaadin-text-field>

          <div class="file-input-wrapper">
            <input
              type="file"
              accept=".pdf"
              @change="${this._handleFileChange}"
            />
          </div>

          <vaadin-button
            theme="primary"
            ?disabled="${this._isSaving || !this._modelMatch.trim() || !this._selectedFile}"
            @click="${this._handleUpload}"
            style="margin-top: 4px;"
          >
            ${this._isSaving ? "Speichert..." : "Offline speichern"}
          </vaadin-button>
        </div>

        <div class="datasheet-list">
          ${this._datasheets.length === 0
            ? html`<div class="empty-text">Keine Datenblätter offline gespeichert.</div>`
            : this._datasheets.map(sheet => html`
                <div class="datasheet-item">
                  <div class="datasheet-info">
                    <span class="datasheet-name" title="${sheet.name}">${sheet.name}</span>
                    <span class="datasheet-match">Modell-Match: <strong>${sheet.modelMatch}</strong></span>
                  </div>
                  <vaadin-button
                    theme="error tertiary"
                    @click="${() => this._handleDelete(sheet.id!)}"
                    style="min-height: auto; height: 32px;"
                  >
                    🗑️
                  </vaadin-button>
                </div>
              `)
          }
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-datasheet-manager": EcDatasheetManager;
  }
}
