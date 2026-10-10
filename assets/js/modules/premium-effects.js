/**
 * Premium Effects Module — Adds glassmorphism, 3D card tilt, mouse cursor glow spotlight,
 * and staggered load animations across the entire application.
 */

// Pointer-driven decoration is pointless on touch screens and unwanted with reduced motion.
const hasFinePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initPremiumEffects() {
    const pointerEffects = hasFinePointer() && !prefersReducedMotion();

    // 1. Initialize custom cursor spotlight follower
    if (pointerEffects) initMouseSpotlight();

    // 2. Enhance all card elements with glassmorphism, border glows, and 3D tilt
    enhanceCards(pointerEffects);

    // 3. Trigger staggered entrance animations for the cards visible on load
    if (!prefersReducedMotion()) initStaggeredEntrances();

    // 4. Initialize Button Ripple Interactions
    initButtonRipples();
}

/**
 * Creates a material-like tactile ripple animation on button clicks
 */
function initButtonRipples() {
    document.addEventListener('click', (e) => {
        const btn = /** @type {HTMLElement} */ (e.target).closest(
            '.btn-primary, .hero-btn, .btn-secondary, .btn-filter, button'
        );
        if (!btn || btn.classList.contains('no-ripple')) return;

        const rect = btn.getBoundingClientRect();
        const circle = document.createElement('span');
        const diameter = Math.max(rect.width, rect.height);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - rect.left - radius}px`;
        circle.style.top = `${e.clientY - rect.top - radius}px`;
        circle.classList.add('ripple-circle');

        const existingRipple = btn.querySelector('.ripple-circle');
        if (existingRipple) {
            existingRipple.remove();
        }

        btn.appendChild(circle);

        setTimeout(() => {
            circle.remove();
        }, 600);
    });
}

/**
 * Creates and moves a smooth cursor-following glow element
 */
function initMouseSpotlight() {
    // Prevent multiple cursors if initialized twice
    if (document.querySelector('.cursor-glow')) return;

    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let hasMoved = false;
    let frameId = 0;

    // Interpolation (lerp) for butter-smooth movement. The loop only runs while the glow is
    // still catching up with the pointer; it used to run for the whole page lifetime, which
    // kept the main thread busy 60 times a second on an idle page.
    function updateGlowPosition() {
        const ease = 0.08; // Lower is smoother/slower
        currentX += (targetX - currentX) * ease;
        currentY += (targetY - currentY) * ease;

        // Apply hardware-accelerated 3D translation
        glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

        const settled = Math.abs(targetX - currentX) < 0.5 && Math.abs(targetY - currentY) < 0.5;
        frameId = settled ? 0 : requestAnimationFrame(updateGlowPosition);
    }

    document.addEventListener(
        'mousemove',
        (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            if (!hasMoved) {
                hasMoved = true;
                document.body.classList.add('cursor-active');
            }
            if (!frameId) frameId = requestAnimationFrame(updateGlowPosition);
        },
        { passive: true }
    );

    document.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-active');
        hasMoved = false;
    });
}

/**
 * Applies Glassmorphism styles and 3D Tilt interactivity to card elements
 * @param {boolean} pointerEffects whether hover-driven effects (glow, tilt) make sense here
 */
function enhanceCards(pointerEffects) {
    const enhance = (card) => {
        // Prevent double enhancement
        if (card.dataset.premiumEnhanced === 'true') return;
        card.dataset.premiumEnhanced = 'true';

        // Apply glass styling classes
        card.classList.add('card-glass', 'card-glow-border');

        // Setup 3D tilt listener
        if (pointerEffects) apply3DTilt(card);
    };

    document.querySelectorAll('.card').forEach(enhance);

    // Listen for dynamically added cards in the document
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const cardsInNode = /** @type {Element} */ (node).classList?.contains('card')
                        ? [node]
                        : /** @type {Element} */ (node).querySelectorAll?.('.card') || [];
                    cardsInNode.forEach(enhance);
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    if (pointerEffects) initCardGlowTracking();
}

/**
 * Feeds the pointer position to the hovered card (--mouse-x/--mouse-y drive the border
 * glow in CSS). One delegated listener, at most one style write per frame.
 */
function initCardGlowTracking() {
    let pending = null;
    let frameId = 0;

    document.addEventListener(
        'mousemove',
        (e) => {
            const card = /** @type {HTMLElement} */ (e.target).closest?.('.card');
            if (!card) return;
            pending = { card, x: e.clientX, y: e.clientY };
            if (frameId) return;
            frameId = requestAnimationFrame(() => {
                frameId = 0;
                const rect = pending.card.getBoundingClientRect();
                pending.card.style.setProperty('--mouse-x', `${pending.x - rect.left}px`);
                pending.card.style.setProperty('--mouse-y', `${pending.y - rect.top}px`);
            });
        },
        { passive: true }
    );
}

/**
 * Adds dynamic rotation on mouseMove to simulate 3D depth
 */
function apply3DTilt(element) {
    // Exclude tilt on small screens to prevent layout shifting issues
    if (window.matchMedia('(max-width: 768px)').matches) return;

    element.classList.add('card-tilt-3d');

    element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();

        // Calculate normalized coordinate (-0.5 to 0.5)
        const xNorm = (e.clientX - rect.left) / rect.width - 0.5;
        const yNorm = (e.clientY - rect.top) / rect.height - 0.5;

        // Set maximum tilt angles in degrees
        const maxTilt = 6;
        const rotateX = -yNorm * maxTilt;
        const rotateY = xNorm * maxTilt;

        element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
    });

    element.addEventListener('mouseleave', () => {
        element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        element.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    });

    element.addEventListener('mouseenter', () => {
        // Reset transition during active tracking to avoid lag
        element.style.transition = 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)';
    });
}

/**
 * Sets up staggered entrance animations for the cards that are on screen at load.
 *
 * Only those: the class starts an element at opacity 0, and the delay used to grow with the
 * element's index on the whole page, so on a page with 60 cards the last ones stayed
 * invisible for almost three seconds, long after the visitor had scrolled to them.
 */
function initStaggeredEntrances() {
    const selector = '.card, .welcome-container, .dashboard-card, .timeline-item, .roadmap-node, .news-item';
    const STEP_MS = 45;
    const MAX_STEPS = 10;
    let step = 0;

    document.querySelectorAll(selector).forEach((el) => {
        if (el.classList.contains('stagger-entrance')) return;
        const rect = el.getBoundingClientRect();
        const onScreen = rect.top < window.innerHeight && rect.bottom > 0;
        if (!onScreen) return;

        el.classList.add('stagger-entrance');
        el.style.animationDelay = `${Math.min(step, MAX_STEPS) * STEP_MS}ms`;
        step++;
    });
}
