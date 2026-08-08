import { LitElement, html, unsafeCSS } from "lit";
import { customElement, state, query } from "lit/decorators.js";
import wizardStyles from "./ec-diagnosis-wizard.css?inline";
import { GeminiAIService } from "../services/gemini-services";
import { ThermalAnalysisResult } from "../services/ai-types";
import { buildThermalPdfDocDefinition } from "../utils/pdf-generator";
import "@vaadin/button";
import "@vaadin/text-area";
import "@vaadin/progress-bar";

@customElement("ec-thermal-analysis")
export class EcThermalAnalysis extends LitElement {
  static styles = unsafeCSS(wizardStyles);

  @state() private _isLoading = false;
  @state() private _loadingMessage = "Analysiere Infrarotbild...";
  @state() private _description = "";
  @state() private _capturedImage: string | null = null;
  @state() private _result: ThermalAnalysisResult | null = null;
  @state() private _pdfPreviewUrl: string | null = null;
  // @state() private _isDrawingHotspots = false;

  @query("#thermal-canvas") private _canvas!: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D | null = null;
  private _aiService = new GeminiAIService();
  private _loadingInterval: number | null = null;

  private readonly _loadingPhrases = [
    "Lade Infrarotbild...",
    "Suche nach Wärmeanomalien...",
    "Kalkuliere Temperaturspitzen...",
    "Bewerte Sicherheitsabstände...",
    "Gleiche mit VDE-Grenzwerte ab...",
    "Erstelle Instandsetzungsbericht...",
  ];

