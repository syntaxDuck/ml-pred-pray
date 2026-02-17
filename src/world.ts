import { CONFIG } from './config';
import { EntityFactory, Pray, Pred } from './entity';
import { Food } from './food';
import { WorldObject } from './worldObject';
import { Genome } from './genome';
import { GenerationManager } from './generation';

interface WorldObjects {
    [key: string]: WorldObject[];
}

interface SpatialGrid {
    [key: string]: WorldObject[];
}

class World {
    x: number;
    y: number;
    worldObjects: WorldObjects;
    entityFactory: EntityFactory;
    generationManager: GenerationManager;
    gridSize: number;
    spatialGrid: SpatialGrid;
    isGenerationComplete: boolean;
    bestPreyGenome: Genome | null;
    bestPredGenome: Genome | null;

    constructor(entityFactory: EntityFactory) {
        this.x = width;
        this.y = height;
        this.worldObjects = {};
        this.entityFactory = entityFactory;
        this.generationManager = new GenerationManager();
        this.gridSize = 100;
        this.spatialGrid = {};
        this.isGenerationComplete = false;
        this.bestPreyGenome = null;
        this.bestPredGenome = null;
    }

    initializePopulation(): void {
        const prey = this.entityFactory.createPrey(CONFIG.entities.preyCount);
        const predators = this.entityFactory.createPredator(CONFIG.entities.predatorCount);
        const food = Food.createFood(CONFIG.food.initialCount);

        this.worldObjects = {
            'prey': prey,
            'predator': predators,
            'food': food
        };

        this.generationManager.startGeneration();
        this.isGenerationComplete = false;
    }

    updateSpatialGrid(): void {
        this.spatialGrid = {};
        for (const [, array] of Object.entries(this.worldObjects)) {
            array.forEach((obj: WorldObject) => {
                const cellX = Math.floor(obj.pos.x / this.gridSize);
                const cellY = Math.floor(obj.pos.y / this.gridSize);
                const cellKey = `${cellX},${cellY}`;

                if (!this.spatialGrid[cellKey]) {
                    this.spatialGrid[cellKey] = [];
                }
                this.spatialGrid[cellKey].push(obj);
            });
        }
    }

