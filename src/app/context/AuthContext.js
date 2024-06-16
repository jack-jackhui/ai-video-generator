"use client";
import React, { createContext, useContext, useState, useEffect} from 'react';
import { useRouter } from 'next/navigation';
import { authApi, fetchCSRFToken } from "../api/AuthApi";
import toast, { Toaster } from 'react-hot-toast';
const AuthContext = createContext(null);

export function useAuth() {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const router = useRouter();

    /*
    useEffect(() => {
        // Initial token verification and setup
        const jwtToken = sessionStorage.getItem('jwtToken');
        if (jwtToken) {
            verifyAuthentication();
        }

        // Set up a periodic refresh of the access token
        const intervalId = setInterval(() => {
            if (sessionStorage.getItem('jwtToken')) {
                refreshAccessToken().catch((error) => {
                    console.error('Token refresh failed:', error);
                    setIsAuthenticated(false);
                    sessionStorage.removeItem('jwtToken');
                    router.push('/login');
                });
            }
        }, 4.5 * 60 * 1000);  // Refresh token every 4.5 minutes

        return () => clearInterval(intervalId);  // Clean up the interval on component unmount
    }, []);

     */
    const verifyAuthentication = async () => {
        if (isAuthenticated) {
            try {
                // Attempt to fetch a protected route or user info
                const response = await authApi.get('/api/dj-rest-auth/user/'); // This should be an endpoint that requires authentication
                if (response.status === 200) {
                    setIsAuthenticated(true);
                } else {
                    throw new Error("Fail to authenticate");
                }
            } catch (error) {
                console.error('Error verifying authentication:', error);
                setIsAuthenticated(false);
            }
        } else {
            console.log("Not authenticated.");
        }
    };

    useEffect(() => {
        // Initialize CSRF token
        fetchCSRFToken().then(() => {
            console.log("CSRF token initialized.");
        }).catch(error => {
            console.error("Failed to initialize CSRF token:", error);
        });
        // Check authentication status when component mounts
        verifyAuthentication();
    }, []);


    const loginUser = async (credentials) => {
        try {
            // Perform the login request using the user's credentials
            const response = await authApi.post('/api/dj-rest-auth/login/', credentials);

            if (response.status === 200) {
                // If login is successful, verify authentication to update UI
                const { key } = response.data;
                localStorage.setItem('authToken', key);  // You can use localStorage if you prefer
                authApi.defaults.headers.common['Authorization'] = `Token ${key}`;
                setIsAuthenticated(true);  // Directly update state based on login success
                toast.success("Login successful");
                router.push('/videoGen'); // Redirect to another route if needed
                //verifyAuthentication();
            } else {
                // If the server responds with an error (not 200 OK), handle it appropriately
                throw new Error("Login failed with status: " + response.status);
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error("Login failed. Please check your credentials.");
            setIsAuthenticated(true);  // Directly update state based on login success
        }
    };

    const logoutUser = async () => {
        try {
            await fetchCSRFToken();
            await authApi.post('/api/dj-rest-auth/logout/');
            localStorage.removeItem('authToken');
            authApi.defaults.headers.common['Authorization'] = null;
            setIsAuthenticated(false);
            toast.success("Logout successful!")
            router.push('/'); // Redirect to home page
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, loginUser, logoutUser, showLoginModal, setShowLoginModal }}>
            {children}
        </AuthContext.Provider>
    );
};
