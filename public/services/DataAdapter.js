/* global patternsData */

/**
 * DataAdapter - Unified Data Access Layer
 *
 * This adapter provides a unified interface for accessing pattern data
 * regardless of the underlying data source. It follows the Repository pattern
 * and can be easily extended to support different backends.
 *
 * Current Implementation: In-memory (patternsData from patterns.js)
 * Future Options: REST API, GraphQL, Firebase, Supabase, MongoDB, PostgreSQL
 *
 * Migration Path:
 * 1. Current: Uses in-memory patternsData
 * 2. Next: Add API endpoints on your backend
 * 3. Switch: Change config.dataSource to 'api'
 * 4. Done: Same interface, different backend
 */

class DataAdapter {
    static instance = null;

    constructor() {
        if (DataAdapter.instance) {
            return DataAdapter.instance;
        }

        this.config = {
            dataSource: 'memory',  // 'memory', 'api', 'firebase', 'supabase'
            apiBaseUrl: '/api/v1',
            cacheEnabled: true,
            cacheTTL: 5 * 60 * 1000  // 5 minutes
        };

        this._cache = new Map();
        this._listeners = new Map();
        this._initialized = false;

        DataAdapter.instance = this;
    }

    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!DataAdapter.instance) {
            DataAdapter.instance = new DataAdapter();
        }
        return DataAdapter.instance;
    }

    /**
     * Configure the adapter
     * @param {Object} config - Configuration options
     */
    configure(config) {
        this.config = { ...this.config, ...config };
        this._cache.clear();
        return this;
    }

    /**
     * Initialize the adapter
     */
    init() {
        if (this._initialized) return Promise.resolve(this);

        // Validate data source is available
        if (this.config.dataSource === 'memory') {
            if (typeof patternsData === 'undefined') {
                return Promise.reject(new Error('patternsData not found. Ensure patterns.js is loaded.'));
            }
        }

        this._initialized = true;
        this._emit('initialized');
        return Promise.resolve(this);
    }

    // ==================== Pattern Operations ====================

    /**
     * Get all patterns
     */
    async getPatterns(options = {}) {
        const cacheKey = 'patterns:all';

        if (this.config.cacheEnabled && this._hasValidCache(cacheKey)) {
            return this._getCache(cacheKey);
        }

        let patterns;

        switch (this.config.dataSource) {
            case 'memory':
                patterns = this._getFromMemory();
                break;
            case 'api':
                patterns = await this._fetchFromAPI('/patterns', options);
                break;
            case 'firebase':
                patterns = await this._fetchFromFirebase('patterns', options);
                break;
            case 'supabase':
                patterns = await this._fetchFromSupabase('patterns', options);
                break;
            default:
                patterns = this._getFromMemory();
        }

        this._setCache(cacheKey, patterns);
        return patterns;
    }

    /**
     * Get pattern by ID
     */
    async getPatternById(id) {
        const cacheKey = `pattern:${id}`;

        if (this.config.cacheEnabled && this._hasValidCache(cacheKey)) {
            return this._getCache(cacheKey);
        }

        let pattern;

        switch (this.config.dataSource) {
            case 'memory':
                pattern = patternsData.find(p => p.id === id) || null;
                break;
            case 'api':
                pattern = await this._fetchFromAPI(`/patterns/${id}`);
                break;
            default:
                pattern = patternsData.find(p => p.id === id) || null;
        }

        if (pattern) {
            this._setCache(cacheKey, pattern);
        }

        return pattern;
    }

    /**
     * Search patterns
     */
    async searchPatterns(query, options = {}) {
        const patterns = await this.getPatterns();
        const lowerQuery = query.toLowerCase();

        return patterns.filter(p => {
            const searchableText = [
                p.category,
                p.description,
                ...p.keyInsights,
                ...p.commonProblems,
                ...(p.whenToUse || [])
            ].join(' ').toLowerCase();

            return searchableText.includes(lowerQuery);
        });
    }

    /**
     * Get patterns by difficulty
     */
    async getPatternsByDifficulty(difficulty) {
        const patterns = await this.getPatterns();
        return patterns.filter(p =>
            p.difficulty.toLowerCase().includes(difficulty.toLowerCase())
        );
    }

    /**
     * Get all categories
     */
    async getCategories() {
        const patterns = await this.getPatterns();
        return [...new Set(patterns.map(p => p.category))];
    }

    // ==================== Write Operations (for API mode) ====================

    /**
     * Create a pattern (API mode only)
     */
    async createPattern(data) {
        this._requireAPIMode('createPattern');

        const response = await fetch(`${this.config.apiBaseUrl}/patterns`, {
            method: 'POST',
            headers: this._getHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Failed to create pattern: ${response.statusText}`);
        }

        this._invalidateCache('patterns:all');
        this._emit('patternCreated', data);

        return response.json();
    }

    /**
     * Update a pattern (API mode only)
     */
    async updatePattern(id, data) {
        this._requireAPIMode('updatePattern');

        const response = await fetch(`${this.config.apiBaseUrl}/patterns/${id}`, {
            method: 'PUT',
            headers: this._getHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Failed to update pattern: ${response.statusText}`);
        }

        this._invalidateCache(`pattern:${id}`);
        this._invalidateCache('patterns:all');
        this._emit('patternUpdated', { id, data });

        return response.json();
    }

    /**
     * Delete a pattern (API mode only)
     */
    async deletePattern(id) {
        this._requireAPIMode('deletePattern');

        const response = await fetch(`${this.config.apiBaseUrl}/patterns/${id}`, {
            method: 'DELETE',
            headers: this._getHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to delete pattern: ${response.statusText}`);
        }

        this._invalidateCache(`pattern:${id}`);
        this._invalidateCache('patterns:all');
        this._emit('patternDeleted', { id });

        return true;
    }

    // ==================== Export/Import ====================

    /**
     * Export all data as JSON (for migration to database)
     */
    async exportToJSON() {
        const patterns = await this.getPatterns();

        return {
            metadata: {
                version: '1.0.0',
                exportedAt: new Date().toISOString(),
                totalPatterns: patterns.length,
                schema: 'dsa-patterns-v1'
            },
            patterns: patterns
        };
    }

    /**
     * Export as SQL INSERT statements
     */
    async exportToSQL(dialect = 'postgresql') {
        const patterns = await this.getPatterns();
        const statements = [];

        statements.push('-- DSA Patterns Data Export');
        statements.push(`-- Generated: ${new Date().toISOString()}`);
        statements.push('-- Dialect: ' + dialect);
        statements.push('');

        // Main patterns table
        statements.push('-- Patterns');
        for (const p of patterns) {
            const escaped = (s) => s ? s.replace(/'/g, "''") : '';
            statements.push(
                `INSERT INTO patterns (id, category, icon, difficulty, description, time_complexity, space_complexity) VALUES (` +
                `'${escaped(p.id)}', '${escaped(p.category)}', '${escaped(p.icon)}', '${escaped(p.difficulty)}', ` +
                `'${escaped(p.description)}', '${escaped(p.timeComplexity)}', '${escaped(p.spaceComplexity)}');`
            );
        }

        statements.push('');
        statements.push('-- When to Use');
        for (const p of patterns) {
            for (let i = 0; i < p.whenToUse.length; i++) {
                const escaped = (s) => s ? s.replace(/'/g, "''") : '';
                statements.push(
                    `INSERT INTO pattern_when_to_use (pattern_id, use_case, order_index) VALUES (` +
                    `'${escaped(p.id)}', '${escaped(p.whenToUse[i])}', ${i});`
                );
            }
        }

        statements.push('');
        statements.push('-- Key Insights');
        for (const p of patterns) {
            for (let i = 0; i < p.keyInsights.length; i++) {
                const escaped = (s) => s ? s.replace(/'/g, "''") : '';
                statements.push(
                    `INSERT INTO pattern_insights (pattern_id, insight, order_index) VALUES (` +
                    `'${escaped(p.id)}', '${escaped(p.keyInsights[i])}', ${i});`
                );
            }
        }

        return statements.join('\n');
    }

    /**
     * Export for MongoDB (BSON-compatible JSON)
     */
    async exportToMongoDB() {
        const patterns = await this.getPatterns();

        return patterns.map(p => ({
            ...p,
            _id: p.id,
            createdAt: new Date(),
            updatedAt: new Date()
        }));
    }

    /**
     * Download export as file
     */
    async downloadExport(format = 'json') {
        let content, filename, mimeType;

        switch (format) {
            case 'json':
                content = JSON.stringify(await this.exportToJSON(), null, 2);
                filename = 'patterns-export.json';
                mimeType = 'application/json';
                break;
            case 'sql':
                content = await this.exportToSQL();
                filename = 'patterns-export.sql';
                mimeType = 'text/plain';
                break;
            case 'mongodb':
                content = JSON.stringify(await this.exportToMongoDB(), null, 2);
                filename = 'patterns-mongodb.json';
                mimeType = 'application/json';
                break;
            default:
                throw new Error(`Unknown format: ${format}`);
        }

        // Browser download
        if (typeof window !== 'undefined') {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }

        return content;
    }

    // ==================== Event System ====================

    /**
     * Subscribe to events
     */
    on(event, callback) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, []);
        }
        this._listeners.get(event).push(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this._listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) callbacks.splice(index, 1);
        };
    }

    _emit(event, data) {
        const callbacks = this._listeners.get(event) || [];
        callbacks.forEach(cb => cb(data));
    }

    // ==================== Private Methods ====================

    _getFromMemory() {
        if (typeof patternsData === 'undefined') {
            console.warn('patternsData not found');
            return [];
        }
        return [...patternsData];
    }

    async _fetchFromAPI(endpoint, options = {}) {
        const baseUrl = this.config.apiBaseUrl.startsWith('http')
            ? this.config.apiBaseUrl
            : window.location.origin + this.config.apiBaseUrl;
        const url = new URL(endpoint, baseUrl);

        if (options.params) {
            Object.entries(options.params).forEach(([k, v]) =>
                url.searchParams.append(k, v)
            );
        }

        const response = await fetch(url.toString(), {
            headers: this._getHeaders()
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success !== undefined) {
            if (!result.success) {
                throw new Error(result.error?.message || 'API request failed');
            }
            const data = result.data;
            return data.patterns || data;
        }

        return result.patterns || result;
    }

    _fetchFromFirebase() {
        // Firebase implementation placeholder
        // Would use Firebase SDK here
        throw new Error('Firebase not configured. Set up Firebase SDK first.');
    }

    _fetchFromSupabase() {
        // Supabase implementation placeholder
        // Would use Supabase client here
        throw new Error('Supabase not configured. Set up Supabase client first.');
    }

    _getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        // Add auth token if available
        if (this.config.authToken) {
            headers.Authorization = `Bearer ${this.config.authToken}`;
        }

        return headers;
    }

    _requireAPIMode(operation) {
        if (this.config.dataSource === 'memory') {
            throw new Error(
                `${operation} requires API mode. ` +
                `Current mode is 'memory'. ` +
                `Configure with dataAdapter.configure({ dataSource: 'api', apiBaseUrl: '...' })`
            );
        }
    }

    // Cache methods
    _hasValidCache(key) {
        const cached = this._cache.get(key);
        if (!cached) return false;
        return Date.now() - cached.timestamp < this.config.cacheTTL;
    }

    _getCache(key) {
        const cached = this._cache.get(key);
        return cached ? cached.data : null;
    }

    _setCache(key, data) {
        this._cache.set(key, { data, timestamp: Date.now() });
    }

    _invalidateCache(key) {
        if (key) {
            this._cache.delete(key);
        } else {
            this._cache.clear();
        }
    }

    /**
     * Clear all caches
     */
    clearCache() {
        this._cache.clear();
        this._emit('cacheCleared');
    }
}

// Create and export singleton
const dataAdapter = DataAdapter.getInstance();

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataAdapter, dataAdapter };
}

if (typeof window !== 'undefined') {
    window.DataAdapter = DataAdapter;
    window.dataAdapter = dataAdapter;
}
