import { WorldObject } from './worldObject';

class Food extends WorldObject {
    width: number;
    poly: p5.Vector[][];

    constructor(pos: p5.Vector) {
        super('white', pos);
        this.width = 5;
        this.poly = [];
        this.createPolys();
    }

    createPolys(): void {
        const p1 = createVector(
            this.pos.x - this.width / 2, this.pos.y - this.width / 2);
        const p2 = createVector(
            this.pos.x - this.width / 2, this.pos.y + this.width / 2);
        const p3 = createVector(
            this.pos.x + this.width / 2, this.pos.y + this.width / 2);
        const p4 = createVector(
            this.pos.x + this.width / 2, this.pos.y - this.width / 2);

        this.poly = [
            [p1, p2],
            [p2, p3],
            [p3, p4],
            [p4, p1]
        ];
    }

    update(): void {
        this.show();
    }

    show(): void {
        const currentPos = this._getPos();

        rectMode(CENTER);
        fill(this.color);
        stroke(this.color);
        push();
        translate(currentPos.x, currentPos.y);
        rect(0, 0, this.width, this.width);
        pop();
    }

    static createFood(count: number): Food[] {
        const foodArray: Food[] = [];

        for (let i = 0; i < count; i++) {
            const food = new Food(createVector(random(width), random(height)));
            foodArray.push(food);
        }

        return foodArray;
    }
}

export { Food };
