import { WorldObject } from './worldObject';

class Ray extends WorldObject {
    angle: number;

    constructor(pos: p5.Vector, angle: number, length: number = 300) {
        const dir = p5.Vector.fromAngle(angle).setMag(length);
        super("white", pos, dir);
        this.angle = angle;
    }

    update(parent: WorldObject, objects: { [key: string]: WorldObject[] }, show: boolean = false): WorldObject | null {
        this._setPos(parent.pos);
        this._setDir(this.angle + parent.vel!.heading());

        const objIntersected = this.cast(parent, objects);

        if (show) this.show(objIntersected);

        return objIntersected;
    }

    compareObjPos(currentObj: WorldObject, checkObj: WorldObject): WorldObject | null {
        const currentObjVect = currentObj._getPos();
        const currentObjMag = this._getVectRelMag(currentObjVect);

        const checkObjVect = checkObj._getPos();
        const checkObjMag = this._getVectRelMag(checkObjVect);

        if (currentObjMag > checkObjMag) {
            return checkObj;
        }
        return null;
    }

    cast(parent: WorldObject, objects: { [key: string]: WorldObject[] }): WorldObject | null {
        const x3 = this.pos.x;
        const y3 = this.pos.y;
        const x4 = this.pos.x + this.dir!.x;
        const y4 = this.pos.y + this.dir!.y;

        let intersectedObjs: WorldObject[] = [];
        let closestObj: WorldObject | null = null;

        for (const [key] of Object.entries(objects)) {
            const objs = objects[key];
            if (!objs || objs.length === 0) continue;

            for (let i = 0; i < objs.length; i++) {
                const object = objs[i];
                if (object === parent) continue;

                const dist = this._getVectRelMag(object.pos);
                if (dist > this.dir!.mag()) continue;

                const intersectedObj = this.objectCast(object, x3, y3, x4, y4);
                if (intersectedObj) intersectedObjs.push(intersectedObj);
            }

            if (intersectedObjs.length === 0) continue;

            if (closestObj === null) {
                closestObj = intersectedObjs[0];
            }
            for (let i = 0; i < intersectedObjs.length; i++) {
                const compared = this.compareObjPos(closestObj, intersectedObjs[i]);
                if (compared) closestObj = compared;
            }
        }
        return closestObj;
    }

    objectCast(object: WorldObject, x3: number, y3: number, x4: number, y4: number): WorldObject | null {
        const objectIntersects: p5.Vector[] = [];
        
        if (!object.poly) return null;
        
        object.poly.forEach((seg: p5.Vector[]) => {
            const x1 = seg[0].x;
            const y1 = seg[0].y;
            const x2 = seg[1].x;
            const y2 = seg[1].y;

            const den = ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
            if (den === 0) {
                return;
            }

            const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
            const u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / den;

            if (t > 0 && t < 1 && u > 0) {
                const pt = createVector();
                pt.x = x1 + t * (x2 - x1) - x3;
                pt.y = y1 + t * (y2 - y1) - y3;

                if (pt.mag() <= this.dir!.mag()) {
                    objectIntersects.push(pt);
                }
            }
        });

        if (objectIntersects.length === 0) {
            return null;
        }

        return object;
    }

    show(objIntersected: WorldObject | null): void {
        stroke(this.color);
        push();
        translate(this.pos.x, this.pos.y);
        if (objIntersected) {
            const objVect = objIntersected._getPos().sub(this.pos);
            line(0, 0, objVect.x, objVect.y);
        } else {
            line(0, 0, this.dir!.x, this.dir!.y);
        }
        pop();
    }
}

export { Ray };