  render() {
    return html`
      <div class="guided-container">
        <!-- 1. Input Section -->
        ${!this._result
          ? html`
              <div class="card ocr-card">
                <h3 class="m-0">🔥 KI-Wärmebild-Analysator (Thermografie)</h3>
                <p>
                  Analysiere Infrarot-Aufnahmen von Schaltschränken und Anlagen. Die KI erkennt Bauteile,
                  überhitzte Klemmen (Hotspots) und empfiehlt VDE-konforme Schutzmaßnahmen.
                </p>

                <!-- Upload area -->
                <div class="mt-1" style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <vaadin-button theme="primary" @click="${this._triggerFileSelect}">
                    📸 Wärmebild hochladen
                  </vaadin-button>
                  <vaadin-button theme="secondary" @click="${this._loadDemoImage}">
                    💡 Demo-Bild laden
                  </vaadin-button>
                  <input
                    type="file"
                    id="file-upload"
                    accept="image/*"
                    style="display: none;"
                    @change="${this._handleFileChange}"
                  />
                </div>

                ${this._capturedImage
                  ? html`
                      <div class="media-box mt-1" style="background: var(--surface); height: 260px;">
                        <img src="${this._capturedImage}" alt="Wärmebild Vorschau" style="object-fit: contain;" />
                      </div>
                    `
                  : ""}

                <vaadin-text-area
                  class="w-100 mt-1"
                  label="Zusätzliche Angaben zur Anlage"
                  placeholder="z.B. Hauptverteilung Halle A, Sicherung brummt, Nennstrom 63A"
                  .value="${this._description}"
                  @value-changed="${(e: CustomEvent) => (this._description = e.detail.value)}"
                ></vaadin-text-area>

                <div class="mt-1">
                  <vaadin-button
                    theme="primary success"
                    class="w-100 btn-large"
                    ?disabled="${!this._capturedImage || this._isLoading}"
                    @click="${this._startThermalAnalysis}"
                  >
                    🔥 Thermografie analysieren
                  </vaadin-button>
                </div>
              </div>
            `
          : ""}

        <!-- 2. Loading / Skeleton Screen -->
        ${this._isLoading
          ? html`
              <div class="card skeleton-card">
                <div class="tech-spinner"></div>
                <p class="loading-text">${this._loadingMessage}</p>
              </div>
            `
          : ""}

        <!-- 3. Result Section -->
        ${this._result && !this._isLoading
          ? html`
              <!-- Canvas Visualization Card -->
              <div class="card result-card">
                <h3 class="m-0">📊 Thermografie-Auswertung</h3>
                
                <div class="media-box" style="background: #090d16; aspect-ratio: auto; height: 350px;">
                  <canvas id="thermal-canvas" style="width: 100%; height: 100%; object-fit: contain;"></canvas>
                </div>
                <div class="camera-hint" role="status" style="position: relative; bottom: 0; margin-top: 8px;">
                  🔴 Die erkannten Hotspots wurden farblich markiert (Rot = Kritisch, Orange = Warnung).
                </div>
              </div>

              <!-- General Recommendation Card -->
              <div class="card ${this._getSeverityClass()}">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; margin-bottom: 1rem;">
                  <h3 class="m-0" style="border: none; padding: 0; margin: 0;">
                    🛡️ Status: ${this._result.overallStatus}
                  </h3>
                  <span class="difficulty-stars" style="margin: 0; font-size: 1.25rem;">
                    ${this._result.overallStatus === "CRITICAL" ? "🔴🔴🔴" : this._result.overallStatus === "MONITOR" ? "🟡🟡" : "🟢"}
                  </span>
                </div>
                <p><strong>Gesamteinschätzung:</strong></p>
                <div class="experience-box" style="margin: 0.5rem 0 1rem 0; border-left-color: var(--primary);">
                  ${this._result.generalRecommendation}
                </div>

                <!-- Hotspots List Table -->
                <h4 style="margin: 1.5rem 0 0.5rem 0; font-size: 0.95rem; text-transform: uppercase; color: var(--text-secondary);">Erkannte Hotspots</h4>
                <div style="overflow-x: auto; width: 100%; border: 1px solid var(--border); border-radius: var(--radius-s); background: var(--bg-app);">
                  <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
                    <thead>
                      <tr style="border-bottom: 1px solid var(--border); background: var(--bg-card);">
                        <th style="padding: 10px; font-weight: 700;">Bauteil/Bereich</th>
                        <th style="padding: 10px; font-weight: 700;">Temperatur</th>
                        <th style="padding: 10px; font-weight: 700;">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${this._result.detectedHotspots.map(
                        (h) => html`
                          <tr style="border-bottom: 1px solid var(--border);">
                            <td style="padding: 10px; font-weight: 600;">${h.label}</td>
                            <td style="padding: 10px; color: var(--text-secondary); font-family: monospace;">${h.temperature}</td>
                            <td style="padding: 10px;">
                              <span style="font-weight: 700; color: ${h.severity === "CRITICAL" ? "var(--danger)" : h.severity === "MONITOR" ? "var(--warning)" : "var(--success)"}">
                                ${h.severity}
                              </span>
                            </td>
                          </tr>
                        `
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Interactive Actions Checklist -->
              <div class="card result-card">
                <h3 class="m-0">🛠️ Instandsetzungs-Checkliste</h3>
                <p>Führe folgende Schritte aus, um die Mängel sicher zu beheben:</p>
                <div class="safety-list">
                  ${this._result.actionSteps.map(
                    (step, idx) => html`
                      <label class="safety-item" style="border-color: ${step.completed ? "var(--success)" : "var(--border)"}; background: ${step.completed ? "var(--success-glow)" : "var(--bg-app)"};">
                        <input
                          type="checkbox"
                          .checked="${step.completed}"
                          @change="${(e: Event) => this._toggleStep(idx, e)}"
                        />
                        <span style="text-decoration: ${step.completed ? "line-through" : "none"}; color: ${step.completed ? "var(--text-muted)" : "var(--text-primary)"}">
                          ${step.text}
                        </span>
                      </label>
                    `
                  )}
                </div>
              </div>

              <!-- VDE Normen & Sicherheitshinweise -->
              <div class="card safety-card">
                <h3 class="m-0">⚠️ VDE-Sicherheitsregeln & Thermografie-Grenzwerte</h3>
                <ul class="tips-list">
                  ${this._result.safetyTips.map((tip) => html`<li>${tip}</li>`)}
                  <li style="margin-top: 1rem; font-size: 0.8rem; font-style: italic;">
                    Vorschrift: Nach DIN EN 60204-1 (VDE 0113-1) dürfen metallische Teile von Bedienorganen im normalen Betrieb max. 70°C und metallische Anschlüsse max. 90°C erreichen.
                  </li>
                </ul>
              </div>

              <!-- Action Buttons -->
              <div class="result-actions" style="margin-bottom: 2rem;">
                <vaadin-button theme="primary" @click="${this._downloadPdfReport}">
                  📄 Bericht herunterladen (PDF)
                </vaadin-button>
                <vaadin-button theme="secondary" @click="${this._reset}">
                  🔄 Neue Analyse
                </vaadin-button>
              </div>
            `
          : ""}

        <!-- PDF Preview Modal -->
        ${this._pdfPreviewUrl
          ? html`
              <div class="modal-overlay">
                <div class="card pdf-modal-card">
                  <h3 class="m-0">📄 PDF-Inspektionsbericht Vorschau</h3>
                  <iframe class="pdf-iframe" src="${this._pdfPreviewUrl}"></iframe>
                  <div class="modal-actions">
                    <vaadin-button theme="secondary" @click="${() => (this._pdfPreviewUrl = null)}">
                      Schließen
                    </vaadin-button>
                  </div>
                </div>
              </div>
            `
          : ""}
      </div>
    `;
  }

  private _getSeverityClass() {
    if (!this._result) return "";
    if (this._result.overallStatus === "CRITICAL") return "safety-card";
    if (this._result.overallStatus === "MONITOR") return "result-card"; // glows primary/amber
    return "ocr-card"; // glows success
  }

  private _triggerFileSelect() {
    this.shadowRoot?.getElementById("file-upload")?.click();
  }

  private _handleFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this._capturedImage = reader.result as string;
      this._result = null;
    };
    reader.readAsDataURL(file);
  }

