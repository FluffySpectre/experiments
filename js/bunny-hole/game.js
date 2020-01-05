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
}

class Collider {
    constructor() { }

    collide(value, object, tileX, tileY, tileSize) {
        switch (value) {
            case 1: this.collidePlatformTop(object, tileY); break;
            case 2: this.collidePlatformRight(object, tileX + tileSize); break;
            case 3: if (this.collidePlatformTop(object, tileY)) return;
                this.collidePlatformRight(object, tileX + tileSize); break;
            case 4: this.collidePlatformBottom(object, tileY + tileSize); break;
            case 5: if (this.collidePlatformTop(object, tileY)) return;
                this.collidePlatformBottom(object, tileY + tileSize); break;
            case 6: if (this.collidePlatformRight(object, tileX + tileSize)) return;
                this.collidePlatformBottom(object, tileY + tileSize); break;
            case 7: if (this.collidePlatformTop(object, tileY)) return;
                if (this.collidePlatformBottom(object, tileY + tileSize)) return;
                this.collidePlatformRight(object, tileX + tileSize); break;
            case 8: this.collidePlatformLeft(object, tileX); break;
            case 9: if (this.collidePlatformTop(object, tileY)) return;
                this.collidePlatformLeft(object, tileX); break;
            case 10: if (this.collidePlatformLeft(object, tileX)) return;
                this.collidePlatformRight(object, tileX + tileSize); break;
            case 11: if (this.collidePlatformTop(object, tileY)) return;
                if (this.collidePlatformLeft(object, tileX)) return;
                this.collidePlatformRight(object, tileX + tileSize); break;
            case 12: if (this.collidePlatformBottom(object, tileY + tileSize)) return;
                this.collidePlatformLeft(object, tileX); break;
            case 13: if (this.collidePlatformTop(object, tileY)) return;
                if (this.collidePlatformBottom(object, tileY + tileSize)) return;
                this.collidePlatformLeft(object, tileX); break;
            case 14: if (this.collidePlatformBottom(object, tileY + tileSize)) return;
                if (this.collidePlatformLeft(object, tileX)) return;
                this.collidePlatformRight(object, tileX + tileSize); break;
            case 15: if (this.collidePlatformTop(object, tileY)) return;
                if (this.collidePlatformBottom(object, tileY + tileSize)) return;
                if (this.collidePlatformLeft(object, tileX)) return;
                this.collidePlatformRight(object, tileX + tileSize); break;
        }
    }

    collidePlatformBottom(object, tileBottom) {
        if (object.getTop() < tileBottom && object.getOldTop() >= tileBottom) {
            object.setTop(tileBottom);
            object.velocityY = 0;
            return true;
        }
        return false;
    }

    collidePlatformLeft(object, tileLeft) {
        if (object.getRight() > tileLeft && object.getOldRight() <= tileLeft) {
            object.setRight(tileLeft - 0.01);
            object.velocityX = 0;
            return true;
        }
        return false;
    }

    collidePlatformRight(object, tileRight) {
        if (object.getLeft() < tileRight && object.getOldLeft() >= tileRight) {
            object.setLeft(tileRight);
            object.velocityX = 0;
            return true;
        }
        return false;
    }

