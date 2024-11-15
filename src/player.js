export class Player {
  constructor(x, y) {
    this.x = x;
    this.initialX = x;
    this.y = y;
    this.initialY = y;
    this.width = 40;
    this.height = 40;
    this.velocityY = 0;
    this.velocityX = 0;
    this.jumping = false;
    this.speed = 5;
    this.hasShield = false;
    this.onPlatform = false;
    this.gravity = 0.8;
    this.jumpForce = -15;
    this.frameCount = 0;
    this.runFrame = 0;
    this.eyeGlow = 0;
    
    this.keys = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false
    };
  }

  handleKeyDown(e) {
    if (this.keys.hasOwnProperty(e.key)) {
      this.keys[e.key] = true;
      e.preventDefault();
    }
  }

  handleKeyUp(e) {
    if (this.keys.hasOwnProperty(e.key)) {
      this.keys[e.key] = false;
      e.preventDefault();
    }
  }

  update(bricks) {
    this.frameCount++;
    this.eyeGlow = Math.sin(this.frameCount * 0.1) * 0.3 + 0.7;

    // Running animation
    if (Math.abs(this.velocityX) > 0.1) {
      if (this.frameCount % 5 === 0) {
        this.runFrame = (this.runFrame + 1) % 4;
      }
    } else {
      this.runFrame = 0;
    }

    // Horizontal movement with momentum
    if (this.keys.ArrowLeft) {
      this.velocityX = -this.speed;
    } else if (this.keys.ArrowRight) {
      this.velocityX = this.speed;
    } else {
      this.velocityX *= 0.8;
    }

    this.x += this.velocityX;

    // Jumping
    if (this.keys.ArrowUp && (this.onPlatform || !this.jumping)) {
      this.velocityY = this.jumpForce;
      this.jumping = true;
      this.onPlatform = false;
    }

    // Apply gravity
    this.velocityY += this.gravity;
    this.y += this.velocityY;

    // Check brick collisions
    this.onPlatform = false;
    if (bricks) {
      bricks.forEach(brick => {
        if (brick.active && this.checkPlatformCollision(brick)) {
          if (this.velocityY > 0 && this.y + this.height <= brick.y + this.velocityY) {
            this.y = brick.y - this.height;
            this.velocityY = 0;
            this.jumping = false;
            this.onPlatform = true;
            
            if (brick.type === 'bonus' && !brick.hit) {
              brick.hit = true;
              brick.bounce();
              this.hasShield = true;
              setTimeout(() => this.hasShield = false, 5000);
            }
          }
        }
      });
    }

    // Ground collision
    if (this.y > this.initialY) {
      this.y = this.initialY;
      this.velocityY = 0;
      this.jumping = false;
      this.onPlatform = true;
    }

    // Screen boundaries
    this.x = Math.max(0, Math.min(this.x, 800 - this.width));
  }

  drawShadowFigure(ctx, x, y) {
    ctx.save();
    
    // Body
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.beginPath();
    ctx.ellipse(x + this.width/2, y + this.height/2, 
                this.width/2, this.height/2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs animation
    const legOffset = Math.sin(this.runFrame * Math.PI/2) * 10;
    ctx.beginPath();
    ctx.moveTo(x + this.width/2 - 10, y + this.height/2);
    ctx.quadraticCurveTo(
      x + this.width/2 - 5, 
      y + this.height - 10 + legOffset,
      x + this.width/2, 
      y + this.height
    );
    ctx.moveTo(x + this.width/2 + 10, y + this.height/2);
    ctx.quadraticCurveTo(
      x + this.width/2 + 5, 
      y + this.height - 10 - legOffset,
      x + this.width/2, 
      y + this.height
    );
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Glowing eyes
    const eyeColor = this.hasShield ? '#00ff00' : '#ff0000';
    ctx.fillStyle = eyeColor;
    ctx.shadowColor = eyeColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x + this.width/2 - 8, y + this.height/2 - 5, 
            3, 0, Math.PI * 2);
    ctx.arc(x + this.width/2 + 8, y + this.height/2 - 5, 
            3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  draw(ctx) {
    // Draw shadow on ground
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(this.x + this.width/2, this.initialY + 5, 
                this.width/2, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw shield effect
    if (this.hasShield) {
      ctx.beginPath();
      ctx.arc(this.x + this.width/2, this.y + this.height/2, 
              this.width/1.5, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(
        this.x + this.width/2, this.y + this.height/2, 0,
        this.x + this.width/2, this.y + this.height/2, this.width/1.5
      );
      gradient.addColorStop(0, 'rgba(0, 255, 0, 0)');
      gradient.addColorStop(0.7, 'rgba(0, 255, 0, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 255, 0, 0.3)');
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw player
    this.drawShadowFigure(ctx, this.x, this.y);
  }

  checkPlatformCollision(platform) {
    return (
      this.x < platform.x + platform.width &&
      this.x + this.width > platform.x &&
      this.y < platform.y + platform.height &&
      this.y + this.height > platform.y
    );
  }

  reset() {
    this.x = this.initialX;
    this.y = this.initialY;
    this.velocityY = 0;
    this.velocityX = 0;
    this.jumping = false;
    this.hasShield = false;
    this.onPlatform = false;
    this.frameCount = 0;
    this.runFrame = 0;
  }
}