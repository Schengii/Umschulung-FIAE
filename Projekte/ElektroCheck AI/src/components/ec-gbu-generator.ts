import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./ec-signature-pad";
import {
  evaluateGbu,
  DEFAULT_5_SAFETY_RULES,
  type RiskSeverity,
  type RiskProbability,
  type GbuEvaluationResult,
} from "../utils/gbu-evaluator";

@customElement("ec-gbu-generator")
export class EcGbuGenerator extends LitElement {
  @state() private _location = "";
  @state() private _voltageLevel = "400V AC (Niederspannung)";
  @state() private _initialSeverity: RiskSeverity = 4;
  @state() private _initialProbability: RiskProbability = 3;
  @state() private _safetyRules = DEFAULT_5_SAFETY_RULES.map((r) => ({ ...r }));
  @state() private _ppe = {
    helmet: true,
    visor: true,
    gloves1000v: true,
    safetyShoes: true,
  };
  @state() private _inspectorName = "";
  @state() private _signatureUrl: string | null = null;
  @state() private _isCompleted = false;

  static styles = css`
    :host {
      display: block;
      background: var(--bg-card, #ffffff);
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid var(--border-color, #e2e8f0);
      text-align: left;
    }
    .header h2 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary, #0f172a);
    }
    .form-group {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.4rem;
      color: var(--text-primary, #0f172a);
    }
    input[type="text"],
    select {
      width: 100%;
      box-sizing: border-box;
      padding: 0.6rem;
      border-radius: 8px;
      border: 1px solid var(--border-color, #cbd5e1);
      background: var(--bg-card, #ffffff);
      color: var(--text-primary, #0f172a);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }
    .ppe-box {
      background: var(--bg-app, #f8fafc);
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      border: 1px solid var(--border-color, #cbd5e1);
    }
    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .rules-list {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }
    .rules-list h4 {
      margin-top: 0;
      color: #92400e;
    }

    /* 5x5 Nohl Risk Matrix */
    .matrix-card {
      background: var(--bg-app, #f8fafc);
      border: 1px solid var(--border-color, #cbd5e1);
      padding: 12px;
      border-radius: 8px;
      margin: 1rem 0;
    }
    .matrix-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 4px;
      margin-top: 8px;
    }
    .matrix-cell {
      padding: 6px;
      text-align: center;
      font-size: 0.75rem;
      font-weight: bold;
      border-radius: 4px;
      color: #ffffff;
    }

    .badge-result {
      padding: 10px;
      border-radius: 6px;
      color: #ffffff;
      font-weight: bold;
      font-size: 0.9rem;
      margin: 10px 0;
    }
    button.btn-submit {
      width: 100%;
      padding: 0.8rem;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 1rem;
      cursor: pointer;
    }
  `;

  private _getGbuEval(): GbuEvaluationResult {
    const ppeList = Object.entries(this._ppe)
      .filter(([_, v]) => v)
      .map(([k]) => k);

    return evaluateGbu({
      activityName: this._location || "Arbeiten an elektrischen Anlagen",
      initialSeverity: this._initialSeverity,
      initialProbability: this._initialProbability,
      rules5SafetyApplied: this._safetyRules,
      personalProtectionEquipment: ppeList,
    });
  }

