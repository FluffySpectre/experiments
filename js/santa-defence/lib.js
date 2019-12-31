function rectContainsPoint(rx, ry, rw, rh, px, py) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

function rectContainsRect(r1x, r1y, r1w, r1h, r2x, r2y, r2w, r2h) {
    return !(r2x > r1x + r1w ||
        r2x + r2w < r1x ||
        r2y > r1y + r1h ||
        r2y + r2h < r1x);
}

function rectContainsCircle(rx, ry, rw, rh, cx, cy, cr) {
    let distX = Math.abs(cx - rx - rw / 2);
    let distY = Math.abs(cy - ry - rh / 2);

    if (distX > (rw / 2 + cr)) { return false; }
    if (distY > (rh / 2 + cr)) { return false; }

    if (distX <= (rw / 2)) { return true; }
    if (distY <= (rh / 2)) { return true; }

    let dx = distX - rw / 2;
    let dy = distY - rh / 2;
    return (dx * dx + dy * dy <= (cr * cr));
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

class Vector {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    add(v) {
        if (v instanceof Vector) {
            this.x += v.x;
            this.y += v.y;
        } else {
            this.x += v;
            this.y += v;
        }
        return this;
    }

    sub(v) {
        if (v instanceof Vector) {
            this.x -= v.x;
            this.y -= v.y;
        } else {
            this.x -= v;
            this.y -= v;
        }
        return this;
    }

    mult(v) {
        if (v instanceof Vector) {
            this.x *= v.x;
            this.y *= v.y;
        } else {
            this.x *= v;
            this.y *= v;
        }
        return this;
    }

    divide(v) {
        if (v instanceof Vector) {
            if (v.x != 0) this.x /= v.x;
            if (v.y != 0) this.y /= v.y;
        } else {
            if (v != 0) {
                this.x /= v;
                this.y /= v;
            }
        }
        return this;
    }

    normalize() {
        return this.divide(this.mag());
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    mag() {
        return Math.sqrt(this.dot(this));
    }

    copy() {
        return new Vector(this.x, this.y);
    }
}