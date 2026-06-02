/* global patternsData */

/**
 * PatternService - Data Access Layer for DSA Patterns
 *
 * This service abstracts data fetching and provides a consistent interface
 * regardless of the underlying data source (JSON file, REST API, GraphQL, etc.)
 *
 * To switch data sources, simply modify the implementation methods while
 * keeping the public interface unchanged.
 *
 * Usage:
 *   const patternService = new PatternService();
 *   await patternService.init();
 *   const patterns = await patternService.getAllPatterns();
 */

class PatternService {
    constructor(config = {}) {
        // Configuration with defaults
        this.config = {
            // Data source type: 'json', 'api', 'indexeddb', 'localstorage'
            dataSource: config.dataSource || 'json',

            // Base URL for API calls (when using 'api' data source)
            apiBaseUrl: config.apiBaseUrl || '/api/v1',

            // JSON file path (when using 'json' data source)
            jsonPath: config.jsonPath || '/data/patterns.json',

            // Cache duration in milliseconds (5 minutes default)
            cacheDuration: config.cacheDuration || 5 * 60 * 1000,

            // Enable/disable caching
            enableCache: config.enableCache !== false,

            ...config
        };

        this._cache = null;
        this._cacheTimestamp = null;
        this._initialized = false;
    }

    /**
     * Initialize the service
     * Call this before using any other methods
     */
    async init() {
        if (this._initialized) return;

        try {
            // Pre-fetch data based on data source
            await this._loadData();
            this._initialized = true;
            console.log(`PatternService initialized with ${this.config.dataSource} data source`);
        } catch (error) {
            console.error('Failed to initialize PatternService:', error);
            throw error;
        }
    }

    /**
     * Get all patterns
     * @returns {Promise<Array>} Array of pattern objects
     */
    async getAllPatterns() {
        await this._ensureInitialized();
        return this._getFromCache() || await this._loadData();
    }

    /**
     * Get a single pattern by ID
     * @param {string} id - Pattern ID
     * @returns {Promise<Object|null>} Pattern object or null if not found
     */
    async getPatternById(id) {
        const patterns = await this.getAllPatterns();
        return patterns.find(p => p.id === id) || null;
    }

    /**
     * Get patterns by category
     * @param {string} category - Category name
     * @returns {Promise<Array>} Array of patterns in the category
     */
    async getPatternsByCategory(category) {
        const patterns = await this.getAllPatterns();
        return patterns.filter(p =>
            p.category.toLowerCase() === category.toLowerCase()
        );
    }

    /**
     * Get patterns by difficulty
     * @param {string} difficulty - Difficulty level
     * @returns {Promise<Array>} Array of patterns with the difficulty
     */
    async getPatternsByDifficulty(difficulty) {
        const patterns = await this.getAllPatterns();
        return patterns.filter(p =>
            p.difficulty.toLowerCase().includes(difficulty.toLowerCase())
        );
    }

