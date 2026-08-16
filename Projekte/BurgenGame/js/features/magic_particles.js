// --- CANVAS MAGIC PARTICLES ENGINE (Option D) ---

class MagicParticlesEngine {
  constructor(canvasRenderer) {
    this.canvas = canvasRenderer;
    this.particles = [];
  }

  spawnParticle(x, y, type = 'spark') {
    const colorMap = {
      spark: '#d4af37',
      heal: '#55ff55',
      fire: '#ff4400',
      mana: '#00ccff',
      blessing: '#ff88ff'
    };

    const count = type === 'fire' || type === 'blessing' ? 12 : 6;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.5;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        color: colorMap[type] || '#ffffff',
        radius: 2 + Math.random() * 3,
        alpha: 1.0,
        decay: 0.015 + Math.random() * 0.02,
        type: type
      });
    }
  }

  spawnSpellExplosion(x, y, type = 'fire') {
    this.spawnParticle(x, y, type);
    if (window.gameSound && typeof window.gameSound.playSfx === 'function') {
      window.gameSound.playSfx('magic');
    }
  }

  updateAndDraw(ctx) {
    if (!ctx) return;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

window.MagicParticlesEngine = MagicParticlesEngine;
