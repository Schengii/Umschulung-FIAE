// ============================================================
// Amazon 2.0 – Toast Notification Component
// ============================================================

export type ToastType = 'success' | 'error' | 'info' | 'cart' | 'wishlist' | 'warning';

export interface ToastAction {
  text: string;
  onClick: () => void;
}

export interface ToastOptions {
  duration?: number;
  icon?: string;
  action?: ToastAction;
}

let toastContainer: HTMLElement | null = null;

function getContainer(): HTMLElement {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.setAttribute('aria-live', 'polite');
    toastContainer.setAttribute('aria-atomic', 'false');
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  cart: '🛒',
  wishlist: '♥',
  warning: '⚠',
};

export function showToast(
  message: string,
  type: ToastType = 'info',
  opts: ToastOptions = {}
): void {
  if (typeof document === 'undefined') return;
  const container = getContainer();
  const { duration = 4000, icon, action } = opts;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span class="toast-icon">${icon ?? ICONS[type]}</span>
    <span class="toast-msg">${message}</span>
    ${action ? `<button class="toast-action-btn" id="toastActionBtn">${action.text}</button>` : ''}
    <button class="toast-close" aria-label="Schließen">✕</button>
  `;

  const close = () => {
    toast.classList.add('toast-exit');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };

  if (action) {
    const actionBtn = toast.querySelector('.toast-action-btn');
    if (actionBtn) {
      actionBtn.addEventListener('click', () => {
        try {
          action.onClick();
        } finally {
          close();
        }
      });
    }
  }

  toast.querySelector('.toast-close')!.addEventListener('click', close);
  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => toast.classList.add('toast-enter'));

  // Auto-dismiss
  setTimeout(close, duration);
}
