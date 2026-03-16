import axios from 'axios';
import Cookies from 'js-cookie';
import { tokenStorage } from '../../lib/auth/tokenStorage';
import { logger } from '../../lib/logger';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const authApi = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Request interceptor: Attach auth + CSRF token
authApi.interceptors.request.use(async config => {
    // Add DRF TokenAuthentication if available
    const token = tokenStorage.get();
    if (token) {
        config.headers['Authorization'] = `Token ${token}`;
    }
    
    // Always ensure CSRF token is set for unsafe methods
    const needsCSRF = ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase());
    if (needsCSRF) {
        let csrfToken = Cookies.get('csrftoken');
        if (!csrfToken) {
            csrfToken = await fetchCSRFToken();
        }
        if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken;
        }
    }
    return config;
}, error => Promise.reject(error));

// Response interceptor: Handle global errors
authApi.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401 && !error.config._retry) {
            error.config._retry = true;
            logger.debug('Unauthorized — session may have expired');
        }
        return Promise.reject(error);
    }
);

const fetchCSRFToken = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/csrf/`, { withCredentials: true });
        const csrfToken = response.data.csrfToken;
        Cookies.set('csrftoken', csrfToken);
        return csrfToken;
    } catch (error) {
        return null;
    }
};

export { authApi, fetchCSRFToken };
