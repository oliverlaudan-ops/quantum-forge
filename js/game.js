// Game Configuration
// Meta-Upgrades definition (Phase 1)
const META_UPGRADES = [
    {
        id: 'gen_mult',
        name: 'Generator Multiplier',
        description: 'Double all generator production',
        baseCost: 10,
        costMultiplier: 2,
        effect: (game) => { game.upgrades.genMult = (game.upgrades.genMult || 1) * 2; }
    },
    {
        id: 'forge_eff',
        name: 'Forge Efficiency',
        description: 'Each forge produces 10x more',
        baseCost: 5,
        costMultiplier: 2,
        effect: (game) => { game.upgrades.forgeMult = (game.upgrades.forgeMult || 1) * 10; }
    },
    {
        id: 'auto_buy',
        name: 'Automation',
        description: 'Auto-buy 1 generator every 5s (cascades up)',
        baseCost: 15,
        costMultiplier: 3,
        effect: (game) => { game.upgrades.autoBuy = true; game.upgrades.autoBuyTier = (game.upgrades.autoBuyTier || 0) + 1; }
    },
    {
        id: 'transcend_bonus',
        name: 'Transcendence Bonus',
        description: '+50% Quantum Essence from prestige',
        baseCost: 20,
        costMultiplier: 2.5,
        effect: (game) => { game.upgrades.transcendBonus = (game.upgrades.transcendBonus || 1) + 0.5; }
    }
];

const LAYERS = [
    { id: 0, name: 'Quantum Foam', resource: 'quanta' },
    { id: 1, name: 'Particles', resource: 'particles' },
    { id: 2, name: 'Atoms', resource: 'atoms' },
    { id: 3, name: 'Molecules', resource: 'molecules' },
    { id: 4, name: 'Cells', resource: 'cells' },
    { id: 5, name: 'Organisms', resource: 'organisms' },
    { id: 6, name: 'Civilizations', resource: 'civilizations' },
    { id: 7, name: 'Galaxies', resource: 'galaxies' },
    { id: 8, name: 'Universe', resource: 'universe' },
    { id: 9, name: 'Beyond', resource: 'beyond' }
];

const GENERATORS = [
    {
        id: 'foam_generator',
        name: 'Quantum Foam Generator',
        description: 'Harvests energy from the quantum foam',
        layer: 0,
        baseCost: 5,
        costMultiplier: 1.12,
        baseProduction: 1,
        produces: 'quanta'
    },
    {
        id: 'particle_accelerator',
        name: 'Particle Accelerator',
        description: 'Collides particles to extract energy',
        layer: 1,
        baseCost: 25,
        costMultiplier: 1.12,
        baseProduction: 1,
        produces: 'particles'
    },
    {
        id: 'atomic_forge',
        name: 'Atomic Forge',
        description: 'Fuses particles into atoms',
        layer: 2,
        baseCost: 75,
        costMultiplier: 1.12,
        baseProduction: 1,
        produces: 'atoms'
    },
    {
        id: 'molecular_assembler',
        name: 'Molecular Assembler',
        description: 'Combines atoms into molecules',
        layer: 3,
        baseCost: 200,
        costMultiplier: 1.12,
        baseProduction: 1,
        produces: 'molecules'
    },
    {
        id: 'bio_reactor',
        name: 'Bio-Reactor',
        description: 'Cultivates cellular structures',
        layer: 4,
        baseCost: 500,
        costMultiplier: 1.12,
        baseProduction: 1,
        produces: 'cells'
    },
    {
        id: 'evolution_chamber',
        name: 'Evolution Chamber',
        description: 'Accelerates evolutionary processes',
        layer: 5,
        baseCost: 1500,
        costMultiplier: 1.12,
        baseProduction: 1,
        produces: 'organisms'
    },
    {
        id: 'empire_engine',
        name: 'Empire Engine',
        description: 'Builds civilizations from organisms',
        layer: 6,
        baseCost: 5000,
        costMultiplier: 1.12,
        baseProduction: 1,
        produces: 'civilizations'
    },
    {
        id: 'star_forge',
        name: 'Star Forge',
        description: 'Creates galaxies of stars',
        layer: 7,
        baseCost: 20000,
        costMultiplier: 1.12,
        baseProduction: 1,
        produces: 'galaxies'
    },
    {
        id: 'reality_condenser',
        name: 'Reality Condenser',
        description: 'Weaves universes from galaxies',
        layer: 8,
        baseCost: 100000,
        costMultiplier: 1.12,
        baseProduction: 1,
        produces: 'universe'
    },
    {
        id: 'void_gateway',
        name: 'Void Gateway',
        description: 'Opens passages to the beyond',
        layer: 9,
        baseCost: 500000,
        costMultiplier: 1.12,
        baseProduction: 1,
        produces: 'beyond'
    }
];

