/**
 * FAQ Accordion Module — Accessible collapsible panels for Umschulung FAQs.
 */
function initFaqAccordion() {
    const accordionContainer = document.getElementById('faq-accordion-container');
    if (!accordionContainer) return;

    // Inject styles dynamically for self-containment
    const style = document.createElement('style');
    style.textContent = `
        .faq-section {
            margin-top: 2rem;
        }
        .faq-accordion {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-top: 1rem;
        }
        .faq-item {
            border: 1px solid var(--border);
            border-radius: var(--radius-md, 8px);
            background: var(--bg-card);
            overflow: hidden;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        .faq-item:hover {
            border-color: var(--primary);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .faq-trigger {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.25rem;
            background: none;
            border: none;
            text-align: left;
            font-size: 1rem;
            font-weight: 600;
            font-family: var(--font-heading);
            color: var(--text-primary);
            cursor: pointer;
            outline: none;
            transition: color 0.2s;
        }
        .faq-trigger:focus-visible {
            background: rgba(37, 99, 235, 0.05);
        }
        .faq-trigger:hover {
            color: var(--primary);
        }
        .faq-icon {
            font-size: 0.85rem;
            transition: transform 0.3s ease;
            color: var(--text-muted);
        }
        .faq-item.open .faq-icon {
            transform: rotate(180deg);
            color: var(--primary);
        }
        .faq-panel {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .faq-content {
            padding: 0 1.25rem 1.25rem;
            font-size: 0.95rem;
            color: var(--text-secondary);
            line-height: 1.6;
            border-top: 1px solid transparent;
        }
        .faq-item.open .faq-panel {
            /* Handled dynamically in JS */
        }
        .faq-item.open .faq-content {
            border-top-color: var(--border);
        }
    `;
    document.head.appendChild(style);

    const faqItems = accordionContainer.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        const panel = item.querySelector('.faq-panel');

        if (trigger && panel) {
            trigger.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');
                
                // Close other items
                faqItems.forEach(otherItem => {
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
