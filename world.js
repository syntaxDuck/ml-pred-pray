class World {
    constructor() {
        this.x = width;
        this.y = height;
        this.world_objects = {};

        this.best_pray = null;
        this.best_pred = null;
    }

    add_objects(entity_name, entity_array) {
        if (entity_name in this.world_objects) {
            this.world_objects[entity_name].push(...entity_array);
        }
        else {
            this.world_objects[entity_name] = entity_array;
        }
    }

    remove_object(key, array, target_obj) {
        const new_array = array.filter((obj) => {
            return obj !== target_obj;
        })

        this.world_objects[key] = new_array;
    }

    update_objects() {
        for (const [key, array] of Object.entries(this.world_objects)){
            array.forEach((object) => {
                if (object.health <= 0) this.remove_object(key, array, object)
                else object.update(this.world_objects);
            });
        }

        const pray_left = this.world_objects["pray"].length;
        const pred_left = this.world_objects["pred"].length;
        if (!this.best_pray && pray_left <= 4) {
            this.best_pray = this.world_objects["pray"];
            console.log(this.best_pray);
        }

        if (!this.best_pred && pred_left <= 4) {
            this.best_pred = this.world_objects["pred"];
            console.log(this.best_pred);
        }
    }
    
    create_food(count) {
        let world_food = [];

        for(let i = 0; i < count; i++) {
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

        // Features
        this.color = color;
        
        // Movement state
        this.pos = pos;
        this.dir = dir;
        this.vel = vel;
        this.accel = accel;

        // Movement constraints
        this.max_vel = max_vel;
        this.max_accel = max_accel;

        // Status State
        this.health = 100;
        this.energy = 100;
    }

    _get_health() {
        return this.health;
    }

    _set_health(health) {
        this.health = health
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

