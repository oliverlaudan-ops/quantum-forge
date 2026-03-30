// Game Configuration
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
        baseCost: 10,
        costMultiplier: 1.15,
        baseProduction: 1,
        produces: 'quanta'
    },
    {
        id: 'particle_accelerator',
        name: 'Particle Accelerator',
        description: 'Collides particles to extract energy',
        layer: 1,
        baseCost: 50,
        costMultiplier: 1.15,
        baseProduction: 1,
        produces: 'particles'
    },
    {
        id: 'atomic_forge',
        name: 'Atomic Forge',
        description: 'Fuses particles into atoms',
        layer: 2,
        baseCost: 200,
        costMultiplier: 1.15,
        baseProduction: 1,
        produces: 'atoms'
    },
    {
        id: 'molecular_assembler',
        name: 'Molecular Assembler',
        description: 'Combines atoms into molecules',
        layer: 3,
        baseCost: 1000,
        costMultiplier: 1.15,
        baseProduction: 1,
        produces: 'molecules'
    },
    {
        id: 'bio_reactor',
        name: 'Bio-Reactor',
        description: 'Cultivates cellular structures',
        layer: 4,
        baseCost: 5000,
        costMultiplier: 1.15,
        baseProduction: 1,
        produces: 'cells'
    },
    {
        id: 'evolution_chamber',
        name: 'Evolution Chamber',
        description: 'Accelerates evolutionary processes',
        layer: 5,
        baseCost: 25000,
        costMultiplier: 1.15,
        baseProduction: 1,
        produces: 'organisms'
    },
    {
        id: 'empire_engine',
        name: 'Empire Engine',
        description: 'Builds civilizations from organisms',
        layer: 6,
        baseCost: 150000,
        costMultiplier: 1.15,
        baseProduction: 1,
        produces: 'civilizations'
    },
    {
        id: 'star_forge',
        name: 'Star Forge',
        description: 'Creates galaxies of stars',
        layer: 7,
        baseCost: 1000000,
        costMultiplier: 1.15,
        baseProduction: 1,
        produces: 'galaxies'
    },
    {
        id: 'reality_condenser',
        name: 'Reality Condenser',
        description: 'Weaves universes from galaxies',
        layer: 8,
        baseCost: 10000000,
        costMultiplier: 1.15,
        baseProduction: 1,
        produces: 'universe'
    },
    {
        id: 'void_gateway',
        name: 'Void Gateway',
        description: 'Opens passages to the beyond',
        layer: 9,
        baseCost: 100000000,
        costMultiplier: 1.15,
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
            generatorList: document.getElementById('generator-list'),
            btnForge: document.getElementById('btn-forge'),
            btnSave: document.getElementById('btn-save'),
            btnReset: document.getElementById('btn-reset'),
            message: document.getElementById('message')
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
            if (confirm('Reset all progress?')) this.reset();
        });
        
        this.startTicks();
        this.startAutoSave();
    }
    
    forge() {
        this.resources.quanta++;
        this.totalQuantaProduced++;
        this.manualForges++;
        this.render();
    }
    
    getBoost() {
        return 1 + (this.quantumEssence * 0.05);
    }
    
    getCost(genId) {
        const gen = GENERATORS.find(g => g.id === genId);
        return Math.floor(gen.baseCost * Math.pow(gen.costMultiplier, this.owned[genId]));
    }
    
    getProduction(genId) {
        const gen = GENERATORS.find(g => g.id === genId);
        return gen.baseProduction * this.owned[genId] * this.getBoost();
    }
    
    getResourceRate(resource) {
        let rate = 0;
        GENERATORS.forEach(gen => {
            if (gen.produces === resource) {
                rate += this.getProduction(gen.id);
            }
        });
        // Cascade bonus: each resource gives some of the resource below
        if (resource === 'quanta') {
            rate += this.getResourceRate('particles') * 0.1;
        }
        if (resource === 'particles') {
            rate += this.getResourceRate('atoms') * 0.5;
        }
        if (resource === 'atoms') {
            rate += this.getResourceRate('molecules') * 0.5;
        }
        if (resource === 'molecules') {
            rate += this.getResourceRate('cells') * 0.5;
        }
        if (resource === 'cells') {
            rate += this.getResourceRate('organisms') * 0.5;
        }
        if (resource === 'organisms') {
            rate += this.getResourceRate('civilizations') * 0.5;
        }
        if (resource === 'civilizations') {
            rate += this.getResourceRate('galaxies') * 0.5;
        }
        if (resource === 'galaxies') {
            rate += this.getResourceRate('universe') * 0.5;
        }
        if (resource === 'universe') {
            rate += this.getResourceRate('beyond') * 0.5;
        }
        return rate;
    }
    
    getQuantaRate() {
        return this.getProduction('foam_generator') 
             + this.getProduction('particle_accelerator') 
             + this.getProduction('atomic_forge')
             + this.getProduction('molecular_assembler')
             + this.getProduction('bio_reactor')
             + this.getProduction('evolution_chamber')
             + this.getProduction('empire_engine')
             + this.getProduction('star_forge')
             + this.getProduction('reality_condenser')
             + this.getProduction('void_gateway');
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
        
        // Cascade: each generator produces the one below it
        GENERATORS.forEach(gen => {
            const cascadeTarget = CASCADE_FROM[gen.id];
            if (cascadeTarget) {
                const cascadeRate = this.getResourceRate(gen.produces) * 0.5;
                const gain = Math.floor(cascadeRate);
                if (gain > 0) {
                    this.owned[cascadeTarget] += gain;
                }
            }
        });
        
        this.render();
    }
    
    save() {
        const data = {
            resources: this.resources,
            owned: this.owned,
            totalQuantaProduced: this.totalQuantaProduced,
            transcensions: this.transcensions,
            quantumEssence: this.quantumEssence,
            manualForges: this.manualForges,
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
            return true;
        } catch (e) {
            console.error('Load failed:', e);
            return false;
        }
    }
    
    reset() {
        localStorage.removeItem('quantumForge');
        Object.keys(this.resources).forEach(k => this.resources[k] = 0);
        Object.keys(this.owned).forEach(k => this.owned[k] = 0);
        this.totalQuantaProduced = 0;
        this.transcensions = 0;
        this.quantumEssence = 0;
        this.manualForges = 0;
        this.elements.message.textContent = 'Game reset.';
        this.render();
    }
    
    format(n) {
        if (n < 1000) return Math.floor(n).toString();
        const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];
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
        this.elements.qe.textContent = this.quantumEssence;
        this.elements.qeMult.textContent = `(+${Math.floor((this.getBoost() - 1) * 100)}%)`;
        this.elements.forgeCount.textContent = `${this.manualForges} forges`;
        
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
                const cascadeRate = this.getResourceRate(gen.produces) * 0.5;
                const bonus = Math.floor(cascadeRate);
                if (bonus > 0) {
                    const cascadeGen = GENERATORS.find(g => g.id === cascadeTarget);
                    bonusText = ` (+${this.format(bonus)}/s ${cascadeGen.name.replace(' Generator','').replace(' Accelerator','').replace(' Forge','').replace(' Assembler','').replace(' Reactor','').replace(' Chamber','').replace(' Engine','').replace(' Condenser','').replace(' Gateway','')} cascade)`;
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
                    <div class="generator-owned">Owned: ${owned}${bonusText}</div>
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
