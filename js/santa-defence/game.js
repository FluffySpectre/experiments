class ScrollingBackground {
    constructor() {
        this.starImg = new Image();
        this.starImg.src = 'star.png';
        this.starsScrollSpeed = 50;

        // setup stars for background
        this.stars = [];
        for (let i = 0; i < 125; i++) {
            this.stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: getRandomInt(3, 32) });
        }
    }

    update(dT) {
        for (let s of this.stars) {
            s.x -= this.starsScrollSpeed * dT;
            if (s.x < -this.starImg.width) {
                s.y = Math.random() * canvas.width;
                s.x = canvas.width;
                s.size = getRandomInt(3, 32)
            }
        }
    }

    render() {
        // clear screen
        ctx.fillStyle = '#182729';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // draw the star background
        for (let s of this.stars) {
            ctx.drawImage(this.starImg, s.x, s.y, s.size, s.size);
        }
    }
}

class HealthItem {
    constructor(x, y) {
        this.pos = new Vector(x, y);
        this.lifespan = 1.0;
        this.theta = 0;
    }

    update(dT) { }

    render() {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.theta);
        ctx.globalAlpha = this.lifespan;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 50, 50);
        ctx.fillStyle = 'red';
        ctx.fillRect(20, 0, 10, 50);
        ctx.fillRect(0, 20, 50, 10);
        ctx.restore();
    }
}

class Player {
    constructor() {
        this.pos = new Vector();
        this.firing = -1;
        this.noseColor = -1;
        this.resetNoseColorCounter = 2;
        this.width = 0;
        this.height = 0;

        this.santaImg = new Image();
        this.santaImg.src = 'santa.png';
        this.santaImg.onload = () => {
            this.width = this.santaImg.width;
            this.height = this.santaImg.height;
            this.pos = new Vector(canvas.width / 2 - this.width * 0.05, canvas.height / 2 - this.height / 5);
        };
    }

    input(fire) {
        this.firing = fire;
    }

    update(dT) {
        if (this.noseColor > -1) {
            this.resetNoseColorCounter -= dT;
            if (this.resetNoseColorCounter < 0) {
                this.noseColor = -1;
                this.resetNoseColorCounter = 2;
            }
        }

        if (this.firing > -1) {
            const impulse = new Impulse(this.pos.x - 145, this.pos.y - 22, this.firing);
            impulse.vel = new Vector(500, 0);
            impulses.push(impulse);

            // set nose color to the current impulse color
            this.noseColor = this.firing;
            this.resetNoseColorCounter = 2;
        }
    }

    render() {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.drawImage(this.santaImg, -this.santaImg.width * 1.25, -this.santaImg.height / 2);

        // draw colored nose
        ctx.beginPath();
        ctx.fillStyle = this.getNoseColor();
        ctx.arc(-132, -21, 5, 0, Math.PI * 2, true);
        ctx.fill();

        ctx.restore();
    }

    damage() {
        if (health.length > 0) {
            health.pop();
            if (health.length === 0) {
                gameOver = true;
            }
        }
    }

    getNoseColor() {
        if (this.noseColor === -1) {
            return 'rgb(255,255,255)';
        }
        return gameColors[this.noseColor];
    }
}

class Enemy {
    constructor(x, y, color) {
        this.pos = new Vector(x, y);
        this.vel = new Vector();
        this.remove = false;
        this.color = color;
        this.firstFrameAfterRemove = true;
    }

    update(dT, impulses, explosions) {
        const vel = this.vel.copy().mult(dT);
        this.pos.add(vel);

        if (rectContainsRect(player.pos.x - player.width * 1.25, player.pos.y - player.height / 2, player.width, player.height, this.pos.x, this.pos.y, enemyWidth, enemyHeight)) {
            player.damage();

            this.remove = true;
        }

        for (let i of impulses) {
            if (rectContainsCircle(this.pos.x, this.pos.y, enemyWidth, enemyHeight, i.pos.x, i.pos.y, i.radius())) {
                i.remove = true;
                if (this.color === i.color) {
                    this.remove = true;
                }
            }
        }

        if (this.remove) {
            if (this.firstFrameAfterRemove) {
                this.firstFrameAfterRemove = false;

                // spawn an explosion at the enemies position
                const explosion = new ParticleSystem(this.pos.x + enemyWidth / 2, this.pos.y + enemyHeight / 2);

                for (let i = 0; i < 35; i++) {
                    explosion.addParticle(new ExplosionParticle(this.color));
                }
                explosions.push(explosion);
            }

            roundDestroyedEnemies++;
            if (roundDestroyedEnemies === roundSpawns) {
                roundSpawnedEnemies = 0;
                roundDestroyedEnemies = 0;
                roundSpawns += 5;

                enemySpeed += 25;
                spawnTime -= 0.25;

                if (spawnTime < 0.5) spawnTime = 0.5;
                if (enemySpeed > 500) enemySpeed = 500;

                roundCooldown = 3;
                round++;

                if (round > highscoreRound) {
                    highscoreRound = round;

                    // save the score to the local storage
                    saveHighscore();
                }
            }
        }
    }

