import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import "@vaadin/button";

@customElement("ec-welcome")
export class EcWelcome extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-height: 100vh;
      min-height: 100dvh;
      padding: 1.5rem 1rem;
      padding-top: calc(1.5rem + env(safe-area-inset-top, 0px));
      padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
      background-color: var(--bg-app);
      font-family: var(--font-sans);
      color: var(--text-primary);
      text-align: center;
    }

    .welcome-container {
      max-width: 480px;
      width: 100%;
      background: var(--bg-card);
      padding: 2rem 1.5rem;
      border-radius: var(--radius-m);
      border: 2px solid var(--border);
      box-shadow: var(--shadow-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    /* Animated Bolt Icon */
    .icon-container {
      width: 72px;
      height: 72px;
      background: var(--primary-glow);
      border: 3px solid var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.25rem;
      margin-bottom: 0.25rem;
      box-shadow: var(--shadow-glow);
      animation: pulse 2.5s infinite;
      flex-shrink: 0;
    }

    h1 {
      font-size: 1.75rem;
      font-weight: 800;
      margin: 0;
      background: linear-gradient(135deg, var(--primary), var(--success));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .subtitle {
      font-size: 0.9rem;
      line-height: 1.5;
      color: var(--text-secondary);
      margin: 0;
      font-weight: 500;
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      width: 100%;
      text-align: left;
      margin: 0.25rem 0;
    }

    .feature-item {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      padding: 0.625rem;
      background: var(--bg-app);
      border: 1px solid var(--border);
      border-radius: var(--radius-s);
      transition: border-color 0.2s;
    }

    .feature-item:hover {
      border-color: var(--primary);
    }

    .feature-icon {
      font-size: 1.15rem;
      flex-shrink: 0;
      line-height: 1;
    }

    .feature-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .feature-title {
      font-weight: 700;
      font-size: 0.85rem;
      color: var(--text-primary);
    }

    .feature-desc {
      font-size: 0.75rem;
      color: var(--text-muted);
      line-height: 1.4;
    }

    .start-button {
      width: 100%;
      height: 3.25rem;
      font-weight: 800;
      font-size: 1.05rem;
      border-radius: var(--radius-s);
      box-shadow: 0 4px 12px var(--primary-glow);
      transition: all 0.2s ease;
      cursor: pointer;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }

    .start-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px var(--primary-glow);
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 var(--primary-glow);
        transform: scale(1);
      }
      70% {
        box-shadow: 0 0 0 15px rgba(2, 119, 189, 0);
        transform: scale(1.05);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(2, 119, 189, 0);
        transform: scale(1);
      }
    }

    /* --- Small Phones (max 374px) --- */
    @media screen and (max-width: 374px) {
      :host {
        padding: 1rem 0.75rem;
      }

      .welcome-container {
        padding: 1.25rem 1rem;
        gap: 1rem;
      }

      .icon-container {
        width: 56px;
        height: 56px;
        font-size: 1.75rem;
      }

      h1 {
        font-size: 1.35rem;
      }

      .subtitle {
        font-size: 0.8rem;
      }

      .feature-item {
        padding: 0.5rem;
      }

      .feature-title {
        font-size: 0.8rem;
      }

      .feature-desc {
        font-size: 0.7rem;
      }

      .start-button {
        height: 3rem;
        font-size: 0.95rem;
      }
    }

    /* --- Tablets & Desktop (768px+) --- */
    @media screen and (min-width: 768px) {
      .welcome-container {
        max-width: 520px;
        padding: 2.5rem 2rem;
        gap: 1.5rem;
      }

      h1 {
        font-size: 2.25rem;
      }

      .subtitle {
        font-size: 1rem;
      }

      .feature-item {
        padding: 0.75rem;
      }

      .feature-title {
        font-size: 0.9rem;
      }

      .feature-desc {
        font-size: 0.8rem;
      }

      .start-button {
        height: 3.5rem;
        font-size: 1.1rem;
      }
    }

    /* Print hidden */
    @media print {
      :host { display: none !important; }
    }

    /* Dyslexie (LRS) Lese-Hilfe Support */
    :host-context(.accessible-reading) p,
    :host-context(.accessible-reading) span,
    :host-context(.accessible-reading) div,
    :host-context(.accessible-reading) label,
    :host-context(.accessible-reading) h1,
    :host-context(.accessible-reading) h2,
    :host-context(.accessible-reading) vaadin-button {
      word-spacing: 0.15em !important;
      letter-spacing: 0.05em !important;
      line-height: 1.75 !important;
    }
  `

  render() {
    return html`
      <div class="welcome-container">
        <div class="icon-container" aria-hidden="true">
          ⚡
        </div>
        <div>
          <h1>ElectroCheck AI</h1>
          <p class="subtitle">
            KI-gestützte Fehlerdiagnose & digitale Wartungsprotokolle für Elektrofachkräfte.
          </p>
        </div>

        <div class="features-list">
          <div class="feature-item">
            <span class="feature-icon" aria-hidden="true">📸</span>
            <div class="feature-text">
              <span class="feature-title">Foto-Diagnose & Markierung</span>
              <span class="feature-desc">Fotografiere den Defekt, markiere die Stelle und erhalte eine fundierte KI-Fehlerursachenanalyse.</span>
            </div>
          </div>

          <div class="feature-item">
            <span class="feature-icon" aria-hidden="true">🔍</span>
            <div class="feature-text">
              <span class="feature-title">OCR Typenschild-Scanner</span>
              <span class="feature-desc">Lese Typenschilder automatisch per OCR aus und durchsuche direkt passende Datenblätter der Hersteller.</span>
            </div>
          </div>

          <div class="feature-item">
            <span class="feature-icon" aria-hidden="true">🗣️</span>
            <div class="feature-text">
              <span class="feature-title">Geführte Reparatur (TTS)</span>
              <span class="feature-desc">Lass dir die einzelnen VDE-konformen Arbeitsschritte vorlesen – ideal für das Arbeiten mit freien Händen.</span>
            </div>
          </div>

          <div class="feature-item">
            <span class="feature-icon" aria-hidden="true">📄</span>
            <div class="feature-text">
              <span class="feature-title">Wartungsprotokoll & Tickets</span>
              <span class="feature-desc">Erstelle professionelle PDF-Wartungsprotokolle und exportiere Tickets direkt an Instandhaltungssysteme.</span>
            </div>
          </div>
        </div>

        <vaadin-button
          theme="primary"
          class="start-button"
          @click="${this._handleStart}"
        >
          Diagnose Starten 🔓
        </vaadin-button>
      </div>
    `;
  }

  private _handleStart() {
    this.dispatchEvent(new CustomEvent("start"));
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "ec-welcome": EcWelcome;
  }
}
