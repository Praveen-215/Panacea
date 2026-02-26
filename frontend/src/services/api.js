/**
 * Panacea — API Service
 * Centralized HTTP client for all backend communication
 */

const API_BASE = '/api';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('panacea_token');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('panacea_token', token);
        } else {
            localStorage.removeItem('panacea_token');
        }
    }

    getToken() {
        return this.token || localStorage.getItem('panacea_token');
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const headers = {
            ...options.headers,
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Don't set Content-Type for FormData (browser sets it with boundary)
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    this.setToken(null);
                    window.location.href = '/login';
                }
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                throw new Error('Network error. Please check your connection.');
            }
            throw error;
        }
    }

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    post(endpoint, body) {
        const options = { method: 'POST' };
        if (body instanceof FormData) {
            options.body = body;
        } else {
            options.body = JSON.stringify(body);
        }
        return this.request(endpoint, options);
    }

    put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Auth
    register(data) { return this.post('/auth/register', data); }
    login(data) { return this.post('/auth/login', data); }
    getMe() { return this.get('/auth/me'); }

    // Medications
    getMedications() { return this.get('/medications'); }
    getMedication(id) { return this.get(`/medications/${id}`); }
    createMedication(data) { return this.post('/medications', data); }
    updateMedication(id, data) { return this.put(`/medications/${id}`, data); }
    deleteMedication(id) { return this.delete(`/medications/${id}`); }
    takeDose(data) { return this.post('/medications/dose/take', data); }
    getTodaySchedule() { return this.get('/medications/schedule/today'); }

    // Documents
    getDocuments(category) {
        const query = category ? `?category=${category}` : '';
        return this.get(`/documents${query}`);
    }
    uploadDocument(formData) { return this.post('/documents/upload', formData); }
    renameDocument(id, name) { return this.put(`/documents/${id}`, { name }); }
    deleteDocument(id) { return this.delete(`/documents/${id}`); }
    getDocumentUrl(id) { return `${API_BASE}/documents/${id}/download`; }

    // User / Profile
    getProfile() { return this.get('/users/profile'); }
    updateProfile(data) { return this.put('/users/profile', data); }
    getEmergencyInfo() { return this.get('/users/emergency'); }
    updateEmergencyInfo(data) { return this.put('/users/emergency', data); }

    // Notifications
    getVapidKey() { return this.get('/notifications/vapid-key'); }
    subscribePush(subscription) { return this.post('/notifications/subscribe', { subscription }); }
    unsubscribePush() { return this.post('/notifications/unsubscribe'); }
}

const api = new ApiService();
export default api;
