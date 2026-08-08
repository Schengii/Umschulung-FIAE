import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BleMultimeterService, BleMeasurement } from '../services/ble-multimeter-service';

@customElement('ec-ble-multimeter')
export class EcBleMultimeter extends LitElement {
  @state() private _isConnected = false;
  @state() private _deviceName = '';
  @state() private _latestMeasurement: BleMeasurement | null = null;
  @state() private _autoTarget: 'R_PE' | 'R_ISO' | 'I_LEAK' = 'R_PE';

  private _service = new BleMultimeterService();

  static styles = css`
    :host {
      display: block;
      background: var(--bg-card, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .title {
      font-weight: 700;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-primary, #0f172a);
    }
    .badge {
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .connected {
      background: #dcfce7;
      color: #15803d;
    }
    .disconnected {
      background: #f1f5f9;
      color: #64748b;
    }
    .display-panel {
      background: #090d16;
      border-radius: 10px;
      padding: 1.25rem;
      color: #38bdf8;
      font-family: 'Courier New', Courier, monospace;
      text-align: right;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.8);
      margin-bottom: 1rem;
    }
    .digital-val {
      font-size: 2.5rem;
      font-weight: bold;
      letter-spacing: 2px;
      text-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
    }
    .unit-tag {
      font-size: 1.2rem;
      margin-left: 0.5rem;
      color: #a5f3fc;
    }
    .controls {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    button {
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-connect {
      background: var(--brand-primary, #2563eb);
      color: white;
    }
    .btn-connect:hover {
      background: #1d4ed8;
    }
    .btn-disconnect {
      background: #ef4444;
      color: white;
    }
    .btn-apply {
      background: #10b981;
      color: white;
    }
    .btn-apply:hover {
      background: #059669;
    }
    select {
      padding: 0.6rem;
      border-radius: 8px;
      border: 1px solid var(--border-color, #cbd5e1);
      background: var(--bg-card, #ffffff);
      color: var(--text-primary, #0f172a);
    }
  `;

  disconnectedCallback() {
    super.disconnectedCallback();
    this._service.disconnect();
  }

  render() {
    return html`
      <div class="header">
        <div class="title">
          📶 Bluetooth Multimeter (Web BLE)
        </div>
        <span class="badge ${this._isConnected ? 'connected' : 'disconnected'}">
          ${this._isConnected ? `Verbunden: ${this._deviceName}` : 'Getrennt'}
        </span>
      </div>

      <div class="display-panel">
        <span class="digital-val">
          ${this._latestMeasurement ? this._latestMeasurement.value.toFixed(3) : '---.---'}
        </span>
        <span class="unit-tag">
          ${this._latestMeasurement ? this._latestMeasurement.unit : 'Öhm'}
        </span>
      </div>

      <div class="controls">
        ${!this._isConnected ? html`
          <button class="btn-connect" @click="${this._handleConnect}">
            🔗 Gerät koppeln / Verbinden
          </button>
        ` : html`
          <button class="btn-disconnect" @click="${this._handleDisconnect}">
            ❌ Trennen
          </button>
          
          <select @change="${(e: Event) => this._autoTarget = (e.target as HTMLSelectElement).value as any}">
            <option value="R_PE">Schutzleiter (R_PE)</option>
            <option value="R_ISO">Isolationsw. (R_ISO)</option>
            <option value="I_LEAK">Ableitstrom (I_leak)</option>
          </select>

          <button class="btn-apply" @click="${this._applyToForm}">
            📥 Wert in DGUV V3 übernehmen
          </button>
        `}
      </div>
    `;
  }

  private async _handleConnect() {
    await this._service.connect(
      (m: BleMeasurement) => {
        this._latestMeasurement = m;
      },
      (connected: boolean, deviceName?: string) => {
        this._isConnected = connected;
        this._deviceName = deviceName || '';
      }
    );
  }

  private _handleDisconnect() {
    this._service.disconnect((connected) => {
      this._isConnected = connected;
      this._latestMeasurement = null;
    });
  }

  private _applyToForm() {
    if (!this._latestMeasurement) return;
    this.dispatchEvent(
      new CustomEvent('ble-measurement-received', {
        detail: {
          target: this._autoTarget,
          value: this._latestMeasurement.value.toString(),
          unit: this._latestMeasurement.unit
        },
        bubbles: true,
        composed: true
      })
    );
  }
}
