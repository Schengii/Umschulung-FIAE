import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@vaadin/button";
import "@vaadin/progress-bar";
import wizardStyles from "./ec-diagnosis-wizard.css?inline";
import type { DiagnosisResult } from "../services/ai-types";

@customElement("ec-guided-repair")
export class EcGuidedRepair extends LitElement {
  static styles = unsafeCSS(wizardStyles);

  @property({ type: Object }) result!: DiagnosisResult;
  @property({ type: Number }) stepIndex: number = 0;

  @state() private _isSpeaking: boolean = false;
  @state() private _isListening: boolean = false;
  private _recognition: any = null;

  disconnectedCallback() {
    this._stopSpeech();
    this._stopVoiceControl();
    super.disconnectedCallback();
  }

  private _stopSpeech() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this._isSpeaking = false;
  }

  private _startVoiceControl() {
    const SpeechConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechConstructor) {
      alert("Spracherkennung wird von Ihrem Browser leider nicht unterstützt.");
      return;
    }
    
    try {
      this._recognition = new SpeechConstructor();
      this._recognition.continuous = true;
      this._recognition.lang = 'de-DE';
      this._recognition.interimResults = false;

      this._recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        console.log("Sprachbefehl erkannt:", lastResult);
        
        if (this.result && this.result.actionSteps && this.result.actionSteps[this.stepIndex]) {
          if (lastResult.includes("weiter") || lastResult.includes("nächst") || lastResult.includes("next")) {
            this._handleNext(this.result.actionSteps.length);
          } else if (lastResult.includes("zurück") || lastResult.includes("back")) {
            this._handleBack();
          } else if (lastResult.includes("vorlesen") || lastResult.includes("sprich") || lastResult.includes("lies")) {
            this._speakStep(this.result.actionSteps[this.stepIndex].text);
          } else if (lastResult.includes("stopp") || lastResult.includes("halt")) {
            this._stopSpeech();
          }
        }
      };

      this._recognition.onend = () => {
        if (this._isListening) {
          try {
            this._recognition.start();
          } catch (e) {
            console.warn("Fehler beim Neustarten der Spracherkennung:", e);
          }
        }
      };

      this._recognition.onerror = (e: any) => {
        console.error("Spracherkennungsfehler:", e);
        if (e.error === 'not-allowed') {
          alert("Mikrofon-Berechtigung verweigert.");
          this._isListening = false;
        }
      };

      this._isListening = true;
      this._recognition.start();
    } catch (err) {
      console.error("Fehler beim Initialisieren der Spracherkennung:", err);
      alert("Spracherkennung konnte nicht gestartet werden.");
    }
  }

  private _stopVoiceControl() {
    this._isListening = false;
    if (this._recognition) {
      try {
        this._recognition.stop();
      } catch (e) {
        console.warn("Fehler beim Stoppen der Spracherkennung:", e);
      }
      this._recognition = null;
    }
  }

  private _toggleVoiceControl() {
    if (this._isListening) {
      this._stopVoiceControl();
    } else {
      this._startVoiceControl();
    }
  }

  render() {
    if (!this.result || !this.result.actionSteps || this.result.actionSteps.length === 0) {
      return html`<p>Keine Reparaturschritte verfügbar.</p>`;
    }

    const steps = this.result.actionSteps;
    const currentStep = steps[this.stepIndex];
    const totalSteps = steps.length;

    return html`
      <div class="card result-card mt-1">
        <h3 class="m-0">🛠️ Geführte Reparatur</h3>
        <div class="guided-container">
          <div class="step-card">
            <div class="step-number">Schritt ${this.stepIndex + 1} von ${totalSteps}</div>
            <div class="step-text">${currentStep.text}</div>
          </div>
          
          <vaadin-progress-bar 
            value="${(this.stepIndex + 1) / totalSteps}" 
            class="w-100"
          ></vaadin-progress-bar>

          <div style="display: flex; flex-direction: column; gap: 8px; margin: 4px 0; padding: 12px; background: var(--bg-app); border: 1px solid var(--border); border-radius: var(--radius-s); align-items: center;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap;">
              <span style="font-size: 0.85rem; font-weight: bold; display: flex; align-items: center; gap: 6px; color: var(--text-primary);">
                🗣️ Sprachsteuerung:
              </span>
              <vaadin-button
                theme="${this._isListening ? "primary error" : "secondary"}"
                @click="${this._toggleVoiceControl}"
                style="min-height: auto; height: 28px; font-size: 0.8rem; margin: 0;"
              >
                ${this._isListening ? "🎙️ Aktiv (Stoppen)" : "🎤 Starten"}
              </vaadin-button>
            </div>
            ${this._isListening ? html`
              <div style="font-size: 0.75rem; color: var(--text-muted); text-align: center;">
                Sagen Sie: <strong>"Weiter"</strong> | <strong>"Zurück"</strong> | <strong>"Vorlesen"</strong> | <strong>"Stopp"</strong>
              </div>
            ` : ""}
          </div>
          
          <div class="guided-controls">
            <vaadin-button
              theme="secondary"
              ?disabled="${this.stepIndex === 0}"
              @click="${this._handleBack}"
              >Zurück</vaadin-button
            >
            
            <vaadin-button
              class="tts-button"
              @click="${() => this._speakStep(currentStep.text)}"
              >${this._isSpeaking ? "🛑 Stopp" : "🔊 Vorlesen"}</vaadin-button
            >
            
            <vaadin-button
              theme="primary success"
              @click="${() => this._handleNext(totalSteps)}"
              >${this.stepIndex + 1 === totalSteps ? "Abschließen" : "Weiter"}</vaadin-button
            >
          </div>
          
          <vaadin-button
            theme="tertiary error"
            @click="${this._handleCancel}"
            >Beenden</vaadin-button
          >
        </div>
      </div>
    `;
  }

  private _handleBack() {
    this._stopSpeech();
    this.dispatchEvent(
      new CustomEvent("step-changed", {
        detail: { index: this.stepIndex - 1 },
      })
    );
  }

  private _handleNext(totalSteps: number) {
    this._stopSpeech();
    
    // Markiere aktuellen Schritt als abgeschlossen
    this.dispatchEvent(
      new CustomEvent("step-completed", {
        detail: { index: this.stepIndex },
      })
    );

    if (this.stepIndex + 1 < totalSteps) {
      this.dispatchEvent(
        new CustomEvent("step-changed", {
          detail: { index: this.stepIndex + 1 },
        })
      );
    } else {
      this.dispatchEvent(new CustomEvent("repair-completed"));
    }
  }

  private _handleCancel() {
    this._stopSpeech();
    this._stopVoiceControl();
    this.dispatchEvent(new CustomEvent("close"));
  }

  private _speakStep(text: string) {
    if ("speechSynthesis" in window) {
      if (this._isSpeaking) {
        window.speechSynthesis.cancel();
        this._isSpeaking = false;
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "de-DE";
      utterance.onend = () => {
        this._isSpeaking = false;
      };
      utterance.onerror = () => {
        this._isSpeaking = false;
      };
      this._isSpeaking = true;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Sprachausgabe wird von Ihrem Browser leider nicht unterstützt.");
    }
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "ec-guided-repair": EcGuidedRepair;
  }
}
