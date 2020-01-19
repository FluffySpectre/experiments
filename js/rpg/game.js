class Game {
    constructor() {
        this.world = new World();
    }

    update() {
        this.world.update();
    }
}

class Animator {
    constructor(frameSet, delay, mode = 'loop') {
        this.count = 0;
        this.delay = (delay >= 1) ? delay : 1;
        this.frameSet = frameSet;
        this.frameIndex = 0;
        this.frameValue = frameSet[0];
        this.mode = mode;
    }

    animate() {
        if (this.mode === 'loop') {
            this.loop();
        } else if (this.mode === 'once') {
            this.once();
        }
    }

    changeFrameSet(frameSet, mode, delay = 10, frameIndex = 0) {
        if (this.frameSet === frameSet) return;

        this.count = 0;
        this.delay = delay;
        this.frameSet = frameSet;
        this.frameIndex = frameIndex;
        this.frameValue = frameSet[frameIndex];
        this.mode = mode;
    }

    loop() {
        this.count++;

        while (this.count > this.delay) {
            this.count -= this.delay;
            this.frameIndex = (this.frameIndex < this.frameSet.length - 1) ? this.frameIndex + 1 : 0;
            this.frameValue = this.frameSet[this.frameIndex];
        }
    }

    once() {
        this.count++;

        while (this.count > this.delay) {
            this.count -= this.delay;

            if (this.frameIndex < this.frameSet.length - 1) {
                this.frameIndex++;
                this.frameValue = this.frameSet[this.frameIndex];
            } else {
                break;
            }
        }
    }
}

class Collider {
    constructor() { }

    collide(object, tileX, tileY, tileSize) {
        if (this.collideTop(object, tileY)) return;
        if (this.collideBottom(object, tileY + tileSize)) return;
        if (this.collideLeft(object, tileX)) return;
        this.collideRight(object, tileX + tileSize);
    }

    collideBottom(object, tileBottom) {
        if (object.getTop() < tileBottom && object.getOldTop() >= tileBottom) {
            object.setTop(tileBottom);
            object.velocityY = 0;
            return true;
        }
        return false;
    }

    collideLeft(object, tileLeft) {
        if (object.getRight() > tileLeft && object.getOldRight() <= tileLeft) {
            object.setRight(tileLeft - 0.01);
            object.velocityX = 0;
            return true;
        }
        return false;
    }

    collideRight(object, tileRight) {
        if (object.getLeft() < tileRight && object.getOldLeft() >= tileRight) {
            object.setLeft(tileRight);
            object.velocityX = 0;
            return true;
        }
        return false;
    }

    collideTop(object, tileTop) {
        if (object.getBottom() > tileTop && object.getOldBottom() <= tileTop) {
            object.setBottom(tileTop - 0.01);
            object.velocityY = 0;
            object.jumping = false;
            return true;
        }
        return false;
    }
}

class Frame {
    constructor(x, y, width, height, offsetX = 0, offsetY = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }
}

class GameObject {
    constructor(x, y, width, height) {
        this.height = height;
        this.width = width;
        this.x = x;
        this.y = y;
    }

    collideObject(object) {
        if (this.getRight() < object.getLeft() ||
            this.getBottom() < object.getTop() ||
            this.getLeft() > object.getRight() ||
            this.getTop() > object.getBottom()) return false;

        return true;
    }

    collideObjectCenter(object) {
        let centerX = object.getCenterX();
        let centerY = object.getCenterY();

        if (centerX < this.getLeft() || centerX > this.getRight() ||
            centerY < this.getTop() || centerY > this.getBottom()) return false;

        return true;
    }

    getBottom() { return this.y + this.height; }
    getCenterX() { return this.x + this.width * 0.5; }
    getCenterY() { return this.y + this.height * 0.5; }
    getLeft() { return this.x; }
    getRight() { return this.x + this.width; }
    getTop() { return this.y; }
    setBottom(y) { this.y = y - this.height; }
    setCenterX(x) { this.x = x - this.width * 0.5; }
    setCenterY(y) { this.y = y - this.height * 0.5; }
    setLeft(x) { this.x = x; }
    setRight(x) { this.x = x - this.width; }
    setTop(y) { this.y = y; }
}

