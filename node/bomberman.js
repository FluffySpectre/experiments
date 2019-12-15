const width = 15;
const height = 15;
let lastFrameTime = 0;
let deltaTime = 0;
let bombs = [];
let explosions = [];
let pickups = [];
let enemies = [];
let inputMove = [0, 0];
let inputPlace = false;
let player;
let gameOver = false;
let win = false, lose = false;
let explosionRadius = 1;
let score = 0;
let exit = [];

const TILE_FLOOR = 0;
const TILE_DESTRUCTIBLE = 1;
const TILE_WALL = 2;

const initialMap = [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    [2, 0, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 0, 2],
    [2, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 2],
    [2, 1, 2, 1, 2, 0, 2, 1, 2, 1, 2, 1, 2, 0, 2],
    [2, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
];
let map = null;

const readline = require('readline');

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
    // since we override the key input here, make sure that we 
    // are able to quit the game via CTRL+C :)
    if (key.ctrl && key.name === 'c') process.exit();

    if (str === 'w' || key.name === 'up') inputMove = [0, -1];
    else if (str === 's' || key.name === 'down') inputMove = [0, 1];
    else if (str === 'a' || key.name === 'left') inputMove = [-1, 0];
    else if (str === 'd' || key.name === 'right') inputMove = [1, 0];

    if (key.name === 'space') {
        inputPlace = true;
    }
});

const posIsEqual = (p1, p2) => p1[0] === p2[0] && p1[1] === p2[1];

const update = () => {
    deltaTime = (Date.now() - lastFrameTime) / 1000;
    lastFrameTime = Date.now();

    if (!gameOver) {
        bombs = bombs.filter(b => !b.dead());
        for (let b of bombs) {
            b.update(deltaTime);
        }

        explosions = explosions.filter(e => e.lifetime > 0);
        for (let e of explosions) {
            e.update(deltaTime);
        }

        pickups = pickups.filter(e => !e.pickedUp);
        for (let p of pickups) {
            if (posIsEqual([player.x, player.y], [p.x, p.y])) {
                p.pickup();
            }
        }

        enemies = enemies.filter(e => !e.dead);
        for (let e of enemies) {
            e.update(deltaTime);
        }

        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                for (let e of explosions) {
                    for (let x = 0; x < 4; x++) {
                        for (let k = 0; k < e.cells[x].length; k++) {
                            const c = e.cells[x][k];
                            if (posIsEqual([j, i], [c.x, c.y])) {
                                if (map[j][i] === TILE_WALL) {
                                    break;
                                }
                                if (map[j][i] === TILE_DESTRUCTIBLE) {
                                    map[j][i] = TILE_FLOOR;

                                    // drop by a 5% chance a pickup
                                    if (Math.random() < 0.05) {
                                        pickups.push(new Pickup(j, i));
                                    }

                                    score += 25;
                                }

                                for (let enemy of enemies) {
                                    if (posIsEqual([j,i], [enemy.x, enemy.y])) {
                                        enemy.die();

                                        score += 100;
                                    }
                                }

                                if (posIsEqual([j, i], [player.x, player.y])) {
                                    gameOver = true;
                                    lose = true;
                                }
                                char = e.char;
                            }
                        }
                    }
                }
            }
        }

        if (posIsEqual([player.x, player.y], [exit.x, exit.y])) {
            gameOver = true;
            win = true;
        }

        player.update(deltaTime);
    } else {
        if (inputPlace) {
            reset();
        }
    }

    render();
};

const render = () => {
    // clear screen
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);

    console.log(' Score: ' + score + '\n');

    for (let i = 0; i < height; i++) {
        let row = '';
        for (let j = 0; j < width; j++) {
            let char = ' ';
            if (map[j][i] === TILE_DESTRUCTIBLE) {
                char = '░';
            } else if (map[j][i] === TILE_WALL) {
                char = '■';
            }

            // render the exit
            if (posIsEqual([exit.x, exit.y], [j,i])) {
                if (map[j][i] === TILE_FLOOR)
                    char = 'E';
            }

            for (let p of pickups) {
                if (posIsEqual([j, i], [p.x, p.y])) {
                    char = p.char;
                }
            }

            for (let b of bombs) {
                if (posIsEqual([j, i], [b.x, b.y])) {
                    char = b.char;
                }
            }

            for (let e of explosions) {
                for (let x = 0; x < 4; x++) {
                    for (let k = 0; k < e.cells[x].length; k++) {
                        const c = e.cells[x][k];
                        if (posIsEqual([j, i], [c.x, c.y])) {
                            if (map[j][i] === TILE_WALL) break;
                            char = e.char;
                        }
                    }
                }
            }

            if (posIsEqual([j, i], [player.x, player.y])) {
                char = player.char;
            }

            for (let e of enemies) {
                if (posIsEqual([j, i], [e.x, e.y])) {
                    char = e.char;
                }
            }

            row += ' ' + char + ' ';
        }
        console.log(row);
    }

    if (gameOver && lose) {
        console.log('\nGAME OVER! Press "space" to restart.');
    } else if (gameOver && win) {
        console.log('\nYou found the exit! Press "space" to restart.');
    }
};

