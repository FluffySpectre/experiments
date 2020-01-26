window.addEventListener('load', function (event) {
    class EventBus {
        constructor() {
            this.handlers = [];
        }

        handle(event, handlerFunc) {
            this.handlers[event] = this.handlers[event] || [];
            this.handlers[event].push({
                handlerFunc
            });
        }

        send(event, param) {
            if (this.handlers[event])
                this.handlers[event].forEach(h => h.handlerFunc(param));
            else
                throw new Error('No handler for this event', event);
        }
    }

    class AssetsManager {
        constructor() {
            this.tileSetImage = null;
        }

        requestJSON(url, callback) {
            fetch(url)
                .then((response) => {
                    return response.json();
                })
                .then((myJson) => {
                    callback(myJson);
                });
        }

        requestImage(url, callback) {
            let image = new Image();

            image.addEventListener('load', event => {
                callback(image);
            }, { once: true });

            image.src = url;
        }
    }

    class SoundManager {
        constructor() {
        }

        playSound(url, loop = false) {
            const audio = new Audio(url);
            audio.loop = loop;
            audio.play();
        }
    }

    function keyDownUp(event) {
        controller.keyDownUp(event.type, event.code);
    }

    function resize(event) {
        display.resize(document.documentElement.clientWidth, document.documentElement.clientHeight, game.world.height / game.world.width);
        display.render();
    }

    function render() {
        display.drawMap(assetsManager.tileSetImage,
            game.world.tileSet.columns, game.world.floorMap, game.world.columns, game.world.tileSet.tileSize);

        let frame;
        
        for (let enemy of game.world.enemies) {
            frame = game.world.tileSet.frames[enemy.animator.frameValue];

            display.drawObject(assetsManager.tileSetImage,
                frame.x, frame.y,
                enemy.x + frame.offsetX,
                enemy.y + frame.offsetY, frame.width, frame.height);
        }

        frame = game.world.tileSet.frames[game.world.player.animator.frameValue];

        display.drawObject(assetsManager.tileSetImage,
            frame.x, frame.y,
            game.world.player.x + Math.floor(game.world.player.width * 0.5 - frame.width * 0.5) + frame.offsetX,
            game.world.player.y + frame.offsetY, frame.width, frame.height);

        // DEBUG
        // display.drawRect(game.world.player.interactionRect.x, game.world.player.interactionRect.y, game.world.player.interactionRect.width, game.world.player.interactionRect.height, 'rgba(255, 0, 0, 0.5)');

        for (let entity of game.world.entities) {
            frame = game.world.tileSet.frames[entity.animator.frameValue];

            display.drawObject(assetsManager.tileSetImage,
                frame.x, frame.y,
                entity.x + frame.offsetX,
                entity.y + frame.offsetY, frame.width, frame.height);
        }

        display.render();
    }

    function update() {
        if (controller.attack.firstDown) game.world.player.attack();
        if (controller.left.active) game.world.player.moveLeft();
        if (controller.right.active) game.world.player.moveRight();
        if (controller.up.active) game.world.player.moveUp();
        if (controller.down.active) game.world.player.moveDown();

        game.update();

        controller.reset();

        if (game.world.door) {
            engine.stop();

            assetsManager.requestJSON('zones/zone' + game.world.door.destinationZone + '.json', (zone) => {
                game.world.setup(zone);
                engine.start();
            });

            return;
        }
    }

    window.eventBus = new EventBus();
    let assetsManager = new AssetsManager();
    let controller = new InputController();
    let display = new Display(document.querySelector('canvas'));
    let soundManager = new SoundManager();
    let game = new Game();
    let engine = new Engine(1000 / 30, render, update);

    display.setBufferSize(game.world.width, game.world.height);

    assetsManager.requestJSON('zones/zone' + game.world.zoneId + '.json', (zone) => {
        game.world.setup(zone);

        assetsManager.requestImage('assets/tiles.png', (image) => {
            assetsManager.tileSetImage = image;

            resize();
            engine.start();
        });
    });

    window.addEventListener('keydown', keyDownUp);
    window.addEventListener('keyup', keyDownUp);
    window.addEventListener('resize', resize);
});