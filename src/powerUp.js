export class PowerUp {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.speed = 3;
    this.isCollected = false;
  }

  update() {
    this.x -= this.speed;
  }

  draw(ctx) {
    if (!this.isCollected) {
      ctx.fillStyle = '#00ffff';
      ctx.beginPath();
      ctx.arc(this.x + this.width/2, this.y + this.height/2, 
              this.width/2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  collect(player) {
    this.isCollected = true;
    player.hasShield = true;
    setTimeout(() => {
      player.hasShield = false;
    }, 5000);
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}