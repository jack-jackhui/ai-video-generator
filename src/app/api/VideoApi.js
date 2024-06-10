import axios from 'axios';
//import {authApi} from "./AuthApi";
//import { refreshAccessToken } from './AuthApi';  // Import authApi to get the updated headers
const VIDEO_API_URL = process.env.NEXT_PUBLIC_VIDEO_GEN_API_URL;
//const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const videoApi = axios.create({
    baseURL: VIDEO_API_URL,
    withCredentials: true, // Send cookies when cross-domain requests
    headers: {
        'Content-Type': 'application/json'
    }
});

// Use interceptor to add the token to every request
videoApi.interceptors.request.use(config => {
    // Get the token from storage
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers['Authorization'] = `Token ${token}`;  // Adjust this according to the type of token you use (e.g., Bearer)
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Use interceptor to handle errors globally
videoApi.interceptors.response.use(response => response, async error => {
    // Handle unauthorized error (session expired or logged out)
    if (error.response.status === 401 && !error.config._retry) {
        error.config._retry = true;
        try {
            // You might want to redirect to a login page or show a login modal here
            console.error('Session expired, please log in again.');
            // Redirect or handle session expiration logic here
        } catch (refreshError) {
            console.error('Session refresh failed:', refreshError);
        }
    }
    return Promise.reject(error);
});
export default videoApi;
