export interface GeneSpec {
    name: string;
    min: number;
    max: number;
}

export const GENE_SPECS: GeneSpec[] = [
    { name: 'fovAngle', min: 30, max: 360 },
    { name: 'viewDistance', min: 100, max: 500 },
    { name: 'maxSpeed', min: 1, max: 4 },
    { name: 'maxForce', min: 0.05, max: 0.3 },
    { name: 'wanderWeight', min: 0, max: 2 },
    { name: 'seekWeight', min: 0, max: 3 },
    { name: 'fleeWeight', min: 0, max: 4 },
    { name: 'huntWeight', min: 0, max: 4 },
];

export class Genome {
    genes: number[];
    fitness: number;

    constructor(genes?: number[]) {
        if (genes) {
            this.genes = [...genes];
        } else {
            this.genes = GENE_SPECS.map(spec => random(spec.min, spec.max));
        }
        this.fitness = 0;
    }

    getGene(index: number): number {
        return this.genes[index];
    }

    setGene(index: number, value: number): void {
        this.genes[index] = value;
    }

    getValue(specIndex: number): number {
        const spec = GENE_SPECS[specIndex];
        return this.genes[specIndex];
    }

    getFovAngle(): number {
        return this.getValue(0);
    }

    getViewDistance(): number {
        return this.getValue(1);
    }

    getMaxSpeed(): number {
        return this.getValue(2);
    }

    getMaxForce(): number {
        return this.getValue(3);
    }

    getWanderWeight(): number {
        return this.getValue(4);
    }

    getSeekWeight(): number {
        return this.getValue(5);
    }

    getFleeWeight(): number {
        return this.getValue(6);
    }

    getHuntWeight(): number {
        return this.getValue(7);
    }

    copy(): Genome {
        const newGenome = new Genome([...this.genes]);
        newGenome.fitness = this.fitness;
        return newGenome;
    }

    mutate(rate: number, magnitude: number): void {
        for (let i = 0; i < this.genes.length; i++) {
            if (random(1) < rate) {
                const spec = GENE_SPECS[i];
                const mutation = random(-magnitude, magnitude) * (spec.max - spec.min);
                this.genes[i] = constrain(this.genes[i] + mutation, spec.min, spec.max);
            }
        }
    }

    static crossover(parent1: Genome, parent2: Genome): Genome {
        const midpoint = floor(random(1, parent1.genes.length));
        const childGenes: number[] = [];

        for (let i = 0; i < parent1.genes.length; i++) {
            if (i < midpoint) {
                childGenes.push(parent1.genes[i]);
            } else {
                childGenes.push(parent2.genes[i]);
            }
        }

        return new Genome(childGenes);
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

function constrain(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, n));
}
