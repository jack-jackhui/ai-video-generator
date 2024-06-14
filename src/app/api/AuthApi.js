import axios from 'axios';
//import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const authApi = axios.create({
    baseURL: API_URL,
    withCredentials: true,  // Necessary to send cookies over CORS
    headers: {
        'Content-Type': 'application/json'
        //'X-CSRFToken': Cookies.get('csrftoken')
    }
});

// Configure axios to include the token in all requests
authApi.interceptors.request.use(config => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
        config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Dynamically set CSRF token for each request
authApi.interceptors.request.use((config) => {
    const csrfToken = Cookies.get('csrftoken');
    //console.log("csrfToken: " + csrfToken);
    if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
}, (error) => Promise.reject(error));

// Use interceptor to handle errors globally
authApi.interceptors.response.use(response => response, async error => {
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

/*
const setRefreshTimer = (token) => {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const expTime = decoded.exp;
    // Refresh 30 seconds before the actual expiration to ensure the new token is ready
    const refreshTiming = (expTime - currentTime - 30) * 1000;  // 30 seconds before expiration
    if (refreshTiming > 0) {
        setTimeout(() => refreshAccessToken(), refreshTiming);
    } else {
        // If the calculated timing is already past, refresh immediately
        refreshAccessToken();
    }
};
const refreshAccessToken = async () => {
    try {
        console.log("Attempting to refresh access token...");
        // Retrieve the refresh token from session storage
        const refreshToken = sessionStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error("No refresh token found");
        }
        const response = await axios.post(`${API_URL}/api/dj-rest-auth/token/refresh/`, {
            refresh: refreshToken
        }, { withCredentials: true });
        const newToken = response.data.access;
        const newRefreshToken = response.data.refresh;  // Assuming the response includes a new refresh token

        console.log("Access token refreshed successfully.");
        sessionStorage.setItem('jwtToken', newToken);
        sessionStorage.setItem('refreshToken', newRefreshToken);  // Update the refresh token in storage
        authApi.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setRefreshTimer(newToken);
        console.log("Refresh timer reset with new token.");
    } catch (error) {
        console.error('Unable to refresh token', error);
        sessionStorage.removeItem('jwtToken');
        sessionStorage.removeItem('refreshToken');
    }
};

 */

const fetchCSRFToken = async () => {
    try {
        // Call the endpoint that refreshes/returns a CSRF token
        const response = await axios.get(`${API_URL}/api/csrf/`, { withCredentials: true });
        // Optionally set CSRF token in axios if needed immediately after fetching
        const csrfToken = response.data.csrfToken;
        Cookies.set('csrftoken', csrfToken);
    } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
    }
};

const initializeAuth = async () => {
    // Setting token on initial load only if in browser environment
    if (typeof window !== "undefined") {
        await fetchCSRFToken();
        /*
        const jwtToken = sessionStorage.getItem('jwtToken');
        if (jwtToken) {
            console.log("JWT token found, setting authorization header...");
            authApi.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
            setRefreshTimer(jwtToken);
            console.log("JWT token refresh timer set.");
        } else {
            console.log("No JWT token found in session storage.");
        }

         */
    } else {
        console.log("initializeAuth skipped: not running in a browser environment.");
    }
};


export { authApi, fetchCSRFToken, initializeAuth };
