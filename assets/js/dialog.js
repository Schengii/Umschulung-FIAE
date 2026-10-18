// assets/js/dialog.js – accessible replacements for window.alert / confirm / prompt
//
// Built on the native <dialog> element (showModal): focus is trapped inside, Esc closes it, the
// page behind is inert, and focus returns to the opener. Texts take one string per language, like
// showToast. All three return promises, so callers must await them.

(function () {
    let counter = 0;

    const lang = () => (document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'de');

    /** @param {string | { de: string, en: string }} text */
    function localize(text) {
        if (text === null || typeof text !== 'object') return String(text);
        return text[lang()] ?? text.de ?? '';
    }

    /**
     * @param {'alert' | 'confirm' | 'prompt'} kind
     * @param {string | { de: string, en: string }} message
     * @param {string} [defaultValue] start value of the input field (prompt only)
     * @returns {Promise<any>}
     */
    function openDialog(kind, message, defaultValue = '') {
        return new Promise((resolve) => {
            const previous = /** @type {HTMLElement | null} */ (document.activeElement);
            const id = `app-dialog-${++counter}`;

            const dialog = document.createElement('dialog');
            dialog.className = 'app-dialog';
            dialog.setAttribute('aria-labelledby', id);

            const form = document.createElement('form');
            form.method = 'dialog';

            const text = document.createElement('p');
            text.id = id;
            text.className = 'app-dialog-message';
            text.textContent = localize(message);
            form.appendChild(text);

            /** @type {HTMLInputElement | null} */
            let input = null;
            if (kind === 'prompt') {
                input = document.createElement('input');
                input.type = 'text';
                input.className = 'app-dialog-input';
                input.value = defaultValue;
                input.setAttribute('aria-labelledby', id);
                form.appendChild(input);
            }

            const actions = document.createElement('div');
            actions.className = 'app-dialog-actions';

            if (kind !== 'alert') {
                const cancel = document.createElement('button');
                cancel.type = 'button';
                cancel.className = 'btn-secondary';
                cancel.textContent = localize({ de: 'Abbrechen', en: 'Cancel' });
                cancel.addEventListener('click', () => dialog.close('cancel'));
                actions.appendChild(cancel);
            }

            const ok = document.createElement('button');
            ok.type = 'submit';
            ok.value = 'ok';
            ok.className = 'btn-primary';
            ok.textContent = 'OK';
            actions.appendChild(ok);

            form.appendChild(actions);
            dialog.appendChild(form);
            document.body.appendChild(dialog);

            dialog.addEventListener('close', () => {
                const accepted = dialog.returnValue === 'ok';
                const value = input ? input.value : '';
                dialog.remove();
                if (previous && typeof previous.focus === 'function') previous.focus();
                if (kind === 'confirm') resolve(accepted);
                else if (kind === 'prompt') resolve(accepted ? value : null);
                else resolve(undefined);
            });

            dialog.showModal();
            (input || ok).focus();
        });
    }

    /** @param {string | { de: string, en: string }} message */
    window.showAlert = (message) => /** @type {Promise<void>} */ (openDialog('alert', message));
    /** @param {string | { de: string, en: string }} message */
    window.showConfirm = (message) => /** @type {Promise<boolean>} */ (openDialog('confirm', message));
    /**
     * @param {string | { de: string, en: string }} message
     * @param {string} [defaultValue]
     */
    window.showPrompt = (message, defaultValue) =>
        /** @type {Promise<string | null>} */ (openDialog('prompt', message, defaultValue));
})();
