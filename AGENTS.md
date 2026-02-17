# AGENTS.md - Agentic Coding Guidelines

## Project Overview

This is a p5.js-based predator-prey evolutionary simulation with ray-casting vision and genetic algorithm-based evolution. Built with TypeScript and Vite.

## File Structure

```
├── src/
│   ├── main.ts        # Entry point, p5.js setup() and draw() loop
│   ├── world.ts       # World container class and generation management
│   ├── entity.ts     # Entity classes (Pray, Pred) with behaviors
│   ├── ray.ts        # Ray-casting vision system
│   ├── food.ts       # Food source objects
│   ├── genome.ts     # Genome class for genetic evolution
│   ├── generation.ts # Generation manager with tournament selection
│   ├── config.ts    # Configuration constants
│   ├── worldObject.ts # Base WorldObject class
│   └── p5.d.ts     # TypeScript declarations for p5.js
├── index.html        # HTML entry point
├── package.json     # Dependencies and scripts
├── tsconfig.json   # TypeScript configuration
├── vite.config.ts  # Vite configuration
└── AGENTS.md       # This file
```

## Build Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run linting (when configured) |

## Running the Project

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Controls

| Key | Action |
|-----|--------|
| D | Toggle debug mode (shows vision rays) |
| P | Pause/Resume simulation |
| N | Next generation (manual) |
| R | Reset simulation |

## Features

- **Vision System**: Ray-casting algorithm allows entities to detect objects within their field of view
- **Genetic Evolution**: Each entity has a genome with evolvable traits
- **Generation System**: Populations evolve over generations using tournament selection
- **Prey (Green)**: Seek food, flee from predators, evolve survival traits
- **Predators (Red)**: Hunt prey using pursuit behaviors, evolve hunting efficiency
- **Health System**: Entities lose health over time and must eat to survive
- **Fitness Tracking**: Based on time alive and food/prey consumed
- **Food Regeneration**: Food respawns over time
- **Spatial Partitioning**: Grid-based optimization for collision detection
- **Stats Display**: Shows generation, time, population counts, and best fitness

## Genome System

The genome controls entity behavior through these genes:
- `fovAngle` - Field of view angle (30-360°)
- `viewDistance` - How far entity can see (100-500)
- `maxSpeed` - Maximum velocity (1-4)
- `maxForce` - Steering force limit (0.05-0.3)
- `wanderWeight` - Importance of wandering (0-2)
- `seekWeight` - Importance of seeking targets (0-3)
- `fleeWeight` - Importance of fleeing (prey only) (0-4)
- `huntWeight` - Importance of hunting (predators only) (0-4)

## Code Style Guidelines

### General Principles

- TypeScript with strict mode enabled
- p5.js loaded via CDN (see index.html)
- No test framework - this is a visual simulation

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `class World`, `class Entity` |
| Methods | camelCase | `update()`, `seek()` |
| Variables | camelCase | `this.pos`, `worldObjects` |
| CONFIG | UPPER_SNAKE for nested keys | `CONFIG.entities.preyCount` |
| Private methods | underscore prefix | `_getPos()`, `_setHealth()` |
| Interfaces/Types | PascalCase | `WorldObjects`, `EntityConfig` |

### Configuration (CONFIG)

All simulation parameters are in `src/config.ts`:

```typescript
export const CONFIG = {
    canvas: { width: 800, height: 600 },
    entities: { preyCount: 20, predatorCount: 6, ... },
    food: { initialCount: 80, regenerateRate: 30, ... },
    prey: { color: '#00ff00', fov: 180, ... },
    predator: { color: '#ff0000', fov: 120, ... },
    wander: { radius: 25, distance: 80, ... },
    pursue: { predictionFactor: 15 },
    evade: { predictionFactor: 15 },
    generation: { duration: 1200, mutationRate: 0.15, ... },
    debug: { showRays: false }
};
```

### Class Structure

- Use ES6 `class` syntax with `extends` for inheritance
- Base class: `WorldObject` in worldObject.ts
- Entity hierarchy: `WorldObject` → `Entity` → `Pray`/`Pred`
- Use constructor parameters and CONFIG for configuration

### p5.js Integration

- Global functions: `setup()`, `draw()`, `createCanvas()`, `createVector()`, etc.
- Use `push()`/`pop()` for transformations
- Use p5 vector methods: `.copy()`, `.add()`, `.sub()`, `.mult()`, `.limit()`, `.setMag()`, `.heading()`, `.mag()`

### Code Patterns

```typescript
// Getters/setters with underscore prefix
_getPos(): p5.Vector {
    return this.pos.copy();
}

_setPos(pos: p5.Vector): void {
    this.pos = pos;
}

// Object management
addObjects(entityName: string, entityArray: WorldObject[]): void {
    if (entityName in this.worldObjects) {
        this.worldObjects[entityName].push(...entityArray);
    } else {
        this.worldObjects[entityName] = entityArray;
    }
}

// Factory pattern
class EntityFactory {
    createPrey(count: number): Pray[] { ... }
    createPredator(count: number): Pred[] { ... }
}
```

### Error Handling

- Minimal error handling - assertions are not used
- Validate inputs in constructors where necessary
- Use `null` checks when iterating over object arrays

### Formatting

- 4 spaces for indentation
- One blank line between class definitions
- Always use semicolons
- Space after keywords: `if (`, `for (`, `function (`

### Code to Avoid

- No async/await - p5.js is synchronous

## Future Improvements

- [ ] Try neural network approach for brain (simple perceptron)
