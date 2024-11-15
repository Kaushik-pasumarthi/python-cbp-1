export class Brick {
  constructor(x, y, type = 'normal') {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 20;
    this.type = type; // 'normal', 'temporary', 'bonus'
    this.active = true;
    this.hit = false;
    this.bounceOffset = 0;
    this.bounceVelocity = 0;
    this.timeoutId = null;
    this.hasPowerUp = type === 'bonus';
    this.bounceAnimation = false;

    if (type === 'temporary') {
      this.duration = 5000 + Math.random() * 5000;
      this.startFade();
    }
  }

  startFade() {
    this.timeoutId = setTimeout(() => {
      this.active = false;
    }, this.duration);
  }

  update() {
    if (this.bounceAnimation) {
      this.bounceVelocity += 0.5;
      this.bounceOffset += this.bounceVelocity;
      
      if (this.bounceOffset > 0) {
        this.bounceOffset = 0;
        this.bounceVelocity = 0;
        this.bounceAnimation = false;
      }
    }
  }

  draw(ctx) {
    if (!this.active) return;

    const alpha = this.type === 'temporary' ? 
      0.3 + 0.7 * (1 - (Date.now() % this.duration) / this.duration) : 1;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Draw brick shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(this.x + 2, this.y + 2, this.width, this.height);

    // Draw main brick
    const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    
    if (this.type === 'bonus') {
      gradient.addColorStop(0, '#FFD700');
      gradient.addColorStop(1, '#FFA500');
    } else {
      gradient.addColorStop(0, '#8B4513');
      gradient.addColorStop(1, '#654321');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(this.x, this.y + this.bounceOffset, this.width, this.height);

    // Draw brick details
    ctx.strokeStyle = this.type === 'bonus' ? '#FFD700' : '#654321';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y + this.bounceOffset, this.width, this.height);

    // Draw question mark for bonus bricks
    if (this.type === 'bonus' && !this.hit) {
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('?', this.x + this.width/2, this.y + this.height/2 + 5 + this.bounceOffset);
    }

    ctx.restore();
  }

  bounce() {
    if (!this.bounceAnimation) {
      this.bounceAnimation = true;
      this.bounceVelocity = -5;
    }
  }

  checkCollision(entity) {
    return (
      entity.x < this.x + this.width &&
      entity.x + entity.width > this.x &&
      entity.y < this.y + this.height &&
      entity.y + entity.height > this.y &&
      this.active
    );
  }

  destroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.active = false;
  }
}