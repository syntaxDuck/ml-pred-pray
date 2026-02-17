export const CONFIG = {
    canvas: {
        width: 800,
        height: 600
    },
    entities: {
        preyCount: 20,
        predatorCount: 6,
        minPreyForBalance: 5,
        minPredatorsForBalance: 2,
        preySpawnArea: { x: 0.25, y: 0.25 },
        predatorSpawnArea: { x: 0.75, y: 0.75 }
    },
    food: {
        initialCount: 80,
        regenerateRate: 30,
        regenerateAmount: 3,
        maxCount: 120,
        emergencySpawnThreshold: 20,
        emergencySpawnAmount: 10
    },
    prey: {
        color: '#00ff00',
        fov: 180,
        fovDensity: 3,
        maxVel: 2,
        maxAccel: 0.1,
        healthDecay: 0.08,
        viewLength: 300,
        size: 10,
        energyGain: 25,
        startEnergy: 60
    },
    predator: {
        color: '#ff0000',
        fov: 120,
        fovDensity: 3,
        maxVel: 2.5,
        maxAccel: 0.15,
        healthDecay: 0.12,
        viewLength: 350,
        size: 12,
        energyGain: 40,
        startEnergy: 70
    },
    wander: {
        radius: 25,
        distance: 80,
        displacement: 0.3
    },
    pursue: {
        predictionFactor: 15
    },
    evade: {
        predictionFactor: 15
    },
    reproduction: {
        enabled: false,
        energyThreshold: 80,
        energyCost: 50,
        offspringCount: 1
    },
    generation: {
        duration: 2400,
        populationThreshold: 0.15,
        mutationRate: 0.15,
        mutationMagnitude: 0.2,
        tournamentSize: 5,
        eliteCount: 2,
        hallOfFameSize: 10
    },
    fitness: {
        timeAliveWeight: 0.02,
        foodEatenWeight: 15,
        preyCaughtWeight: 25,
        survivalBonusThreshold: 600,
        survivalBonus: 50
    },
    debug: {
        showRays: false
    }
};

export type SpawnArea = { x: number; y: number };
export type FoodConfig = { initialCount: number; regenerateRate: number; regenerateAmount: number; maxCount: number; emergencySpawnThreshold: number; emergencySpawnAmount: number };
export type EntityConfig = { 
    color: string; 
    fov: number; 
    fovDensity: number; 
    maxVel: number; 
    maxAccel: number; 
    healthDecay: number; 
    viewLength: number; 
    size: number;
    energyGain: number;
    startEnergy: number;
};
export type WanderConfig = { radius: number; distance: number; displacement: number };
export type PredictionConfig = { predictionFactor: number };
export type ReproductionConfig = { enabled: boolean; energyThreshold: number; energyCost: number; offspringCount: number };
export type GenerationConfig = { 
    duration: number; 
    populationThreshold: number; 
    mutationRate: number; 
    mutationMagnitude: number; 
    tournamentSize: number; 
    eliteCount: number;
    hallOfFameSize: number;
};
export type FitnessConfig = {
    timeAliveWeight: number;
    foodEatenWeight: number;
    preyCaughtWeight: number;
    survivalBonusThreshold: number;
    survivalBonus: number;
};
export type DebugConfig = { showRays: boolean };

export interface Config {
    canvas: { width: number; height: number };
    entities: { 
        preyCount: number; 
        predatorCount: number;
        minPreyForBalance: number;
        minPredatorsForBalance: number;
        preySpawnArea: SpawnArea; 
        predatorSpawnArea: SpawnArea 
    };
    food: FoodConfig;
    prey: EntityConfig;
    predator: EntityConfig;
    wander: WanderConfig;
    pursue: PredictionConfig;
    evade: PredictionConfig;
    reproduction: ReproductionConfig;
    generation: GenerationConfig;
    fitness: FitnessConfig;
    debug: DebugConfig;
}
