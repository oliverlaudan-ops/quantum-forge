import type { Skill } from '../types';

export const SKILL_TREE: Skill[] = [
  // Tier 1 - Starter skills (top row)
  {
    id: 'quick_start',
    name: 'Quick Start',
    desc: '+50% forge efficiency',
    cost: 1,
    tier: 1,
    effect: (g) => { g.upgrades.forgeMult = (g.upgrades.forgeMult || 1) * 1.5; },
    requires: [],
  },
  {
    id: 'efficiency_i',
    name: 'Efficiency I',
    desc: 'Generators cost 10% less',
    cost: 1,
    tier: 1,
    effect: (g) => { g.upgrades.costReduction = (g.upgrades.costReduction || 0) + 0.1; },
    requires: [],
  },
  {
    id: 'cascade_plus',
    name: 'Cascade+',
    desc: '+25% cascade rate',
    cost: 1,
    tier: 1,
    effect: (g) => { g.upgrades.cascadeBonus = (g.upgrades.cascadeBonus || 0.75) + 0.25; },
    requires: [],
  },

  // Tier 2 - Mid skills
  {
    id: 'quantum_leap',
    name: 'Quantum Leap',
    desc: 'Start with 100 Quanta after transcend',
    cost: 2,
    tier: 2,
    effect: (g) => { g.upgrades.startQuanta = 100; },
    requires: ['quick_start'],
  },
  {
    id: 'efficiency_ii',
    name: 'Efficiency II',
    desc: 'Generators cost 20% less',
    cost: 2,
    tier: 2,
    effect: (g) => { g.upgrades.costReduction = (g.upgrades.costReduction || 0) + 0.2; },
    requires: ['efficiency_i'],
  },
  {
    id: 'auto_forge',
    name: 'Auto-Forge',
    desc: 'Forges auto-click once per second',
    cost: 3,
    tier: 2,
    effect: (g) => { g.upgrades.autoForge = true; },
    requires: ['quick_start'],
  },
  {
    id: 'rich_start',
    name: 'Rich Start',
    desc: 'Start with 10 of each generator',
    cost: 3,
    tier: 2,
    effect: (g) => { g.upgrades.startGenerators = 10; },
    requires: ['efficiency_i', 'cascade_plus'],
  },

  // Tier 3 - Advanced skills
  {
    id: 'quantum_mastery',
    name: 'Quantum Mastery',
    desc: '+100% Quantum Essence gain',
    cost: 5,
    tier: 3,
    effect: (g) => { g.upgrades.transcendBonus = (g.upgrades.transcendBonus || 1) + 1; },
    requires: ['quantum_leap', 'auto_forge'],
  },
  {
    id: 'efficiency_iii',
    name: 'Efficiency III',
    desc: 'Generators cost 30% less',
    cost: 5,
    tier: 3,
    effect: (g) => { g.upgrades.costReduction = (g.upgrades.costReduction || 0) + 0.3; },
    requires: ['efficiency_ii'],
  },
  {
    id: 'multi_cascade',
    name: 'Multi-Cascade',
    desc: 'Cascade affects 2 tiers up',
    cost: 4,
    tier: 3,
    effect: (g) => { g.upgrades.cascadeTiers = 2; },
    requires: ['cascade_plus', 'rich_start'],
  },

  // Tier 4 - Ultimate skills
  {
    id: 'transcendence_plus',
    name: 'Transcendence+',
    desc: '+1 free transcend level',
    cost: 10,
    tier: 4,
    effect: (g) => { g.upgrades.freeTranscendLevels = (g.upgrades.freeTranscendLevels || 0) + 1; },
    requires: ['quantum_mastery', 'efficiency_iii'],
  },
  {
    id: 'infinite_potential',
    name: 'Infinite Potential',
    desc: 'All production x10',
    cost: 15,
    tier: 4,
    effect: (g) => { g.upgrades.globalMult = (g.upgrades.globalMult || 1) * 10; },
    requires: ['multi_cascade'],
  },
];