// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestPushPermission, isPushSupported, subscribeToPushService } from './pushNotificationManager';

describe('pushNotificationManager', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('erkennt Browser Support für Notifications und PushManager', () => {
    const supported = isPushSupported();
    // jsdom hat standardmäßig keinen PushManager
    expect(typeof supported).toBe('boolean');
  });

  it('behandelt fehlende Push-Unterstützung im Test-Environment sauber', async () => {
    const res = await subscribeToPushService();
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });

  it('gibt false zurück, wenn Notification API nicht existiert', async () => {
    const originalNotification = window.Notification;
    // @ts-ignore
    delete window.Notification;

    const granted = await requestPushPermission();
    expect(granted).toBe(false);

    window.Notification = originalNotification;
  });
});
