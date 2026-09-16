/**
 * Push Notification Manager
 * Handles local Web Notifications API for Daily Reminders (e.g., Spaced Repetition)
 */

export const requestPushPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications.');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

export const scheduleDailyReminder = async (title, options = {}) => {
  const granted = await requestPushPermission();
  if (!granted) return false;
  
  // Im Browser gibt es keine einfache "echte" Background-Scheduling API 
  // (außer ServiceWorker + Push API mit Backend). 
  // Als Simulator zeigen wir die Notification nach 5 Sekunden, wenn der Tab aktiv ist.
  // In einer echten PWA würde man navigator.serviceWorker.ready.then(reg => reg.showNotification(...)) nutzen.
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      // Wir simulieren einen Push nach 5 Sekunden für den Showcase
      setTimeout(() => {
        registration.showNotification(title, {
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          vibrate: [200, 100, 200],
          ...options
        });
      }, 5000);
    }).catch(err => {
      console.warn('Service Worker not ready for notifications', err);
      fallbackNotification(title, options);
    });
  } else {
    fallbackNotification(title, options);
  }
  return true;
};

function fallbackNotification(title, options) {
  setTimeout(() => {
    new Notification(title, {
      icon: '/pwa-192x192.png',
      ...options
    });
  }, 5000);
}
