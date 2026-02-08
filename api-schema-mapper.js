// ============================================
// API SCHEMA MAPPER
// ============================================
// Analyzes and maps data from multiple APIs to unified database schema
// Handles field consolidation and data transformation

const APISchemaMapper = {
    
    // ============================================
    // UNIFIED SCHEMA DEFINITIONS
    // ============================================
    // These define how fields from different APIs map to our database
    
    schemas: {
        
        // ACHIEVEMENTS
        achievements: {
            tableName: 'achievements',
            primaryKey: 'id',
            fields: {
                id: { type: 'integer', required: true },
                name: { type: 'string', required: true, maxLength: 255 },
                description: { type: 'text' },
                points: { type: 'integer' },
                sort_order: { type: 'integer' },
                patch: { type: 'decimal' },
                owned: { type: 'decimal' },
                icon: { type: 'string', maxLength: 255 },
                category: { type: 'integer', foreignKey: 'categories.id' },
                type: { type: 'integer', foreignKey: 'type.id' }
            },
            apiMappings: {
                // XIVAPI v2 mapping
                'xivapi': {
                    endpoint: '/Achievement',
                    fieldMap: {
                        'Id': 'id',
                        'Name': 'name',
                        'Description': 'description',
                        'Points': 'points',
                        'Order': 'sort_order',
                        'Icon': 'icon',
                        'AchievementCategory': 'category',
                        'Type': 'type'
                    },
                    transform: (data) => {
                        // Extract patch version from data if available
                        if (data.GamePatch) {
                            data.patch = parseFloat(data.GamePatch.Version);
                        }
                        return data;
                    }
                },
                // FFXIV Collect API mapping
                'ffxivCollect': {
                    endpoint: '/achievements',
                    fieldMap: {
                        'id': 'id',
                        'name': 'name',
                        'description': 'description',
                        'points': 'points',
                        'order': 'sort_order',
                        'patch': 'patch',
                        'owned': 'owned',
                        'icon': 'icon',
                        'category.id': 'category',
                        'type.id': 'type'
                    }
                }
            }
        },
        
        // TITLES
        titles: {
            tableName: 'titles',
            primaryKey: 'id',
            fields: {
                id: { type: 'integer', required: true },
                name: { type: 'string', required: true, maxLength: 255 },
                female_name: { type: 'string', maxLength: 255 },
                sort_order: { type: 'integer' },
                patch: { type: 'decimal' },
                owned: { type: 'decimal' },
                icon: { type: 'string', maxLength: 255 },
                achievement: { type: 'integer', foreignKey: 'achievements.id' },
                sources: { type: 'integer', foreignKey: 'sources.id' },
                type: { type: 'integer', foreignKey: 'type.id' }
            },
            apiMappings: {
                'xivapi': {
                    endpoint: '/Title',
                    fieldMap: {
                        'Id': 'id',
                        'Name': 'name',
                        'NameFemale': 'female_name',
                        'Order': 'sort_order'
                    }
                },
                'ffxivCollect': {
                    endpoint: '/titles',
                    fieldMap: {
                        'id': 'id',
                        'name': 'name',
                        'female_name': 'female_name',
                        'order': 'sort_order',
                        'patch': 'patch',
                        'owned': 'owned',
                        'icon': 'icon',
                        'achievement.id': 'achievement',
                        'type.id': 'type'
                    }
                }
            }
        },
        
        // MOUNTS
        mounts: {
            tableName: 'mounts',
            primaryKey: 'id',
            fields: {
                id: { type: 'integer', required: true },
                name: { type: 'string', required: true, maxLength: 255 },
                description: { type: 'text' },
                enhanced_description: { type: 'text' },
                tooltip: { type: 'string', maxLength: 255 },
                movement: { type: 'string', maxLength: 32 },
                seats: { type: 'integer' },
                sort_order: { type: 'integer' },
                order_group: { type: 'integer' },
                patch: { type: 'decimal' },
                item_id: { type: 'integer' },
                tradeable: { type: 'boolean' },
                owned: { type: 'decimal' },
                image: { type: 'string', maxLength: 255 },
                icon: { type: 'string', maxLength: 255 },
                bgm: { type: 'string', maxLength: 255 },
                sources: { type: 'integer', foreignKey: 'sources.id' }
            },
            apiMappings: {
                'xivapi': {
                    endpoint: '/Mount',
                    fieldMap: {
                        'Id': 'id',
                        'Name': 'name',
                        'Description': 'description',
                        'Tooltip': 'tooltip',
                        'Order': 'sort_order',
                        'Icon': 'icon',
                        'IsFlying': 'movement' // Transform: 0/1 to ground/flying
                    },
                    transform: (data) => {
                        // Convert flying flag to movement type
                        if (data.IsFlying === 1) {
                            data.movement = 'flying';
                        } else {
                            data.movement = 'ground';
                        }
                        return data;
                    }
                },
                'ffxivCollect': {
                    endpoint: '/mounts',
                    fieldMap: {
                        'id': 'id',
                        'name': 'name',
                        'description': 'description',
                        'enhanced_description': 'enhanced_description',
                        'tooltip': 'tooltip',
                        'movement': 'movement',
                        'seats': 'seats',
                        'order': 'sort_order',
                        'order_group': 'order_group',
                        'patch': 'patch',
                        'item_id': 'item_id',
                        'tradeable': 'tradeable',
                        'owned': 'owned',
                        'image': 'image',
                        'icon': 'icon',
                        'bgm': 'bgm'
                    }
                }
            }
        },
        
        // MINIONS
        minions: {
            tableName: 'minions',
            primaryKey: 'id',
            fields: {
                id: { type: 'integer', required: true },
                name: { type: 'string', required: true, maxLength: 255 },
                description: { type: 'string', maxLength: 255 },
                enhanced_description: { type: 'text' },
                tooltip: { type: 'string', maxLength: 255 },
                patch: { type: 'decimal' },
                item_id: { type: 'integer' },
                tradeable: { type: 'boolean' },
                behavior: { type: 'integer', foreignKey: 'behavior.id' },
                race: { type: 'integer', foreignKey: 'race.id' },
                image: { type: 'string', maxLength: 255 },
                icon: { type: 'string', maxLength: 255 },
                owned: { type: 'decimal' },
                sources: { type: 'integer', foreignKey: 'sources.id' }
            },
            apiMappings: {
                'xivapi': {
                    endpoint: '/Companion',
                    fieldMap: {
                        'Id': 'id',
                        'Name': 'name',
                        'Description': 'description',
                        'Tooltip': 'tooltip',
                        'Icon': 'icon',
                        'Behavior': 'behavior',
                        'Race': 'race'
                    }
                },
                'ffxivCollect': {
                    endpoint: '/minions',
                    fieldMap: {
                        'id': 'id',
                        'name': 'name',
                        'description': 'description',
                        'enhanced_description': 'enhanced_description',
                        'tooltip': 'tooltip',
                        'patch': 'patch',
                        'item_id': 'item_id',
                        'tradeable': 'tradeable',
                        'behavior.id': 'behavior',
                        'race.id': 'race',
                        'image': 'image',
                        'icon': 'icon',
                        'owned': 'owned'
                    }
                }
            }
        },
        
        // ORCHESTRION ROLLS
        orchestrions: {
            tableName: 'orchestrions',
            primaryKey: 'id',
            fields: {
                id: { type: 'integer', required: true },
                name: { type: 'string', required: true, maxLength: 255 },
                description: { type: 'string', maxLength: 255 },
                patch: { type: 'decimal' },
                item_id: { type: 'integer' },
                tradeable: { type: 'boolean' },
                owned: { type: 'decimal' },
                number: { type: 'integer' },
                icon: { type: 'string', maxLength: 255 },
                category: { type: 'integer', foreignKey: 'categories.id' },
                sources: { type: 'integer', foreignKey: 'sources.id' }
            },
            apiMappings: {
                'xivapi': {
                    endpoint: '/Orchestrion',
                    fieldMap: {
                        'Id': 'id',
                        'Name': 'name',
                        'Description': 'description'
                    }
                },
                'ffxivCollect': {
                    endpoint: '/orchestrions',
                    fieldMap: {
                        'id': 'id',
                        'name': 'name',
                        'description': 'description',
                        'patch': 'patch',
                        'item_id': 'item_id',
                        'tradeable': 'tradeable',
                        'owned': 'owned',
                        'number': 'number',
                        'icon': 'icon',
                        'category.id': 'category'
                    }
                }
            }
        },
        
        // EMOTES
        emotes: {
            tableName: 'emotes',
            primaryKey: 'id',
            fields: {
                id: { type: 'integer', required: true },
                name: { type: 'string', required: true, maxLength: 255 },
                command: { type: 'string', maxLength: 25 },
                sort_order: { type: 'integer' },
                patch: { type: 'decimal' },
                item_id: { type: 'integer' },
                tradeable: { type: 'boolean' },
                owned: { type: 'decimal' },
                icon: { type: 'string', maxLength: 255 },
                category: { type: 'integer', foreignKey: 'categories.id' },
                sources: { type: 'integer', foreignKey: 'sources.id' }
            },
            apiMappings: {
                'xivapi': {
                    endpoint: '/Emote',
                    fieldMap: {
                        'Id': 'id',
                        'Name': 'name',
                        'TextCommand.Command': 'command',
                        'Order': 'sort_order',
                        'Icon': 'icon'
                    }
                },
                'ffxivCollect': {
                    endpoint: '/emotes',
                    fieldMap: {
                        'id': 'id',
                        'name': 'name',
                        'command': 'command',
                        'order': 'sort_order',
                        'patch': 'patch',
                        'item_id': 'item_id',
                        'tradeable': 'tradeable',
                        'owned': 'owned',
                        'icon': 'icon',
                        'category.id': 'category'
                    }
                }
            }
        },
        
        // BARDINGS
        bardings: {
            tableName: 'bardings',
            primaryKey: 'id',
            fields: {
                id: { type: 'integer', required: true },
                name: { type: 'string', required: true, maxLength: 255 },
                sort_order: { type: 'integer' },
                patch: { type: 'decimal' },
                item_id: { type: 'integer' },
                tradeable: { type: 'boolean' },
                owned: { type: 'decimal' },
                icon: { type: 'string', maxLength: 255 },
                sources: { type: 'integer', foreignKey: 'sources.id' }
            },
            apiMappings: {
                'ffxivCollect': {
                    endpoint: '/bardings',
                    fieldMap: {
                        'id': 'id',
                        'name': 'name',
                        'order': 'sort_order',
                        'patch': 'patch',
                        'item_id': 'item_id',
                        'tradeable': 'tradeable',
                        'owned': 'owned',
                        'icon': 'icon'
                    }
                }
            }
        },
        
        // HAIRSTYLES
        hairstyles: {
            tableName: 'hairstyles',
            primaryKey: 'id',
            fields: {
                id: { type: 'integer', required: true },
                name: { type: 'string', required: true, maxLength: 255 },
                description: { type: 'text' },
                patch: { type: 'decimal' },
                item_id: { type: 'integer' },
                tradeable: { type: 'boolean' },
                owned: { type: 'decimal' },
                icon: { type: 'string', maxLength: 255 },
                sources: { type: 'integer', foreignKey: 'sources.id' }
            },
            apiMappings: {
                'ffxivCollect': {
                    endpoint: '/hairstyles',
                    fieldMap: {
                        'id': 'id',
                        'name': 'name',
                        'description': 'description',
                        'patch': 'patch',
                        'item_id': 'item_id',
                        'tradeable': 'tradeable',
                        'owned': 'owned',
                        'icon': 'icon'
                    }
                }
            }
        },
        
        // FACEWEAR
        facewear: {
            tableName: 'facewear',
            primaryKey: 'id',
            fields: {
                id: { type: 'integer', required: true },
                name: { type: 'string', required: true, maxLength: 255 },
                sort_order: { type: 'integer' },
                patch: { type: 'decimal' },
                item_id: { type: 'integer' },
                tradeable: { type: 'boolean' },
                owned: { type: 'decimal' },
                icon: { type: 'string', maxLength: 255 },
                sources: { type: 'integer', foreignKey: 'sources.id' }
            },
            apiMappings: {
                'ffxivCollect': {
                    endpoint: '/facewear',
                    fieldMap: {
                        'id': 'id',
                        'name': 'name',
                        'order': 'sort_order',
                        'patch': 'patch',
                        'item_id': 'item_id',
                        'tradeable': 'tradeable',
                        'owned': 'owned',
                        'icon': 'icon'
                    }
                }
            }
        }
    },
    
    // ============================================
    // MAPPING UTILITIES
    // ============================================
    
    /**
     * Get nested property value using dot notation
     * e.g., getNestedValue(obj, 'category.id')
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, prop) => 
            current?.[prop], obj
        );
    },
    
    /**
     * Map API data to unified schema
     * @param {string} schemaName - Schema name (e.g., 'mounts')
     * @param {string} apiSource - API source ('xivapi' or 'ffxivCollect')
     * @param {object} apiData - Raw API data
     */
    mapToUnified(schemaName, apiSource, apiData) {
        const schema = this.schemas[schemaName];
        if (!schema) {
            throw new Error(`Unknown schema: ${schemaName}`);
        }
        
        const apiMapping = schema.apiMappings[apiSource];
        if (!apiMapping) {
            throw new Error(`No mapping for ${apiSource} in ${schemaName}`);
        }
        
        const mapped = {};
        
        // Map fields according to fieldMap
        for (const [apiField, dbField] of Object.entries(apiMapping.fieldMap)) {
            const value = this.getNestedValue(apiData, apiField);
            if (value !== undefined && value !== null) {
                mapped[dbField] = value;
            }
        }
        
        // Apply custom transform if defined
        if (apiMapping.transform) {
            return apiMapping.transform(mapped);
        }
        
        return mapped;
    },
    
    /**
     * Merge data from multiple API sources
     * Prioritizes data quality: FFXIV Collect > XIVAPI for descriptions/details
     */
    mergeAPISources(schemaName, ...sources) {
        const merged = {};
        const schema = this.schemas[schemaName];
        
        // Priority order: ffxivCollect (more complete) > xivapi
        const priorityOrder = ['ffxivCollect', 'xivapi'];
        
        for (const apiSource of priorityOrder) {
            const data = sources.find(s => s.source === apiSource);
            if (data) {
                Object.assign(merged, data.mapped);
            }
        }
        
        // Add timestamps
        merged.updated_at = new Date().toISOString();
        
        return merged;
    },
    
    /**
     * Validate mapped data against schema
     */
    validate(schemaName, data) {
        const schema = this.schemas[schemaName];
        const errors = [];
        
        // Check required fields
        for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
            if (fieldDef.required && !data[fieldName]) {
                errors.push(`Missing required field: ${fieldName}`);
            }
            
            // Check max length for strings
            if (fieldDef.maxLength && data[fieldName]) {
                if (data[fieldName].length > fieldDef.maxLength) {
                    errors.push(`Field ${fieldName} exceeds max length ${fieldDef.maxLength}`);
                }
            }
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APISchemaMapper };
}
