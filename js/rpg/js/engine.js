class Engine {
    constructor(timestep, update, render) {
        this.accumulatedTime = 0;
        this.animationFrameRequest = null;
        this.time = null;
        this.timestep = timestep;

        this.updated = false;

        this.update = update;
        this.render = render;
    }

    run(timestamp) {
        this.animationFrameRequest = window.requestAnimationFrame(this.handleRun.bind(this));
        
        this.accumulatedTime += timestamp - this.time;
        this.time = timestamp;

        if (this.accumulatedTime >= this.timestep * 3) {
            this.accumulatedTime = this.timestep;
        }

        while (this.accumulatedTime >= this.timestep) {
            this.accumulatedTime -= this.timestep;

            this.update(timestamp);

            this.updated = true;
        }

        if (this.updated) {
            this.updated = false;
            this.render(timestamp);
        }
    }

    handleRun(timestep) { 
        this.run(timestep); 
    }

    start() {
        this.accumulatedTime = this.timestep;
        this.time = window.performance.now();
        this.animationFrameRequest = window.requestAnimationFrame(this.handleRun.bind(this));
    }

    stop() { 
        window.cancelAnimationFrame(this.animationFrameRequest);
    }
}