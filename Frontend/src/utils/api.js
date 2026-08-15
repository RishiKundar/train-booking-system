const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Generate UUID for correlation tracking
const generateCorrelationId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'req-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
};

// Helper to construct request headers
const getHeaders = (customHeaders = {}) => {
    const token = localStorage.getItem('trainToken');
    return {
        'Content-Type': 'application/json',
        'X-Correlation-Id': generateCorrelationId(),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...customHeaders
    };
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Trigger safe client-side logout without reloading page
const triggerLogout = () => {
    localStorage.removeItem('trainToken');
    localStorage.removeItem('trainRefreshToken');
    window.dispatchEvent(new Event('auth:logout'));
};

// Refresh token logic
const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('trainRefreshToken');
    if (!refreshToken) {
        triggerLogout();
        throw new Error('No refresh token available');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Correlation-Id': generateCorrelationId()
            }
        });

        if (!response.ok) {
            triggerLogout();
            throw new Error('Session expired. Please log in again.');
        }

        const data = await response.json();
        if (data.accessToken) {
            localStorage.setItem('trainToken', data.accessToken);
            if (data.refreshToken) {
                localStorage.setItem('trainRefreshToken', data.refreshToken);
            }
            return data.accessToken;
        }
        triggerLogout();
        throw new Error('Token refresh returned empty response');
    } catch (err) {
        triggerLogout();
        throw err;
    }
};

// Core fetch wrapper with auto-retry on 401
const customFetch = async (endpoint, options = {}) => {
    let url = `${API_BASE_URL}${endpoint}`;
    
    // Append query params if present
    if (options.params) {
        const queryParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
                queryParams.append(key, val);
            }
        });
        const queryString = queryParams.toString();
        if (queryString) {
            url += (url.includes('?') ? '&' : '?') + queryString;
        }
    }

    const config = {
        ...options,
        headers: getHeaders(options.headers || {})
    };

    let response;
    try {
        response = await fetch(url, config);
    } catch (networkError) {
        throw new Error('Network error: Unable to connect to API Gateway. Is backend running on port 8080?');
    }

    // Handle 401 Unauthorized -> Attempt Token Refresh (except on auth endpoints)
    if (response.status === 401 && !endpoint.startsWith('/api/auth/')) {
        const refreshToken = localStorage.getItem('trainRefreshToken');
        if (!refreshToken) {
            triggerLogout();
            const error = new Error('Unauthorized');
            error.status = 401;
            throw error;
        }

        if (!isRefreshing) {
            isRefreshing = true;
            try {
                const newAccessToken = await refreshAccessToken();
                isRefreshing = false;
                processQueue(null, newAccessToken);
                // Retry current request with new token
                config.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return await fetch(url, config).then(res => handleResponse(res));
            } catch (refreshErr) {
                isRefreshing = false;
                processQueue(refreshErr, null);
                triggerLogout();
                throw refreshErr;
            }
        } else {
            // Queue subsequent requests while refresh is in flight
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(token => {
                config.headers['Authorization'] = `Bearer ${token}`;
                return fetch(url, config).then(res => handleResponse(res));
            });
        }
    }

    return handleResponse(response);
};

const handleResponse = async (response) => {
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
        try {
            data = await response.json();
        } catch {
            data = {};
        }
    } else {
        try {
            const text = await response.text();
            data = text ? { message: text } : {};
        } catch {
            data = {};
        }
    }

    if (!response.ok) {
        const errorMessage = data.message || data.error || `Request failed with status ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
};

export const api = {
    get: (endpoint, options = {}) => customFetch(endpoint, { method: 'GET', ...options }),
    post: (endpoint, body, options = {}) => customFetch(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),
    put: (endpoint, body, options = {}) => customFetch(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),
    delete: (endpoint, options = {}) => customFetch(endpoint, { method: 'DELETE', ...options }),
};
