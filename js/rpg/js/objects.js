class Switch extends GameObject {
    constructor(x, y, frames, id) {
        super(x, y, 16, 8, id);

        this.frameSets = {
            'off': [frames[0]],
            'on': [frames[1]],
        };

        this.on = false;
        this.wasOn = false;
        this.animator = new Animator(this.frameSets['off'], 0, 'pause');
    }

    interact(user) {
        this.on = !this.on;

        if (this.on && !this.wasOn) {
            this.wasOn = true;

            eventBus.send('switch-change', { id: this.id, state: true });
        }
    }

    update() {
        this.updateAnimation();
    }

    updateAnimation() {
        if (this.on) this.animator.changeFrameSet(this.frameSets['on'], 'pause');
        else this.animator.changeFrameSet(this.frameSets['off'], 'pause');
    }
}

class Chest extends GameObject {
    constructor(x, y) {
        super(x, y, 16, 16);

        this.frameSets = {
            'closed': [26],
            'open': [25],
        };

        this.open = false;
        this.animator = new Animator(this.frameSets['closed'], 0, 'pause');
    }

    interact(user) {
        this.open = !this.open;
    }

    update() {
        this.updateAnimation();
    }

    updateAnimation() {
        if (this.open) this.animator.changeFrameSet(this.frameSets['open'], 'pause');
        else this.animator.changeFrameSet(this.frameSets['closed'], 'pause');
    }
}