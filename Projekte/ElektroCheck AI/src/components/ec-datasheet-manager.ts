import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import "@vaadin/button";
import "@vaadin/text-field";
import {
  saveDatasheet,
  getAllDatasheets,
  deleteDatasheet,
  type OfflineDatasheet,
} from "../utils/indexed-db";

@customElement("ec-datasheet-manager")
export class EcDatasheetManager extends LitElement {
  @state() private _datasheets: OfflineDatasheet[] = [];
  @state() private _searchFilter = "";
  @state() private _modelMatch = "";
  @state() private _selectedFile: File | null = null;
  @state() private _isSaving = false;
  @state() private _activeViewerSheet: OfflineDatasheet | null = null;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      text-align: left;
    }
    .manager-card {
      background: var(--bg-card, #ffffff);
      padding: 16px;
      border-radius: var(--radius-m, 12px);
      border: 1px solid var(--border, #64748b);
      margin-top: 10px;
    }
    h4 {
      margin: 0 0 8px 0;
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    p {
      font-size: 0.82rem;
      color: var(--text-secondary);
      margin: 0 0 12px 0;
      line-height: 1.4;
    }
    .upload-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 16px;
      padding: 12px;
      background: var(--bg-app, #f8fafc);
      border-radius: var(--radius-s, 8px);
      border: 1px solid var(--border, #cbd5e1);
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
    .search-row {
      margin-bottom: 10px;
    }
    .datasheet-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 250px;
      overflow-y: auto;
    }
    .datasheet-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: var(--bg-app, #f8fafc);
      border: 1px solid var(--border, #cbd5e1);
      border-radius: var(--radius-s, 8px);
      font-size: 0.85rem;
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
      color: var(--text-primary);
    }
    .datasheet-match {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .item-actions {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .empty-text {
      text-align: center;
      font-style: italic;
      color: var(--text-muted);
      font-size: 0.8rem;
      margin: 12px 0;
    }

    /* Modal Viewer */
    .viewer-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(9, 13, 22, 0.8);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .viewer-modal {
      width: 100%;
      max-width: 900px;
      height: 85vh;
      background: var(--bg-card, #ffffff);
      border-radius: var(--radius-m, 12px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
    }
    .viewer-header {
      padding: 12px 16px;
      background: var(--bg-app, #f1f5f9);
      border-bottom: 1px solid var(--border, #cbd5e1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .viewer-header h3 {
      margin: 0;
      font-size: 0.95rem;
      color: var(--text-primary);
    }
    .viewer-body {
      flex: 1;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #333333;
    }
    .viewer-iframe {
      width: 100%;
      height: 100%;
      border: none;
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
      alert("Bitte ein PDF-Datenblatt oder Bild auswählen.");
      return;
    }

    this._isSaving = true;

    try {
      const base64Data = await this._fileToBase64(this._selectedFile);
      const newSheet: OfflineDatasheet = {
        name: this._selectedFile.name,
        modelMatch: this._modelMatch.trim(),
        fileData: base64Data,
      };

      await saveDatasheet(newSheet);
      this._modelMatch = "";
      this._selectedFile = null;
      const fileInput = this.shadowRoot?.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      await this._loadDatasheets();
      alert("Datenblatt erfolgreich offline in IndexedDB gespeichert!");
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

  private _openViewer(sheet: OfflineDatasheet) {
    this._activeViewerSheet = sheet;
  }

  private _closeViewer() {
    this._activeViewerSheet = null;
  }

  render() {
    const filteredSheets = this._datasheets.filter((s) => {
      if (!this._searchFilter.trim()) return true;
      const filter = this._searchFilter.toLowerCase().trim();
      return (
        s.name.toLowerCase().includes(filter) ||
        s.modelMatch.toLowerCase().includes(filter)
      );
    });

    return html`
      <div class="manager-card">
        <h4>📂 Offline Datenblatt-Manager (IndexedDB Cache)</h4>
        <p>
          Lade Datenblätter & Anleitungen hoch, um sie bei Arbeiten im Funkloch / Keller offline direkt im integrierten PDF-Viewer zu öffnen.
        </p>

        <div class="upload-form">
          <vaadin-text-field
            label="Gerätemodell-Match (z. B. Saeco Royal / Dell E2222H)"
            .value="${this._modelMatch}"
            @value-changed="${(e: CustomEvent) =>
              (this._modelMatch = e.detail.value)}"
            style="width: 100%;"
          ></vaadin-text-field>

          <div class="file-input-wrapper">
            <input type="file" aria-label="Datenblatt auswählen (PDF oder Bild)" accept=".pdf,image/*" @change="${this._handleFileChange}" />
          </div>

          <vaadin-button
            theme="primary"
            ?disabled="${this._isSaving ||
            !this._modelMatch.trim() ||
            !this._selectedFile}"
            @click="${this._handleUpload}"
          >
            ${this._isSaving ? "Speichert..." : "📥 Offline in IndexedDB speichern"}
          </vaadin-button>
        </div>

        <div class="search-row">
          <vaadin-text-field
            placeholder="🔍 Gespeicherte Datenblätter filtern..."
            .value="${this._searchFilter}"
            @value-changed="${(e: CustomEvent) =>
              (this._searchFilter = e.detail.value)}"
            style="width: 100%;"
          ></vaadin-text-field>
        </div>

        <div class="datasheet-list">
          ${filteredSheets.length === 0
            ? html`<div class="empty-text">Keine Datenblätter offline gefunden.</div>`
            : filteredSheets.map(
                (sheet) => html`
                  <div class="datasheet-item">
                    <div class="datasheet-info">
                      <span class="datasheet-name" title="${sheet.name}"
                        >📄 ${sheet.name}</span
                      >
                      <span class="datasheet-match"
                        >Modell-Match: <strong>${sheet.modelMatch}</strong></span
                      >
                    </div>
                    <div class="item-actions">
                      <vaadin-button
                        theme="primary success"
                        @click="${() => this._openViewer(sheet)}"
                        style="min-height: auto; height: 32px; font-size: 0.8rem;"
                      >
                        👁️ Öffnen
                      </vaadin-button>
                      <vaadin-button
                        theme="error tertiary"
                        @click="${() => this._handleDelete(sheet.id!)}"
                        style="min-height: auto; height: 32px;"
                      >
                        🗑️
                      </vaadin-button>
                    </div>
                  </div>
                `
              )}
        </div>
      </div>

      <!-- Offline PDF / Document Viewer Modal -->
      ${this._activeViewerSheet
        ? html`
            <div class="viewer-backdrop" @click="${this._closeViewer}">
              <div class="viewer-modal" @click="${(e: Event) => e.stopPropagation()}">
                <div class="viewer-header">
                  <h3>📄 ${this._activeViewerSheet.name} (Offline Cache)</h3>
                  <vaadin-button theme="tertiary error" @click="${this._closeViewer}">
                    ✖ Schließen
                  </vaadin-button>
                </div>
                <div class="viewer-body">
                  <iframe
                    class="viewer-iframe"
                    src="${this._activeViewerSheet.fileData}"
                    title="${this._activeViewerSheet.name}"
                  ></iframe>
                </div>
              </div>
            </div>
          `
        : ""}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-datasheet-manager": EcDatasheetManager;
  }
}
