# Quantum Forge

An epic incremental game built with TypeScript and Vite.

**Play:** [quantum.future-pulse.tech](https://quantum.future-pulse.tech)

## Game Overview

Quantum Forge is a multi-layer prestige incremental game. Start by forging Quanta, buy generators, and cascade through 10 layers of reality — from Quantum Foam to Beyond.

### Prestige Layers

1. **Transcendence** — Reset generators/upgrades, earn Quantum Essence (QE), Transcend Points (TP), and Research Points (RP)
2. **Ascension** — Reset EVERYTHING (including QE/TP/RP/Skills), earn Ascension Points (AP) and Cosmic Fragments (CF) for permanent cosmic upgrades

## Tech Stack

- **TypeScript** — Strict mode, modular architecture
- **Vite** — Build tool, dev server, HMR
- **GitHub Pages** — Auto-deploy via GitHub Actions

## Project Structure

```
src/
├── types.ts          — All TypeScript interfaces
├── data/
│   ├── layers.ts     — 10 game layers definition
│   ├── generators.ts — 10 generators + cascade mapping
│   ├── metaUpgrades.ts — 4 meta-upgrades (RP cost)
│   ├── skillTree.ts  — 12 skills across 4 tiers (TP cost)
│   ├── ascension.ts  — 4 cosmic upgrades (AP cost)
│   └── index.ts      — Barrel re-exports
├── gameState.ts      — State management, save/load/reset
├── engine.ts          — Pure game logic (tick, forge, buy, production)
├── prestige.ts         — Transcendence, meta-upgrades, skill tree, ascension
├── renderer.ts         — DOM manipulation, tab UI, notifications
├── utils.ts            — Number formatting
└── main.ts             — Game loop, event wiring, save intervals
```

### Design Principles

- **Data separated from logic** — All game data in `src/data/`
- **Pure logic, no DOM** — Engine, Prestige, GameState have zero DOM access
- **Renderer handles all UI** — Single point of DOM concern
- **Save compatibility** — `load()` merges saved data with defaults, new fields get zero values

## Development

```bash
# Install dependencies
npm install

# Start dev server (localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

Pushing to `main` triggers GitHub Actions which builds and deploys to GitHub Pages automatically. No manual steps needed.

## License

MIT