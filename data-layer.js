// ============================================
// DATA LAYER - STORAGE & PERSISTENCE
// ============================================
// Handles all data operations with localStorage (dev) and AWS RDS (production)
// Provides unified interface regardless of storage backend

const DataLayer = {
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    initialized: false,
    
    async init() {
        if (this.initialized) return;
        
        console.log('[DataLayer] Initializing...');
        
        // Check if we should use database or localStorage
        if (Config.features.enableDatabase && !Config.database.useLocalStorage) {
            await this.initDatabase();
        } else {
            this.initLocalStorage();
        }
        
        this.initialized = true;
        console.log('[DataLayer] Initialized successfully');
    },
    
    initLocalStorage() {
        console.log('[DataLayer] Using localStorage for data persistence');
        // Ensure all storage keys exist
        Object.values(Config.storageKeys).forEach(key => {
            if (!localStorage.getItem(key) && !key.includes('_prefix')) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });
    },
    
    async initDatabase() {
        console.log('[DataLayer] Initializing AWS RDS connection...');
        // TODO: Implement AWS RDS connection
        // This would use AWS SDK or HTTP API
        throw new Error('Database connection not yet implemented');
    },
    
    // ============================================
    // GENERIC CRUD OPERATIONS
    // ============================================
    
    /**
     * Get all records from a collection
     * @param {string} collection - Collection name (e.g., 'ffxiv_relics')
     */
    async getAll(collection) {
        if (Config.database.useLocalStorage) {
            const data = localStorage.getItem(collection);
            return data ? JSON.parse(data) : [];
        }
        // TODO: Database query
        return [];
    },
    
    /**
     * Get a single record by ID
     * @param {string} collection - Collection name
     * @param {number|string} id - Record ID
     */
    async getById(collection, id) {
        const all = await this.getAll(collection);
        return all.find(item => item.id === id) || null;
    },
    
    /**
     * Create a new record
     * @param {string} collection - Collection name
     * @param {object} data - Record data
     */
    async create(collection, data) {
        const all = await this.getAll(collection);
        
        // Generate ID if not provided
        const newRecord = {
            id: data.id || this.generateId(all),
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        all.push(newRecord);
        await this.saveAll(collection, all);
        
        return newRecord;
    },
    
    /**
     * Update an existing record
     * @param {string} collection - Collection name
     * @param {number|string} id - Record ID
     * @param {object} updates - Fields to update
     */
    async update(collection, id, updates) {
        const all = await this.getAll(collection);
        const index = all.findIndex(item => item.id === id);
        
        if (index === -1) {
            throw new Error(`Record ${id} not found in ${collection}`);
        }
        
        all[index] = {
            ...all[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        await this.saveAll(collection, all);
        return all[index];
    },
    
    /**
     * Delete a record
     * @param {string} collection - Collection name
     * @param {number|string} id - Record ID
     */
    async delete(collection, id) {
        const all = await this.getAll(collection);
        const filtered = all.filter(item => item.id !== id);
        await this.saveAll(collection, filtered);
        return true;
    },
    
    /**
     * Save entire collection
     * @param {string} collection - Collection name
     * @param {array} data - All records
     */
    async saveAll(collection, data) {
        if (Config.database.useLocalStorage) {
            localStorage.setItem(collection, JSON.stringify(data));
            return true;
        }
        // TODO: Database bulk update
        return false;
    },
    
    /**
     * Query records with filters
     * @param {string} collection - Collection name
     * @param {function} filterFn - Filter function
     */
    async query(collection, filterFn) {
        const all = await this.getAll(collection);
        return all.filter(filterFn);
    },
    
    // ============================================
    // CACHE MANAGEMENT
    // ============================================
    
    /**
     * Get cached data
     * @param {string} key - Cache key
     */
    async getCached(key) {
        const cacheKey = Config.storageKeys.cachePrefix + key;
        const cached = localStorage.getItem(cacheKey);
        
        if (!cached) return null;
        
        try {
            const { data, timestamp, ttl } = JSON.parse(cached);
            
            // Check if cache is still valid
            if (Date.now() - timestamp < ttl) {
                return data;
            }
            
            // Cache expired, remove it
            localStorage.removeItem(cacheKey);
            return null;
        } catch (e) {
            console.error('[DataLayer] Error reading cache:', e);
            return null;
        }
    },
    
    /**
     * Set cached data
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     * @param {number} ttl - Time to live in milliseconds
     */
    async setCached(key, data, ttl) {
        const cacheKey = Config.storageKeys.cachePrefix + key;
        const cacheData = {
            data,
            timestamp: Date.now(),
            ttl: ttl || Config.cache.ttl.staticData
        };
        
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    },
    
    /**
     * Clear all cache
     */
    async clearCache() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(Config.storageKeys.cachePrefix)) {
                localStorage.removeItem(key);
            }
        });
        console.log('[DataLayer] Cache cleared');
    },
    
    // ============================================
    // UTILITY METHODS
    // ============================================
    
    /**
     * Generate a new unique ID
     */
    generateId(existingRecords = []) {
        if (existingRecords.length === 0) return 1;
        const maxId = Math.max(...existingRecords.map(r => r.id || 0));
        return maxId + 1;
    },
    
    /**
     * Export all data (for backup)
     */
    async exportAll() {
        const exportData = {};
        
        // Get all app data
        Object.entries(Config.storageKeys).forEach(([key, storageKey]) => {
            if (!storageKey.includes('_prefix')) {
                const data = localStorage.getItem(storageKey);
                if (data) {
                    try {
                        exportData[key] = JSON.parse(data);
                    } catch (e) {
                        exportData[key] = data;
                    }
                }
            }
        });
        
        return exportData;
    },
    
    /**
     * Import data (from backup)
     */
    async importAll(data) {
        Object.entries(data).forEach(([key, value]) => {
            const storageKey = Config.storageKeys[key];
            if (storageKey) {
                localStorage.setItem(
                    storageKey,
                    typeof value === 'string' ? value : JSON.stringify(value)
                );
            }
        });
        
        console.log('[DataLayer] Data imported successfully');
    },
    
    /**
     * Clear all app data
     */
    async clearAll() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            Object.values(Config.storageKeys).forEach(key => {
                if (!key.includes('_prefix')) {
                    localStorage.removeItem(key);
                }
            });
            await this.clearCache();
            console.log('[DataLayer] All data cleared');
            return true;
        }
        return false;
    }
};

