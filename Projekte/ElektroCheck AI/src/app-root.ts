import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { checkAuth, installSessionExpiryHandler, verifyLoginToken } from './services/auth-service';
import { initPwaUpdates } from './utils/pwa-update';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

// Globale Stile & Vaadin Lumo Theme
import './index.css';
import '@vaadin/vaadin-lumo-styles/lumo.css';

// Komponenten registrieren
import './components/ec-welcome';
import './components/ec-login';
import './components/ec-diagnosis-wizard';

// Vercel Web Analytics nur im regulären Web-Kontext initialisieren (unterdrückt Beacon-Fehler in Capacitor-Runtimes)
const isNativeCapacitor =
  typeof window !== 'undefined' &&
  (window.location.protocol === 'capacitor:' ||
   window.location.protocol === 'ionic:' ||
   (window.location.hostname === 'localhost' && !window.location.port));

if (!isNativeCapacitor) {
  inject();
  injectSpeedInsights();
}

@customElement('app-root')
export class AppRoot extends LitElement {
  @state() private _hasStarted = false;
  @state() private _auth: 'checking' | 'login' | 'ready' = 'checking';
  @state() private _loginNotice = '';

  private _removeExpiryHandler: (() => void) | null = null;

  connectedCallback() {
    super.connectedCallback();
    initPwaUpdates();
    this._removeExpiryHandler = installSessionExpiryHandler(() => {
      this._loginNotice = 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.';
      this._auth = 'login';
    });
    this._initAuth();
  }

  disconnectedCallback() {
    this._removeExpiryHandler?.();
    super.disconnectedCallback();
  }

  /** Löst einen Magic-Link aus der Adresszeile ein (?login_token=…) und prüft danach die Anmeldung. */
  private async _initAuth() {
    const url = new URL(window.location.href);
    const loginToken = url.searchParams.get('login_token');
    if (loginToken) {
      url.searchParams.delete('login_token');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
      try {
        await verifyLoginToken(loginToken);
      } catch {
        this._loginNotice = 'Der Anmelde-Link ist ungültig oder abgelaufen. Bitte fordere einen neuen an.';
      }
    }
    const { status } = await checkAuth();
    this._auth = status === 'login-required' ? 'login' : 'ready';
  }

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
    if (this._auth === 'checking') {
      return html`<main></main>`;
    }
    if (this._auth === 'login') {
      return html`
        <main>
          <ec-login
            .notice="${this._loginNotice}"
            @login-success="${() => { this._loginNotice = ''; this._auth = 'ready'; }}"
          ></ec-login>
        </main>
      `;
    }
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