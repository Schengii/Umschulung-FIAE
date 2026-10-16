import type { ReactiveController, ReactiveControllerHost } from "lit";
import { showToast } from "../utils/toast";

const AUDIO_TYPES = ["audio/webm", "audio/mp4", "audio/ogg", "audio/wav"];

// Sprache braucht wenig Bitrate; zusammen mit der Zeitgrenze bleibt die Aufnahme weit unter dem 4,5-MB-Body-Limit der API
const AUDIO_BITS_PER_SECOND = 32_000;
const MAX_RECORDING_MS = 5 * 60 * 1000;

const getSupportedAudioMimeType = (): string => AUDIO_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";

/** Sprachnotiz-Aufnahme per MediaRecorder; die fertige Aufnahme geht an onRecorded (z.B. zur Transkription). */
export class AudioNoteController implements ReactiveController {
  isRecording = false;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stopTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly onRecorded: (audio: Blob) => void | Promise<void>,
  ) {
    host.addController(this);
  }

  hostConnected(): void {
    // nichts zu tun
  }

  hostDisconnected(): void {
    this.stop();
  }

  async toggle(): Promise<void> {
    if (this.isRecording) this.stop();
    else await this.start();
  }

  private async start(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedAudioMimeType();
      const recorder = new MediaRecorder(stream, { audioBitsPerSecond: AUDIO_BITS_PER_SECOND, ...(mimeType ? { mimeType } : {}) });
      this.chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.chunks.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(this.chunks, { type: getSupportedAudioMimeType() || "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        await this.onRecorded(blob);
      };

      recorder.start();
      this.stopTimer = setTimeout(() => {
        showToast("Maximale Aufnahmedauer von 5 Minuten erreicht – Aufnahme beendet.", "info");
        this.stop();
      }, MAX_RECORDING_MS);
      this.recorder = recorder;
      this.setRecording(true);
    } catch {
      showToast("Zugriff auf das Mikrofon verweigert oder nicht unterstützt.", "error");
    }
  }

  private stop(): void {
    if (this.stopTimer) clearTimeout(this.stopTimer);
    this.stopTimer = null;
    if (this.recorder && this.recorder.state !== "inactive") {
      this.recorder.stop();
      this.setRecording(false);
    }
  }

  private setRecording(value: boolean): void {
    this.isRecording = value;
    this.host.requestUpdate();
  }
}
