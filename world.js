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
        let food_count = 20;
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

