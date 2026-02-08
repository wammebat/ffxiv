// ============================================
// API SERVICE - External API Integration
// ============================================
// Handles all external API calls with rate limiting, caching, and error handling

const ApiService = {
    
    // Rate limiting state
    rateLimiters: {},
    
    // ============================================
    // CORE REQUEST METHOD
    // ============================================
    
    /**
     * Make an API request with caching and rate limiting
     * @param {string} service - Service name (universalis, xivapi, etc.)
     * @param {string} endpoint - API endpoint
     * @param {object} options - Request options
     */
    async request(service, endpoint, options = {}) {
        const apiConfig = Config.api[service];
        
        if (!apiConfig) {
            throw new Error(`Unknown API service: ${service}`);
        }
        
        // Check cache first if enabled
        if (Config.cache.enabled && !options.skipCache) {
            const cacheKey = `${service}_${endpoint}`;
            const cached = await DataLayer.getCached(cacheKey);
            
            if (cached) {
                console.log(`[ApiService] Cache hit for ${service}:${endpoint}`);
                return cached;
            }
        }
        
        // Check rate limit
        await this.checkRateLimit(service);
        
        // Build URL
        const url = `${apiConfig.baseUrl}${endpoint}`;
        
        // Make request with retry logic
        const data = await this.fetchWithRetry(url, {
            ...options,
            timeout: apiConfig.timeout
        }, apiConfig.retryAttempts);
        
        // Cache the response
        if (Config.cache.enabled && data) {
            const cacheKey = `${service}_${endpoint}`;
            const ttl = options.cacheTTL || ConfigUtils.getCacheTTL('staticData');
            await DataLayer.setCached(cacheKey, data, ttl);
        }
        
        return data;
    },
    
    /**
     * Fetch with retry logic
     */
    async fetchWithRetry(url, options, retries) {
        for (let i = 0; i <= retries; i++) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), options.timeout);
                
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });
                
                clearTimeout(timeout);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                return await response.json();
                
            } catch (error) {
                console.warn(`[ApiService] Attempt ${i + 1} failed:`, error.message);
                
                if (i === retries) {
                    throw new Error(`Failed after ${retries + 1} attempts: ${error.message}`);
                }
                
                // Wait before retry (exponential backoff)
                await this.sleep(Math.pow(2, i) * 1000);
            }
        }
    },
    
    // ============================================
    // RATE LIMITING
    // ============================================
    
    /**
     * Check and enforce rate limits
     */
    async checkRateLimit(service) {
        const limits = Config.rateLimits[service];
        if (!limits) return;
        
        const now = Date.now();
        
        if (!this.rateLimiters[service]) {
            this.rateLimiters[service] = {
                requests: [],
                lastReset: now
            };
        }
        
        const limiter = this.rateLimiters[service];
        
        // Reset if minute has passed
        if (now - limiter.lastReset > 60000) {
            limiter.requests = [];
            limiter.lastReset = now;
        }
        
        // Remove old requests
        limiter.requests = limiter.requests.filter(
            timestamp => now - timestamp < 60000
        );
        
        // Check if at limit
        if (limiter.requests.length >= limits.requestsPerMinute) {
            const oldestRequest = limiter.requests[0];
            const waitTime = 60000 - (now - oldestRequest);
            
            console.warn(`[ApiService] Rate limit reached for ${service}, waiting ${waitTime}ms`);
            await this.sleep(waitTime);
            
            // Recursive call after waiting
            return this.checkRateLimit(service);
        }
        
        // Add this request
        limiter.requests.push(now);
    },
    
    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // ============================================
    // FFXIV API METHODS
    // ============================================
    
    /**
     * Universalis - Market Board Data
     */
    Universalis: {
        /**
         * Get current market prices for an item
         * @param {string} worldOrDC - World or Data Center name
         * @param {number} itemId - Item ID
         */
        async getMarketData(worldOrDC, itemId) {
            return await ApiService.request(
                'universalis',
                `/${worldOrDC}/${itemId}`,
                { cacheTTL: Config.cache.ttl.marketData }
            );
        },
        
        /**
         * Get market data for multiple items
         * @param {string} worldOrDC - World or Data Center name
         * @param {array} itemIds - Array of item IDs
         */
        async getMultipleMarketData(worldOrDC, itemIds) {
            const itemList = itemIds.join(',');
            return await ApiService.request(
                'universalis',
                `/${worldOrDC}/${itemList}`,
                { cacheTTL: Config.cache.ttl.marketData }
            );
        },
        
        /**
         * Get market history for an item
         * @param {string} worldOrDC - World or Data Center name
         * @param {number} itemId - Item ID
         */
        async getHistory(worldOrDC, itemId) {
            return await ApiService.request(
                'universalis',
                `/${worldOrDC}/${itemId}/history`,
                { cacheTTL: Config.cache.ttl.marketData }
            );
        }
    },
    
    /**
     * XIVAPI - Game Data
     */
    XIVAPI: {
        /**
         * Search for items
         * @param {string} query - Search query
         * @param {object} filters - Search filters
         */
        async searchItems(query, filters = {}) {
            const params = new URLSearchParams({
                string: query,
                indexes: 'Item',
                ...filters
            });
            
            return await ApiService.request(
                'xivapi',
                `/search?${params.toString()}`,
                { cacheTTL: Config.cache.ttl.staticData }
            );
        },
        
        /**
         * Get item details
         * @param {number} itemId - Item ID
         */
        async getItem(itemId) {
            return await ApiService.request(
                'xivapi',
                `/item/${itemId}`,
                { cacheTTL: Config.cache.ttl.staticData }
            );
        },
        
        /**
         * Get recipe details
         * @param {number} recipeId - Recipe ID
         */
        async getRecipe(recipeId) {
            return await ApiService.request(
                'xivapi',
                `/recipe/${recipeId}`,
                { cacheTTL: Config.cache.ttl.staticData }
            );
        },
        
        /**
         * Get character data
         * @param {number} characterId - Lodestone character ID
         */
        async getCharacter(characterId) {
            return await ApiService.request(
                'xivapi',
                `/character/${characterId}`,
                { cacheTTL: Config.cache.ttl.userData }
            );
        }
    },
    
    /**
     * FFXIV Collect - Collection Tracking
     */
    FFXIVCollect: {
        /**
         * Get all mounts
         */
        async getMounts() {
            return await ApiService.request(
                'ffxivCollect',
                '/mounts',
                { cacheTTL: Config.cache.ttl.staticData }
            );
        },
        
        /**
         * Get all minions
         */
        async getMinions() {
            return await ApiService.request(
                'ffxivCollect',
                '/minions',
                { cacheTTL: Config.cache.ttl.staticData }
            );
        },
        
        /**
         * Get all achievements
         */
        async getAchievements() {
            return await ApiService.request(
                'ffxivCollect',
                '/achievements',
                { cacheTTL: Config.cache.ttl.staticData }
            );
        },
        
        /**
         * Get character achievements
         * @param {number} characterId - Character ID
         */
        async getCharacterAchievements(characterId) {
            return await ApiService.request(
                'ffxivCollect',
                `/characters/${characterId}/achievements`,
                { cacheTTL: Config.cache.ttl.userData }
            );
        }
    }
};

// ============================================
// ERROR HANDLING WRAPPER
// ============================================

const SafeApiCall = async (apiCall, fallbackValue = null) => {
    try {
        return await apiCall();
    } catch (error) {
        console.error('[ApiService] Error:', error);
        
        // Show user-friendly error message
        UIHelpers.showNotification(
            Config.errorMessages.network,
            'error'
        );
        
        return fallbackValue;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ApiService, SafeApiCall };
}
