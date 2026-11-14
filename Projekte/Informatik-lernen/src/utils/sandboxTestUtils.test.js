import { describe, it, expect, vi } from 'vitest';
import { createInlineSandboxWorker } from './sandboxTestUtils';

describe('sandboxTestUtils', () => {
  it('emits ready message on initialization via microtask', async () => {
    const worker = createInlineSandboxWorker();
    const messages = [];
    worker.onmessage = (e) => messages.push(e.data);

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(messages).toEqual([{ type: 'ready' }]);
  });

  it('evaluates payload and posts result message', async () => {
    const worker = createInlineSandboxWorker();
    const messages = [];
    worker.onmessage = (e) => messages.push(e.data);

    worker.postMessage({ code: 'console.log("hello");' });

    await new Promise((resolve) => setTimeout(resolve, 20));
    const resultMsg = messages.find((m) => m.type === 'result');
    expect(resultMsg).toBeDefined();
    expect(resultMsg.result.ok).toBe(true);
    expect(resultMsg.result.logs).toContain('hello');
  });

  it('stops processing messages after terminate()', async () => {
    const worker = createInlineSandboxWorker();
    const messageHandler = vi.fn();
    worker.onmessage = messageHandler;

    worker.terminate();
    expect(worker.terminated).toBe(true);

    worker.postMessage({ code: 'console.log("after terminate");' });
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(messageHandler).not.toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: 'result' }) })
    );
  });
});
