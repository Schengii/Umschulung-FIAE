import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactiveControllerHost } from "lit";
import { DictationController } from "./dictation-controller";
import type { SpeechRecognitionEventLike, SpeechRecognitionLike } from "../utils/speech-types";

describe("DictationController", () => {
  let mockHost: ReactiveControllerHost;
  let mockRecognition: SpeechRecognitionLike;

  beforeEach(() => {
    mockHost = {
      addController: vi.fn(),
      removeController: vi.fn(),
      requestUpdate: vi.fn(),
      updateComplete: Promise.resolve(true),
    };

    mockRecognition = {
      continuous: false,
      interimResults: true,
      lang: "de-DE",
      maxAlternatives: 1,
      onresult: null,
      onerror: null,
      onend: null,
      start: vi.fn(),
      stop: vi.fn(),
    };

    const MockConstructor = vi.fn(function () {
      return mockRecognition;
    });

    vi.stubGlobal("window", {
      SpeechRecognition: MockConstructor,
    });
  });

  it("registriert sich am ReactiveControllerHost", () => {
    new DictationController(mockHost, vi.fn());
    expect(mockHost.addController).toHaveBeenCalled();
  });

  it("startet und stoppt die Spracherkennung per toggle()", () => {
    const controller = new DictationController(mockHost, vi.fn());

    expect(controller.isListening).toBe(false);
    controller.toggle();
    expect(controller.isListening).toBe(true);
    expect(mockRecognition.start).toHaveBeenCalled();
    expect(mockHost.requestUpdate).toHaveBeenCalled();

    controller.toggle();
    expect(controller.isListening).toBe(false);
    expect(mockRecognition.stop).toHaveBeenCalled();
  });

  it("aggregiert mehrteilige Transkripte und ruft onText auf", () => {
    const onText = vi.fn();
    const controller = new DictationController(mockHost, onText);
    controller.toggle();

    const event: SpeechRecognitionEventLike = {
      results: [
        { isFinal: true, 0: { transcript: "Kabelbruch " } },
        { isFinal: true, 0: { transcript: "an Klemme 3" } },
      ],
    };

    mockRecognition.onresult?.(event);
    expect(onText).toHaveBeenCalledWith("Kabelbruch an Klemme 3");
  });

  it("setzt isListening auf false bei onend und onerror", () => {
    const controller = new DictationController(mockHost, vi.fn());
    controller.toggle();
    expect(controller.isListening).toBe(true);

    mockRecognition.onerror?.(new Event("error"));
    expect(controller.isListening).toBe(false);

    controller.toggle();
    expect(controller.isListening).toBe(true);
    mockRecognition.onend?.();
    expect(controller.isListening).toBe(false);
  });

  it("stoppt die Erkennung bei hostDisconnected()", () => {
    const controller = new DictationController(mockHost, vi.fn());
    controller.toggle();
    controller.hostDisconnected();
    expect(mockRecognition.stop).toHaveBeenCalled();
  });
});
