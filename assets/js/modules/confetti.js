/**
 * Confetti Module — Dynamic Canvas-based Confetti Particle System
 * Spawns colorful paper particles on victory/highscores.
 */
const Confetti = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,
    isActive: false,

    start(durationMs = 3000) {
        if (this.isActive) return;
        this.isActive = true;
        this.particles = [];

        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '99999';
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.resize();

        // Handle resize
        this.resizeHandler = () => this.resize();
        window.addEventListener('resize', this.resizeHandler);

        // Spawn particles
        const colors = [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
            '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'
        ];
        
        const count = 120;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height - this.canvas.height, // start above/within screen
                r: Math.random() * 6 + 4, // radius/size
                d: Math.random() * count, // density/weight
                color: colors[Math.floor(Math.random() * colors.length)],
                tilt: Math.random() * 10 - 5,
                tiltAngleIncremental: Math.random() * 0.07 + 0.02,
                tiltAngle: 0,
                vx: Math.random() * 4 - 2,
                vy: Math.random() * 3 + 2 // speed downwards
            });
        }

        const startTime = Date.now();
        const loop = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed > durationMs && this.particles.every(p => p.y > this.canvas.height)) {
                this.stop();
                return;
            }

            this.update();
            this.draw();
            this.animationId = requestAnimationFrame(loop);
        };

        this.animationId = requestAnimationFrame(loop);
    },

    resize() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    },

    update() {
        const height = this.canvas.height;
        const width = this.canvas.width;

        this.particles.forEach(p => {
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += p.vy;
            p.x += p.vx;
            p.tilt = Math.sin(p.tiltAngle - (p.r / 2)) * 10;

            // Loop or reset if off screen before duration ends
            if (p.y > height + 20) {
                p.y = -20;
                p.x = Math.random() * width;
            }
        });
    },

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            this.ctx.beginPath();
            this.ctx.lineWidth = p.r;
            this.ctx.strokeStyle = p.color;
            this.ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
            this.ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
            this.ctx.stroke();
        });
    },

    stop() {
        if (!this.isActive) return;
        this.isActive = false;

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        if (this.canvas) {
            window.removeEventListener('resize', this.resizeHandler);
            document.body.removeChild(this.canvas);
            this.canvas = null;
            this.ctx = null;
        }
        this.particles = [];
    }
};

function initConfetti() {
    // Confetti is initialized dynamically via Confetti.start()
}
