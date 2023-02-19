
class Entity extends WorldObject {
    constructor(pos, color, fov, fov_dens=1) {
        super(color, pos, null, createVector(1), createVector(), 2, 0.1)
        
        this.width = 10;

        this.rays = [];
        for (var i = 0; i < fov; i += fov_dens) {
            this.rays.push(new Ray(this.pos, radians(i-fov/2)));
        }

        this.update_poly();
    }

    update_poly() {

        const p1 = createVector(-this.width + this.pos.x, -this.width/2 + this.pos.y);
        const p2 = createVector(this.width/2 + this.pos.x, 0 + this.pos.y)
        const p3 = createVector(-this.width + this.pos.x, this.width/2 + this.pos.y);

        this.poly = [
            [p1, p2],
            [p2, p3],
            [p3, p1]
        ]
    }

    apply_force(vector) {
        let target_vect = this._get_vect_rel_pos(vector);
        this._set_vel(target_vect);
    }

    update(world_objects) {
        this.update_pos();
        this.update_poly();
        this.update_vision(world_objects);
        this.show();
    }

    update_pos() {

        const current_pos = this._get_pos();
        current_pos.add(this._get_vel())
        this._set_pos(current_pos);
        
        this._check_bounds();
    }

    update_vision(world_objects) {

        let view_objs = [];
        this.rays.forEach((ray) => {
            let obj = ray.update(this,world_objects, true);
            if (obj) view_objs.push(obj);
        });

        if (view_objs.length === 0) return 
        let min = view_objs[0];
        view_objs.forEach((obj) => {
            if (this._get_vect_rel_mag(obj.pos) < this._get_vect_rel_mag(min.pos)) {
                min = obj;
            }
        })
        
        this.apply_force(min._get_pos());
    }

    show() {
        noStroke();
        fill(this.color);
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        triangle(
            -this.width, -this.width/2,
            -this.width, this.width/2, 
            this.width/2, 0
            );
        pop();
    }
}

class Pray extends Entity {
    constructor(pos) {
        const color = 'green';
        const fov = 180;
        const fov_dens = 1;
        super(pos,color,fov,fov_dens);
    }
}

class Pred extends Entity {
    constructor(pos) {
        const color = 'red';
        const fov = 90;
        const fov_dens = 1;
        super(pos,color,fov,fov_dens);
    }
}

class entityFactory {
    constructor() {

    }

    create_pray(count) {
        let pray_array = [];
        for (let i = 0; i<count; i++) {
            pray_array.push(new Pray(createVector(random(width/2), random(height/2))));
        }

        return pray_array;
    }

    create_pred(count) {
        let pred_array = [];
        for (let i = 0; i<count; i++) {
            pred_array.push(new Pred(createVector(random(width/2), random(height/2))));
        }

        return pred_array;
    }
}