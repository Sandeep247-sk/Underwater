// API client module
import { getToken, removeToken, removeRole } from './auth.js';

const API_BASE = 'http://localhost:3001';

async function request(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });

        if (response.status === 401) {
            // Token expired or invalid
            removeToken();
            removeRole();
            window.location.href = '/index.html';
            return null;
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

export const api = {
    async login(username, password) {
        return request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },

    async getStations(filters = {}) {
        const params = new URLSearchParams();
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);
        if (filters.state) params.append('state', filters.state);
        if (filters.district) params.append('district', filters.district);
        if (filters.status) params.append('status', filters.status);
        return request(`/stations?${params.toString()}`);
    },

    async getStation(id) {
        return request(`/stations/${id}`);
    },

    async getTimeSeries(stationId, options = {}) {
        const params = new URLSearchParams();
        if (options.from) params.append('from', options.from);
        if (options.to) params.append('to', options.to);
        if (options.interval) params.append('interval', options.interval);
        if (options.page) params.append('page', options.page);
        if (options.limit) params.append('limit', options.limit);
        return request(`/stations/${stationId}/timeseries?${params.toString()}`);
    },

    async ingest(stationId, readings) {
        return request('/ingest', {
            method: 'POST',
            body: JSON.stringify({ stationId, readings })
        });
    },

    async getDashboardSummary() {
        return request('/dashboard/summary');
    }
};