    render() {
        ctx.fillStyle = gameColors[this.color];
        ctx.fillRect(this.pos.x, this.pos.y, enemyWidth, enemyHeight);
    }
}

class Impulse {
    constructor(x, y, color) {
        this.pos = new Vector(x, y);
        this.vel = new Vector();
        this.remove = false;
        this.damage = 1;
        this.color = color;
        this.counter = 1.5;
        this.maxCounter = 1.5;
    }

    update(dT) {
        const vel = this.vel.copy().mult(dT);
        this.pos.add(vel);

        this.counter -= dT;
        if (this.counter < 0) this.counter = 0;

        if (!rectContainsPoint(0, 0, canvas.width, canvas.height, this.pos.x, this.pos.y)) {
            this.remove = true;
        }
    }

    render() {
        ctx.save();
        ctx.globalAlpha = this.counter / this.maxCounter;
        ctx.fillStyle = gameColors[this.color];
        ctx.beginPath();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(Math.PI / 2);
        ctx.arc(0, 0, this.radius(), 0, Math.PI, true);
        ctx.fill();
        ctx.restore();
    }

    radius() {
        return 120 * (this.maxCounter - this.counter + 0.075);
    }
}

class ParticleSystem {
    constructor(x, y) {
        this.origin = new Vector(x, y);
        this.particles = [];
    }

    addParticle(p) {
        p.pos = this.origin.copy();
        this.particles.push(p);
    }

    update(dT) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.update(dT);
            if (p.isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }

    render() {
        for (let p of this.particles) {
            p.render();
        }
    }

    allDead() {
        return this.particles.length === 0;
    }
}

class Particle {
    constructor(color) {
        this.vel = new Vector();
        this.pos = new Vector();
        this.lifespan = 1.0;
        this.color = color;
    }

    update(dT) {
        this.pos.add(this.vel);
        this.lifespan -= 1.5 * dT;
    }

    render() { }

    isDead() {
        if (this.lifespan < 0) {
            return true;
        }
        return false;
    }
}

class ExplosionParticle extends Particle {
    constructor(color) {
        super(color);

        this.vel = new Vector(getRandomFloat(-1, 1), getRandomFloat(-1, 1)).mult(5);
        this.theta = 0.0;
    }

    update(dT) {
        super.update(dT);

        this.theta += (this.vel.x * this.vel.mag()) / 5.0 * dT;
    }

    render() {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.theta);
        ctx.globalAlpha = this.lifespan;
        ctx.fillStyle = gameColors[this.color];
        ctx.fillRect(0, 0, 15, 15);
        ctx.restore();
    }
}

// GLOBALS
let canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');
let lastFrameTime = Date.now();
let fireInput = 0, lastFireInput = -1;
const enemyWidth = 80;
const enemyHeight = 80;
const gameColors = ['rgb(255,0,0)', 'rgb(0,255,0)', 'rgb(0,0,255)'];
let player;
let impulses = [];
let enemies = [];
let explosions = [];
let spawnTime = 3;
let spawnCounter = 0;
let gameOver = false;
let roundSpawns = 5;
let roundSpawnedEnemies = 0;
let roundDestroyedEnemies = 0;
let enemySpeed = 100;
let roundCooldown = 3;
let round = 1;
let health = [];
let highscoreRound = 0;
let scrollingBackground = new ScrollingBackground();