class MovingObject extends GameObject {
    constructor(x, y, width, height, velocityMax = 15) {
        super(x, y, width, height);

        this.jumping = false;
        this.velocityMax = velocityMax; // added velocityMax so velocity can't go past 16
        this.velocityX = 0;
        this.velocityY = 0;
        this.xOld = x;
        this.yOld = y;
    }

    getOldBottom() { return this.yOld + this.height; }
    getOldCenterX() { return this.xOld + this.width * 0.5; }
    getOldCenterY() { return this.yOld + this.height * 0.5; }
    getOldLeft() { return this.xOld; }
    getOldRight() { return this.xOld + this.width; }
    getOldTop() { return this.yOld; }
    setOldBottom(y) { this.yOld = y - this.height; }
    setOldCenterX(x) { this.xOld = x - this.width * 0.5; }
    setOldCenterY(y) { this.yOld = y - this.height * 0.5; }
    setOldLeft(x) { this.xOld = x; }
    setOldRight(x) { this.xOld = x - this.width; }
    setOldTop(y) { this.yOld = y; }
}

class Carrot extends GameObject {
    constructor(x, y) {
        super(x, y, 7, 14);

        this.animator = new Animator([12, 13], 15);
        this.frameIndex = Math.floor(Math.random() * 2);
        this.baseY = y;
        this.positionY = Math.random() * Math.PI * 2 * 2;
    }

    updatePosition() {
        this.positionY += 0.2;
        this.y = this.baseY + Math.sin(this.positionY);
    }

    animate() {
        this.animator.animate();
    }
}

class Door extends GameObject {
    constructor(door) {
        super(door.x, door.y, door.width, door.height);

        this.destinationX = door.destinationX;
        this.destinationY = door.destinationY;
        this.destinationZone = door.destinationZone;
    }
}

class Player extends MovingObject {
    constructor(x, y) {
        super(x, y, 8, 16);

        this.frameSets = {
            'idle-down': [0],
            'idle-left': [1],
            'idle-right': [2],
            'idle-up': [3],
            'move-down': [4, 5, 6],
            'move-left': [7, 8, 9],
            'move-right': [10, 11, 12],
            'move-up': [13, 14, 15],
            'dead': [52],
        };

        this.animator = new Animator(this.frameSets['idle-down'], 5);
        this.attacking = false;
        this.interacting = false;
        this.direction = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.impactForce = 5;
        this.damage = 10;
        this.health = 100;

        this.interactionRect = new GameObject(x, y, 16, 16);
    }

    moveDown() {
        this.direction = 0;
        this.velocityY += 0.6;
    }

    moveLeft() {
        this.direction = 1;
        this.velocityX -= 0.6;
    }

    moveRight() {
        this.direction = 2;
        this.velocityX += 0.6;
    }

    moveUp() {
        this.direction = 3;
        this.velocityY -= 0.6;
    }

    attack() {
        this.attacking = true;
        this.interacting = true;

        // if (!this.attacking) {
        //     this.attacking = true;
        //     const keys = Object.keys(this.frameSets);
        //     this.animator.changeFrameSet(this.frameSets[keys[8 + this.direction]], 'once', 3);
        // }
    }

    takeDamage(damage, direction) {
        this.velocityX += -direction.x * this.impactForce;
        this.velocityY += -direction.y * this.impactForce;
        this.health -= damage;
        if (this.health < 0) this.health = 0;
    }

