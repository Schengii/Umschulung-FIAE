import { withAccessToken } from "../utils/auth-headers";
import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import "@vaadin/button";
import "@vaadin/text-field";
import wizardStyles from "./ec-diagnosis-wizard.css?inline";
import { calculateCableSizing, type InstallationMethod } from "../utils/vde-cable-sizing";
import { fetchWithTimeout, GEMINI_TIMEOUT_MS } from "../utils/fetch-timeout";

@customElement("ec-vde-calculator")
export class EcVdeCalculator extends LitElement {
  static styles = [
    unsafeCSS(wizardStyles),
    css`
      .calc-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
        margin-top: 1rem;
      }
      @media (min-width: 480px) {
        .calc-grid {
          grid-template-columns: 1fr 1fr;
        }
      }
      .calc-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-m);
        padding: 1.25rem;
        margin-top: 1rem;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .form-group label {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-secondary);
      }
      select, input {
        background: var(--bg-app);
        color: var(--text-primary);
        border: 1px solid var(--border);
        padding: 8px 12px;
        border-radius: var(--radius-s);
        font-size: 0.9rem;
        width: 100%;
        box-sizing: border-box;
      }
      select:focus, input:focus {
        border-color: var(--primary);
        outline: none;
      }
      .result-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: var(--radius-s);
        font-weight: 800;
        font-size: 0.9rem;
        margin-top: 1rem;
      }
      .badge-success {
        background: rgba(16, 185, 129, 0.1);
        color: var(--success);
        border: 1px solid var(--success);
      }
      .badge-danger {
        background: rgba(239, 68, 68, 0.1);
        color: var(--danger);
        border: 1px solid var(--danger);
      }
      .summary-box {
        margin-top: 1rem;
        padding: 12px;
        background: rgba(255, 255, 255, 0.02);
        border-radius: var(--radius-s);
        border: 1px solid var(--border);
        font-size: 0.85rem;
      }
      .summary-row {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
      .summary-row:last-child {
        border-bottom: none;
      }
      .explanation-box {
        margin-top: 1rem;
        padding: 12px;
        background: var(--primary-glow);
        border-radius: var(--radius-s);
        border: 1px solid var(--primary);
        font-size: 0.85rem;
        text-align: left;
      }
    `
  ];

  @state() private _system: "single" | "three" = "single";
  @state() private _material: "cu" | "al" = "cu";
  @state() private _crossSection: number = 1.5;
  @state() private _current: number = 16;
  @state() private _length: number = 20;
  @state() private _cosPhi: number = 1.0;
  
  @state() private _explanation: string = "";
  @state() private _isLoadingExplanation: boolean = false;

  // Schleifenimpedanz (Zs) State
  @state() private _mcbType: "B" | "C" | "D" = "B";
  @state() private _mcbCurrent: number = 16;
  @state() private _measuredZs: number = 1.2;
  @state() private _u0: number = 230;

  // DIN VDE 0298-4 Dimensionierung State
  @state() private _installMethod: InstallationMethod = "B2";
  @state() private _ambientTemp: number = 30;
  @state() private _groupingCount: number = 1;

  private _calculate() {
    const kappa = this._material === "cu" ? 56 : 34;
    const U = this._system === "single" ? 230 : 400;
    
    let deltaU = 0;
    if (this._system === "single") {
      deltaU = (2 * this._length * this._current * this._cosPhi) / (kappa * this._crossSection);
    } else {
      deltaU = (Math.sqrt(3) * this._length * this._current * this._cosPhi) / (kappa * this._crossSection);
    }

    const pct = (deltaU / U) * 100;
    const passed = pct <= 3.0;

    return {
      deltaU: deltaU.toFixed(2),
      pct: pct.toFixed(2),
      passed,
      voltage: U
    };
  }

  private _calculateZs() {
    let factor = 5;
    if (this._mcbType === "C") factor = 10;
    if (this._mcbType === "D") factor = 20;

    const Ia = this._mcbCurrent * factor;
    // Standard DIN VDE 0100-410 Formel: Zs <= U0 / Ia
    const maxZs = this._u0 / Ia;
    // Mit 0,8 Sicherheitsfaktor für die Erwärmung der Leitung (DIN VDE 0100-600)
    const maxZsSafety = (0.8 * this._u0) / Ia;
    const passed = this._measuredZs <= maxZsSafety;

    return {
      Ia,
      maxZs: maxZs.toFixed(2),
      maxZsSafety: maxZsSafety.toFixed(2),
      passed
    };
  }