// Which generator does each layer cascade TO (produces lower tier)
const CASCADE_FROM = {
    foam_generator: null,           // Layer 0 - base
    particle_accelerator: 'foam_generator',
    atomic_forge: 'particle_accelerator',
    molecular_assembler: 'atomic_forge',
    bio_reactor: 'molecular_assembler',
    evolution_chamber: 'bio_reactor',
    empire_engine: 'evolution_chamber',
    star_forge: 'empire_engine',
    reality_condenser: 'star_forge',
    void_gateway: 'reality_condenser'
};

// Layer tiers for transcendence scoring
const LAYER_TIER = {
    quanta: 1,
    particles: 2,
    atoms: 3,
    molecules: 4,
    cells: 5,
    organisms: 6,
    civilizations: 7,
    galaxies: 8,
    universe: 9,
    beyond: 10
};

class Game {
    constructor() {
        this.resources = {
            quanta: 0, particles: 0, atoms: 0, molecules: 0,
            cells: 0, organisms: 0, civilizations: 0,
            galaxies: 0, universe: 0, beyond: 0
        };
        
        this.owned = {};
        GENERATORS.forEach(g => this.owned[g.id] = 0);
        
        this.totalQuantaProduced = 0;
        this.transcensions = 0;
        this.quantumEssence = 0;
        this.manualForges = 0;
        this.researchPoints = 0;
        
        // Upgrades state
        this.upgrades = {
            genMult: 1,
            forgeMult: 1,
            autoBuy: false,
            autoBuyTier: 0,
            transcendBonus: 1
        };
        this.upgradeOwned = {};
        META_UPGRADES.forEach(u => this.upgradeOwned[u.id] = 0);
        
        this.autoBuyInterval = null;
        this.autoBuyTickRate = 5000; // 5 seconds
        
        // Track highest tier reached for transcension scoring
        this.highestTier = 0;
        
        this.tickInterval = null;
        this.autoSaveInterval = null;
        this.tickRate = 1000;
        this.autoSaveRate = 30000;
        
        this.elements = {};
        this.init();
    }
    
    init() {
        this.elements = {
            quanta: document.getElementById('quanta'),
            quantaRate: document.getElementById('quanta-rate'),
            particles: document.getElementById('particles'),
            particlesRate: document.getElementById('particles-rate'),
            atoms: document.getElementById('atoms'),
            atomsRate: document.getElementById('atoms-rate'),
            molecules: document.getElementById('molecules'),
            moleculesRate: document.getElementById('molecules-rate'),
            cells: document.getElementById('cells'),
            cellsRate: document.getElementById('cells-rate'),
            organisms: document.getElementById('organisms'),
            organismsRate: document.getElementById('organisms-rate'),
            civilizations: document.getElementById('civilizations'),
            civilizationsRate: document.getElementById('civilizations-rate'),
            galaxies: document.getElementById('galaxies'),
            galaxiesRate: document.getElementById('galaxies-rate'),
            universe: document.getElementById('universe'),
            universeRate: document.getElementById('universe-rate'),
            beyond: document.getElementById('beyond'),
            beyondRate: document.getElementById('beyond-rate'),
            totalQuanta: document.getElementById('total-quanta'),
            transcensions: document.getElementById('transcensions'),
            qe: document.getElementById('qe'),
            qeMult: document.getElementById('qe-mult'),
            forgeCount: document.getElementById('forge-count'),
            transcendSection: document.getElementById('transcend-section'),
            transcendGain: document.getElementById('transcend-gain'),
            btnTranscend: document.getElementById('btn-transcend'),
            generatorList: document.getElementById('generator-list'),
            btnForge: document.getElementById('btn-forge'),
            btnSave: document.getElementById('btn-save'),
            btnReset: document.getElementById('btn-reset'),
            message: document.getElementById('message'),
            rp: document.getElementById('rp'),
            upgradeList: document.getElementById('upgrade-list')
        };
        
        const loaded = this.load();
        this.render();
        
        if (loaded) {
            this.elements.message.textContent = 'Game loaded.';
        } else {
            this.elements.message.textContent = 'Welcome to Quantum Forge.';
        }
        
        this.elements.btnForge.addEventListener('click', () => this.forge());
        this.elements.btnSave.addEventListener('click', () => this.save());
        this.elements.btnReset.addEventListener('click', () => {
            if (confirm('Reset ALL progress including Quantum Essence?')) this.reset(true);
        });
        this.elements.btnTranscend.addEventListener('click', () => this.transcend());
        
        this.startTicks();
        this.startAutoSave();
        this.startAutoBuy();
    }
    