    updateAnimation() {
        if (this.health > 0) {
            // if (this.attacking && this.animator.frameIndex <= 3) {
                // if (this.animator.frameIndex === 3)
                //    this.attacking = false;
            // } else {
                if (this.direction === 1) {
                    if (this.velocityX < -0.1) this.animator.changeFrameSet(this.frameSets['move-left'], 'loop', 4);
                    else this.animator.changeFrameSet(this.frameSets['idle-left'], 'pause');

                } else if (this.direction === 2) {
                    if (this.velocityX > 0.1) this.animator.changeFrameSet(this.frameSets['move-right'], 'loop', 4);
                    else this.animator.changeFrameSet(this.frameSets['idle-right'], 'pause');

                } else if (this.direction === 3) {
                    if (this.velocityY < -0.1) this.animator.changeFrameSet(this.frameSets['move-up'], 'loop', 4);
                    else this.animator.changeFrameSet(this.frameSets['idle-up'], 'pause');

                } else if (this.direction === 0) {
                    if (this.velocityY > 0.1) this.animator.changeFrameSet(this.frameSets['move-down'], 'loop', 4);
                    else this.animator.changeFrameSet(this.frameSets['idle-down'], 'pause');
                }
            // }
        } else {
            this.animator.changeFrameSet(this.frameSets['dead'], 'pause');
        }

        this.animator.animate();
    }

    updatePosition(gravity, friction) {
        if (this.health <= 0) return;

        this.xOld = this.x;
        this.yOld = this.y;

        this.velocityY *= friction;
        this.velocityX *= friction;

        if (Math.abs(this.velocityX) > this.velocityMax)
            this.velocityX = this.velocityMax * Math.sign(this.velocityX);

        if (Math.abs(this.velocityY) > this.velocityMax)
            this.velocityY = this.velocityMax * Math.sign(this.velocityY);

        this.x += this.velocityX;
        this.y += this.velocityY;
    }

    updateInteraction(entities, enemies) {
        if (this.health <= 0) return;

        // update interaction rectangle position
        if (this.direction === 0) {
            this.interactionRect.x = this.x - this.interactionRect.width / 4;
            this.interactionRect.y = this.y + 16;
        } else if (this.direction === 1) {
            this.interactionRect.y = this.y;
            this.interactionRect.x = this.x - this.interactionRect.width;
        } else if (this.direction === 2) {
            this.interactionRect.y = this.y;
            this.interactionRect.x = this.x + this.interactionRect.width / 2;
        } else if (this.direction === 3) {
            this.interactionRect.x = this.x - this.interactionRect.width / 4;
            this.interactionRect.y = this.y - this.interactionRect.height;
        }

        // check for interaction
        if (this.interacting) {
            this.interacting = false;
            for (let entity of entities) {
                if (typeof entity.interact === 'function' && this.interactionRect.collideObject(entity)) {
                    entity.interact(this);
                }
            }

            for (let enemy of enemies) {
                if (this.interactionRect.collideObject(enemy)) {
                    const a = (this.x + this.width / 2) - (enemy.x + enemy.width / 2);
                    const b = (this.y + this.height / 2) - (enemy.y + enemy.height / 2);
                    const distanceToPlayer = Math.sqrt(a * a + b * b);
                    enemy.takeDamage(this.damage, { x: a / distanceToPlayer, y: b / distanceToPlayer });
                }
            }
        }
    }
}

// TODO: implement this properly
class Enemy extends MovingObject {
    constructor(x, y) {
        super(x, y, 10, 16);

        this.frameSets = {
            'idle-down': [28, 29],
            'idle-left': [31, 32],
            'idle-right': [34, 35],
            'idle-up': [37, 38],
            'move-down': [27, 28],
            'move-left': [30, 31],
            'move-right': [33, 34],
            'move-up': [36, 37],
            'dead': [51],
        };

        this.animator = new Animator(this.frameSets['move-down'], 5);
        this.attackRadius = 18;
        this.attentionRadius = 50;
        this.velocityMax = 1;
        this.direction = 0;
        this.attackDelay = 0.5;
        this.attackCounter = 0;
        this.health = 100;
        this.damage = 10;
        this.impactForce = 5;
        this.tookDamage = false;
        this.damageDirection = null;
    }

    takeDamage(damage, direction) {
        this.damageDirection = direction;
        this.tookDamage = true;
        this.health -= damage;
        if (this.health < 0) this.health = 0;
    }

