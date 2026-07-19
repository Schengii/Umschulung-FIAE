/**
 * Premium Effects Module — Adds glassmorphism, 3D card tilt, mouse cursor glow spotlight,
 * and staggered load animations across the entire application.
 */

export function initPremiumEffects() {
    // 1. Initialize custom cursor spotlight follower
    initMouseSpotlight();

    // 2. Enhance all card elements with glassmorphism, border glows, and 3D tilt
    enhanceCards();

    // 3. Trigger staggered entrance animations for all cards and interactive sections
    initStaggeredEntrances();
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

    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        if (!hasMoved) {
            hasMoved = true;
            document.body.classList.add('cursor-active');
        }
    });

    document.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-active');
        hasMoved = false;
    });

    // Interpolation (lerp) loop for butter-smooth movement
    function updateGlowPosition() {
        const ease = 0.08; // Lower is smoother/slower
        currentX += (targetX - currentX) * ease;
        currentY += (targetY - currentY) * ease;

        // Apply hardware-accelerated 3D translation
        glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
        requestAnimationFrame(updateGlowPosition);
    }

    requestAnimationFrame(updateGlowPosition);
}

/**
 * Applies Glassmorphism styles and 3D Tilt interactivity to card elements
 */
function enhanceCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        // Prevent double enhancement
        if (card.dataset.premiumEnhanced === 'true') return;
        card.dataset.premiumEnhanced = 'true';

        // Apply glass styling classes
        card.classList.add('card-glass', 'card-glow-border');

        // Setup 3D tilt listener
        apply3DTilt(card);
    });

    // Listen for dynamically added cards in the document
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const cardsInNode = node.classList?.contains('card') ? [node] : node.querySelectorAll?.('.card') || [];
                    cardsInNode.forEach(card => {
                        if (card.dataset.premiumEnhanced !== 'true') {
                            card.dataset.premiumEnhanced = 'true';
                            card.classList.add('card-glass', 'card-glow-border');
                            apply3DTilt(card);
                        }
                    });
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Adds dynamic rotation on mouseMove to simulate 3D depth
 */
function apply3DTilt(element) {
    // Exclude tilt on touch devices or small screens to prevent layout shifting issues
    if (window.matchMedia('(max-width: 768px)').matches) return;

    element.classList.add('card-tilt-3d');

    element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        
        // Mouse coordinate within card
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate normalized coordinate (-0.5 to 0.5)
        const xNorm = (x / rect.width) - 0.5;
        const yNorm = (y / rect.height) - 0.5;
        
        // Set maximum tilt angles in degrees
        const maxTilt = 6;
        const rotateX = -yNorm * maxTilt;
        const rotateY = xNorm * maxTilt;
        
        // Set variables for border-glow effect and apply transform
        element.style.setProperty('--mouse-x', `${x}px`);
        element.style.setProperty('--mouse-y', `${y}px`);
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
 * Sets up staggered entrance animations for cards
 */
function initStaggeredEntrances() {
    const selector = '.card, .welcome-container, .dashboard-card, .timeline-item, .roadmap-node, .news-item';
    const elements = document.querySelectorAll(selector);

    elements.forEach((el, index) => {
        if (!el.classList.contains('stagger-entrance')) {
            el.classList.add('stagger-entrance');
            // Stagger animation with 45ms step delay
            el.style.animationDelay = `${index * 45}ms`;
        }
    });
}
