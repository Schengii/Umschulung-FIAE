import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@vaadin/button";
import "@vaadin/text-field";
import { calculateRoi, type RoiCalculatorResult } from "../utils/roi-calculator";

@customElement("ec-roi-calculator")
export class EcRoiCalculator extends LitElement {
  @property({ type: Number }) materialCost: number = 25;
  @property({ type: Number }) laborHours: number = 1.0;
  @property({ type: Number }) hourlyRate: number = 75;
  @property({ type: Number }) replacementPrice: number = 450;

  @state() private _deviceAgeYears: number = 3;

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
    .roi-card {
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
    .grid-inputs {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 10px;
      margin-bottom: 1rem;
    }
    .result-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 8px;
      color: #ffffff;
      font-weight: bold;
      font-size: 0.9rem;
      margin-top: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .summary-box {
      background: var(--bg-app, #f8fafc);
      border: 1px solid var(--border, #cbd5e1);
      border-radius: 8px;
      padding: 12px;
      margin-top: 1rem;
      font-size: 0.85rem;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      border-bottom: 1px dashed var(--border, #cbd5e1);
    }
    .summary-row:last-child {
      border-bottom: none;
    }
  `;

  private _getRoiResult(): RoiCalculatorResult {
    return calculateRoi({
      materialCost: this.materialCost,
      laborHours: this.laborHours,
      hourlyRate: this.hourlyRate,
      replacementPrice: this.replacementPrice,
      deviceAgeYears: this._deviceAgeYears,
    });
  }

  private _notifyChange() {
    const result = this._getRoiResult();
    this.dispatchEvent(
      new CustomEvent("roi-changed", {
        detail: {
          materialCost: this.materialCost,
          laborHours: this.laborHours,
          hourlyRate: this.hourlyRate,
          replacementPrice: this.replacementPrice,
          deviceAgeYears: this._deviceAgeYears,
          totalRepairCost: result.totalRepairCost,
          ratioPercent: result.repairCostRatioPercent,
          savings: result.savingsComparedToNew,
          recommendation: result.recommendationLabel,
        },
      })
    );
  }

  render() {
    const roi = this._getRoiResult();

    return html`
      <div class="roi-card">
        <div class="header-row">
          <h4>📊 Reparatur-vs.-Neukauf Wirtschaftlichkeits-Analyse (ROI)</h4>
        </div>
        <p class="subtitle">
          Kalkulieren Sie Reparaturkosten gegen den Neukaufswert zur fachgerechten Kundenberatung:
        </p>

        <div class="grid-inputs">
          <vaadin-text-field
            label="Materialkosten (€)"
            type="number"
            .value="${String(this.materialCost)}"
            @value-changed="${(e: CustomEvent) => {
              this.materialCost = parseFloat(e.detail.value) || 0;
              this._notifyChange();
            }}"
          ></vaadin-text-field>

          <vaadin-text-field
            label="Arbeitsaufwand (Std.)"
            type="number"
            step="0.25"
            .value="${String(this.laborHours)}"
            @value-changed="${(e: CustomEvent) => {
              this.laborHours = parseFloat(e.detail.value) || 0;
              this._notifyChange();
            }}"
          ></vaadin-text-field>

          <vaadin-text-field
            label="Stundensatz (€/h)"
            type="number"
            .value="${String(this.hourlyRate)}"
            @value-changed="${(e: CustomEvent) => {
              this.hourlyRate = parseFloat(e.detail.value) || 0;
              this._notifyChange();
            }}"
          ></vaadin-text-field>

          <vaadin-text-field
            label="Wiederbeschaffung (€)"
            type="number"
            .value="${String(this.replacementPrice)}"
            @value-changed="${(e: CustomEvent) => {
              this.replacementPrice = parseFloat(e.detail.value) || 0;
              this._notifyChange();
            }}"
          ></vaadin-text-field>
        </div>

        <div class="summary-box">
          <div class="summary-row">
            <span>Materialkosten:</span>
            <strong>${this.materialCost.toFixed(2)} €</strong>
          </div>
          <div class="summary-row">
            <span>Arbeitslohn (${this.laborHours} h @ ${this.hourlyRate} €/h):</span>
            <strong>${roi.totalLaborCost.toFixed(2)} €</strong>
          </div>
          <div class="summary-row">
            <span>Gesamte Reparaturkosten:</span>
            <strong style="color: var(--text-primary); font-size: 0.95rem;">${roi.totalRepairCost.toFixed(2)} €</strong>
          </div>
          <div class="summary-row">
            <span>Neupreis / Wiederbeschaffung:</span>
            <strong>${this.replacementPrice.toFixed(2)} €</strong>
          </div>
          <div class="summary-row">
            <span>Reparaturquote:</span>
            <strong style="color: ${roi.recommendationBadgeColor}; font-size: 1rem;">
              ${roi.repairCostRatioPercent}% des Neupreises
            </strong>
          </div>
          ${roi.savingsComparedToNew > 0
            ? html`
                <div class="summary-row">
                  <span>Kundenersparnis durch Reparatur:</span>
                  <strong style="color: #0b8a5a;">${roi.savingsComparedToNew.toFixed(2)} €</strong>
                </div>
              `
            : ""}
        </div>

        <div class="result-badge" style="background: ${roi.recommendationBadgeColor};">
          🏷️ ${roi.recommendationLabel}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-roi-calculator": EcRoiCalculator;
  }
}
