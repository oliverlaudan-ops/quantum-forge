import { format, formatRate } from './utils';
import { GENERATORS, CASCADE_FROM, META_UPGRADES, SKILL_TREE, ASCENSION_UPGRADES } from './data';
import { GameState } from './gameState';
import { GameEngine } from './engine';
import { PrestigeSystem } from './prestige';

type El = HTMLElement | null;

export class Renderer {
  private el: Record<string, El> = {};
  private state!: GameState;
  private engine!: GameEngine;
  private prestige!: PrestigeSystem;

  init(state: GameState, engine: GameEngine, prestige: PrestigeSystem): void {
    this.state = state;
    this.engine = engine;
    this.prestige = prestige;

    const ids = [
      'quanta','quanta-rate','particles','particles-rate','atoms','atoms-rate',
      'molecules','molecules-rate','cells','cells-rate','organisms','organisms-rate',
      'civilizations','civilizations-rate','galaxies','galaxies-rate','universe','universe-rate',
      'beyond','beyond-rate','total-quanta','transcensions','qe','qe-mult','forge-count',
      'transcend-section','transcend-gain','btn-transcend','generator-list',
      'btn-forge','btn-save','btn-reset','message','rp','tp','upgrade-list','skill-tree',
      'notification','ascensions','ap','cf','ascend-section','ascend-gain',
      'btn-ascend','ascension-list','cosmic-mult-display'
    ];
    for (const id of ids) this.el[id] = document.getElementById(id);
    this.initTabs();
  }

  render(): void {
    const s = this.state;
    const e = this.engine;

    // Resources
    const resNames = ['quanta','particles','atoms','molecules','cells','organisms','civilizations','galaxies','universe','beyond'];
    for (const r of resNames) {
      const val = this.el[r]; const rate = this.el[r + '-rate'];
      if (val) val.textContent = format(s.resources[r] ?? 0);
      if (rate) rate.textContent = formatRate(e.getResourceRate(r));
    }

    // Stats
    this.setText('total-quanta', format(s.totalQuantaProduced));
    this.setText('transcensions', String(s.transcensions));
    this.setText('qe', format(s.quantumEssence));
    this.setText('qe-mult', `(+${format(Math.floor((e.getBoost() - 1) * 100))}%)`);
    this.setText('forge-count', `${s.manualForges} forges`);
    this.setText('rp', format(s.researchPoints));
    this.setText('tp', format(s.transcendPoints));

    // Transcend
    const preview = this.prestige.getTranscendPreview();
    if (this.el['transcend-gain']) {
      this.el['transcend-gain'].textContent = this.prestige.canTranscend()
        ? `+${format(preview)} QE` : 'Reach Atoms to transcend';
    }
    if (this.el['btn-transcend'] instanceof HTMLButtonElement) {
      this.el['btn-transcend'].disabled = !this.prestige.canTranscend();
    }

    // Transcend progress bar
    if (this.prestige.canTranscend()) {
      const progressEl = document.getElementById('transcend-progress-bar');
      if (progressEl) {
        const pct = Math.min(100, (s.highestTier / 10) * 100);
        progressEl.style.width = pct + '%';
      }
    }

    // Ascension stats
    this.setText('ascensions', String(s.ascensionData.ascensions));
    this.setText('ap', format(s.ascensionData.ascensionPoints));
    this.setText('cf', format(s.ascensionData.cosmicFragments));
    const cosmicMult = s.ascensionData.ascensionUpgrades.cosmicMultiplier;
    this.setText('cosmic-mult-display', cosmicMult > 1 ? `x${format(cosmicMult)}` : '');

    // Ascend preview
    if (this.el['ascend-gain']) {
      if (this.prestige.canAscend()) {
        const preview = this.prestige.getAscensionPreview();
        this.el['ascend-gain'].textContent = `+${format(preview.apGain)} AP, +${format(preview.cfGain)} CF`;
      } else {
        this.el['ascend-gain'].textContent = 'Reach 5 Transcensions or 100 QE earned';
      }
    }
    if (this.el['btn-ascend'] instanceof HTMLButtonElement) {
      this.el['btn-ascend'].disabled = !this.prestige.canAscend();
    }

    // Generators
    this.renderGenerators();
    // Upgrades
    this.renderUpgrades();
    // Skill tree
    this.renderSkillTree();
    // Ascension upgrades
    this.renderAscensionUpgrades();
  }

  private renderGenerators(): void {
    const list = this.el['generator-list'];
    if (!list) return;
    list.innerHTML = '';
    for (const gen of GENERATORS) {
      const owned = this.state.owned[gen.id] ?? 0;
      const cost = this.engine.getCost(gen.id);
      const affordable = this.state.resources.quanta >= cost;
      const cascadeTarget = CASCADE_FROM[gen.id];
      let bonusText = '';
      if (cascadeTarget && owned > 0) {
        const cascadeRate = owned * 0.5;
        if (cascadeRate >= 1) bonusText = ` (+${format(cascadeRate)}/s cascade)`;
      }
      const div = document.createElement('div');
      div.className = `generator gen-layer-${gen.layer}`;
      div.innerHTML = `<div class="generator-info"><div class="generator-name">${gen.name}</div><div class="generator-desc">${gen.description}</div></div><div class="generator-stats"><div class="generator-owned">Owned: ${format(owned)}${bonusText}</div><div class="generator-cost${affordable ? ' affordable' : ''}">Cost: ${format(cost)} Quanta</div></div>`;
      const genId = gen.id;
      div.addEventListener('click', () => { this.engine.buyGenerator(genId); this.render(); });
      list.appendChild(div);
    }
  }

