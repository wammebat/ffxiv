// ============================================
// MAIN APPLICATION
// ============================================
// Entry point for the modular webapp
// Initializes all systems and loads the appropriate module

/**
 * Application State
 */
const App = {
    initialized: false,
    version: '1.0.0',
    
    /**
     * Initialize the application
     */
    async init() {
        if (this.initialized) {
            console.warn('[App] Already initialized');
            return;
        }
        
        console.log(`[App] Starting v${this.version}...`);
        
        try {
            // Show loading screen
            UIHelpers.showLoading('Initializing...');
            
            // Initialize data layer
            await DataLayer.init();
            
            // Initialize database sync service
            await DatabaseSyncService.init();
            
            // Initialize module manager
            await ModuleManager.init();
            
            // Setup global event listeners
            this.setupGlobalEventListeners();
            
            // Add sync UI components
            SyncManagementUI.addHeaderSyncButton();
            
            // Initialize complete
            this.initialized = true;
            
            UIHelpers.hideLoading();
            
            console.log('[App] Initialization complete');
            
            // Show welcome notification for first-time users
            this.checkFirstRun();
            
        } catch (error) {
            console.error('[App] Initialization failed:', error);
            UIHelpers.hideLoading();
            UIHelpers.showNotification(
                'Failed to initialize application. Please refresh the page.',
                'error',
                0
            );
        }
    },
    
    /**
     * Setup global event listeners
     */
    setupGlobalEventListeners() {
        // Search functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', UIHelpers.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }
        
        // Settings button
        const settingsBtn = document.querySelector('.header-btn[title="Settings"]');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }
        
        // User profile button
        const profileBtn = document.querySelector('.header-btn[title="User Profile"]');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                this.showProfile();
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Before unload - warn if there are unsaved changes
        window.addEventListener('beforeunload', (e) => {
            // This would check for unsaved changes in the future
            // For now, we just log
            console.log('[App] Page unloading...');
        });
    },
    
    /**
     * Handle search across modules
     */
    async handleSearch(query) {
        if (!query || query.trim().length < 2) return;
        
        console.log('[App] Searching for:', query);
        
        // This would be implemented based on current module
        // For now, just a placeholder
        
        // Future: Implement module-specific search
        if (ModuleManager.currentModule === 'ffxiv') {
            // Search FFXIV data
        }
    },
    
    /**
     * Show settings dialog
     */
    showSettings() {
        const preferences = ConfigUtils.getUserPreferences();
        
        const settingsHTML = `
            <div class="settings-panel">
                <div class="setting-group">
                    <label class="setting-label">
                        Theme
                        <select id="theme-select" class="filter-select">
                            <option value="dark" ${preferences.theme === 'dark' ? 'selected' : ''}>Dark</option>
                            <option value="light" ${preferences.theme === 'light' ? 'selected' : ''}>Light</option>
                        </select>
                    </label>
                </div>
                
                <div class="setting-group">
                    <label class="setting-label">
                        <input type="checkbox" id="notifications-toggle" 
                            ${preferences.notifications ? 'checked' : ''}>
                        Enable Notifications
                    </label>
                </div>
                
                <div class="setting-group">
                    <label class="setting-label">
                        <input type="checkbox" id="autosave-toggle" 
                            ${preferences.autoSave ? 'checked' : ''}>
                        Auto-save Changes
                    </label>
                </div>
                
                ${ModuleManager.currentModule === 'ffxiv' ? `
                    <hr style="border: 1px solid var(--border-color); margin: 1.5rem 0;">
                    
                    <h4 style="color: var(--text-primary); margin-bottom: 1rem;">FFXIV Settings</h4>
                    
                    <div class="setting-group">
                        <label class="setting-label">
                            Data Center
                            <select id="datacenter-select" class="filter-select">
                                <option value="Aether" ${preferences.dataCenter === 'Aether' ? 'selected' : ''}>Aether</option>
                                <option value="Primal" ${preferences.dataCenter === 'Primal' ? 'selected' : ''}>Primal</option>
                                <option value="Crystal" ${preferences.dataCenter === 'Crystal' ? 'selected' : ''}>Crystal</option>
                                <option value="Dynamis" ${preferences.dataCenter === 'Dynamis' ? 'selected' : ''}>Dynamis</option>
                            </select>
                        </label>
                    </div>
                    
                    <div class="setting-group">
                        <label class="setting-label">
                            Home World
                            <input type="text" id="world-input" class="search-input" 
                                value="${preferences.world || ''}" 
                                placeholder="e.g., Balmung"
                                style="width: 100%; margin-top: 0.5rem;">
                        </label>
                    </div>
                ` : ''}
                
                <hr style="border: 1px solid var(--border-color); margin: 1.5rem 0;">
                
                <div class="setting-group">
                    <button class="btn btn-secondary" id="export-data-btn">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                        </svg>
                        Export Data
                    </button>
                    
                    <button class="btn btn-secondary" id="import-data-btn">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                        </svg>
                        Import Data
                    </button>
                    
                    <button class="btn btn-secondary" id="clear-cache-btn">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="1 4 1 10 7 10"/>
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                        </svg>
                        Clear Cache
                    </button>
                </div>
            </div>
        `;
        
        const modal = UIHelpers.showModal({
            title: 'Settings',
            content: settingsHTML,
            buttons: [
                {
                    text: 'Cancel'
                },
                {
                    text: 'Save Changes',
                    primary: true,
                    onClick: () => {
                        this.saveSettings();
                    }
                }
            ]
        });
        
        // Add event listeners for buttons
        document.getElementById('export-data-btn')?.addEventListener('click', async () => {
            const data = await DataLayer.exportAll();
            UIHelpers.downloadJSON(data, `ffxiv-companion-export-${new Date().toISOString().split('T')[0]}.json`);
        });
        
        document.getElementById('import-data-btn')?.addEventListener('click', async () => {
            try {
                const data = await UIHelpers.importJSON();
                await DataLayer.importAll(data);
                UIHelpers.showNotification('Data imported successfully. Refreshing...', 'success');
                setTimeout(() => location.reload(), 2000);
            } catch (error) {
                console.error('Import failed:', error);
            }
        });
        
        document.getElementById('clear-cache-btn')?.addEventListener('click', async () => {
            const confirmed = await UIHelpers.confirm(
                'This will clear all cached API data. Your saved data will not be affected.',
                'Clear Cache?'
            );
            
            if (confirmed) {
                await DataLayer.clearCache();
                UIHelpers.showNotification('Cache cleared successfully', 'success');
            }
        });
    },
    
    /**
     * Save settings from dialog
     */
    saveSettings() {
        const updates = {
            theme: document.getElementById('theme-select')?.value,
            notifications: document.getElementById('notifications-toggle')?.checked,
            autoSave: document.getElementById('autosave-toggle')?.checked
        };
        
        // FFXIV-specific settings
        if (ModuleManager.currentModule === 'ffxiv') {
            updates.dataCenter = document.getElementById('datacenter-select')?.value;
            updates.world = document.getElementById('world-input')?.value;
        }
        
        ConfigUtils.saveUserPreferences(updates);
        UIHelpers.showNotification('Settings saved successfully', 'success');
        
        // Apply theme if changed
        if (updates.theme) {
            this.applyTheme(updates.theme);
        }
    },
    
    /**
     * Apply theme
     */
    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        // Theme implementation would go here
        console.log('[App] Theme changed to:', theme);
    },
    
    /**
     * Show user profile
     */
    showProfile() {
        const preferences = ConfigUtils.getUserPreferences();
        
        const profileHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="width: 80px; height: 80px; margin: 0 auto 1rem; background: linear-gradient(135deg, var(--accent-primary), var(--accent-tertiary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem;">
                    🎮
                </div>
                
                <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">
                    Guest User
                </h3>
                
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                    ${preferences.world ? `${preferences.world} (${preferences.dataCenter})` : 'No world set'}
                </p>
                
                <div style="text-align: left; color: var(--text-secondary);">
                    <p><strong>Version:</strong> ${this.version}</p>
                    <p><strong>Current Module:</strong> ${ModuleManager.currentModule || 'None'}</p>
                    <p style="margin-top: 1rem; font-size: 0.875rem; color: var(--text-muted);">
                        User authentication coming soon!
                    </p>
                </div>
            </div>
        `;
        
        UIHelpers.showModal({
            title: 'Profile',
            content: profileHTML,
            buttons: [{ text: 'Close', primary: true }]
        });
    },
    
    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.querySelector('.search-input')?.focus();
        }
        
        // Ctrl/Cmd + S: Save (prevent default browser save)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            UIHelpers.showNotification('Auto-save is enabled', 'info', 2000);
        }
        
        // Escape: Close modals/popups
        if (e.key === 'Escape') {
            // Close module selector if open
            const moduleSelector = document.getElementById('module-selector');
            if (moduleSelector) {
                ModuleManager.hideModuleSelector();
            }
        }
    },
    
    /**
     * Check if this is the first run
     */
    checkFirstRun() {
        const hasRunBefore = localStorage.getItem('app_has_run');
        
        if (!hasRunBefore) {
            localStorage.setItem('app_has_run', 'true');
            
            setTimeout(() => {
                UIHelpers.showNotification(
                    'Welcome to FFXIV Companion! Click the settings icon to customize your experience.',
                    'info',
                    8000
                );
            }, 1000);
        }
    }
};

// ============================================
// APPLICATION STARTUP
// ============================================

/**
 * Start the application when DOM is ready
 */
function startApp() {
    console.log('[Bootstrap] DOM ready, starting application...');
    App.init();
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}

// ============================================
// GLOBAL ERROR HANDLING
// ============================================

window.addEventListener('error', (event) => {
    console.error('[Global Error]', event.error);
    
    UIHelpers.showNotification(
        'An unexpected error occurred. Please refresh the page.',
        'error',
        0
    );
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Promise Rejection]', event.reason);
    
    UIHelpers.showNotification(
        'An unexpected error occurred. Please try again.',
        'error',
        5000
    );
});

// ============================================
// SERVICE WORKER (Future Enhancement)
// ============================================

// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/sw.js')
//         .then(registration => {
//             console.log('[ServiceWorker] Registered:', registration);
//         })
//         .catch(error => {
//             console.log('[ServiceWorker] Registration failed:', error);
//         });
// }
