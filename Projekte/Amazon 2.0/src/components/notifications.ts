// ============================================================
// Amazon 2.0 – Notifications Modal Component
// ============================================================
import type { AppState, Notification, NotificationType } from '../types';
import { formatRelativeTime } from '../utils/formatters';
import { writeStorage, KEYS } from '../utils/persist';

let notificationsModal: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!notificationsModal) {
    notificationsModal = document.createElement('div');
    notificationsModal.id = 'notificationsModal';
    notificationsModal.className = 'modal-overlay';
    notificationsModal.setAttribute('role', 'dialog');
    notificationsModal.setAttribute('aria-modal', 'true');
    notificationsModal.setAttribute('aria-label', 'Benachrichtigungen');
    document.body.appendChild(notificationsModal);
    notificationsModal.addEventListener('click', e => {
      if (e.target === notificationsModal) closeNotificationsModal();
    });
  }
  return notificationsModal;
}

export function getStoredNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(KEYS.notifications);
    if (raw) return JSON.parse(raw) as Notification[];
  } catch { /* ignore */ }
  return [];
}

export function updateNotificationBadge(state: AppState): void {
  const unread = state.notifications.filter(n => !n.read).length;
  const badge = document.getElementById('notifBadge');
  if (badge) {
    badge.textContent = String(unread);
    badge.classList.toggle('hidden', unread === 0);
  }
}

export function openNotificationsModal(state: AppState): void {
  const modal = getModal();

  // Mark all as read
  state.notifications.forEach(n => { n.read = true; });
  writeStorage(KEYS.notifications, state.notifications);
  updateNotificationBadge(state);

  modal.innerHTML = `
    <div class="modal-dialog notifications-dialog">
      <button class="modal-close" id="notifClose" aria-label="Schließen">✕</button>
      <div class="modal-heading-row">
        <h2 class="modal-heading">🔔 Benachrichtigungen</h2>
        ${state.notifications.length > 0 ? `
          <button class="btn-ghost-sm" id="clearNotifsBtn">Alle löschen</button>
        ` : ''}
      </div>
      
      ${state.notifications.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">🔕</div>
          <h3>Keine Benachrichtigungen</h3>
          <p>Du bist auf dem neuesten Stand!</p>
        </div>
      ` : `
        <div class="notifications-list">
          ${state.notifications.map(n => renderNotification(n)).join('')}
        </div>
      `}
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  document.getElementById('notifClose')?.addEventListener('click', closeNotificationsModal);

  document.getElementById('clearNotifsBtn')?.addEventListener('click', () => {
    state.notifications = [];
    writeStorage(KEYS.notifications, []);
    updateNotificationBadge(state);
    openNotificationsModal(state);
  });

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { closeNotificationsModal(); document.removeEventListener('keydown', onKeydown); }
  };
  document.addEventListener('keydown', onKeydown);
}

const TYPE_ICONS: Record<NotificationType, string> = {
  order: '📦',
  deal: '🔥',
  price_alert: '📉',
  system: '🔔',
  return: '↩',
};

function renderNotification(n: Notification): string {
  return `
    <div class="notif-item ${n.read ? '' : 'notif-unread'}">
      <div class="notif-icon">${TYPE_ICONS[n.type] ?? '🔔'}</div>
      <div class="notif-content">
        <p class="notif-title">${n.title}</p>
        <p class="notif-message">${n.message}</p>
        <p class="notif-time">${formatRelativeTime(n.createdAt)}</p>
      </div>
    </div>
  `;
}

function closeNotificationsModal(): void {
  notificationsModal?.classList.remove('open');
  document.body.style.overflow = '';
}

export function addNotification(state: AppState, notification: Omit<Notification, 'id'>): void {
  const newNotif: Notification = {
    ...notification,
    id: `notif-${Date.now()}`,
  };
  state.notifications.unshift(newNotif);
  writeStorage(KEYS.notifications, state.notifications);
  updateNotificationBadge(state);
}
