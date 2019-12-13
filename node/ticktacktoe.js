// setup console input
const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
    // since we override the key input here, make sure that we 
    // are able to quit the game via CTRL+C :)
    if (key.ctrl && key.name === 'c') {
        process.exit();
    }

    // support arrow keys as well
    if (key.name === 'up') str = 'w';
    else if (key.name === 'down') str = 's';
    else if (key.name === 'left') str = 'a';
    else if (key.name === 'right') str = 'd';

    if (str && str !== '')
        gameUpdate(str[0]);
});

const map = [
    ['','',''],
    ['','',''],
    ['','',''],
];
let selectedField = { x: 0, y: 0 };
let currentPlayer = 'O';
let winner;
let choiceSet = false;

const gameUpdate = (inputChar) => {
    // clear screen
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);

    if (!winner) {
        // check for selection change
        if (inputChar === 'a' && selectedField.x > 0) selectedField.x--;
        if (inputChar === 'd' && selectedField.x < 2) selectedField.x++;
        if (inputChar === 'w' && selectedField.y > 0) selectedField.y--;
        if (inputChar === 's' && selectedField.y < 2) selectedField.y++;

        // set choice
        choiceSet = false;
        if (inputChar == ' ' && map[selectedField.y][selectedField.x] === '') {
            map[selectedField.y][selectedField.x] = currentPlayer;
            choiceSet = true;
        }
    } else {
        if (inputChar === ' ') {
            resetGame();
        }
    }

    // render map
    for (let i=0; i<3; i++) {
        let row = '';
        for (let j=0; j<3; j++) {
            if (i === selectedField.y && j === selectedField.x) {
                row += '[' + (map[i][j] !== '' ? map[i][j] : '.') + ']';
            } else if (map[i][j] !== '') {
                row += ' ' + map[i][j] + ' ';
            } else {
                row += ' . ';
            }
        }
        console.log(row);
    }

    if (choiceSet) {
        // check for end of game (win, lose, draw)
        winner = checkForWinner();

        if (winner === 'draw') {
            console.log('\nGAME OVER! Its a draw!');
        } else if (winner) {
            console.log('\nGAME OVER! Player ' + winner + ' wins!');
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        }
    }

    if (winner) {
        console.log('Press "Space" to restart');
    } else {
        console.log('\nPlayer ' + currentPlayer);
        console.log('Use "WASD" to move and "Space" to place');
    }
};

const checkForWinner = () => {
    const wins = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]
    ];
    const mapArray = [];
    for (let i=0; i<3; i++) {
        mapArray.push(...map[i]);
    }

    for (i=0; i<8; i++) {
        const t = mapArray[wins[i][0]];
        const z = mapArray[wins[i][1]];
        if (t !== '' && t === z && z === mapArray[wins[i][2]])
            return t;
    }

    if (mapArray.filter(e => e === '').length === 0) {
        return 'draw';
    }

    return false;
};

const resetGame = () => {
    for (let i=0; i<3; i++) {
        for (let j=0; j<3; j++) {
            map[i][j] = '';
        }
    }
    winner = null;
    choiceSet = false;
    currentPlayer = 'O';
    selectedField = { x: 0, y: 0 };
};

// initial update
gameUpdate('');