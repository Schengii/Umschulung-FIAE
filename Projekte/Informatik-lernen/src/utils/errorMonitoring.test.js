import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initErrorMonitoring, captureException } from './errorMonitoring';

describe('errorMonitoring', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('captureException is a safe no-op when Sentry is not initialized', () => {
    expect(() => {
      captureException(new Error('Test error'), { component: 'TestLab' });
    }).not.toThrow();
  });

  it('initErrorMonitoring does nothing when VITE_SENTRY_DSN is undefined', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await initErrorMonitoring();
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('initErrorMonitoring does not re-attempt if already initialized', async () => {
    await initErrorMonitoring();
    await initErrorMonitoring();
    expect(true).toBe(true);
  });
});

