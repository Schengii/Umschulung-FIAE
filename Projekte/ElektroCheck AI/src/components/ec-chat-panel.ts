import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@vaadin/button";
import wizardStyles from "./ec-diagnosis-wizard.css?inline";
import { GeminiAIService } from "../services/gemini-services";
import type { DiagnosisResult } from "../services/ai-types";
import { getErrorMessage } from "../utils/error";
import { showToast } from "../utils/toast";

type ChatMessage = { role: "user" | "assistant"; content: string };

/** KI-Reparatur-Co-Pilot: Folgefragen zum aktuellen Befund. Verwaltet Verlauf und Eingabe selbst. */
@customElement("ec-chat-panel")
export class EcChatPanel extends LitElement {
  static styles = unsafeCSS(wizardStyles);

  @property({ attribute: false }) result: DiagnosisResult | null = null;

  @state() private _messages: ChatMessage[] = [];
  @state() private _input = "";
  @state() private _isLoading = false;

  private _aiService = new GeminiAIService();

  private async _send() {
    if (!this._input.trim() || this._isLoading) return;
    const userText = this._input.trim();
    this._input = "";
    this._messages = [...this._messages, { role: "user", content: userText }];
    this._isLoading = true;

    try {
      const reply = await this._aiService.sendChatMessage(
        this._messages,
        this.result
          ? {
              deviceName: this.result.deviceName,
              identifiedDefect: this.result.identifiedDefect,
              recommendation: this.result.recommendation,
            }
          : undefined,
      );
      this._messages = [...this._messages, { role: "assistant", content: reply }];
    } catch (e) {
      showToast(`Chat-Fehler: ${getErrorMessage(e)}`, "error");
    } finally {
      this._isLoading = false;
    }
  }

  render() {
    return html`
      <div class="card mt-1" style="text-align: left; background: var(--bg-app); border: 1px solid var(--border); border-radius: var(--radius-m, 12px); padding: 14px; margin-top: 1rem;">
        <h4 style="margin: 0 0 10px 0; font-weight: bold; color: var(--accent-primary, #0284c7); display: flex; align-items: center; gap: 6px; font-size: 0.95rem;">
          💬 Reparatur-Co-Pilot (Fragen zum Befund / VDE)
        </h4>
        <div class="chat-messages-container" style="max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; padding: 4px;">
          ${this._messages.length === 0
            ? html`<div role="status" aria-live="polite" style="font-size: 0.8rem; color: var(--text-secondary); font-style: italic;">
                Stelle eine Folgefrage zur Diagnose, VDE-Messung oder Reparaturanleitung...
              </div>`
            : this._messages.map(
                (msg) => html`
                  <div style="align-self: ${msg.role === "user" ? "flex-end" : "flex-start"}; background: ${msg.role === "user" ? "var(--primary, #0284c7)" : "var(--bg-card, #ffffff)"}; color: ${msg.role === "user" ? "#ffffff" : "var(--text-primary)"}; padding: 8px 12px; border-radius: 8px; max-width: 85%; font-size: 0.85rem; border: 1px solid var(--border); box-shadow: var(--shadow-xs);">
                    <strong>${msg.role === "user" ? "Du:" : "🤖 Co-Pilot:"}</strong>
                    <div style="white-space: pre-wrap; margin-top: 4px;">${msg.content}</div>
                  </div>
                `,
              )}
          ${this._isLoading
            ? html`<div style="font-size: 0.8rem; color: var(--text-secondary); font-style: italic;">
                🤖 Co-Pilot tippt eine Antwort...
              </div>`
            : ""}
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input
            type="text"
            aria-label="Frage an den Co-Pilot"
            style="flex: 1; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-primary); font-size: 0.85rem;"
            placeholder="z.B. Wie klemme ich den RCD gefahrlos ab?"
            .value="${this._input}"
            @input="${(e: Event) => (this._input = (e.target as HTMLInputElement).value)}"
            @keydown="${(e: KeyboardEvent) => {
              if (e.key === "Enter") this._send();
            }}"
          />
          <vaadin-button
            theme="primary"
            ?disabled="${this._isLoading || !this._input.trim()}"
            @click="${this._send}"
            style="font-size: 0.85rem; min-height: 36px;"
          >
            Senden
          </vaadin-button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-chat-panel": EcChatPanel;
  }
}
