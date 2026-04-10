export interface Layer {
  id: number;
  name: string;
  resource: string;
}

export interface Generator {
  id: string;
  name: string;
  description: string;
  layer: number;
  baseCost: number;
  costMultiplier: number;
  baseProduction: number;
  produces: string;
}

export interface MetaUpgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  effect: (game: any) => void;
}

export interface Skill {
  id: string;
  name: string;
  desc: string;
  cost: number;
  tier: number;
  effect: (game: any) => void;
  requires: string[];
}

export type Resources = Record<string, number>;

export interface Upgrades {
  genMult: number;
  forgeMult: number;
  autoBuy: boolean;
  autoBuyTier: number;
  transcendBonus: number;
  costReduction: number;
  cascadeBonus: number;
  cascadeTiers: number;
  startQuanta: number;
  startGenerators: number;
  autoForge: boolean;
  globalMult: number;
  freeTranscendLevels: number;
}

export interface SaveData {
  resources: Resources;
  owned: Record<string, number>;
  totalQuantaProduced: number;
  transcensions: number;
  transcendPoints: number;
  quantumEssence: number;
  manualForges: number;
  highestTier: number;
  researchPoints: number;
  upgrades: Upgrades;
  upgradeOwned: Record<string, number>;
  skillOwned: Record<string, boolean>;
  savedAt: number;
}