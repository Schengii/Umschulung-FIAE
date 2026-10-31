// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  requestPushPermission, 
  isPushSupported, 
  subscribeToPushService,
  scheduleDailyReminder 
} from './pushNotificationManager';

describe('pushNotificationManager', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('erkennt Browser Support für Notifications und PushManager', () => {
    const supported = isPushSupported();
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

  it('gibt true zurück, wenn Notification.permission bereits granted ist', async () => {
    const originalNotification = window.Notification;
    // @ts-ignore
    window.Notification = {
      permission: 'granted',
      requestPermission: vi.fn()
    };

    const granted = await requestPushPermission();
    expect(granted).toBe(true);

    window.Notification = originalNotification;
  });

  it('fragt Permission an, wenn permission default ist', async () => {
    const originalNotification = window.Notification;
    const requestMock = vi.fn().mockResolvedValue('granted');
    // @ts-ignore
    window.Notification = {
      permission: 'default',
      requestPermission: requestMock
    };

    const granted = await requestPushPermission();
    expect(requestMock).toHaveBeenCalled();
    expect(granted).toBe(true);

    window.Notification = originalNotification;
  });

  it('scheduleDailyReminder bricht ab, wenn Permission abgelehnt wurde', async () => {
    const originalNotification = window.Notification;
    // @ts-ignore
    window.Notification = {
      permission: 'denied',
      requestPermission: vi.fn().mockResolvedValue('denied')
    };

    const scheduled = await scheduleDailyReminder('Prüfungsvorbereitung');
    expect(scheduled).toBe(false);

    window.Notification = originalNotification;
  });

  it('scheduleDailyReminder nutzt ServiceWorker.showNotification bei verfügbarem SW', async () => {
    const originalNotification = window.Notification;
    const showNotificationMock = vi.fn();
    // @ts-ignore
    window.Notification = {
      permission: 'granted'
    };

    const originalNavigator = globalThis.navigator;
    const mockReady = Promise.resolve({
      showNotification: showNotificationMock
    });

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        serviceWorker: {
          ready: mockReady
        }
      },
      configurable: true
    });

    const scheduled = await scheduleDailyReminder('Lern-Erinnerung', { body: 'Wiederhole SRS' });
    expect(scheduled).toBe(true);

    await mockReady;
    vi.advanceTimersByTime(5000);

    expect(showNotificationMock).toHaveBeenCalledWith('Lern-Erinnerung', expect.objectContaining({
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      body: 'Wiederhole SRS'
    }));

    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true
    });
    window.Notification = originalNotification;
  });

  it('scheduleDailyReminder greift auf Fallback-Notification zurück, wenn kein SW vorhanden ist', async () => {
    const notificationConstructorMock = vi.fn();
    // @ts-ignore
    function MockNotification(title, opts) {
      notificationConstructorMock(title, opts);
    }
    MockNotification.permission = 'granted';

    const originalNotification = window.Notification;
    // @ts-ignore
    window.Notification = MockNotification;

    const originalNavigator = globalThis.navigator;
    Object.defineProperty(globalThis, 'navigator', {
      value: {},
      configurable: true
    });

    const scheduled = await scheduleDailyReminder('Fallback Reminder', { body: 'Ohne SW' });
    expect(scheduled).toBe(true);

    vi.advanceTimersByTime(5000);
    expect(notificationConstructorMock).toHaveBeenCalledWith('Fallback Reminder', expect.objectContaining({
      icon: '/pwa-192x192.png',
      body: 'Ohne SW'
    }));

    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true
    });
    window.Notification = originalNotification;
  });
});
