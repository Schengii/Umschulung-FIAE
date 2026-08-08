import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './ec-signature-pad';

export interface GbuData {
  location: string;
  voltageLevel: string;
  arcFlashRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  ppeChecked: {
    helmet: boolean;
    visor: boolean;
    gloves1000v: boolean;
    flameSuits: boolean;
    safetyShoes: boolean;
  };
  safetyRulesSigned: boolean;
  inspectorName: string;
  timestamp: string;
  signatureUrl: string | null;
}

@customElement('ec-gbu-generator')
export class EcGbuGenerator extends LitElement {
  @state() private _location = '';
  @state() private _voltageLevel = '400V AC (Niederspannung)';
  @state() private _arcFlashRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
  @state() private _ppe = {
    helmet: true,
    visor: true,
    gloves1000v: true,
    flameSuits: false,
    safetyShoes: true
  };
  @state() private _safetyRulesChecked = [false, false, false, false, false];
  @state() private _inspectorName = '';
  @state() private _signatureUrl: string | null = null;
  @state() private _isCompleted = false;

  static styles = css`
    :host {
      display: block;
      background: var(--bg-card, #ffffff);
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid var(--border-color, #e2e8f0);
    }
    .header {
      margin-bottom: 1.5rem;
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
    input[type="text"], select {
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
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
    }
    .ppe-box {
      background: var(--bg-app, #f8fafc);
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
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
    .alert-success {
      background: #dcfce7;
      color: #15803d;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
      font-weight: 600;
    }
  `;

  render() {
    return html`
      <div class="header">
        <h2>🛡️ Gefährdungsbeurteilung (GBU nach ArbSchG & BetrSichV)</h2>
        <p>Erstelle vor Arbeitsbeginn die geforderte Gefährdungsbeurteilung für Arbeiten unter Spannung oder an elektrischen Anlagen.</p>
      </div>

      <div class="grid">
        <div class="form-group">
          <label>Arbeitsort / Anlage</label>
          <input type="text" placeholder="z. B. Hauptverteilung HV-02 Keller" .value="${this._location}" @input="${(e: Event) => this._location = (e.target as HTMLInputElement).value}">
        </div>

        <div class="form-group">
          <label>Spannungsebene</label>
          <select @change="${(e: Event) => this._voltageLevel = (e.target as HTMLSelectElement).value}">
            <option value="230V AC Wechselspannung">230V AC Wechselspannung</option>
            <option value="400V AC Niederspannung">400V AC Niederspannung (Drehstrom)</option>
            <option value="1000V DC Photovoltaik">1000V DC Photovoltaik</option>
            <option value="> 1kV Mittelspannung">High Voltage / Mittelspannung (>1kV)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Störlichtbogen-Risiko (Arc Flash Risk)</label>
          <select @change="${(e: Event) => this._arcFlashRisk = (e.target as HTMLSelectElement).value as any}">
            <option value="LOW">Gering (Normale Messungen)</option>
            <option value="MEDIUM" selected>Mittel (Schaltschrankarbeiten)</option>
            <option value="HIGH">Hoch (Arbeiten unter Spannung - AuS)</option>
          </select>
        </div>
      </div>

      <h4>🥽 Erforderliche Persönliche Schutzausrüstung (PSA)</h4>
      <div class="ppe-box">
        <div class="checkbox-item">
          <input type="checkbox" id="helmet" .checked="${this._ppe.helmet}" @change="${(e: Event) => this._ppe = {...this._ppe, helmet: (e.target as HTMLInputElement).checked}}">
          <label for="helmet">Schutzhelm mit Kinnriemen</label>
        </div>
        <div class="checkbox-item">
          <input type="checkbox" id="visor" .checked="${this._ppe.visor}" @change="${(e: Event) => this._ppe = {...this._ppe, visor: (e.target as HTMLInputElement).checked}}">
          <label for="visor">Gesichtsschutzschild (Störlichtbogenschutz Class 1/2)</label>
        </div>
        <div class="checkbox-item">
          <input type="checkbox" id="gloves" .checked="${this._ppe.gloves1000v}" @change="${(e: Event) => this._ppe = {...this._ppe, gloves1000v: (e.target as HTMLInputElement).checked}}">
          <label for="gloves">Isolierende Handschuhe 1000V (DIN EN 60903)</label>
        </div>
        <div class="checkbox-item">
          <input type="checkbox" id="shoes" .checked="${this._ppe.safetyShoes}" @change="${(e: Event) => this._ppe = {...this._ppe, safetyShoes: (e.target as HTMLInputElement).checked}}">
          <label for="shoes">Sicherheitsschuhe S3 ESD</label>
        </div>
      </div>

      <div class="rules-list">
        <h4>⚡ Bestätigung der 5 Sicherheitsregeln (DIN VDE 0105-100)</h4>
        ${[
          '1. Freischalten',
          '2. Gegen Wiedereinschalten sichern',
          '3. Spannungsfreiheit allpolig feststellen',
          '4. Erden und Kurzschließen',
          '5. Benachbarte unter Spannung stehende Teile abdecken'
        ].map((rule, idx) => html`
          <div class="checkbox-item">
            <input type="checkbox" id="rule-${idx}" .checked="${this._safetyRulesChecked[idx]}" @change="${(e: Event) => {
              const updated = [...this._safetyRulesChecked];
              updated[idx] = (e.target as HTMLInputElement).checked;
              this._safetyRulesChecked = updated;
            }}">
            <label for="rule-${idx}"><strong>${rule}</strong></label>
          </div>
        `)}
      </div>

      <div class="form-group">
        <label>Verantwortliche Elektrofachkraft (EFK / VEFK)</label>
        <input type="text" placeholder="Vor- und Nachname" .value="${this._inspectorName}" @input="${(e: Event) => this._inspectorName = (e.target as HTMLInputElement).value}">
      </div>

      <div class="form-group">
        <label>Digitale Freigabe-Unterschrift</label>
        <ec-signature-pad @signature-changed="${(e: CustomEvent) => this._signatureUrl = e.detail.dataUrl}"></ec-signature-pad>
      </div>

      <button class="btn-submit" @click="${this._handleSubmit}">
        ✅ Gefährdungsbeurteilung freigeben & in Protokoll ablegen
      </button>

      ${this._isCompleted ? html`
        <div class="alert-success">
          ✅ Gefährdungsbeurteilung erfolgreich dokumentiert & signiert! (Zeitstempel: ${new Date().toLocaleString()})
        </div>
      ` : ''}
    `;
  }

  private _handleSubmit() {
    if (!this._location || !this._inspectorName) {
      alert('Bitte Arbeitsort und Name der Elektrofachkraft eingeben.');
      return;
    }

    const allRulesChecked = this._safetyRulesChecked.every(Boolean);
    if (!allRulesChecked) {
      alert('Bitte alle 5 Sicherheitsregeln bestätigen!');
      return;
    }

    this._isCompleted = true;
    this.dispatchEvent(
      new CustomEvent('gbu-created', {
        detail: {
          location: this._location,
          voltageLevel: this._voltageLevel,
          arcFlashRisk: this._arcFlashRisk,
          ppeChecked: this._ppe,
          inspectorName: this._inspectorName,
          timestamp: new Date().toISOString(),
          signatureUrl: this._signatureUrl
        },
        bubbles: true,
        composed: true
      })
    );
  }
}
