import { CONFIG } from './config';
import { WorldObject } from './worldObject';
import { Ray } from './ray';
import { Genome } from './genome';

class Entity extends WorldObject {
    genome: Genome | null;
    width: number;
    food: WorldObject | null;
    viewObjs: { [key: string]: WorldObject[] };
    wanderTheta: number;
    ateCount: number;
    viewLength: number;
    healthDecay: number;
    energy: number;
    rays: Ray[];
    poly: p5.Vector[][];
    timeAlive: number;
    fitness: number;
    maxSpeed: number = 2;
    maxForce: number = 0.1;
    seekWeight: number = 1;
    wanderWeight: number = 1;
    fleeWeight: number = 1;
    huntWeight: number = 1;
    isDead: boolean = false;

    constructor(
        pos: p5.Vector,
        genome: Genome | null,
        config: { color: string; fov: number; fovDensity: number; maxVel: number; maxAccel: number; healthDecay: number; viewLength: number; size: number; energyGain: number; startEnergy: number }
    ) {
        super(config.color, pos, null, createVector(), createVector(), config.maxVel, config.maxAccel);
        this.genome = genome;
        this.width = config.size;
        this.food = null;
        this.viewObjs = {};
        this.wanderTheta = PI / 2;
        this.ateCount = 0;
        this.viewLength = config.viewLength;
        this.healthDecay = config.healthDecay;
        this.energy = config.startEnergy;
        this.poly = [];
        this.rays = [];
        this.timeAlive = 0;
        this.fitness = 0;

        if (genome) {
            this.applyGenome();
        } else {
            this.viewLength = config.viewLength;
            this.maxSpeed = config.maxVel;
            this.maxForce = config.maxAccel;
            this.wanderWeight = 1;
            this.seekWeight = 1;
            this.fleeWeight = 1;
            this.huntWeight = 1;
            this.vel = createVector(random(-1, 1), random(-1, 1)).setMag(this.maxSpeed * 0.5);
            this.accel = createVector(0, 0);
        }

        this.createRays(config.fov, config.fovDensity);
        this.updatePoly();
    }

    private applyGenome(): void {
        if (!this.genome) return;

        this.viewLength = this.genome.getViewDistance();
        this.maxSpeed = this.genome.getMaxSpeed();
        this.maxForce = this.genome.getMaxForce();
        this.wanderWeight = this.genome.getWanderWeight();
        this.seekWeight = this.genome.getSeekWeight();
        this.fleeWeight = this.genome.getFleeWeight();
        this.huntWeight = this.genome.getHuntWeight();
        
        this.vel = createVector(random(-1, 1), random(-1, 1)).setMag(this.maxSpeed * 0.5);
        this.accel = createVector(0, 0);
    }

    private createRays(fov: number, fovDensity: number): void {
        this.rays = [];
        for (let i = 0; i < fov; i += fovDensity) {
            this.rays.push(new Ray(this.pos, radians(i - fov / 2), this.viewLength));
        }
    }

    updateRays(): void {
        const fov = this.genome ? this.genome.getFovAngle() : 180;
        const fovDensity = 3;
        this.createRays(fov, fovDensity);
    }

    show(): void {
        noStroke();
        fill(this.color);
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel ? this.vel.heading() : 0);
        triangle(
            -this.width, -this.width / 2,
            -this.width, this.width / 2,
            this.width / 2, 0
        );
        pop();

