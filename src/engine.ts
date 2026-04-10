import { GENERATORS, CASCADE_FROM } from './data';
import { GameState } from './gameState';

export class GameEngine {
  constructor(public state: GameState) {}

  // --- Production calculation ---

  getBoost(): number {
    return 1 + this.state.quantumEssence * 0.15;
  }

  getCost(genId: string): number {
    const gen = GENERATORS.find(g => g.id === genId);
    if (!gen) return Infinity;
    const owned = this.state.owned[genId] ?? 0;
    return Math.floor(gen.baseCost * Math.pow(gen.costMultiplier, owned) * (1 - this.state.upgrades.costReduction));
  }

  getProduction(genId: string): number {
    const gen = GENERATORS.find(g => g.id === genId);
    if (!gen) return 0;
    const owned = this.state.owned[genId] ?? 0;
    if (owned === 0) return 0;
    return gen.baseProduction * owned * this.getBoost() * this.state.upgrades.genMult * this.state.upgrades.globalMult;
  }

  getResourceRate(resource: string): number {
    let rate = 0;
    for (const gen of GENERATORS) {
      if (gen.produces === resource) {
        rate += this.getProduction(gen.id);
      }
      // Cascade: higher-tier generators contribute 0.5 of their rate to the layer below
      if (CASCADE_FROM[gen.id] != null) {
        const lowerGen = GENERATORS.find(g => g.id === CASCADE_FROM[gen.id]);
        if (lowerGen && lowerGen.produces === resource) {
          rate += this.getProduction(gen.id) * 0.5 * this.state.upgrades.cascadeTiers;
        }
      }
    }
    return rate;
  }

  getQuantaRate(): number {
    return this.getResourceRate('quanta');
  }

  // --- Game actions ---

  forge(): void {
    this.state.resources.quanta += this.state.upgrades.forgeMult;
    this.state.manualForges++;
    this.state.totalQuantaProduced += this.state.upgrades.forgeMult;
  }

  buyGenerator(genId: string): boolean {
    const cost = this.getCost(genId);
    if (this.state.resources.quanta < cost) return false;
    this.state.resources.quanta -= cost;
    this.state.owned[genId] = (this.state.owned[genId] ?? 0) + 1;
    // Update highest tier
    const gen = GENERATORS.find(g => g.id === genId);
    if (gen && gen.layer >= this.state.highestTier) {
      this.state.highestTier = gen.layer + 1;
    }
    return true;
  }

  tick(): void {
    // Add resource rates
    for (const gen of GENERATORS) {
      const prod = this.getProduction(gen.id);
      if (prod > 0) {
        this.state.resources[gen.produces] = (this.state.resources[gen.produces] ?? 0) + prod;
      }
    }
    // Increment total quanta produced
    this.state.totalQuantaProduced += this.getQuantaRate();
    // Update cascade: each generator adds cascadeBonus * owned to cascade target
    for (const gen of GENERATORS) {
      const targetId = CASCADE_FROM[gen.id];
      if (targetId == null) continue;
      const owned = this.state.owned[gen.id] ?? 0;
      if (owned > 0) {
        this.state.owned[targetId] = (this.state.owned[targetId] ?? 0) + this.state.upgrades.cascadeBonus * owned;
      }
    }
  }

  // --- Auto-buy ---

  autoBuyTick(): void {
    if (!this.state.upgrades.autoBuy) return;
    // Find highest owned generator
    let bestLayer = -1;
    for (const gen of GENERATORS) {
      if ((this.state.owned[gen.id] ?? 0) > 0 && gen.layer > bestLayer) {
        bestLayer = gen.layer;
      }
    }
    // Buy one tier above
    const targetLayer = bestLayer + 1;
    if (targetLayer < GENERATORS.length) {
      const target = GENERATORS[targetLayer];
      this.buyGenerator(target.id);
    }
  }
}