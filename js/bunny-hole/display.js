class Display {
    constructor(canvas) {
        this.buffer = document.createElement('canvas').getContext('2d');
        this.context = canvas.getContext('2d');
    }

    setBufferSize(width, height) {
        this.buffer.canvas.height = height;
        this.buffer.canvas.width = width;
        this.buffer.imageSmoothingEnabled = false;
    }

    drawMap(image, imageColumns, map, mapColumns, tileSize) {
        for (let i = 0; i < map.length; i++) {
            let value = map[i];
            let sourceX = (value % imageColumns) * tileSize;
            let sourceY = Math.floor(value / imageColumns) * tileSize;
            let destinationX = (i % mapColumns) * tileSize;
            let destinationY = Math.floor(i / mapColumns) * tileSize;

            this.buffer.drawImage(image, sourceX, sourceY, tileSize, tileSize, destinationX, destinationY, tileSize, tileSize);
        }
    }

    drawObject(image, sourceX, sourceY, destinationX, destinationY, width, height) {
        this.buffer.drawImage(image, sourceX, sourceY, width, height, Math.round(destinationX), Math.round(destinationY), width, height);
    }

    resize(width, height, heightWidthRatio) {
        if (height / width > heightWidthRatio) {
            this.context.canvas.height = width * heightWidthRatio;
            this.context.canvas.width = width;
        } else {
            this.context.canvas.height = height;
            this.context.canvas.width = height / heightWidthRatio;
        }

        this.context.imageSmoothingEnabled = false;
    }

    render() {
        this.context.drawImage(this.buffer.canvas, 0, 0, this.buffer.canvas.width, this.buffer.canvas.height, 0, 0, this.context.canvas.width, this.context.canvas.height);
    }
}