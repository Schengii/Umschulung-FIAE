import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchWithTimeout } from "./fetch-timeout";

function hangingFetch(_input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return new Promise((_resolve, reject) => {
    if (init?.signal?.aborted) reject(new DOMException("aborted", "AbortError"));
    init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
  });
}

describe("fetchWithTimeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("liefert die Antwort bei Erfolg", async () => {
    const response = new Response("ok");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
    await expect(fetchWithTimeout("/x")).resolves.toBe(response);
  });

  it("wirft TimeoutError nach Ablauf", async () => {
    vi.stubGlobal("fetch", vi.fn(hangingFetch));
    const promise = fetchWithTimeout("/x", {}, 1000);
    const assertion = expect(promise).rejects.toMatchObject({ name: "TimeoutError" });
    await vi.advanceTimersByTimeAsync(1000);
    await assertion;
  });

  it("reicht Abbruch des Aufrufers durch (kein TimeoutError)", async () => {
    vi.stubGlobal("fetch", vi.fn(hangingFetch));
    const outer = new AbortController();
    const promise = fetchWithTimeout("/x", { signal: outer.signal }, 1000);
    const assertion = expect(promise).rejects.toMatchObject({ name: "AbortError" });
    outer.abort();
    await assertion;
  });

  it("bricht sofort ab, wenn das Signal schon abgebrochen ist", async () => {
    vi.stubGlobal("fetch", vi.fn(hangingFetch));
    const outer = new AbortController();
    outer.abort();
    await expect(fetchWithTimeout("/x", { signal: outer.signal })).rejects.toMatchObject({ name: "AbortError" });
  });
});
