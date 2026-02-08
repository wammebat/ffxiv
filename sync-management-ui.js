// ============================================
// SYNC MANAGEMENT UI
// ============================================
// UI components for managing database synchronization

const SyncManagementUI = {
    
    // ============================================
    // HEADER REFRESH BUTTON
    // ============================================
    
    /**
     * Add sync refresh button to header
     */
    addHeaderSyncButton() {
        const headerRight = document.querySelector('.header-right');
        if (!headerRight) return;
        
        const btnHTML = `
            <button class="header-btn sync-btn" id="sync-refresh-btn" title="Sync Data from APIs">
                <svg class="sync-icon" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 4v6h-6M1 20v-6h6"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                </svg>
            </button>
        `;
        
        // Insert before other buttons
        headerRight.insertAdjacentHTML('afterbegin', btnHTML);
        
        // Add click handler
        const btn = document.getElementById('sync-refresh-btn');
        btn.addEventListener('click', () => this.showSyncMenu());
        
        // Show indicator if sync is needed
        this.updateSyncIndicator();
        
        // Update indicator periodically
        setInterval(() => this.updateSyncIndicator(), 60000); // Every minute
    },
    
    /**
     * Update sync indicator badge
     */
    updateSyncIndicator() {
        const btn = document.getElementById('sync-refresh-btn');
        if (!btn) return;
        
        const status = DatabaseSyncService.getSyncStatus();
        const needsSync = Object.values(status).some(s => s.needsSync);
        
        // Add/remove indicator
        const existing = btn.querySelector('.sync-indicator');
        if (existing) existing.remove();
        
        if (needsSync) {
            btn.insertAdjacentHTML('beforeend', '<span class="sync-indicator"></span>');
        }
    },
    
    /**
     * Show sync menu dropdown
     */
    showSyncMenu() {
        // Remove existing menu
        const existing = document.getElementById('sync-menu');
        if (existing) {
            existing.remove();
            return;
        }
        
        const status = DatabaseSyncService.getSyncStatus();
        const syncInProgress = DatabaseSyncService.syncInProgress;
        
        const menuHTML = `
            <div class="sync-menu" id="sync-menu">
                <div class="sync-menu-header">
                    <h4>Database Sync</h4>
                    <button class="sync-menu-close">×</button>
                </div>
                
                <div class="sync-menu-actions">
                    <button class="btn btn-primary" id="sync-all-btn" ${syncInProgress ? 'disabled' : ''}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M23 4v6h-6M1 20v-6h6"/>
                            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                        </svg>
                        ${syncInProgress ? 'Syncing...' : 'Sync All Tables'}
                    </button>
                    
                    <button class="btn btn-secondary" id="sync-settings-btn">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="10" cy="10" r="3"/>
                            <path d="M10 1v2m0 14v2M4.22 4.22l1.42 1.42m8.72 8.72l1.42 1.42M1 10h2m14 0h2M4.22 15.78l1.42-1.42m8.72-8.72l1.42-1.42"/>
                        </svg>
                        Configure
                    </button>
                </div>
                
                <div class="sync-menu-status">
                    <h5>Sync Status</h5>
                    <div class="sync-status-list">
                        ${this.renderSyncStatusList(status)}
                    </div>
                </div>
                
                <div class="sync-menu-footer">
                    <small class="text-muted">
                        ${Config.features.enableDatabase ? 
                            'Connected to AWS RDS' : 
                            'Using localStorage (development mode)'}
                    </small>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', menuHTML);
        
        // Position menu
        const btn = document.getElementById('sync-refresh-btn');
        const menu = document.getElementById('sync-menu');
        const rect = btn.getBoundingClientRect();
        
        menu.style.top = `${rect.bottom + 8}px`;
        menu.style.right = `${window.innerWidth - rect.right}px`;
        
        // Add event listeners
        this.attachSyncMenuListeners();
        
        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', this.handleOutsideClick);
        }, 100);
    },
    
    /**
     * Render sync status list
     */
    renderSyncStatusList(status) {
        return Object.entries(status)
            .map(([table, info]) => {
                const needsSyncClass = info.needsSync ? 'needs-sync' : '';
                const enabledClass = info.enabled ? 'enabled' : '';
                
                return `
                    <div class="sync-status-item ${needsSyncClass} ${enabledClass}">
                        <div class="sync-status-info">
                            <span class="sync-status-table">${table}</span>
                            <span class="sync-status-time">
                                ${info.lastSync ? 
                                    `Last: ${UIHelpers.formatDate(info.lastSync, 'relative')}` : 
                                    'Never synced'}
                            </span>
                        </div>
                        <div class="sync-status-actions">
                            <button class="btn-icon sync-table-btn" data-table="${table}" title="Sync now">
                                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M23 4v6h-6M1 20v-6h6"/>
                                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                                </svg>
                            </button>
                            <label class="toggle-switch" title="Auto-sync">
                                <input type="checkbox" 
                                    class="auto-sync-toggle" 
                                    data-table="${table}" 
                                    ${info.enabled ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                `;
            })
            .join('');
    },
    
    /**
     * Attach event listeners to sync menu
     */
    attachSyncMenuListeners() {
        // Close button
        document.querySelector('.sync-menu-close')?.addEventListener('click', () => {
            this.closeSyncMenu();
        });
        
        // Sync all button
        document.getElementById('sync-all-btn')?.addEventListener('click', async () => {
            this.closeSyncMenu();
            await DatabaseSyncService.syncAll(true);
            this.updateSyncIndicator();
        });
        
        // Settings button
        document.getElementById('sync-settings-btn')?.addEventListener('click', () => {
            this.closeSyncMenu();
            this.showSyncSettings();
        });
        
        // Individual table sync buttons
        document.querySelectorAll('.sync-table-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const table = e.currentTarget.dataset.table;
                this.closeSyncMenu();
                
                UIHelpers.showLoading(`Syncing ${table}...`);
                await DatabaseSyncService.syncTable(table, true);
                UIHelpers.hideLoading();
                
                this.updateSyncIndicator();
                UIHelpers.showNotification(`${table} synced successfully`, 'success');
            });
        });
        
        // Auto-sync toggles
        document.querySelectorAll('.auto-sync-toggle').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const table = e.target.dataset.table;
                const enabled = e.target.checked;
                DatabaseSyncService.toggleAutoSync(table, enabled);
            });
        });
    },
    
    /**
     * Handle outside click to close menu
     */
    handleOutsideClick(e) {
        const menu = document.getElementById('sync-menu');
        const btn = document.getElementById('sync-refresh-btn');
        
        if (menu && !menu.contains(e.target) && !btn.contains(e.target)) {
            SyncManagementUI.closeSyncMenu();
        }
    },
    
    /**
     * Close sync menu
     */
    closeSyncMenu() {
        const menu = document.getElementById('sync-menu');
        if (menu) {
            menu.classList.add('closing');
            setTimeout(() => menu.remove(), 200);
        }
        document.removeEventListener('click', this.handleOutsideClick);
    },
    
    // ============================================
    // SYNC SETTINGS PANEL
    // ============================================
    
    /**
     * Show detailed sync settings
     */
    showSyncSettings() {
        const status = DatabaseSyncService.getSyncStatus();
        const syncHistory = DatabaseSyncService.syncHistory.slice(0, 10);
        
        const settingsHTML = `
            <div class="sync-settings-panel">
                <div class="settings-section">
                    <h4>Auto-Sync Configuration</h4>
                    <p class="text-muted">Configure automatic synchronization intervals for each table.</p>
                    
                    <div class="sync-config-list">
                        ${this.renderSyncConfigList(status)}
                    </div>
                </div>
                
                <div class="settings-section">
                    <h4>Sync History</h4>
                    <div class="sync-history-list">
                        ${this.renderSyncHistory(syncHistory)}
                    </div>
                </div>
                
                <div class="settings-section">
                    <h4>Database Connection</h4>
                    <div class="db-connection-info">
                        <div class="info-row">
                            <span class="info-label">Status:</span>
                            <span class="info-value ${Config.features.enableDatabase ? 'text-success' : 'text-warning'}">
                                ${Config.features.enableDatabase ? '✓ Connected to AWS RDS' : '⚠ Using localStorage (dev mode)'}
                            </span>
                        </div>
                        ${Config.features.enableDatabase ? `
                            <div class="info-row">
                                <span class="info-label">Endpoint:</span>
                                <span class="info-value">${Config.database.aws.endpoint || 'Not configured'}</span>
                            </div>
                        ` : `
                            <div class="info-row">
                                <span class="info-label">Note:</span>
                                <span class="info-value text-muted">Configure AWS RDS in .env to enable database features</span>
                            </div>
                        `}
                    </div>
                </div>
                
                <div class="settings-section">
                    <h4>Actions</h4>
                    <div class="sync-actions">
                        <button class="btn btn-secondary" id="export-sync-config-btn">
                            Export Configuration
                        </button>
                        <button class="btn btn-secondary" id="clear-sync-history-btn">
                            Clear History
                        </button>
                        <button class="btn btn-secondary" id="reset-sync-state-btn">
                            Reset All Sync Times
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        UIHelpers.showModal({
            title: 'Database Sync Settings',
            content: settingsHTML,
            buttons: [
                {
                    text: 'Close',
                    primary: true
                }
            ]
        });
        
        // Attach listeners
        this.attachSyncSettingsListeners();
    },
    
    /**
     * Render sync configuration list
     */
    renderSyncConfigList(status) {
        return Object.entries(status)
            .map(([table, info]) => {
                const intervalHours = info.interval / (60 * 60 * 1000);
                
                return `
                    <div class="sync-config-item">
                        <div class="config-header">
                            <h5>${table}</h5>
                            <label class="toggle-switch">
                                <input type="checkbox" 
                                    class="config-auto-sync-toggle" 
                                    data-table="${table}" 
                                    ${info.enabled ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="config-body">
                            <label class="config-label">
                                Sync Interval (hours):
                                <input type="number" 
                                    class="config-interval-input" 
                                    data-table="${table}" 
                                    value="${intervalHours}" 
                                    min="1" 
                                    max="168"
                                    step="1">
                            </label>
                            <div class="config-status">
                                Last sync: ${info.lastSync ? 
                                    UIHelpers.formatDate(info.lastSync, 'relative') : 
                                    'Never'}
                            </div>
                        </div>
                    </div>
                `;
            })
            .join('');
    },
    
    /**
     * Render sync history
     */
    renderSyncHistory(history) {
        if (history.length === 0) {
            return '<div class="text-muted">No sync history yet</div>';
        }
        
        return history.map(entry => {
            const statusClass = entry.success ? 'success' : 'error';
            const statusIcon = entry.success ? '✓' : '✗';
            
            return `
                <div class="sync-history-item ${statusClass}">
                    <div class="history-header">
                        <span class="history-status">${statusIcon}</span>
                        <span class="history-table">${entry.tableName}</span>
                        <span class="history-time">${UIHelpers.formatDate(entry.startTime, 'relative')}</span>
                    </div>
                    <div class="history-details">
                        <span>Duration: ${entry.duration}ms</span>
                        ${entry.inserted ? `<span>Inserted: ${entry.inserted}</span>` : ''}
                        ${entry.updated ? `<span>Updated: ${entry.updated}</span>` : ''}
                        ${entry.errors && entry.errors.length > 0 ? 
                            `<span class="text-danger">Errors: ${entry.errors.length}</span>` : 
                            ''}
                    </div>
                </div>
            `;
        }).join('');
    },
    
    /**
     * Attach sync settings listeners
     */
    attachSyncSettingsListeners() {
        // Auto-sync toggles
        document.querySelectorAll('.config-auto-sync-toggle').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const table = e.target.dataset.table;
                const enabled = e.target.checked;
                DatabaseSyncService.toggleAutoSync(table, enabled);
            });
        });
        
        // Interval inputs
        document.querySelectorAll('.config-interval-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const table = e.target.dataset.table;
                const hours = parseFloat(e.target.value);
                const intervalMs = hours * 60 * 60 * 1000;
                DatabaseSyncService.updateSyncInterval(table, intervalMs);
            });
        });
        
        // Export config
        document.getElementById('export-sync-config-btn')?.addEventListener('click', () => {
            const config = {
                syncConfig: DatabaseSyncService.syncConfig,
                lastSyncTimes: DatabaseSyncService.lastSyncTimes
            };
            UIHelpers.downloadJSON(config, `sync-config-${new Date().toISOString().split('T')[0]}.json`);
        });
        
        // Clear history
        document.getElementById('clear-sync-history-btn')?.addEventListener('click', async () => {
            const confirmed = await UIHelpers.confirm(
                'This will clear all sync history. Are you sure?',
                'Clear History'
            );
            
            if (confirmed) {
                DatabaseSyncService.syncHistory = [];
                UIHelpers.showNotification('Sync history cleared', 'success');
            }
        });
        
        // Reset sync state
        document.getElementById('reset-sync-state-btn')?.addEventListener('click', async () => {
            const confirmed = await UIHelpers.confirm(
                'This will reset all last sync times, causing all tables to sync on next update. Continue?',
                'Reset Sync Times'
            );
            
            if (confirmed) {
                DatabaseSyncService.lastSyncTimes = {};
                DatabaseSyncService.saveSyncState();
                UIHelpers.showNotification('Sync times reset', 'success');
            }
        });
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SyncManagementUI };
}
