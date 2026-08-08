import { LitElement, html, css } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import "@vaadin/button";
import { Html5Qrcode } from "html5-qrcode";

@customElement("ec-camera-capture")
export class EcCameraCapture extends LitElement {
  @property({ type: Boolean }) isLoading = false;
  @property({ type: Boolean }) isScanningQR = false;

  @state() private _stream: MediaStream | null = null;
  @state() private _isTorchOn = false;
  @state() private _hasTorch = false;
  @state() private _facingMode: "environment" | "user" = "environment";

  @query("video") private _video!: HTMLVideoElement;
  @query("#ui-canvas") private _uiCanvas!: HTMLCanvasElement;

  private _qrScanner: any = null;

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
    .media-box {
      width: 100%;
      aspect-ratio: 4 / 3;
      background: #090d16;
      border-radius: var(--radius-m, 16px);
      overflow: hidden;
      position: relative;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border, #64748b);
      max-width: 100%;
    }
    video, img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .camera-hint {
      position: absolute;
      bottom: 8px; left: 8px; right: 8px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #f8fafc;
      padding: 8px 12px;
      border-radius: var(--radius-s, 8px);
      text-align: center;
      font-size: 0.8rem;
      pointer-events: none;
      z-index: 10;
      box-shadow: var(--shadow-md);
    }
    .action-bar {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      justify-content: stretch;
      margin-top: 1rem;
    }
    .action-bar vaadin-button {
      flex: 1 1 calc(33% - 4px);
      min-width: 0;
      font-size: 0.8rem;
    }
    .scanner-overlay {
      position: absolute; top: 12.5%; left: 12.5%; right: 12.5%; bottom: 12.5%;
      border: 2px solid rgba(255, 255, 255, 0.4);
      box-shadow: 0 0 0 2000px rgba(9, 13, 22, 0.65);
      pointer-events: none;
      z-index: 5;
      border-radius: 4px;
    }
    .scanner-laser {
      position: absolute; width: 100%; height: 2px;
      background: var(--primary, #38bdf8); box-shadow: 0 0 12px var(--primary, #38bdf8);
      top: 0; animation: scan 2.5s ease-in-out infinite alternate;
    }
    .d-none {
      display: none !important;
    }
    @keyframes scan {
      0% { top: 0%; }
      100% { top: 100%; }
    }
  `;

  firstUpdated() {
    this.startCamera();
  }

  disconnectedCallback() {
    this.stopCamera();
    super.disconnectedCallback();
  }

  async startCamera() {
    this._isTorchOn = false;
    this._hasTorch = false;
    this.isScanningQR = false;
    
    if (this._stream) {
      this._stream.getTracks().forEach((t) => t.stop());
      this._stream = null;
      if (this._video) this._video.srcObject = null;
    }

    try {
      const constraints =
        this._facingMode === "environment"
          ? { facingMode: { exact: "environment" } }
          : { facingMode: "user" };

      this._stream = await navigator.mediaDevices.getUserMedia({
        video: constraints,
      });
      if (this._video) this._video.srcObject = this._stream;
      this._checkTorchCapabilities();
    } catch (e) {
      try {
        this._stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: this._facingMode },
        });
        if (this._video) this._video.srcObject = this._stream;
        this._checkTorchCapabilities();
      } catch (fallbackError) {
        alert("Kamera konnte nicht gestartet werden. Bitte Berechtigungen prüfen.");
      }
    }
  }

  private _checkTorchCapabilities() {
    if (!this._stream) {
      this._hasTorch = false;
      return;
    }
    const track = this._stream.getVideoTracks()[0];
    if (!track) {
      this._hasTorch = false;
      return;
    }
    const capabilities = (track as any).getCapabilities?.() || {};
    this._hasTorch = !!capabilities.torch;
  }

  async switchCamera() {
    this._facingMode =
      this._facingMode === "environment" ? "user" : "environment";

    if (this.isScanningQR) {
      await this.stopQRScanner();
      setTimeout(() => {
        this.startQRScanner();
      }, 300);
    } else {
      await this.startCamera();
    }
  }

  stopCamera() {
    this.stopQRScanner();
    this._isTorchOn = false;
    this._hasTorch = false;
    if (this._stream) {
      this._stream.getTracks().forEach((t) => t.stop());
      this._stream = null;
    }
    if (this._video) {
      this._video.srcObject = null;
    }
    this.dispatchEvent(new CustomEvent("camera-stopped"));
  }

  async toggleTorch() {
    if (!this._stream) return;
    const track = this._stream.getVideoTracks()[0];
    if (!track) return;
    const capabilities = (track as any).getCapabilities?.() || {};
    if (capabilities.torch) {
      try {
        this._isTorchOn = !this._isTorchOn;
        await track.applyConstraints({
          advanced: [{ torch: this._isTorchOn } as any]
        });
      } catch (e) {
        console.error("Taschenlampe konnte nicht gesteuert werden", e);
      }
    } else {
      alert("Taschenlampe wird von dieser Kamera nicht unterstützt.");
    }
  }

  async startQRScanner() {
    this.stopCamera();
    this.isScanningQR = true;

    await this.updateComplete;

    // Patch document.getElementById just for html5-qrcode
    const originalGetElementById = document.getElementById.bind(document);
    document.getElementById = (id: string) => {
      if (id === "qr-reader") {
        return this.shadowRoot?.getElementById("qr-reader") as HTMLElement;
      }
      return originalGetElementById(id);
    };

    try {
      this._qrScanner = new Html5Qrcode("qr-reader");
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      const strictConstraints =
        this._facingMode === "environment"
          ? { facingMode: { exact: "environment" } }
          : { facingMode: "user" };

      try {
        await this._qrScanner.start(
          strictConstraints,
          config,
          (decodedText: string) => {
            this._handleQRSuccess(decodedText);
          },
          () => {},
        );
      } catch (strictError) {
        await this._qrScanner.start(
          { facingMode: this._facingMode },
          config,
          (decodedText: string) => {
            this._handleQRSuccess(decodedText);
          },
          () => {},
        );
      }
    } catch (err) {
      alert("QR-Scanner konnte nicht gestartet werden. Berechtigungen prüfen.");
      this.stopQRScanner();
    } finally {
      document.getElementById = originalGetElementById;
    }
  }

  private _handleQRSuccess(text: string) {
    this.stopQRScanner();
    this.dispatchEvent(new CustomEvent("qr-detected", { detail: { text } }));
  }

  async stopQRScanner() {
    if (this._qrScanner && this._qrScanner.isScanning) {
      try {
        await this._qrScanner.stop();
      } catch (e) {
        console.warn("Fehler beim Stoppen des Scanners", e);
      }
      this._qrScanner.clear();
    }
    this.isScanningQR = false;
    this._qrScanner = null;
  }

  captureImage() {
    let capturedDataUrl: string | null = null;

    if (this.isScanningQR && this._qrScanner) {
      // In scanning mode we can't easily draw the video frame directly from a standard video element
      // since the html5-qrcode package manages it internally
      alert("Foto-Aufnahme während QR-Scan nicht möglich. Beende den QR-Scan zuerst.");
      return;
    } else if (this._video && this._uiCanvas) {
      if (!this._video.videoWidth || !this._video.videoHeight) {
        alert("Kamera-Stream ist nicht bereit. Bitte warten Sie kurz.");
        return;
      }

      const MAX_WIDTH = 800;
      let w = this._video.videoWidth;
      let h = this._video.videoHeight;

      if (w > MAX_WIDTH) {
        h = Math.floor(h * (MAX_WIDTH / w));
        w = MAX_WIDTH;
      }

      this._uiCanvas.width = w;
      this._uiCanvas.height = h;
      this._uiCanvas.getContext("2d")?.drawImage(this._video, 0, 0, w, h);
      capturedDataUrl = this._uiCanvas.toDataURL("image/jpeg", 0.7);
    }

    if (capturedDataUrl) {
      this.stopCamera();
      this.dispatchEvent(new CustomEvent("photo-captured", { detail: { image: capturedDataUrl } }));
    }
  }

  captureAndScanTypePlate() {
    if (!this._video || !this._uiCanvas) return;
    this._uiCanvas.width = this._video.videoWidth;
    this._uiCanvas.height = this._video.videoHeight;
    this._uiCanvas.getContext("2d")?.drawImage(this._video, 0, 0);
    const img = this._uiCanvas.toDataURL("image/jpeg", 0.8);
    this.stopCamera();
    this.dispatchEvent(new CustomEvent("ocr-scan-requested", { detail: { image: img } }));
  }

  render() {
    return html`
      <div class="media-box">
        ${this.isScanningQR
          ? html`
              <div id="qr-reader" style="width: 100%; height: 100%; overflow: hidden;"></div>
              <div class="camera-hint">🔳 <strong>QR-Scan aktiv</strong>: Zentriere den Code im Rahmen</div>
            `
          : html`
              <video autoplay playsinline ?hidden="${!this._stream}"></video>
              <canvas id="ui-canvas" class="d-none"></canvas>
              ${this._stream
                ? html`<div class="scanner-overlay"><div class="scanner-laser"></div></div>`
                : html`
                    <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center; justify-content: center; height: 100%;">
                      <vaadin-button theme="primary" @click="${this.startCamera}">📸 Kamera aktivieren</vaadin-button>
                      <vaadin-button theme="secondary" @click="${this.startQRScanner}">🔳 QR / Barcode scannen</vaadin-button>
                    </div>
                  `}
            `}
      </div>

      <div class="action-bar">
        ${this.isScanningQR
          ? html`
              <vaadin-button theme="primary error" @click="${this.stopQRScanner}">🚫 Aus</vaadin-button>
              <vaadin-button theme="secondary" @click="${this.switchCamera}">🔄 Wechseln</vaadin-button>
            `
          : this._stream
            ? html`
                <vaadin-button theme="tertiary error" @click="${this.stopCamera}">🚫 Aus</vaadin-button>
                <vaadin-button theme="secondary" @click="${this.switchCamera}">🔄 Wechseln</vaadin-button>
                ${this._hasTorch 
                  ? html`<vaadin-button theme="secondary" @click="${this.toggleTorch}">🔦 ${this._isTorchOn ? "Aus" : "Ein"}</vaadin-button>`
                  : ""}
                <vaadin-button theme="primary error" @click="${this.captureImage}">📸 Foto</vaadin-button>
                <vaadin-button theme="primary success" @click="${this.captureAndScanTypePlate}">🔍 OCR Scan</vaadin-button>
              `
            : ""}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-camera-capture": EcCameraCapture;
  }
}
