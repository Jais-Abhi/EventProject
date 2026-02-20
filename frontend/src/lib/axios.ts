import axios from 'axios';
import { toast } from 'sonner';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add Basic Auth header
api.interceptors.request.use(
    (config) => {
        const jsonStr = localStorage.getItem('auth_credentials');
        if (jsonStr) {
            try {
                const { username, password } = JSON.parse(jsonStr);
                if (username && password) {
                    const token = btoa(`${username}:${password}`);
                    config.headers.Authorization = `Basic ${token}`;

                    // Also set studentId header for endpoints that need it
                    // We assume usage of userId in localStorage as well
                    const userStr = localStorage.getItem('auth_user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        if (user.id) {
                            config.headers['studentId'] = user.id;
                        }
                    }
                }
            } catch (e) {
                console.error("Error parsing auth credentials", e);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401/403
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear storage and redirect (handled by AuthContext state ideally, but we can trigger event)
            // For now, we just rely on the UI to handle the logged out state
            // localStorage.removeItem('auth_credentials');
            // localStorage.removeItem('auth_user');
            // window.location.href = '/login'; // Force redirect? Use with caution in SPA
        }
        const data = error.response?.data;
        const message = (typeof data === 'string' ? data : data?.message) || 'Something went wrong';
        toast.error(`Error: ${message}`);
        return Promise.reject(error);

);
