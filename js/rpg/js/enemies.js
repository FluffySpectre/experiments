class Enemy extends MovingObject {
    constructor(x, y) {
        super(x, y, 10, 16);

        this.frameSets = {
            'idle-down': [54],
            'idle-left': [57],
            'idle-right': [60],
            'idle-up': [63],
            'move-down': [53, 54],
            'move-left': [56, 57],
            'move-right': [59, 60],
            'move-up': [62, 63],
            'dead': [65],
        };

        this.animator = new Animator(this.frameSets['idle-down'], 5, 'pause');
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
        
        // fix for diagonal movement
        if (Math.abs(this.velocityX) > 0.01 && Math.abs(this.velocityY) > 0.01) {
            this.velocityY *= friction / 1.1;
            this.velocityX *= friction / 1.1;
        } else {
            this.velocityY *= friction;
            this.velocityX *= friction;
        }
    }
}