import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

// Globale Stile & Vaadin Lumo Theme
import './index.css';
import '@vaadin/vaadin-lumo-styles/lumo.css';

// Komponenten registrieren
import './components/ec-welcome';
import './components/ec-diagnosis-wizard';

@customElement('app-root')
export class AppRoot extends LitElement {
  @state() private _hasStarted = false;

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background-color: var(--bg-app);
      color: var(--text-primary);
      margin: 0 auto;
      font-family: var(--font-sans);
      transition: background-color 0.3s, color 0.3s;
    }
    main {
      width: 100%;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
  `;

  render() {
    return html`
      <main>
        ${!this._hasStarted 
          ? html`
              <ec-welcome 
                @start="${this._handleStart}">
              </ec-welcome>`
          : html`
              <ec-diagnosis-wizard></ec-diagnosis-wizard>`
        }
      </main>
    `;
  }

  private _handleStart() {
    this._hasStarted = true;
  }
}