// ============================================
// SPECIALIZED DATA SERVICES
// ============================================

/**
 * FFXIV Relic Data Service
 */
const FFXIVRelicService = {
    collection: Config.storageKeys.ffxivRelics,
    
    async getAll() {
        return await DataLayer.getAll(this.collection);
    },
    
    async getById(id) {
        return await DataLayer.getById(this.collection, id);
    },
    
    async updateCollectionStatus(id, collected) {
        return await DataLayer.update(this.collection, id, {
            collected,
            dateCollected: collected ? new Date().toISOString().split('T')[0] : null
        });
    },
    
    async updateNotes(id, notes) {
        return await DataLayer.update(this.collection, id, { notes });
    },
    
    async getByExpansion(expansionId) {
        return await DataLayer.query(
            this.collection,
            relic => relic.expansionId === expansionId
        );
    },
    
    async getByJob(job) {
        return await DataLayer.query(
            this.collection,
            relic => relic.job === job
        );
    },
    
    async getCollected() {
        return await DataLayer.query(
            this.collection,
            relic => relic.collected === true
        );
    },
    
    async getUncollected() {
        return await DataLayer.query(
            this.collection,
            relic => relic.collected === false
        );
    },
    
    async initializeDefaultData(relicsData) {
        const existing = await this.getAll();
        if (existing.length === 0) {
            await DataLayer.saveAll(this.collection, relicsData);
            console.log('[FFXIVRelicService] Initialized default relic data');
        }
    }
};

/**
 * User Preferences Service
 */
const PreferencesService = {
    async get() {
        return ConfigUtils.getUserPreferences();
    },
    
    async update(preferences) {
        return ConfigUtils.saveUserPreferences(preferences);
    },
    
    async reset() {
        localStorage.removeItem(Config.storageKeys.userPreferences);
        return Config.defaultPreferences;
    }
};

// Export services
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DataLayer,
        FFXIVRelicService,
        PreferencesService
    };
}
