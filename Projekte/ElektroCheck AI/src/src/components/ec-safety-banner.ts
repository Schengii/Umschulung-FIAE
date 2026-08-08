import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import '@vaadin/button';

@customElement('ec-safety-banner')
export class EcSafetyBanner extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 2rem 1.5rem;
      background-color: var(--danger-glow);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: var(--radius-m);
      box-shadow: var(--shadow-md);
      max-width: 500px;
      margin: 2rem auto;
      text-align: center;
    }
    h3 { 
      color: var(--danger); 
      margin-top: 0; 
      font-weight: 800;
      font-size: 1.25rem;
    }
    p { 
      font-size: 0.95rem; 
      line-height: 1.6; 
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
    }
    vaadin-button {
      width: 100%;
    }
  `;

  render() {
    return html`
      <div class="banner">
        <h3>⚠️ Wichtiger Sicherheitshinweis</h3>
        <p>
          Arbeiten an Elektrogeräten können lebensgefährlich sein. 
          Diese Diagnose ersetzt keine Elektrofachkraft. 
          Öffnen Sie niemals Geräte, die unter Spannung stehen.
        </p>
        <vaadin-button theme="primary error" @click="${this._confirm}">
          Ich habe verstanden
        </vaadin-button>
      </div>
    `;
  }

  private _confirm() {
    this.dispatchEvent(new CustomEvent('safety-confirmed'));
  }
}