
class Food extends WorldObject {
    constructor(pos) {
        super('red', pos);
        this.vert_length = 10;
        this.create_polys();
    }

    create_polys() {

        const p1 = createVector(
            this.pos.x - this.vert_length/2, this.pos.y - this.vert_length/2);
        const p2 = createVector(
            this.pos.x - this.vert_length/2, this.pos.y + this.vert_length/2);
        const p3 = createVector(
            this.pos.x + this.vert_length/2, this.pos.y + this.vert_length/2);
        const p4 = createVector(
            this.pos.x + this.vert_length/2, this.pos.y - this.vert_length/2);

        this.poly = [
            [p1, p2],
            [p2, p3],
            [p3, p4],
            [p4, p1]
        ]
    }

    update() {
        this.show();
    }

    show() {

        const current_pos = this._get_pos();

        rectMode(CENTER);
        fill(this.color);
        stroke(this.color);
        push();
        translate(current_pos.x, current_pos.y);
        rect(0,0,this.vert_length,this.vert_length);
        pop();
    }
}