// assets/js/toast.js – Simple toast notification system

(function () {
    const containerId = 'toast-container';

    /**
     * Resolves a toast text for the active UI language.
     * @param {string | { de: string, en: string }} text plain string, or one text per language
     */
    function localize(text) {
        if (text === null || typeof text !== 'object') return String(text);
        const lang = document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'de';
        return text[lang] ?? text.de ?? '';
    }

    /**
     * Show a toast with the given message and optional type (info, success, warning, error).
     * @param {string | { de: string, en: string }} message
     * @param {string} [type]
     * @param {number} [duration] in ms; 0 keeps the toast until its action is used
     * @param {{ label: string | { de: string, en: string }, onClick: () => void }} [action]
     *        optional button rendered inside the toast
     */
    window.showToast = function (message, type = 'info', duration = 3000, action) {
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            document.body.appendChild(container);
        }
        // The positioning lives on the class; without it toasts land in the normal page
        // flow at the very end of <body>, i.e. off-screen on every longer page.
        container.classList.add('toast-container');

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.textContent = localize(message);

        const dismiss = () => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
            // transitionend never fires when transitions are disabled (reduced motion).
            setTimeout(() => toast.remove(), 500);
        };

        if (action && typeof action.onClick === 'function') {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'toast-action';
            button.textContent = localize(action.label);
            button.addEventListener('click', () => {
                dismiss();
                action.onClick();
            });
            toast.appendChild(button);
        }

        // Append and animate
        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));

        // Auto-remove after duration
        if (duration > 0) setTimeout(dismiss, duration);
        return toast;
    };
})();