    forge() {
        this.resources.quanta += this.upgrades.forgeMult;
        this.totalQuantaProduced += this.upgrades.forgeMult;
        this.manualForges++;
        this.render();
    }
    
    getBoost() {
        return 1 + (this.quantumEssence * 0.1);
    }
    
    getCost(genId) {
        const gen = GENERATORS.find(g => g.id === genId);
        return Math.floor(gen.baseCost * Math.pow(gen.costMultiplier, this.owned[genId]));
    }
    
    getProduction(genId) {
        const gen = GENERATORS.find(g => g.id === genId);
        return gen.baseProduction * this.owned[genId] * this.getBoost() * this.upgrades.genMult;
    }
    
    getQuantaRate() {
        return this.getProduction('foam_generator');
    }
    
    getParticlesRate() {
        return this.getProduction('particle_accelerator') 
             + this.getResourceRate('atoms') * 0.5;
    }
    
    getAtomsRate() {
        return this.getProduction('atomic_forge') 
             + this.getResourceRate('molecules') * 0.5;
    }
    
    getMoleculesRate() {
        return this.getProduction('molecular_assembler')
             + this.getResourceRate('cells') * 0.5;
    }
    
    getCellsRate() {
        return this.getProduction('bio_reactor')
             + this.getResourceRate('organisms') * 0.5;
    }
    
    getOrganismsRate() {
        return this.getProduction('evolution_chamber')
             + this.getResourceRate('civilizations') * 0.5;
    }
    
    getCivilizationsRate() {
        return this.getProduction('empire_engine')
             + this.getResourceRate('galaxies') * 0.5;
    }
    
    getGalaxiesRate() {
        return this.getProduction('star_forge')
             + this.getResourceRate('universe') * 0.5;
    }
    
    getUniverseRate() {
        return this.getProduction('reality_condenser')
             + this.getResourceRate('beyond') * 0.5;
    }
    
    getBeyondRate() {
        return this.getProduction('void_gateway');
    }
    
    getResourceRate(resource) {
        switch(resource) {
            case 'quanta': return this.getQuantaRate();
            case 'particles': return this.getParticlesRate();
            case 'atoms': return this.getAtomsRate();
            case 'molecules': return this.getMoleculesRate();
            case 'cells': return this.getCellsRate();
            case 'organisms': return this.getOrganismsRate();
            case 'civilizations': return this.getCivilizationsRate();
            case 'galaxies': return this.getGalaxiesRate();
            case 'universe': return this.getUniverseRate();
            case 'beyond': return this.getBeyondRate();
            default: return 0;
        }
    }
    
    // Calculate transcension points based on highest tier reached
    calculateTranscendPoints() {
        // Check which tiers have significant production
        let score = 0;
        
        if (this.resources.beyond >= 1) {
            score = 1000 + Math.floor(this.resources.beyond * 10);
            this.highestTier = 10;
        } else if (this.resources.universe >= 1) {
            score = 500 + Math.floor(this.resources.universe * 5);
            this.highestTier = 9;
        } else if (this.resources.galaxies >= 1) {
            score = 200 + Math.floor(this.resources.galaxies * 2);
            this.highestTier = 8;
        } else if (this.resources.civilizations >= 1) {
            score = 100;
            this.highestTier = 7;
        } else if (this.resources.organisms >= 1) {
            score = 50;
            this.highestTier = 6;
        } else if (this.resources.cells >= 1) {
            score = 20;
            this.highestTier = 5;
        } else if (this.resources.molecules >= 1) {
            score = 10;
            this.highestTier = 4;
        } else if (this.resources.atoms >= 1) {
            score = 5;
            this.highestTier = 3;
        } else if (this.resources.particles >= 1) {
            score = 2;
            this.highestTier = 2;
        } else {
            this.highestTier = 1;
        }
        
        // Bonus for total quanta produced
        score += Math.floor(Math.log10(this.totalQuantaProduced + 1));
        
        // Cap minimum at 1
        return Math.max(1, score);
    }
    