  private async _getAIExplanation() {
    this._isLoadingExplanation = true;
    this._explanation = "";
    
    const { deltaU, pct, passed } = this._calculate();
    const materialName = this._material === "cu" ? "Kupfer" : "Aluminium";
    const systemName = this._system === "single" ? "Wechselstrom (230V)" : "Drehstrom (400V)";

    const query = `Ein Elektriker berechnet den Spannungsfall nach VDE 0100-520. Details:
- System: ${systemName}
- Leitermaterial: ${materialName}
- Querschnitt: ${this._crossSection} mm²
- Nennstrom: ${this._current} A
- Länge: ${this._length} m
- Spannungsfall berechnet: ${deltaU} V (${pct} %)
- VDE Limit (3.0%): ${passed ? "Bestanden" : "NICHT BESTANDEN"}.

Erkläre kurz und präzise in 2-3 Sätzen auf Deutsch, warum dieser Wert zustande kommt, welche Risiken bestehen (z.B. Brandgefahr, Funktionsstörung) und was empfohlen wird.`;

    try {
      const savedBackendUrl = localStorage.getItem("electrocheck_backend_url") || "";
      const headers: Record<string, string> = withAccessToken({ "Content-Type": "application/json" });
      const savedApiKey = localStorage.getItem("electrocheck_gemini_api_key");
      if (savedApiKey) headers["x-gemini-api-key"] = savedApiKey;

      const response = await fetchWithTimeout(`${savedBackendUrl}/api/gemini/diagnosis`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          description: query,
          imageBase64: null
        })
      }, GEMINI_TIMEOUT_MS);

      if (response.ok) {
        const data = await response.json();
        this._explanation = data.recommendation || "Keine Empfehlung generiert.";
      } else {
        this._explanation = "Erklärung konnte nicht geladen werden. Prüfen Sie Ihren API-Key.";
      }
    } catch (e) {
      this._explanation = "Verbindungsfehler bei der Erklärung.";
    } finally {
      this._isLoadingExplanation = false;
    }
  }

  render() {
    const { deltaU, pct, passed, voltage } = this._calculate();
    const zsResult = this._calculateZs();

    return html`
      <!-- Spannungsfall Rechner -->
      <div class="calc-card">
        <h3 class="m-0" style="color: var(--primary); display: flex; align-items: center; gap: 8px;">
          ⚡ VDE 0100-520 Spannungsfall-Rechner
        </h3>
        <p style="font-size: 0.85rem; margin-top: 4px;">
          Berechnen Sie den Spannungsfall für Leitungen und überprüfen Sie die Einhaltung des 3%-Grenzwerts nach DIN VDE.
        </p>

        <div class="calc-grid">
          <div class="form-group">
            <label>Phasensystem</label>
            <select aria-label="Phasensystem" .value="${this._system}" @change="${(e: Event) => this._system = (e.target as HTMLSelectElement).value as typeof this._system}">
              <option value="single">Wechselstrom (1-phasig / 230V)</option>
              <option value="three">Drehstrom (3-phasig / 400V)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Leitermaterial</label>
            <select aria-label="Leitermaterial" .value="${this._material}" @change="${(e: Event) => this._material = (e.target as HTMLSelectElement).value as typeof this._material}">
              <option value="cu">Kupfer (Cu)</option>
              <option value="al">Aluminium (Al)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Nennquerschnitt (A) in mm²</label>
            <select aria-label="Nennquerschnitt (A) in mm²" .value="${this._crossSection.toString()}" @change="${(e: Event) => this._crossSection = parseFloat((e.target as HTMLSelectElement).value)}">
              <option value="1.5">1.5 mm²</option>
              <option value="2.5">2.5 mm²</option>
              <option value="4">4.0 mm²</option>
              <option value="6">6.0 mm²</option>
              <option value="10">10.0 mm²</option>
              <option value="16">16.0 mm²</option>
              <option value="25">25.0 mm²</option>
              <option value="35">35.0 mm²</option>
              <option value="50">50.0 mm²</option>
            </select>
          </div>

          <div class="form-group">
            <label>Nennstrom (I) in A</label>
            <input aria-label="Nennstrom (I) in A" type="number" .value="${this._current.toString()}" @input="${(e: Event) => this._current = parseFloat((e.target as HTMLInputElement).value) || 0}" />
          </div>

          <div class="form-group">
            <label>Einfache Leitungslänge (L) in m</label>
            <input aria-label="Einfache Leitungslänge (L) in m" type="number" .value="${this._length.toString()}" @input="${(e: Event) => this._length = parseFloat((e.target as HTMLInputElement).value) || 0}" />
          </div>

          <div class="form-group">
            <label>Leistungsfaktor (cos φ)</label>
            <input aria-label="Leistungsfaktor (cos φ)" type="number" step="0.05" min="0.5" max="1.0" .value="${this._cosPhi.toString()}" @input="${(e: Event) => this._cosPhi = parseFloat((e.target as HTMLInputElement).value) || 1.0}" />
          </div>
        </div>

        <div class="summary-box">
          <div class="summary-row">
            <span>Soll-Spannung:</span>
            <strong>${voltage} V</strong>
          </div>
          <div class="summary-row">
            <span>Spannungsfall (V):</span>
            <strong>${deltaU} V</strong>
          </div>
          <div class="summary-row">
            <span>Spannungsfall (%):</span>
            <strong style="color: ${passed ? "var(--success)" : "var(--danger)"}">${pct} %</strong>
          </div>
          <div class="summary-row">
            <span>Zulässiges Limit:</span>
            <strong>3.0 % (VDE 0100)</strong>
          </div>
        </div>

        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <div class="result-badge ${passed ? "badge-success" : "badge-danger"}">
            ${passed ? "✅ BESTANDEN" : "❌ GRENZWERT ÜBERSCHRITTEN"}
          </div>
          
          <vaadin-button
            theme="secondary"
            style="margin-top: 1rem;"
            @click="${this._getAIExplanation}"
            ?disabled="${this._isLoadingExplanation}"
          >
            ${this._isLoadingExplanation ? "⌛ Analyse..." : "🤖 KI-Erklärung anfordern"}
          </vaadin-button>
        </div>

        ${this._explanation ? html`
          <div class="explanation-box">
            <strong>🤖 KI-Erklärung:</strong><br />
            ${this._explanation}
          </div>
        ` : ""}
      </div>

      <!-- Schleifenimpedanz Rechner -->
      <div class="calc-card" style="margin-top: 2rem;">
        <h3 class="m-0" style="color: var(--primary); display: flex; align-items: center; gap: 8px;">
          🔌 DIN VDE 0100-600 Schleifenimpedanz-Rechner (Zs)
        </h3>
        <p style="font-size: 0.85rem; margin-top: 4px;">
          Überprüfen Sie die maximale Schleifenimpedanz für Leitungsschutzschalter (MCB) zur Gewährleistung der automatischen Abschaltung im Fehlerfall.
        </p>

        <div class="calc-grid">
          <div class="form-group">
            <label>Charakteristik (MCB)</label>
            <select aria-label="Charakteristik (MCB)" .value="${this._mcbType}" @change="${(e: Event) => this._mcbType = (e.target as HTMLSelectElement).value as typeof this._mcbType}">
              <option value="B">Typ B (Ia = 5x In)</option>
              <option value="C">Typ C (Ia = 10x In)</option>
              <option value="D">Typ D (Ia = 20x In)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Nennstrom (In) in A</label>
            <select aria-label="Nennstrom (In) in A" .value="${this._mcbCurrent.toString()}" @change="${(e: Event) => this._mcbCurrent = parseInt((e.target as HTMLSelectElement).value)}">
              <option value="6">6 A</option>
              <option value="10">10 A</option>
              <option value="13">13 A</option>
              <option value="16">16 A</option>
              <option value="20">20 A</option>
              <option value="25">25 A</option>
              <option value="32">32 A</option>
              <option value="40">40 A</option>
              <option value="50">50 A</option>
              <option value="63">63 A</option>
            </select>
          </div>

          <div class="form-group">
            <label>Gemessene Impedanz (Zs) in Ω</label>
            <input aria-label="Gemessene Impedanz (Zs) in Ω" type="number" step="0.05" min="0.01" .value="${this._measuredZs.toString()}" @input="${(e: Event) => this._measuredZs = parseFloat((e.target as HTMLInputElement).value) || 0}" />
          </div>

          <div class="form-group">
            <label>Netzspannung gegen Erde (U0) in V</label>
            <input aria-label="Netzspannung gegen Erde (U0) in V" type="number" .value="${this._u0.toString()}" @input="${(e: Event) => this._u0 = parseFloat((e.target as HTMLInputElement).value) || 230}" />
          </div>
        </div>

        <div class="summary-box">
          <div class="summary-row">
            <span>Benötigter Kurzschlussstrom (Ia):</span>
            <strong>${zsResult.Ia} A</strong>
          </div>
          <div class="summary-row">
            <span>Max. theoretisches Zs (VDE 0100-410):</span>
            <strong>${zsResult.maxZs} Ω</strong>
          </div>
          <div class="summary-row">
            <span>Max. Zs mit Sicherheitsfaktor 0,8 (DIN VDE 0100-600):</span>
            <strong style="color: var(--primary);">${zsResult.maxZsSafety} Ω</strong>
          </div>
          <div class="summary-row">
            <span>Gemessener Wert:</span>
            <strong style="color: ${zsResult.passed ? "var(--success)" : "var(--danger)"}">${this._measuredZs} Ω</strong>
          </div>
        </div>

        <div class="result-badge ${zsResult.passed ? "badge-success" : "badge-danger"}">
          ${zsResult.passed ? "✅ ABSCHALTUNG GEWÄHRLEISTET (Bestanden)" : "❌ FEHLER: Zs ZU HOCH (Gefahr im Kurzschlussfall)"}
        </div>
      </div>

      <!-- E-Mobilität & Wallbox Rechner (DIN VDE 0100-722) -->
      <div class="calc-card" style="margin-top: 2rem;">
        <h3 class="m-0" style="color: var(--primary); display: flex; align-items: center; gap: 8px;">
          🚗 DIN VDE 0100-722 Ladeinfrastruktur (Wallbox & E-Mobilität)
        </h3>
        <p style="font-size: 0.85rem; margin-top: 4px;">
          Berechnen Sie den voraussichtlichen Kurzschlussstrom (Ik = U0 / Zs) sowie den empfohlenen Kabelquerschnitt für 11 kW / 22 kW Wallboxen.
        </p>

        <div class="summary-box">
          <div class="summary-row">
            <span>Errechneter Kurzschlussstrom (Ik):</span>
            <strong>${(this._measuredZs > 0 ? (this._u0 / this._measuredZs).toFixed(1) : '0')} A (${((this._measuredZs > 0 ? (this._u0 / this._measuredZs) : 0) / 1000).toFixed(2)} kA)</strong>
          </div>
          <div class="summary-row">
            <span>11 kW Wallbox (16A 3-phasig):</span>
            <strong>Empfohlen: min. 5x 2.5 mm² Cu (bei L <= 25m)</strong>
          </div>
          <div class="summary-row">
            <span>22 kW Wallbox (32A 3-phasig):</span>
            <strong>Empfohlen: min. 5x 6.0 mm² Cu (bei L <= 20m)</strong>
          </div>
          <div class="summary-row">
            <span>RCD-Pflicht (VDE 0100-722):</span>
            <strong>Allstromsensitiver RCD Typ B oder Typ A EV (DC-Fehlerstromerkennung 6mA)</strong>
          </div>
        </div>
      </div>

      <!-- Leitungsdimensionierung nach DIN VDE 0298-4 -->
      ${(() => {
        const sizing = calculateCableSizing({
          currentInA: this._current,
          installationMethod: this._installMethod,
          loadedCores: this._system === "single" ? 2 : 3,
          ambientTempC: this._ambientTemp,
          groupingCount: this._groupingCount,
          conductorMaterial: this._material === "cu" ? "Cu" : "Al",
          lengthMeters: this._length,
          cosPhi: this._cosPhi,
        });

        return html`
          <div class="calc-card" style="margin-top: 2rem;">
            <h3 class="m-0" style="color: var(--primary); display: flex; align-items: center; gap: 8px;">
              📏 DIN VDE 0298-4 Leitungsdimensionierung & Strombelastbarkeit (Iz)
            </h3>
            <p style="font-size: 0.85rem; margin-top: 4px;">
              Ermittlung des erforderlichen Querschnitts unter Berücksichtigung von Verlegeart, Umgebungstemperatur und Häufung.
            </p>

            <div class="calc-grid">
              <div class="form-group">
                <label>Verlegeart (DIN VDE 0298-4)</label>
                <select aria-label="Verlegeart (DIN VDE 0298-4)"
                  .value="${this._installMethod}"
                  @change="${(e: Event) => this._installMethod = (e.target as HTMLSelectElement).value as InstallationMethod}"
                >
                  <option value="A1">A1 – Adern in wärmegedämmten Wänden</option>
                  <option value="A2">A2 – Mehradriges Kabel in wärmegedämmter Wand</option>
                  <option value="B1">B1 – Adern im Elektroinstallationsrohr auf/in Wand</option>
                  <option value="B2">B2 – Kabel im Rohr oder Kanal auf/in Wand (Standard)</option>
                  <option value="C">C – Direkt auf oder in der Wand / unter Putz</option>
                  <option value="E">E – Frei in Luft / auf Kabelpritsche</option>
                </select>
              </div>

              <div class="form-group">
                <label>Umgebungstemperatur (°C)</label>
                <input aria-label="Umgebungstemperatur (°C)"
                  type="number"
                  min="5"
                  max="60"
                  step="5"
                  .value="${String(this._ambientTemp)}"
                  @change="${(e: Event) => this._ambientTemp = Number((e.target as HTMLInputElement).value) || 30}"
                />
              </div>

              <div class="form-group">
                <label>Häufung (Anzahl Kabel gebündelt)</label>
                <input aria-label="Häufung (Anzahl Kabel gebündelt)"
                  type="number"
                  min="1"
                  max="20"
                  step="1"
                  .value="${String(this._groupingCount)}"
                  @change="${(e: Event) => this._groupingCount = Number((e.target as HTMLInputElement).value) || 1}"
                />
              </div>

              <div class="form-group">
                <label>Betriebsstrom / Schutzorgan (In in A)</label>
                <input aria-label="Betriebsstrom / Schutzorgan (In in A)"
                  type="number"
                  min="6"
                  max="125"
                  step="1"
                  .value="${String(this._current)}"
                  @change="${(e: Event) => this._current = Number((e.target as HTMLInputElement).value) || 16}"
                />
              </div>
            </div>

            <div class="summary-box">
              <div class="summary-row">
                <span>Temperatur-Faktor (fT):</span>
                <strong>${sizing.tempCorrectionFactor} (bei ${this._ambientTemp}°C)</strong>
              </div>
              <div class="summary-row">
                <span>Häufungs-Faktor (fH):</span>
                <strong>${sizing.groupingCorrectionFactor} (${this._groupingCount} Leitung(en))</strong>
              </div>
              <div class="summary-row">
                <span>Gesamter Reduktionsfaktor (fGesamt):</span>
                <strong>${sizing.totalCorrectionFactor}</strong>
              </div>
              <div class="summary-row">
                <span>Erforderliche Mindest-Belastbarkeit (Iz erf.):</span>
                <strong>${sizing.requiredIzA} A</strong>
              </div>
              <div class="summary-row" style="border-top: 1px solid var(--border); margin-top: 6px; padding-top: 8px;">
                <span style="font-weight: bold; color: var(--primary);">Empfohlener Norm-Querschnitt:</span>
                <strong style="font-size: 1.15rem; color: var(--primary);">${sizing.recommendedCrossSectionMm2} mm² ${this._material === "cu" ? "Cu" : "Al"}</strong>
              </div>
            </div>

            <div class="result-badge ${sizing.voltageDropPassed ? "badge-success" : "badge-danger"}">
              ℹ️ ${sizing.reason}
            </div>
          </div>
        `;
      })()}
    `;
  }
}


declare global {
  interface HTMLElementTagNameMap {
    "ec-vde-calculator": EcVdeCalculator;
  }
}
