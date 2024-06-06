import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const authApi = axios.create({
    baseURL: API_URL,
    withCredentials: true,  // Necessary to send cookies over CORS
    headers: {
        'Content-Type': 'application/json'
    }
});

// Setting CSRF Token for every request
authApi.interceptors.request.use(config => {
    const csrf_token = Cookies.get('csrftoken'); // Get CSRF token from cookies
    config.headers['X-CSRFToken'] = csrf_token; // Set CSRF token in headers
    return config;
});

// Use interceptor to handle errors globally
authApi.interceptors.response.use(response => response, error => {
    // Check for error handle specific cases
    if (error.response.status === 401) {
        // You can still handle 401 specifically if you think there might be cases where the token could expire
        console.error('Unauthorized, redirect to login');
        // Optionally redirect to login or show a modal
    } else {
        console.error('Error status:', error.response.status);
    }
    return Promise.reject(error);
});

const setRefreshTimer = (token) => {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const expTime = decoded.exp;
    const refreshTiming = (expTime - currentTime - 60) * 1000;
    setTimeout(() => refreshAccessToken(), refreshTiming);
};

const refreshAccessToken = async () => {
    try {
        const response = await axios.post(`${API_URL}/api/dj-rest-auth/token/refresh/`, {}, { withCredentials: true });
        const newToken = response.data.access_token;
        sessionStorage.setItem('jwtToken', newToken);
        authApi.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setRefreshTimer(newToken);
    } catch (error) {
        console.error('Unable to refresh token', error);
        sessionStorage.removeItem('jwtToken');
    }
};

const initializeAuth = () => {
    // Setting token on initial load only if in browser environment
    if (typeof window !== "undefined") {
        const jwtToken = sessionStorage.getItem('jwtToken');
        if (jwtToken) {
            authApi.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
            setRefreshTimer(jwtToken);
        }
    }
};

export { authApi, initializeAuth, refreshAccessToken };