    updateAnimation() {
        if (this.health > 0) {
            if (this.velocityX < -0.1) { this.animator.changeFrameSet(this.frameSets['move-left'], 'loop', 5); this.direction = 1; }
            else if (this.velocityX > 0.1) { this.animator.changeFrameSet(this.frameSets['move-right'], 'loop', 5); this.direction = 2; }
            else if (this.velocityY < -0.1) { this.animator.changeFrameSet(this.frameSets['move-up'], 'loop', 5); this.direction = 3; }
            else if (this.velocityY > 0.1) { this.animator.changeFrameSet(this.frameSets['move-down'], 'loop', 5); this.direction = 0; }
            else this.animator.changeFrameSet(this.frameSets[Object.keys(this.frameSets)[this.direction]], 'loop', 5);    
        } else {
            this.animator.changeFrameSet(this.frameSets['dead'], 'pause');
        }
        
        this.animator.animate();
    }

    updatePosition(player, friction) {
        if (this.health <= 0) return;

        this.xOld = this.x;
        this.yOld = this.y;

        // check proximity to the player
        const a = (this.x + this.width / 2) - (player.x + player.width / 2);
        const b = (this.y + this.height / 2) - (player.y + player.height / 2);
        const distanceToPlayer = Math.sqrt(a * a + b * b);
        if (distanceToPlayer < this.attentionRadius) {
            if (distanceToPlayer < this.attackRadius) {
                // if we are within the attack radius, attack the player
                this.attackCounter += 0.05;
                if (this.attackCounter > this.attackDelay) {
                    this.attackCounter = 0;
                    player.takeDamage(this.damage, { x: a / distanceToPlayer, y: b / distanceToPlayer });
                }

            } else {
                // if we further away than the attack radius, move towards the player
                this.velocityX += 1 * Math.sign(player.x - this.x);
                this.velocityY += 1 * Math.sign(player.y - this.y);
                
                if (Math.abs(this.velocityX) > this.velocityMax)
                    this.velocityX = this.velocityMax * Math.sign(this.velocityX);

                if (Math.abs(this.velocityY) > this.velocityMax)
                    this.velocityY = this.velocityMax * Math.sign(this.velocityY);

                if (Math.abs(player.x - this.x) < 1) this.velocityX = 0;
                if (Math.abs(player.y - this.y) < 1) this.velocityY = 0;

                this.attackCounter = 0;
            }
        } else {
            this.attackCounter = 0;
        }

        if (this.tookDamage) {
            this.tookDamage = false;
            this.velocityX += -this.damageDirection.x * this.impactForce;
            this.velocityY += -this.damageDirection.y * this.impactForce;
        }

        this.x += this.velocityX;
        this.y += this.velocityY;

        this.velocityY *= friction;
        this.velocityX *= friction;
    }
}

class Switch extends GameObject {
    constructor(x, y, frames) {
        super(x, y, 16, 8);

        this.frameSets = {
            'off': [frames[0]],
            'on': [frames[1]],
        };

        this.on = false;
        this.animator = new Animator(this.frameSets['off'], 0, 'pause');
    }

    interact(user) {
        this.on = !this.on;
    }

    update() {
        this.updateAnimation();
    }

    updateAnimation() {
        if (this.on) this.animator.changeFrameSet(this.frameSets['on'], 'pause');
        else this.animator.changeFrameSet(this.frameSets['off'], 'pause');
    }
}

class Chest extends GameObject {
    constructor(x, y) {
        super(x, y, 16, 16);

        this.frameSets = {
            'closed': [26],
            'open': [25],
        };

        this.open = false;
        this.animator = new Animator(this.frameSets['closed'], 0, 'pause');
    }

    interact(user) {
        this.open = !this.open;
    }

    update() {
        this.updateAnimation();
    }

    updateAnimation() {
        if (this.open) this.animator.changeFrameSet(this.frameSets['open'], 'pause');
        else this.animator.changeFrameSet(this.frameSets['closed'], 'pause');
    }
}

