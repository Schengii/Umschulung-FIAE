import type { Holding, DepositLadderItem } from '../types';

export interface BackgroundNotificationItem {
  id: string;
  type: 'EX_DIVIDEND' | 'DEPOSIT_MATURITY' | 'PRICE_ALERT';
  title: string;
  body: string;
  targetDate: string; // YYYY-MM-DD
  ticker?: string;
  isUrgent: boolean;
}

/**
 * Checks upcoming Ex-Dividend dates within next N days.
 */
export function checkUpcomingExDividends(
  holdings: Holding[],
  daysAhead: number = 7
): BackgroundNotificationItem[] {
  const notifications: BackgroundNotificationItem[] = [];
  const now = new Date();
  const thresholdMs = daysAhead * 24 * 60 * 60 * 1000;

  holdings.forEach(h => {
    // Only equity/etf with dividend yields
    if ((h.category === 'Stock' || h.category === 'ETF') && (h.yieldOnCost > 0 || h.currentValue > 0)) {
      // Heuristic: If holding pays dividends, simulate quarterly cycle check or check notes
      const lowerNotes = (h.notes || '').toLowerCase();
      let exDateMatch = lowerNotes.match(/ex:?\s*(\d{2}\.\d{2}\.\d{4})/);
      
      if (exDateMatch) {
        const parts = exDateMatch[1].split('.');
        const exDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        const diffMs = exDate.getTime() - now.getTime();
        
        if (diffMs >= 0 && diffMs <= thresholdMs) {
          notifications.push({
            id: `ex-div-${h.ticker}-${exDateMatch[1]}`,
            type: 'EX_DIVIDEND',
            title: `📅 Ex-Dividenden-Tag: ${h.name} (${h.ticker})`,
            body: `Am ${exDateMatch[1]} ist Ex-Tag. Halte die Aktien im Depot, um anspruchsberechtigt zu sein.`,
            targetDate: exDate.toISOString().slice(0, 10),
            ticker: h.ticker,
            isUrgent: diffMs <= 2 * 24 * 60 * 60 * 1000
          });
        }
      }
    }
  });

  return notifications;
}

/**
 * Checks deposit ladder maturities within next N days.
 */
export function checkUpcomingDepositMaturities(
  deposits: DepositLadderItem[],
  daysAhead: number = 14
): BackgroundNotificationItem[] {
  const notifications: BackgroundNotificationItem[] = [];
  const now = new Date();
  const thresholdMs = daysAhead * 24 * 60 * 60 * 1000;

  deposits.forEach(dep => {
    if (!dep.maturityDate) return;

    let matDate: Date;
    if (dep.maturityDate.includes('.')) {
      const parts = dep.maturityDate.split('.');
      matDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } else {
      matDate = new Date(dep.maturityDate);
    }

    const diffMs = matDate.getTime() - now.getTime();
    if (diffMs >= 0 && diffMs <= thresholdMs) {
      notifications.push({
        id: `mat-${dep.id}`,
        type: 'DEPOSIT_MATURITY',
        title: `💰 Fälligkeit Festgeld: ${dep.bankName}`,
        body: `Festgeld über ${dep.principalEur.toLocaleString('de-DE')} € wird am ${dep.maturityDate} fällig (${dep.interestRatePercent}% Zinsen). Reinvestieren oder Zinstreppe anpassen.`,
        targetDate: matDate.toISOString().slice(0, 10),
        isUrgent: diffMs <= 3 * 24 * 60 * 60 * 1000
      });
    }
  });

  return notifications;
}

/**
 * Dispatches HTML5 / ServiceWorker push notification to the user if permission is granted.
 */
export async function sendDesktopPushNotification(
  item: BackgroundNotificationItem
): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(item.title, {
        body: item.body,
        icon: `${import.meta.env.BASE_URL}pwa-192x192.png`,
        badge: `${import.meta.env.BASE_URL}pwa-192x192.png`,
        tag: item.id
      });
      return true;
    } else {
      new Notification(item.title, {
        body: item.body,
        icon: `${import.meta.env.BASE_URL}pwa-192x192.png`,
        tag: item.id
      });
      return true;
    }
  } catch (err) {
    console.error('Push notification dispatch error:', err);
    return false;
  }
}
