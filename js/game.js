// Game Configuration
const LAYERS = [
    { id: 0, name: 'Quantum Foam', resource: 'quanta' },
    { id: 1, name: 'Particles', resource: 'particles' },
    { id: 2, name: 'Atoms', resource: 'atoms' }
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
    }
];

class Game {
    constructor() {
        this.resources = { quanta: 0, particles: 0, atoms: 0 };
        this.owned = { foam_generator: 0, particle_accelerator: 0, atomic_forge: 0 };
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
        // Get DOM elements
        this.elements = {
            quanta: document.getElementById('quanta'),
            quantaRate: document.getElementById('quanta-rate'),
            particles: document.getElementById('particles'),
            particlesRate: document.getElementById('particles-rate'),
            atoms: document.getElementById('atoms'),
            atomsRate: document.getElementById('atoms-rate'),
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
    
    getQuantaRate() {
        return this.getProduction('foam_generator') 
             + this.getProduction('particle_accelerator') 
             + this.getProduction('atomic_forge');
    }
    
    getParticlesRate() {
        const foam = this.owned.foam_generator * 0.1;
        const accel = this.getProduction('particle_accelerator');
        const atoms = this.owned.atomic_forge * 0.5;
        return foam + accel + atoms;
    }
    
    getAtomsRate() {
        return this.getProduction('atomic_forge');
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
        this.resources.particles += this.getParticlesRate();
        this.resources.atoms += this.getAtomsRate();
        this.totalQuantaProduced += this.getQuantaRate();
        
        // Cascade: accelerators make foam, forges make accelerators
        const foamGain = Math.floor(this.getParticlesRate() * 0.5);
        if (foamGain > 0) this.owned.foam_generator += foamGain;
        
        const accelGain = Math.floor(this.getAtomsRate() * 0.5);
        if (accelGain > 0) this.owned.particle_accelerator += accelGain;
        
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
            this.resources = data.resources || { quanta: 0, particles: 0, atoms: 0 };
            this.owned = data.owned || { foam_generator: 0, particle_accelerator: 0, atomic_forge: 0 };
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
        this.resources = { quanta: 0, particles: 0, atoms: 0 };
        this.owned = { foam_generator: 0, particle_accelerator: 0, atomic_forge: 0 };
        this.totalQuantaProduced = 0;
        this.transcensions = 0;
        this.quantumEssence = 0;
        this.manualForges = 0;
        this.elements.message.textContent = 'Game reset.';
        this.render();
    }
    
    format(n) {
        if (n < 1000) return Math.floor(n).toString();
        const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];
        const tier = Math.min(Math.floor(Math.log10(n) / 3), suffixes.length - 1);
        return (n / Math.pow(1000, tier)).toFixed(1) + suffixes[tier];
    }
    
    render() {
        // Resources
        this.elements.quanta.textContent = this.format(this.resources.quanta);
        this.elements.quantaRate.textContent = `(+${this.format(this.getQuantaRate())}/s)`;
        this.elements.particles.textContent = this.format(this.resources.particles);
        this.elements.particlesRate.textContent = `(+${this.format(this.getParticlesRate())}/s)`;
        this.elements.atoms.textContent = this.format(this.resources.atoms);
        this.elements.atomsRate.textContent = `(+${this.format(this.getAtomsRate())}/s)`;
        
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
            if (gen.id === 'foam_generator' && this.owned.particle_accelerator > 0) {
                const bonus = Math.floor(this.getParticlesRate() * 0.5);
                if (bonus > 0) bonusText = ` (+${this.format(bonus)}/s cascade)`;
            }
            if (gen.id === 'particle_accelerator' && this.owned.atomic_forge > 0) {
                const bonus = Math.floor(this.getAtomsRate() * 0.5);
                if (bonus > 0) bonusText = ` (+${this.format(bonus)}/s cascade)`;
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
