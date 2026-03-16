import axios from 'axios';
import { tokenStorage } from '../../lib/auth/tokenStorage';

const FACE_SWAP_API_URL = process.env.NEXT_PUBLIC_FACE_SWAP_API_URL;

const faceSwapApi = axios.create({
    baseURL: FACE_SWAP_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

faceSwapApi.interceptors.request.use(config => {
    const token = tokenStorage.get();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

faceSwapApi.interceptors.response.use(response => response, async error => {
    if (error.response?.status === 401 && !error.config._retry) {
        error.config._retry = true;
    }
    return Promise.reject(error);
});

export const checkTaskStatus = async (taskId) => {
    const response = await faceSwapApi.get(`/task-status/${taskId}`);
    return response.data;
};

export const performSwap = async (file, targetKey, signal) => {
    const formData = new FormData();
    formData.append('source', file);

    const response = await faceSwapApi.post(`/swap-face/?target_key=${targetKey}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        signal
    });
    return response.data;
};

export const performPhotoSwap = async (sourceFile, targetFile, signal) => {
    const formData = new FormData();
    formData.append('source', sourceFile);
    formData.append('target', targetFile);

    const response = await faceSwapApi.post('/photo-swap-face/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        signal
    });
    return response.data;
};

export default faceSwapApi;
