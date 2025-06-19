    import axios from 'axios';
    import { logoutUser, getToken } from '../services/authService';

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

    const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    });


    api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        if (!config.headers) {
        config.headers = {};
        }
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
    }, (error) => {
    return Promise.reject(error);
    });

    api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 unauthenticated errors by redirecting to login
        if (error.response?.status === 401) {
        logoutUser(); // Clear token
        window.location.href = '/login'; // Redirect to login page
        }
        return Promise.reject(error);
    }
    );

    export default api;
