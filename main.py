import os
import time
import random
import threading
from threading import Thread
import sys
import platform

class Game:
    def __init__(self):
        self.player_pos = 5
        self.enemy_pos = 20
        self.obstacle_pos = []
        self.powerup_pos = []
        self.score = 0
        self.game_over = False
        self.has_shield = False
        self.width = 30
        self.difficulty = 1

    def clear_screen(self):
        os.system('clear' if platform.system() != 'Windows' else 'cls')

    def draw_game(self):
        game_view = [' ' for _ in range(self.width)]
        
        # Draw player
        if self.player_pos < self.width:
            game_view[self.player_pos] = 'P' if not self.has_shield else '@'
        
        # Draw enemy
        if self.enemy_pos < self.width:
            game_view[self.enemy_pos] = 'E'
        
        # Draw obstacles
        for pos in self.obstacle_pos:
            if pos < self.width:
                game_view[pos] = '#'
        
        # Draw powerups
        for pos in self.powerup_pos:
            if pos < self.width:
                game_view[pos] = '*'
        
        self.clear_screen()
        print('\n' * 2)
        print('Score:', self.score)
        print('Shield:', 'Active' if self.has_shield else 'Inactive')
        print('\n')
        print(''.join(game_view))
        print('-' * self.width)
        print('\nControls: A-Left, D-Right, Q-Quit')

    def move_player(self, direction):
        if direction == 'left' and self.player_pos > 0:
            self.player_pos -= 1
        elif direction == 'right' and self.player_pos < self.width - 1:
            self.player_pos += 1

    def update_enemy(self):
        if self.enemy_pos > self.player_pos:
            self.enemy_pos -= 1
        elif self.enemy_pos < self.player_pos:
            self.enemy_pos += 1

    def spawn_obstacle(self):
        if random.random() < 0.1 * self.difficulty:
            self.obstacle_pos.append(self.width - 1)

    def spawn_powerup(self):
        if random.random() < 0.05:
            self.powerup_pos.append(self.width - 1)

    def update_objects(self):
        # Update obstacles
        self.obstacle_pos = [pos - 1 for pos in self.obstacle_pos if pos > 0]
        
        # Update powerups
        self.powerup_pos = [pos - 1 for pos in self.powerup_pos if pos > 0]

    def check_collisions(self):
        # Check enemy collision
        if self.player_pos == self.enemy_pos and not self.has_shield:
            self.game_over = True
            return

        # Check obstacle collisions
        if self.player_pos in self.obstacle_pos and not self.has_shield:
            self.game_over = True
            return

        # Check powerup collisions
        if self.player_pos in self.powerup_pos:
            self.powerup_pos.remove(self.player_pos)
            self.has_shield = True
            threading.Timer(5.0, self.remove_shield).start()

    def remove_shield(self):
        self.has_shield = False

    def run(self):
        print("\nWelcome to Python Runner!")
        print("Avoid the enemy (E) and obstacles (#)")
        print("Collect powerups (*) for temporary shield (@)")
        input("Press Enter to start...")

        def get_input():
            while not self.game_over:
                try:
                    key = sys.stdin.read(1).lower()
                    if key == 'a':
                        self.move_player('left')
                    elif key == 'd':
                        self.move_player('right')
                    elif key == 'q':
                        self.game_over = True
                except:
                    pass

        input_thread = Thread(target=get_input)
        input_thread.daemon = True
        input_thread.start()

        while not self.game_over:
            self.score += 1
            self.difficulty = 1 + (self.score // 500) * 0.2
            
            self.update_enemy()
            self.spawn_obstacle()
            self.spawn_powerup()
            self.update_objects()
            self.check_collisions()
            self.draw_game()
            
            time.sleep(0.2)

        self.clear_screen()
        print(f"\nGame Over! Final Score: {self.score}")

if __name__ == "__main__":
    game = Game()
    game.run()