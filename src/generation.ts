import { Genome } from './genome';
import { CONFIG } from './config';

export interface GenerationStats {
    generation: number;
    preyBestFitness: number;
    preyAvgFitness: number;
    predatorBestFitness: number;
    predatorAvgFitness: number;
    preySurvivors: number;
    predatorSurvivors: number;
}

export class GenerationManager {
    generationNumber: number;
    population: Genome[];
    generationDuration: number;
    frameCount: number;
    isPaused: boolean;
    bestFitness: number;
    averageFitness: number;
    hallOfFame: Genome[];
    hallOfFamePrey: Genome[];
    hallOfFamePredator: Genome[];
    statsHistory: GenerationStats[];
    currentPreyBestFitness: number;
    currentPreyAvgFitness: number;
    currentPredatorBestFitness: number;
    currentPredatorAvgFitness: number;

    constructor() {
        this.generationNumber = 1;
        this.population = [];
        this.generationDuration = CONFIG.generation.duration;
        this.frameCount = 0;
        this.isPaused = false;
        this.bestFitness = 0;
        this.averageFitness = 0;
        this.hallOfFame = [];
        this.hallOfFamePrey = [];
        this.hallOfFamePredator = [];
        this.statsHistory = [];
        this.currentPreyBestFitness = 0;
        this.currentPreyAvgFitness = 0;
        this.currentPredatorBestFitness = 0;
        this.currentPredatorAvgFitness = 0;
    }

    setPopulation(population: Genome[]): void {
        this.population = population;
    }

    startGeneration(): void {
        this.frameCount = 0;
        this.generationDuration = CONFIG.generation.duration;
        this.isPaused = false;
    }

    update(): void {
        if (this.isPaused) return;
        this.frameCount++;
    }

    isGenerationComplete(populationAlive: number, populationTotal: number): boolean {
        const survivalRate = populationTotal > 0 ? populationAlive / populationTotal : 0;
        const isTimeUp = this.frameCount >= this.generationDuration;
        const isPopulationLow = survivalRate <= CONFIG.generation.populationThreshold;
        
        return isTimeUp || isPopulationLow;
    }

    evaluatePopulation(population: Genome[]): { best: number; average: number } {
        let totalFitness = 0;
        let best = 0;

        for (const genome of population) {
            totalFitness += genome.fitness;
            if (genome.fitness > best) {
                best = genome.fitness;
            }
        }

        const average = population.length > 0 ? totalFitness / population.length : 0;
        return { best, average };
    }

    evaluateBothPopulations(preyGenomes: Genome[], predatorGenomes: Genome[], preySurvivors: number, predatorSurvivors: number): void {
        const preyStats = this.evaluatePopulation(preyGenomes);
        const predStats = this.evaluatePopulation(predatorGenomes);

        this.currentPreyBestFitness = preyStats.best;
        this.currentPreyAvgFitness = preyStats.average;
        this.currentPredatorBestFitness = predStats.best;
        this.currentPredatorAvgFitness = predStats.average;
        this.bestFitness = Math.max(preyStats.best, predStats.best);
        this.averageFitness = (preyStats.average + predStats.average) / 2;

        const stats: GenerationStats = {
            generation: this.generationNumber,
            preyBestFitness: preyStats.best,
            preyAvgFitness: preyStats.average,
            predatorBestFitness: predStats.best,
            predatorAvgFitness: predStats.average,
            preySurvivors: preySurvivors,
            predatorSurvivors: predatorSurvivors
        };
        this.statsHistory.push(stats);

        this.updateHallOfFame(preyGenomes, predStats.best);
    }

    private updateHallOfFame(preyGenomes: Genome[], predatorBestFitness: number): void {
        const sortedPrey = [...preyGenomes].sort((a, b) => b.fitness - a.fitness);
        const hallSize = CONFIG.generation.hallOfFameSize;

        for (const genome of sortedPrey) {
            if (genome.fitness > 0 && !this.hallOfFamePrey.some(h => h === genome)) {
                this.hallOfFamePrey.push(genome.copy());
            }
        }
        this.hallOfFamePrey.sort((a, b) => b.fitness - a.fitness);
        if (this.hallOfFamePrey.length > hallSize) {
            this.hallOfFamePrey = this.hallOfFamePrey.slice(0, hallSize);
        }
    }

