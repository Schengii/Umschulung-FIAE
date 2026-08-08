import { LitElement, html, css } from "lit";
import { customElement, query } from "lit/decorators.js";
import "@vaadin/button";

@customElement("ec-signature-pad")
export class EcSignaturePad extends LitElement {
  @query("canvas") private _canvas!: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D | null = null;
  private _isDrawing = false;
  private _lastX = 0;
  private _lastY = 0;
  private _hasSigned = false;

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
    .signature-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }
    .canvas-wrapper {
      width: 100%;
      height: 150px;
      border: 2px dashed var(--border, #64748b);
      border-radius: var(--radius-s, 8px);
      background: #ffffff;
      overflow: hidden;
      position: relative;
    }
    canvas {
      width: 100%;
      height: 100%;
      cursor: crosshair;
      touch-action: none; /* Verhindert Scrollen beim Zeichnen auf Mobilgeräten */
    }
    .canvas-placeholder {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 0.8rem;
      color: #94a3b8;
      pointer-events: none;
      user-select: none;
    }
    .controls {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    
    /* Dyslexie (LRS) Lese-Hilfe Support */
    :host-context(.accessible-reading) p,
    :host-context(.accessible-reading) span,
    :host-context(.accessible-reading) div,
    :host-context(.accessible-reading) label,
    :host-context(.accessible-reading) vaadin-button {
      word-spacing: 0.15em !important;
      letter-spacing: 0.05em !important;
      line-height: 1.75 !important;
    }
  `;

  firstUpdated() {
    this._initCanvas();
  }

  private _initCanvas() {
    const rect = this._canvas.getBoundingClientRect();
    // Set internal resolution to match actual display size
    this._canvas.width = rect.width || 400;
    this._canvas.height = rect.height || 150;

    this._ctx = this._canvas.getContext("2d");
    if (this._ctx) {
      this._ctx.strokeStyle = "#000000"; // Schwarz für offizielle Unterschriften
      this._ctx.lineWidth = 3;
      this._ctx.lineCap = "round";
      this._ctx.lineJoin = "round";
    }
  }

  private _handlePointerDown(e: PointerEvent) {
    this._isDrawing = true;
    const rect = this._canvas.getBoundingClientRect();
    // Calculate scale factor in case display size differs from coordinate size
    const scaleX = this._canvas.width / rect.width;
    const scaleY = this._canvas.height / rect.height;

    this._lastX = (e.clientX - rect.left) * scaleX;
    this._lastY = (e.clientY - rect.top) * scaleY;

    this._hasSigned = true;
    this.requestUpdate();

    // Event auslösen
    this._notifyChange();
  }

  private _handlePointerMove(e: PointerEvent) {
    if (!this._isDrawing || !this._ctx) return;
    
    const rect = this._canvas.getBoundingClientRect();
    const scaleX = this._canvas.width / rect.width;
    const scaleY = this._canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    this._ctx.beginPath();
    this._ctx.moveTo(this._lastX, this._lastY);
    this._ctx.lineTo(x, y);
    this._ctx.stroke();

    this._lastX = x;
    this._lastY = y;
  }

  private _handlePointerUp() {
    this._isDrawing = false;
  }

  clear() {
    if (this._ctx) {
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
      this._hasSigned = false;
      this.requestUpdate();
      this._notifyChange();
    }
  }

  getSignatureDataUrl(): string | null {
    if (!this._hasSigned) return null;
    return this._canvas.toDataURL("image/png");
  }

  private _notifyChange() {
    this.dispatchEvent(
      new CustomEvent("signature-changed", {
        detail: {
          hasSigned: this._hasSigned,
          dataUrl: this.getSignatureDataUrl(),
        },
      })
    );
  }

  render() {
    return html`
      <div class="signature-container">
        <div class="canvas-wrapper">
          ${!this._hasSigned
            ? html`<div class="canvas-placeholder">Hier unterschreiben</div>`
            : ""}
          <canvas
            @pointerdown="${this._handlePointerDown}"
            @pointermove="${this._handlePointerMove}"
            @pointerup="${this._handlePointerUp}"
            @pointerleave="${this._handlePointerUp}"
          ></canvas>
        </div>
        <div class="controls">
          <vaadin-button theme="tertiary" @click="${this.clear}">Löschen</vaadin-button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-signature-pad": EcSignaturePad;
  }
}
