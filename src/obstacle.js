export class Obstacle {
  constructor(x, y, difficulty) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 40;
    this.baseSpeed = 5;
    this.speed = this.baseSpeed * difficulty;
    this.isAirborne = Math.random() > 0.5;
    this.verticalSpeed = 0;
    this.oscillationSpeed = Math.random() * 2 - 1;
    this.initialY = y;
    this.rotationAngle = 0;
    this.rotationSpeed = (Math.random() * 2 - 1) * 0.1;
    
    if (this.isAirborne) {
      this.y = Math.random() * 200 + 50; // Random height for air obstacles
      this.verticalSpeed = Math.random() * 2 - 1; // Random vertical movement
    }
  }

  update() {
    this.x -= this.speed;
    
    if (this.isAirborne) {
      // Vertical oscillation for air obstacles
      this.y += Math.sin(this.x * 0.02) * this.oscillationSpeed;
      this.y = Math.max(50, Math.min(this.y, 300)); // Keep within screen bounds
    } else {
      // Rolling animation for ground obstacles
      this.rotationAngle += this.rotationSpeed;
    }
  }

  draw(ctx) {
    ctx.save();
    
    if (this.isAirborne) {
      // Draw air obstacle with shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(this.x + 5, 360, this.width, 5);
      
      ctx.fillStyle = '#ff8c00';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      
      // Warning indicators
      if (this.x > 600) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(this.x, this.y - 5, this.width, 5);
      }
    } else {
      // Draw rolling ground obstacle
      ctx.translate(this.x + this.width/2, this.y + this.height/2);
      ctx.rotate(this.rotationAngle);
      ctx.fillStyle = '#ff8c00';
      ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
    }
    
    ctx.restore();
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}