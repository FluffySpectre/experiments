window.addEventListener('load', function (event) {
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

    function keyDownUp(event) {
        controller.keyDownUp(event.type, event.code);
    }

    function resize(event) {
        display.resize(document.documentElement.clientWidth, document.documentElement.clientHeight, game.world.height / game.world.width);
        display.render();

        const rectangle = display.context.canvas.getBoundingClientRect();

        p.style.left = rectangle.left + 'px';
        p.style.top = rectangle.top + 'px';
        p.style.fontSize = game.world.tileSet.tileSize * rectangle.height / game.world.height + 'px';
    }

    function render() {
        let frame = null;

        display.drawMap(assetsManager.tileSetImage,
            game.world.tileSet.columns, game.world.graphicalMap, game.world.columns, game.world.tileSet.tileSize);

        for (let carrot of game.world.carrots) {
            frame = game.world.tileSet.frames[carrot.animator.frameValue];

            display.drawObject(assetsManager.tileSetImage,
                frame.x, frame.y,
                carrot.x + Math.floor(carrot.width * 0.5 - frame.width * 0.5) + frame.offsetX,
                carrot.y + frame.offsetY, frame.width, frame.height);
        }

        frame = game.world.tileSet.frames[game.world.player.animator.frameValue];

        display.drawObject(assetsManager.tileSetImage,
            frame.x, frame.y,
            game.world.player.x + Math.floor(game.world.player.width * 0.5 - frame.width * 0.5) + frame.offsetX,
            game.world.player.y + frame.offsetY, frame.width, frame.height);

        for (let grass of game.world.grass) {
            frame = game.world.tileSet.frames[grass.animator.frameValue];

            display.drawObject(assetsManager.tileSetImage,
                frame.x, frame.y,
                grass.x + frame.offsetX,
                grass.y + frame.offsetY, frame.width, frame.height);
        }

        p.innerHTML = 'Karotten: ' + game.world.carrotCount;

        display.render();
    }

    function update() {
        if (controller.left.active) game.world.player.moveLeft();
        if (controller.right.active) game.world.player.moveRight();
        if (controller.up.active) {
            game.world.player.jump();
            controller.up.active = false;
        }

        game.update();

        if (game.world.door) {
            engine.stop();

            assetsManager.requestJSON('zones/zone' + game.world.door.destinationZone + '.json', (zone) => {
                game.world.setup(zone);
                engine.start();
            });

            return;
        }
    }

    let assetsManager = new AssetsManager();
    let controller = new InputController();
    let display = new Display(document.querySelector('canvas'));
    let game = new Game();
    let engine = new Engine(1000 / 30, render, update);

    let p = document.getElementById('carrotCounter');
    p.innerHTML = 'Karotten: 0';

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