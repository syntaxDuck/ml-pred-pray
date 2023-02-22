
class Entity extends WorldObject {
    constructor(pos, color, fov, fov_dens=1) {
        super(color, pos, null, createVector(1), createVector(), 2, 0.1)
        
        // Perm state
        this.width = 10;
        this.food = null;

        // Movement State
        this.view_objs = {};
        this.wander_theta = PI/2;

        // Create vision cone
        this.rays = [];
        for (var i = 0; i < fov; i += fov_dens) {
            this.rays.push(new Ray(this.pos, radians(i-fov/2)));
        }

        // Create initial poly
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

    update_pos() {
        const current_pos = this._get_pos();
        current_pos.add(this._get_vel())
        this._set_pos(current_pos);
        
        this._check_bounds();

        const obj = this.check_for_closest_object();
        this.persue(obj);
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

        this.view_objs = view_objs;
    }

    // Object Parsing Methods
    get_objects_of_type(view_objs, type) {
        if (type in view_objs) return view_objs[type];
        return null;
    }

    check_for_closest_object() {
        let closest_obj = null;
        for (const[, array] of Object.entries(this.view_objs)) {
            if (closest_obj === null && array.length !== 0) closest_obj = array[0];
            array.forEach((obj) => {
                if (this._get_vect_rel_mag(obj.pos) < this._get_vect_rel_mag(closest_obj.pos)) {
                    closest_obj = obj;
                }
            })   
        }
        
        return closest_obj;
    }

    check_for_closest_object_of_type(type) {
        let closest_obj = null
        const typed_objs = this.get_objects_of_type(this.view_objs, type);
        closest_obj = typed_objs[0];
        typed_objs.forEach((obj) => {
            if (this._get_vect_rel_mag(obj.pos) < this._get_vect_rel_mag(closest_obj.pos)) {
                closest_obj = obj;
            }
        })
        
        return closest_obj;
    }

    // Movement Methods

    // Apply steering force in the direction of the rel_vector
    apply_force(rel_vector) {
        this._set_accel(rel_vector);
        this._set_vel()
    }

    // Takes an absolute vector and steers the entity towards it
    seek(abs_vector) {
        let target_vect = this._get_vect_rel_pos(abs_vector);
        this.apply_force(target_vect);
    }

    // Takes an absolute vector and steers the entity away from it
    avoid(abs_vector) {
        let target_vect = this._get_vect_rel_pos(abs_vector);
        target_vect.mult(-1);
        this.apply_force(target_vect);
    }

    wander() {
        const wander_pt = this._get_vel();
        wander_pt.setMag(100);
        wander_pt.add(this.pos);

        let wander_radius = 25;

        let x = wander_radius * cos(this.wander_theta);
        let y = wander_radius * sin(this.wander_theta);

        wander_pt.add(x,y);

        // Create relative point from entity
        let target_pt = wander_pt.sub(this.pos);
        this.apply_force(target_pt)

        // Randomly select the angle that the wander point will be translated
        // along the projected circle created by wander_radius
        let displacement = 0.3;
        this.wander_theta += random(-displacement, displacement);
    }

    // NOTE: think this is working but needs some investigation
    // need to decuple the behavior of pred and pray objects
    persue(obj) {

        if (obj === null) return;

        let target_pt = null;
        
        // Get an absolute vector of target pos plus it's velocity
        if (obj.vel !== null) {
            target_pt = obj._get_vel();
            target_pt.add(obj.pos)
        }
        else target_pt = obj._get_pos();

        this.seek(target_pt);
    }

    evade(obj) {}

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