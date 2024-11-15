export class Enemy {
  constructor(x, y) {
    this.x = x;
    this.initialX = x;
    this.y = y;
    this.initialY = y;
    this.width = 45;
    this.height = 45;
    this.speed = 2;
    this.targetY = y;
    this.frameCount = 0;
    this.clawExtension = 0;
    this.eyeGlow = 0;
  }

  update(player, difficulty) {
    this.frameCount++;
    this.eyeGlow = Math.sin(this.frameCount * 0.1) * 0.3 + 0.7;
    this.clawExtension = Math.sin(this.frameCount * 0.2) * 5;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    
    // Horizontal movement with pouncing effect
    if (Math.abs(dx) > 100) {
      const pounceEffect = Math.sin(this.frameCount * 0.1) * 2;
      this.x += Math.sign(dx) * (this.speed + pounceEffect) * difficulty;
    }
    
    // Vertical movement with smooth tracking
    if (Math.abs(dy) > 20) {
      this.targetY = player.y;
    }
    
    const yDiff = this.targetY - this.y;
    this.y += yDiff * 0.05;

    // Keep enemy in bounds
    this.x = Math.max(0, Math.min(this.x, 800 - this.width));
    this.y = Math.max(0, Math.min(this.y, this.initialY));
  }

  draw(ctx) {
    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(this.x + this.width/2, this.initialY + 5, 
                this.width/2, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw body
    ctx.save();
    ctx.fillStyle = 'rgba(20, 0, 30, 0.9)';
    ctx.beginPath();
    ctx.moveTo(this.x + this.width/2, this.y);
    ctx.quadraticCurveTo(
      this.x + this.width, this.y + this.height/2,
      this.x + this.width/2, this.y + this.height
    );
    ctx.quadraticCurveTo(
      this.x, this.y + this.height/2,
      this.x + this.width/2, this.y
    );
    ctx.fill();

    // Draw claws
    ctx.strokeStyle = 'rgba(255, 0, 100, 0.7)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(255, 0, 100, 0.5)';
    ctx.shadowBlur = 5;
    
    // Left claw
    ctx.beginPath();
    ctx.moveTo(this.x + 10, this.y + this.height/2);
    ctx.lineTo(this.x - 5 + this.clawExtension, 
              this.y + this.height/2 - 5);
    ctx.lineTo(this.x - 5 + this.clawExtension, 
              this.y + this.height/2 + 5);
    ctx.closePath();
    ctx.stroke();
    
    // Right claw
    ctx.beginPath();
    ctx.moveTo(this.x + this.width - 10, this.y + this.height/2);
    ctx.lineTo(this.x + this.width + 5 - this.clawExtension, 
              this.y + this.height/2 - 5);
    ctx.lineTo(this.x + this.width + 5 - this.clawExtension, 
              this.y + this.height/2 + 5);
    ctx.closePath();
    ctx.stroke();

    // Draw glowing eyes
    ctx.fillStyle = '#ff0066';
    ctx.shadowColor = '#ff0066';
    ctx.shadowBlur = 15 * this.eyeGlow;
    ctx.beginPath();
    ctx.arc(this.x + this.width/2 - 8, this.y + this.height/2 - 5, 
            4, 0, Math.PI * 2);
    ctx.arc(this.x + this.width/2 + 8, this.y + this.height/2 - 5, 
            4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  reset() {
    this.x = this.initialX;
    this.y = this.initialY;
    this.targetY = this.initialY;
    this.frameCount = 0;
  }
}