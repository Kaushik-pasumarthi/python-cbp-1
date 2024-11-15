import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { PowerUp } from './powerUp.js';
import { Obstacle } from './obstacle.js';
import { Brick } from './brick.js';

export class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.player = new Player(50, this.canvas.height - 60);
    this.enemy = new Enemy(this.canvas.width - 50, this.canvas.height - 60);
    this.obstacles = [];
    this.powerUps = [];
    this.bricks = [];
    this.score = 0;
    this.gameOver = false;
    this.animationId = null;
    this.lastObstacleTime = 0;
    this.lastPowerUpTime = 0;
    this.lastBrickTime = 0;
    this.difficulty = 1;
    this.simultaneousObstacles = 1;
    this.backgroundOffset = 0;
    
    this.initializeBricks();
    this.bindEvents();
  }

  initializeBricks() {
    this.addBrick(200, 250, 'normal');
    this.addBrick(300, 200, 'bonus');
    this.addBrick(400, 300, 'temporary');
  }

  addBrick(x, y, type) {
    this.bricks.push(new Brick(x, y, type));
  }

  bindEvents() {
    document.addEventListener('keydown', (e) => this.player.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.player.handleKeyUp(e));
    document.getElementById('restartButton').addEventListener('click', () => this.restart());
  }

  start() {
    this.gameLoop();
  }

  update() {
    if (this.gameOver) return;

    this.score++;
    this.difficulty = 1 + Math.floor(this.score / 500) * 0.2;
    this.simultaneousObstacles = Math.min(3, 1 + Math.floor(this.score / 1000));
    document.getElementById('score').textContent = `Score: ${this.score}`;

    // Parallax background
    this.backgroundOffset = (this.backgroundOffset + 0.5) % this.canvas.width;

    this.player.update(this.bricks);
    this.enemy.update(this.player, this.difficulty);

    // Update bricks
    this.bricks = this.bricks.filter(brick => {
      brick.update();
      return brick.active;
    });

    // Spawn new bricks
    if (Date.now() - this.lastBrickTime > 3000) {
      const y = Math.random() * 250 + 100;
      const type = Math.random() < 0.3 ? 'bonus' : 
                   Math.random() < 0.6 ? 'temporary' : 'normal';
      this.addBrick(this.canvas.width, y, type);
      this.lastBrickTime = Date.now();
    }

    // Spawn obstacles
    const obstacleInterval = Math.max(2000 - this.difficulty * 200, 800);
    if (Date.now() - this.lastObstacleTime > obstacleInterval) {
      for (let i = 0; i < this.simultaneousObstacles; i++) {
        const offset = i * (this.canvas.width / this.simultaneousObstacles / 2);
        this.obstacles.push(new Obstacle(
          this.canvas.width + offset,
          this.canvas.height - 40,
          this.difficulty
        ));
      }
      this.lastObstacleTime = Date.now();
    }

    // Spawn power-ups
    if (Date.now() - this.lastPowerUpTime > 5000) {
      this.powerUps.push(new PowerUp(
        this.canvas.width,
        Math.random() * (this.canvas.height - 150) + 50
      ));
      this.lastPowerUpTime = Date.now();
    }

    this.obstacles = this.obstacles.filter(obstacle => {
      obstacle.update();
      return !obstacle.isOffScreen();
    });

    this.powerUps = this.powerUps.filter(powerUp => {
      powerUp.update();
      return !powerUp.isCollected && !powerUp.isOffScreen();
    });

    this.checkCollisions();
  }

  drawBackground() {
    // Dark gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#000033');
    gradient.addColorStop(1, '#000066');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Parallax stars
    for (let i = 0; i < 50; i++) {
      const x = (i * 30 + this.backgroundOffset) % this.canvas.width;
      const y = (Math.sin(x * 0.02) * 50) + (i * 10) % this.canvas.height;
      const size = Math.random() * 2 + 1;
      const alpha = Math.sin(Date.now() * 0.001 + i) * 0.5 + 0.5;
      
      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Ground
    const groundGradient = this.ctx.createLinearGradient(
      0, this.canvas.height - 20, 
      0, this.canvas.height
    );
    groundGradient.addColorStop(0, '#1a0f2a');
    groundGradient.addColorStop(1, '#0f0f1a');
    this.ctx.fillStyle = groundGradient;
    this.ctx.fillRect(0, this.canvas.height - 20, this.canvas.width, 20);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackground();
    
    this.bricks.forEach(brick => brick.draw(this.ctx));
    this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
    this.powerUps.forEach(powerUp => powerUp.draw(this.ctx));
    this.player.draw(this.ctx);
    this.enemy.draw(this.ctx);
  }

  checkCollisions() {
    if (!this.player.hasShield) {
      if (this.player.checkPlatformCollision(this.enemy)) {
        this.endGame();
      }

      this.obstacles.forEach(obstacle => {
        if (this.player.checkPlatformCollision(obstacle)) {
          this.endGame();
        }
      });
    }

    this.powerUps.forEach(powerUp => {
      if (!powerUp.isCollected && this.player.checkPlatformCollision(powerUp)) {
        powerUp.collect(this.player);
      }
    });
  }

  gameLoop() {
    this.update();
    this.draw();
    
    if (!this.gameOver) {
      this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
  }

  endGame() {
    this.gameOver = true;
    document.getElementById('gameOver').classList.remove('hidden');
    document.getElementById('finalScore').textContent = this.score;
  }

  restart() {
    this.gameOver = false;
    this.score = 0;
    this.difficulty = 1;
    this.simultaneousObstacles = 1;
    this.obstacles = [];
    this.powerUps = [];
    this.bricks = [];
    this.backgroundOffset = 0;
    this.player.reset();
    this.enemy.reset();
    this.initializeBricks();
    document.getElementById('gameOver').classList.add('hidden');
    this.start();
  }
}