type ToastType = 'success' | 'error' | 'info' | 'warning';

const MAX_TOASTS = 5;

function getContainer(): HTMLElement {
  const existing = document.getElementById('ec-toast-container');
  if (existing) return existing;
  const el = document.createElement('div');
  el.id = 'ec-toast-container';
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-atomic', 'false');
  el.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    z-index: 99999; pointer-events: none; width: max-content; max-width: 90vw;
  `;
  document.body.appendChild(el);
  return el;
}

const colors: Record<ToastType, { light: string; dark: string; border: string; icon: string; ariaRole: string }> = {
  success: { light: '#f0fdf4', dark: '#052e16', border: '#16a34a', icon: '✅', ariaRole: 'status' },
  error:   { light: '#fef2f2', dark: '#450a0a', border: '#dc2626', icon: '❌', ariaRole: 'alert' },
  warning: { light: '#fffbeb', dark: '#422006', border: '#d97706', icon: '⚠️', ariaRole: 'alert' },
  info:    { light: '#eff6ff', dark: '#0c1a2e', border: '#2563eb', icon: 'ℹ️', ariaRole: 'status' },
};

export function showToast(message: string, type: ToastType = 'info', duration = 3500) {
  if (typeof document === 'undefined') return;
  const container = getContainer();

  // Älteste entfernen wenn Limit erreicht
  while (container.children.length >= MAX_TOASTS) {
    container.firstElementChild?.remove();
  }

  const isDark = document.documentElement.getAttribute('theme') === 'dark'
    || (!document.documentElement.getAttribute('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const { light, dark, border, icon, ariaRole } = colors[type];
  const bg = isDark ? dark : light;
  const textColor = isDark ? '#f8fafc' : '#0f172a';

  const toast = document.createElement('div');
  toast.setAttribute('role', ariaRole);
  toast.style.cssText = `
    background: ${bg}; border: 1px solid ${border}; color: ${textColor};
    padding: 12px 18px; border-radius: 10px; font-size: 0.9rem; font-weight: 500;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2); pointer-events: auto;
    opacity: 0; transition: opacity 0.25s ease, transform 0.25s ease;
    transform: translateY(8px); max-width: 90vw; line-height: 1.4;
    font-family: system-ui, sans-serif;
  `;
  toast.textContent = `${icon} ${message}`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 280);
  }, duration);
}

export async function showConfirm(message: string): Promise<boolean> {
  return new Promise(resolve => {
    const isDark = document.documentElement.getAttribute('theme') === 'dark'
      || (!document.documentElement.getAttribute('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Bestätigung erforderlich');
    overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
      z-index: 99998; display: flex; align-items: center; justify-content: center; padding: 16px;
    `;

    const bg = isDark ? '#0f172a' : '#ffffff';
    const borderColor = isDark ? '#334155' : '#e2e8f0';
    const textColor = isDark ? '#f8fafc' : '#0f172a';

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: ${bg}; border: 1px solid ${borderColor}; border-radius: 14px;
      padding: 24px; max-width: 380px; width: 100%; color: ${textColor};
      font-family: system-ui, sans-serif; box-shadow: 0 24px 48px rgba(0,0,0,0.3);
    `;

    const msg = document.createElement('p');
    msg.style.cssText = 'margin: 0 0 20px 0; font-size: 0.95rem; line-height: 1.5;';
    msg.textContent = message;

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display: flex; gap: 10px; justify-content: flex-end;';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Abbrechen';
    cancelBtn.style.cssText = `
      padding: 9px 18px; border-radius: 8px; border: 1px solid ${borderColor};
      background: transparent; color: ${isDark ? '#94a3b8' : '#64748b'}; cursor: pointer; font-size: 0.9rem;
    `;

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Bestätigen';
    confirmBtn.style.cssText = `
      padding: 9px 18px; border-radius: 8px; border: none;
      background: #dc2626; color: white; cursor: pointer; font-size: 0.9rem; font-weight: 600;
    `;

    const close = (result: boolean) => { overlay.remove(); resolve(result); };
    cancelBtn.onclick = () => close(false);
    confirmBtn.onclick = () => close(true);

    // Escape schließt den Dialog
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(false); document.removeEventListener('keydown', onKey); }
    };
    document.addEventListener('keydown', onKey);

    btnRow.append(cancelBtn, confirmBtn);
    dialog.append(msg, btnRow);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    confirmBtn.focus();
  });
}
