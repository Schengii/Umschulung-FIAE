// ============================================================
// Amazon 2.0 – Toast Notification Component
// ============================================================

export type ToastType = 'success' | 'error' | 'info' | 'cart' | 'wishlist' | 'warning';

interface ToastOptions {
  duration?: number;
  icon?: string;
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
  const container = getContainer();
  const { duration = 3500, icon } = opts;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span class="toast-icon">${icon ?? ICONS[type]}</span>
    <span class="toast-msg">${message}</span>
    <button class="toast-close" aria-label="Schließen">✕</button>
  `;

  const close = () => {
    toast.classList.add('toast-exit');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };

  toast.querySelector('.toast-close')!.addEventListener('click', close);
  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => toast.classList.add('toast-enter'));

  // Auto-dismiss
  setTimeout(close, duration);
}