  private async _loadDemoImage() {
    this._isLoading = true;
    this._loadingMessage = "Lade Demo-Wärmebild...";
    try {
      const response = await fetch("/demo-thermal.png");
      if (!response.ok) throw new Error("Demo image not found");
      const blob = await response.clone().blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        this._capturedImage = reader.result as string;
        this._result = null;
        this._isLoading = false;
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      alert("Fehler beim Laden des Demo-Bildes. Ist der Vite-Server aktiv?");
      this._isLoading = false;
    }
  }

  private async _startThermalAnalysis() {
    if (!this._capturedImage) return;

    this._isLoading = true;
    this._result = null;

    let i = 0;
    this._loadingMessage = this._loadingPhrases[0];
    this._loadingInterval = window.setInterval(() => {
      i++;
      if (i < this._loadingPhrases.length) {
        this._loadingMessage = this._loadingPhrases[i];
      }
    }, 1800);

    try {
      const res = await this._aiService.analyzeThermalImage(
        this._capturedImage,
        this._description
      );
      this._result = res;
      this._isLoading = false;
      if (this._loadingInterval) clearInterval(this._loadingInterval);

      // Draw hotspots on canvas
      await this.updateComplete;
      this._drawHotspots();
    } catch (e: any) {
      alert(`Fehler bei der Analyse: ${e.message || e}`);
      this._isLoading = false;
      if (this._loadingInterval) clearInterval(this._loadingInterval);
    }
  }

