import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@vaadin/button";
import "@vaadin/text-field";

interface WholesalerPortal {
  id: string;
  name: string;
  badge: string;
  color: string;
  bgGlow: string;
  getUrl: (query: string) => string;
  description: string;
}

@customElement("ec-wholesaler-finder")
export class EcWholesalerFinder extends LitElement {
  @property({ type: String }) searchTerm: string = "";

  @state() private _query: string = "";
  @state() private _copied: boolean = false;

  private _portals: WholesalerPortal[] = [
    {
      id: "conrad",
      name: "Conrad B2B",
      badge: "🔵 B2B Portal",
      color: "#0284c7",
      bgGlow: "rgba(2, 132, 199, 0.08)",
      getUrl: (q) => `https://www.conrad.de/de/search.html?search=${encodeURIComponent(q)}`,
      description: "Elektronik & Bauteile für Geschäftskunden",
    },
    {
      id: "rs",
      name: "RS Components",
      badge: "🔴 Industrie-Großhandel",
      color: "#dc2626",
      bgGlow: "rgba(220, 38, 38, 0.08)",
      getUrl: (q) => `https://de.rs-online.com/web/c/?searchTerm=${encodeURIComponent(q)}`,
      description: "Automation, Schaltschrank- & Messtechnik",
    },
    {
      id: "reichelt",
      name: "Reichelt Elektronik",
      badge: "🟡 Profi-Elektronik",
      color: "#d97706",
      bgGlow: "rgba(217, 119, 6, 0.08)",
      getUrl: (q) => `https://www.reichelt.de/index.html?ACTION=446&q=${encodeURIComponent(q)}`,
      description: "Bauelemente, Kabel, Sicherungen & Werkzeug",
    },
    {
      id: "mercateo",
      name: "Mercateo B2B",
      badge: "🟢 Beschaffungsplattform",
      color: "#059669",
      bgGlow: "rgba(5, 150, 105, 0.08)",
      getUrl: (q) => `https://www.mercateo.com/s/?q=${encodeURIComponent(q)}`,
      description: "B2B-Marktplatz für Handwerk & Industrie",
    },
    {
      id: "amazon",
      name: "Amazon Business",
      badge: "🟧 Direktversand",
      color: "#ea580c",
      bgGlow: "rgba(234, 88, 12, 0.08)",
      getUrl: (q) => `https://www.amazon.de/s?k=${encodeURIComponent(q)}`,
      description: "Schnelle Lieferung für Standard-Ersatzteile",
    },
  ];

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
    .wholesaler-card {
      margin-top: 1rem;
      padding: 1.25rem;
      background: var(--bg-card, #ffffff);
      border-radius: var(--radius-m, 12px);
      border: 1px solid var(--border, #cbd5e1);
      text-align: left;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 0.75rem;
    }
    h4 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .subtitle {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin: 0 0 1rem 0;
    }
    .search-bar {
      display: flex;
      gap: 8px;
      margin-bottom: 1rem;
      align-items: center;
    }
    .portal-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 10px;
    }
    .portal-item {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid var(--border, #cbd5e1);
      background: var(--bg-app, #f8fafc);
      transition: all 0.2s ease;
      text-decoration: none;
      color: inherit;
    }
    .portal-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    .portal-badge {
      font-size: 0.75rem;
      font-weight: bold;
      margin-bottom: 4px;
    }
    .portal-name {
      font-size: 0.95rem;
      font-weight: 700;
      margin-bottom: 4px;
      color: var(--text-primary);
    }
    .portal-desc {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-bottom: 10px;
      line-height: 1.3;
    }
    .portal-link-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: bold;
      color: #ffffff;
      text-decoration: none;
      transition: opacity 0.2s;
    }
    .portal-link-btn:hover {
      opacity: 0.9;
    }
  `;

  willUpdate(changedProperties: Map<PropertyKey, unknown>) {
    if (changedProperties.has("searchTerm") && this.searchTerm) {
      this._query = this.searchTerm;
    }
  }

  private _copyToClipboard() {
    if (!this._query) return;
    navigator.clipboard.writeText(this._query);
    this._copied = true;
    setTimeout(() => {
      this._copied = false;
    }, 2000);
  }

  render() {
    const q = this._query.trim() || this.searchTerm.trim() || "Elektro Bauteil";

    return html`
      <div class="wholesaler-card">
        <div class="header-row">
          <h4>🛒 B2B Elektro-Großhändler Ersatzteilfinder</h4>
          <vaadin-button
            theme="secondary"
            @click="${this._copyToClipboard}"
            style="min-height: auto; height: 30px; font-size: 0.8rem;"
          >
            ${this._copied ? "✅ Kopiert!" : "📋 Suchbegriff kopieren"}
          </vaadin-button>
        </div>
        <p class="subtitle">
          Direktsuche bei Fachgroßhändlern für professionelle Elektrokomponenten & Ersatzteile:
        </p>

        <div class="search-bar">
          <vaadin-text-field
            label="Suchbegriff / Teilenummer / EAN"
            .value="${this._query}"
            @value-changed="${(e: CustomEvent) => (this._query = e.detail.value)}"
            style="flex: 1;"
          ></vaadin-text-field>
        </div>

        <div class="portal-grid">
          ${this._portals.map(
            (p) => html`
              <div
                class="portal-item"
                style="background: ${p.bgGlow}; border-color: ${p.color};"
              >
                <div>
                  <div class="portal-badge" style="color: ${p.color};">${p.badge}</div>
                  <div class="portal-name">${p.name}</div>
                  <div class="portal-desc">${p.description}</div>
                </div>
                <a
                  class="portal-link-btn"
                  style="background: ${p.color};"
                  href="${p.getUrl(q)}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🔍 Bei ${p.name} suchen ↗
                </a>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-wholesaler-finder": EcWholesalerFinder;
  }
}
