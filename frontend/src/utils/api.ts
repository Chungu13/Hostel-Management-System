import axios, { AxiosInstance, AxiosError } from 'axios';

const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
});

api.interceptors.request.use((config) => {
    const userStr = sessionStorage.getItem('hostel_user');
    if (userStr) {
        const user = JSON.parse(userStr);
        if (user?.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
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
            // Redirect to login if not already there (optional, but good practice)
            if (!window.location.pathname.includes('/login')) {
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
