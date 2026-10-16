import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@vaadin/button";
import "@vaadin/progress-bar";
import wizardStyles from "./ec-diagnosis-wizard.css?inline";

interface ActionStep {
  id: number;
  text: string;
  completed: boolean;
}

/**
 * Reparatur-Checkliste mit Fortschrittsbalken.
 * Events: step-toggled {index, completed}, guided-repair-requested
 */
@customElement("ec-repair-checklist")
export class EcRepairChecklist extends LitElement {
  static styles = unsafeCSS(wizardStyles);

  @property({ attribute: false }) steps: ActionStep[] = [];

  private get _progress(): number {
    if (this.steps.length === 0) return 0;
    return this.steps.filter((s) => s.completed).length / this.steps.length;
  }

  private _toggle(index: number, e: Event) {
    const completed = (e.target as HTMLInputElement).checked;
    this.dispatchEvent(new CustomEvent("step-toggled", { detail: { index, completed } }));
  }

  render() {
    if (this.steps.length === 0) return html``;

    return html`
      <div style="margin: 1.5rem 0; padding: 1rem; background: var(--bg-app); border-radius: 8px; border: 1px solid var(--border);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <span class="label" style="color: var(--primary);">🛠️ Reparatur-Checkliste:</span>
          <span style="font-size: 0.85rem; font-weight: bold; color: var(--text-muted);">${Math.round(this._progress * 100)}%</span>
        </div>
        <vaadin-progress-bar value="${this._progress}" style="margin-bottom: 1rem;"></vaadin-progress-bar>

        <vaadin-button
          theme="primary success"
          class="w-100 mb-1"
          style="margin-bottom: 12px;"
          @click="${() => this.dispatchEvent(new CustomEvent("guided-repair-requested"))}"
          >🛠️ Geführte Reparatur starten (Vorlesen)</vaadin-button
        >

        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          ${this.steps.map(
            (step, idx) => html`
              <label style="display: flex; gap: 12px; align-items: flex-start; cursor: pointer; padding: 10px; background: var(--bg-card); border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border: 1px solid var(--border); transition: all 0.2s ease;">
                <input
                  type="checkbox"
                  .checked="${step.completed}"
                  @change="${(e: Event) => this._toggle(idx, e)}"
                  style="margin-top: 4px; transform: scale(1.2);"
                />
                <span
                  style="line-height: 1.4; transition: all 0.2s ease; ${step.completed
                    ? "text-decoration: line-through; color: var(--text-muted); opacity: 0.6;"
                    : "color: var(--text-primary); font-weight: 500;"}"
                >
                  ${step.text}
                </span>
              </label>
            `,
          )}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-repair-checklist": EcRepairChecklist;
  }
}
