import type { ReactiveController, ReactiveControllerHost } from "lit";
import { getSpeechRecognitionConstructor, type SpeechRecognitionLike } from "../utils/speech-types";
import { showToast } from "../utils/toast";

/** Echtzeit-Diktat über die Web Speech API; liefert erkannte Textstücke an onText. */
export class DictationController implements ReactiveController {
  isListening = false;
  private recognition: SpeechRecognitionLike | null = null;

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly onText: (text: string) => void,
  ) {
    host.addController(this);
  }

  hostConnected(): void {
    // nichts zu tun – die Erkennung wird beim ersten toggle() angelegt
  }

  hostDisconnected(): void {
    this.recognition?.stop();
  }

  toggle(): void {
    if (!this.recognition && !this.createRecognition()) return;
    const recognition = this.recognition!;

    if (this.isListening) {
      recognition.stop();
      this.setListening(false);
      return;
    }
    try {
      recognition.start();
      this.setListening(true);
    } catch (e) {
      console.error("Error starting speech recognition:", e);
      showToast("Fehler beim Starten der Spracherkennung.", "error");
    }
  }

  private createRecognition(): boolean {
    const SpeechConstructor = getSpeechRecognitionConstructor();
    if (!SpeechConstructor) {
      showToast("Dein Browser unterstützt leider keine Spracherkennung.", "warning");
      return false;
    }
    const recognition = new SpeechConstructor();
    recognition.lang = "de-DE";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let combined = "";
      for (let i = 0; i < event.results.length; i++) {
        const item = event.results[i]?.[0]?.transcript;
        if (item) combined += item;
      }
      const transcript = combined.trim();
      if (transcript) this.onText(transcript);
    };
    recognition.onend = () => this.setListening(false);
    recognition.onerror = () => {
      this.setListening(false);
      showToast("Fehler bei der Spracherkennung. Bitte Mikrofon-Berechtigung prüfen.", "error");
    };

    this.recognition = recognition;
    return true;
  }

  private setListening(value: boolean): void {
    this.isListening = value;
    this.host.requestUpdate();
  }
}
