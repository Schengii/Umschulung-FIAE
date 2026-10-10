import type { PriceAlert, Holding } from '../types';

const STORAGE_KEY = 'finanz_price_alerts';

const memStorage = new Map<string, string>();

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof localStorage !== 'undefined') return localStorage;
  return {
    getItem: (key: string) => memStorage.get(key) || null,
    setItem: (key: string, val: string) => { memStorage.set(key, val); },
    removeItem: (key: string) => { memStorage.delete(key); },
    clear: () => { memStorage.clear(); }
  };
}

/**
 * Loads price alerts from localStorage
 */
export function loadPriceAlerts(): PriceAlert[] {
  try {
    const raw = getStorage().getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Saves price alerts to localStorage
 */
export function savePriceAlerts(alerts: PriceAlert[]): void {
  try {
    getStorage().setItem(STORAGE_KEY, JSON.stringify(alerts));
  } catch (err) {
    console.error('Failed to save price alerts to localStorage:', err);
  }
}

/**
 * Checks price alerts against active holdings and current prices.
 * Returns updated alerts (with triggeredAt if fired) and list of newly triggered alerts.
 */
export function checkPriceAlerts(
  alerts: PriceAlert[],
  holdings: Holding[]
): { updatedAlerts: PriceAlert[]; newlyTriggered: PriceAlert[] } {
  const holdingsMap = new Map<string, Holding>();
  holdings.forEach(h => holdingsMap.set(h.ticker.toUpperCase(), h));

  const newlyTriggered: PriceAlert[] = [];

  const updatedAlerts = alerts.map(alert => {
    if (!alert.isActive) return alert;

    const holding = holdingsMap.get(alert.ticker.toUpperCase());
    if (!holding || !holding.currentPrice) return alert;

    const currentPrice = holding.currentPrice;
    let shouldTrigger = false;

    if (alert.condition === 'ABOVE' && currentPrice >= alert.targetValue) {
      shouldTrigger = true;
    } else if (alert.condition === 'BELOW' && currentPrice <= alert.targetValue) {
      shouldTrigger = true;
    } else if (alert.condition === 'DAILY_DROP_PCT' && holding.totalGainPercent <= -Math.abs(alert.targetValue)) {
      shouldTrigger = true;
    }

    if (shouldTrigger && !alert.triggeredAt) {
      const triggeredAlert: PriceAlert = {
        ...alert,
        currentValue: currentPrice,
        triggeredAt: new Date().toLocaleDateString('de-DE') + ' ' + new Date().toLocaleTimeString('de-DE'),
        isActive: false
      };
      newlyTriggered.push(triggeredAlert);
      return triggeredAlert;
    }

    return {
      ...alert,
      currentValue: currentPrice
    };
  });

  if (newlyTriggered.length > 0) {
    savePriceAlerts(updatedAlerts);
    triggerWebNotification(newlyTriggered);
  }

  return { updatedAlerts, newlyTriggered };
}

/**
 * Dispatches a native browser notification if permissions are granted
 */
export function triggerWebNotification(triggered: PriceAlert[]): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    triggered.forEach(alert => {
      try {
        new Notification(`🔔 Kursalarm ausgelöst: ${alert.name} (${alert.ticker})`, {
          body: `Zielwert: ${alert.targetValue} € erreicht! Aktueller Kurs: ${alert.currentValue?.toFixed(2)} €`,
          icon: '/favicon.ico'
        });
      } catch (e) {
        console.warn('Notification trigger failed:', e);
      }
    });
  }
}

/**
 * Requests browser notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return await Notification.requestPermission();
}
