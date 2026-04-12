import { GameState } from './gameState';
import { GameEngine } from './engine';
import { PrestigeSystem } from './prestige';
import { Renderer } from './renderer';

const SAVE_KEY = 'quantumForge';

function main() {
  const state = new GameState();
  const engine = new GameEngine(state);
  const prestige = new PrestigeSystem(state);
  const renderer = new Renderer();

  renderer.init(state, engine, prestige);

  // Load save
  const raw = localStorage.getItem(SAVE_KEY);
  let loaded = false;
  if (raw) {
    try {
      loaded = state.load(JSON.parse(raw));
    } catch { /* ignore */ }
  }

  // Event handlers
  const forgeBtn = document.getElementById('btn-forge');
  const saveBtn = document.getElementById('btn-save');
  const resetBtn = document.getElementById('btn-reset');
  const transcendBtn = document.getElementById('btn-transcend');
  const ascendBtn = document.getElementById('btn-ascend');
  const msg = document.getElementById('message');

  if (forgeBtn) forgeBtn.addEventListener('click', () => {
    engine.forge();
    renderer.render();
  });

  if (saveBtn) saveBtn.addEventListener('click', () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state.save()));
    renderer.showNotification('Game saved.');
  });

  if (resetBtn) resetBtn.addEventListener('click', () => {
    if (confirm('Reset ALL progress including Quantum Essence?')) {
      state.reset(true);
      localStorage.removeItem(SAVE_KEY);
      renderer.showNotification('Game reset.');
      renderer.render();
    }
  });

  if (transcendBtn) transcendBtn.addEventListener('click', () => {
    const result = prestige.transcend();
    if (result.qeGain > 0) {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state.save()));
      renderer.showNotification(`Transcended! +${result.qeGain} QE, +${result.tpGain} TP, +${result.rpGain} RP.`);
      renderer.render();
    }
  });

  if (ascendBtn) ascendBtn.addEventListener('click', () => {
    if (!prestige.canAscend()) return;
    if (!confirm('Ascend? This will reset ALL progress including QE, TP, RP, and Skills!')) return;
    const result = prestige.ascend();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state.save()));
    renderer.showNotification(`Ascended! +${result.apGain} AP, +${result.cfGain} CF`);
    renderer.render();
  });

  // Initial message
  renderer.showNotification(loaded ? 'Game loaded.' : 'Welcome to Quantum Forge.');

  // Game loop
  setInterval(() => {
    engine.tick();
    prestige.updateHighestTier();
    renderer.render();
  }, 1000);

  // Auto-save
  setInterval(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state.save()));
  }, 30000);

  // Auto-buy
  setInterval(() => {
    engine.autoBuyTick();
  }, 5000);

  // Auto-forge
  setInterval(() => {
    if (state.upgrades.autoForge) {
      engine.forge();
      renderer.render();
    }
  }, 1000);

  renderer.render();
}

if (document.readyState === 'complete') {
  main();
} else {
  document.addEventListener('DOMContentLoaded', main);
}