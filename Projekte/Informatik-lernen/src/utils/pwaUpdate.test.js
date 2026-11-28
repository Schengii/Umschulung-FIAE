import { describe, it, expect, vi } from 'vitest';
import { applyPwaUpdate, SKIP_WAITING_MESSAGE, UPDATE_FALLBACK_MS } from './pwaUpdate';

const make = (registration) => {
  const listeners = {};
  const sw = {
    getRegistration: async () => registration,
    addEventListener: vi.fn((type, fn) => { listeners[type] = fn; })
  };
  return { sw, listeners, reload: vi.fn(), setTimer: vi.fn() };
};

describe('applyPwaUpdate', () => {
  it('schickt SKIP_WAITING und lädt erst nach dem Übernehmen neu', async () => {
    const waiting = { postMessage: vi.fn() };
    const t = make({ waiting });
    expect(await applyPwaUpdate({ serviceWorker: t.sw, reload: t.reload, setTimer: t.setTimer })).toBe('activating');
    expect(waiting.postMessage).toHaveBeenCalledWith(SKIP_WAITING_MESSAGE);
    expect(t.reload).not.toHaveBeenCalled();
    t.listeners.controllerchange();
    expect(t.reload).toHaveBeenCalledTimes(1);
  });

  it('lädt über den Zeitgeber neu, falls controllerchange ausbleibt', async () => {
    const t = make({ waiting: { postMessage: vi.fn() } });
    await applyPwaUpdate({ serviceWorker: t.sw, reload: t.reload, setTimer: t.setTimer });
    expect(t.setTimer).toHaveBeenCalledWith(t.reload, UPDATE_FALLBACK_MS);
  });

  it('lädt ohne wartenden Worker sofort neu', async () => {
    const t = make({ waiting: null });
    expect(await applyPwaUpdate({ serviceWorker: t.sw, reload: t.reload, setTimer: t.setTimer })).toBe('reloaded');
    expect(t.reload).toHaveBeenCalledTimes(1);
  });

  it('lädt ohne Service-Worker-Unterstützung neu', async () => {
    const reload = vi.fn();
    await applyPwaUpdate({ serviceWorker: undefined, reload });
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