    // Update highest tier reached based on current resources
    updateHighestTier() {
        if (this.resources.beyond >= 1) this.highestTier = 10;
        else if (this.resources.universe >= 1) this.highestTier = 9;
        else if (this.resources.galaxies >= 1) this.highestTier = 8;
        else if (this.resources.civilizations >= 1) this.highestTier = 7;
        else if (this.resources.organisms >= 1) this.highestTier = 6;
        else if (this.resources.cells >= 1) this.highestTier = 5;
        else if (this.resources.molecules >= 1) this.highestTier = 4;
        else if (this.resources.atoms >= 1) this.highestTier = 3;
        else if (this.resources.particles >= 1) this.highestTier = 2;
        else this.highestTier = 1;
    }
    
    canTranscend() {
        // Can transcend if you reached at least Atoms (tier 3)
        this.updateHighestTier();
        return this.highestTier >= 3 && this.resources.atoms >= 1;
    }
    
    getTranscendPreview() {
        this.updateHighestTier();
        if (!this.canTranscend()) return 0;
        return this.calculateTranscendPoints();
    }
    
    transcend() {
        if (!this.canTranscend()) return;
        
        const gain = this.calculateTranscendPoints();
        this.quantumEssence += gain;
        this.transcensions++;
        
        // Award Research Points based on transcensions count
        // More RP for harder prestiges
        const rpGain = Math.max(1, Math.floor(this.transcensions * 0.5));
        this.researchPoints += rpGain;
        
        // Reset progress but keep QE, RP, and upgrades
        this.reset(false);
        
        this.elements.message.textContent = `Transcended! +${this.format(gain)} QE, +${this.format(rpGain)} RP.`;
        this.save();
        this.render();
    }
    
    buyGenerator(genId) {
        const cost = this.getCost(genId);
        if (this.resources.quanta < cost) return;
        this.resources.quanta -= cost;
        this.owned[genId]++;
        this.render();
    }
    
    tick() {
        // Resources
        this.resources.quanta += this.getQuantaRate();
        this.resources.particles += this.getResourceRate('particles');
        this.resources.atoms += this.getResourceRate('atoms');
        this.resources.molecules += this.getResourceRate('molecules');
        this.resources.cells += this.getResourceRate('cells');
        this.resources.organisms += this.getResourceRate('organisms');
        this.resources.civilizations += this.getResourceRate('civilizations');
        this.resources.galaxies += this.getResourceRate('galaxies');
        this.resources.universe += this.getResourceRate('universe');
        this.resources.beyond += this.getResourceRate('beyond');
        
        this.totalQuantaProduced += this.getQuantaRate();
        
        this.updateHighestTier();
        
        // Cascade: each generator produces the one below it
        GENERATORS.forEach(gen => {
            const cascadeTarget = CASCADE_FROM[gen.id];
            if (cascadeTarget) {
                const cascadeGain = Math.floor(this.owned[gen.id] * 0.75);
                if (cascadeGain > 0) {
                    this.owned[cascadeTarget] += cascadeGain;
                }
            }
        });
        
        this.render();
    }
    
    // Buy a meta-upgrade with Research Points
    buyUpgrade(upgradeId) {
        const upgrade = META_UPGRADES.find(u => u.id === upgradeId);
        if (!upgrade) return;
        
        const cost = this.getUpgradeCost(upgradeId);
        if (this.researchPoints < cost) return;
        
        this.researchPoints -= cost;
        this.upgradeOwned[upgradeId]++;
        upgrade.effect(this);
        
        this.save();
        this.render();
    }
    
