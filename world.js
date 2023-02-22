class World {
    constructor() {
        this.x = width;
        this.y = height;
        this.world_objects = {};

        this.create_food();
    }

    add_objects(entity_name, entity_array) {
        if (entity_name in this.world_objects) {
            this.world_objects[entity_name].push(...entity_array);
        }
        else {
            this.world_objects[entity_name] = entity_array;
        }
    }

    update_objects() {
        for (const [key, array] of Object.entries(this.world_objects)){
            array.forEach((object) => {
                object.update(this.world_objects);
            });
        }
    }
    
    create_food() {
        let food_count = 1;
        let world_food = [];

        for(let i = 0; i < food_count; i++) {
            let food = new Food(createVector(random(width), random(height)));
            world_food.push(food);
        }

        this.add_objects("food", world_food);
    }

    update() {
        this.update_objects();
    }
}

class WorldObject {
    constructor(color, pos, dir=null, vel=null, accel=null, max_vel=0, max_accel=0) {

        this.color = color;
        
        this.pos = pos;
        this.dir = dir;
        this.vel = vel;
        this.accel = accel;

        this.max_vel = max_vel;
        this.max_accel = max_accel;
    }

    _get_pos() {
        return this.pos.copy();
    }

    _set_pos(pos) {
        this.pos = pos;
    }

    _get_dir() {
        return this.dir.copy();
    }

    _set_dir(angle) {
        this.dir.setHeading(angle);
    }

    _get_vel() {
        // If vel is null return empty vector
        if (this.vel === null) return createVector();
        return this.vel.copy();
    }

    _set_vel() {
        this.vel.add(this.accel);
        this.vel.limit(this.max_vel);
    }

    _get_accel() {
        return this.accel.copy();
    }

    _set_accel(desired_vect) {
        const d_vect = desired_vect.copy();

        this.accel = d_vect.sub(this.vel);
        this.accel.limit(this.max_accel);
    }

    _get_vect_rel_pos(vector) {
        const c_vector = vector.copy();
        return c_vector.sub(this.pos);
    }

    _get_vect_rel_mag(vector) {
        let rel_pos = this._get_vect_rel_pos(vector);
        return rel_pos.mag();
    }

    _check_bounds() {
        if (this.pos.x > width) {
            this.pos.x = 0;
        }
        else if (this.pos.x < 0) {
            this.pos.x = width;
        }

        if (this.pos.y > height) {
            this.pos.y = 0;
        }
        else if (this.pos.y < 0) {
            this.pos.y = height;
        }
    }
}

