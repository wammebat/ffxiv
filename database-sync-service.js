// ============================================
// DATABASE SYNC SERVICE
// ============================================
// Handles synchronization between external APIs and AWS RDS database
// Supports scheduled updates and manual refreshes

const DatabaseSyncService = {
    
    // Sync state
    syncInProgress: false,
    lastSyncTimes: {},
    syncSchedules: {},
    syncHistory: [],
    
    // ============================================
    // CONFIGURATION
    // ============================================
    
    syncConfig: {
        // Auto-sync configuration for each table
        achievements: {
            enabled: false,
            interval: 24 * 60 * 60 * 1000, // 24 hours
            apis: ['xivapi', 'ffxivCollect']
        },
        titles: {
            enabled: false,
            interval: 24 * 60 * 60 * 1000,
            apis: ['xivapi', 'ffxivCollect']
        },
        mounts: {
            enabled: false,
            interval: 12 * 60 * 60 * 1000, // 12 hours
            apis: ['xivapi', 'ffxivCollect']
        },
        minions: {
            enabled: false,
            interval: 12 * 60 * 60 * 1000,
            apis: ['xivapi', 'ffxivCollect']
        },
        orchestrions: {
            enabled: false,
            interval: 24 * 60 * 60 * 1000,
            apis: ['xivapi', 'ffxivCollect']
        },
        emotes: {
            enabled: false,
            interval: 24 * 60 * 60 * 1000,
            apis: ['xivapi', 'ffxivCollect']
        },
        bardings: {
            enabled: false,
            interval: 24 * 60 * 60 * 1000,
            apis: ['ffxivCollect']
        },
        hairstyles: {
            enabled: false,
            interval: 24 * 60 * 60 * 1000,
            apis: ['ffxivCollect']
        },
        facewear: {
            enabled: false,
            interval: 24 * 60 * 60 * 1000,
            apis: ['ffxivCollect']
        }
    },
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    async init() {
        console.log('[DatabaseSyncService] Initializing...');
        
        // Load last sync times from storage
        this.loadSyncState();
        
        // Start scheduled syncs if enabled
        if (Config.features.enableDatabase) {
            this.startScheduledSyncs();
        }
        
        console.log('[DatabaseSyncService] Initialized');
    },
    
    loadSyncState() {
        const stored = localStorage.getItem('db_sync_state');
        if (stored) {
            try {
                const state = JSON.parse(stored);
                this.lastSyncTimes = state.lastSyncTimes || {};
                this.syncConfig = { ...this.syncConfig, ...state.syncConfig };
            } catch (e) {
                console.error('[DatabaseSyncService] Error loading sync state:', e);
            }
        }
    },
    
    saveSyncState() {
        const state = {
            lastSyncTimes: this.lastSyncTimes,
            syncConfig: this.syncConfig
        };
        localStorage.setItem('db_sync_state', JSON.stringify(state));
    },
    
    // ============================================
    // SYNC OPERATIONS
    // ============================================
    
    /**
     * Sync a single table from APIs to database
     * @param {string} tableName - Table to sync
     * @param {boolean} force - Force sync even if recently synced
     */
    async syncTable(tableName, force = false) {
        if (!Config.features.enableDatabase) {
            console.warn('[DatabaseSyncService] Database not enabled');
            return { success: false, error: 'Database not enabled' };
        }
        
        // Check if sync needed
        if (!force && !this.needsSync(tableName)) {
            console.log(`[DatabaseSyncService] ${tableName} already up to date`);
            return { success: true, skipped: true };
        }
        
        console.log(`[DatabaseSyncService] Starting sync for ${tableName}...`);
        
        const startTime = Date.now();
        const result = {
            tableName,
            startTime: new Date().toISOString(),
            success: false,
            inserted: 0,
            updated: 0,
            errors: []
        };
        
        try {
            const config = this.syncConfig[tableName];
            if (!config) {
                throw new Error(`No sync config for table: ${tableName}`);
            }
            
            // Fetch data from all configured APIs
            const apiDataSets = [];
            
            for (const apiSource of config.apis) {
                try {
                    const apiData = await this.fetchFromAPI(tableName, apiSource);
                    apiDataSets.push({ source: apiSource, data: apiData });
                } catch (error) {
                    console.error(`[DatabaseSyncService] Error fetching from ${apiSource}:`, error);
                    result.errors.push(`${apiSource}: ${error.message}`);
                }
            }
            
            if (apiDataSets.length === 0) {
                throw new Error('No API data retrieved');
            }
            
            // Process and merge data
            const mergedData = this.mergeAPIData(tableName, apiDataSets);
            
            // Write to database
            const dbResult = await this.writeToDatabase(tableName, mergedData);
            
            result.inserted = dbResult.inserted;
            result.updated = dbResult.updated;
            result.success = true;
            
            // Update last sync time
            this.lastSyncTimes[tableName] = Date.now();
            this.saveSyncState();
            
        } catch (error) {
            console.error(`[DatabaseSyncService] Sync failed for ${tableName}:`, error);
            result.errors.push(error.message);
        }
        
        result.duration = Date.now() - startTime;
        result.endTime = new Date().toISOString();
        
        // Add to history
        this.syncHistory.unshift(result);
        if (this.syncHistory.length > 100) {
            this.syncHistory.pop();
        }
        
        console.log(`[DatabaseSyncService] Sync complete for ${tableName}:`, result);
        
        return result;
    },
    
    /**
     * Sync all tables
     * @param {boolean} force - Force sync all
     */
    async syncAll(force = false) {
        if (this.syncInProgress) {
            console.warn('[DatabaseSyncService] Sync already in progress');
            return { success: false, error: 'Sync already in progress' };
        }
        
        this.syncInProgress = true;
        
        UIHelpers.showLoading('Syncing all data from APIs...');
        
        const results = {
            success: true,
            tables: {},
            totalInserted: 0,
            totalUpdated: 0,
            errors: []
        };
        
        try {
            const tables = Object.keys(this.syncConfig);
            
            for (const tableName of tables) {
                try {
                    const result = await this.syncTable(tableName, force);
                    results.tables[tableName] = result;
                    
                    if (result.success) {
                        results.totalInserted += result.inserted || 0;
                        results.totalUpdated += result.updated || 0;
                    } else {
                        results.success = false;
                        results.errors.push(...result.errors);
                    }
                    
                    // Show progress
                    const completed = Object.keys(results.tables).length;
                    const total = tables.length;
                    UIHelpers.showLoading(`Syncing ${tableName}... (${completed}/${total})`);
                    
                } catch (error) {
                    console.error(`[DatabaseSyncService] Error syncing ${tableName}:`, error);
                    results.errors.push(`${tableName}: ${error.message}`);
                    results.success = false;
                }
            }
            
        } finally {
            this.syncInProgress = false;
            UIHelpers.hideLoading();
        }
        
        // Show results notification
        if (results.success) {
            UIHelpers.showNotification(
                `Sync complete! Inserted: ${results.totalInserted}, Updated: ${results.totalUpdated}`,
                'success',
                5000
            );
        } else {
            UIHelpers.showNotification(
                `Sync completed with errors. Check console for details.`,
                'warning',
                5000
            );
        }
        
        return results;
    },
    
    // ============================================
    // API DATA FETCHING
    // ============================================
    
    /**
     * Fetch data from specific API
     */
    async fetchFromAPI(tableName, apiSource) {
        const schema = APISchemaMapper.schemas[tableName];
        if (!schema) {
            throw new Error(`Unknown table: ${tableName}`);
        }
        
        const apiMapping = schema.apiMappings[apiSource];
        if (!apiMapping) {
            throw new Error(`No mapping for ${apiSource} in ${tableName}`);
        }
        
        console.log(`[DatabaseSyncService] Fetching ${tableName} from ${apiSource}...`);
        
        let data;
        
        if (apiSource === 'xivapi') {
            // XIVAPI v2 - paginated results
            data = await this.fetchFromXIVAPI(apiMapping.endpoint);
        } else if (apiSource === 'ffxivCollect') {
            // FFXIV Collect - simple endpoint
            data = await this.fetchFromFFXIVCollect(apiMapping.endpoint);
        }
        
        return data;
    },
    
    /**
     * Fetch from XIVAPI v2 (handles pagination)
     */
    async fetchFromXIVAPI(endpoint) {
        const allData = [];
        let page = 1;
        const perPage = 100;
        let hasMore = true;
        
        while (hasMore) {
            try {
                const url = `https://beta.xivapi.com/api/1${endpoint}?page=${page}&limit=${perPage}`;
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const result = await response.json();
                
                // XIVAPI v2 structure
                if (result.results && result.results.length > 0) {
                    allData.push(...result.results);
                    
                    // Check if there are more pages
                    hasMore = result.results.length === perPage;
                    page++;
                    
                    // Rate limiting - wait between requests
                    await this.sleep(100);
                } else {
                    hasMore = false;
                }
                
            } catch (error) {
                console.error(`[DatabaseSyncService] XIVAPI fetch error (page ${page}):`, error);
                throw error;
            }
        }
        
        console.log(`[DatabaseSyncService] Fetched ${allData.length} records from XIVAPI`);
        return allData;
    },
    
    /**
     * Fetch from FFXIV Collect
     */
    async fetchFromFFXIVCollect(endpoint) {
        try {
            const url = `https://ffxivcollect.com/api${endpoint}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // FFXIV Collect returns array directly or under 'results'
            const results = Array.isArray(data) ? data : data.results || [];
            
            console.log(`[DatabaseSyncService] Fetched ${results.length} records from FFXIV Collect`);
            return results;
            
        } catch (error) {
            console.error('[DatabaseSyncService] FFXIV Collect fetch error:', error);
            throw error;
        }
    },
    
    // ============================================
    // DATA PROCESSING
    // ============================================
    
    /**
     * Merge data from multiple API sources
     */
    mergeAPIData(tableName, apiDataSets) {
        const merged = new Map();
        
        // Process each API data set
        for (const { source, data } of apiDataSets) {
            for (const item of data) {
                try {
                    // Map to unified schema
                    const mapped = APISchemaMapper.mapToUnified(tableName, source, item);
                    
                    // Validate
                    const validation = APISchemaMapper.validate(tableName, mapped);
                    if (!validation.valid) {
                        console.warn(`[DatabaseSyncService] Validation failed for ${tableName} item:`, validation.errors);
                        continue;
                    }
                    
                    const id = mapped.id;
                    
                    // Merge with existing data (if any)
                    if (merged.has(id)) {
                        const existing = merged.get(id);
                        merged.set(id, APISchemaMapper.mergeAPISources(
                            tableName,
                            { source: existing._source, mapped: existing },
                            { source, mapped }
                        ));
                    } else {
                        mapped._source = source;
                        merged.set(id, mapped);
                    }
                    
                } catch (error) {
                    console.error(`[DatabaseSyncService] Error processing item:`, error);
                }
            }
        }
        
        // Convert to array
        return Array.from(merged.values());
    },
    
    // ============================================
    // DATABASE OPERATIONS
    // ============================================
    
    /**
     * Write merged data to database
     */
    async writeToDatabase(tableName, data) {
        if (Config.database.useLocalStorage) {
            // Development mode - write to localStorage
            return this.writeToLocalStorage(tableName, data);
        } else {
            // Production mode - write to AWS RDS
            return this.writeToAWSRDS(tableName, data);
        }
    },
    
    /**
     * Write to localStorage (development)
     */
    async writeToLocalStorage(tableName, data) {
        const result = { inserted: 0, updated: 0 };
        
        // Get existing data
        const storageKey = `db_${tableName}`;
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const existingMap = new Map(existing.map(item => [item.id, item]));
        
        // Upsert data
        for (const item of data) {
            if (existingMap.has(item.id)) {
                result.updated++;
            } else {
                result.inserted++;
            }
            existingMap.set(item.id, item);
        }
        
        // Save back
        const merged = Array.from(existingMap.values());
        localStorage.setItem(storageKey, JSON.stringify(merged));
        
        console.log(`[DatabaseSyncService] LocalStorage write: ${result.inserted} inserted, ${result.updated} updated`);
        
        return result;
    },
    
    /**
     * Write to AWS RDS (production)
     */
    async writeToAWSRDS(tableName, data) {
        // TODO: Implement AWS RDS connection
        // This would use AWS SDK or HTTP API to connect to RDS
        
        // Placeholder for now
        throw new Error('AWS RDS connection not yet implemented');
        
        // Future implementation would:
        // 1. Connect to RDS using credentials from .env
        // 2. Use prepared statements for upsert operations
        // 3. Batch inserts for performance
        // 4. Return inserted/updated counts
    },
    
    // ============================================
    // SCHEDULED SYNCS
    // ============================================
    
    /**
     * Start scheduled syncs for enabled tables
     */
    startScheduledSyncs() {
        console.log('[DatabaseSyncService] Starting scheduled syncs...');
        
        for (const [tableName, config] of Object.entries(this.syncConfig)) {
            if (config.enabled) {
                this.scheduleTableSync(tableName, config.interval);
            }
        }
    },
    
    /**
     * Schedule sync for a specific table
     */
    scheduleTableSync(tableName, interval) {
        // Clear existing schedule
        if (this.syncSchedules[tableName]) {
            clearInterval(this.syncSchedules[tableName]);
        }
        
        // Schedule new sync
        this.syncSchedules[tableName] = setInterval(async () => {
            console.log(`[DatabaseSyncService] Scheduled sync for ${tableName}`);
            await this.syncTable(tableName, false);
        }, interval);
        
        console.log(`[DatabaseSyncService] Scheduled ${tableName} sync every ${interval}ms`);
    },
    
    /**
     * Stop scheduled syncs
     */
    stopScheduledSyncs() {
        for (const [tableName, intervalId] of Object.entries(this.syncSchedules)) {
            clearInterval(intervalId);
            delete this.syncSchedules[tableName];
        }
        console.log('[DatabaseSyncService] Stopped all scheduled syncs');
    },
    
    /**
     * Check if table needs sync
     */
    needsSync(tableName) {
        const config = this.syncConfig[tableName];
        if (!config) return false;
        
        const lastSync = this.lastSyncTimes[tableName];
        if (!lastSync) return true;
        
        const elapsed = Date.now() - lastSync;
        return elapsed >= config.interval;
    },
    
    // ============================================
    // SYNC MANAGEMENT UI
    // ============================================
    
    /**
     * Toggle auto-sync for a table
     */
    toggleAutoSync(tableName, enabled) {
        if (!this.syncConfig[tableName]) {
            console.error(`[DatabaseSyncService] Unknown table: ${tableName}`);
            return;
        }
        
        this.syncConfig[tableName].enabled = enabled;
        this.saveSyncState();
        
        if (enabled) {
            const interval = this.syncConfig[tableName].interval;
            this.scheduleTableSync(tableName, interval);
            UIHelpers.showNotification(`Auto-sync enabled for ${tableName}`, 'success');
        } else {
            if (this.syncSchedules[tableName]) {
                clearInterval(this.syncSchedules[tableName]);
                delete this.syncSchedules[tableName];
            }
            UIHelpers.showNotification(`Auto-sync disabled for ${tableName}`, 'info');
        }
    },
    
    /**
     * Update sync interval for a table
     */
    updateSyncInterval(tableName, intervalMs) {
        if (!this.syncConfig[tableName]) {
            console.error(`[DatabaseSyncService] Unknown table: ${tableName}`);
            return;
        }
        
        this.syncConfig[tableName].interval = intervalMs;
        this.saveSyncState();
        
        // Reschedule if enabled
        if (this.syncConfig[tableName].enabled) {
            this.scheduleTableSync(tableName, intervalMs);
        }
        
        UIHelpers.showNotification(`Sync interval updated for ${tableName}`, 'success');
    },
    
    /**
     * Get sync status for all tables
     */
    getSyncStatus() {
        const status = {};
        
        for (const [tableName, config] of Object.entries(this.syncConfig)) {
            const lastSync = this.lastSyncTimes[tableName];
            const needsSync = this.needsSync(tableName);
            
            status[tableName] = {
                enabled: config.enabled,
                interval: config.interval,
                lastSync: lastSync ? new Date(lastSync).toISOString() : null,
                needsSync,
                scheduled: !!this.syncSchedules[tableName]
            };
        }
        
        return status;
    },
    
    // ============================================
    // UTILITIES
    // ============================================
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DatabaseSyncService };
}
