/**
 * Hero Section Module — Animated typing effect and dynamic particle galaxy
 * Adds a visually stunning centered hero section with glowing neon typography
 * and an interactive constellation particle matrix.
 */
export function initHeroSection() {
    const heroContainer = document.getElementById('hero-section');
    if (!heroContainer) return;

    const lang = document.documentElement.getAttribute('lang') || 'de';

    // 1. Typing animation with smooth pacing
    const typingEl = document.getElementById('hero-typing');
    if (typingEl) {
        const phrases = lang === 'de'
            ? ['Fachinformatiker für Anwendungsentwicklung', 'Frontend & Full-Stack Webentwickler', 'Clean Code, TDD & moderne Softwarearchitektur', 'KI-Nutzung, Automation & Modern Tools', 'Sofort einsatzbereit & motiviert 🚀']
            : ['IT Specialist — Application Development', 'Frontend & Full-Stack Web Developer', 'Clean Code, TDD & Modern Software Architecture', 'AI Engineering, Automation & Modern Tools', 'Available & Ready for Action 🚀'];

        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 75;

        function typeWriter() {
            const currentPhrase = phrases[phraseIndex];

            if (isDeleting) {
                typingEl.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 35;
            } else {
                typingEl.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 75;
            }

            if (!isDeleting && charIndex === currentPhrase.length) {
                typingSpeed = 2200; // Pause at end of sentence
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typingSpeed = 400; // Pause before typing new phrase
            }

            setTimeout(typeWriter, typingSpeed);
        }

        typeWriter();

        document.addEventListener('langchange', (e) => {
            const newLang = e.detail;
            const newPhrases = newLang === 'de' ? 
                ['Fachinformatiker für Anwendungsentwicklung', 'Frontend & Full-Stack Webentwickler', 'Clean Code, TDD & moderne Softwarearchitektur', 'KI-Nutzung, Automation & Modern Tools', 'Sofort einsatzbereit & motiviert 🚀'] : 
                ['IT Specialist — Application Development', 'Frontend & Full-Stack Web Developer', 'Clean Code, TDD & Modern Software Architecture', 'AI Engineering, Automation & Modern Tools', 'Available & Ready for Action 🚀'];
            
            phrases.length = 0;
            phrases.push(...newPhrases);
            phraseIndex = 0;
            charIndex = 0;
            isDeleting = false;
        });
    }

    // 2. High-Density Dynamic Particle Constellation
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        initHeroParticles(heroContainer);
    }
}

function initHeroParticles(container) {
    let existingCanvas = container.querySelector('.hero-particles, .hero-particles-canvas');
    if (existingCanvas) {
        existingCanvas.remove();
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'hero-particles';
    canvas.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;';
    container.style.position = 'relative';
    container.insertBefore(canvas, container.firstChild);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = container.offsetWidth);
    let height = (canvas.height = container.offsetHeight);

    const colors = [
        '59, 130, 246',  // Electric Blue
        '6, 182, 212',   // Neon Cyan
        '168, 85, 247',  // Cyber Purple
        '16, 185, 129',  // Emerald Green
        '236, 72, 153'   // Pink Flare
    ];

    const particleCount = Math.min(85, Math.max(45, Math.floor((width * height) / 8500)));
    const particles = [];

    class HeroParticle {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * width;
            this.y = initial ? Math.random() * height : (Math.random() > 0.5 ? -10 : height + 10);
            this.vx = (Math.random() - 0.5) * 0.7;
            this.vy = (Math.random() - 0.5) * 0.7;
            this.radius = Math.random() * 2.5 + 1.2;
            this.baseRadius = this.radius;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.alpha = Math.random() * 0.55 + 0.25;
            this.pulseSpeed = Math.random() * 0.03 + 0.015;
            this.pulsePhase = Math.random() * Math.PI * 2;
        }

        update(mouseX, mouseY) {
            this.x += this.vx;
            this.y += this.vy;
            this.pulsePhase += this.pulseSpeed;

            // Oscillate radius and alpha for dynamic glowing pulse
            this.radius = this.baseRadius + Math.sin(this.pulsePhase) * 0.75;
            const dynamicAlpha = Math.max(0.1, this.alpha + Math.sin(this.pulsePhase) * 0.2);

            // Subtle mouse repulsion / interactive drift
            if (mouseX !== null && mouseY !== null) {
                const dx = this.x - mouseX;
                const dy = this.y - mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const force = (120 - dist) / 120;
                    this.x += (dx / dist) * force * 2.2;
                    this.y += (dy / dist) * force * 2.2;
                }
            }

            // Wrap around edges
            if (this.x < -15) this.x = width + 15;
            if (this.x > width + 15) this.x = -15;
            if (this.y < -15) this.y = height + 15;
            if (this.y > height + 15) this.y = -15;

            return dynamicAlpha;
        }

        draw(dynamicAlpha) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.max(0.5, this.radius), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${dynamicAlpha})`;
            
            // Halo glow for larger particles
            if (this.radius > 2.0) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = `rgba(${this.color}, 0.8)`;
            }

            ctx.fill();
            ctx.restore();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new HeroParticle());
    }

    let mouseX = null;
    let mouseY = null;

    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    container.addEventListener('mouseleave', () => {
        mouseX = null;
        mouseY = null;
    });

    function resize() {
        if (!container) return;
        width = canvas.width = container.offsetWidth;
        height = canvas.height = container.offsetHeight;
    }
    window.addEventListener('resize', resize, { passive: true });

    let animId;
    function render() {
        ctx.clearRect(0, 0, width, height);

        // Draw connecting constellation lines
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 110) {
                    const lineAlpha = (1 - dist / 110) * 0.22;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${particles[i].color}, ${lineAlpha})`;
                    ctx.lineWidth = 0.75;
                    ctx.stroke();
                }
            }
        }

        // Draw & update particles
        particles.forEach(p => {
            const dynamicAlpha = p.update(mouseX, mouseY);
            p.draw(dynamicAlpha);
        });

        animId = requestAnimationFrame(render);
    }

    render();

    window.addEventListener('beforeunload', () => {
        if (animId) cancelAnimationFrame(animId);
    });
}