  render() {
    const evalRes = this._getGbuEval();

    return html`
      <div class="header">
        <h2>🛡️ BetrSichV Gefährdungsbeurteilung (5x5 Nohl-Risikomatrix)</h2>
        <p>
          Gesetzlich vorgeschriebene Gefährdungsbeurteilung (§ 3 BetrSichV / ArbSchG / DIN VDE 0105-100).
        </p>
      </div>

      <div class="grid">
        <div class="form-group">
          <label>Arbeitsort / Anlage</label>
          <input aria-label="Arbeitsort / Anlage"
            type="text"
            placeholder="z. B. Hauptverteilung HV-02 Keller"
            .value="${this._location}"
            @input="${(e: Event) =>
              (this._location = (e.target as HTMLInputElement).value)}"
          />
        </div>

        <div class="form-group">
          <label>Spannungsebene</label>
          <select aria-label="Spannungsebene"
            @change="${(e: Event) =>
              (this._voltageLevel = (e.target as HTMLSelectElement).value)}"
          >
            <option value="230V AC Wechselspannung">230V AC Wechselspannung</option>
            <option value="400V AC Niederspannung" selected>400V AC Niederspannung</option>
            <option value="1000V DC Photovoltaik">1000V DC Photovoltaik</option>
            <option value="> 1kV Mittelspannung">Mittelspannung (>1kV)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Ausgangs-Schadensausmaß (1=gering, 5=katastrophal)</label>
          <select aria-label="Ausgangs-Schadensausmaß (1=gering, 5=katastrophal)"
            .value="${String(this._initialSeverity)}"
            @change="${(e: Event) =>
              (this._initialSeverity = parseInt(
                (e.target as HTMLSelectElement).value,
                10
              ) as RiskSeverity)}"
          >
            <option value="1">1 - Leicht (Kratzer / Schreck)</option>
            <option value="2">2 - Mäßig (Erste Hilfe nötig)</option>
            <option value="3">3 - Erheblich (Arbeitsunfall)</option>
            <option value="4" selected>4 - Schwer (Lichtbogen / AuS)</option>
            <option value="5">5 - Katastrophal (Tödliche Gefahr)</option>
          </select>
        </div>
      </div>

      <!-- 5x5 Nohl Risikomatrix Visualisierung -->
      <div class="matrix-card">
        <strong>📊 Risikobewertung (Vorher vs. Nachher):</strong>
        <div
          style="display: flex; gap: 16px; margin-top: 8px; flex-wrap: wrap; font-size: 0.85rem;"
        >
          <div>
            Ausgangsrisiko:
            <span
              style="padding: 2px 8px; border-radius: 4px; color: #fff; font-weight: bold; background: ${evalRes.initialRiskColor};"
            >
              ${evalRes.initialRiskLevel} (Score ${evalRes.initialRiskScore}/25)
            </span>
          </div>
          <div>
            Restrisiko nach Schutzmaßnahmen:
            <span
              style="padding: 2px 8px; border-radius: 4px; color: #fff; font-weight: bold; background: ${evalRes.residualRiskColor};"
            >
              ${evalRes.residualRiskLevel} (Score ${evalRes.residualRiskScore}/25)
            </span>
          </div>
        </div>
      </div>

      <h4>🥽 Erforderliche Persönliche Schutzausrüstung (PSA)</h4>
      <div class="ppe-box">
        <div class="checkbox-item">
          <input
            type="checkbox"
            id="helmet"
            .checked="${this._ppe.helmet}"
            @change="${(e: Event) =>
              (this._ppe = {
                ...this._ppe,
                helmet: (e.target as HTMLInputElement).checked,
              })}"
          />
          <label for="helmet">Schutzhelm mit Kinnriemen</label>
        </div>
        <div class="checkbox-item">
          <input
            type="checkbox"
            id="visor"
            .checked="${this._ppe.visor}"
            @change="${(e: Event) =>
              (this._ppe = {
                ...this._ppe,
                visor: (e.target as HTMLInputElement).checked,
              })}"
          />
          <label for="visor">Gesichtsschutzschild (Störlichtbogenschutz Class 2)</label>
        </div>
        <div class="checkbox-item">
          <input
            type="checkbox"
            id="gloves"
            .checked="${this._ppe.gloves1000v}"
            @change="${(e: Event) =>
              (this._ppe = {
                ...this._ppe,
                gloves1000v: (e.target as HTMLInputElement).checked,
              })}"
          />
          <label for="gloves">Isolierende Handschuhe 1000V (DIN EN 60903)</label>
        </div>
        <div class="checkbox-item">
          <input
            type="checkbox"
            id="shoes"
            .checked="${this._ppe.safetyShoes}"
            @change="${(e: Event) =>
              (this._ppe = {
                ...this._ppe,
                safetyShoes: (e.target as HTMLInputElement).checked,
              })}"
          />
          <label for="shoes">Sicherheitsschuhe S3 ESD</label>
        </div>
      </div>

      <div class="rules-list">
        <h4>⚡ Bestätigung der 5 Sicherheitsregeln (DIN VDE 0105-100)</h4>
        ${this._safetyRules.map(
          (rule, idx) => html`
            <div class="checkbox-item">
              <input
                type="checkbox"
                id="rule-${idx}"
                .checked="${rule.applied}"
                @change="${(e: Event) => {
                  const updated = [...this._safetyRules];
                  updated[idx].applied = (e.target as HTMLInputElement).checked;
                  this._safetyRules = updated;
                }}"
              />
              <label for="rule-${idx}"><strong>${rule.name}</strong></label>
            </div>
          `
        )}
      </div>

      <div class="form-group">
        <label>Verantwortliche Elektrofachkraft (EFK / VEFK)</label>
        <input aria-label="Verantwortliche Elektrofachkraft (EFK / VEFK)"
          type="text"
          placeholder="Vor- und Nachname"
          .value="${this._inspectorName}"
          @input="${(e: Event) =>
            (this._inspectorName = (e.target as HTMLInputElement).value)}"
        />
      </div>

      <div class="form-group">
        <label>Digitale Freigabe-Unterschrift</label>
        <ec-signature-pad
          @signature-changed="${(e: CustomEvent) =>
            (this._signatureUrl = e.detail.dataUrl)}"
        ></ec-signature-pad>
      </div>

      <button class="btn-submit" @click="${this._handleSubmit}">
        ✅ Gefährdungsbeurteilung freigeben & dokumentieren
      </button>

      ${this._isCompleted
        ? html`
            <div
              style="background: #dcfce7; color: #15803d; padding: 1rem; border-radius: 8px; margin-top: 1rem; font-weight: 600;"
            >
              ✅ Gefährdungsbeurteilung erfolgreich dokumentiert & signiert! (Zeitstempel:
              ${new Date().toLocaleString()})
            </div>
          `
        : ""}
    `;
  }

  private _handleSubmit() {
    if (!this._location || !this._inspectorName) {
      alert("Bitte Arbeitsort und Name der Elektrofachkraft eingeben.");
      return;
    }

    const evalRes = this._getGbuEval();
    this._isCompleted = true;
    this.dispatchEvent(
      new CustomEvent("gbu-created", {
        detail: {
          location: this._location,
          voltageLevel: this._voltageLevel,
          initialRiskLevel: evalRes.initialRiskLevel,
          residualRiskLevel: evalRes.residualRiskLevel,
          isAcceptable: evalRes.isAcceptable,
          inspectorName: this._inspectorName,
          timestamp: new Date().toISOString(),
          signatureUrl: this._signatureUrl,
        },
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-gbu-generator": EcGbuGenerator;
  }
}
