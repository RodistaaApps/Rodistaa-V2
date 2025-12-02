/**
 * API Client for Mobile Apps
 * Shared HTTP client with authentication
 */
import { config } from './config';
const API_BASE_URL = config.API_URL || 'http://localhost:4000/v1';
class ApiClient {
    constructor() {
        this.token = null;
        this.deviceId = null;
    }
    setAuthToken(token) {
        this.token = token;
    }
    setDeviceId(deviceId) {
        this.deviceId = deviceId;
    }
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        if (this.deviceId) {
            headers['x-device-id'] = this.deviceId;
        }
        const response = await fetch(url, {
            method: options.method || 'GET',
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({
                code: 'UNKNOWN_ERROR',
                message: 'Request failed',
            }));
            throw new Error(error.message || 'Request failed');
        }
        return response.json();
    }
    get(endpoint, params) {
        let url = endpoint;
        if (params) {
            const queryString = Object.keys(params)
                .filter((key) => params[key] !== undefined)
                .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                .join('&');
            if (queryString) {
                url += `?${queryString}`;
            }
        }
        return this.request(url, { method: 'GET' });
    }
    post(endpoint, body) {
        return this.request(endpoint, { method: 'POST', body });
    }
    put(endpoint, body) {
        return this.request(endpoint, { method: 'PUT', body });
    }
    patch(endpoint, body) {
        return this.request(endpoint, { method: 'PATCH', body });
    }
    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}
export const apiClient = new ApiClient();
