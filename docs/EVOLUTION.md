# Quantum Forge - Evolution Roadmap

## Vision
An epic incremental game that starts simple and grows into a complex, multi-layered experience. Each prestige layer reveals new mechanics while automating previous ones.

---

## Tier System

### Tier 0: Base Game (COMPLETED)
- **Resource Chain**: Quantum Foam → Particles → Atoms → Molecules → Cells → Organisms → Civilizations → Galaxies → Universe → Beyond
- **Generators**: 10 types, one per layer
- **Cascade System**: Higher tiers produce lower tiers
- **Manual Forge**: Click to produce Quanta

### Tier 1: Transcendence (IMPLEMENTED)
**Unlocks**: After reaching Atoms tier

**Mechanic**:
- Reset all progress, keep Quantum Essence (QE)
- QE = permanent +10% production multiplier per point
- Points based on highest tier reached + quanta bonus

**UI Elements**:
- TRANSCEND button (red, appears when unlocked)
- QE counter and multiplier display
- Transcension counter

---

## Tier 2: Singularity (IN PROGRESS)

**Unlocks**: After first Transcension

### New Currency: Singularity Points (SP)

### Mechanics:
After Transcending, you now have **Singularities** - permanent upgrades that persist across ALL playthroughs.

**Cost**: Each Singularity costs exponentially more SP
**Effect**: One-time purchase that permanently enhances the game

### Singularity Upgrades:

#### 1. Auto-Forge (Cost: 1 SP)
- Automatically clicks FORGE every second
- Rate: 1/s (upgradeable)

#### 2. Quantum Accelerator (Cost: 3 SP)
- Foam Generators produce 2x faster
- Stacks: Yes (+100% per level)

#### 3. Particle Amplifier (Cost: 5 SP)
- Particle Accelerators produce 2x faster
- Stacks: Yes

#### 4. Cascade Boost (Cost: 10 SP)
- Cascade rate increased from 50% to 75%
- Stacks: No (one-time)

#### 5. Time Compression (Cost: 15 SP)
- Game tick speed doubled (500ms instead of 1000ms)
- Stacks: Yes

#### 6. Auto-Buyer (Cost: 25 SP)
- Automatically buys cheapest available generator
- Rate: 1/s (upgradeable)

#### 7. Essence Multiplier (Cost: 50 SP)
- QE gain increased by 50%
- Stacks: Yes

#### 8. Singularity Spark (Cost: 100 SP)
- Start each run with 100 bonus Quanta
- Stacks: +100 per level

### UI Changes:
- New "Singularities" panel (always visible after unlock)
- SP counter in stats area
- Purchased upgrades show checkmark
- Locked upgrades show cost and requirements

### SP Gain Formula:
- SP earned = floor(transcensions * 2) + floor(totalQuantaProduced / 1,000,000)
- Every Transcension grants base SP
- Reaching higher tiers grants bonus SP

---

## Tier 3: Paradox

**Unlocks**: After earning 100 SP total

### New Currency: Paradox Shards (PShards)

### Mechanics:
Paradox is about breaking the game's rules. You create "time loops" that replay previous runs with modifications.

### Paradox Upgrades:

#### 1. Auto-Transcend (Cost: 10 PShards)
- Automatically Transcends when conditions are met
- Configurable: threshold tier

#### 2. Entropy Reversal (Cost: 25 PShards)
- Keep some generators on Transcend (%)
- Level 1: Keep 1% of highest tier generators
- Stacks: +1% per level

#### 3. Quantum Echo (Cost: 50 PShards)
- Your best run's stats echo into new runs
- Shows "Previous best" comparison

#### 4. Parallel Universes (Cost: 100 PShards)
- Play multiple "save slots" that sync
- Cross-pollination bonuses

#### 5. Paradox Engine (Cost: 200 PShards)
- A generator that produces Paradox Shards
- Requires manual clicking to advance

### PShard Gain:
- 1 PShard per Transcension
- Bonus PShards for reaching new highest tiers
- Paradox completion bonuses

---

## Tier 4: Dimensional Rift

**Unlocks**: After earning 500 PShards

### New Currency: Dimensional Fragments

### Mechanics:
Access parallel dimensions with different rule sets.

### Features:
- **Dimensional Altars**: Sacrifice QE/SP/PShards for dimension-specific bonuses
- **Rift Portals**: Temporary bridges to other dimensions
- **Dimensional Stability**: Affects how long rifts stay open

---

## Tier 5: Cosmic Echo

**Unlocks**: After creating 10 Dimensional Rifts

### Mechanics:
Your choices in one cosmic cycle affect the next.

---

## Tier 6+: Eternal Loop

The endgame. All systems unlocked, maximum automation, endless progression.

---

## Implementation Priority

1. **Tier 2 (Singularity)** - Current
   - SP currency and UI
   - First 4-5 singularity upgrades
   - Save/load SP across sessions

2. **Tier 2 Polish**
   - Remaining upgrades
   - Tooltips and descriptions

3. **Tier 3 (Paradox)** - Future
   - PShard system
   - Paradox upgrades

4. **Balance Pass**
   - Tune costs and progression
   - Add milestones and achievements

---

## Technical Notes

### Save Data Structure (v2):
```javascript
{
  resources: { ... },
  owned: { ... },
  transcensions: number,
  quantumEssence: number,
  singularities: {
    total: number,
    purchased: ['auto_forge', 'cascade_boost', ...],
    levels: { auto_forge: 3, time_compression: 2 }
  },
  paradoxShards: number,
  highestTier: number,
  totalQuantaProduced: number,
  manualForges: number
}
```

### Key Functions to Modify:
- `tick()` - Add singularity multipliers
- `render()` - Add singularity panel
- `transcend()` - Award SP
- `getProduction()` - Apply singularity boosts
