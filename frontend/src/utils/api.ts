import axios, { AxiosInstance } from 'axios';

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

export default api;
