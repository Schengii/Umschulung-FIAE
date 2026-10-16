import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@vaadin/button";
import wizardStyles from "./ec-diagnosis-wizard.css?inline";

/** Impressum bzw. Datenschutzerklärung als Modal. Löst "close" aus. */
@customElement("ec-legal-modal")
export class EcLegalModal extends LitElement {
  static styles = unsafeCSS(wizardStyles);

  @property({ type: String }) type: "imprint" | "privacy" = "privacy";

  render() {
    const isImprint = this.type === "imprint";

    return html`
      <div class="modal-overlay" style="z-index: 3000;" role="dialog" aria-modal="true" aria-label="${isImprint ? "Impressum" : "Datenschutzerklärung"}">
        <div class="card settings-card" style="max-height: 85vh; overflow-y: auto;">
          <h3 class="m-0">${isImprint ? "Impressum" : "Datenschutzerklärung"}</h3>
          <div style="margin: 1.25rem 0; font-size: 0.875rem; line-height: 1.6; text-align: left; color: var(--text-secondary);">
            ${isImprint
              ? html`
                  <p><strong>ElectroCheck AI</strong></p>
                  <p>Eine innovative Anwendung für Elektrofachkräfte.</p>
                  <p><strong>Vertreten durch:</strong><br>Schengi / ElektroCheck AI GmbH</p>
                  <p><strong>Kontakt:</strong><br>E-Mail: info@electrocheck-ai.de<br>Webseite: www.electrocheck-ai.de</p>
                  <p><strong>Haftungsausschluss:</strong><br>Die Inhalte dieser App (insb. die KI-Diagnosen) wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Arbeiten an elektrischen Anlagen dürfen nur durch qualifizierte Elektrofachkräfte unter Einhaltung der 5 Sicherheitsregeln durchgeführt werden.</p>
                `
              : html`
                  <p><strong>1. Datenschutz auf einen Blick</strong></p>
                  <p>Diese Datenschutzerklärung informiert Sie über die Art, den Umfang und Zweck der Verarbeitung von personenbezogenen Daten innerhalb unserer App.</p>

                  <p><strong>2. Datenverarbeitung durch die Gemini-API</strong></p>
                  <p>Für die Analyse von Fehlern übermittelt diese App Bilddaten und Beschreibungen per HTTPS-Verschlüsselung an unseren Backend-Proxy, welcher die Anfrage an die Google Gemini API weiterleitet. Die Bilddaten werden temporär übertragen und nicht dauerhaft serverseitig gespeichert.</p>

                  <p><strong>3. Lokale Speicherung (Local Storage)</strong></p>
                  <p>Diese App nutzt den lokalen Speicher Ihres Browsers, um Ihre Diagnosehistorie, Ihre Einstellungen und Ihren API-Schlüssel zu speichern. Diese Daten verlassen Ihr Gerät nicht, es sei denn, Sie führen eine Diagnoseanfrage durch. Sie können diese Daten in den Einstellungen jederzeit löschen.</p>

                  <p><strong>4. Reichweitenmessung (Vercel Web Analytics)</strong></p>
                  <p>Zur Verbesserung der App nutzen wir Vercel Web Analytics und Speed Insights. Dabei werden ohne Cookies und ohne Wiedererkennung über mehrere Websites aggregierte Nutzungs- und Leistungsdaten (z. B. aufgerufene Seite, Gerätetyp, Ladezeiten) erfasst. Ein Personenbezug wird nicht hergestellt.</p>

                  <p><strong>5. Ihre Rechte</strong></p>
                  <p>Sie haben das Recht auf Auskunft, Datenübertragbarkeit und Löschung Ihrer Daten. Nutzen Sie hierfür die Export- und Löschfunktionen in den Einstellungen.</p>
                `}
          </div>
          <div class="modal-actions">
            <vaadin-button theme="primary" @click="${() => this.dispatchEvent(new CustomEvent("close"))}">Schließen</vaadin-button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-legal-modal": EcLegalModal;
  }
}
