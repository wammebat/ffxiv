// ============================================
// CONFIGURATION MANAGEMENT
// ============================================
// This file handles all configuration including environment variables,
// API endpoints, and feature flags

const Config = {
    // Environment detection
    environment: 'development', // 'development' | 'production'
    
    // API Configuration
    api: {
        // FFXIV APIs
        universalis: {
            baseUrl: 'https://universalis.app/api/v2',
            timeout: 10000,
            retryAttempts: 3
        },
        xivapi: {
            baseUrl: 'https://xivapi.com',
            timeout: 10000,
            retryAttempts: 3
        },
        ffxivCollect: {
            baseUrl: 'https://ffxivcollect.com/api',
            timeout: 10000,
            retryAttempts: 3
        }
    },
    
    // Database Configuration (loaded from environment in production)
    database: {
        // For development, use localStorage as fallback
        // In production, these would come from environment variables
        useLocalStorage: true, // Toggle to true for development without AWS
        aws: {
            endpoint: '', // Set via .env: process.env.AWS_RDS_ENDPOINT
            username: '', // Set via .env: process.env.AWS_RDS_USERNAME
            password: '', // Set via .env: process.env.AWS_RDS_PASSWORD
            database: '' // Set via .env: process.env.AWS_RDS_DATABASE
        }
    },
    
    // Feature Flags
    features: {
        enableDatabase: false, // Enable when AWS RDS is configured
        enableAuthentication: false, // Future feature
        enableOfflineMode: true,
        enableDataSync: false,
        enableMultiModule: true // Enable game module selection
    },
    
    // Cache Configuration
    cache: {
        enabled: true,
        ttl: {
            marketData: 5 * 60 * 1000, // 5 minutes
            staticData: 24 * 60 * 60 * 1000, // 24 hours
            userData: 60 * 60 * 1000 // 1 hour
        }
    },
    
    // Local Storage Keys
    storageKeys: {
        currentModule: 'app_current_module',
        userPreferences: 'app_user_preferences',
        ffxivData: 'ffxiv_data',
        ffxivRelics: 'ffxiv_relics',
        ffxivInventory: 'ffxiv_inventory',
        cachePrefix: 'cache_'
    },
    
    // Available Modules
    modules: {
        ffxiv: {
            id: 'ffxiv',
            name: 'Final Fantasy XIV',
            enabled: true,
            icon: '⚔️',
            description: 'Track relics, inventory, market data, and more',
            features: ['relics', 'inventory', 'gathering', 'crafting', 'collections', 'market']
        },
        stockTracker: {
            id: 'stock-tracker',
            name: 'Stock Tracker',
            enabled: false, // Future module
            icon: '📈',
            description: 'Real-time stock market tracking and recommendations',
            features: ['portfolio', 'recommendations', 'analysis']
        }
    },
    
    // Default User Preferences
    defaultPreferences: {
        theme: 'dark',
        sidebarCollapsed: false,
        defaultModule: 'ffxiv',
        notifications: true,
        autoSave: true,
        dataCenter: 'Crystal', // FFXIV specific
        world: 'Balmung' // FFXIV specific
    },
    
    // Rate Limiting
    rateLimits: {
        universalis: {
            requestsPerMinute: 20,
            burstLimit: 5
        },
        xivapi: {
            requestsPerMinute: 20,
            burstLimit: 5
        }
    },
    
    // Error Messages
    errorMessages: {
        network: 'Network error. Please check your connection.',
        apiLimit: 'API rate limit reached. Please wait a moment.',
        database: 'Database connection error.',
        notFound: 'Resource not found.',
        generic: 'An error occurred. Please try again.'
    }
};

// ============================================
// ENVIRONMENT LOADER
// ============================================
// This would normally load from .env file
// For GitHub Pages, we use hardcoded development values
// In production with build process, use environment variables

if (typeof process !== 'undefined' && process.env) {
    // Node.js environment (for build process)
    Config.database.aws.endpoint = process.env.AWS_RDS_ENDPOINT || '';
    Config.database.aws.username = process.env.AWS_RDS_USERNAME || '';
    Config.database.aws.password = process.env.AWS_RDS_PASSWORD || '';
    Config.database.aws.database = process.env.AWS_RDS_DATABASE || '';
    
    Config.environment = process.env.NODE_ENV || 'development';
}

// ============================================
// CONFIG UTILITIES
// ============================================

const ConfigUtils = {
    /**
     * Check if a feature is enabled
     */
    isFeatureEnabled(featureName) {
        return Config.features[featureName] || false;
    },
    
    /**
     * Get API configuration for a service
     */
    getApiConfig(serviceName) {
        return Config.api[serviceName] || null;
    },
    
    /**
     * Check if module is available
     */
    isModuleEnabled(moduleId) {
        const module = Config.modules[moduleId];
        return module && module.enabled;
    },
    
    /**
     * Get all enabled modules
     */
    getEnabledModules() {
        return Object.values(Config.modules).filter(m => m.enabled);
    },
    
    /**
     * Get cache TTL for data type
     */
    getCacheTTL(dataType) {
        return Config.cache.ttl[dataType] || Config.cache.ttl.staticData;
    },
    
    /**
     * Get user preferences from storage or defaults
     */
    getUserPreferences() {
        const stored = localStorage.getItem(Config.storageKeys.userPreferences);
        if (stored) {
            try {
                return { ...Config.defaultPreferences, ...JSON.parse(stored) };
            } catch (e) {
                console.error('Error parsing user preferences:', e);
            }
        }
        return { ...Config.defaultPreferences };
    },
    
    /**
     * Save user preferences
     */
    saveUserPreferences(preferences) {
        const current = this.getUserPreferences();
        const updated = { ...current, ...preferences };
        localStorage.setItem(
            Config.storageKeys.userPreferences,
            JSON.stringify(updated)
        );
        return updated;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Config, ConfigUtils };
}
