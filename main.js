const entity_count = 12;
const food_count = 100;

function setup() {
    createCanvas(800, 600);
    world = new World();

    eFact = new entityFactory();
    pray_objs = eFact.create_pray(entity_count);
    pred_objs = eFact.create_pred(entity_count);
    food_objs = Food.create_food(food_count);

    world.add_objects("pray", pray_objs);
    world.add_objects("pred", pred_objs);
    world.add_objects("food", food_objs);
}

function draw() {
    background(0);
    world.update();
}