  private renderUpgrades(): void {
    const list = this.el['upgrade-list'];
    if (!list) return;
    list.innerHTML = '';
    for (const upg of META_UPGRADES) {
      const owned = this.state.upgradeOwned[upg.id] ?? 0;
      const cost = this.prestige.getUpgradeCost(upg.id);
      const affordable = this.state.researchPoints >= cost;
      if (upg.id === 'auto_buy' && this.state.upgrades.autoBuy && owned >= 10) continue;
      const div = document.createElement('div');
      div.className = `generator upgrade${affordable ? ' affordable' : ''}`;
      div.innerHTML = `<div class="generator-info"><div class="generator-name">${upg.name}</div><div class="generator-desc">${upg.description}</div></div><div class="generator-stats"><div class="generator-owned">Owned: ${format(owned)}</div><div class="generator-cost">Cost: ${format(cost)} RP</div></div>`;
      const uid = upg.id;
      div.addEventListener('click', () => { this.prestige.buyUpgrade(uid); this.render(); });
      list.appendChild(div);
    }
  }

  private renderSkillTree(): void {
    const container = this.el['skill-tree'];
    if (!container) return;
    container.innerHTML = '';
    const tiers: Record<number, typeof SKILL_TREE> = {};
    for (const skill of SKILL_TREE) {
      if (!tiers[skill.tier]) tiers[skill.tier] = [];
      tiers[skill.tier].push(skill);
    }
    for (const tierKey of Object.keys(tiers).sort((a, b) => +a - +b)) {
      const tierDiv = document.createElement('div');
      tierDiv.className = 'skill-tier';
      tierDiv.innerHTML = `<div class="skill-tier-label">Tier ${tierKey}</div>`;
      for (const skill of tiers[+tierKey]) {
        const owned = this.state.skillOwned[skill.id];
        const canBuy = this.prestige.canBuySkill(skill.id);
        const div = document.createElement('div');
        div.className = `skill${owned ? ' owned' : canBuy ? ' available' : ' locked'}`;
        div.innerHTML = `<div class="skill-name">${skill.name}${owned ? ' ✓' : ''}</div><div class="skill-desc">${skill.desc}</div><div class="skill-cost">${owned ? 'Owned' : skill.cost + ' TP'}</div>`;
        if (!owned && canBuy) {
          const sid = skill.id;
          div.addEventListener('click', () => { this.prestige.buySkill(sid); this.render(); });
        }
        tierDiv.appendChild(div);
      }
      container.appendChild(tierDiv);
    }
  }

  private renderAscensionUpgrades(): void {
    const list = this.el['ascension-list'];
    if (!list) return;
    list.innerHTML = '';
    for (const upg of ASCENSION_UPGRADES) {
      const owned = this.state.ascensionData.ascensionUpgradeOwned[upg.id] ?? 0;
      if (owned >= upg.maxLevel) continue;
      const cost = this.prestige.getAscensionUpgradeCost(upg.id);
      const affordable = this.state.ascensionData.ascensionPoints >= cost;
      const div = document.createElement('div');
      div.className = `generator ascension-upgrade${affordable ? ' affordable' : ''}`;
      div.innerHTML = `<div class="generator-info"><div class="generator-name">${upg.name}</div><div class="generator-desc">${upg.description}</div></div><div class="generator-stats"><div class="generator-owned">Level: ${owned}/${upg.maxLevel}</div><div class="generator-cost">Cost: ${format(cost)} AP</div></div>`;
      const uid = upg.id;
      div.addEventListener('click', () => { this.prestige.buyAscensionUpgrade(uid); this.render(); });
      list.appendChild(div);
    }
  }

  private initTabs(): void {
    const panels = document.querySelectorAll<HTMLElement>('[data-tab]');
    const buttons = document.querySelectorAll<HTMLElement>('[data-tab-target]');
    const switchTab = (name: string) => {
      panels.forEach(p => {
        if (p.dataset.tab === name) {
          p.classList.remove('hidden');
        } else {
          p.classList.add('hidden');
        }
      });
      buttons.forEach(b => b.classList.toggle('active', b.dataset.tabTarget === name));
      this.render();
    };
    buttons.forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tabTarget!)));
    switchTab('forge');
  }

  showNotification(text: string): void {
    const el = this.el['notification'];
    if (!el) return;
    el.textContent = text;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 3000);
  }

  private setText(id: string, text: string): void {
    const el = this.el[id];
    if (el) el.textContent = text;
  }
}