import axios from 'axios';
import authApi from './AuthApi';  // Import authApi to get the updated headers
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

export default videoApi;
