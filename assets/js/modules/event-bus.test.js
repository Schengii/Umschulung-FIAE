import { describe, it, expect, beforeEach, vi } from 'vitest';

// event-bus.js talks to `window`; in the Node test environment a plain
// EventTarget is enough (CustomEvent is built into Node).
beforeEach(() => {
    globalThis.window = new EventTarget();
});

const load = () => import('./event-bus.js');

describe('event-bus', () => {
    it('delivers the detail payload to subscribers', async () => {
        const { emitEvent, onEvent, FIAE_EVENTS } = await load();
        const cb = vi.fn();
        onEvent(FIAE_EVENTS.THEME_CHANGE, cb);

        emitEvent(FIAE_EVENTS.THEME_CHANGE, { theme: 'dark' });

        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb.mock.calls[0][0].detail).toEqual({ theme: 'dark' });
    });

    it('defaults detail to an empty object', async () => {
        const { emitEvent, onEvent, FIAE_EVENTS } = await load();
        const cb = vi.fn();
        onEvent(FIAE_EVENTS.LANG_CHANGE, cb);

        emitEvent(FIAE_EVENTS.LANG_CHANGE);

        expect(cb.mock.calls[0][0].detail).toEqual({});
    });

    it('stops delivering after the returned unsubscribe function is called', async () => {
        const { emitEvent, onEvent, FIAE_EVENTS } = await load();
        const cb = vi.fn();
        const unsubscribe = onEvent(FIAE_EVENTS.ACCENT_CHANGE, cb);

        emitEvent(FIAE_EVENTS.ACCENT_CHANGE);
        unsubscribe();
        emitEvent(FIAE_EVENTS.ACCENT_CHANGE);

        expect(cb).toHaveBeenCalledTimes(1);
    });

    it('onceEvent fires only for the first emit', async () => {
        const { emitEvent, onceEvent, FIAE_EVENTS } = await load();
        const cb = vi.fn();
        onceEvent(FIAE_EVENTS.PROJECT_SELECT, cb);

        emitEvent(FIAE_EVENTS.PROJECT_SELECT, { id: 1 });
        emitEvent(FIAE_EVENTS.PROJECT_SELECT, { id: 2 });

        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb.mock.calls[0][0].detail).toEqual({ id: 1 });
    });

    it('does not mix up different event names', async () => {
        const { emitEvent, onEvent, FIAE_EVENTS } = await load();
        const cb = vi.fn();
        onEvent(FIAE_EVENTS.A11Y_CHANGE, cb);

        emitEvent(FIAE_EVENTS.ACHIEVEMENT_UNLOCKED);

        expect(cb).not.toHaveBeenCalled();
    });
});