  private _drawHotspots() {
    if (!this._canvas || !this._result || !this._capturedImage) return;

    this._ctx = this._canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      const w = img.width;
      const h = img.height;
      this._canvas.width = w;
      this._canvas.height = h;

      if (!this._ctx) return;
      this._ctx.drawImage(img, 0, 0);

      this._ctx.lineCap = "round";
      this._ctx.lineJoin = "round";

      this._result!.detectedHotspots.forEach((hotspot) => {
        if (!hotspot.box_2d || hotspot.box_2d.length !== 4) return;

        const ymin = (hotspot.box_2d[0] / 1000) * h;
        const xmin = (hotspot.box_2d[1] / 1000) * w;
        const ymax = (hotspot.box_2d[2] / 1000) * h;
        const xmax = (hotspot.box_2d[3] / 1000) * w;

        const boxW = xmax - xmin;
        const boxH = ymax - ymin;

        // Set color according to severity
        let color = "#10b981"; // green (OK)
        if (hotspot.severity === "CRITICAL") {
          color = "#ef4444"; // red
        } else if (hotspot.severity === "MONITOR") {
          color = "#f59e0b"; // amber
        }

        // Draw bounding box
        this._ctx!.strokeStyle = color;
        this._ctx!.lineWidth = Math.max(4, Math.floor(w / 150));
        this._ctx!.strokeRect(xmin, ymin, boxW, boxH);

        // Draw label background
        this._ctx!.fillStyle = color;
        const fontSize = Math.max(14, Math.floor(w / 35));
        this._ctx!.font = `bold ${fontSize}px var(--font-sans, sans-serif)`;
        const labelText = `${hotspot.label} (${hotspot.temperature})`;
        const textWidth = this._ctx!.measureText(labelText).width;

        this._ctx!.fillRect(xmin, ymin - fontSize - 8, textWidth + 14, fontSize + 10);

        // Draw text
        this._ctx!.fillStyle = "#ffffff";
        this._ctx!.fillText(labelText, xmin + 7, ymin - 7);
      });
    };
    img.src = this._capturedImage;
  }

  private _toggleStep(index: number, e: Event) {
    if (!this._result) return;
    const isChecked = (e.target as HTMLInputElement).checked;
    this._result.actionSteps[index].completed = isChecked;
    this.requestUpdate();
  }

  private async _downloadPdfReport() {
    if (!this._result) return;

    this._isLoading = true;
    this._loadingMessage = "Generiere PDF...";
    try {
      const inspectorName = localStorage.getItem("electrocheck_inspector_name") || "";
      const inspectorCompany = localStorage.getItem("electrocheck_inspector_company") || "";
      const inspectorId = localStorage.getItem("electrocheck_inspector_id") || "";

      // Convert our current canvas content (with drawings) to a DataURL to show in PDF
      const canvasDataUrl = this._canvas ? this._canvas.toDataURL("image/jpeg", 0.8) : this._capturedImage;

      const docDef = buildThermalPdfDocDefinition(
        this._result,
        canvasDataUrl,
        "Haftungsausschluss: Dieser Bericht basiert auf einer KI-gestützten thermografischen Bildanalyse. Thermografische Schätzungen ersetzen keine kalibrierten Messgeräte oder professionelle Abnahmen durch Sachverständige. Arbeiten an elektrischen Anlagen dürfen nur durch qualifizierte Elektrofachkräfte unter Einhaltung der 5 Sicherheitsregeln vorgenommen werden.",
        {
          name: inspectorName,
          company: inspectorCompany,
          id: inspectorId,
        }
      );

      const pdfMakeMod = await import("pdfmake/build/pdfmake");
      const pdfFontsMod = await import("pdfmake/build/vfs_fonts");
      const pdfMake = (pdfMakeMod as any).default || pdfMakeMod;
      const pdfFonts = (pdfFontsMod as any).default || pdfFontsMod;

      pdfMake.vfs = (pdfFonts as any).pdfMake ? (pdfFonts as any).pdfMake.vfs : (pdfFonts as any).vfs;
      
      pdfMake.createPdf(docDef).download(
        `Wärmebild_Protokoll_${new Date().toISOString().slice(0, 10)}.pdf`
      );
    } catch (e) {
      alert("Fehler bei der PDF-Erstellung.");
    } finally {
      this._isLoading = false;
    }
  }

  private _reset() {
    this._capturedImage = null;
    this._result = null;
    this._description = "";
    this._pdfPreviewUrl = null;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-thermal-analysis": EcThermalAnalysis;
  }
}