class SimpleAnimated extends GameObject {
    constructor(x, y, frames, delay) {
        super(x, y, 16, 16);

        this.animator = new Animator(frames, delay, 'loop');
    }

    update() {
        this.animator.animate();
    }
}

class TileSet {
    constructor(columns, tileSize) {
        this.columns = columns;
        this.tileSize = tileSize;

        this.frames = [
            new Frame(64, 0, 16, 16, 0, 0), // idle-down
            new Frame(64, 16, 16, 16, 0, 0), // idle-left
            new Frame(64, 32, 16, 16, 0, 0), // idle-right
            new Frame(64, 48, 16, 16, 0, 0), // idle-up
            new Frame(48, 0, 16, 16, 0, 0), new Frame(64, 0, 16, 16, 0, 0), new Frame(80, 0, 16, 16, 0, 0), // move-down
            new Frame(48, 16, 16, 16, 0, 0), new Frame(64, 16, 16, 16, 0, 0), new Frame(80, 16, 16, 16, 0, 0), // move-left
            new Frame(48, 32, 16, 16, 0, 0), new Frame(64, 32, 16, 16, 0, 0), new Frame(80, 32, 16, 16, 0, 0), // move-right
            new Frame(48, 48, 16, 16, 0, 0), new Frame(64, 48, 16, 16, 0, 0), new Frame(80, 48, 16, 16, 0, 0), // move-up
            new Frame(48, 64, 16, 16, 0, 0), new Frame(64, 64, 16, 16, 0, 0), new Frame(80, 64, 16, 16, 0, 0), // enemy-down
            new Frame(0, 160, 16, 16, 0, 0), new Frame(16, 160, 16, 16, 0, 0), new Frame(32, 160, 16, 16, 0, 0), // torch-fire
            new Frame(0, 176, 16, 16, 0, 0), new Frame(16, 176, 16, 16, 0, 0), new Frame(32, 176, 16, 16, 0, 0), // switch
            new Frame(48, 176, 16, 16, 0, 0), new Frame(64, 176, 16, 16, 0, 0), // chest
            new Frame(96, 64, 16, 16, 0, 0), new Frame(112, 64, 16, 16, 0, 0), new Frame(128, 64, 16, 16, 0, 0), // ghost-down
            new Frame(96, 80, 16, 16, 0, 0), new Frame(112, 80, 16, 16, 0, 0), new Frame(128, 80, 16, 16, 0, 0), // ghost-left
            new Frame(96, 96, 16, 16, 0, 0), new Frame(112, 96, 16, 16, 0, 0), new Frame(128, 96, 16, 16, 0, 0), // ghost-right
            new Frame(96, 112, 16, 16, 0, 0), new Frame(112, 112, 16, 16, 0, 0), new Frame(128, 112, 16, 16, 0, 0), // ghost-up
            new Frame(96+48, 64-64, 16, 16, 0, 0), new Frame(112+48, 64-64, 16, 16, 0, 0), new Frame(128+48, 64-64, 16, 16, 0, 0), // skeleton-down
            new Frame(96+48, 80-64, 16, 16, 0, 0), new Frame(112+48, 80-64, 16, 16, 0, 0), new Frame(128+48, 80-64, 16, 16, 0, 0), // skeleton-left
            new Frame(96+48, 96-64, 16, 16, 0, 0), new Frame(112+48, 96-64, 16, 16, 0, 0), new Frame(128+48, 96-64, 16, 16, 0, 0), // skeleton-right
            new Frame(96+48, 112-64, 16, 16, 0, 0), new Frame(112+48, 112-64, 16, 16, 0, 0), new Frame(128+48, 112-64, 16, 16, 0, 0), // skeleton-up
            new Frame(144, 144, 16, 16, 0, 0), // ghost-dead
            new Frame(160, 144, 16, 16, 0, 0), // player-dead
        ];
    }
}

