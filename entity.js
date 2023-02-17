
class Entity {
    constructor(pos, color, fov, fov_dens=1) {
        this.color = color;
        this.width = 10;

        this.max_vel = 2;
        this.max_accel = 0.1;

        this.accel = createVector();
        this.pos = pos;
        this.vel = createVector(1);

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
        let new_velocity = this.vel.copy();
        new_velocity.add(vector.setMag(this.max_accel));
        this.vel = new_velocity.limit(this.max_vel);
    }

    update(world_objects) {
        this.update_pos();
        this.update_poly();
        this.update_vision(world_objects);
        this.show();
    }

    update_pos() {
        this.pos.add(this.vel);

        //this.position = createVector(mouseX,mouseY);
        
        // Keeps entity in bounds
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

    update_vision(world_objects) {

        let view_intersects = [];
        this.rays.forEach((ray) => {
            let intersect = ray.update(this, this.pos, this.vel, world_objects, true);
            if (intersect) {
                view_intersects.push(intersect);
            }
        });

        if (view_intersects.length !== 0) {
 
            let min = view_intersects[0];
            view_intersects.forEach((intersect) => {
                if (intersect.mag() < min.mag()) {
                    min = intersect
                }
            })
 
            this.apply_force(min)
        }
         
    }

    show() {
        noStroke();
        stroke(this.color)
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