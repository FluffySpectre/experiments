class InputController {
    constructor() {
        this.left = new ButtonInput();
        this.right = new ButtonInput();
        this.up = new ButtonInput();
        this.down = new ButtonInput();
        this.attack = new ButtonInput();
    }

    reset() {
        this.left.firstDown = false;
        this.right.firstDown = false;
        this.up.firstDown = false;
        this.down.firstDown = false;
        this.attack.firstDown = false;
    }

    keyDownUp(type, keyCode) {
        let down = type === 'keydown';

        if (keyCode === 'Space') {
            this.attack.getInput(down);
        } else if (keyCode === 'KeyA' || keyCode === 'ArrowLeft') {
            this.left.getInput(down);
        } else if (keyCode === 'KeyD' || keyCode === 'ArrowRight') {
            this.right.getInput(down);
        } else if (keyCode === 'KeyW' || keyCode === 'ArrowUp') {
            this.up.getInput(down);
        } else if (keyCode === 'KeyS' || keyCode === 'ArrowDown') {
            this.down.getInput(down);
        }
    }
}

class ButtonInput {
    constructor() {
        this.active = false;
        this.down = false;
        this.fired = false;
        this.firstDown = false;
    }

    getInput(down) {
        if (this.down !== down) this.active = down;
        this.down = down;

        if (this.active) {
            if (!this.fired) {
                this.fired = true;
                this.firstDown = true;
            } else {
                this.firstDown = false;
            }
        } else {
            this.firstDown = false;
            this.fired = false;
        }
    }
}