    getNearbyObjects(pos: p5.Vector, radius: number = 1): WorldObject[] {
        const nearby: WorldObject[] = [];
        const cellX = Math.floor(pos.x / this.gridSize);
        const cellY = Math.floor(pos.y / this.gridSize);

        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                const cellKey = `${cellX + dx},${cellY + dy}`;
                if (this.spatialGrid[cellKey]) {
                    nearby.push(...this.spatialGrid[cellKey]);
                }
            }
        }
        return nearby;
    }

    addObjects(entityName: string, entityArray: WorldObject[]): void {
        if (entityName in this.worldObjects) {
            this.worldObjects[entityName].push(...entityArray);
        } else {
            this.worldObjects[entityName] = entityArray;
        }
    }

    removeObject(key: string, array: WorldObject[], targetObj: WorldObject): void {
        const newArray = array.filter((obj: WorldObject) => {
            return obj !== targetObj;
        });

        this.worldObjects[key] = newArray;
    }

    updateObjects(showDebug: boolean = false): void {
        if (this.isGenerationComplete) return;

        this.updateSpatialGrid();
        this.generationManager.update();

        for (const [key, array] of Object.entries(this.worldObjects)) {
            const aliveObjects: WorldObject[] = [];
            
            array.forEach((object: WorldObject) => {
                if (object.health <= 0) {
                    if (object instanceof Pray || object instanceof Pred) {
                        (object as any).calculateFitness();
                    }
                } else {
                    aliveObjects.push(object);
                    
                    const nearbyObjects = this.getNearbyObjects(object.pos);
                    const nearbyByType: WorldObjects = {};
                    nearbyObjects.forEach((obj: WorldObject) => {
                        const type = obj.constructor.name;
                        if (!nearbyByType[type]) nearbyByType[type] = [];
                        nearbyByType[type].push(obj);
                    });
                    (object as any).update(nearbyByType, showDebug);
                }
            });

            this.worldObjects[key] = aliveObjects;
        }

        const preyAlive = this.worldObjects["prey"] ? this.worldObjects["prey"].length : 0;
        const predAlive = this.worldObjects["predator"] ? this.worldObjects["predator"].length : 0;
        const preyTotal = CONFIG.entities.preyCount;
        const predTotal = CONFIG.entities.predatorCount;

        const isComplete = this.generationManager.isGenerationComplete(
            Math.min(preyAlive, predAlive),
            Math.min(preyTotal, predTotal)
        );

        if (isComplete) {
            this.endGeneration();
        }

        this.generationManager.update();
        this.maybeRegenerateFood();
    }

    endGeneration(): void {
        const preyGenomes: Genome[] = [];
        const predGenomes: Genome[] = [];

        if (this.worldObjects["prey"]) {
            this.worldObjects["prey"].forEach((obj: WorldObject) => {
                if (obj instanceof Pray) {
                    (obj as any).calculateFitness();
                    const genome = obj.genome;
                    if (genome) {
                        genome.fitness = (obj as any).fitness || 0;
                        preyGenomes.push(genome);
                    }
                }
            });
        }

        if (this.worldObjects["predator"]) {
            this.worldObjects["predator"].forEach((obj: WorldObject) => {
                if (obj instanceof Pred) {
                    (obj as any).calculateFitness();
                    const genome = obj.genome;
                    if (genome) {
                        genome.fitness = (obj as any).fitness || 0;
                        predGenomes.push(genome);
                    }
                }
            });
        }

        const preyCount = preyGenomes.length;
        const predCount = predGenomes.length;
        
        const needMorePrey = preyCount < CONFIG.entities.minPreyForBalance;
        const needMorePred = predCount < CONFIG.entities.minPredatorsForBalance;

        if (preyCount === 0 || predCount === 0) {
            console.log("Extinction event - restarting ecosystem");
            this.initializePopulation();
            return;
        }

        const newPopulations = this.generationManager.evolve(
            preyGenomes,
            predGenomes
        );

        this.worldObjects["prey"] = this.entityFactory.createPreyFromGenomes(newPopulations.prey);
        this.worldObjects["predator"] = this.entityFactory.createPredatorFromGenomes(newPopulations.predator);

        const food = Food.createFood(CONFIG.food.initialCount);
        this.worldObjects["food"] = food;

        this.generationManager.startGeneration();
        
        if (needMorePrey || needMorePred) {
            console.log(`Balance adjusted - Prey: ${preyCount}, Predators: ${predCount}`);
        }
    }

    nextGeneration(): void {
        this.endGeneration();
    }

    maybeRegenerateFood(): void {
        const preyCount = this.worldObjects["prey"] ? this.worldObjects["prey"].length : 0;
        const predCount = this.worldObjects["predator"] ? this.worldObjects["predator"].length : 0;
        const foodCount = this.worldObjects["food"] ? this.worldObjects["food"].length : 0;
        
        const shouldSpawnNormally = this.generationManager.frameCount % CONFIG.food.regenerateRate === 0;
        const isFoodLow = foodCount < CONFIG.food.emergencySpawnThreshold;
        const arePredatorsStarving = predCount > preyCount * 0.5;
        
        if (shouldSpawnNormally && foodCount < CONFIG.food.maxCount) {
            const spawnAmount = isFoodLow && arePredatorsStarving 
                ? CONFIG.food.emergencySpawnAmount 
                : CONFIG.food.regenerateAmount;
            const newFood = Food.createFood(spawnAmount);
            this.addObjects("food", newFood);
        }
        
        if (isFoodLow && this.generationManager.frameCount % 30 === 0) {
            const emergencyFood = Food.createFood(CONFIG.food.emergencySpawnAmount);
            this.addObjects("food", emergencyFood);
        }
    }

    createFood(count: number): void {
        const worldFood: Food[] = [];

        for (let i = 0; i < count; i++) {
            const food = new Food(createVector(random(width), random(height)));
            worldFood.push(food);
        }

        this.addObjects("food", worldFood);
    }

    update(showDebug: boolean = false): void {
        this.updateObjects(showDebug);
    }

    togglePause(): void {
        this.generationManager.isPaused = !this.generationManager.isPaused;
    }

    showStats(): void {
        fill(255);
        noStroke();
        textSize(14);
        textAlign(LEFT, TOP);

        const prayCount = this.worldObjects["prey"] ? this.worldObjects["prey"].length : 0;
        const predCount = this.worldObjects["predator"] ? this.worldObjects["predator"].length : 0;
        const foodCount = this.worldObjects["food"] ? this.worldObjects["food"].length : 0;
        const gen = this.generationManager.generationNumber;
        const timeLeft = Math.max(0, this.generationManager.generationDuration - this.generationManager.frameCount);
        const preySurvivalRate = CONFIG.entities.preyCount > 0 ? (prayCount / CONFIG.entities.preyCount * 100).toFixed(0) : 0;
        const predSurvivalRate = CONFIG.entities.predatorCount > 0 ? (predCount / CONFIG.entities.predatorCount * 100).toFixed(0) : 0;
        
        const allTimeBest = this.generationManager.getAllTimeBestPreyFitness();

        text(`Generation: ${gen}`, 10, 10);
        text(`Time: ${Math.floor(timeLeft / 60)}s / ${Math.floor(this.generationManager.generationDuration / 60)}s`, 10, 28);
        text(`Prey: ${prayCount}/${CONFIG.entities.preyCount} (${preySurvivalRate}%)`, 10, 46);
        text(`Predators: ${predCount}/${CONFIG.entities.predatorCount} (${predSurvivalRate}%)`, 10, 64);
        text(`Food: ${foodCount}`, 10, 82);
        text(`Current Best: ${this.generationManager.currentPreyBestFitness.toFixed(1)}`, 10, 100);
        text(`Avg Fitness: ${this.generationManager.currentPreyAvgFitness.toFixed(1)}`, 10, 118);
        text(`All-Time Best: ${allTimeBest.toFixed(1)}`, 10, 136);

        if (this.generationManager.isPaused) {
            fill(255, 255, 0);
            textAlign(RIGHT, TOP);
            text("PAUSED (Press P)", width - 10, 10);
        }
    }
}

export { World };
