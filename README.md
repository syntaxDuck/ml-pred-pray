# Predator vs Prey Simulation

An evolutionary simulation built with p5.js featuring autonomous agents with vision-based decision making.

## Overview

This simulation models predator-prey dynamics using entities with ray-casting vision systems. The system demonstrates emergent behaviors as prey seek food while evading predators, and predators hunt prey.

## Features

- **Vision System**: Ray-casting algorithm allows entities to detect objects within their field of view
- **Prey (Green)**: Seek food sources to survive and maintain health
- **Predators (Red)**: Hunt prey using pursuit behaviors
- **Health System**: Entities lose health over time and must eat to survive
- **Wrap-around World**: Entities can traverse screen edges seamlessly

## Running the Simulation

Open `index.html` in a web browser. The simulation uses p5.js loaded via CDN.

## Configuration

Edit `main.js` to adjust simulation parameters:

```javascript
const entity_count = 12;  // Number of predators and prey
const food_count = 100;   // Number of food sources
```

## Entity Behaviors

### Prey
- 180° field of view
- Seeks nearest food source when visible
- Wanders randomly when no food detected

### Predators
- 90° field of view
- Pursues nearest prey when visible
- Wanders randomly when no prey detected

## Architecture

| File | Description |
|------|-------------|
| `main.js` | Entry point, p5.js setup and draw loop |
| `world.js` | World container and base object class |
| `entity.js` | Entity classes (Pray, Pred) with behaviors |
| `ray.js` | Ray-casting vision system |
| `food.js` | Food source objects |

## Future Improvements

- Genetic algorithm for evolving neural network brains
- Reproduction and fitness-based selection
- Performance optimization for larger populations
