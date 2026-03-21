import axios, { AxiosInstance, AxiosError } from 'axios';

const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    timeout: 60000 // 60 seconds to tolerate cold starts
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
        // Extract user-friendly 'message' from our new Backend ErrorResponse DTO
        const backendError = error.response?.data as any;
        
        // Start with the friendly backend message if it exists
        let message = backendError?.message;

        if (!message) {
            // Translate generic Axios network errors into human-readable strings
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                message = "The server is taking too long to respond. It might be waking up—please try again in a few seconds.";
            } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
                message = "Unable to connect to the server. Please check your internet connection.";
            } else if (error.response?.status === 502 || error.response?.status === 503) {
                message = "The service is temporarily unavailable. Please wait a moment and try again.";
            } else if (error.response?.status && error.response.status >= 500) {
                message = "We encountered an unexpected server issue. Please try again later.";
            } else {
                // Fallbacks
                const rawBackendMsg = typeof backendError === 'string' ? backendError : '';
                message = backendError?.error || rawBackendMsg || error.message || 'An unexpected application error occurred.';
            }
        }

        // Attach the improved message to the error object
        (error as any).friendlyMessage = message;
        (error as any).validationErrors = backendError?.validationErrors;

        return Promise.reject(error);
    }
);

export default api;
