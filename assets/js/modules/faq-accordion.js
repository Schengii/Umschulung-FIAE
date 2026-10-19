/**
 * FAQ Accordion Module — Accessible collapsible panels for Umschulung FAQs.
 */
export function initFaqAccordion() {
    const accordionContainer = document.getElementById('faq-accordion-container');
    if (!accordionContainer) return;

    const faqItems = accordionContainer.querySelectorAll('.faq-item');
    faqItems.forEach((item) => {
        const trigger = item.querySelector('.faq-trigger');
        const panel = item.querySelector('.faq-panel');

        if (trigger && panel) {
            trigger.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');

                // Close other items
                faqItems.forEach((otherItem) => {
                    if (otherItem !== item && otherItem.classList.contains('open')) {
                        otherItem.classList.remove('open');
                        const otherTrigger = otherItem.querySelector('.faq-trigger');
                        const otherPanel = otherItem.querySelector('.faq-panel');
                        if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
                        if (otherPanel) otherPanel.style.maxHeight = '0px';
                    }
                });

                // Toggle this item
                if (isOpen) {
                    item.classList.remove('open');
                    trigger.setAttribute('aria-expanded', 'false');
                    panel.style.maxHeight = '0px';
                } else {
                    item.classList.add('open');
                    trigger.setAttribute('aria-expanded', 'true');
                    panel.style.maxHeight = panel.scrollHeight + 'px';
                }

                // Log dynamic commit tick (Punkte sammeln!)
                if (typeof window.addLiveCommit === 'function') {
                    window.addLiveCommit();
                }
            });
        }
    });
}
