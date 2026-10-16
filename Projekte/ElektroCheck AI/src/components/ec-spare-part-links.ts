import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@vaadin/button";
import wizardStyles from "./ec-diagnosis-wizard.css?inline";

const SHOPS: ReadonlyArray<{ label: string; url: (term: string) => string; theme?: string; className?: string }> = [
  { label: "🛒 Amazon", url: (t) => `https://www.amazon.de/s?k=${t}`, className: "btn-amazon" },
  { label: "🏢 Conrad B2B", url: (t) => `https://www.conrad.de/de/search.html?search=${t}`, theme: "secondary" },
  { label: "🔧 RS Components", url: (t) => `https://de.rs-online.com/web/c/?searchTerm=${t}`, theme: "secondary" },
  { label: "🔌 Reichelt", url: (t) => `https://www.reichelt.de/de/de/index.html?ACTION=446&LA=4&q=${t}`, theme: "secondary" },
  { label: "📦 Mercateo", url: (t) => `https://www.mercateo.com/q?query=${t}`, theme: "secondary" },
];

/** Direktlinks zur Ersatzteilsuche bei gängigen Händlern. */
@customElement("ec-spare-part-links")
export class EcSparePartLinks extends LitElement {
  static styles = unsafeCSS(wizardStyles);

  @property({ type: String }) searchTerm = "";

  render() {
    if (!this.searchTerm) return html``;
    const term = encodeURIComponent(this.searchTerm);

    return html`
      <div style="margin-top: 16px; text-align: left;">
        <div style="font-size: 0.85rem; font-weight: bold; color: var(--text-secondary); margin-bottom: 6px;">
          🛒 Ersatzteil bestellen bei:
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px;">
          ${SHOPS.map(
            (shop) => html`
              <a href="${shop.url(term)}" target="_blank" rel="noopener noreferrer" class="no-underline">
                <vaadin-button
                  class="${shop.className ?? ""}"
                  theme="${shop.theme ?? ""}"
                  style="width: 100%;"
                  >${shop.label}</vaadin-button
                >
              </a>
            `,
          )}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-spare-part-links": EcSparePartLinks;
  }
}
