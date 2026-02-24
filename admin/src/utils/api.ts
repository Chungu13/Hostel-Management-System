import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
});

/**
 * Request interceptor — automatically attaches the JWT as:
 *   Authorization: Bearer <token>
 *
 * The token is read from localStorage so this works even after a page refresh,
 * before React state is initialized.
 */
api.interceptors.request.use((config) => {
    const raw = sessionStorage.getItem('hostel_user');
    if (raw) {
        try {
            const user = JSON.parse(raw);
            if (user?.token) {
                config.headers['Authorization'] = `Bearer ${user.token}`;
            }
        } catch {
            // Malformed stored data — ignore
        }
    }
    return config;
});

export default api;
