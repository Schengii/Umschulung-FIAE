import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@vaadin/button";
import "@vaadin/text-field";
import wizardStyles from "./ec-diagnosis-wizard.css?inline";
import { loginWithAccessToken, requestLoginLink, verifyLoginCode, verifyLoginToken } from "../services/auth-service";
import { getErrorMessage } from "../utils/error";

/**
 * Anmeldung per Magic-Link: E-Mail eingeben, Link aus der Mail öffnen (oder den 6-stelligen Code eintippen).
 * Löst "login-success" aus.
 */
@customElement("ec-login")
export class EcLogin extends LitElement {
  static styles = unsafeCSS(wizardStyles);

  /** Hinweis, z.B. "Sitzung abgelaufen" */
  @property({ type: String }) notice = "";

  @state() private _email = "";
  @state() private _code = "";
  @state() private _step: "email" | "code" | "access" = "email";
  @state() private _accessCode = "";
  @state() private _busy = false;
  @state() private _error = "";
  @state() private _devLink = "";
  @state() private _devCode = "";

  private _success() {
    this.dispatchEvent(new CustomEvent("login-success"));
  }

  private async _sendLink() {
    const email = this._email.trim();
    if (!email || this._busy) return;
    this._busy = true;
    this._error = "";
    try {
      const result = await requestLoginLink(email);
      this._devLink = result.devLink ?? "";
      this._devCode = result.devCode ?? "";
      this._step = "code";
    } catch (e) {
      this._error = getErrorMessage(e);
    } finally {
      this._busy = false;
    }
  }

  private async _submitCode() {
    if (this._code.trim().length !== 6 || this._busy) return;
    this._busy = true;
    this._error = "";
    try {
      await verifyLoginCode(this._email.trim(), this._code.trim());
      this._success();
    } catch (e) {
      this._error = getErrorMessage(e);
    } finally {
      this._busy = false;
    }
  }

  private async _submitAccessCode() {
    if (!this._accessCode.trim() || this._busy) return;
    this._busy = true;
    this._error = "";
    try {
      await loginWithAccessToken(this._accessCode);
      this._success();
    } catch (e) {
      this._error = getErrorMessage(e);
    } finally {
      this._busy = false;
    }
  }

  /** Nur Entwicklungsmodus (kein Mailversand): Link direkt einlösen. */
  private async _openDevLink() {
    const token = new URL(this._devLink).searchParams.get("login_token");
    if (!token) return;
    this._busy = true;
    try {
      await verifyLoginToken(token);
      this._success();
    } catch (e) {
      this._error = getErrorMessage(e);
    } finally {
      this._busy = false;
    }
  }

  render() {
    return html`
      <div class="container">
        <div class="card" style="max-width: 420px; margin: 10vh auto 0; text-align: left;">
          <h2 class="m-0">⚡ ElectroCheck AI</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">Melde dich mit deiner E-Mail-Adresse an – ohne Passwort.</p>
          ${this.notice ? html`<p class="text-danger-small" role="status">${this.notice}</p>` : ""}

          ${this._step === "access"
            ? html`
                <vaadin-text-field
                  class="w-100"
                  label="Zugangscode"
                  type="password"
                  autocomplete="off"
                  .value="${this._accessCode}"
                  @value-changed="${(e: CustomEvent) => (this._accessCode = e.detail.value)}"
                  @keydown="${(e: KeyboardEvent) => e.key === "Enter" && this._submitAccessCode()}"
                ></vaadin-text-field>
                <vaadin-button
                  theme="primary"
                  class="w-100 mt-1"
                  ?disabled="${this._busy || !this._accessCode.trim()}"
                  @click="${this._submitAccessCode}"
                  >${this._busy ? "Prüfe…" : "Anmelden"}</vaadin-button
                >
                <vaadin-button theme="tertiary" class="w-100 mt-1" @click="${() => { this._step = "email"; this._error = ""; }}"
                  >← Mit E-Mail anmelden</vaadin-button
                >
              `
            : this._step === "email"
            ? html`
                <vaadin-text-field
                  class="w-100"
                  label="E-Mail-Adresse"
                  type="email"
                  autocomplete="email"
                  .value="${this._email}"
                  @value-changed="${(e: CustomEvent) => (this._email = e.detail.value)}"
                  @keydown="${(e: KeyboardEvent) => e.key === "Enter" && this._sendLink()}"
                ></vaadin-text-field>
                <vaadin-button
                  theme="primary"
                  class="w-100 mt-1"
                  ?disabled="${this._busy || !this._email.trim()}"
                  @click="${this._sendLink}"
                  >${this._busy ? "Sende…" : "Anmelde-Link senden"}</vaadin-button
                >
                <vaadin-button theme="tertiary" class="w-100 mt-1" @click="${() => { this._step = "access"; this._error = ""; }}"
                  >Ich habe einen Zugangscode</vaadin-button
                >
              `
            : html`
                <p style="font-size: 0.9rem;">
                  Falls <strong>${this._email}</strong> freigegeben ist, haben wir dir einen Link geschickt. Öffne ihn auf diesem Gerät –
                  oder gib hier den 6-stelligen Code aus der E-Mail ein (praktisch in der App).
                </p>
                <vaadin-text-field
                  class="w-100"
                  label="Code aus der E-Mail"
                  inputmode="numeric"
                  maxlength="6"
                  autocomplete="one-time-code"
                  .value="${this._code}"
                  @value-changed="${(e: CustomEvent) => (this._code = e.detail.value)}"
                  @keydown="${(e: KeyboardEvent) => e.key === "Enter" && this._submitCode()}"
                ></vaadin-text-field>
                <vaadin-button
                  theme="primary"
                  class="w-100 mt-1"
                  ?disabled="${this._busy || this._code.trim().length !== 6}"
                  @click="${this._submitCode}"
                  >${this._busy ? "Prüfe…" : "Anmelden"}</vaadin-button
                >
                ${this._devLink
                  ? html`<vaadin-button theme="tertiary" class="w-100 mt-1" @click="${this._openDevLink}"
                      >🧪 Entwicklungsmodus: Link direkt einlösen (Code ${this._devCode})</vaadin-button
                    >`
                  : ""}
                <vaadin-button
                  theme="tertiary"
                  class="w-100 mt-1"
                  @click="${() => {
                    this._step = "email";
                    this._code = "";
                    this._error = "";
                  }}"
                  >← Andere Adresse</vaadin-button
                >
              `}
          ${this._error ? html`<p class="text-danger-small" role="alert" style="margin-top: 12px;">${this._error}</p>` : ""}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-login": EcLogin;
  }
}