        this.showHealthBar();
    }

    showHealthBar(): void {
        const barWidth = 20;
        const barHeight = 4;
        const x = this.pos.x - barWidth / 2;
        const y = this.pos.y - this.width - 8;

        noStroke();
        fill(100);
        rect(x, y, barWidth, barHeight);

        const healthWidth = (this.health / 100) * barWidth;
        if (this.health > 50) {
            fill(0, 255, 0);
        } else if (this.health > 25) {
            fill(255, 255, 0);
        } else {
            fill(255, 0, 0);
        }
        rect(x, y, healthWidth, barHeight);
    }

    updateEntity(worldObjects: { [key: string]: WorldObject[] }, showDebug: boolean = false): void {
        if (this.isDead) return;

        this.updatePos();
        this.updatePoly();
        this.updateVision(worldObjects, showDebug);
        this.show();
        this.health -= this.healthDecay;
        this.timeAlive++;
        
        this.fitness += CONFIG.fitness.timeAliveWeight;

        if (this.health <= 0) {
            this.isDead = true;
            this._setHealth(0);
        }
    }

    updatePoly(): void {
        const p1 = createVector(-this.width + this.pos.x, -this.width / 2 + this.pos.y);
        const p2 = createVector(this.width / 2 + this.pos.x, 0 + this.pos.y);
        const p3 = createVector(-this.width + this.pos.x, this.width / 2 + this.pos.y);

        this.poly = [
            [p1, p2],
            [p2, p3],
            [p3, p1]
        ];
    }

    updatePos(): void {
        if (!this.vel) {
            this.vel = createVector(random(-1, 1), random(-1, 1)).setMag(this.maxSpeed * 0.5);
        }
        
        this.vel.add(this.accel || createVector(0, 0));
        this.vel.limit(this.maxSpeed || 2);
        
        this.pos.add(this.vel);
        this._checkBounds();
        
        this.accel = createVector(0, 0);
    }

    updateVision(worldObjects: { [key: string]: WorldObject[] }, showDebug: boolean = false): void {
        const viewObjs: { [key: string]: WorldObject[] } = {};
        
        if (this.isDead) return;
        
        this.rays.forEach((ray: Ray) => {
            const obj = ray.update(this, worldObjects, showDebug);
            if (obj) {
                const objType = obj.constructor.name;
                if (objType in viewObjs) {
                    viewObjs[objType].push(obj);
                } else {
                    viewObjs[objType] = [obj];
                }
            }
        });
        this.viewObjs = viewObjs;
    }

    getObjectsOfType(viewObjs: { [key: string]: WorldObject[] }, type: string): WorldObject[] | null {
        if (type in viewObjs) return viewObjs[type];
        return null;
    }

    checkForClosestObject(): WorldObject | null {
        let closestObj: WorldObject | null = null;
        for (const [, array] of Object.entries(this.viewObjs)) {
            if (closestObj === null && array.length !== 0) closestObj = array[0];
            array.forEach((obj: WorldObject) => {
                if (closestObj && this._getVectRelMag(obj.pos) < this._getVectRelMag(closestObj.pos)) {
                    closestObj = obj;
                }
            });
        }
        return closestObj;
    }

    checkForClosestObjectOfType(type: string): WorldObject | null {
        let closestObj: WorldObject | null = null;
        const typedObjs = this.getObjectsOfType(this.viewObjs, type);

        if (typedObjs === null) return null;

        closestObj = typedObjs[0];
        typedObjs.forEach((obj: WorldObject) => {
            if (closestObj && this._getVectRelMag(obj.pos) < this._getVectRelMag(closestObj.pos)) {
                closestObj = obj;
            }
        });
        return closestObj;
    }

    applyForce(force: p5.Vector): void {
        this.accel = this.accel || createVector();
        this.accel.add(force);
    }

    seek(target: p5.Vector): p5.Vector {
        const desired = target.copy().sub(this.pos);
        desired.setMag(this.maxSpeed || 2);
        const steer = desired.sub(this.vel ? this.vel.copy() : createVector(0, 0));
        steer.limit(this.maxForce || 0.1);
        return steer;
    }

    flee(target: p5.Vector): p5.Vector {
        const s = this.seek(target);
        s.mult(-1);
        return s;
    }

    wander(): p5.Vector {
        const wanderPt = this._getVel().copy();
        wanderPt.setMag(CONFIG.wander.distance);
        wanderPt.add(this.pos);

        const offset = p5.Vector.fromAngle(this.wanderTheta).mult(CONFIG.wander.radius);
        wanderPt.add(offset);

        const targetPt = wanderPt.sub(this.pos);
        this.wanderTheta += random(-CONFIG.wander.displacement, CONFIG.wander.displacement);
        
        targetPt.limit(this.maxForce || 0.1);
        return targetPt;
    }

    pursue(target: WorldObject | null): p5.Vector {
        if (!target) return createVector(0, 0);

        const targetVel = target._getVel().copy().mult(CONFIG.pursue.predictionFactor);
        const predictedPos = target.pos.copy().add(targetVel);
        return this.seek(predictedPos);
    }

    evade(target: WorldObject | null): p5.Vector {
        if (!target) return createVector(0, 0);

        const targetVel = target._getVel().copy().mult(CONFIG.evade.predictionFactor);
        const predictedPos = target.pos.copy().add(targetVel);
        return this.flee(predictedPos);
    }

    eat(obj: WorldObject, energyGain: number): void {
        obj._setHealth(0);
        this._setHealth(100);
        this.energy = Math.min(100, this.energy + energyGain);
        this.ateCount += 1;
        this.fitness += CONFIG.fitness.foodEatenWeight;
    }

    calculateFitness(): void {
        this.fitness += this.timeAlive * CONFIG.fitness.timeAliveWeight;
        this.fitness += this.ateCount * CONFIG.fitness.foodEatenWeight;
        
        if (this.timeAlive > CONFIG.fitness.survivalBonusThreshold) {
            this.fitness += CONFIG.fitness.survivalBonus;
        }
    }
}

class Pray extends Entity {
    fleeWeight: number;

    constructor(pos: p5.Vector, genome: Genome | null) {
        super(pos, genome, {
            color: CONFIG.prey.color,
            fov: CONFIG.prey.fov,
            fovDensity: CONFIG.prey.fovDensity,
            maxVel: CONFIG.prey.maxVel,
            maxAccel: CONFIG.prey.maxAccel,
            healthDecay: CONFIG.prey.healthDecay,
            viewLength: CONFIG.prey.viewLength,
            size: CONFIG.prey.size,
            energyGain: CONFIG.prey.energyGain,
            startEnergy: CONFIG.prey.startEnergy
        });
        this.fleeWeight = genome ? genome.getFleeWeight() : 1;
    }

