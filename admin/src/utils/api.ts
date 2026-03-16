import axios, { AxiosInstance, AxiosError } from 'axios';

const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
});

/**
 * Request interceptor — automatically attaches the JWT as:
 *   Authorization: Bearer <token>
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

// Response Interceptor for Global Error Handling
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // Handle 401 Unauthorized (Session Expired / Invalid Token)
        if (error.response?.status === 401) {
            sessionStorage.removeItem('hostel_user');
            // Check if window object is available before redirecting
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                window.location.href = '/login?expired=true';
            }
        }

        // Standardize the error object returned to the catch block
        // Extract message from our new Backend ErrorResponse DTO
        const backendError = error.response?.data as any;
        const message = backendError?.message || backendError?.error || 'An unexpected error occurred.';

        // Attach the improved message to the error object
        (error as any).friendlyMessage = message;
        (error as any).validationErrors = backendError?.validationErrors;

        return Promise.reject(error);
    }
);

export default api;
