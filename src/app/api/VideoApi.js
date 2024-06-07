import axios from 'axios';
import { refreshAccessToken } from './AuthApi';  // Import authApi to get the updated headers
const VIDEO_API_URL = process.env.NEXT_PUBLIC_VIDEO_GEN_API_URL;

const videoApi = axios.create({
    baseURL: VIDEO_API_URL,
    withCredentials: true, // Send cookies when cross-domain requests
    headers: {
        'Content-Type': 'application/json'
    }
});


// Axios Interceptor to add JWT token from session storage to each request
videoApi.interceptors.request.use(function(config) {
    // Retrieve JWT token from session storage
    const jwtToken = sessionStorage.getItem('jwtToken');
    if (jwtToken) {
        config.headers['Authorization'] = `Bearer ${jwtToken}`;
    }
    return config;
}, function(error) {
    // Handle any errors that occur during the setup of the request
    return Promise.reject(error);
});

videoApi.interceptors.response.use(async (response) => {
    return response;
}, async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;  // Mark the request as retried

        try {
            await refreshAccessToken();  // Attempt to refresh the token
            const newToken = sessionStorage.getItem('jwtToken');  // Get the new token
            if (newToken) {
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;  // Update the authorization header
                return videoApi(originalRequest);  // Retry the original request with the new token
            }
        } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Handle failed refresh here (e.g., redirect to login)
        }
    }
    return Promise.reject(error);  // Return the error if not a 401 or if it has been retried already
});
export default videoApi;
