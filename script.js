window.addEventListener('load', () => {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1280;
    canvas.height = 720;

    ctx.fillStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';
    ctx.font = '40px Bangers';
    ctx.textAlign = 'center';

    class Player {
        constructor(game) {
            this.game = game;
            this.collisionX = this.game.width * 0.5;
            this.collisionY = this.game.height * 0.5;
            this.collisionRadius = 30;
            this.speedX = 0;
            this.speedY = 0;
            this.dx = 0;
            this.dy = 0;
            this.speedModifier = 5;
            this.spriteWidth = 255;
            this.spriteHeight = 256;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX;
            this.spriteY;
            this.frameX = 0;
            this.frameY = 5;
            this.image = document.getElementById('bull');
        }

        draw(context) {
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
                context.beginPath();
                context.moveTo(this.collisionX, this.collisionY);
                context.lineTo(this.game.mouse.x, this.game.mouse.y);
                context.stroke();
            }
        }

        update() {
            this.dx = this.game.mouse.x - this.collisionX;
            this.dy = this.game.mouse.y - this.collisionY;

            // Sprite animation
            const angle = Math.atan2(this.dy, this.dx);
            switch (true) {
              case angle < -2.74 || angle > 2.74:
                this.frameY = 6;
                break;
              case angle < -1.96:
                this.frameY = 7;
                break;
              case angle < -1.17:
                this.frameY = 0;
                break;
              case angle < -0.39:
                this.frameY = 1;
                break;
              case angle < 0.39:
                this.frameY = 2;
                break;
              case angle < 1.17:
                this.frameY = 3;
                break;
              case angle < 1.96:
                this.frameY = 4;
                break;
              case angle < 2.74:
                this.frameY = 5;
                break;
            }

            const distance = Math.hypot(this.dy, this.dx);
            if (distance > this.speedModifier) {
                this.speedX = this.dx / distance || 0;
                this.speedY = this.dy / distance || 0;
            } else {
                this.speedX = 0;
                this.speedY = 0;
            }
            this.collisionX += this.speedX * this.speedModifier;
            this.collisionY += this.speedY * this.speedModifier;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 80;

            // Horizontal boundaries
            if (this.collisionX < this.collisionRadius) {
                this.collisionX = this.collisionRadius;
            } else if (this.collisionX > this.game.width - this.collisionRadius) {
                this.collisionX = this.game.width - this.collisionRadius;
            }

            // Vertical boundaries
            if (this.collisionY < this.game.topMargin + this.collisionRadius) {
                this.collisionY = this.game.topMargin + this.collisionRadius;
            } else if (this.collisionY > this.game.height - this.collisionRadius) {
                this.collisionY = this.game.height - this.collisionRadius;
            }

            // Collisions with obstacles
            this.game.obstacles.forEach(obstacle => {
                let { isCollided, distance, sumOfRadii, dx, dy } = this.game.checkCollision(this, obstacle);

                if (isCollided) {
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;

                    this.collisionX = obstacle.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = obstacle.collisionY + (sumOfRadii + 1) * unit_y;
                }
            })
        }

        restart() {
            this.collisionX = this.game.width * 0.5;
            this.collisionY = this.game.height * 0.5;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 80;
        }
    }

    class Obstacle {
        constructor(game) {
            this.game = game;
            this.collisionX = Math.random() * this.game.width;
            this.collisionY = Math.random() * this.game.height;
            this.collisionRadius = 50;
            this.image = document.getElementById('obstacles');
            this.spriteWidth = 250;
            this.spriteHeight = 250;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 80;
            this.frameX = Math.floor(Math.random() * 4);
            this.frameY = Math.floor(Math.random() * 3);
        }

        draw(context) {
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
            }
        }

        update() {

        }
    }

    class Egg {
        constructor(game) {
            this.game = game;
            this.collisionRadius = 40;
            this.margin = this.collisionRadius * 2;
            this.collisionX = this.margin + (Math.random() * (this.game.width - this.margin * 2));
            this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin - this.margin));
            this.image = document.getElementById('egg');
            this.spriteWidth = 110;
            this.spriteHeight = 135;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX;
            this.spriteY;
            this.hatchTimer = 0;
            this.hatchInterval = 3000;
            this.markedForDeletion = false;
        }

        draw(context) {
            context.drawImage(this.image,this.spriteX, this.spriteY);
            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
                const displayTimer = (this.hatchTimer * 0.001).toFixed(0);
                context.fillText(displayTimer, this.collisionX, this.collisionY - this.collisionRadius * 3);
            }
        }

        update(deltaTime) {
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 40;

            // Collisions
            let collisionObjects = [this.game.player, ...this.game.obstacles, ...this.game.enemies];
            collisionObjects.forEach(object => {
                let { isCollided, distance, sumOfRadii, dx, dy } = this.game.checkCollision(this, object);

                if (isCollided) {
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
                }
            });

            // Hatching
            if (this.hatchTimer > this.hatchInterval || this.collisionY < this.game.topMargin) {
                this.game.hatchlings.push(new Larva(this.game, this.collisionX, this.collisionY));
                this.markedForDeletion = true;
                this.game.removeGameObjects();
            } else {
                this.hatchTimer += deltaTime;
            }
        }
    }

    class Larva {
        constructor(game, x, y) {
            this.game = game;
            this.collisionX = x;
            this.collisionY = y;
            this.collisionRadius = 30;
            this.image = document.getElementById('larva');
            this.spriteWidth = 150;
            this.spriteHeight = 150;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX;
            this.spriteY;
            this.speedY = 1 + Math.random();
            this.frameX = 0;
            this.frameY = Math.floor(Math.random() * 2);
        }

        draw(context) {
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
            }
        }

        update() {
            this.collisionY -= this.speedY;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 40;

            // Move to safety
            if (this.collisionY < this.game.topMargin) {
                this.markedForDeletion = true;
                this.game.removeGameObjects();
                if (!this.game.gameOver) this.game.score++;
                for (let i = 0; i < 3; i++) {
                    this.game.particles.push(new Firefly(this.game, this.collisionX, this.collisionY, 'yellow'));
                }
             }

            // Collision with objects
            let collisionObjects = [this.game.player, ...this.game.obstacles, ...this.game.eggs];
            collisionObjects.forEach(object => {
                let { isCollided, distance, sumOfRadii, dx, dy } = this.game.checkCollision(this, object);

                if (isCollided) {
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
                }
            });

            // Collision with enemies
            this.game.enemies.forEach(enemy => {
                if (this.game.checkCollision(this, enemy).isCollided && !this.game.gameOver) {
                    this.markedForDeletion = true;
                    this.game.removeGameObjects();
                    this.game.lostHatchlings++;
                    for (let i = 0; i < 3; i++) {
                        this.game.particles.push(new Spark(this.game, this.collisionX, this.collisionY, 'blue'));
                    }
                }
            });
        }
     }

    class Enemy {
        constructor(game) {
            this.game = game;
            this.collisionRadius = 30;
            this.speedX = Math.random() * 3 + 0.5;
            this.image = document.getElementById('toads');
            this.spriteWidth = 140;
            this.spriteHeight = 260;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.collisionX = this.game.width + this.width + Math.random() * this.game.width * 0.5;
            this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin));
            this.spriteX;
            this.spriteY;
            this.frameX = 0;
            this.frameY = Math.floor(Math.random() * 4);
        }

        draw(context) {
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
            }
        }

        update() {
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height + 40;
            this.collisionX -= this.speedX;
            if (this.spriteX + this.width < 0 && !this.game.gameOver) {
                this.collisionX = this.game.width + this.width + Math.random() * this.game.width * 0.5;
                this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin));
                this.frameY = Math.floor(Math.random() * 4);
            }
            let collisionObjects = [this.game.player, ...this.game.obstacles];
            collisionObjects.forEach(object => {
                let { isCollided, distance, sumOfRadii, dx, dy } = this.game.checkCollision(this, object);

                if (isCollided) {
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
                }
            });
        }
    }

    class Particle {
        constructor(game, x, y, color) {
            this.game = game;
            this.collisionX = x;
            this.collisionY = y;
            this.color = color;
            this.radius = Math.floor(Math.random() * 10 + 5);
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * 2 + 0.5;
            this.angle = 0;
            this.va = Math.random() * 0.1 + 0.01;
            this.markedForDeletion = false;
        }

        draw(context) {
            context.save();
            context.fillStyle = this.color;
            context.beginPath();
            context.arc(this.collisionX, this.collisionY, this.radius, 0, Math.PI * 2);
            context.fill();
            context.stroke();
            context.restore();
        }
    }

    class Firefly extends Particle {
        update() {
            this.angle += this.va;
            this.collisionX += Math.cos(this.angle) * this.speedX;
            this.collisionY -= this.speedY;
            if (this.collisionY < 0 - this.radius) {
                this.markedForDeletion = true;
                this.game.removeGameObjects();
            }
        }
    }

    class Spark extends Particle {
        update() {
            this.angle += this.va * 0.5;
            this.collisionX -= Math.cos(this.angle) * this.speedX;
            this.collisionY -= Math.sin(this.angle) * this.speedY;
            if (this.radius > 0.1) {
                this.radius -= 0.05;
            }
            if (this.radius < 0.2) {
                this.markedForDeletion = true;
                this.game.removeGameObjects();
            }
        }
    }

    class Game {
        constructor(canvas) {
            this.canvas = canvas;
            this.width = canvas.width;
            this.height = canvas.height;
            this.topMargin = 260;
            this.debug = false;
            this.player = new Player(this);
            this.FPS = 70;
            this.timer = 0;
            this.interval = 1000 / this.FPS;
            this.eggTimer = 0;
            this.eggInterval = 500;
            this.numberOfObstacles = 5;
            this.maxNumberOfEggs = 10;
            this.obstacles = [];
            this.eggs = [];
            this.enemies = [];
            this.hatchlings = [];
            this.particles = [];
            this.gameObjects = [];
            this.score = 0;
            this.winningScore = 10;
            this.gameOver = false;
            this.lostHatchlings = 0;
            this.mouse = {
                x: this.width * 0.5,
                y: this.height * 0.5,
                pressed: false
            };

            canvas.addEventListener('mousedown', (e) => {
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
                this.mouse.pressed = true;
            });

            canvas.addEventListener('mouseup', (e) => {
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
                this.mouse.pressed = false;
            });

            canvas.addEventListener('mousemove', (e) => {
                if (this.mouse.pressed) {
                    this.mouse.x = e.offsetX;
                    this.mouse.y = e.offsetY;
                }
            });

            window.addEventListener('keydown', (e) => {
                if (e.key == 'd') {
                    this.debug = !this.debug;
                } else if (e.key == 'r') {
                    this.restart();
                }
            });
        }

        render(context, deltaTime) {
            if (this.timer > this.interval) {
                context.clearRect(0, 0, this.width, this.height);
                this.gameObjects = [ ...this.eggs, ...this.obstacles, ...this.enemies,, ...this.hatchlings, ...this.particles, this.player ];
                // Sort by vertical position
                this.gameObjects.sort((a, b) => {
                    return a.collisionY - b.collisionY;
                });
                this.gameObjects.forEach(object => {
                    object.draw(context);
                    object.update(deltaTime);
                });
                this.timer = 0;
            }
            this.timer += deltaTime;

            // Add eggs periodically
            if (this.eggTimer > this.eggInterval && this.eggs.length < this.maxNumberOfEggs && !this.gameOver) {
                this.addEgg();
                this.eggTimer = 0;
            } else {
                this.eggTimer += deltaTime;
            }

            // Draw status text
            context.save();
            context.textAlign = 'left';
            context.fillText('Score: ' + this.score, 25, 50);
            if (this.debug) {
                context.fillText('Lost: ' + this.lostHatchlings, 25, 100);
            }
            context.restore();

            // Win/Lose message
            if (this.score >= this.winningScore) {
                this.gameOver = true;
                context.save();
                context.fillStyle = 'rgba(0, 0, 0, 0.5)';
                context.fillRect(0, 0, this.width, this.height);
                context.fillStyle = 'white';
                context.textAlign = 'center';
                context.shadowOffsetX = 4;
                context.shadowOffsetY = 4;
                context.shadowColor = 'black';
                let messageOne;
                let messageTwo;
                if (this.lostHatchlings <= 5) {
                    messageOne = 'Bullseye!';
                    messageTwo = 'You bullied the bullies!';
                } else {
                    messageOne = 'Bullocks!';
                    messageTwo = 'You lost ' + this.lostHatchlings + ' hatchlings, don\'t be a pushover!';
                }
                context.font = '130px Bangers';
                context.fillText(messageOne, this.width * 0.5, this.height * 0.5 - 20);
                context.font = '40px Bangers';
                context.fillText(messageTwo, this.width * 0.5, this.height * 0.5 + 50);
                context.fillText('Final score: ' + this.score + '. Press \'R\' to butt heads again!', this.width * 0.5, this.height * 0.5 + 100);
                context.restore();
            }
        }

        checkCollision(a, b) {
            const dx = a.collisionX - b.collisionX;
            const dy = a.collisionY - b.collisionY;
            const distance = Math.hypot(dy, dx);
            const sumOfRadii = a.collisionRadius + b.collisionRadius;
            return {
                isCollided: (distance < sumOfRadii),
                distance: distance,
                sumOfRadii: sumOfRadii,
                dx: dx,
                dy: dy
            };
        }

        addEgg() {
            this.eggs.push(new Egg(this));
        }

        addEnemy() {
            this.enemies.push(new Enemy(this));
        }

        removeGameObjects() {
            this.eggs = this.eggs.filter(object => !object.markedForDeletion);
            this.hatchlings = this.hatchlings.filter(object => !object.markedForDeletion);
            this.particles = this.particles.filter(object => !object.markedForDeletion);
        }

        init() {
            let attempts = 0;
            for (let i = 0; i < 5; i++) {
                this.addEnemy();
            }
            while (this.obstacles.length < this.numberOfObstacles && attempts < 500) {
                let testObstacle = new Obstacle(this);
                let overlap = false;
                this.obstacles.forEach(obstacle => {
                    const dx = testObstacle.collisionX - obstacle.collisionX;
                    const dy = testObstacle.collisionY - obstacle.collisionY;
                    const distance = Math.hypot(dy, dx);
                    const distanceBuffer = 100;
                    const sumOfRadii = testObstacle.collisionRadius + obstacle.collisionRadius + distanceBuffer;
                    
                    if (distance < sumOfRadii) {
                        overlap = true;
                    }

                });

                const margin = testObstacle.collisionRadius * 2;

                if (!overlap && testObstacle.spriteX > 0 && testObstacle.spriteX < this.width - testObstacle.width && testObstacle.collisionY > this.topMargin + margin && testObstacle.collisionY < this.height - margin) {
                    this.obstacles.push(testObstacle);
                }

                attempts++;
            }
        }

        restart() {
            this.player.restart();
            this.obstacles = [];
            this.eggs = [];
            this.enemies = [];
            this.hatchlings = [];
            this.particles = [];
            this.mouse = {
                x: this.width * 0.5,
                y: this.height* 0.5,
                pressed: false
            };
            this.score = 0;
            this.lostHatchlings = 0;
            this.gameOver = false;
            this.init();
        }
    }

    const game = new Game(canvas);
    game.init();

    let lastTime = 0;
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        
        game.render(ctx, deltaTime);
        requestAnimationFrame(animate);
    }
    
    animate(0);
});