    collidePlatformTop(object, tileTop) {
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

class Grass {
    constructor(x, y) {
        this.animator = new Animator([14, 15, 16, 15], 25);
        this.x = x;
        this.y = y;
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
        super(x, y, 7, 12);

        this.frameSets = {
            'idle-left': [0],
            'jump-left': [1],
            'move-left': [2, 3, 4, 5],
            'idle-right': [6],
            'jump-right': [7],
            'move-right': [8, 9, 10, 11]
        };

        this.animator = new Animator(this.frameSets['idle-right'], 10);
        this.jumping = true;
        this.directionX = 1;
        this.velocityX = 0;
        this.velocityY = 0;
    }

    jump() {
        // you can only jump if you aren't falling faster than 10px per frame
        if (!this.jumping && this.velocityY < 10) {
            this.jumping = true;
            this.velocityY -= 13;
        }
    }

    moveLeft() {
        this.directionX = -1;
        this.velocityX -= 0.55;
    }

    moveRight() {
        this.directionX = 1;
        this.velocityX += 0.55;
    }

    updateAnimation() {
        if (this.velocityY < 0) {
            if (this.directionX < 0) this.animator.changeFrameSet(this.frameSets['jump-left'], 'pause');
            else this.animator.changeFrameSet(this.frameSets['jump-right'], 'pause');

        } else if (this.directionX < 0) {
            if (this.velocityX < -0.1) this.animator.changeFrameSet(this.frameSets['move-left'], 'loop', 5);
            else this.animator.changeFrameSet(this.frameSets['idle-left'], 'pause');

        } else if (this.directionX > 0) {
            if (this.velocityX > 0.1) this.animator.changeFrameSet(this.frameSets['move-right'], 'loop', 5);
            else this.animator.changeFrameSet(this.frameSets['idle-right'], 'pause');
        }

        this.animator.animate();
    }

    updatePosition(gravity, friction) {
        this.xOld = this.x;
        this.yOld = this.y;

        this.velocityY += gravity;
        this.velocityX *= friction;

        if (Math.abs(this.velocityX) > this.velocityMax)
            this.velocityX = this.velocityMax * Math.sign(this.velocityX);

        if (Math.abs(this.velocityY) > this.velocityMax)
            this.velocityY = this.velocityMax * Math.sign(this.velocityY);

        this.x += this.velocityX;
        this.y += this.velocityY;
    }
}

// TODO: implement this properly
class Enemy extends MovingObject {
    constructor(x, y) {
        super(x, y, 7, 12);
    }

    update() {
        // TODO: implement direction change, if it collides with something
    }

    updatePosition() {
        this.xOld = this.x;
        this.yOld = this.y;

        this.velocityY += gravity;
        this.velocityX *= friction;

        if (Math.abs(this.velocityX) > this.velocityMax)
            this.velocityX = this.velocityMax * Math.sign(this.velocityX);

        if (Math.abs(this.velocityY) > this.velocityMax)
            this.velocityY = this.velocityMax * Math.sign(this.velocityY);

        this.x += this.velocityX;
        this.y += this.velocityY;
    }
}

class TileSet {
    constructor(columns, tileSize) {
        this.columns = columns;
        this.tileSize = tileSize;

        this.frames = [
            new Frame(115, 96, 13, 16, 0, -4), // idle-left
            new Frame(50, 96, 13, 16, 0, -4), // jump-left
            new Frame(102, 96, 13, 16, 0, -4), new Frame(89, 96, 13, 16, 0, -4), new Frame(76, 96, 13, 16, 0, -4), new Frame(63, 96, 13, 16, 0, -4), // walk-left
            new Frame(0, 112, 13, 16, 0, -4), // idle-right
            new Frame(65, 112, 13, 16, 0, -4), // jump-right
            new Frame(13, 112, 13, 16, 0, -4), new Frame(26, 112, 13, 16, 0, -4), new Frame(39, 112, 13, 16, 0, -4), new Frame(52, 112, 13, 16, 0, -4), // walk-right
            new Frame(81, 112, 14, 16), new Frame(96, 112, 16, 16), // carrot
            new Frame(112, 115, 16, 4), new Frame(112, 124, 16, 4), new Frame(112, 119, 16, 4) // grass
        ];
    }
}

class World {
    constructor(friction = 0.85, gravity = 2) {
        this.collider = new Collider();

        this.friction = friction;
        this.gravity = gravity;

        this.columns = 12;
        this.rows = 9;

        this.tileSet = new TileSet(8, 16);
        this.player = new Player(32, 76);

        this.zoneId = '00';

        this.carrots = [];
        this.carrotCount = 0;
        this.doors = [];
        this.door = null;

        this.height = this.tileSet.tileSize * this.rows;
        this.width = this.tileSet.tileSize * this.columns;
    }

    collideObject(object) {
        let bottom, left, right, top, value;

        top = Math.floor(object.getTop() / this.tileSet.tileSize);
        left = Math.floor(object.getLeft() / this.tileSet.tileSize);
        value = this.collisionMap[top * this.columns + left];
        this.collider.collide(value, object, left * this.tileSet.tileSize, top * this.tileSet.tileSize, this.tileSet.tileSize);

        top = Math.floor(object.getTop() / this.tileSet.tileSize);
        right = Math.floor(object.getRight() / this.tileSet.tileSize);
        value = this.collisionMap[top * this.columns + right];
        this.collider.collide(value, object, right * this.tileSet.tileSize, top * this.tileSet.tileSize, this.tileSet.tileSize);

        bottom = Math.floor(object.getBottom() / this.tileSet.tileSize);
        left = Math.floor(object.getLeft() / this.tileSet.tileSize);
        value = this.collisionMap[bottom * this.columns + left];
        this.collider.collide(value, object, left * this.tileSet.tileSize, bottom * this.tileSet.tileSize, this.tileSet.tileSize);

        bottom = Math.floor(object.getBottom() / this.tileSet.tileSize);
        right = Math.floor(object.getRight() / this.tileSet.tileSize);
        value = this.collisionMap[bottom * this.columns + right];
        this.collider.collide(value, object, right * this.tileSet.tileSize, bottom * this.tileSet.tileSize, this.tileSet.tileSize);
    }

    setup(zone) {
        this.carrots = [];
        this.doors = [];
        this.grass = [];
        this.collisionMap = zone.collisionMap;
        this.graphicalMap = zone.graphicalMap;
        this.columns = zone.columns;
        this.rows = zone.rows;
        this.zoneId = zone.id;

        for (let carrot of zone.carrots) {
            this.carrots.push(new Carrot(carrot[0] * this.tileSet.tileSize + 5, carrot[1] * this.tileSet.tileSize - 2));
        }

        for (let door of zone.doors) {
            this.doors.push(new Door(door));
        }

        for (let grass of zone.grass) {
            this.grass.push(new Grass(grass[0] * this.tileSet.tileSize, grass[1] * this.tileSet.tileSize + 12));
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

        this.collideObject(this.player);

        for (let carrot of this.carrots) {
            carrot.updatePosition();
            carrot.animate();

            if (carrot.collideObject(this.player)) {
                this.carrots.splice(this.carrots.indexOf(carrot), 1);
                this.carrotCount++;
            }
        }

        for (let door of this.doors) {
            if (door.collideObjectCenter(this.player)) {
                this.door = door;
            }
        }

        for (let grass of this.grass) {
            grass.animate();
        }

        this.player.updateAnimation();
    }
}