import type { Resources, Upgrades, SaveData } from './types';
import { GENERATORS, META_UPGRADES, SKILL_TREE } from './data';

const RESOURCE_KEYS: (keyof Resources)[] = [
  'quanta', 'particles', 'atoms', 'molecules', 'cells',
  'organisms', 'civilizations', 'galaxies', 'universe', 'beyond',
];

function defaultResources(): Resources {
  return Object.fromEntries(RESOURCE_KEYS.map(k => [k, 0])) as Resources;
}

function defaultUpgrades(): Upgrades {
  return {
    genMult: 1,
    forgeMult: 1,
    autoBuy: false,
    autoBuyTier: 0,
    transcendBonus: 1,
    costReduction: 0,
    cascadeBonus: 0.75,
    cascadeTiers: 1,
    startQuanta: 0,
    startGenerators: 0,
    autoForge: false,
    globalMult: 1,
    freeTranscendLevels: 0,
  };
}

function defaultOwned(): Record<string, number> {
  return Object.fromEntries(GENERATORS.map(g => [g.id, 0]));
}

function defaultUpgradeOwned(): Record<string, number> {
  return Object.fromEntries(META_UPGRADES.map(u => [u.id, 0]));
}

function defaultSkillOwned(): Record<string, boolean> {
  return Object.fromEntries(SKILL_TREE.map(s => [s.id, false]));
}

export class GameState {
  resources: Resources = defaultResources();
  owned: Record<string, number> = defaultOwned();
  totalQuantaProduced = 0;
  transcensions = 0;
  transcendPoints = 0;
  quantumEssence = 0;
  manualForges = 0;
  researchPoints = 0;
  highestTier = 0;
  upgrades: Upgrades = defaultUpgrades();
  upgradeOwned: Record<string, number> = defaultUpgradeOwned();
  skillOwned: Record<string, boolean> = defaultSkillOwned();

  save(): SaveData {
    return {
      resources: { ...this.resources },
      owned: { ...this.owned },
      totalQuantaProduced: this.totalQuantaProduced,
      transcensions: this.transcensions,
      transcendPoints: this.transcendPoints,
      quantumEssence: this.quantumEssence,
      manualForges: this.manualForges,
      highestTier: this.highestTier,
      researchPoints: this.researchPoints,
      upgrades: { ...this.upgrades },
      upgradeOwned: { ...this.upgradeOwned },
      skillOwned: { ...this.skillOwned },
      savedAt: Date.now(),
    };
  }

  load(data: SaveData): boolean {
    try {
      // Merge resources with defaults so new resource types get 0
      const res = defaultResources();
      for (const key of Object.keys(data.resources)) {
        if (key in res) res[key] = data.resources[key];
      }
      this.resources = res;

      // Merge owned with defaults so new generators get 0
      const owned = defaultOwned();
      for (const key of Object.keys(data.owned)) {
        if (key in owned) owned[key] = data.owned[key];
      }
      this.owned = owned;

      this.totalQuantaProduced = data.totalQuantaProduced ?? 0;
      this.transcensions = data.transcensions ?? 0;
      this.transcendPoints = data.transcendPoints ?? 0;
      this.quantumEssence = data.quantumEssence ?? 0;
      this.manualForges = data.manualForges ?? 0;
      this.highestTier = data.highestTier ?? 0;
      this.researchPoints = data.researchPoints ?? 0;

      // Merge upgrades with defaults
      const upg = defaultUpgrades();
      for (const key of Object.keys(data.upgrades)) {
        if (key in upg) (upg as any)[key] = (data.upgrades as any)[key];
      }
      this.upgrades = upg;

      // Merge upgradeOwned
      const uo = defaultUpgradeOwned();
      for (const key of Object.keys(data.upgradeOwned)) {
        if (key in uo) uo[key] = data.upgradeOwned[key];
      }
      this.upgradeOwned = uo;

      // Merge skillOwned
      const so = defaultSkillOwned();
      for (const key of Object.keys(data.skillOwned)) {
        if (key in so) so[key] = data.skillOwned[key];
      }
      this.skillOwned = so;

      return true;
    } catch {
      return false;
    }
  }

  reset(includeQE: boolean): void {
    this.resources = defaultResources();
    this.owned = defaultOwned();
    this.totalQuantaProduced = 0;
    this.manualForges = 0;
    this.highestTier = 0;

    if (includeQE) {
      this.transcensions = 0;
      this.transcendPoints = 0;
      this.quantumEssence = 0;
      this.researchPoints = 0;
      this.upgrades = defaultUpgrades();
      this.upgradeOwned = defaultUpgradeOwned();
      this.skillOwned = defaultSkillOwned();
    }
  }

  applyStartBonuses(): void {
    if (this.upgrades.startQuanta > 0) {
      this.resources.quanta += this.upgrades.startQuanta;
    }
    if (this.upgrades.startGenerators > 0) {
      for (const gen of GENERATORS) {
        this.owned[gen.id] = (this.owned[gen.id] ?? 0) + this.upgrades.startGenerators;
      }
    }
  }
}
