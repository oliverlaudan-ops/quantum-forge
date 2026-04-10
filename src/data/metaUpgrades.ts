import type { MetaUpgrade } from '../types';

export const META_UPGRADES: MetaUpgrade[] = [
  {
    id: 'gen_mult',
    name: 'Generator Multiplier',
    description: 'Double all generator production',
    baseCost: 10,
    costMultiplier: 2,
    effect: (game) => { game.upgrades.genMult = (game.upgrades.genMult || 1) * 2; },
  },
  {
    id: 'forge_eff',
    name: 'Forge Efficiency',
    description: 'Each forge produces 10x more',
    baseCost: 5,
    costMultiplier: 2,
    effect: (game) => { game.upgrades.forgeMult = (game.upgrades.forgeMult || 1) * 10; },
  },
  {
    id: 'auto_buy',
    name: 'Automation',
    description: 'Auto-buy 1 generator every 5s (cascades up)',
    baseCost: 15,
    costMultiplier: 3,
    effect: (game) => { game.upgrades.autoBuy = true; game.upgrades.autoBuyTier = (game.upgrades.autoBuyTier || 0) + 1; },
  },
  {
    id: 'transcend_bonus',
    name: 'Transcendence Bonus',
    description: '+50% Quantum Essence from prestige',
    baseCost: 20,
    costMultiplier: 2.5,
    effect: (game) => { game.upgrades.transcendBonus = (game.upgrades.transcendBonus || 1) + 0.5; },
  },
];