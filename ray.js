class Ray {
    constructor(pos, angle) {
        this.angle = angle;
        this.pos = pos;
        this.dir = p5.Vector.fromAngle(angle).setMag(300);
    }


    update(parent, pos, velocity, objects, show=false) {

        // Keeps rays position tied to the source vehicles position
        this.pos = pos;
        // Rotate ray by relative velocity angle
        this.dir.setHeading(this.angle + velocity.heading());

        // Ray intersect relative to the position of the rays origin
        let rel_intersect = this.cast(parent, objects);

        if (show) this.show(rel_intersect);

        return rel_intersect;
    }

    show(intersect) {
        stroke(255, 255, 255, 50);
        push();

        // Set drawing origin to ray pos
        // this is why when drawing the line we start at 0,0
        translate(this.pos.x, this.pos.y);

        if (intersect) {
            line(0, 0, intersect.x, intersect.y);
        }
        else {
            line(0, 0, this.dir.x, this.dir.y);
        }

        pop();
    }

    // Returns a vector of the closes object relative to the ray's origin
    cast(parent, objects) {

        // Defining entity pos in variables that correlate with intersect algorithm
        // x3, y3 is the current rays vector
        // x4, y4 is the current end vector of the ray
        const x3 = this.pos.x;
        const y3 = this.pos.y;
        const x4 = this.pos.x + this.dir.x;
        const y4 = this.pos.y + this.dir.y;
        
        let intersects = [];

        let closest_intersect = null
        // Loop over object types
        for (const [key,] of Object.entries(objects)) {

            // No reason to check for object of type parent
            if (parent.constructor.name.toLowerCase() === key) continue;

            // Loop over all objects of type
            objects[key].forEach((object) => {
                let object_intersect = this.object_cast(object, x3, y3, x4, y4);
                if (object_intersect) intersects.push(object_intersect);
            })
            
            // Determine closest intersect
            
            if (closest_intersect == null) closest_intersect = intersects[0];
            intersects.forEach((intersect) => {
                if (closest_intersect.mag() > intersect.mag()) {
                    closest_intersect = intersect;
                }
            })
            
        }

        return closest_intersect;
    }

    object_cast(object, x3, y3, x4, y4){

        let object_intersects = [];
        object.poly.forEach((seg) => {
            
            // Build vectors from line segment
            const x1 = seg[0].x;
            const y1 = seg[0].y;
            const x2 = seg[1].x;
            const y2 = seg[1].y;

            // if denominator is zero the ray is parallel to the target
            // line segment therefore it will never cross it, so return
            const den = ((x1-x2)*(y3-y4) - (y1-y2)*(x3-x4));
            if (den === 0) {
                return null;
            }

            // Magic stuff
            const t = ((x1-x3)*(y3-y4) - (y1-y3)*(x3-x4))/den;
            const u = ((x1-x3)*(y1-y2) - (y1-y3)*(x1-x2))/den;

            if (t > 0 && t < 1 && u > 0) {
                let pt = createVector();

                // Subtract ray pos vector from calculation
                // so we can do magnitude calculations
                pt.x = x1 + t*(x2-x1) - x3;
                pt.y = y1 + t*(y2-y1) - y3;

                // Check that is intersect point is within the magnitude
                // of the ray vector, technically don't have to do this
                // for origin tracing but if we ever want to look at collision
                // tracing we will need it
                if (pt.mag() <= this.dir.mag()) {
                    object_intersects.push(pt);
                }
            }
        })

        // Check that we found a intersect no point in looping for min
        // if we never found a intersect point for this object
        if (object_intersects.length === 0) {
            return null
        }

        const rel_obj_pos = object.pos.copy().sub(this.pos);
        return rel_obj_pos;
        
        //NOTE: not needed if not doing collision detection
        //// Calculate closes intersect for object
        //let min_intersect = object_intersects[0];
        //object_intersects.forEach((intersect) => {
        //    if (min_intersect.mag() > intersect.mag()) min_intersect = intersect; 
        //})
//
        //return min_intersect
    }
}