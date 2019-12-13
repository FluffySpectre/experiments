const width = 15;
const height = 20;
const fps = 8;
let snake = [];
let dir = [0,0];
let apple = [];
let highscore = 1;
let gameIsOver = false;

const fs = require('fs');
const readline = require('readline');

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
    // since we override the key input here, make sure that we 
    // are able to quit the game via CTRL+C :)
    if (key.ctrl && key.name === 'c') process.exit();

    if (str === 'w' || key.name === 'up') dir = [0, -1];
    else if (str === 's' || key.name === 'down') dir = [0, 1];
    else if (str === 'a' || key.name === 'left') dir = [-1, 0];
    else if (str === 'd' || key.name === 'right') dir = [1, 0];
});

const posIsEqual = (p1, p2) => p1[0] === p2[0] && p1[1] === p2[1];
const randomPos = () => [(Math.random() * (width - 2)) | 1, (Math.random() * (height - 2)) | 1];

const update = () => {
    if (!gameIsOver) {
        // move the snake
        snake.unshift([
            snake[0][0] + dir[0],
            snake[0][1] + dir[1]
        ]);

        // check for apple
        if (posIsEqual(snake[0], apple)) {
            apple = randomPos();

            if (snake.length > highscore) {
                highscore = snake.length;
                saveHighscore();
            }
        } else {
            snake.pop();
        }

        // check for collision with our self
        for (let i = 1; i < snake.length; i++) {
            if (posIsEqual(snake[0], snake[i])) {
                gameOver();
            }
        }

        // check for collision with wall
        if ((snake[0][0] < 1 || snake[0][0] >= width-1) ||
            (snake[0][1] < 1 || snake[0][1] >= height-1)) {
            gameOver();
        }
    } else {
        if (dir[0] !== 0 || dir[1] !== 0) {
            restart();
        }
    }
    
    render();
};

const render = () => {
    // clear screen
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);

    // render the number of eaten apples
    console.log(' Length: ' + snake.length);
    console.log(' Highscore: ' + highscore);

    for (i = 0; i < height; i++) {
        let row = '';
        for (j = 0; j < width; j++) {
            let char = ' ';
            if ((i === 0 || i === height-1) ||
                (j === 0 || j === width-1)) {
                char = '.';
            }

            if (posIsEqual([j,i], apple)) {
                char = 'o';
            }

            for (part of snake) {
                if (posIsEqual([j,i], part)) {
                    char = 'X';
                }
            }
            
            row += ' ' + char + ' ';
        }
        console.log(row);
    }

    if (gameIsOver) {
        console.log('GAME OVER! Press WASD to restart.');
    }
};

const gameOver = () => {
    gameIsOver = true;
    dir = [0,0];
    reset();
};

const reset = () => {
    snake = [[5,5]];
    apple = randomPos();
};

const restart = () => {
    gameIsOver = false;
};

const loadHighscore = () => {
    if (fs.existsSync('snake_save.json')) {
        let rawdata = fs.readFileSync('snake_save.json');
        highscore = JSON.parse(rawdata).highscore;
    }
};

const saveHighscore = () => {
    let data = JSON.stringify({ highscore });
    fs.writeFileSync('snake_save.json', data);
};

loadHighscore();
reset();
update();

setInterval(update, 1000 / fps);