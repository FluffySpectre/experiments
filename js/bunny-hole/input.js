class InputController {
    constructor() {
        this.left = new ButtonInput();
        this.right = new ButtonInput();
        this.up = new ButtonInput();
    }

    keyDownUp(type, keyCode) {
        let down = type === 'keydown';

        if (keyCode === 'KeyA' || keyCode === 'ArrowLeft') {
            this.left.getInput(down);
        } else if (keyCode === 'KeyD' || keyCode === 'ArrowRight') {
            this.right.getInput(down);
        } else if (keyCode === 'KeyW' || keyCode === 'ArrowUp') {
            this.up.getInput(down);
        }
    }
}

class ButtonInput {
    constructor() {
        this.active = false;
        this.down = false;
    }

    getInput(down) {
        if (this.down !== down) this.active = down;
        this.down = down;
    }
}
