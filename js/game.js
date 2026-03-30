// Game Configuration
const LAYERS = [
    { id: 0, name: 'Quantum Foam', resource: 'quanta', produces: null },
    { id: 1, name: 'Particles', resource: 'particles', produces: 'quanta' },
    { id: 2, name: 'Atoms', resource: 'atoms', produces: 'particles' }
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
        producesResource: 'quanta'
    },
    {
        id: 'particle_accelerator',
        name: 'Particle Accelerator',
        description: 'Collides particles to extract quanta',
        layer: 1,
        baseCost: 50,
        costMultiplier: 1.15,
        baseProduction: 1,
        producesResource: 'particles'
    },
    {
        id: 'atomic_forge',
        name: 'Atomic Forge',
        description: 'Fuses particles into atoms',
        layer: 2,
        baseCost: 200,
        costMultiplier: 1.15,
        baseProduction: 1,
        producesResource: 'atoms'
    }
];

class Game {
    constructor() {
        this.resources = {
            quanta: 0,
            particles: 0,
            atoms: 0
        };
        
        this.totalQuantaProduced = 0;
        this.transcensions = 0;
        this.quantumEssence = 0;
        this.manualForges = 0;
        
        this.generators = {};
        GENERATORS.forEach(g => {
            this.generators[g.id] = { owned: 0 };
        });
        
        this.tickInterval = null;
        this.autoSaveInterval = null;
        this.tickRate = 1000;
        this.autoSaveRate = 30000;
        
        this.elements = {
            layerName: document.getElementById('layer-name'),
            quanta: document.getElementById('quanta'),
            quantaRate: document.getElementById('quanta-rate'),
            totalQuanta: document.getElementById('total-quanta'),
            transcensions: document.getElementById('transcensions'),
            qe: document.getElementById('qe'),
            qeMult: document.getElementById('qe-mult'),
            generatorList: document.getElementById('generator-list'),
            btnSave: document.getElementById('btn-save'),
            btnReset: document.getElementById('btn-reset'),
            btnForge: document.getElementById('btn-forge'),
            forgeCount: document.getElementById('forge-count'),
            particles: document.getElementById('particles'),
            particlesRate: document.getElementById('particles-rate'),
            atoms: document.getElementById('atoms'),
            atomsRate: document.getElementById('atoms-rate'),
            message: document.getElementById('message')
        };
        
        this.init();
    }
    
    init() {
        const loaded = this.load();
        this.render();
        
        if (loaded) {
            this.elements.message.textContent = 'Game loaded.';
        } else {
            this.elements.message.textContent = 'Welcome to Quantum Forge.';
        }
        
        this.bindEvents();
        this.startTicks();
        this.startAutoSave();
    }
    
    bindEvents() {
        this.elements.btnSave.addEventListener('click', () => this.save());
        this.elements.btnReset.addEventListener('click', () => {
            if (confirm('Reset all progress? This cannot be undone.')) {
                this.reset();
            }
        });
        this.elements.btnForge.addEventListener('click', () => this.forge());
    }
    
    forge() {
        this.resources.quanta++;
        this.totalQuantaProduced++;
        this.manualForges++;
        this.render();
    }
    
    getResourceAbbr(resource) {
        const abbrs = {
            quanta: 'Quanta',
            particles: 'Particles',
            atoms: 'Atoms'
        };
        return abbrs[resource] || resource;
    }
    
    getQEBoost() {
        return 1 + (this.quantumEssence * 0.05);
    }
    
    getGeneratorCost(genId) {
        const gen = GENERATORS.find(g => g.id === genId);
        const owned = this.generators[genId].owned;
        return Math.floor(gen.baseCost * Math.pow(gen.costMultiplier, owned));
    }
    
    getGeneratorProduction(genId) {
        const gen = GENERATORS.find(g => g.id === genId);
        const owned = this.generators[genId].owned;
        return gen.baseProduction * owned * this.getQEBoost();
    }
    
    getQuantaRate() {
        let rate = 0;
        
        // Direct foam generators - produces both quanta and particles
        rate += this.getGeneratorProduction('foam_generator');
        
        // Particle accelerators also produce quanta
        rate += this.getGeneratorProduction('particle_accelerator');
        
        // Atoms produce particles (which produce quanta)
        const atomProd = this.getGeneratorProduction('atomic_forge');
        rate += atomProd * 10; // Atoms give bonus to quanta
        
        return rate;
    }
    
    getParticlesRate() {
        // Foam generators produce particles as byproduct
        const foamProd = this.getGeneratorProduction('foam_generator');
        // Particle accelerators produce particles
        const accelProd = this.getGeneratorProduction('particle_accelerator');
        // Atoms produce particles too
        const atomProd = this.getGeneratorProduction('atomic_forge');
        
        return foamProd * 0.1 + accelProd + atomProd * 0.5;
    }
    
