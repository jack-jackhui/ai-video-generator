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
        const token = localStorage.getItem('authToken');
        if (!token) {
            setIsAuthenticated(false);
            return;
        }
        try {
            authApi.defaults.headers.common['Authorization'] = `Token ${token}`;
            const response = await authApi.get('/api/dj-rest-auth/user/');
            setIsAuthenticated(response.status === 200);
        } catch (error) {
            setIsAuthenticated(false);
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


    const loginUser = async (params) => {
        // If called with a token (Google/social login)
        if (params.key) {
            localStorage.setItem('authToken', params.key);
            authApi.defaults.headers.common['Authorization'] = `Token ${params.key}`;
            setIsAuthenticated(true);
            toast.success("Login successful");
            router.push('/videoGen');
            return;
        }
        // Classic login
        try {
            const response = await authApi.post('/api/dj-rest-auth/login/', params);
            if (response.status === 200) {
                const { key } = response.data;
                localStorage.setItem('authToken', key);
                authApi.defaults.headers.common['Authorization'] = `Token ${key}`;
                setIsAuthenticated(true);
                toast.success("Login successful");
                router.push('/videoGen');
            } else {
                throw new Error("Login failed with status: " + response.status);
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error("Login failed. Please check your credentials.");
            setIsAuthenticated(false);
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
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, loginUser, logoutUser, showLoginModal, setShowLoginModal, verifyAuthentication }}>
            {children}
        </AuthContext.Provider>
    );
};
