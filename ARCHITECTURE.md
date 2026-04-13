# Architecture

## Module Dependency Graph

```
main.ts
├── gameState.ts
│   └── data/* (generators, layers, upgrades, skills, ascension)
├── engine.ts
│   ├── gameState.ts
│   └── data/* (generators, cascade)
├── prestige.ts
│   ├── gameState.ts
│   └── data/* (layers, meta-upgrades, skills, ascension)
└── renderer.ts
    ├── engine.ts
    ├── prestige.ts
    ├── gameState.ts
    ├── utils.ts
    └── data/* (all)
```

## Data Flow

```
User Click → renderer → engine/prestige → state mutation → renderer.render()
                                                      ↓
                                                localStorage (auto-save)
```

### Game Loop (1s tick)

```
main.ts setInterval → engine.tick()
                    → prestige.updateHighestTier()
                    → renderer.render()
```

## Prestige Layers

### Layer 1: Transcendence

- **Requirement:** Reach Atoms (tier 3+)
- **Resets:** Resources, generators, manual forges
- **Keeps:** QE, TP, RP, skills, upgrades
- **Earns:** Quantum Essence (QE), Transcend Points (TP), Research Points (RP)
- **QE Effect:** +15% production per point
- **TP Use:** Skill Tree (4 tiers, 12 skills)
- **RP Use:** Meta-Upgrades (4 upgrades, repeatable)

### Layer 2: Ascension

- **Requirement:** 5 Transcensions OR 100 total QE earned
- **Resets:** EVERYTHING — including QE, TP, RP, skills
- **Keeps:** Ascension Points, Cosmic Fragments, Cosmic Upgrades
- **Earns:** Ascension Points (AP), Cosmic Fragments (CF)
- **AP Formula:** `max(1, floor(sqrt(totalQEever) * 0.5) + transcensions)`
- **CF Formula:** `max(1, floor(transcensions * 2))`

#### Cosmic Upgrades (AP cost)

| Upgrade | Effect | Max Level | Base Cost | Cost Mult |
|---------|--------|-----------|-----------|-----------|
| Cosmic Multiplier | All production x2 per level | 10 | 5 AP | 2x |
| Transcendence Boost | +5 bonus QE per transcend per level | 20 | 3 AP | 1.5x |
| Cosmic Efficiency | Ascension upgrades cost 15% less per level | 5 | 10 AP | 3x |
| Skill Preservation | Keep 1 random skill per level on ascension | 5 | 15 AP | 5x |

## Save System

- Auto-save every 30 seconds to `localStorage`
- Manual save button
- `SaveData` interface includes all state + `ascensionData`
- Backward compatible: missing fields get default values on load

## UI Architecture

- **Tab navigation:** Forge / Research / Skills / Ascension
- **Toast notifications:** For save, transcend, ascend events
- **Progressive rendering:** Only active tab rendered on switch
- **CSS classes:** `.hidden` for tab visibility, `.gen-layer-N` for generator border colors