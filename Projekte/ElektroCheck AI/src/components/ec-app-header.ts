import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@vaadin/button";
import wizardStyles from "./ec-diagnosis-wizard.css?inline";

export type AppTab = "diagnose" | "dashboard" | "thermal" | "calculator" | "rules" | "schematic" | "gbu";

const TABS: ReadonlyArray<{ id: AppTab; label: string }> = [
  { id: "diagnose", label: "📷 Diagnose" },
  { id: "thermal", label: "🔥 Wärmebild" },
  { id: "dashboard", label: "📊 Dashboard" },
  { id: "calculator", label: "⚡ Rechner" },
  { id: "rules", label: "📚 VDE-Regeln" },
  { id: "schematic", label: "📐 Schaltplan" },
  { id: "gbu", label: "🛡️ GBU" },
];

/**
 * Kopfzeile mit Tab-Navigation und Schnellschaltern.
 * Events: tab-changed {tab}, toggle-glove, toggle-contrast, open-settings, toggle-theme
 */
@customElement("ec-app-header")
export class EcAppHeader extends LitElement {
  static styles = unsafeCSS(wizardStyles);

  @property({ type: String }) activeTab: AppTab = "diagnose";
  @property({ type: Boolean }) gloveMode = false;
  @property({ type: Boolean }) highContrast = false;
  @property({ type: Boolean }) darkMode = false;

  private _emit(name: string, detail?: unknown) {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }

  render() {
    return html`
      <header class="header">
        <div class="header-left">
          <h1 class="header-title">ElectroCheck AI</h1>
          ${TABS.map(
            (tab) => html`
              <vaadin-button
                theme="${this.activeTab === tab.id ? "primary" : "secondary"}"
                @click="${() => this._emit("tab-changed", { tab: tab.id })}"
                >${tab.label}</vaadin-button
              >
            `,
          )}
        </div>
        <div style="display: flex; gap: 4px;">
          <vaadin-button
            theme="${this.gloveMode ? "primary" : "secondary"}"
            @click="${() => this._emit("toggle-glove")}"
            title="Handschuh-Modus (Große Buttons)"
            aria-label="Handschuh-Modus (Große Buttons)"
            >🧤</vaadin-button
          >
          <vaadin-button
            theme="${this.highContrast ? "primary" : "secondary"}"
            @click="${() => this._emit("toggle-contrast")}"
            title="High-Contrast Outdoor Modus"
            aria-label="High-Contrast Outdoor Modus"
            >🔆</vaadin-button
          >
          <vaadin-button
            theme="secondary"
            @click="${() => this._emit("open-settings")}"
            aria-label="Einstellungen"
            >⚙️</vaadin-button
          >
          <vaadin-button
            theme="secondary"
            @click="${() => this._emit("toggle-theme")}"
            aria-label="Farbschema wechseln"
            >${this.darkMode ? "☀️" : "🌙"}</vaadin-button
          >
        </div>
      </header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-app-header": EcAppHeader;
  }
}
