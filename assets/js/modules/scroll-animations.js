/**
 * Scroll Animations & Dynamic Visuals Module
 * Handles scroll reveal observers, top scroll progress bar, animated stat counters,
 * and background tech particle dots matrix.
 */

export function initScrollAnimations() {
    initScrollProgressBar();
    initScrollReveal();
    initNumberCounters();
    initTechParticles();
}

/**
 * 1. Smooth Reading & Scroll Progress Indicator
 */
function initScrollProgressBar() {
    if (document.getElementById('scroll-progress-bar')) return;

    const bar = document.createElement('div');
    bar.id = 'scroll-progress-bar';
    document.body.appendChild(bar);

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
                bar.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

/**
 * 2. IntersectionObserver for Cascading Scroll Reveals
 */
function initScrollReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.querySelectorAll('.scroll-reveal, .card').forEach(el => {
            el.classList.add('reveal-visible');
        });
        return;
    }

    const revealElements = document.querySelectorAll(
        '.scroll-reveal, .card, .home-points-grid, .timeline-item, .roadmap-node, .stat-card'
    );
    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.06,
        rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach(el => {
        if (!el.classList.contains('scroll-reveal')) {
            el.classList.add('scroll-reveal');
        }
        observer.observe(el);
    });
}

/**
 * 3. Animated Number Counters (e.g. stats, percentages, project counts)
 */
function initNumberCounters() {
    const counterElements = document.querySelectorAll('.stat-number-animated, [data-counter]');
    if (!counterElements.length) return;

    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                observer.unobserve(el);

                const targetVal = parseFloat(el.getAttribute('data-counter') || el.innerText.replace(/[^0-9.]/g, ''));
                if (isNaN(targetVal)) return;

                if (isReducedMotion) {
                    el.innerText = String(targetVal);
                    return;
                }

                const prefix = el.getAttribute('data-prefix') || '';
                const suffix = el.getAttribute('data-suffix') || '';
                const duration = 1400; // ms
                const startTime = performance.now();

                function updateCount(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out expo curve
                    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                    const currentVal = Math.floor(easeProgress * targetVal);

                    el.innerText = `${prefix}${currentVal}${suffix}`;

                    if (progress < 1) {
                        requestAnimationFrame(updateCount);
                    } else {
                        el.innerText = `${prefix}${targetVal}${suffix}`;
                    }
                }

                requestAnimationFrame(updateCount);
            }
        });
    }, { threshold: 0.2 });

    counterElements.forEach(el => observer.observe(el));
}

/**
 * 4. Ambient Tech Particle Dots & Constellation Canvas
 */
function initTechParticles() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const hero = document.getElementById('hero-section') || document.querySelector('.welcome-container');
    if (!hero) return;

    // Check if canvas already exists
    if (hero.querySelector('.hero-particles-canvas')) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'hero-particles-canvas';
    hero.style.position = 'relative';
    hero.insertBefore(canvas, hero.firstChild);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = hero.offsetWidth);
    let height = (canvas.height = hero.offsetHeight);

    const particles = [];
    const particleCount = Math.min(36, Math.floor((width * height) / 18000));

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.45;
            this.vy = (Math.random() - 0.5) * 0.45;
            this.radius = Math.random() * 2 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(59, 130, 246, 0.45)';
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function handleResize() {
        if (!hero) return;
        width = canvas.width = hero.offsetWidth;
        height = canvas.height = hero.offsetHeight;
    }
    window.addEventListener('resize', handleResize, { passive: true });

    let animId;
    function render() {
        ctx.clearRect(0, 0, width, height);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 95) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 * (1 - dist / 95)})`;
                    ctx.lineWidth = 0.75;
                    ctx.stroke();
                }
            }
        }

        // Draw & update particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        animId = requestAnimationFrame(render);
    }

    render();
}

