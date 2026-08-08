class Snake {
  constructor(canvasWidth, canvasHeight, cellSize) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.cellSize = cellSize;
    this.skin = 'default'; // default, ruby, gold, rainbow

    this.reset();
  }

  reset() {
    this.x = this.canvasWidth / 2;
    this.y = this.canvasHeight - 250;
    this.vx = 2.5;
    this.vy = 0;
    this.radius = 12;

    this.segments = [];
    this.maxLength = 5;
    this.shieldTimer = 0; // Shield duration in ms
    this.invulnerableTimer = 0;
    this.speedBoostTimer = 0;
    this.magnetTimer = 0;

    for (let i = 0; i < this.maxLength * 10; i++) {
      this.segments.push({ x: this.x, y: this.y });
    }
  }

  update(blocks, deltaTime) {
    if (this.shieldTimer > 0) this.shieldTimer -= deltaTime;
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= deltaTime;
    if (this.speedBoostTimer > 0) this.speedBoostTimer -= deltaTime;
    if (this.magnetTimer > 0) this.magnetTimer -= deltaTime;

    // Apply horizontal motion
    this.x += this.vx;

    // Wall bounce
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx = -this.vx;
    } else if (this.x + this.radius > this.canvasWidth) {
      this.x = this.canvasWidth - this.radius;
      this.vx = -this.vx;
    }

    // Apply gravity
    const gravity = 0.12;
    this.vy += gravity;
    this.y += this.vy;

    // Collision check with blocks (platforms)
    let onGround = false;
    let hitCeiling = false;

    for (let block of blocks) {
      const left = block.x;
      const right = block.x + block.width;
      const top = block.y;
      const bottom = block.y + block.height;

      const closestX = Math.max(left, Math.min(this.x, right));
      const closestY = Math.max(top, Math.min(this.y, bottom));

      const dx = this.x - closestX;
      const dy = this.y - closestY;
      const distanceSquared = dx * dx + dy * dy;

      if (distanceSquared < this.radius * this.radius) {
        const overlap = this.radius - Math.sqrt(distanceSquared);

        if (this.y < top && this.vy > 0) {
          this.y = top - this.radius;
          this.vy = 0;
          onGround = true;

          // Special Block Triggers
          if (block.specialType === 'spring') {
            this.vy = -12;
            if (window.gameAudio) window.gameAudio.playJump();
          } else if (block.specialType === 'food') {
            this.maxLength++;
            block.markedForDeletion = true;
            if (window.gameAudio) window.gameAudio.playEat();
          } else if (block.specialType === 'accel') {
            this.speedBoostTimer = 1500;
            this.invulnerableTimer = 1500;
            block.markedForDeletion = true;
            this.vy = -6; // Small bounce upwards
            if (window.gameAudio) window.gameAudio.playJump();
          }
        }
        else if (this.y > bottom && this.vy < 0) {
          this.y = bottom + this.radius;
          this.vy = 0;
          hitCeiling = true;
        }
        else {
          const verticalDistToTop = Math.abs(this.y - top);
          if (verticalDistToTop < this.cellSize * 1.8 && this.vy >= 0) {
            this.y = top - this.radius;
            this.vy = 0;
            onGround = true;
          } else {
            if (this.x < left) {
              this.x = left - this.radius;
              this.vx = -Math.abs(this.vx);
            } else {
              this.x = right + this.radius;
              this.vx = Math.abs(this.vx);
            }
          }
        }
      }
    }

    // Save segment positions
    this.segments.unshift({ x: this.x, y: this.y });

    const desiredHistoryLength = this.maxLength * 8;
    while (this.segments.length > desiredHistoryLength) {
      this.segments.pop();
    }
  }

  takeDamage(amount = 1) {
    if (this.invulnerableTimer > 0) return;

    if (this.shieldTimer > 0) {
      this.shieldTimer = 0; // shield breaks
      this.invulnerableTimer = 1000; // 1s grace period
      return;
    }

    this.maxLength = Math.max(1, this.maxLength - amount);
    this.invulnerableTimer = 1500; // 1.5s invulnerability
    if (window.gameAudio) window.gameAudio.playHit();
  }

  getSkinColor(index, max) {
    const cycleSpeed = Date.now() / 150;
    switch (this.skin) {
      case 'ruby':
        return `hsl(350, 100%, ${50 - (index / max) * 20}%)`;
      case 'gold':
        return `hsl(45, 100%, ${50 - (index / max) * 20}%)`;
      case 'rainbow':
        return `hsl(${(cycleSpeed + index * 15) % 360}, 100%, 55%)`;
      default:
        // Neon green
        return `hsl(${120 + index * 2}, 100%, ${50 - (index / max) * 20}%)`;
    }
  }

  draw(ctx, viewY) {
    const spacing = 8;
    for (let i = this.maxLength - 1; i >= 0; i--) {
      const idx = Math.min(this.segments.length - 1, i * spacing);
      const pos = this.segments[idx];
      if (!pos) continue;

      const screenY = pos.y - viewY;

      ctx.beginPath();
      ctx.arc(pos.x, screenY, this.radius * (1 - (i / this.maxLength) * 0.4), 0, Math.PI * 2);

      if (i === 0) {
        // Head
        ctx.fillStyle = this.invulnerableTimer > 0 && Math.floor(Date.now() / 100) % 2 === 0
          ? 'rgba(255,255,255,0.4)'
          : this.getSkinColor(0, this.maxLength);
      } else {
        // Tail
        ctx.fillStyle = this.getSkinColor(i, this.maxLength);
      }

      ctx.fill();

      // Draw Shield
      if (i === 0 && this.shieldTimer > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(pos.x, screenY, this.radius + 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();
      }

      // Eyes
      if (i === 0) {
        ctx.fillStyle = '#000';
        const eyeOffset = 4;
        const dir = this.vx > 0 ? 1 : -1;
        ctx.beginPath();
        ctx.arc(pos.x + dir * eyeOffset, screenY - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

window.Snake = Snake;
