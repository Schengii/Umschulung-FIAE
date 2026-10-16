import { beforeEach, describe, expect, it, vi } from "vitest";
import { VoiceAssistantService, voiceAssistant } from "./voice-assistant-service";
import type { SpeechRecognitionEventLike, SpeechRecognitionLike } from "../utils/speech-types";

describe("VoiceAssistantService", () => {
  let mockRecognitionInstance: SpeechRecognitionLike;
  let recognitionInstances: SpeechRecognitionLike[] = [];

  beforeEach(() => {
    recognitionInstances = [];
    mockRecognitionInstance = {
      continuous: false,
      interimResults: false,
      lang: "",
      maxAlternatives: 1,
      onresult: null,
      onerror: null,
      onend: null,
      start: vi.fn(),
      stop: vi.fn(),
    };

    const MockRecognition = vi.fn(function () {
      const inst = { ...mockRecognitionInstance };
      recognitionInstances.push(inst);
      return inst;
    });

    const mockSpeechSynthesis = {
      speaking: false,
      speak: vi.fn((utterance: SpeechSynthesisUtterance) => {
        mockSpeechSynthesis.speaking = true;
        utterance.onstart?.(new Event("start") as SpeechSynthesisEvent);
      }),
      cancel: vi.fn(() => {
        mockSpeechSynthesis.speaking = false;
      }),
    };

    const fakeWindow = {
      SpeechRecognition: MockRecognition,
      speechSynthesis: mockSpeechSynthesis,
    };
    vi.stubGlobal("window", fakeWindow);
    vi.stubGlobal("SpeechRecognition", MockRecognition);
    vi.stubGlobal("speechSynthesis", mockSpeechSynthesis);
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      vi.fn(function (text: string) {
        return {
          text,
          lang: "de-DE",
          rate: 1.0,
          pitch: 1.0,
          onstart: null,
          onend: null,
          onerror: null,
        };
      }),
    );
  });

  it("prüft Web Speech und TTS Unterstützung", () => {
    const service = new VoiceAssistantService();
    expect(service.isSupported()).toBe(true);
    expect(service.isTtsSupported()).toBe(true);
  });

  it("startet und stoppt das Zuhören sauber", () => {
    const service = new VoiceAssistantService();
    const inst = recognitionInstances[0];
    const callback = vi.fn();

    expect(service.getIsListening()).toBe(false);
    expect(service.startListening(callback)).toBe(true);
    expect(service.getIsListening()).toBe(true);
    expect(inst.start).toHaveBeenCalled();

    service.stopListening();
    expect(service.getIsListening()).toBe(false);
    expect(inst.stop).toHaveBeenCalled();
  });

  it("fängt Fehler beim Starten des Erkennungsdienstes ab", () => {
    const service = new VoiceAssistantService();
    const inst = recognitionInstances[0];
    inst.start = vi.fn(() => {
      throw new Error("Mikrofon blockiert");
    });

    const ok = service.startListening(vi.fn());
    expect(ok).toBe(false);
    expect(service.getIsListening()).toBe(false);
  });

  it("verarbeitet Sprachbefehle korrekt", () => {
    const service = new VoiceAssistantService();
    const inst = recognitionInstances[0];
    const commands: Array<[string, string]> = [];
    service.startListening((cmd, raw) => commands.push([cmd, raw]));

    const emit = (text: string) => {
      const event: SpeechRecognitionEventLike = {
        results: [
          {
            isFinal: true,
            0: { transcript: text },
          },
        ],
      };
      inst.onresult?.(event);
    };

    emit("weiter");
    emit("bitte zurück");
    emit("schritt vorlesen");
    emit("stopp jetzt");
    emit("taschenlampe an");
    emit("hallo welt");

    expect(commands).toEqual([
      ["NEXT", "weiter"],
      ["BACK", "bitte zurück"],
      ["READ", "schritt vorlesen"],
      ["STOP", "stopp jetzt"],
      ["TORCH", "taschenlampe an"],
      ["UNKNOWN", "hallo welt"],
    ]);
  });

  it("ignoriert nicht-finale oder leere Sprachergebnisse", () => {
    const service = new VoiceAssistantService();
    const inst = recognitionInstances[0];
    const callback = vi.fn();
    service.startListening(callback);

    inst.onresult?.({
      results: [
        {
          isFinal: false,
          0: { transcript: "noch nicht fertig" },
        },
      ],
    });
    expect(callback).not.toHaveBeenCalled();

    inst.onresult?.({ results: [] });
    expect(callback).not.toHaveBeenCalled();
  });

  it("liest Text per TTS vor und ruft onEnd-Callback auf", () => {
    const service = new VoiceAssistantService();
    const onEnd = vi.fn();
    service.speak("Prüfschritt 1", onEnd);

    expect(window.speechSynthesis.speak).toHaveBeenCalled();
    expect(service.getIsSpeaking()).toBe(true);

    // Simuliere Ende der Sprachausgabe
    const utterance = vi.mocked(window.speechSynthesis.speak).mock.calls[0][0];
    utterance.onend?.(new Event("end") as SpeechSynthesisEvent);

    expect(service.getIsSpeaking()).toBe(false);
    expect(onEnd).toHaveBeenCalled();
  });

  it("bricht laufende Sprachausgabe mit stopSpeaking() ab", () => {
    const service = new VoiceAssistantService();
    service.speak("Test");
    expect(service.getIsSpeaking()).toBe(true);

    service.stopSpeaking();
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    expect(service.getIsSpeaking()).toBe(false);
  });

  it("behandelt TTS-Fehler ohne Absturz", () => {
    const service = new VoiceAssistantService();
    service.speak("Testfehler");

    const utterance = vi.mocked(window.speechSynthesis.speak).mock.calls[0][0];
    utterance.onerror?.(new Event("error") as SpeechSynthesisErrorEvent);

    expect(service.getIsSpeaking()).toBe(false);
  });

  it("exportierte Singleton-Instanz voiceAssistant existiert", () => {
    expect(voiceAssistant).toBeInstanceOf(VoiceAssistantService);
  });
});
