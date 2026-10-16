import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import wizardStyles from "./ec-diagnosis-wizard.css?inline";
import type { DiagnosisResult } from "../services/ai-types";
import { showToast } from "../utils/toast";

type BoundingBox = NonNullable<DiagnosisResult["boundingBoxes"]>[number];

/** Rechteck in Canvas-Pixeln aus einer auf 0–1000 normierten Box [ymin, xmin, ymax, xmax]. */
function toPixelRect(box: BoundingBox, width: number, height: number) {
  const [ymin, xmin, ymax, xmax] = box.box_2d;
  return {
    xmin: (xmin / 1000) * width,
    ymin: (ymin / 1000) * height,
    xmax: (xmax / 1000) * width,
    ymax: (ymax / 1000) * height,
  };
}

const isValidBox = (box: BoundingBox): boolean => Array.isArray(box.box_2d) && box.box_2d.length === 4;

/**
 * Diagnosebild mit Freihand-Markierung und anklickbaren KI-Bounding-Boxes.
 * Das Bild inkl. Markierungen liefert getDataUrl().
 */
@customElement("ec-image-annotator")
export class EcImageAnnotator extends LitElement {
  static styles = unsafeCSS(wizardStyles);

  @property({ type: String }) image: string | null = null;
  /** Bitte mit stabiler Referenz übergeben (nicht pro Render ein neues Array), sonst wird jedes Mal neu gezeichnet. */
  @property({ attribute: false }) boxes?: BoundingBox[];

  @state() private _selectedLabel: string | null = null;
  @query("#drawing-canvas") private _canvas?: HTMLCanvasElement;

  private _ctx: CanvasRenderingContext2D | null = null;
  private _img: HTMLImageElement | null = null;
  private _isDrawing = false;
  private _lastX = 0;
  private _lastY = 0;

  /** Aktuelles Bild inkl. Markierungen als JPEG-Data-URL (null, solange kein Bild geladen ist). */
  getDataUrl(quality = 0.8): string | null {
    return this._canvas ? this._canvas.toDataURL("image/jpeg", quality) : null;
  }

  updated(changed: Map<PropertyKey, unknown>) {
    if (changed.has("image")) {
      this._selectedLabel = null;
      this._loadImage();
    } else if (changed.has("boxes")) {
      this._paint();
    }
  }

  private _loadImage() {
    if (!this.image || !this._canvas) return;
    const img = new Image();
    img.onload = () => {
      this._img = img;
      this._paint();
    };
    img.src = this.image;
  }

  /** Zeichnet Bild und (falls vorhanden) Bounding-Boxes neu; Freihand-Markierungen gehen dabei verloren. */
  private _paint() {
    const canvas = this._canvas;
    const img = this._img;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    this._ctx = ctx;

    if (canvas.width !== img.width || canvas.height !== img.height) {
      canvas.width = img.width;
      canvas.height = img.height;
    }
    ctx.drawImage(img, 0, 0);

    const w = canvas.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const box of this.boxes ?? []) {
      if (!isValidBox(box)) continue;
      this._drawBox(ctx, box, w, canvas.height);
    }

    // Stift für Freihand-Markierungen
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
  }

  private _drawBox(ctx: CanvasRenderingContext2D, box: BoundingBox, w: number, h: number) {
    const { xmin, ymin, xmax, ymax } = toPixelRect(box, w, h);
    const isSelected = box.label === this._selectedLabel;

    ctx.lineWidth = isSelected ? Math.max(6, Math.floor(w / 100)) : Math.max(3, Math.floor(w / 200));
    ctx.strokeStyle = isSelected ? "#eab308" : "#10b981"; // Gelb falls selektiert, Grün falls normal
    ctx.strokeRect(xmin, ymin, xmax - xmin, ymax - ymin);

    ctx.fillStyle = isSelected ? "rgba(234, 179, 8, 0.95)" : "rgba(16, 185, 129, 0.85)";
    const fontSize = Math.max(12, Math.floor(w / 40));
    ctx.font = `bold ${fontSize}px var(--font-sans, sans-serif)`;
    const textWidth = ctx.measureText(box.label).width;
    ctx.fillRect(xmin, ymin - fontSize - 6, textWidth + 12, fontSize + 8);

    ctx.fillStyle = "#ffffff";
    ctx.fillText(box.label, xmin + 6, ymin - 5);
  }

  private _toCanvasPoint(e: PointerEvent): { x: number; y: number } {
    const canvas = this._canvas!;
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    return { x: (e.clientX - rect.left) * scale, y: (e.clientY - rect.top) * scale };
  }

  private _onPointerDown(e: PointerEvent) {
    if (!this._canvas) return;
    const { x, y } = this._toCanvasPoint(e);

    const clickedBox = (this.boxes ?? []).find((box) => {
      if (!isValidBox(box)) return false;
      const r = toPixelRect(box, this._canvas!.width, this._canvas!.height);
      return x >= r.xmin && x <= r.xmax && y >= r.ymin && y <= r.ymax;
    });

    if (clickedBox) {
      this._selectedLabel = clickedBox.label;
      this._paint();
      showToast(`Ausgewählt: ${clickedBox.label}`, "info", 2500);
      return;
    }

    this._isDrawing = true;
    this._lastX = x;
    this._lastY = y;
  }

  private _onPointerMove(e: PointerEvent) {
    if (!this._isDrawing || !this._ctx || !this._canvas) return;
    const { x, y } = this._toCanvasPoint(e);
    this._ctx.beginPath();
    this._ctx.moveTo(this._lastX, this._lastY);
    this._ctx.lineTo(x, y);
    this._ctx.stroke();
    this._lastX = x;
    this._lastY = y;
  }

  render() {
    return html`
      <div class="media-box" style="background: var(--surface);">
        <canvas
          id="drawing-canvas"
          @pointerdown="${this._onPointerDown}"
          @pointermove="${this._onPointerMove}"
          @pointerup="${() => (this._isDrawing = false)}"
          aria-label="Diagnosebild mit Markierungsfunktion"
        ></canvas>
        <div class="camera-hint" role="status" aria-live="polite">
          ✏️ <strong>Markiere den Fehler</strong> auf dem Bild für eine genauere Analyse
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-image-annotator": EcImageAnnotator;
  }
}
