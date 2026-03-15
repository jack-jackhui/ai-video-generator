import axios from 'axios';
import { tokenStorage } from '../../lib/auth/tokenStorage';

const VIDEO_API_URL = process.env.NEXT_PUBLIC_VIDEO_GEN_API_URL;

const videoApi = axios.create({
    baseURL: VIDEO_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Use interceptor to add the token to every request
videoApi.interceptors.request.use(config => {
    const token = tokenStorage.get();
    if (token) {
        config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Use interceptor to handle errors globally
videoApi.interceptors.response.use(response => response, async error => {
    if (error.response?.status === 401 && !error.config._retry) {
        error.config._retry = true;
    }
    return Promise.reject(error);
});

export default videoApi;