    getAtomsRate() {
        return this.getGeneratorProduction('atomic_forge');
    }
    
    buyGenerator(genId) {
        const cost = this.getGeneratorCost(genId);
        const gen = GENERATORS.find(g => g.id === genId);
        
        // All generators cost quanta
        if (this.resources.quanta < cost) {
            return false;
        }
        
        this.resources.quanta -= cost;
        this.generators[genId].owned++;
        
        this.render();
        return true;
    }
    
    tick() {
        // Produce resources
        const quantaRate = this.getQuantaRate();
        const particlesRate = this.getParticlesRate();
        const atomsRate = this.getAtomsRate();
        
        this.resources.quanta += quantaRate;
        this.resources.particles += particlesRate;
        this.resources.atoms += atomsRate;
        
        this.totalQuantaProduced += quantaRate;
        
        this.render();
    }
    
    save() {
        const data = {
            resources: this.resources,
            totalQuantaProduced: this.totalQuantaProduced,
            transcensions: this.transcensions,
            quantumEssence: this.quantumEssence,
            manualForges: this.manualForges,
            generators: this.generators,
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
            this.resources = data.resources || { quanta: 0, particles: 0, atoms: 0 };
            this.totalQuantaProduced = data.totalQuantaProduced || 0;
            this.transcensions = data.transcensions || 0;
            this.quantumEssence = data.quantumEssence || 0;
            this.manualForges = data.manualForges || 0;
            this.generators = data.generators || {};
            
            // Ensure all generators exist
            GENERATORS.forEach(g => {
                if (!this.generators[g.id]) {
                    this.generators[g.id] = { owned: 0 };
                }
            });
            
            return true;
        } catch (e) {
            console.error('Failed to load save:', e);
            return false;
        }
    }
    
    reset() {
        localStorage.removeItem('quantumForge');
        this.resources = { quanta: 0, particles: 0, atoms: 0 };
        this.totalQuantaProduced = 0;
        this.transcensions = 0;
        this.quantumEssence = 0;
        this.manualForges = 0;
        GENERATORS.forEach(g => {
            this.generators[g.id] = { owned: 0 };
        });
        this.elements.message.textContent = 'Game reset.';
        this.render();
    }
    
    formatNumber(n) {
        if (n < 1000) return Math.floor(n).toString();
        
        const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];
        const tier = Math.floor(Math.log10(n) / 3);
        if (tier >= suffixes.length) tier = suffixes.length - 1;
        
        const scaled = n / Math.pow(1000, tier);
        return scaled.toFixed(1) + suffixes[tier];
    }
    
    render() {
        // Resources
        this.elements.quanta.textContent = this.formatNumber(this.resources.quanta);
        this.elements.quantaRate.textContent = `(+${this.formatNumber(this.getQuantaRate())}/s)`;
        this.elements.particles.textContent = this.formatNumber(this.resources.particles);
        this.elements.particlesRate.textContent = `(+${this.formatNumber(this.getParticlesRate())}/s)`;
        this.elements.atoms.textContent = this.formatNumber(this.resources.atoms);
        this.elements.atomsRate.textContent = `(+${this.formatNumber(this.getAtomsRate())}/s)`;
        
        // Stats
        this.elements.totalQuanta.textContent = this.formatNumber(this.totalQuantaProduced);
        this.elements.transcensions.textContent = this.transcensions;
        this.elements.qe.textContent = this.quantumEssence;
        this.elements.qeMult.textContent = `(+${Math.floor((this.getQEBoost() - 1) * 100)}%)`;
        this.elements.forgeCount.textContent = `${this.manualForges} forges`;
        
        // Generators
        this.renderGenerators();
    }
    
    renderGenerators() {
        this.elements.generatorList.innerHTML = '';
        
        GENERATORS.forEach(gen => {
            const owned = this.generators[gen.id].owned;
            const cost = this.getGeneratorCost(gen.id);
            const production = this.getGeneratorProduction(gen.id);
            
            // Determine if we can afford this
            let affordable = false;
            if (gen.layer === 0) {
                affordable = this.resources.quanta >= cost;
            } else if (gen.producesResource === 'particles') {
                affordable = this.resources.particles >= cost;
            } else if (gen.producesResource === 'atoms') {
                affordable = this.resources.atoms >= cost;
            }
            
            const el = document.createElement('div');
            el.className = 'generator';
            
            el.innerHTML = `
                <div class="generator-info">
                    <div class="generator-name">${gen.name}</div>
                    <div class="generator-desc">${gen.description}</div>
                </div>
                <div class="generator-stats">
                    <div class="generator-owned">Owned: ${owned}</div>
                    <div class="generator-cost ${affordable ? 'affordable' : ''}">Cost: ${this.formatNumber(cost)} Quanta</div>
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
