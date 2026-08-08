import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import "@vaadin/text-field";
import "@vaadin/button";
import { VDE_RULES_DB } from "../data/vde-rules-db";
import wizardStyles from "./ec-diagnosis-wizard.css?inline";

@customElement("ec-vde-rules")
export class EcVdeRules extends LitElement {
  static styles = [
    unsafeCSS(wizardStyles),
    css`
      .search-box {
        margin-bottom: 1.25rem;
      }
      .rules-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .rule-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-m);
        padding: 1.25rem;
        text-align: left;
        cursor: pointer;
        transition: transform 0.2s ease, border-color 0.2s ease;
      }
      .rule-card:hover {
        transform: translateY(-2px);
        border-color: var(--primary);
      }
      .rule-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 8px;
      }
      .rule-title {
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--text-primary);
        margin: 0;
      }
      .rule-standard {
        font-size: 0.75rem;
        font-weight: 700;
        background: rgba(2, 119, 189, 0.15);
        color: var(--primary);
        padding: 4px 8px;
        border-radius: var(--radius-s);
      }
      .rule-category {
        font-size: 0.75rem;
        color: var(--text-muted);
        text-transform: uppercase;
        font-weight: bold;
        letter-spacing: 0.05em;
        margin-top: 4px;
      }
      .rule-summary {
        font-size: 0.85rem;
        color: var(--text-secondary);
        margin-top: 8px;
        line-height: 1.5;
      }
      .rule-details {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px dashed var(--border);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .limit-section h5, .tips-section h5 {
        margin: 0 0 6px 0;
        font-size: 0.85rem;
        font-weight: bold;
        color: var(--text-primary);
      }
      .limit-list, .tips-list {
        margin: 0;
        padding-left: 20px;
        font-size: 0.8rem;
        color: var(--text-secondary);
        line-height: 1.5;
      }
      .limit-list li {
        margin-bottom: 4px;
      }
      .limit-list li::marker {
        color: var(--danger);
      }
      .tips-list li::marker {
        color: var(--success);
      }
      .category-filters {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }
      .filter-chip {
        font-size: 0.75rem;
        padding: 6px 12px;
        border-radius: 20px;
        border: 1px solid var(--border);
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s;
      }
      .filter-chip.active {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
      }
    `
  ];

  @state() private _searchQuery = "";
  @state() private _selectedCategory = "";
  @state() private _expandedRuleId: string | null = null;

  private _toggleExpand(id: string) {
    if (this._expandedRuleId === id) {
      this._expandedRuleId = null;
    } else {
      this._expandedRuleId = id;
    }
  }

  render() {
    const categories = Array.from(new Set(VDE_RULES_DB.map(r => r.category)));
    
    const filteredRules = VDE_RULES_DB.filter(rule => {
      const matchesSearch = 
        rule.title.toLowerCase().includes(this._searchQuery.toLowerCase()) ||
        rule.standard.toLowerCase().includes(this._searchQuery.toLowerCase()) ||
        rule.summary.toLowerCase().includes(this._searchQuery.toLowerCase());
      
      const matchesCategory = !this._selectedCategory || rule.category === this._selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    return html`
      <div class="card result-card">
        <h3 class="m-0" style="color: var(--primary); display: flex; align-items: center; gap: 8px;">
          📚 VDE-Offline-Regelwerk
        </h3>
        <p style="font-size: 0.85rem; margin-top: 4px;">
          Durchsuchen Sie Grenzwerte, Prüfvorgaben und Sicherheitsregeln komplett offline vor Ort.
        </p>

        <!-- Search Bar -->
        <vaadin-text-field
          class="w-100 search-box"
          placeholder="Nach Norm, Grenzwert oder Begriff suchen..."
          .value="${this._searchQuery}"
          @value-changed="${(e: CustomEvent) => this._searchQuery = e.detail.value}"
          clear-button-visible
        >
          <span slot="prefix">🔍</span>
        </vaadin-text-field>

        <!-- Category Filters -->
        <div class="category-filters">
          <button 
            class="filter-chip ${!this._selectedCategory ? "active" : ""}"
            @click="${() => this._selectedCategory = ""}"
          >
            Alle
          </button>
          ${categories.map(cat => html`
            <button 
              class="filter-chip ${this._selectedCategory === cat ? "active" : ""}"
              @click="${() => this._selectedCategory = cat}"
            >
              ${cat}
            </button>
          `)}
        </div>

        <!-- Rules List -->
        <div class="rules-container">
          ${filteredRules.length > 0 ? filteredRules.map(rule => {
            const isExpanded = this._expandedRuleId === rule.id;
            return html`
              <div class="rule-card" @click="${() => this._toggleExpand(rule.id)}">
                <div class="rule-header">
                  <div>
                    <h4 class="rule-title">${rule.title}</h4>
                    <div class="rule-category">${rule.category}</div>
                  </div>
                  <span class="rule-standard">${rule.standard}</span>
                </div>
                <div class="rule-summary">
                  ${rule.summary}
                </div>
                
                ${isExpanded ? html`
                  <div class="rule-details" @click="${(e: Event) => e.stopPropagation()}">
                    <div class="limit-section">
                      <h5>⚠️ Grenzwerte & Kriterien:</h5>
                      <ul class="limit-list">
                        ${rule.limitValues.map(v => html`<li>${v}</li>`)}
                      </ul>
                    </div>
                    
                    <div class="tips-section">
                      <h5>💡 Praxistipps & Vorgehensweise:</h5>
                      <ul class="tips-list">
                        ${rule.tips.map(t => html`<li>${t}</li>`)}
                      </ul>
                    </div>
                  </div>
                ` : html`
                  <div style="font-size: 0.75rem; color: var(--primary); text-align: right; margin-top: 8px; font-weight: bold;">
                    Details anzeigen 👇
                  </div>
                `}
              </div>
            `;
          }) : html`
            <div style="text-align: center; padding: 2rem; color: var(--text-muted); font-style: italic;">
              Keine passenden VDE-Regeln gefunden.
            </div>
          `}
        </div>
      </div>
    `;
  }
}
