import { CONFIG } from './config';
import { World } from './world';
import { EntityFactory } from './entity';

let world: World;
let eFact: EntityFactory;

function setup(): void {
    createCanvas(CONFIG.canvas.width, CONFIG.canvas.height);

    eFact = new EntityFactory();
    world = new World(eFact);

    world.initializePopulation();
}

function keyPressed(): void {
    if (key === 'd' || key === 'D') {
        CONFIG.debug.showRays = !CONFIG.debug.showRays;
    }
    
    if (key === 'p' || key === 'P') {
        world.togglePause();
    }
    
    if (key === 'n' || key === 'N') {
        world.nextGeneration();
    }
    
    if (key === 'r' || key === 'R') {
        world.initializePopulation();
    }
}

function draw(): void {
    background(0);
    world.update(CONFIG.debug.showRays);
    world.showStats();

    if (CONFIG.debug.showRays) {
        fill(255);
        noStroke();
        textAlign(RIGHT, TOP);
        text("Debug: ON | P: Pause | N: Next Gen | R: Reset | D: Toggle", width - 10, 10);
    } else {
        fill(255);
        noStroke();
        textAlign(RIGHT, TOP);
        text("P: Pause | N: Next Gen | R: Reset | D: Debug", width - 10, 10);
    }
}

(window as any).setup = setup;
(window as any).draw = draw;
(window as any).keyPressed = keyPressed;
