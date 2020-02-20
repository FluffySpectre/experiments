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

class Corn extends GameObject {
    constructor(x, y) {
        super(x, y, 16, 16);

        this.frameSets = {
            'state0': [70],
            'state1': [69],
            'state2': [68],
            'state3': [67],
            'state4': [66],
        };

        this.animator = new Animator(this.frameSets['state4'], 0, 'pause');
        this.growCounter = 0.0;
        this.growState = 4;
    }

    interact(user, entities) {
        if (this.growState < 4) return;

        this.growState = 0;
        this.growCounter = 30;

        // spawn a corn pickup
        // entities.push(new Pickup(this.x, this.y, 'corn'));
    }

    update() {
        if (this.growCounter > 0) {
            this.growCounter -= 0.1;

            if (this.growCounter < 0) {
                this.growState++;
                if (this.growState === 4) {
                    this.growCounter = 0;
                } else {
                    this.growCounter = 20;
                }
            }
        }

        this.updateAnimation();
    }

    updateAnimation() {
        this.animator.changeFrameSet(this.frameSets['state' + this.growState], 'pause');
    }
}

class Pickup extends GameObject {
    constructor(x, y, type) {
      super(x, y, 16, 16);
  
      this.type = type;
  
      if (type === 'corn') {
        this.frameSets = {
          'default': [71],
        };
      } else {
        this.frameSets = {};
      }
  
      this.animator = new Animator(this.frameSets['default'], 0, 'pause');
    }
  
    interact(user) {
      console.log('PICKUP picked up!');
    }
  
    update() {
  
    }
  }