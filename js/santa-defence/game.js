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
let sinMovementPercentage = 0.9;
let sinMovementFromRound = 3;
let enemySpeed = 100;
let roundCooldown = 3;
let round = 1;
let health = [];
let highscoreRound = 0;
let scrollingBackground = new ScrollingBackground();

// enemy movement behaviours
const Move_Straight = (enemy, dT) => {
    const vel = enemy.vel.copy().mult(dT);
    enemy.pos.add(vel);
};
const Move_Sin = (enemy, dT) => {
    const vel = enemy.vel.copy();
    enemy.moveData[0] += dT * 3;
    vel.y += 600 * Math.cos(enemy.moveData[0]);
    vel.mult(dT);
    enemy.pos.add(vel);
};

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

            let mBehaviour = Move_Straight;
            if (round >= sinMovementFromRound && roundSpawnedEnemies / roundSpawns >= sinMovementPercentage) {
                mBehaviour = Move_Sin;
            }
            const enemy = new Enemy(x, y, color, mBehaviour);
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