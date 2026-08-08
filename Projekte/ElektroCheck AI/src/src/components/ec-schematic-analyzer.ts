import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

export interface SchematicResult {
  diagramTitle: string;
  identifiedComponents: Array<{ tag: string; name: string; terminals: string }>;
  detectedErrors: Array<{ severity: 'INFO' | 'WARNING' | 'CRITICAL'; description: string; vdeReference: string }>;
  summary: string;
}

@customElement('ec-schematic-analyzer')
export class EcSchematicAnalyzer extends LitElement {
  @state() private _imagePreview: string | null = null;
  @state() private _notes: string = '';
  @state() private _isLoading = false;
  @state() private _result: SchematicResult | null = null;
  @state() private _errorMessage: string | null = null;

  static styles = css`
    :host {
      display: block;
      background: var(--bg-card, #ffffff);
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid var(--border-color, #e2e8f0);
    }
    .header {
      margin-bottom: 1.5rem;
    }
    .header h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.3rem;
      color: var(--text-primary, #0f172a);
    }
    .upload-zone {
      border: 2px dashed var(--border-color, #cbd5e1);
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      background: var(--bg-app, #f8fafc);
      cursor: pointer;
      transition: border-color 0.2s;
      margin-bottom: 1rem;
    }
    .upload-zone:hover {
      border-color: var(--brand-primary, #2563eb);
    }
    img.preview {
      max-width: 100%;
      max-height: 300px;
      border-radius: 8px;
      margin-top: 1rem;
    }
    textarea {
      width: 100%;
      box-sizing: border-box;
      padding: 0.75rem;
      border-radius: 8px;
      border: 1px solid var(--border-color, #cbd5e1);
      margin-bottom: 1rem;
      font-family: inherit;
      background: var(--bg-card, #ffffff);
      color: var(--text-primary, #0f172a);
    }
    button.btn-analyze {
      width: 100%;
      padding: 0.8rem;
      background: var(--brand-primary, #2563eb);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
    }
    button.btn-analyze:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .results-panel {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color, #e2e8f0);
    }
    .comp-card {
      background: var(--bg-app, #f8fafc);
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .tag {
      font-weight: bold;
      background: #e0f2fe;
      color: #0369a1;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-family: monospace;
    }
    .error-card {
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      border-left: 4px solid #ef4444;
      background: #fef2f2;
    }
    .error-card.WARNING {
      border-left-color: #f59e0b;
      background: #fffbeb;
    }
    .error-card.INFO {
      border-left-color: #3b82f6;
      background: #eff6ff;
    }
  `;

  render() {
    return html`
      <div class="header">
        <h2>📐 KI-Schaltplan- & Stromlaufplan-Analyse</h2>
        <p>Lade ein Foto oder PDF eines Schaltplans hoch, um Bauteile, Klemmen und VDE-Schaltfehler automatisch zu analysieren.</p>
      </div>

      <div class="upload-zone" @click="${() => this.shadowRoot?.querySelector<HTMLInputElement>('#file-input')?.click()}">
        <input type="file" id="file-input" accept="image/*" style="display:none" @change="${this._handleFileSelect}">
        <div>📁 Klicken oder Bild / Stromlaufplan hierher ziehen</div>
        ${this._imagePreview ? html`<img src="${this._imagePreview}" class="preview">` : ''}
      </div>

      <textarea
        rows="2"
        placeholder="Optional: Besondere Anmerkungen oder Fragen zur Schaltung..."
        .value="${this._notes}"
        @input="${(e: Event) => this._notes = (e.target as HTMLInputElement).value}"
      ></textarea>

      <button
        class="btn-analyze"
        ?disabled="${!this._imagePreview || this._isLoading}"
        @click="${this._analyzeSchematic}"
      >
        ${this._isLoading ? '⚡ Analysiere Stromlaufplan...' : '🔍 Schaltplan prüfen'}
      </button>

      ${this._errorMessage ? html`<div style="color: red; margin-top: 1rem;">${this._errorMessage}</div>` : ''}

      ${this._result ? html`
        <div class="results-panel">
          <h3>📋 Plan: ${this._result.diagramTitle}</h3>
          <p>${this._result.summary}</p>

          <h4>🧩 Identifizierte Betriebsmittel</h4>
          ${this._result.identifiedComponents.map(c => html`
            <div class="comp-card">
              <div>
                <span class="tag">${c.tag}</span>
                <strong>${c.name}</strong>
              </div>
              <span style="font-size:0.85rem; color:#64748b">Klemmen: ${c.terminals}</span>
            </div>
          `)}

          <h4 style="margin-top: 1.5rem;">⚠️ Norm- & Verdrahtungsprüfungen</h4>
          ${this._result.detectedErrors.length === 0 ? html`<p style="color: green;">✅ Keine VDE-Verdrahtungsfehler festgestellt.</p>` : ''}
          ${this._result.detectedErrors.map(err => html`
            <div class="error-card ${err.severity}">
              <strong>[${err.severity}] ${err.vdeReference}</strong>
              <div>${err.description}</div>
            </div>
          `)}
        </div>
      ` : ''}
    `;
  }

  private _handleFileSelect(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this._imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  private async _analyzeSchematic() {
    if (!this._imagePreview) return;
    this._isLoading = true;
    this._errorMessage = null;

    try {
      const res = await fetch('http://localhost:3000/api/gemini/schematic-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: this._imagePreview,
          notes: this._notes
        })
      });

      if (!res.ok) {
        throw new Error(`Fehler bei der Analyse: ${res.statusText}`);
      }

      this._result = await res.json();
    } catch (err: any) {
      this._errorMessage = err.message || 'Schaltplan konnte nicht analysiert werden.';
    } finally {
      this._isLoading = false;
    }
  }
}
