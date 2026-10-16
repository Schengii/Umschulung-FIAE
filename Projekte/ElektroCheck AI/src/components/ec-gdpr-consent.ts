import { LitElement, html, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import "@vaadin/button";
import wizardStyles from "./ec-diagnosis-wizard.css?inline";

/** DSGVO-Einwilligung. Löst "consent-accepted" aus bzw. "legal-requested" (Datenschutzerklärung anzeigen). */
@customElement("ec-gdpr-consent")
export class EcGdprConsent extends LitElement {
  static styles = unsafeCSS(wizardStyles);

  @state() private _checked = false;

  private _accept() {
    if (this._checked) this.dispatchEvent(new CustomEvent("consent-accepted"));
  }

  private _showPrivacy(e: Event) {
    e.preventDefault();
    this.dispatchEvent(new CustomEvent("legal-requested", { detail: { type: "privacy" } }));
  }

  render() {
    return html`
      <div class="modal-overlay" role="dialog" aria-modal="true" aria-label="DSGVO-Einwilligung und Datenschutz">
        <div class="card consent-card">
          <h3 class="consent-title">🔒 DSGVO-Einwilligung & Datenschutz</h3>
          <p class="consent-text">
            Um eine KI-gestützte Fehlerdiagnose durchführen zu können, müssen Ihre Eingaben (Fehlerbeschreibungen und ggf. aufgenommene Bilder) zur Analyse an die Google Gemini API übertragen werden.
          </p>
          <p class="consent-text">
            Ihre Daten werden über eine gesicherte SSL-Verbindung an unseren Backend-Proxy übermittelt. Es findet keine dauerhafte Speicherung Ihrer Bilddateien auf unseren Servern statt. Die App speichert Ihre Diagnosehistorie sowie Einstellungen ausschließlich lokal in Ihrem Webbrowser (Local Storage).
          </p>

          <label class="consent-checkbox-label">
            <input
              type="checkbox"
              .checked="${this._checked}"
              @change="${(e: Event) => (this._checked = (e.target as HTMLInputElement).checked)}"
            />
            <span>
              Ich willige in die Verarbeitung meiner Daten zum Zwecke der KI-Diagnose ein und bestätige, dass ich die <a href="#" @click="${this._showPrivacy}">Datenschutzerklärung</a> gelesen habe.
            </span>
          </label>

          <vaadin-button
            theme="primary"
            class="w-100"
            ?disabled="${!this._checked}"
            @click="${this._accept}"
            >Einwilligen & Fortfahren</vaadin-button
          >
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-gdpr-consent": EcGdprConsent;
  }
}
