import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@vaadin/button";
import wizardStyles from "./ec-diagnosis-wizard.css?inline";

@customElement("ec-safety-checks")
export class EcSafetyChecks extends LitElement {
  static styles = unsafeCSS(wizardStyles);

  @property({ type: Array }) safetyChecks: boolean[] = [false, false, false, false, false];

  private readonly _rules = [
    { title: "Freischalten", desc: "Gesamte Anlage allpolig vom Stromnetz trennen (z. B. Hauptschalter aus)." },
    { title: "Gegen Wiedereinschalten sichern", desc: "Trennungen absichern (z. B. durch Schlösser, Klebeband oder Warnschilder), damit niemand sie versehentlich wieder einschaltet." },
    { title: "Spannungsfreiheit feststellen", desc: "Mit einem zweipoligen Spannungsprüfer (z. B. Duspol) an allen Polen die Abwesenheit von Spannung prüfen." },
    { title: "Erden und kurzschließen", desc: "Leiter erden und kurzschließen (zwingend notwendig ab 1000V)." },
    { title: "Benachbarte unter Spannung stehende Teile abdecken", desc: "Nahegelegene spannungsführende Teile abdecken (z. B. mit isolierenden Abdecktüchern)." }
  ];

  render() {
    const allChecked = this.safetyChecks.every((c) => c);

    return html`
      <div class="card safety-card">
        <h3 class="text-danger m-0">⚠️ Sicherheits-Check</h3>
        <p>Bitte bestätigen Sie die 5 VDE-Sicherheitsregeln:</p>
        <div class="safety-list">
          ${this._rules.map(
            (rule, i) => html`
              <label class="safety-item">
                <input
                  type="checkbox"
                  .checked="${this.safetyChecks[i]}"
                  @change="${(e: Event) => this._toggleCheck(i, e)}"
                />
                <div style="display: flex; flex-direction: column; gap: 4px; text-align: left;">
                  <span>${i + 1}. ${rule.title}</span>
                  <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-secondary);">${rule.desc}</span>
                </div>
              </label>
            `,
          )}
        </div>
        <vaadin-button
          theme="primary error"
          class="btn-large"
          ?disabled="${!allChecked}"
          @click="${this._confirm}"
          >🔓 Diagnose starten</vaadin-button
        >
      </div>
    `;
  }

  private _toggleCheck(index: number, e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    this.dispatchEvent(
      new CustomEvent("safety-changed", {
        detail: { index, checked },
      })
    );
  }

  private _confirm() {
    this.dispatchEvent(new CustomEvent("safety-confirmed"));
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "ec-safety-checks": EcSafetyChecks;
  }
}
