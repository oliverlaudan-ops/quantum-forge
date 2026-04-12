import type { AscensionUpgrade } from '../types';

export const ASCENSION_UPGRADES: AscensionUpgrade[] = [
  {
    id: 'cosmic_mult',
    name: 'Cosmic Multiplier',
    description: 'All production x2 per level',
    baseCost: 5,
    costMultiplier: 2,
    maxLevel: 10,
    effect: (g) => { g.ascensionData.ascensionUpgrades.cosmicMultiplier = (g.ascensionData.ascensionUpgrades.cosmicMultiplier || 1) * 2; }
  },
  {
    id: 'transcend_boost',
    name: 'Transcendence Boost',
    description: '+5 bonus QE per transcend per level',
    baseCost: 3,
    costMultiplier: 1.5,
    maxLevel: 20,
    effect: (g) => { g.ascensionData.ascensionUpgrades.transcendBoost += 5; }
  },
  {
    id: 'cost_reducer',
    name: 'Cosmic Efficiency',
    description: 'Ascension upgrades cost 15% less per level',
    baseCost: 10,
    costMultiplier: 3,
    maxLevel: 5,
    effect: (g) => { g.ascensionData.ascensionUpgrades.ascensionCostMult += 0.15; }
  },
  {
    id: 'skill_preservation',
    name: 'Skill Preservation',
    description: 'Keep 1 random skill per level on ascension',
    baseCost: 15,
    costMultiplier: 5,
    maxLevel: 5,
    effect: (g) => { g.ascensionData.ascensionUpgrades.keepSkills += 1; }
  },
];