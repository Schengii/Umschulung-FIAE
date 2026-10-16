import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactiveControllerHost } from "lit";
import { AudioNoteController } from "./audio-note-controller";

interface MockRecorder {
  state: string;
  start: () => void;
  stop: () => void;
  ondataavailable: ((e: { data: Blob }) => void) | null;
  onstop: (() => void) | null;
}

describe("AudioNoteController", () => {
  let mockHost: ReactiveControllerHost;
  let mockTracks: Array<{ stop: ReturnType<typeof vi.fn> }>;
  let recorderInstances: MockRecorder[];

  beforeEach(() => {
    vi.useFakeTimers();
    mockHost = {
      addController: vi.fn(),
      removeController: vi.fn(),
      requestUpdate: vi.fn(),
      updateComplete: Promise.resolve(true),
    };

    mockTracks = [{ stop: vi.fn() }];
    recorderInstances = [];

    const mockStream = {
      getTracks: () => mockTracks,
    };

    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: vi.fn(async () => mockStream),
      },
    });

    const MockMediaRecorder = vi.fn(function () {
      const rec: MockRecorder = {
        state: "inactive",
        start: vi.fn(function (this: MockRecorder) {
          this.state = "recording";
        }),
        stop: vi.fn(function (this: MockRecorder) {
          this.state = "inactive";
          this.onstop?.();
        }),
        ondataavailable: null,
        onstop: null,
      };
      recorderInstances.push(rec);
      return rec;
    }) as unknown as typeof MediaRecorder & { isTypeSupported: (t: string) => boolean };

    MockMediaRecorder.isTypeSupported = vi.fn(() => true);
    vi.stubGlobal("MediaRecorder", MockMediaRecorder);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("registriert sich am ReactiveControllerHost", () => {
    new AudioNoteController(mockHost, vi.fn());
    expect(mockHost.addController).toHaveBeenCalled();
  });

  it("startet und stoppt die Aufnahme per toggle()", async () => {
    const onRecorded = vi.fn();
    const controller = new AudioNoteController(mockHost, onRecorded);

    expect(controller.isRecording).toBe(false);
    await controller.toggle();

    expect(controller.isRecording).toBe(true);
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(recorderInstances[0].start).toHaveBeenCalled();

    await controller.toggle();
    expect(controller.isRecording).toBe(false);
    expect(recorderInstances[0].stop).toHaveBeenCalled();
  });

  it("sammelt Audio-Chunks und übergibt Blob an onRecorded beim Stoppen", async () => {
    const onRecorded = vi.fn();
    const controller = new AudioNoteController(mockHost, onRecorded);

    await controller.toggle();
    const rec = recorderInstances[0];

    // Simuliere Chunk-Empfang
    const chunk = new Blob(["audio-data"], { type: "audio/webm" });
    rec.ondataavailable?.({ data: chunk });

    // Stoppe Aufnahme
    await controller.toggle();

    expect(mockTracks[0].stop).toHaveBeenCalled();
    expect(onRecorded).toHaveBeenCalled();
    const recordedBlob = onRecorded.mock.calls[0][0];
    expect(recordedBlob).toBeInstanceOf(Blob);
  });

  it("beendet Aufnahme automatisch nach 5 Minuten", async () => {
    const controller = new AudioNoteController(mockHost, vi.fn());
    await controller.toggle();
    expect(controller.isRecording).toBe(true);

    vi.advanceTimersByTime(5 * 60 * 1000);
    expect(controller.isRecording).toBe(false);
  });

  it("stoppt Aufnahme bei hostDisconnected()", async () => {
    const controller = new AudioNoteController(mockHost, vi.fn());
    await controller.toggle();
    expect(controller.isRecording).toBe(true);

    controller.hostDisconnected();
    expect(controller.isRecording).toBe(false);
  });

  it("behandelt verweigerte Mikrofonberechtigung sauber", async () => {
    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: vi.fn(async () => {
          throw new Error("Permission denied");
        }),
      },
    });

    const controller = new AudioNoteController(mockHost, vi.fn());
    await controller.toggle();
    expect(controller.isRecording).toBe(false);
  });
});