    getHallOfFameBestPrey(): Genome | null {
        return this.hallOfFamePrey.length > 0 ? this.hallOfFamePrey[0] : null;
    }

    getAllTimeBestPreyFitness(): number {
        return this.hallOfFamePrey.length > 0 ? this.hallOfFamePrey[0].fitness : 0;
    }

    tournamentSelect(population: Genome[], tournamentSize: number): Genome {
        const tournament: Genome[] = [];
        
        for (let i = 0; i < tournamentSize; i++) {
            const index = floor(random(population.length));
            tournament.push(population[index]);
        }

        let best = tournament[0];
        for (let i = 1; i < tournament.length; i++) {
            if (tournament[i].fitness > best.fitness) {
                best = tournament[i];
            }
        }

        return best;
    }

    evolve(
        preyGenomes: Genome[],
        predatorGenomes: Genome[]
    ): { prey: Genome[]; predator: Genome[] } {
        const preySurvivors = preyGenomes.length;
        const predatorSurvivors = predatorGenomes.length;

        this.evaluateBothPopulations(preyGenomes, predatorGenomes, preySurvivors, predatorSurvivors);
        
        const config = {
            mutationRate: CONFIG.generation.mutationRate,
            mutationMagnitude: CONFIG.generation.mutationMagnitude,
            eliteCount: Math.min(CONFIG.generation.eliteCount, preyGenomes.length, predatorGenomes.length),
            preyPopSize: CONFIG.entities.preyCount,
            predatorPopSize: CONFIG.entities.predatorCount
        };
        
        let newPrey: Genome[] = [];
        let newPredator: Genome[] = [];

        if (preyGenomes.length > 0) {
            newPrey = this.createNextGeneration(
                preyGenomes,
                config.preyPopSize,
                config.mutationRate,
                config.mutationMagnitude,
                config.eliteCount
            );
        }

        if (predatorGenomes.length > 0) {
            newPredator = this.createNextGeneration(
                predatorGenomes,
                config.predatorPopSize,
                config.mutationRate,
                config.mutationMagnitude,
                config.eliteCount
            );
        }

        this.generationNumber++;
        
        return { prey: newPrey, predator: newPredator };
    }

    private createNextGeneration(
        population: Genome[],
        targetSize: number,
        mutationRate: number,
        mutationMagnitude: number,
        eliteCount: number
    ): Genome[] {
        if (population.length === 0) {
            const newPop: Genome[] = [];
            for (let i = 0; i < targetSize; i++) {
                newPop.push(new Genome());
            }
            return newPop;
        }

        const sorted = [...population].sort((a, b) => b.fitness - a.fitness);
        const newPopulation: Genome[] = [];

        for (let i = 0; i < eliteCount && i < sorted.length; i++) {
            newPopulation.push(sorted[i].copy());
        }

        while (newPopulation.length < targetSize) {
            const parent1 = this.tournamentSelect(population, CONFIG.generation.tournamentSize);
            const parent2 = this.tournamentSelect(population, CONFIG.generation.tournamentSize);
            
            let child: Genome;
            
            if (random(1) < 0.7) {
                child = Genome.crossover(parent1, parent2);
            } else {
                child = parent1.copy();
            }
            
            child.mutate(mutationRate, mutationMagnitude);
            newPopulation.push(child);
        }

        return newPopulation;
    }

    reset(): void {
        this.generationNumber = 1;
        this.frameCount = 0;
        this.bestFitness = 0;
        this.averageFitness = 0;
        this.hallOfFamePrey = [];
        this.hallOfFamePredator = [];
        this.statsHistory = [];
    }
}

function random(minOrMax: number, max?: number): number {
    if (max === undefined) {
        return Math.random() * minOrMax;
    }
    return Math.random() * (max - minOrMax) + minOrMax;
}

function floor(n: number): number {
    return Math.floor(n);
}
