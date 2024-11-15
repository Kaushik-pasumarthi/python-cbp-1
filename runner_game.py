import pygame
import random
import sys

# Initialize Pygame
pygame.init()

# Constants
WINDOW_WIDTH = 800
WINDOW_HEIGHT = 600
FPS = 60

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)
PURPLE = (255, 0, 255)
ORANGE = (255, 165, 0)

class Player(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.image = pygame.Surface((40, 40))
        self.image.fill(RED)
        self.rect = self.image.get_rect()
        self.rect.x = 100
        self.rect.y = WINDOW_HEIGHT - 100
        self.velocity_y = 0
        self.jumping = False
        self.has_shield = False

    def update(self):
        keys = pygame.key.get_pressed()
        
        # Horizontal movement
        if keys[pygame.K_LEFT]:
            self.rect.x -= 5
        if keys[pygame.K_RIGHT]:
            self.rect.x += 5
            
        # Jumping
        if keys[pygame.K_SPACE] and not self.jumping:
            self.velocity_y = -15
            self.jumping = True
            
        # Apply gravity
        self.velocity_y += 0.8
        self.rect.y += self.velocity_y
        
        # Ground collision
        if self.rect.bottom > WINDOW_HEIGHT - 60:
            self.rect.bottom = WINDOW_HEIGHT - 60
            self.velocity_y = 0
            self.jumping = False
            
        # Screen boundaries
        self.rect.x = max(0, min(self.rect.x, WINDOW_WIDTH - self.rect.width))

class Enemy(pygame.sprite.Sprite):
    def __init__(self, player):
        super().__init__()
        self.image = pygame.Surface((40, 40))
        self.image.fill(PURPLE)
        self.rect = self.image.get_rect()
        self.rect.x = WINDOW_WIDTH - 100
        self.rect.y = WINDOW_HEIGHT - 100
        self.player = player
        self.speed = 2

    def update(self):
        # Chase player
        if self.rect.x < self.player.rect.x:
            self.rect.x += self.speed
        elif self.rect.x > self.player.rect.x:
            self.rect.x -= self.speed
            
        if self.rect.y < self.player.rect.y:
            self.rect.y += self.speed
        elif self.rect.y > self.player.rect.y:
            self.rect.y -= self.speed

class Obstacle(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.image = pygame.Surface((30, 50))
        self.image.fill(ORANGE)
        self.rect = self.image.get_rect()
        self.rect.x = WINDOW_WIDTH
        self.rect.bottom = WINDOW_HEIGHT - 60
        self.speed = random.randint(5, 8)

    def update(self):
        self.rect.x -= self.speed
        if self.rect.right < 0:
            self.kill()

class PowerUp(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.image = pygame.Surface((20, 20))
        self.image.fill(BLUE)
        self.rect = self.image.get_rect()
        self.rect.x = WINDOW_WIDTH
        self.rect.y = random.randint(100, WINDOW_HEIGHT - 160)
        self.speed = 3

    def update(self):
        self.rect.x -= self.speed
        if self.rect.right < 0:
            self.kill()

class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
        pygame.display.set_caption("Python Runner Game")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.Font(None, 36)
        
        # Sprite groups
        self.all_sprites = pygame.sprite.Group()
        self.obstacles = pygame.sprite.Group()
        self.powerups = pygame.sprite.Group()
        
        # Create player and enemy
        self.player = Player()
        self.enemy = Enemy(self.player)
        self.all_sprites.add(self.player)
        self.all_sprites.add(self.enemy)
        
        # Game variables
        self.score = 0
        self.game_over = False
        self.spawn_timer = 0
        self.powerup_timer = 0

    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_r and self.game_over:
                    self.reset_game()
        return True

    def spawn_obstacles(self):
        self.spawn_timer += 1
        if self.spawn_timer >= 60:
            self.spawn_timer = 0
            if random.random() < 0.3:
                obstacle = Obstacle()
                self.obstacles.add(obstacle)
                self.all_sprites.add(obstacle)

    def spawn_powerups(self):
        self.powerup_timer += 1
        if self.powerup_timer >= 180:
            self.powerup_timer = 0
            if random.random() < 0.5:
                powerup = PowerUp()
                self.powerups.add(powerup)
                self.all_sprites.add(powerup)

    def check_collisions(self):
        # Check powerup collisions
        powerup_hits = pygame.sprite.spritecollide(self.player, self.powerups, True)
        for powerup in powerup_hits:
            self.player.has_shield = True
            self.score += 50
            pygame.time.set_timer(pygame.USEREVENT, 5000)  # Shield duration

        if not self.player.has_shield:
            # Check enemy collision
            if pygame.sprite.collide_rect(self.player, self.enemy):
                self.game_over = True

            # Check obstacle collisions
            obstacle_hits = pygame.sprite.spritecollide(self.player, self.obstacles, False)
            if obstacle_hits:
                self.game_over = True

    def update(self):
        if not self.game_over:
            self.all_sprites.update()
            self.spawn_obstacles()
            self.spawn_powerups()
            self.check_collisions()
            self.score += 1

    def draw(self):
        self.screen.fill(BLACK)
        
        # Draw ground
        pygame.draw.rect(self.screen, GREEN, (0, WINDOW_HEIGHT - 60, WINDOW_WIDTH, 60))
        
        # Draw sprites
        self.all_sprites.draw(self.screen)
        
        # Draw shield effect
        if self.player.has_shield:
            pygame.draw.circle(self.screen, BLUE, 
                             self.player.rect.center, 
                             30, 2)
        
        # Draw score
        score_text = self.font.render(f'Score: {self.score}', True, WHITE)
        self.screen.blit(score_text, (10, 10))
        
        # Draw game over
        if self.game_over:
            game_over_text = self.font.render('Game Over! Press R to restart', True, WHITE)
            self.screen.blit(game_over_text, 
                           (WINDOW_WIDTH//2 - game_over_text.get_width()//2, 
                            WINDOW_HEIGHT//2))
        
        pygame.display.flip()

    def reset_game(self):
        self.all_sprites.empty()
        self.obstacles.empty()
        self.powerups.empty()
        self.player = Player()
        self.enemy = Enemy(self.player)
        self.all_sprites.add(self.player)
        self.all_sprites.add(self.enemy)
        self.score = 0
        self.game_over = False

    def run(self):
        running = True
        while running:
            running = self.handle_events()
            self.update()
            self.draw()
            self.clock.tick(FPS)

if __name__ == '__main__':
    game = Game()
    game.run()
    pygame.quit()
    sys.exit()