class WorldObject {
    color: string;
    pos: p5.Vector;
    dir: p5.Vector | null;
    vel: p5.Vector | null;
    accel: p5.Vector | null;
    maxVel: number;
    maxAccel: number;
    health: number;
    energy: number;
    poly: p5.Vector[][];

    constructor(
        color: string,
        pos: p5.Vector,
        dir: p5.Vector | null = null,
        vel: p5.Vector | null = null,
        accel: p5.Vector | null = null,
        maxVel: number = 0,
        maxAccel: number = 0
    ) {
        this.color = color;
        this.pos = pos;
        this.dir = dir;
        this.vel = vel;
        this.accel = accel;
        this.maxVel = maxVel;
        this.maxAccel = maxAccel;
        this.health = 100;
        this.energy = 100;
        this.poly = [];
    }

    _getHealth(): number {
        return this.health;
    }

    _setHealth(health: number): void {
        this.health = health;
    }

    _getPos(): p5.Vector {
        return this.pos.copy();
    }

    _setPos(pos: p5.Vector): void {
        this.pos = pos;
    }

    _getDir(): p5.Vector {
        return this.dir!.copy();
    }

    _setDir(angle: number): void {
        this.dir!.setHeading(angle);
    }

    _getVel(): p5.Vector {
        if (this.vel === null) return createVector();
        return this.vel.copy();
    }

    _setVel(): void {
        this.vel!.add(this.accel!);
        this.vel!.limit(this.maxVel);
    }

    _getAccel(): p5.Vector {
        return this.accel!.copy();
    }

    _setAccel(desiredVect: p5.Vector): void {
        const dVect = desiredVect.copy();
        this.accel = dVect.sub(this.vel!);
        this.accel.limit(this.maxAccel);
    }

    _getVectRelPos(vector: p5.Vector): p5.Vector {
        const cVector = vector.copy();
        return cVector.sub(this.pos);
    }

    _getVectRelMag(vector: p5.Vector): number {
        const relPos = this._getVectRelPos(vector);
        return relPos.mag();
    }

    _checkBounds(): void {
        if (this.pos.x > width) {
            this.pos.x = 0;
        } else if (this.pos.x < 0) {
            this.pos.x = width;
        }

        if (this.pos.y > height) {
            this.pos.y = 0;
        } else if (this.pos.y < 0) {
            this.pos.y = height;
        }
    }
}

export { WorldObject };
