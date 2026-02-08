// ============================================
// MODULE MANAGER - Game Module Selection System
// ============================================
// Handles switching between different game modules (FFXIV, Stock Tracker, etc.)

const ModuleManager = {
    
    currentModule: null,
    moduleInstances: {},
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    async init() {
        console.log('[ModuleManager] Initializing...');
        
        // Get last used module from preferences
        const preferences = await PreferencesService.get();
        const defaultModule = preferences.defaultModule || 'ffxiv';
        
        // Check if we should show module selector or load default
        const enabledModules = ConfigUtils.getEnabledModules();
        
        if (enabledModules.length === 1) {
            // Only one module enabled, load it directly
            await this.loadModule(enabledModules[0].id);
        } else if (enabledModules.length > 1) {
            // Multiple modules, check if we have a saved preference
            const savedModule = localStorage.getItem(Config.storageKeys.currentModule);
            
            if (savedModule && ConfigUtils.isModuleEnabled(savedModule)) {
                await this.loadModule(savedModule);
            } else {
                // Show module selector
                this.showModuleSelector();
            }
        } else {
            // No modules enabled
            console.error('[ModuleManager] No modules are enabled!');
            UIHelpers.showNotification('No modules available', 'error');
        }
        
        // Add module selector button to header
        this.addModuleSelectorButton();
    },
    
    // ============================================
    // MODULE SELECTOR UI
    // ============================================
    
    showModuleSelector() {
        const enabledModules = ConfigUtils.getEnabledModules();
        
        const selectorHTML = `
            <div class="module-selector-overlay" id="module-selector">
                <div class="module-selector-container">
                    <h1 class="module-selector-title">Select a Module</h1>
                    <p class="module-selector-subtitle">Choose which tool you'd like to use</p>
                    
                    <div class="module-grid">
                        ${enabledModules.map(module => `
                            <div class="module-card" data-module-id="${module.id}">
                                <div class="module-icon">${module.icon}</div>
                                <h3 class="module-name">${module.name}</h3>
                                <p class="module-description">${module.description}</p>
                                <div class="module-features">
                                    ${module.features.slice(0, 3).map(f => 
                                        `<span class="feature-tag">${f}</span>`
                                    ).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing selector if present
        const existing = document.getElementById('module-selector');
        if (existing) existing.remove();
        
        // Add to page
        document.body.insertAdjacentHTML('beforeend', selectorHTML);
        
        // Add click handlers
        document.querySelectorAll('.module-card').forEach(card => {
            card.addEventListener('click', async () => {
                const moduleId = card.dataset.moduleId;
                await this.loadModule(moduleId);
                this.hideModuleSelector();
            });
        });
    },
    
    hideModuleSelector() {
        const selector = document.getElementById('module-selector');
        if (selector) {
            selector.classList.add('fade-out');
            setTimeout(() => selector.remove(), 300);
        }
    },
    
    addModuleSelectorButton() {
        const enabledModules = ConfigUtils.getEnabledModules();
        
        // Only show if multiple modules enabled
        if (enabledModules.length <= 1) return;
        
        const headerRight = document.querySelector('.header-right');
        if (!headerRight) return;
        
        const btnHTML = `
            <button class="header-btn module-switcher-btn" id="module-switcher-btn" title="Switch Module">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="13" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="13" width="7" height="7" rx="1"/>
                    <rect x="13" y="13" width="7" height="7" rx="1"/>
                </svg>
            </button>
        `;
        
        // Insert before settings button
        headerRight.insertAdjacentHTML('afterbegin', btnHTML);
        
        // Add click handler
        document.getElementById('module-switcher-btn').addEventListener('click', () => {
            this.showModuleSelector();
        });
    },
    
    // ============================================
    // MODULE LOADING
    // ============================================
    
    async loadModule(moduleId) {
        console.log(`[ModuleManager] Loading module: ${moduleId}`);
        
        if (!ConfigUtils.isModuleEnabled(moduleId)) {
            console.error(`[ModuleManager] Module ${moduleId} is not enabled`);
            return;
        }
        
        // Show loading state
        UIHelpers.showLoading();
        
        try {
            // Unload current module if exists
            if (this.currentModule) {
                await this.unloadModule(this.currentModule);
            }
            
            // Load the new module
            let moduleInstance;
            
            switch (moduleId) {
                case 'ffxiv':
                    moduleInstance = await this.loadFFXIVModule();
                    break;
                case 'stock-tracker':
                    moduleInstance = await this.loadStockTrackerModule();
                    break;
                default:
                    throw new Error(`Unknown module: ${moduleId}`);
            }
            
            // Store module instance
            this.moduleInstances[moduleId] = moduleInstance;
            this.currentModule = moduleId;
            
            // Save to preferences
            localStorage.setItem(Config.storageKeys.currentModule, moduleId);
            
            // Update UI
            this.updateModuleBadge(moduleId);
            
            UIHelpers.hideLoading();
            
            console.log(`[ModuleManager] Module ${moduleId} loaded successfully`);
            
        } catch (error) {
            console.error(`[ModuleManager] Error loading module:`, error);
            UIHelpers.showNotification(`Failed to load ${moduleId}`, 'error');
            UIHelpers.hideLoading();
        }
    },
    
    async unloadModule(moduleId) {
        console.log(`[ModuleManager] Unloading module: ${moduleId}`);
        
        const instance = this.moduleInstances[moduleId];
        if (instance && instance.cleanup) {
            await instance.cleanup();
        }
        
        // Clear main content
        const mainContent = document.getElementById('page-content');
        if (mainContent) {
            mainContent.innerHTML = '';
        }
    },
    
    // ============================================
    // MODULE IMPLEMENTATIONS
    // ============================================
    
    async loadFFXIVModule() {
        console.log('[ModuleManager] Initializing FFXIV module...');
        
        // Initialize FFXIV module (this will use the refactored app.js logic)
        if (typeof FFXIVModule !== 'undefined') {
            await FFXIVModule.init();
            return FFXIVModule;
        } else {
            throw new Error('FFXIV module not found');
        }
    },
    
    async loadStockTrackerModule() {
        console.log('[ModuleManager] Initializing Stock Tracker module...');
        
        // Placeholder for future stock tracker module
        const mainContent = document.getElementById('page-content');
        mainContent.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Stock Tracker</h1>
                <p class="page-subtitle">Coming Soon</p>
            </div>
            <div style="text-align: center; padding: 4rem; color: var(--text-muted);">
                <p style="font-size: 1.125rem; margin-bottom: 1rem;">
                    Stock tracking and analysis features are under development.
                </p>
                <p>Check back soon for real-time market data and recommendations!</p>
            </div>
        `;
        
        return {
            id: 'stock-tracker',
            cleanup: async () => {}
        };
    },
    
    // ============================================
    // UI HELPERS
    // ============================================
    
    updateModuleBadge(moduleId) {
        const module = Config.modules[moduleId];
        if (!module) return;
        
        // Update logo text with current module
        const logoText = document.querySelector('.logo-text');
        if (logoText) {
            logoText.textContent = module.name;
        }
        
        // Update logo icon
        const logoIcon = document.querySelector('.logo-icon');
        if (logoIcon) {
            logoIcon.textContent = module.icon;
        }
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModuleManager };
}
