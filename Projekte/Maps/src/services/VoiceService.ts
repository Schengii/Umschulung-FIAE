import * as Speech from 'expo-speech';
import { TransportMode } from '../types/navigation';

export type VoiceLanguage = 'de-DE' | 'en-US';

export class VoiceService {
  private static isEnabled: boolean = true;
  private static language: VoiceLanguage = 'de-DE';
  private static lastSpokenInstruction = '';

  /** Sprachausgabe aktivieren/deaktivieren */
  public static setEnabled(enabled: boolean): void {
    VoiceService.isEnabled = enabled;
    if (!enabled) Speech.stop();
  }

  public static getEnabled(): boolean {
    return VoiceService.isEnabled;
  }

  public static async speakInstruction(text: string): Promise<void> {
    await VoiceService.speak(text);
  }

  public static setLanguage(lang: VoiceLanguage): void {
    VoiceService.language = lang;
  }

  /**
   * Spricht einen Navigationshinweis laut vor.
   * Verhindert Wiederholung desselben Texts.
   */
  public static async speak(text: string, force = false): Promise<void> {
    if (!VoiceService.isEnabled) return;
    if (!force && text === VoiceService.lastSpokenInstruction) return;

    VoiceService.lastSpokenInstruction = text;
    await Speech.stop();
    Speech.speak(text, {
      language: VoiceService.language,
      pitch: 1.05,
      rate: 0.92,
      onError: () => {}, // Fehler lautlos ignorieren
    });
  }

  /** Startet Navigation mit Ansage */
  public static async announceNavigationStart(destination: string, mode: TransportMode): Promise<void> {
    const modeLabel =
      mode === 'hiking' ? 'Wanderroute' : mode === 'cycling' ? 'Fahrradroute' : 'Route';
    await VoiceService.speak(`Navigation gestartet. ${modeLabel} nach ${destination}.`, true);
  }

  /** Navigation beendet */
  public static async announceArrival(): Promise<void> {
    await VoiceService.speak('Sie haben Ihr Ziel erreicht. Navigation beendet.', true);
  }

  /** Abbiegehinweis bei bestimmter Distanz (z.B. 300m vorher) */
  public static async announceStep(instruction: string, distanceMeter: number): Promise<void> {
    let text: string;
    if (distanceMeter > 200) {
      text = `In ${VoiceService.formatDistance(distanceMeter)}: ${instruction}`;
    } else if (distanceMeter > 50) {
      text = `Gleich: ${instruction}`;
    } else {
      text = instruction;
    }
    await VoiceService.speak(text);
  }

  /** Off-Route-Warnung */
  public static async announceRerouting(): Promise<void> {
    await VoiceService.speak('Sie haben die Route verlassen. Route wird neu berechnet.', true);
  }

  /** Staumeldung */
  public static async announceTrafficAlert(title: string): Promise<void> {
    await VoiceService.speak(`Verkehrsmeldung: ${title}`, true);
  }

  /** Stoppe laufende Ansage sofort */
  public static async stop(): Promise<void> {
    await Speech.stop();
    VoiceService.lastSpokenInstruction = '';
  }

  private static formatDistance(meters: number): string {
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} Kilometern`;
    if (meters >= 100) return `${Math.round(meters / 100) * 100} Metern`;
    return `${Math.round(meters / 50) * 50} Metern`;
  }
}