    getUpgradeCost(upgradeId) {
        const upgrade = META_UPGRADES.find(u => u.id === upgradeId);
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, this.upgradeOwned[upgradeId]));
    }
    
    // Auto-buy: find the highest owned generator and auto-buy 1 tier up
    autoBuyTick() {
        if (!this.upgrades.autoBuy) return;
        
        // Find highest tier generator owned
        let highestGen = null;
        for (let i = GENERATORS.length - 1; i >= 0; i--) {
            if (this.owned[GENERATORS[i].id] > 0) {
                highestGen = GENERATORS[i];
                break;
            }
        }
        
        if (!highestGen) return; // No generators yet
        
        // Find next tier up
        const tierAhead = this.upgrades.autoBuyTier || 1;
        const currentIdx = GENERATORS.findIndex(g => g.id === highestGen.id);
        const targetIdx = Math.min(currentIdx + tierAhead, GENERATORS.length - 1);
        const targetGen = GENERATORS[targetIdx];
        
        if (targetGen && this.resources.quanta >= this.getCost(targetGen.id)) {
            this.resources.quanta -= this.getCost(targetGen.id);
            this.owned[targetGen.id]++;
        }
    }
    
    startAutoBuy() {
        if (this.autoBuyInterval) clearInterval(this.autoBuyInterval);
        this.autoBuyInterval = setInterval(() => this.autoBuyTick(), this.autoBuyTickRate);
    }
    
    save() {
        const data = {
            resources: this.resources,
            owned: this.owned,
            totalQuantaProduced: this.totalQuantaProduced,
            transcensions: this.transcensions,
            quantumEssence: this.quantumEssence,
            manualForges: this.manualForges,
            highestTier: this.highestTier,
            researchPoints: this.researchPoints,
            upgrades: this.upgrades,
            upgradeOwned: this.upgradeOwned,
            savedAt: Date.now()
        };
        localStorage.setItem('quantumForge', JSON.stringify(data));
        this.elements.message.textContent = 'Game saved.';
    }
    
    load() {
        const raw = localStorage.getItem('quantumForge');
        if (!raw) return false;
        try {
            const data = JSON.parse(raw);
            this.resources = { ...this.resources, ...data.resources };
            this.owned = { ...this.owned, ...data.owned };
            this.totalQuantaProduced = data.totalQuantaProduced || 0;
            this.transcensions = data.transcensions || 0;
            this.quantumEssence = data.quantumEssence || 0;
            this.manualForges = data.manualForges || 0;
            this.highestTier = data.highestTier || 0;
            this.researchPoints = data.researchPoints || 0;
            this.upgrades = { ...this.upgrades, ...data.upgrades };
            this.upgradeOwned = { ...this.upgradeOwned, ...data.upgradeOwned };
            return true;
        } catch (e) {
            console.error('Load failed:', e);
            return false;
        }
    }
    
    reset(includeQE) {
        localStorage.removeItem('quantumForge');
        Object.keys(this.resources).forEach(k => this.resources[k] = 0);
        Object.keys(this.owned).forEach(k => this.owned[k] = 0);
        this.totalQuantaProduced = 0;
        this.manualForges = 0;
        this.highestTier = 0;
        
        // Keep RP and upgrades on transcend (they persist)
        // Only reset on full wipe
        if (!includeQE) {
            // Keep QE, RP, upgrades on transcend - don't save yet
            this.elements.message.textContent = 'Transcended!';
        } else {
            // Full reset
            this.transcensions = 0;
            this.quantumEssence = 0;
            this.researchPoints = 0;
            this.upgrades = {
                genMult: 1,
                forgeMult: 1,
                autoBuy: false,
                autoBuyTier: 0,
                transcendBonus: 1
            };
            Object.keys(this.upgradeOwned).forEach(k => this.upgradeOwned[k] = 0);
            this.elements.message.textContent = 'Game reset.';
            this.save();
        }
        this.render();
    }
    
    format(n) {
        if (n < 1000) return Math.floor(n).toString();
        if (n >= 1e15) return n.toExponential(2);
        const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
        const tier = Math.min(Math.floor(Math.log10(n) / 3), suffixes.length - 1);
        return (n / Math.pow(1000, tier)).toFixed(1) + suffixes[tier];
    }
    
    render() {
        // Resources
        this.elements.quanta.textContent = this.format(this.resources.quanta);
        this.elements.quantaRate.textContent = `(+${this.format(this.getQuantaRate())}/s)`;
        
        this.elements.particles.textContent = this.format(this.resources.particles);
        this.elements.particlesRate.textContent = `(+${this.format(this.getResourceRate('particles'))}/s)`;
        
        this.elements.atoms.textContent = this.format(this.resources.atoms);
        this.elements.atomsRate.textContent = `(+${this.format(this.getResourceRate('atoms'))}/s)`;
        
        this.elements.molecules.textContent = this.format(this.resources.molecules);
        this.elements.moleculesRate.textContent = `(+${this.format(this.getResourceRate('molecules'))}/s)`;
        
        this.elements.cells.textContent = this.format(this.resources.cells);
        this.elements.cellsRate.textContent = `(+${this.format(this.getResourceRate('cells'))}/s)`;
        
        this.elements.organisms.textContent = this.format(this.resources.organisms);
        this.elements.organismsRate.textContent = `(+${this.format(this.getResourceRate('organisms'))}/s)`;
        
        this.elements.civilizations.textContent = this.format(this.resources.civilizations);
        this.elements.civilizationsRate.textContent = `(+${this.format(this.getResourceRate('civilizations'))}/s)`;
        
        this.elements.galaxies.textContent = this.format(this.resources.galaxies);
        this.elements.galaxiesRate.textContent = `(+${this.format(this.getResourceRate('galaxies'))}/s)`;
        
        this.elements.universe.textContent = this.format(this.resources.universe);
        this.elements.universeRate.textContent = `(+${this.format(this.getResourceRate('universe'))}/s)`;
        
        this.elements.beyond.textContent = this.format(this.resources.beyond);
        this.elements.beyondRate.textContent = `(+${this.format(this.getResourceRate('beyond'))}/s)`;
        
        // Stats
        this.elements.totalQuanta.textContent = this.format(this.totalQuantaProduced);
        this.elements.transcensions.textContent = this.transcensions;
        this.elements.qe.textContent = this.format(this.quantumEssence);
        this.elements.qeMult.textContent = `(+${this.format(Math.floor((this.getBoost() - 1) * 100))}%)`;
        this.elements.forgeCount.textContent = `${this.manualForges} forges`;
        
        // Research Points display
        if (this.elements.rp) this.elements.rp.textContent = this.format(this.researchPoints);
        
        // Meta Upgrades UI
        if (this.elements.upgradeList) {
            this.elements.upgradeList.innerHTML = '';
            META_UPGRADES.forEach(upgrade => {
                const owned = this.upgradeOwned[upgrade.id] || 0;
                const cost = this.getUpgradeCost(upgrade.id);
                const affordable = this.researchPoints >= cost;
                
                // Don't show if already maxed (for autoBuy)
                if (upgrade.id === 'autoBuy' && this.upgrades.autoBuy && owned >= 10) return;
                
                const el = document.createElement('div');
                el.className = `generator upgrade ${affordable ? 'affordable' : ''}`;
                el.innerHTML = `
                    <div class="generator-info">
                        <div class="generator-name">${upgrade.name}</div>
                        <div class="generator-desc">${upgrade.description}</div>
                    </div>
                    <div class="generator-stats">
                        <div class="generator-owned">Owned: ${this.format(owned)}</div>
                        <div class="generator-cost">Cost: ${this.format(cost)} RP</div>
                    </div>
                `;
                el.addEventListener('click', () => this.buyUpgrade(upgrade.id));
                this.elements.upgradeList.appendChild(el);
            });
        }
        
        // Transcendence UI
        const preview = this.getTranscendPreview();
        if (preview > 0) {
            this.elements.transcendSection.style.display = 'block';
            this.elements.transcendGain.textContent = `+${this.format(preview)} QE`;
            this.elements.btnTranscend.disabled = false;
        } else {
            this.elements.transcendSection.style.display = 'block';
            this.elements.transcendGain.textContent = 'Reach Atoms to transcend';
            this.elements.btnTranscend.disabled = true;
        }
        
        // Generators
        this.elements.generatorList.innerHTML = '';
        
        GENERATORS.forEach(gen => {
            const owned = this.owned[gen.id] || 0;
            const cost = this.getCost(gen.id);
            const affordable = this.resources.quanta >= cost;
            
            // Cascade bonus
            let bonusText = '';
            const cascadeTarget = CASCADE_FROM[gen.id];
            if (cascadeTarget && this.owned[gen.id] > 0) {
                const cascadeRate = this.owned[gen.id] * 0.5;
                if (cascadeRate >= 1) {
                    const cascadeGen = GENERATORS.find(g => g.id === cascadeTarget);
                    bonusText = ` (+${this.format(cascadeRate)}/s cascade)`;
                }
            }
            
            const el = document.createElement('div');
            el.className = 'generator';
            el.innerHTML = `
                <div class="generator-info">
                    <div class="generator-name">${gen.name}</div>
                    <div class="generator-desc">${gen.description}</div>
                </div>
                <div class="generator-stats">
                    <div class="generator-owned">Owned: ${this.format(owned)}${bonusText}</div>
                    <div class="generator-cost ${affordable ? 'affordable' : ''}">Cost: ${this.format(cost)} Quanta</div>
                </div>
            `;
            el.addEventListener('click', () => this.buyGenerator(gen.id));
            this.elements.generatorList.appendChild(el);
        });
    }
    
    startTicks() {
        this.tickInterval = setInterval(() => this.tick(), this.tickRate);
    }
    
    startAutoSave() {
        this.autoSaveInterval = setInterval(() => this.save(), this.autoSaveRate);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