class World {
    constructor(friction = 0.7, gravity = 2) {
        this.collider = new Collider();

        this.friction = friction;
        this.gravity = gravity;

        this.columns = 19;
        this.rows = 15;

        this.tileSet = new TileSet(12, 16);
        this.player = new Player(64, 128);

        this.zoneId = '00';

        this.doors = [];
        this.door = null;
        this.enemies = [];

        this.height = this.tileSet.tileSize * this.rows;
        this.width = this.tileSet.tileSize * this.columns;
    }

    collideObject(object) {
        let bottom, left, right, top, value;

        top = Math.floor(object.getTop() / this.tileSet.tileSize);
        left = Math.floor(object.getLeft() / this.tileSet.tileSize);
        value = this.collisionMap[top * this.columns + left];
        if (value > 0)
            this.collider.collide(object, left * this.tileSet.tileSize, top * this.tileSet.tileSize, this.tileSet.tileSize);

        top = Math.floor(object.getTop() / this.tileSet.tileSize);
        right = Math.floor(object.getRight() / this.tileSet.tileSize);
        value = this.collisionMap[top * this.columns + right];
        if (value > 0)
            this.collider.collide(object, right * this.tileSet.tileSize, top * this.tileSet.tileSize, this.tileSet.tileSize);

        bottom = Math.floor(object.getBottom() / this.tileSet.tileSize);
        left = Math.floor(object.getLeft() / this.tileSet.tileSize);
        value = this.collisionMap[bottom * this.columns + left];
        if (value > 0)
            this.collider.collide(object, left * this.tileSet.tileSize, bottom * this.tileSet.tileSize, this.tileSet.tileSize);

        bottom = Math.floor(object.getBottom() / this.tileSet.tileSize);
        right = Math.floor(object.getRight() / this.tileSet.tileSize);
        value = this.collisionMap[bottom * this.columns + right];
        if (value > 0)
            this.collider.collide(object, right * this.tileSet.tileSize, bottom * this.tileSet.tileSize, this.tileSet.tileSize);
    }

    setup(zone) {
        this.doors = [];
        this.enemies = [];
        this.entities = [];
        this.collisionMap = zone.collisionMap;
        this.floorMap = zone.floorMap;
        this.columns = zone.columns;
        this.rows = zone.rows;
        this.zoneId = zone.id;

        for (let entity of zone.entities) {
            if (entity.type === 'switch')
                this.entities.push(new Switch(entity.x * this.tileSet.tileSize, entity.y * this.tileSet.tileSize, [22, 24]));
            else if (entity.type === 'torch')
                this.entities.push(new SimpleAnimated(entity.x * this.tileSet.tileSize, entity.y * this.tileSet.tileSize, [19, 20, 21], 6));
            else if (entity.type === 'chest')
                this.entities.push(new Chest(entity.x * this.tileSet.tileSize, entity.y * this.tileSet.tileSize));
        }

        for (let door of zone.doors) {
            this.doors.push(new Door(door));
        }

        for (let enemy of zone.enemies) {
            this.enemies.push(new Enemy(enemy[0] * this.tileSet.tileSize, enemy[1] * this.tileSet.tileSize + 12));
        }

        if (this.door) {
            if (this.door.destinationX != -1) {
                this.player.setCenterX(this.door.destinationX);
                this.player.setOldCenterX(this.door.destinationX); // it's important to reset the old position as well
            }

            if (this.door.destinationY != -1) {
                this.player.setCenterY(this.door.destinationY);
                this.player.setOldCenterY(this.door.destinationY);
            }

            this.door = null; // make sure to reset this.door so we don't trigger a zone load again
        }
    }

    update() {
        this.player.updatePosition(this.gravity, this.friction);
        this.player.updateInteraction(this.entities, this.enemies);

        this.collideObject(this.player);

        for (let door of this.doors) {
            if (door.collideObjectCenter(this.player)) {
                this.door = door;
            }
        }

        for (let enemy of this.enemies) {
            this.collideObject(enemy);
            enemy.updatePosition(this.player, this.friction);
            enemy.updateAnimation();
        }

        for (let entity of this.entities) {
            entity.update();
        }

        this.player.updateAnimation();

        // cleanup entities
        //this.enemies = this.enemies.filter(e => e.health > 0);
    }
}