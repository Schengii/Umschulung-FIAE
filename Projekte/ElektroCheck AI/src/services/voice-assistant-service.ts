import { getSpeechRecognitionConstructor, type SpeechRecognitionEventLike, type SpeechRecognitionLike } from '../utils/speech-types';
export type VoiceCommandCallback = (command: 'NEXT' | 'BACK' | 'READ' | 'STOP' | 'TORCH' | 'UNKNOWN', rawText: string) => void;

export class VoiceAssistantService {
  private recognition: SpeechRecognitionLike | null = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private onCommandCallback: VoiceCommandCallback | null = null;

  constructor() {
    const SpeechConstructor = getSpeechRecognitionConstructor();

    if (SpeechConstructor) {
      try {
        this.recognition = new SpeechConstructor();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'de-DE';

        this.recognition.onresult = (event: SpeechRecognitionEventLike) => {
          const results = event.results;
          if (results && results.length > 0) {
            const last = results[results.length - 1];
            if (last.isFinal && last[0]) {
              const transcript = last[0].transcript.toLowerCase().trim();
              this._handleTranscript(transcript);
            }
          }
        };

        this.recognition.onerror = (err: unknown) => {
          console.warn('VoiceAssistant speech recognition error:', err);
        };
      } catch (e) {
        console.warn('SpeechRecognition initialization error:', e);
      }
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public isTtsSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public startListening(callback: VoiceCommandCallback): boolean {
    if (!this.recognition) return false;
    this.onCommandCallback = callback;

    try {
      if (!this.isListening) {
        this.recognition.start();
        this.isListening = true;
      }
      return true;
    } catch (e) {
      console.warn('Could not start speech recognition:', e);
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore stop error
      }
      this.isListening = false;
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public speak(text: string, onEnd?: () => void): void {
    if (!this.isTtsSupported()) return;

    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
    };
    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      this.isSpeaking = false;
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.isTtsSupported() && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  private _handleTranscript(transcript: string): void {
    if (!this.onCommandCallback) return;

    if (
      transcript.includes('weiter') ||
      transcript.includes('nächst') ||
      transcript.includes('folgend') ||
      transcript.includes('ok')
    ) {
      this.onCommandCallback('NEXT', transcript);
    } else if (
      transcript.includes('zurück') ||
      transcript.includes('vorher') ||
      transcript.includes('rückwärts')
    ) {
      this.onCommandCallback('BACK', transcript);
    } else if (
      transcript.includes('vorlesen') ||
      transcript.includes('sprich') ||
      transcript.includes('lese') ||
      transcript.includes('vor')
    ) {
      this.onCommandCallback('READ', transcript);
    } else if (
      transcript.includes('stopp') ||
      transcript.includes('halt') ||
      transcript.includes('pause') ||
      transcript.includes('ruhe')
    ) {
      this.onCommandCallback('STOP', transcript);
    } else if (
      transcript.includes('licht') ||
      transcript.includes('lampe') ||
      transcript.includes('taschenlampe') ||
      transcript.includes('an') ||
      transcript.includes('aus')
    ) {
      this.onCommandCallback('TORCH', transcript);
    } else {
      this.onCommandCallback('UNKNOWN', transcript);
    }
  }
}

export const voiceAssistant = new VoiceAssistantService();
