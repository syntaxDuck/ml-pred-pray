const pray_count = 20;
const pred_count = 20;

function setup() {
    createCanvas(800, 600);
    world = new World();

    eFact = new entityFactory();
    pray_objs = eFact.create_pray(pray_count);
    pred_objs = eFact.create_pred(pred_count);

    world.add_objects("pray", pray_objs);
    world.add_objects("pred", pred_objs);
}

function draw() {
    background(0);
    world.update();
}