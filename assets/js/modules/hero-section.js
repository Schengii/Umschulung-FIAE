/**
 * Hero Section Module — Animated typing effect and particle background
 * Adds a visually stunning hero section to the home page.
 */
function initHeroSection() {
    const heroContainer = document.getElementById('hero-section');
    if (!heroContainer) return;

    const lang = document.documentElement.getAttribute('lang') || 'de';

    // Typing animation
    const typingEl = document.getElementById('hero-typing');
    if (!typingEl) return;

    const phrases = lang === 'de' 
        ? ['Fachinformatiker für Anwendungsentwicklung', 'Webentwickler', 'Java & Spring Boot', 'JavaScript & Frontend', 'Open for Work 🚀']
        : ['IT Specialist — Application Development', 'Web Developer', 'Java & Spring Boot', 'JavaScript & Frontend', 'Open for Work 🚀'];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 80;

    function typeWriter() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            typingEl.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 40;
        } else {
            typingEl.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 80;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            typingSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 300; // Pause before next phrase
        }

        setTimeout(typeWriter, typingSpeed);
    }

    typeWriter();

    // Particle background
    initHeroParticles(heroContainer);

    // Update phrases on language change
    document.addEventListener('langchange', (e) => {
        const newLang = e.detail;
        const newPhrases = newLang === 'de'
            ? ['Fachinformatiker für Anwendungsentwicklung', 'Webentwickler', 'Java & Spring Boot', 'JavaScript & Frontend', 'Open for Work 🚀']
            : ['IT Specialist — Application Development', 'Web Developer', 'Java & Spring Boot', 'JavaScript & Frontend', 'Open for Work 🚀'];
        phrases.length = 0;
        phrases.push(...newPhrases);
        phraseIndex = 0;
        charIndex = 0;
        isDeleting = false;
    });
}

function initHeroParticles(container) {
    const canvas = document.createElement('canvas');
    canvas.className = 'hero-particles';
    canvas.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;';
    container.style.position = 'relative';
    container.insertBefore(canvas, container.firstChild);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;

    function resize() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    const count = 40;
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            r: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.1
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(37, 99, 235, ${0.15 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw particles
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(37, 99, 235, ${p.opacity})`;
            ctx.fill();

            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Bounce
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        });

        animId = requestAnimationFrame(draw);
    }

    draw();

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => cancelAnimationFrame(animId));
}