    /**
     * Search patterns by query
     * @param {string} query - Search query
     * @returns {Promise<Array>} Array of matching patterns
     */
    async searchPatterns(query) {
        const patterns = await this.getAllPatterns();
        const lowerQuery = query.toLowerCase();

        return patterns.filter(p =>
            p.category.toLowerCase().includes(lowerQuery) ||
            p.description.toLowerCase().includes(lowerQuery) ||
            p.keyInsights.some(i => i.toLowerCase().includes(lowerQuery)) ||
            p.commonProblems.some(prob => prob.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Get all unique categories
     * @returns {Promise<Array>} Array of category names
     */
    async getCategories() {
        const patterns = await this.getAllPatterns();
        return [...new Set(patterns.map(p => p.category))];
    }

    /**
     * Get pattern count
     * @returns {Promise<number>} Total number of patterns
     */
    async getPatternCount() {
        const patterns = await this.getAllPatterns();
        return patterns.length;
    }

    /**
     * Get patterns with specific problem
     * @param {string} problemName - Problem name to search
     * @returns {Promise<Array>} Patterns that include this problem
     */
    async getPatternsByProblem(problemName) {
        const patterns = await this.getAllPatterns();
        const lowerName = problemName.toLowerCase();

        return patterns.filter(p =>
            p.commonProblems.some(prob =>
                prob.toLowerCase().includes(lowerName)
            ) ||
            p.variations.some(v =>
                v.problems && v.problems.some(prob =>
                    prob.toLowerCase().includes(lowerName)
                )
            )
        );
    }

    // ==================== CRUD Operations (for future API integration) ====================

    /**
     * Create a new pattern (requires API backend)
     * @param {Object} pattern - Pattern data
     * @returns {Promise<Object>} Created pattern
     */
    async createPattern(pattern) {
        if (this.config.dataSource !== 'api') {
            throw new Error('Create operation requires API data source');
        }

        const response = await fetch(`${this.config.apiBaseUrl}/patterns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pattern)
        });

        if (!response.ok) throw new Error('Failed to create pattern');

        this._invalidateCache();
        return response.json();
    }

    /**
     * Update an existing pattern (requires API backend)
     * @param {string} id - Pattern ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Updated pattern
     */
    async updatePattern(id, updates) {
        if (this.config.dataSource !== 'api') {
            throw new Error('Update operation requires API data source');
        }

        const response = await fetch(`${this.config.apiBaseUrl}/patterns/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        if (!response.ok) throw new Error('Failed to update pattern');

        this._invalidateCache();
        return response.json();
    }

    /**
     * Delete a pattern (requires API backend)
     * @param {string} id - Pattern ID
     * @returns {Promise<boolean>} Success status
     */
    async deletePattern(id) {
        if (this.config.dataSource !== 'api') {
            throw new Error('Delete operation requires API data source');
        }

        const response = await fetch(`${this.config.apiBaseUrl}/patterns/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete pattern');

        this._invalidateCache();
        return true;
    }

    // ==================== Private Methods ====================

    async _ensureInitialized() {
        if (!this._initialized) {
            await this.init();
        }
    }

    async _loadData() {
        let data;

        switch (this.config.dataSource) {
            case 'json':
                data = await this._loadFromJSON();
                break;
            case 'api':
                data = await this._loadFromAPI();
                break;
            case 'localstorage':
                data = await this._loadFromLocalStorage();
                break;
            case 'indexeddb':
                data = await this._loadFromIndexedDB();
                break;
            case 'memory':
                // Use globally defined patternsData (fallback for current setup)
                data = typeof patternsData !== 'undefined' ? patternsData : [];
                break;
            default:
                throw new Error(`Unknown data source: ${this.config.dataSource}`);
        }

        this._setCache(data);
        return data;
    }

    async _loadFromJSON() {
        try {
            const response = await fetch(this.config.jsonPath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            return data.patterns || data;
        } catch (error) {
            console.warn('Failed to load from JSON, falling back to memory:', error);
            // Fallback to in-memory data if JSON fetch fails
            return typeof patternsData !== 'undefined' ? patternsData : [];
        }
    }

    async _loadFromAPI() {
        const response = await fetch(`${this.config.apiBaseUrl}/patterns`);
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        return data.patterns || data;
    }

    async _loadFromLocalStorage() {
        const stored = localStorage.getItem('dsa_patterns_data');
        if (stored) {
            return JSON.parse(stored);
        }
        // If not in localStorage, load from JSON and cache
        const data = await this._loadFromJSON();
        localStorage.setItem('dsa_patterns_data', JSON.stringify(data));
        return data;
    }

    _loadFromIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('DSAPatternsDB', 1);

            request.onerror = () => reject(request.error);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('patterns')) {
                    db.createObjectStore('patterns', { keyPath: 'id' });
                }
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['patterns'], 'readonly');
                const store = transaction.objectStore('patterns');
                const getAllRequest = store.getAll();

                getAllRequest.onsuccess = () => {
                    if (getAllRequest.result.length > 0) {
                        resolve(getAllRequest.result);
                    } else {
                        // Seed from JSON
                        this._loadFromJSON().then((data) => {
                            this._seedIndexedDB(db, data).then(() => resolve(data));
                        });
                    }
                };
            };
        });
    }

    _seedIndexedDB(db, data) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['patterns'], 'readwrite');
            const store = transaction.objectStore('patterns');

            data.forEach(pattern => store.put(pattern));

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    _getFromCache() {
        if (!this.config.enableCache) return null;
        if (!this._cache) return null;

        const now = Date.now();
        if (this._cacheTimestamp && (now - this._cacheTimestamp) > this.config.cacheDuration) {
            this._invalidateCache();
            return null;
        }

        return this._cache;
    }

    _setCache(data) {
        if (this.config.enableCache) {
            this._cache = data;
            this._cacheTimestamp = Date.now();
        }
    }

    _invalidateCache() {
        this._cache = null;
        this._cacheTimestamp = null;
    }

    /**
     * Export data for backup or migration
     * @returns {Promise<Object>} Exportable data object
     */
    async exportData() {
        const patterns = await this.getAllPatterns();
        return {
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            totalPatterns: patterns.length,
            patterns
        };
    }

    /**
     * Import data from backup
     * @param {Object} data - Data to import
     */
    async importData(data) {
        if (this.config.dataSource === 'localstorage') {
            localStorage.setItem('dsa_patterns_data', JSON.stringify(data.patterns));
            this._invalidateCache();
        } else if (this.config.dataSource === 'api') {
            // Bulk import via API
            await fetch(`${this.config.apiBaseUrl}/patterns/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data.patterns)
            });
            this._invalidateCache();
        } else {
            throw new Error('Import not supported for this data source');
        }
    }
}

// Factory function for easy instantiation
function createPatternService(config) {
    return new PatternService(config);
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PatternService, createPatternService };
}

// Browser global
if (typeof window !== 'undefined') {
    window.PatternService = PatternService;
    window.createPatternService = createPatternService;
}
