const width = 15;
const height = 20;
player = [5,5];
goblin = [10,12];
goblinRecovering = 0;

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

    if (str && str !== '') {
        update(str[0]);
        render();
    }
});

const posIsEqual = (p1, p2) => p1[0] === p2[0] && p1[1] === p2[1];

const update = (key) => {
    if (key === 'w' && player[1] > 0) player[1]--;
    else if (key === 's' && player[1] < height-1) player[1]++;
    else if (key === 'a' && player[0] > 0) player[0]--;
    else if (key === 'd' && player[0] < width-1) player[0]++;

    // move goblin
    if (goblinRecovering === 0) {
        if (goblin[0] > player[0]) goblin[0]--;
        else if (goblin[0] < player[0]) goblin[0]++;
        else if (goblin[1] > player[1]) goblin[1]--;
        else if (goblin[1] < player[1]) goblin[1]++;
    } else {
        goblinRecovering--;
    }
    if (goblinRecovering === 0 && posIsEqual(player, goblin)) {
        goblinRecovering = 3;
    }
};

const render = () => {
    // clear screen
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);

    for (i = 0; i < height; i++) {
        let row = '';
        for (j = 0; j < width; j++) {
            let char = '.';
            
            if (posIsEqual([j,i], goblin)) {
                char = 'E';
            }

            if (posIsEqual([j,i], player)) {
                char = '@';
            }
            
            row += ' ' + char + ' ';
        }
        console.log(row);
    }
};

// startup
render();