const reset = () => {
    player = new Player(1, 1);
    map = JSON.parse(JSON.stringify(initialMap)); // do a deep copy from the map
    bombs = [];
    explosions = [];
    pickups = [];
    enemies = [new Enemy(13, 4), new Enemy(3, 6), new Enemy(6, 13), new Enemy(7, 7)];
    explosionRadius = 1;
    gameOver = false;
    win = false;
    lose = false;
    inputPlace = false;
    inputMove = [0, 0];
    score = 0;
    exit = { x: 13, y: 6 }; // TODO: make this random placed under a TILE_DESTRUCTIBLE
};

class Bomb {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.char = 'o';
        this.counter = 0;
        this.countdown = 3;
    }

    update(dT) {
        this.counter += dT;
        if (this.counter > 0.5) {
            this.counter = 0;
            this.char = this.char === 'o' ? 'O' : 'o';
        }

        this.countdown -= dT;
        if (this.countdown <= 0) {
            explosions.push(new Explosion(this.x, this.y, explosionRadius));
        }
    }

    dead() {
        return this.countdown <= 0;
    }
}

class Explosion {
    constructor(x, y, strength) {
        this.x = x;
        this.y = y;
        this.char = '💥';
        this.strength = strength;
        this.lifetime = 0.5;

        this.cells = [
            [], // north
            [], // east
            [], // south
            [] // west
        ];
        for (let i = 0; i <= strength; i++) {
            this.cells[0].push({
                x,
                y: y - i
            });
            this.cells[1].push({
                x: x + i,
                y
            });
            this.cells[2].push({
                x,
                y: y + i
            });
            this.cells[3].push({
                x: x - i,
                y
            });
        }
    }

    update(dT) {
        this.lifetime -= dT;
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.char = '😀';
    }

    update(dT) {
        // check movement
        if (map[this.x + inputMove[0]][this.y + inputMove[1]] === TILE_FLOOR) {
            this.x += inputMove[0];
            this.y += inputMove[1];
        }

        if (inputPlace) {
            this.placeBomb();
        }

        inputMove = [0, 0];
        inputPlace = false;
    }

    placeBomb() {
        bombs.push(new Bomb(this.x, this.y));
    }
}

class Pickup {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.char = '^';
        this.pickedUp = false;
    }

    pickup() {
        explosionRadius++;
        if (explosionRadius > 10)
            explosionRadius = 10;

        this.pickedUp = true;
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.char = '😈';
        this.dirY = Math.random() > 0.5 ?  1 : -1;
        this.dirX = 0;
        this.stepDelay = 0.65;
        this.dead = false;
    }

    update(dT) {
        this.stepDelay -= dT;
        if (this.stepDelay <= 0) {
            this.stepDelay = 0.65;

            // if the path in front of us is obstructed, do a turn
            if (map[this.x + this.dirX][this.y + this.dirY] !== TILE_FLOOR) {
                // if currently moving vertical...
                if (this.dirX === 0) {
                    // check left and right or fallback to invert the current direction and move back
                    // if we can go left AND right throw a coin...
                    if (map[this.x + 1][this.y] === TILE_FLOOR && map[this.x - 1][this.y] === TILE_FLOOR) {
                        if (Math.random() < 0.5) {
                            this.dirX = 1;
                            this.dirY = 0;
                        } else {
                            this.dirX = -1;
                            this.dirY = 0;
                        }
                    } else if (map[this.x + 1][this.y] === TILE_FLOOR) {
                        this.dirX = 1;
                        this.dirY = 0;
                    } else if (map[this.x - 1][this.y] === TILE_FLOOR) {
                        this.dirX = -1;
                        this.dirY = 0;
                    } else {
                        this.dirY *= -1;
                    }

                } else {
                    // check up and down or fallback to invert the current direction and move back
                    // if we can go up AND down throw a coin...
                    if (map[this.x][this.y + 1] === TILE_FLOOR && map[this.x][this.y - 1] === TILE_FLOOR) {
                        if (Math.random() < 0.5) {
                            this.dirX = 0;
                            this.dirY = 1;
                        } else {
                            this.dirX = 0;
                            this.dirY = -1;
                        }
                    }
                    else if (map[this.x][this.y + 1] === TILE_FLOOR) {
                        this.dirX = 0;
                        this.dirY = 1;
                    } else if (map[this.x][this.y - 1] === TILE_FLOOR) {
                        this.dirX = 0;
                        this.dirY = -1;
                    } else {
                        this.dirX *= -1;
                    }
                }
            }

            // do the actual movement
            this.x += this.dirX;
            this.y += this.dirY;
        }

        if (posIsEqual([this.x, this.y], [player.x, player.y])) {
            gameOver = true;
            lose = true;
        }
    }

    die() {
        this.dead = true;

        // drop by a 50% chance a pickup
        if (Math.random() < 0.5) {
            pickups.push(new Pickup(this.x, this.y));
        }
    }
}


reset();

lastFrameTime = Date.now();
setInterval(update, 1000 / 10);