import { GameState } from './gameState';
import { LAYERS, META_UPGRADES, SKILL_TREE, ASCENSION_UPGRADES } from './data';

const TIER_SCORES: Record<string, number> = {
  beyond: 1000,
  universe: 500,
  galaxies: 250,
  civilizations: 100,
  organisms: 50,
  cells: 25,
  molecules: 10,
  atoms: 5,
  particles: 2,
  quanta: 1,
};

export class PrestigeSystem {
  constructor(private state: GameState) {}

  // --- Transcendence ---

  updateHighestTier(): void {
    let tier = 0;
    for (const layer of LAYERS) {
      if ((this.state.resources[layer.resource] ?? 0) >= 1) {
        tier = layer.id + 1; // +1 so reaching quanta = tier 1, beyond = tier 10
      }
    }
    this.state.highestTier = Math.max(this.state.highestTier, tier);
  }

  canTranscend(): boolean {
    return this.state.highestTier >= 3 && (this.state.resources.atoms ?? 0) >= 1;
  }

  calculateTranscendPoints(): number {
    const tierResource = LAYERS[this.state.highestTier - 1]?.resource ?? 'quanta';
    const baseScore = TIER_SCORES[tierResource] ?? 1;
    const resourceAmount = this.state.resources[tierResource] ?? 0;
    const tierBonus = baseScore + 10 * this.state.highestTier;
    const quantaBonus = Math.log10(this.state.totalQuantaProduced + 1);
    return Math.max(1, Math.floor(tierBonus + quantaBonus + resourceAmount * 0.1));
  }

  getTranscendPreview(): number {
    return this.calculateTranscendPoints();
  }

  transcend(): { qeGain: number; tpGain: number; rpGain: number } {
    if (!this.canTranscend()) {
      return { qeGain: 0, tpGain: 0, rpGain: 0 };
    }

    const tpGain = this.calculateTranscendPoints();
    const bonusMult = this.state.upgrades.transcendBonus ?? 1;
    const qeGain = Math.floor(tpGain * bonusMult);
    const rpGain = Math.floor(tpGain * 0.5);

    // Add gains before reset
    this.state.quantumEssence += qeGain;
    this.state.transcendPoints += tpGain;
    this.state.researchPoints += rpGain;
    this.state.ascensionData.totalQEever += qeGain;
    this.state.transcensions += 1;

    // Reset resources/owned/progress but keep prestige currency + upgrades + skills
    this.state.reset(false);

    // Apply start bonuses
    this.state.applyStartBonuses();

    return { qeGain, tpGain, rpGain };
  }

  // --- Meta-Upgrades ---

  getUpgradeCost(upgradeId: string): number {
    const upgrade = META_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return Infinity;
    const owned = this.state.upgradeOwned[upgradeId] ?? 0;
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, owned));
  }

  buyUpgrade(upgradeId: string): boolean {
    const cost = this.getUpgradeCost(upgradeId);
    if (this.state.researchPoints < cost) return false;

    const upgrade = META_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return false;

    this.state.researchPoints -= cost;
    this.state.upgradeOwned[upgradeId] = (this.state.upgradeOwned[upgradeId] ?? 0) + 1;
    upgrade.effect(this.state);
    return true;
  }

  // --- Skill Tree ---

  canBuySkill(skillId: string): boolean {
    if (this.state.skillOwned[skillId]) return false;
    const skill = SKILL_TREE.find(s => s.id === skillId);
    if (!skill) return false;
    if (this.state.transcendPoints < skill.cost) return false;
    return skill.requires.every(req => this.state.skillOwned[req]);
  }

  buySkill(skillId: string): boolean {
    if (!this.canBuySkill(skillId)) return false;

    const skill = SKILL_TREE.find(s => s.id === skillId)!;
    this.state.transcendPoints -= skill.cost;
    this.state.skillOwned[skillId] = true;
    skill.effect(this.state);
    return true;
  }

  // --- Ascension ---

  canAscend(): boolean {
    return this.state.ascensionData.totalQEever >= 100 || this.state.transcensions >= 5;
  }

  calculateAscensionPoints(): number {
    return Math.max(1, Math.floor(Math.sqrt(this.state.ascensionData.totalQEever) * 0.5) + this.state.transcensions);
  }

  calculateCosmicFragments(): number {
    return Math.max(1, Math.floor(this.state.transcensions * 2));
  }

  getAscensionPreview(): { apGain: number; cfGain: number } {
    if (!this.canAscend()) return { apGain: 0, cfGain: 0 };
    return { apGain: this.calculateAscensionPoints(), cfGain: this.calculateCosmicFragments() };
  }

  ascend(): { apGain: number; cfGain: number } {
    const apGain = this.calculateAscensionPoints();
    const cfGain = this.calculateCosmicFragments();
    this.state.ascend();
    return { apGain, cfGain };
  }

  getAscensionUpgradeCost(upgradeId: string): number {
    const upgrade = ASCENSION_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return Infinity;
    const owned = this.state.ascensionData.ascensionUpgradeOwned[upgradeId] ?? 0;
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, owned) * (1 - this.state.ascensionData.ascensionUpgrades.ascensionCostMult));
  }

  buyAscensionUpgrade(upgradeId: string): boolean {
    const upgrade = ASCENSION_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return false;
    const owned = this.state.ascensionData.ascensionUpgradeOwned[upgradeId] ?? 0;
    if (owned >= upgrade.maxLevel) return false;
    const cost = this.getAscensionUpgradeCost(upgradeId);
    if (this.state.ascensionData.ascensionPoints < cost) return false;
    this.state.ascensionData.ascensionPoints -= cost;
    this.state.ascensionData.ascensionUpgradeOwned[upgradeId] = owned + 1;
    upgrade.effect(this.state);
    return true;
  }
}
