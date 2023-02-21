
class Entity extends WorldObject {
    constructor(pos, color, fov, fov_dens=1) {
        super(color, pos, null, createVector(1), createVector(), 2, 0.1)
        
        this.width = 10;
        this.food = null;

        this.rays = [];
        for (var i = 0; i < fov; i += fov_dens) {
            this.rays.push(new Ray(this.pos, radians(i-fov/2)));
        }

        this.update_poly();
    }

    // Draw Method
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

    // Update Methods
    update(world_objects) {
        this.update_pos();
        this.update_poly();
        this.update_vision(world_objects);
        this.show();
        this.wander();
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

    //TODO: think of better naming schema for these movement parameters
    // feels clunky right now
    update_pos() {
        const current_pos = this._get_pos();
        this._set_vel();
        current_pos.add(this._get_vel())
        this._set_pos(current_pos);
        
        this._check_bounds();
    }

    update_vision(world_objects) {
        let view_objs = {};
        this.rays.forEach((ray) => {
            let obj = ray.update(this,world_objects, true);
            if (obj) {
                const obj_type = obj.constructor.name;
                if (obj_type in view_objs) {
                    view_objs[obj_type].push(obj);
                }
                else {
                    view_objs[obj_type] = [obj];  
                }
            }
        });

        return view_objs;
    }

    // Object Parsing Methods
    get_objects_of_type(view_objs, type) {
        if (type in view_objs) return view_objs[type];
        return null;
    }

    check_for_closest_object(view_objs) {
        let closest_obj = null;
        for (const[, array] of Object.entries(view_objs)) {
            if (closest_obj === null && array.length !== 0) closest_obj = array[0];
            array.forEach((obj) => {
                if (this._get_vect_rel_mag(obj.pos) < this._get_vect_rel_mag(closest_obj.pos)) {
                    closest_obj = obj;
                }
            })   
        }
        
        return closest_obj;
    }

    check_for_closest_object_of_type(view_objs, type) {
        let closest_obj = null
        const typed_objs = this.get_objects_of_type(view_objs, type);
        closest_obj = typed_objs[0];
        typed_objs.forEach((obj) => {
            if (this._get_vect_rel_mag(obj.pos) < this._get_vect_rel_mag(closest_obj.pos)) {
                closest_obj = obj;
            }
        })
        
        return closest_obj;
    }

    // Movement Methods
    apply_force(rel_vector) {
        this._set_accel(rel_vector);
    }

    seek(vector) {
        let target_vect = this._get_vect_rel_pos(vector);
        this.apply_force(target_vect);
    }

    avoid(vector) {
        let target_vect = this._get_vect_rel_pos(vector);
        target_vect.mult(-1);
        this.apply_force(target_vect);
    }

    //TODO: Could use some tweaking
    wander() {
        const random_angle = random(TWO_PI);
        const new_dir = p5.Vector.fromAngle(random_angle,1).add(this.vel).limit(this.max_vel);
        this.apply_force(new_dir);
    }

    // Behavioral
    find_food() {

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