    update(worldObjects: { [key: string]: WorldObject[] }, showDebug: boolean = false): void {
        if (this.isDead) return;
        
        this.updateEntity(worldObjects, showDebug);
        
        if (!this.isDead) {
            this.behave(worldObjects);
        }
    }

    behave(worldObjects: { [key: string]: WorldObject[] }): void {
        let acceleration = createVector(0, 0);

        if ("Food" in this.viewObjs) {
            const food = this.checkForClosestObjectOfType("Food");
            if (food) {
                const seekForce = this.seek(food.pos).mult(this.seekWeight);
                acceleration.add(seekForce);
                
                const dist = this._getVectRelMag(food.pos);
                if (dist < this.width + 5) {
                    this.eat(food, CONFIG.prey.energyGain);
                }
            }
        }

        if ("Pred" in this.viewObjs) {
            const predator = this.checkForClosestObjectOfType("Pred");
            if (predator) {
                const fleeForce = this.flee(predator.pos).mult(this.fleeWeight * 2);
                acceleration.add(fleeForce);
            }
        }

        if (acceleration.mag() === 0) {
            const wanderForce = this.wander().mult(this.wanderWeight);
            acceleration.add(wanderForce);
        }

        this.applyForce(acceleration);
    }
}

class Pred extends Entity {
    huntWeight: number;
    preyCaughtCount: number;

    constructor(pos: p5.Vector, genome: Genome | null) {
        super(pos, genome, {
            color: CONFIG.predator.color,
            fov: CONFIG.predator.fov,
            fovDensity: CONFIG.predator.fovDensity,
            maxVel: CONFIG.predator.maxVel,
            maxAccel: CONFIG.predator.maxAccel,
            healthDecay: CONFIG.predator.healthDecay,
            viewLength: CONFIG.predator.viewLength,
            size: CONFIG.predator.size,
            energyGain: CONFIG.predator.energyGain,
            startEnergy: CONFIG.predator.startEnergy
        });
        this.huntWeight = genome ? genome.getHuntWeight() : 1;
        this.preyCaughtCount = 0;
    }

    update(worldObjects: { [key: string]: WorldObject[] }, showDebug: boolean = false): void {
        if (this.isDead) return;
        
        this.updateEntity(worldObjects, showDebug);
        
        if (!this.isDead) {
            this.behave(worldObjects);
        }
    }

    behave(worldObjects: { [key: string]: WorldObject[] }): void {
        let acceleration = createVector(0, 0);

        if ("Pray" in this.viewObjs) {
            const prey = this.checkForClosestObjectOfType("Pray");
            if (prey) {
                const huntForce = this.pursue(prey).mult(this.huntWeight);
                acceleration.add(huntForce);

                const dist = this._getVectRelMag(prey.pos);
                if (dist < this.width + 5) {
                    this.eat(prey, CONFIG.predator.energyGain);
                    this.preyCaughtCount++;
                    this.fitness += CONFIG.fitness.preyCaughtWeight;
                }
            }
        }

        if (acceleration.mag() === 0) {
            const wanderForce = this.wander().mult(this.wanderWeight);
            acceleration.add(wanderForce);
        }

        this.applyForce(acceleration);
    }

    calculateFitness(): void {
        this.fitness += this.timeAlive * CONFIG.fitness.timeAliveWeight;
        this.fitness += this.preyCaughtCount * CONFIG.fitness.preyCaughtWeight;
        
        if (this.timeAlive > CONFIG.fitness.survivalBonusThreshold) {
            this.fitness += CONFIG.fitness.survivalBonus;
        }
    }
}

class EntityFactory {
    createPreyWithGenome(genome: Genome): Pray {
        const x = random(0, width * CONFIG.entities.preySpawnArea.x);
        const y = random(0, height * CONFIG.entities.preySpawnArea.y);
        return new Pray(createVector(x, y), genome);
    }

    createPredatorWithGenome(genome: Genome): Pred {
        const x = random(width * CONFIG.entities.predatorSpawnArea.x, width);
        const y = random(height * CONFIG.entities.predatorSpawnArea.y, height);
        return new Pred(createVector(x, y), genome);
    }

    createPrey(count: number): Pray[] {
        const prayArray: Pray[] = [];
        for (let i = 0; i < count; i++) {
            const genome = new Genome();
            prayArray.push(this.createPreyWithGenome(genome));
        }
        return prayArray;
    }

    createPreyFromGenomes(genomes: Genome[]): Pray[] {
        return genomes.map(genome => this.createPreyWithGenome(genome));
    }

    createPredator(count: number): Pred[] {
        const predArray: Pred[] = [];
        for (let i = 0; i < count; i++) {
            const genome = new Genome();
            predArray.push(this.createPredatorWithGenome(genome));
        }
        return predArray;
    }

    createPredatorFromGenomes(genomes: Genome[]): Pred[] {
        return genomes.map(genome => this.createPredatorWithGenome(genome));
    }
}

export { Entity, Pray, Pred, EntityFactory };