function update() {
    // calculate frame time
    let deltaTime = (Date.now() - lastFrameTime) / 1000;
    lastFrameTime = Date.now();
    if (deltaTime > 1) deltaTime = 1;

    scrollingBackground.update(deltaTime);

    if (!gameOver) {
        player.input(fireInput);
        player.update(deltaTime);

        for (let e of enemies) {
            e.update(deltaTime, impulses, explosions);
        }

        // spawn enemies
        spawnCounter += deltaTime;
        roundCooldown -= deltaTime;

        if (roundCooldown <= 0 && spawnCounter > spawnTime && roundSpawnedEnemies < roundSpawns) {
            roundSpawnedEnemies++;
            spawnCounter = 0;

            const x = canvas.width + enemyWidth + 50;
            const y = canvas.height / 2 - enemyHeight / 2 - 50;
            const color = getRandomInt(0, 3);

            const enemy = new Enemy(x, y, color);
            enemy.vel = new Vector(-enemySpeed, 0);
            enemies.push(enemy);
        }
    } else {
        disableControlButtons();
    }

    for (let i of impulses) {
        i.update(deltaTime);
    }

    for (let e of explosions) {
        e.update(deltaTime);
    }

    for (let h of health) {
        h.update(deltaTime);
    }

    // cleanup unneeded entities
    impulses = impulses.filter(i => !i.remove);
    enemies = enemies.filter(e => !e.remove);
    explosions = explosions.filter(e => !e.allDead());

    // reset inputs
    fireInput = -1;

    // at the end of each update cycle render the current state of the game
    render();
}

function render() {
    scrollingBackground.render();

    player.render();

    for (let e of enemies) {
        e.render();
    }

    for (let i of impulses) {
        i.render();
    }

    for (let e of explosions) {
        e.render();
    }

    // draw ui
    ctx.font = '32px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('Aktuelle Runde:', 10, 40);
    ctx.fillText(round, 380, 40);
    ctx.fillText('Max. Runden geschafft:', 10, 80);
    ctx.fillText(highscoreRound, 380, 80);
    ctx.fillText('Gegner in Runde:', 10, 120);
    ctx.fillText(roundSpawns - roundDestroyedEnemies, 380, 120);

    for (let h of health) {
        h.render();
    }

    if (roundCooldown > 0) {
        ctx.font = '64px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText('RUNDE ' + round, canvas.width / 2 - 110, canvas.height / 4);
    }

    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '64px Arial';
        ctx.fillStyle = 'red';
        ctx.fillText('GAME OVER', canvas.width / 2 - 190, canvas.height / 2 - 50);
        ctx.font = '32px Arial';
        ctx.fillText('Drücke "Leertaste" zum Neustart', canvas.width / 2 - 230, canvas.height / 2 - 0);
    }
}

function restart() {
    player = new Player();

    enemies = [];
    fireInput = -1;
    lastFireInput = -1;
    round = 1;
    roundCooldown = 3;
    spawnTime = 3;
    spawnCounter = 0;
    enemySpeed = 100;
    roundSpawnedEnemies = 0;
    roundDestroyedEnemies = 0;

    health = [new HealthItem(canvas.width - 220, 15), new HealthItem(canvas.width - 150, 15), new HealthItem(canvas.width - 80, 15)];

    gameOver = false;

    enableControlButtons();
}

function saveHighscore() {
    localStorage.setItem('highscore', highscoreRound);
}

function enableControlButtons() {
    const btns = document.getElementsByClassName('control-btn');
    for (let i = 0; i < btns.length; i++) {
        btns[i].classList.remove('disabled');
    }
}

function disableControlButtons() {
    const btns = document.getElementsByClassName('control-btn');
    for (let i = 0; i < btns.length; i++) {
        btns[i].classList.add('disabled');
    }
}

// setup input handler
document.addEventListener('keydown', (e) => {
    if (e.which === 37 || e.code === 'KeyA' && lastFireInput !== 0) controlButtonRed();
    if (e.which === 40 || e.code === 'KeyS' && lastFireInput !== 1) controlButtonGreen();
    if (e.which === 39 || e.code === 'KeyD' && lastFireInput !== 2) controlButtonBlue();
    if ((e.which === 32 || e.code === 'Space') && gameOver) {
        restart();
    }
});
document.addEventListener('keyup', (e) => {
    if (e.which === 37 || e.code === 'KeyA') {
        fireInput = -1;
        if (lastFireInput === 0) lastFireInput = -1;
    }
    if (e.which === 40 || e.code === 'KeyS') {
        fireInput = -1;
        if (lastFireInput === 1) lastFireInput = -1;
    }
    if (e.which === 39 || e.code === 'KeyD') {
        fireInput = -1;
        if (lastFireInput === 2) lastFireInput = -1;
    }
});

function controlButtonRed() {
    fireInput = 0;
    lastFireInput = 0;
}
function controlButtonGreen() {
    fireInput = 1;
    lastFireInput = 1;
}
function controlButtonBlue() {
    fireInput = 2;
    lastFireInput = 2;
}


// restore highscore
const savedHighscore = localStorage.getItem('highscore') || 0;
highscoreRound = parseInt(savedHighscore);

restart();

// setup draw loop
setInterval(update, 1000 / 30);