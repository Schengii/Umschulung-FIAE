// assets/js/toast.js – Simple toast notification system

(function () {
  const containerId = 'toast-container';

  // Show a toast with given message and optional type (info, success, warning, error)
  window.showToast = function (message, type = 'info', duration = 3000) {
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;

    // Append and animate
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    // Auto-remove after duration
    setTimeout(() => {
      toast.classList.remove('show');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, duration);
  };
})();
