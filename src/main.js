import { Game } from './game.js';
import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { PowerUp } from './powerUp.js';
import { Obstacle } from './obstacle.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

const game = new Game(canvas, ctx);
game.start();