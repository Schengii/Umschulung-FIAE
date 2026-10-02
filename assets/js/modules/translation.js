/**
 * Translation Module — DE/EN Language Switcher
 *
 * Visible text is bilingual through <span lang="de">/<span lang="en"> pairs, which CSS shows
 * or hides by the <html lang> attribute. Attributes cannot hold such pairs, so markup keeps
 * the German value in the attribute itself and the English one next to it:
 *
 *     <button aria-label="Schließen" data-en-aria-label="Close">
 *
 * translateAttributes() swaps them with the page language, also for markup that modules
 * insert later (modals, chat widget, command palette).
 */

const TRANSLATABLE_ATTRIBUTES = ['aria-label', 'title', 'placeholder'];
const TRANSLATABLE_SELECTOR = TRANSLATABLE_ATTRIBUTES.map((name) => `[data-en-${name}]`).join(',');

/**
 * @param {Document | Element} root element (or document) whose subtree is translated
 * @param {string} lang 'de' or 'en'
 */
export function translateAttributes(root, lang) {
    /** @type {Element[]} */
    const elements = Array.from(root.querySelectorAll(TRANSLATABLE_SELECTOR));
    if ('matches' in root && root.matches(TRANSLATABLE_SELECTOR)) elements.push(root);

    for (const element of elements) {
        for (const name of TRANSLATABLE_ATTRIBUTES) {
            const english = element.getAttribute(`data-en-${name}`);
            if (english === null) continue;
            // The first visit to an element remembers its German original.
            if (!element.hasAttribute(`data-de-${name}`)) {
                element.setAttribute(`data-de-${name}`, element.getAttribute(name) || '');
            }
            element.setAttribute(name, lang === 'en' ? english : element.getAttribute(`data-de-${name}`));
        }
    }
}

const currentLang = () => document.documentElement.getAttribute('lang') || APP.DEFAULT_LANG;

export function initTranslation() {
    const langToggle = document.getElementById('lang-toggle');
    if (!langToggle) return;

    const storedLang = AppStorage.getItem(STORAGE_KEYS.LANG, APP.DEFAULT_LANG);
    document.documentElement.setAttribute('lang', storedLang);
    updateLangToggleButton(storedLang);
    translateAttributes(document, storedLang);

    // Markup added after this point is translated as it arrives.
    new MutationObserver((mutations) => {
        const lang = currentLang();
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) translateAttributes(/** @type {Element} */ (node), lang);
            }
        }
    }).observe(document.body, { childList: true, subtree: true });

    langToggle.addEventListener('click', () => {
        const newLang = currentLang() === 'de' ? 'en' : 'de';

        document.documentElement.setAttribute('lang', newLang);
        AppStorage.setItem(STORAGE_KEYS.LANG, newLang);
        updateLangToggleButton(newLang);
        translateAttributes(document, newLang);

        document.dispatchEvent(new CustomEvent('langchange', { detail: newLang }));
        window.dispatchEvent(new CustomEvent('fiae:lang-change', { detail: { lang: newLang } }));
    });
}

function updateLangToggleButton(lang) {
    const langToggle = document.getElementById('lang-toggle');
    if (!langToggle) return;

    if (lang === 'de') {
        langToggle.innerHTML = '<i class="fa fa-globe" aria-hidden="true"></i> DE | <strong>EN</strong>';
        langToggle.setAttribute('aria-label', 'Switch to English');
    } else {
        langToggle.innerHTML = '<i class="fa fa-globe" aria-hidden="true"></i> <strong>DE</strong> | EN';
        langToggle.setAttribute('aria-label', 'Auf Deutsch umstellen');
    }
}
