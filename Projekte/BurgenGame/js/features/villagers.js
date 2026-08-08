// --- ISOMETRIC VILLAGERS & SIMULATED POPULATION ---

class VillagerManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.villagers = [];
    this.maxVillagers = 12;
    this.roles = [
      { type: 'woodcutter', label: 'Holzfäller', color: '#8B4513', item: '🪵', icon: '🪓' },
      { type: 'miner', label: 'Bergmann', color: '#708090', item: '🪨', icon: '⛏️' },
      { type: 'farmer', label: 'Bauer', color: '#DAA520', item: '🌾', icon: '👩‍🌾' },
      { type: 'guard', label: 'Burgwache', color: '#4682B4', item: '🗡️', icon: '🛡️' },
      { type: 'trader', label: 'Kaufmann', color: '#9370DB', item: '💰', icon: '📦' },
      { type: 'citizen', label: 'Bürger', color: '#CD853F', item: '📜', icon: '👑' }
    ];
    this.emotes = ['💬 "Schöne Burg!"', '✨ "Alles friedlich"', '🎵 *pfeif*', '🍎 "Mahlzeit!"', '⚡ "Reichlich Arbeit!"'];
  }

  init() {
    this.spawnInitialVillagers();
  }

  spawnInitialVillagers() {
    this.villagers = [];
    const count = Math.min(this.maxVillagers, Math.max(3, Math.floor(stateManager.state.population / 2) || 5));
    for (let i = 0; i < count; i++) {
      this.spawnVillager();
    }
  }

  spawnVillager() {
    const role = this.roles[Math.floor(Math.random() * this.roles.length)];
    const x = Math.floor(Math.random() * 12) + 1;
    const y = Math.floor(Math.random() * 12) + 1;
    
    this.villagers.push({
      id: 'v_' + Math.random().toString(36).substr(2, 9),
      role: role.type,
      label: role.label,
      color: role.color,
      item: role.item,
      icon: role.icon,
      x: x,
      y: y,
      targetX: x,
      targetY: y,
      progress: 0,
      speed: 0.015 + Math.random() * 0.01,
      state: 'idle', // idle, walking, working
      emote: null,
      emoteTimer: 0
    });
  }

  update() {
    const currentPopCount = Math.min(16, Math.max(4, Math.floor(stateManager.state.population / 2) || 6));
    while (this.villagers.length < currentPopCount) {
      this.spawnVillager();
    }

    this.villagers.forEach(v => {
      if (v.state === 'idle') {
        if (Math.random() < 0.02) {
          v.targetX = Math.min(13, Math.max(0, v.x + (Math.floor(Math.random() * 3) - 1)));
          v.targetY = Math.min(13, Math.max(0, v.y + (Math.floor(Math.random() * 3) - 1)));
          if (v.targetX !== v.x || v.targetY !== v.y) {
            v.state = 'walking';
            v.progress = 0;
          }
        }
        if (Math.random() < 0.005) {
          v.emote = this.emotes[Math.floor(Math.random() * this.emotes.length)];
          v.emoteTimer = 180;
        }
      } else if (v.state === 'walking') {
        v.progress += v.speed;
        if (v.progress >= 1) {
          v.x = v.targetX;
          v.y = v.targetY;
          v.progress = 0;
          v.state = 'idle';
        }
      }

      if (v.emoteTimer > 0) {
        v.emoteTimer--;
        if (v.emoteTimer <= 0) v.emote = null;
      }
    });
  }

  draw(ctx, tileToIsoFunc, zoom) {
    this.update();

    this.villagers.forEach(v => {
      const curX = v.x + (v.targetX - v.x) * v.progress;
      const curY = v.y + (v.targetY - v.y) * v.progress;
      const pos = tileToIsoFunc(curX, curY);

      ctx.save();
      // Shadow
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y + 4, 8, 4, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fill();

      // Body (Isometric Pawn)
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - 12, 6, 0, Math.PI * 2);
      ctx.fillStyle = v.color;
      ctx.fill();
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Head
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - 20, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffdbac';
      ctx.fill();
      ctx.stroke();

      // Role Icon / Item
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(v.item, pos.x + 8, pos.y - 14);

      // Emote speech bubble
      if (v.emote) {
        ctx.fillStyle = 'rgba(20,20,30,0.85)';
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1;
        const textWidth = ctx.measureText(v.emote).width;
        ctx.fillRect(pos.x - textWidth / 2 - 4, pos.y - 38, textWidth + 8, 14);
        ctx.strokeRect(pos.x - textWidth / 2 - 4, pos.y - 38, textWidth + 8, 14);
        ctx.fillStyle = '#fff';
        ctx.fillText(v.emote, pos.x, pos.y - 27);
      }

      ctx.restore();
    });
  }
}

window.VillagerManager = VillagerManager;
